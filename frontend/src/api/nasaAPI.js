import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5050';

const api = axios.create({
  baseURL: BASE_URL, 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---------------------------
// 🛡️ Error Handling Helper
// ---------------------------

const handleApiError = (error) => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        errorMessage = data?.error || 'Bad request - please check your parameters';
        break;
      case 401:
        errorMessage = 'Unauthorized - API key may be invalid';
        break;
      case 403:
        errorMessage = 'Forbidden - access denied';
        break;
      case 404:
        errorMessage = 'Not found - the requested resource does not exist';
        break;
      case 429:
        errorMessage = 'Too many requests - please try again later';
        break;
      case 500:
        errorMessage = 'Server error - please try again later';
        break;
      default:
        errorMessage = data?.error || `HTTP ${status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    errorMessage = 'Network error - please check your connection';
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'Request timeout - please try again';
  } else {
    errorMessage = error.message || 'An unexpected error occurred';
  }
  
  throw new Error(errorMessage);
};

// ---------------------------
// 🚀 NASA API Request Methods
// ---------------------------

export const fetchApod = async (params = {}) => {
  try {
    const defaultParams = {
      hd: true,
      ...params
    };
    
    const response = await api.get('/api/apod', { params: defaultParams });
    
    const data = response.data || response;
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from API');
    }
    
    if (!data.title || !data.date || !data.explanation || !data.url) {
      console.error('Missing fields in response:', {
        hasTitle: !!data.title,
        hasDate: !!data.date,
        hasExplanation: !!data.explanation,
        hasUrl: !!data.url,
        responseKeys: Object.keys(data)
      });
      throw new Error('Invalid data received from API - missing required fields');
    }
    
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchApodRange = async (startDate, endDate) => {
  try {
    return await api.get('/api/apod', { 
      params: { 
        start_date: startDate, 
        end_date: endDate,
        hd: true 
      } 
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchRandomApod = async (count = 1) => {
  try {
    return await api.get('/api/apod', { 
      params: { 
        count: count,
        hd: true 
      } 
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchRovers = async (setRovers, setError) => {
  try {
    console.log('🤖 Fetching rovers...');
    const response = await fetch(`${BASE_URL}/api/mars`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Rovers response:', data);
    
    if (data.success && data.data && data.data.rovers) {
      setRovers(data.data.rovers);
      console.log(`✅ Loaded ${data.data.rovers.length} rovers`);
    } else {
      throw new Error(data.error || 'Invalid rovers response');
    }
  } catch (err) {
    console.error('❌ Failed to fetch rovers:', err);
    setError(`Failed to fetch rovers: ${err.message}`);
    setRovers([
      { name: 'Curiosity', status: 'active' },
      { name: 'Perseverance', status: 'active' },
      { name: 'Opportunity', status: 'complete' },
      { name: 'Spirit', status: 'complete' }
    ]);
  }
};

export const fetchCameras = async (selectedRover, setCameras) => {
  try {
    console.log(`📷 Fetching cameras for ${selectedRover}...`);
    const response = await fetch(`${BASE_URL}/api/mars/${selectedRover}/cameras`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Cameras response:', data);
    
    if (data.success && data.data) {
      setCameras(data.data.cameras || []);
      console.log(`✅ Loaded ${data.data.cameras?.length || 0} cameras`);
    } else {
      throw new Error(data.error || 'Invalid cameras response');
    }
  } catch (err) {
    console.error('❌ Failed to fetch cameras:', err);
    setCameras([]);
  }
};

export const fetchPhotos = async (params, setPhotos, setLoading, setError, page) => {
  const { connectionStatus, selectedRover, sol, date, selectedCamera } = params;
  
  if (connectionStatus === 'disconnected') {
    console.log('⏸️ Skipping photo fetch - API disconnected');
    return;
  }

  setLoading(true);
  setError('');
  
  try {
    console.log(`📸 Fetching photos for ${selectedRover}...`);
    
    const urlParams = new URLSearchParams({
      page: page.toString(),
      per_page: '24',
      rover: selectedRover
    });

    if (sol && sol.trim()) {
      urlParams.append('sol', sol.trim());
      console.log('Using sol:', sol.trim());
    } else if (date) {
      urlParams.append('earth_date', date);
      console.log('Using earth_date:', date);
    }

    if (selectedCamera && selectedCamera.trim()) {
      urlParams.append('camera', selectedCamera.trim());
    }

    const url = `${BASE_URL}/api/mars/photos?${urlParams.toString()}`;
    console.log('🔗 Fetching from URL:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); 
    
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 Photos response:', data);
    
    if (data.success && data.data) {
      const newPhotos = data.data.photos || [];
      setPhotos(prev => page === 1 ? newPhotos : [...prev, ...newPhotos]);
      console.log(`✅ Loaded ${newPhotos.length} photos (page ${page})`);
      
      if (newPhotos.length === 0 && page === 1) {
        setError('No photos found for the selected filters. Try a different date, sol, or camera.');
      }
    } else {
      throw new Error(data.error || 'Invalid photos response format');
    }
  } catch (err) {
    console.error('❌ Failed to fetch photos:', err);
    let errorMessage = 'Failed to fetch photos: ';
    
    if (err.name === 'AbortError') {
      errorMessage += 'Request timed out. The NASA API might be slow.';
    } else if (err.message.includes('fetch')) {
      errorMessage += 'Cannot connect to backend server.';
    } else {
      errorMessage += err.message;
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

export const fetchNeoFeed = async (params = {}) => {
  try {
    return await api.get('/api/neo/feed', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchNeoLookup = async (id) => {
  if (!id) throw new Error('Asteroid ID is required');
  try {
    return await api.get(`/api/neo/lookup/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchNeoBrowse = async (params = {}) => {
  try {
    return await api.get('/api/neo/browse', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchNeoStats = async () => {
  try {
    return await api.get('/api/neo/stats');
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchNeoSentry = async (params = {}) => {
  try {
    return await api.get('/api/neo/sentry', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchNeoAnalyze = async (data) => {
  try {
    return await api.post('/api/neo/analyze', data);
  } catch (error) {
    handleApiError(error);
  }
};

// ================================
// 🌍 EPIC API Methods
// ================================

export const fetchEpicNatural = async (params = {}) => {
  try {
    return await api.get('/api/epic/natural', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEpicNaturalByDate = async (date, params = {}) => {
  if (!date) throw new Error('Date is required');
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }
  try {
    return await api.get(`/api/epic/natural/date/${date}`, { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEpicNaturalDates = async (params = {}) => {
  try {
    return await api.get('/api/epic/natural/available', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEpicEnhanced = async (params = {}) => {
  try {
    return await api.get('/api/epic/enhanced', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEpicEnhancedByDate = async (date, params = {}) => {
  if (!date) throw new Error('Date is required');
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }
  try {
    return await api.get(`/api/epic/enhanced/date/${date}`, { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEpicEnhancedDates = async (params = {}) => {
  try {
    return await api.get('/api/epic/enhanced/available', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const getEpicImageUrl = (image, type = 'natural', format = 'jpg') => {
  if (!image || !image.image || !image.date) {
    throw new Error('Invalid image object. Must contain "image" and "date" properties.');
  }

  const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';
  const date = image.date.split(' ')[0]; 
  const archiveDate = date.replace(/-/g, '/'); 
  
  return `https://api.nasa.gov/EPIC/archive/${type}/${archiveDate}/${format}/${image.image}.${format}?api_key=${NASA_API_KEY}`;
};

// ================================
// 🌎 Other NASA API Methods
// ================================

export const fetchDonki = async (eventType, params = {}) => {
  try {
    return await api.get(`/api/donki/${eventType}`, { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEarthImagery = async (params = {}) => {
  try {
    return await api.get('/api/earth/imagery', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEonetEvents = async (params = {}) => {
  try {
    return await api.get('/api/eonet/events', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEonetCategories = async () => {
  try {
    return await api.get('/api/eonet/categories');
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEonetSources = async () => {
  try {
    return await api.get('/api/eonet/sources');
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEonetEvent = async (id) => {
  if (!id) throw new Error('Event ID is required');
  try {
    return await api.get(`/api/eonet/events/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEonetEventsByCategory = async (categoryId, params = {}) => {
  if (!categoryId) throw new Error('Category ID is required');
  try {
    return await api.get(`/api/eonet/categories/${categoryId}/events`, { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchEonetStats = async (params = {}) => {
  try {
    return await api.get('/api/eonet/stats', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const checkEonetHealth = async () => {
  try {
    return await api.get('/api/eonet/health');
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchInsight = async (params = {}) => {
  try {
    return await api.get('/api/insight', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchExoplanet = async (params = {}) => {
  try {
    return await api.get('/api/exoplanet', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchTechTransfer = async (params = {}) => {
  try {
    return await api.get('/api/techtransfer', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchWmtsTile = async ({ body, layer, z, x, y, format = 'png' }) => {
  try {
    return await api.get(`/wmts/${body}/${layer}/${z}/${x}/${y}`, {
      responseType: 'blob',
      params: { format },
    });
  } catch (error) {
    handleApiError(error);
  }
};

// -------------------------------
// 📸 NASA IMAGE & VIDEO Functions
// -------------------------------

export const fetchTrendingTopics = async () => {
  const response = await fetch(`${BASE_URL}/api/images/trending/topics`);
  if (!response.ok) throw new Error('Failed to fetch trending topics');
  return response.json();
};

export const fetchPopularSearch = async () => {
  const response = await fetch(`${BASE_URL}/api/images/popular/search`);
  if (!response.ok) throw new Error('Failed to fetch popular searches');
  return response.json();
};

export const fetchFeaturedCollections = async () => {
  const response = await fetch(`${BASE_URL}/api/images/collections/featured`);
  if (!response.ok) throw new Error('Failed to fetch featured collections');
  return response.json();
};

export const fetchRealTimeTrending = async () => {
  const response = await fetch(`${BASE_URL}/api/images/trending/realtime`);
  if (!response.ok) throw new Error('Failed to fetch real-time trending');
  return response.json();
};

export const fetchSearchSuggestions = async (query) => {
  const response = await fetch(`${BASE_URL}/api/images/search/suggestions?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to fetch search suggestions');
  return response.json();
};

export const generateFallbackSuggestions = (query) => {
  const suggestions = [
    { title: 'Apollo missions', description: 'Historic moon landing missions' },
    { title: 'Mars rover images', description: 'Latest images from Mars exploration' },
    { title: 'Hubble telescope', description: 'Deep space images and discoveries' },
    { title: 'International Space Station', description: 'Life and work in space' },
    { title: 'Saturn rings', description: 'Beautiful images of Saturn and its rings' },
    { title: 'Earth from space', description: 'Our planet as seen from orbit' },
    { title: 'Solar system planets', description: 'Images of planets in our solar system' },
    { title: 'Nebula images', description: 'Colorful cosmic clouds and formations' },
    { title: 'Galaxy images', description: 'Distant galaxies and star formations' },
    { title: 'Spacewalk activities', description: 'Astronauts working outside spacecraft' }
  ];

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(query.toLowerCase())
  );

  return filteredSuggestions.length > 0 ? filteredSuggestions : suggestions.slice(0, 5);
};

export const fetchAssetManifest = async (nasaId) => {
  if (!nasaId) throw new Error('NASA ID is required');
  try {
    const response = await api.get(`/api/images/asset/${nasaId}`);
    return {
      data: response.data || response
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchMetadata = async (nasaId) => {
  if (!nasaId) throw new Error('NASA ID is required');
  try {
    const response = await api.get(`/api/images/metadata/${nasaId}`);
    return {
      data: response.data || response
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchMediaLibrary = async (params = {}) => {
  try {
    const response = await api.get('/api/images/search', { params });
    return {
      data: response.data || response
    };
  } catch (error) {
    handleApiError(error);
  }
};

// ---------------------------
// 💻 NASA techTransfer Functions
// ---------------------------

export const fetchTechTransferPatents = async (searchQuery = '') => {
  try {
    const url = `${BASE_URL}/api/techtransfer/patents${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
    console.log('🔍 Fetching patents:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching patents:', error);
    throw error;
  }
};

export const fetchTechTransferPatentsByIssued = async (searchQuery = '') => {
  try {
    const url = `${BASE_URL}/api/techtransfer/patents/issued${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
    console.log('🔍 Fetching patents by issued date:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching patents by issued date:', error);
    throw error;
  }
};

export const fetchTechTransferSoftware = async (searchQuery = '') => {
  try {
    const url = `${BASE_URL}/api/techtransfer/software${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
    console.log('🔍 Fetching software:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching software:', error);
    throw error;
  }
};

export const fetchTechTransferSpinoffs = async (searchQuery = '') => {
  try {
    const url = `${BASE_URL}/api/techtransfer/spinoffs${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
    console.log('🔍 Fetching spinoffs:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching spinoffs:', error);
    throw error;
  }
};

export const searchTechTransfer = async (searchQuery, category = 'patents') => {
  try {
    const url = `${BASE_URL}/api/techtransfer/search?search=${encodeURIComponent(searchQuery)}&category=${category}`;
    console.log('🔍 Searching tech transfer:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error searching tech transfer:', error);
    throw error;
  }
};

// ---------------------------
// 🧑‍🚀 NASA TLE Functions
// ---------------------------

const TLE_BASE_URL = 'https://tle.ivanstanojevic.me/api/tle';

const handleApiResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('❌ Expected JSON but got:', text.substring(0, 200));
    throw new Error('Server returned HTML instead of JSON. Check API endpoint.');
  }
  
  return response.json();
};

export const fetchTle = async (params = {}) => {
  try {
    const { page = 1, page_size = 50 } = params;
    console.log('🛰️ Fetching TLE data with params:', params);
    
    const url = `${TLE_BASE_URL}?page=${page}&pageSize=${page_size}`;
    console.log('📡 API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TLE-Visualizer/1.0'
      }
    });
    
    const data = await handleApiResponse(response);
    if (Array.isArray(data)) {
      return { data };
    } else if (data.member) {
      return { 
        data: data.member,
        totalCount: data.totalItems || data.member.length
      };
    }
    
    return { data: data ? [data] : [] };
    
  } catch (error) {
    console.error('❌ TLE API Error:', error);
    throw new Error(`Failed to fetch TLE data: ${error.message}`);
  }
};

export const fetchTleBySearch = async (searchTerm) => {
  try {
    console.log('🔍 Searching TLE data for:', searchTerm);
    
    const url = `${TLE_BASE_URL}?search=${encodeURIComponent(searchTerm)}`;
    console.log('📡 Search URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TLE-Visualizer/1.0'
      }
    });
    
    const data = await handleApiResponse(response);
    console.log('✅ Search results:', data);
    
    return Array.isArray(data) ? data : (data.member || []);
    
  } catch (error) {
    console.error('❌ TLE Search Error:', error);
    throw new Error(`Failed to search TLE data: ${error.message}`);
  }
};

export const fetchTleByCategory = async (category) => {
  try {
    console.log('📂 Fetching all TLE data to filter category:', category);

    const { data } = await fetchTle(); 

    const filtered = (data || []).filter(satellite => {
      const catMap = {
        'stations': ['ISS', 'Tiangong', 'Mir'],
        'visual': ['Hubble', 'Envisat'],
        'active-geosynchronous': ['GOES', 'INSAT'],
        'weather': ['NOAA', 'GOES'],
        'noaa': ['NOAA'],
        'goes': ['GOES'],
        'resource': ['LANDSAT', 'Sentinel'],
        'cubesat': ['CubeSat'],
        'other': []
      };

      const keywords = catMap[category] || [];
      return keywords.some(keyword => satellite.name?.toLowerCase().includes(keyword.toLowerCase()));
    });

    console.log('✅ Filtered category data:', filtered);
    return filtered;

  } catch (error) {
    console.error('❌ TLE Category Error:', error);
    throw new Error(`Failed to fetch category data: ${error.message}`);
  }
};

export const fetchTleBySatelliteId = async (satelliteId) => {
  try {
    console.log('🛰️ Fetching satellite by ID:', satelliteId);
    
    const url = `${TLE_BASE_URL}/${satelliteId}`;
    console.log('📡 Satellite URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TLE-Visualizer/1.0'
      }
    });
    
    const data = await handleApiResponse(response);
    console.log('✅ Satellite data fetched:', data);
    
    return data;
    
  } catch (error) {
    console.error('❌ TLE Satellite Error:', error);
    throw new Error(`Failed to fetch satellite data: ${error.message}`);
  }
};

export const fetchTleBySatelliteIds = async (satelliteIds) => {
  try {
    console.log('🛰️ Fetching TLE data for satellite IDs:', satelliteIds);
    const idsString = Array.isArray(satelliteIds) ? satelliteIds.join(',') : satelliteIds;
    const response = await fetch(`/api/tle/satellites/${idsString}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ TLE satellites data fetched successfully');
    return { data };
  } catch (error) {
    console.error('❌ TLE Satellites API Error:', error);
    throw new Error(`Failed to fetch satellites data: ${error.message}`);
  }
};

export const fetchTleByPage = async (page, pageSize = 50) => {
  try {
    console.log('📄 Fetching TLE data for page:', page, 'size:', pageSize);
    const response = await fetch(`/api/tle/page/${page}?page_size=${pageSize}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ TLE paginated data fetched successfully');
    return { data };
  } catch (error) {
    console.error('❌ TLE Pagination API Error:', error);
    throw new Error(`Failed to fetch paginated satellites: ${error.message}`);
  }
};

export const fetchTleFormat = async (satelliteId) => {
  try {
    console.log('📡 Fetching TLE format for satellite ID:', satelliteId);
    const response = await fetch(`/api/tle/format/${satelliteId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.text(); 
    console.log('✅ TLE format data fetched successfully');
    return { data };
  } catch (error) {
    console.error('❌ TLE Format API Error:', error);
    throw new Error(`Failed to fetch TLE format: ${error.message}`);
  }
};

export const fetchTleStats = async () => {
  try {
    console.log('📊 Fetching TLE statistics');
    const response = await fetch('/api/tle/stats');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ TLE statistics fetched successfully');
    return { data };
  } catch (error) {
    console.error('❌ TLE Stats API Error:', error);
    throw new Error(`Failed to fetch TLE statistics: ${error.message}`);
  }
};

export const testTleApi = async () => {
  try {
    console.log('🧪 Testing TLE API connection...');
    const response = await fetch(`${TLE_BASE_URL}/25544`, { 
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TLE-Visualizer/1.0'
      }
    });
    
    const data = await handleApiResponse(response);
    console.log('✅ API Test successful:', data);
    return true;
  } catch (error) {
    console.error('❌ API Test failed:', error);
    return false;
  }
};

export const parseTleData = (tleString) => {
  try {
    const lines = tleString.trim().split('\n');
    if (lines.length < 3) {
      throw new Error('Invalid TLE format - requires 3 lines');
    }
    
    return {
      name: lines[0].trim(),
      line1: lines[1].trim(),
      line2: lines[2].trim(),
      parsed: {
        satelliteNumber: parseInt(lines[1].substring(2, 7)),
        classification: lines[1].substring(7, 8),
        intlDesignator: lines[1].substring(9, 17).trim(),
        epochYear: parseInt(lines[1].substring(18, 20)),
        epochDay: parseFloat(lines[1].substring(20, 32)),
        firstDerivative: parseFloat(lines[1].substring(33, 43)),
        secondDerivative: parseFloat(lines[1].substring(44, 52)),
        bstarDrag: parseFloat(lines[1].substring(53, 61)),
        ephemerisType: parseInt(lines[1].substring(62, 63)),
        elementNumber: parseInt(lines[1].substring(64, 68)),
        inclination: parseFloat(lines[2].substring(8, 16)),
        raan: parseFloat(lines[2].substring(17, 25)),
        eccentricity: parseFloat('0.' + lines[2].substring(26, 33)),
        argOfPerigee: parseFloat(lines[2].substring(34, 42)),
        meanAnomaly: parseFloat(lines[2].substring(43, 51)),
        meanMotion: parseFloat(lines[2].substring(52, 63)),
        revolutionNumber: parseInt(lines[2].substring(63, 68))
      }
    };
  } catch (error) {
    console.error('❌ TLE Parse Error:', error);
    throw new Error(`Failed to parse TLE data: ${error.message}`);
  }
};

export const calculateOrbitalPeriod = (meanMotion) => {
  return meanMotion > 0 ? 1440 / meanMotion : 0; 
};

export const calculateApproximateAltitude = (meanMotion) => {
  const earthRadius = 6371;
  const mu = 398600.4418; 
  
  if (meanMotion <= 0) return 0;
  
  const period = 1440 / meanMotion * 60; 
  const semiMajorAxis = Math.pow((mu * period * period) / (4 * Math.PI * Math.PI), 1/3);
  const altitude = semiMajorAxis - earthRadius;
  
  return Math.max(0, altitude);
};

export const classifySatellite = (inclination, altitude, eccentricity) => {
  if (altitude > 35000 && eccentricity < 0.1) {
    return 'Geostationary/Geosynchronous';
  } else if (altitude > 20000) {
    return 'High Earth Orbit (HEO)';
  } else if (altitude > 2000) {
    return 'Medium Earth Orbit (MEO)';
  } else if (altitude > 160) {
    return 'Low Earth Orbit (LEO)';
  } else {
    return 'Very Low Earth Orbit';
  }
};

// ---------------------------
// 🛡️ NASA OSDR Functions
// ---------------------------

export const fetchStudyFiles = async (studyIds, options = {}) => {
  const { page = 0, size = 25, all_files = false } = options;
  try {
    return await api.get(`/api/osdr/study-files/${studyIds}`, {
      params: {
        page: page.toString(),
        size: size.toString(),
        all_files: all_files.toString()
      }
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchStudyFilesByDateRange = async (studyIds, startDate, endDate, options = {}) => {
  const { page = 0, size = 25 } = options;
  try {
    return await api.get(`/api/osdr/study-files/${studyIds}/date/${startDate}/${endDate}`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchStudyMetadata = async (studyId) => {
  try {
    return await api.get(`/api/osdr/study-metadata/${studyId}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const searchStudies = async (searchParams = {}) => {
  const {
    term = '',
    from = 0,
    size = 10,
    type = 'cgene',
    sort = '',
    order = 'ASC',
    ffield = '',
    fvalue = ''
  } = searchParams;

  try {
    return await api.get('/api/osdr/search', {
      params: {
        term,
        from: from.toString(),
        size: size.toString(),
        type,
        sort,
        order,
        ffield,
        fvalue
      }
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const advancedSearchStudies = async (searchData) => {
  try {
    return await api.post('/api/osdr/search/advanced', searchData);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchExperiments = async (options = {}) => {
  try {
    return await api.get('/api/osdr/experiments', { params: options });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchExperimentById = async (experimentId) => {
  try {
    return await api.get(`/api/osdr/experiments/${experimentId}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchMissions = async (options = {}) => {
  try {
    return await api.get('/api/osdr/missions', { params: options });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchMissionById = async (missionId) => {
  try {
    return await api.get(`/api/osdr/missions/${missionId}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchPayloads = async (options = {}) => {
  try {
    return await api.get('/api/osdr/payloads', { params: options });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchPayloadById = async (payloadId) => {
  try {
    return await api.get(`/api/osdr/payloads/${payloadId}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchHardware = async (options = {}) => {
  try {
    return await api.get('/api/osdr/hardware', { params: options });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchHardwareById = async (hardwareId) => {
  try {
    return await api.get(`/api/osdr/hardware/${hardwareId}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchVehicles = async (options = {}) => {
  try {
    return await api.get('/api/osdr/vehicles', { params: options });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchVehicleById = async (vehicleId) => {
  try {
    return await api.get(`/api/osdr/vehicles/${vehicleId}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchSubjects = async (options = {}) => {
  try {
    return await api.get('/api/osdr/subjects', { params: options });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchSubjectById = async (subjectId) => {
  try {
    return await api.get(`/api/osdr/subjects/${subjectId}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchBiospecimens = async (options = {}) => {
  try {
    return await api.get('/api/osdr/biospecimens', { params: options });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchBiospecimenById = async (biospecimenId) => {
  try {
    return await api.get(`/api/osdr/biospecimens/${biospecimenId}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchAnalytics = async () => {
  try {
    return await api.get('/api/osdr/analytics');
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchAvailableDates = async () => {
  try {
    return await api.get('/api/osdr/available-dates');
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchStudyTypes = async () => {
  try {
    return await api.get('/api/osdr/study-types');
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchOrganisms = async () => {
  try {
    return await api.get('/api/osdr/organisms');
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchPlatforms = async () => {
  try {
    return await api.get('/api/osdr/platforms');
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchHealthStatus = async () => {
  try {
    return await api.get('/api/osdr/health');
  } catch (error) {
    handleApiError(error);
  }
};

export const buildSearchQuery = (filters) => {
  const query = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      query[key] = value.trim();
    }
  });
  
  return query;
};

export const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return dateString;
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const downloadFile = (url, filename) => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download file');
  }
};

export const DATA_TYPES = [
  { value: 'cgene', label: 'NASA OSDR', description: 'NASA Open Science Data Repository' },
  { value: 'nih_geo_gse', label: 'NIH GEO', description: 'Gene Expression Omnibus' },
  { value: 'ebi_pride', label: 'EBI PRIDE', description: 'Proteomics Identifications Database' },
  { value: 'mg_rast', label: 'MG-RAST', description: 'Metagenomics Analysis Server' }
];

export const STUDY_TYPES = [
  'Spaceflight Study',
  'Ground Study',
  'Transcriptomics',
  'Proteomics',
  'Metabolomics',
  'Epigenomics',
  'Microbiome',
  'Cell Biology',
  'Molecular Biology'
];

export const PLATFORMS = [
  'RNA Sequencing',
  'Microarray',
  'Mass Spectrometry',
  'Illumina HiSeq',
  'Illumina MiSeq',
  'Affymetrix',
  'Agilent',
  'Applied Biosystems'
];

export const ORGANISMS = [
  'Mus musculus',
  'Homo sapiens',
  'Rattus norvegicus',
  'Arabidopsis thaliana',
  'Saccharomyces cerevisiae',
  'Escherichia coli',
  'Drosophila melanogaster',
  'Caenorhabditis elegans'
];

// ---------------------------
// 🔧 Utility Functions
// ---------------------------

export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getApiVersion = async () => {
  try {
    return await api.get('/version');
  } catch (error) {
    handleApiError(error);
  }
};

export {api};

export default {
  fetchApod,
  fetchApodRange,
  fetchRandomApod,
  fetchRovers,
  fetchCameras,
  fetchPhotos,
  fetchNeoFeed,
  fetchNeoLookup,
  fetchNeoBrowse,
  fetchNeoStats,
  fetchNeoSentry,
  fetchNeoAnalyze,
  fetchEpicNatural,
  fetchEpicNaturalByDate,
  fetchEpicNaturalDates,
  fetchEpicEnhanced,
  fetchEpicEnhancedByDate,
  fetchEpicEnhancedDates,
  getEpicImageUrl,
  fetchDonki,
  fetchEarthImagery,
  fetchEonetEvents,
  fetchEonetCategories,
  fetchEonetSources,
  fetchEonetEvent,
  fetchEonetEventsByCategory,
  fetchEonetStats,
  checkEonetHealth,
  fetchInsight,
  fetchExoplanet,
  fetchMediaLibrary,
  fetchTechTransfer,
  fetchTle,
  fetchWmtsTile,
  fetchTrendingTopics,
  fetchPopularSearch,
  fetchFeaturedCollections,
  fetchStudyFiles,
  fetchStudyFilesByDateRange,
  fetchStudyMetadata,
  searchStudies,
  advancedSearchStudies,
  fetchExperiments,
  fetchExperimentById,
  fetchMissions,
  fetchMissionById,
  fetchPayloads,
  fetchPayloadById,
  fetchHardware,
  fetchHardwareById,
  fetchVehicles,
  fetchVehicleById,
  fetchSubjects,
  fetchSubjectById,
  fetchBiospecimens,
  fetchBiospecimenById,
  fetchAnalytics,
  fetchAvailableDates,
  fetchStudyTypes,
  fetchOrganisms,
  fetchPlatforms,
  fetchHealthStatus,
  buildSearchQuery,
  formatDate,
  formatDateTime,
  formatFileSize,
  downloadFile,
  checkApiHealth,
  getApiVersion,
  DATA_TYPES,
  STUDY_TYPES,
  PLATFORMS,
  ORGANISMS
};