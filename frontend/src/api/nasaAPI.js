import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://nasaapi-comic-vista-backend.onrender.com';

const api = axios.create({
  baseURL: BASE_URL, 
  timeout: 30000,
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
    const response = await fetch(`${BASE_URL}/api/mars`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.rovers) {
      setRovers(data.data.rovers);
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
    const response = await fetch(`${BASE_URL}/api/mars/${selectedRover}/cameras`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      setCameras(data.data.cameras || []);
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
    return;
  }

  setLoading(true);
  setError('');
  
  try {
    const urlParams = new URLSearchParams({
      page: page.toString(),
      per_page: '24',
      rover: selectedRover
    });

    if (sol && sol.trim()) {
      urlParams.append('sol', sol.trim());
    } else if (date) {
      urlParams.append('earth_date', date);
    }

    if (selectedCamera && selectedCamera.trim()) {
      urlParams.append('camera', selectedCamera.trim());
    }

    const url = `${BASE_URL}/api/mars/photos?${urlParams.toString()}`;
    
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
    
    if (data.success && data.data) {
      const newPhotos = data.data.photos || [];
      setPhotos(prev => page === 1 ? newPhotos : [...prev, ...newPhotos]);
      
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
    throw error; 
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
// 🧑‍🚀 NASA TLE API Configuration
// ---------------------------

const TLE_CONFIG = {
  TLE_BASE_URL: 'https://tle.ivanstanojevic.me/api/tle',
  STATS_URL: 'https://tle.ivanstanojevic.me/api/tle/stats',
  CELESTRAK_URL: 'https://celestrak.org/NORAD/elements/gp.php',
  TIMEOUT: 30000,
  GET_HEADERS: {
    'Accept': 'application/json',
  },
  CELESTRAK_GROUPS: {
    'stations': 'stations',
    'visual': 'visual',
    'active-geosynchronous': 'geo',
    'weather': 'weather',
    'noaa': 'noaa',
    'goes': 'goes',
    'resource': 'resource',
    'cubesat': 'cubesat',
    'analyst': 'analyst'
  }
};

// ---------------------------
// 🛠️ Core Utility Functions
// ---------------------------

const handleApiResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    console.error('❌ Expected JSON but got:', text.substring(0, 200));
    throw new Error(`Expected JSON but received: ${contentType}. API might be down.`);
  }
  
  return response.json();
};

const safeFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`⚠️ Request to ${url} is being aborted after timeout of ${TLE_CONFIG.TIMEOUT}ms`);
    controller.abort();
  }, TLE_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: TLE_CONFIG.GET_HEADERS,
      signal: controller.signal,
      ...options
    });

    clearTimeout(timeoutId);
    return await handleApiResponse(response);

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`🛑 Timeout reached for: ${url}`);
    }
    console.error(`❌ Fetch error for ${url}:`, error.message);
    throw error;
  }
};


const fetchFromCelesTrak = async (group = 'stations', page = 1, pageSize = 50) => {
  try {
    const url = `/api/tle/celestrak/${group}`;
    const data = await safeFetch(url);
    
    if (!Array.isArray(data)) {
      throw new Error(`Expected CelesTrak data to be an array, but got: ${typeof data}`);
    }

    const transformedData = data.map(sat => ({
      satelliteId: sat.NORAD_CAT_ID,
      name: sat.OBJECT_NAME,
      line1: sat.TLE_LINE1,
      line2: sat.TLE_LINE2,
      date: sat.EPOCH,
      meanMotion: parseFloat(sat.MEAN_MOTION),
      inclination: parseFloat(sat.INCLINATION),
      eccentricity: parseFloat(sat.ECCENTRICITY),
      argOfPerigee: parseFloat(sat.ARG_OF_PERICENTER),
      raan: parseFloat(sat.RA_OF_ASC_NODE),
      meanAnomaly: parseFloat(sat.MEAN_ANOMALY)
    }));
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = transformedData.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      totalCount: data.length,
      currentPage: page,
      pageSize: pageSize,
      source: 'celestrak'
    };
    
  } catch (error) {
    console.error('❌ CelesTrak fallback failed:', error);
    throw new Error(`CelesTrak fallback failed: ${error.message}`);
  }
};

const matchesCategory = (satellite, category) => {
  const name = (satellite.name || '').toLowerCase();
  const categoryMatches = {
    'stations': ['iss', 'tiangong', 'station'],
    'visual': ['hubble', 'envisat', 'cosmos'],
    'weather': ['noaa', 'goes', 'meteo'],
    'noaa': ['noaa'],
    'goes': ['goes'],
    'resource': ['landsat', 'sentinel', 'terra'],
    'cubesat': ['cubesat', 'cube', 'smallsat'],
    'active-geosynchronous': ['goes', 'insat', 'eutelsat'],
    'analyst': ['cosmos', 'molniya']
  };
  
  const keywords = categoryMatches[category] || [];
  return keywords.some(keyword => name.includes(keyword));
};

// ---------------------------
// 🧑‍🚀 Main TLE API Functions
// ---------------------------

export const fetchTle = async (params = {}) => {
  try {
    const { page = 1, pageSize = 50, ...otherParams } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      'page-size': pageSize.toString(),
      ...otherParams
    });
    
    const url = `${TLE_CONFIG.TLE_BASE_URL}?${queryParams}`;
    const data = await safeFetch(url);
    
    if (data.member) {
      return {
        data: data.member,
        totalCount: data.totalItems || data['@total-items'] || data.member.length,
        currentPage: page,
        pageSize: pageSize,
        source: 'primary'
      };
    } else if (Array.isArray(data)) {
      return {
        data: data,
        totalCount: data.length,
        currentPage: page,
        pageSize: pageSize,
        source: 'primary'
      };
    } else {
      return {
        data: [data],
        totalCount: 1,
        currentPage: page,
        pageSize: pageSize,
        source: 'primary'
      };
    }
    
  } catch (error) {
    return await fetchFromCelesTrak('stations', params.page || 1, params.pageSize || 50);
  }
};

export const fetchTleBySearch = async (searchTerm, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      search: searchTerm,
      ...params
    });
    
    const url = `${TLE_CONFIG.TLE_BASE_URL}?${queryParams}`;
    const data = await safeFetch(url);
    
    return Array.isArray(data) ? data : (data.member || []);
    
  } catch (error) {
    try {
      const fallbackData = await fetchFromCelesTrak('stations');
      const filtered = fallbackData.data.filter(sat => 
        sat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return filtered;
    } catch (fallbackError) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
};

export const fetchTleByCategory = async (category, params = {}) => {
  try {
    const { data } = await fetchTle(params);
    
    const filtered = (data || []).filter(satellite => matchesCategory(satellite, category));
    return filtered;
    
  } catch (error) {
    const celestrakGroup = TLE_CONFIG.CELESTRAK_GROUPS[category] || 'stations';
    try {
      const fallbackData = await fetchFromCelesTrak(celestrakGroup);
      return fallbackData.data;
    } catch (fallbackError) {
      throw new Error(`Category fetch failed: ${error.message}`);
    }
  }
};

export const fetchTleBySatelliteId = async (satelliteId) => {
  try {
    const url = `${TLE_CONFIG.TLE_BASE_URL}/${satelliteId}`;
    const data = await safeFetch(url);
    return data;
    
  } catch (error) {
    try {
      const fallbackData = await fetchFromCelesTrak('stations');
      const satellite = fallbackData.data.find(sat => 
        sat.satelliteId.toString() === satelliteId.toString()
      );
      
      if (satellite) {
        return satellite;
      } else {
        throw new Error(`Satellite ${satelliteId} not found in fallback data`);
      }
    } catch (fallbackError) {
      throw new Error(`Failed to fetch satellite ${satelliteId}: ${error.message}`);
    }
  }
};

export const fetchTleByPage = async (page, pageSize = 50) => {
  try {
    const result = await fetchTle({ page, pageSize });
    return result;
    
  } catch (error) {
    console.error('❌ TLE Pagination API Error:', error);
    throw new Error(`Failed to fetch paginated satellites: ${error.message}`);
  }
};

export const fetchTleFormat = async (satelliteId) => {
  try {
    const satellite = await fetchTleBySatelliteId(satelliteId);
    
    if (satellite.line1 && satellite.line2) {
      const tleFormat = `${satellite.name}\n${satellite.line1}\n${satellite.line2}`;
      return { data: tleFormat };
    } else {
      throw new Error('TLE lines not available for this satellite');
    }
    
  } catch (error) {
    console.error('❌ TLE Format API Error:', error);
    throw new Error(`Failed to fetch TLE format: ${error.message}`);
  }
};

export const fetchTleStats = async () => {
  try {
    const data = await safeFetch(TLE_CONFIG.STATS_URL);
    return { data };
    
  } catch (error) {
    try {
      const stationsData = await fetchFromCelesTrak('stations');
      return {
        data: {
          totalCount: stationsData.totalCount,
          lastUpdated: new Date().toISOString(),
          categories: {
            stations: stationsData.totalCount,
            total: stationsData.totalCount
          },
          source: 'celestrak-computed'
        }
      };
    } catch (fallbackError) {
      return {
        data: {
          totalCount: 0,
          lastUpdated: new Date().toISOString(),
          error: 'Stats unavailable',
          source: 'fallback'
        }
      };
    }
  }
};

export const testTleApi = async () => {
  try {
    const data = await fetchTleBySatelliteId(25544);
    return {
      status: 'success',
      message: 'API connection successful',
      data: data
    };
  } catch (error) {
    console.error('❌ API test failed:', error);
    return {
      status: 'error',
      message: `API test failed: ${error.message}`
    };
  }
};

// ---------------------------
// 🧮 Utility Functions
// ---------------------------

export const parseTleData = (tleString) => {
  if (typeof tleString !== 'string') {
    throw new Error(`TLE input must be a string, got: ${typeof tleString}`);
  }

  const lines = tleString.trim().split('\n');
  if (lines.length < 3) {
    throw new Error('Invalid TLE format - requires 3 lines');
  }

  const [name, line1, line2] = lines;

  if (!line1 || !line2 || line1.length < 69 || line2.length < 69) {
    throw new Error('TLE lines are too short or malformed');
  }

  return {
    name: name.trim(),
    line1: line1.trim(),
    line2: line2.trim(),
    parsed: {
      satelliteNumber: parseInt(line1.substring(2, 7)),
      classification: line1.substring(7, 8),
      intlDesignator: line1.substring(9, 17).trim(),
      epochYear: parseInt(line1.substring(18, 20)),
      epochDay: parseFloat(line1.substring(20, 32)),
      firstDerivative: parseFloat(line1.substring(33, 43)),
      secondDerivative: parseFloat(line1.substring(44, 52)),
      bstarDrag: parseFloat(line1.substring(53, 61)),
      ephemerisType: parseInt(line1.substring(62, 63)),
      elementNumber: parseInt(line1.substring(64, 68)),
      inclination: parseFloat(line2.substring(8, 16)),
      raan: parseFloat(line2.substring(17, 25)),
      eccentricity: parseFloat('0.' + line2.substring(26, 33)),
      argOfPerigee: parseFloat(line2.substring(34, 42)),
      meanAnomaly: parseFloat(line2.substring(43, 51)),
      meanMotion: parseFloat(line2.substring(52, 63)),
      revolutionNumber: parseInt(line2.substring(63, 68))
    }
  };
};

export const parseApiTleData = (apiSatellite) => {
  const { name, line1, line2, satelliteId, date } = apiSatellite;
  const tleString = `${name}\n${line1}\n${line2}`;
  const parsed = parseTleData(tleString);
  const orbitalPeriod = 1440 / parsed.parsed.meanMotion; 
  const earthRadius = 6371; 
  const gravitationalParameter = 398600.4418; 
  const meanMotionRadPerSec = parsed.parsed.meanMotion * 2 * Math.PI / 86400;
  const semiMajorAxis = Math.pow(gravitationalParameter / Math.pow(meanMotionRadPerSec, 2), 1/3);
  const altitude = semiMajorAxis - earthRadius;
  const fullEpochYear = parsed.parsed.epochYear < 57 ? 2000 + parsed.parsed.epochYear : 1900 + parsed.parsed.epochYear;
  
  return {
    satelliteId,
    date,
    ...parsed.parsed,
    epochYear: fullEpochYear,
    orbitalPeriod,
    altitude
  };
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
  fetchEonetStats,
  checkEonetHealth,
  fetchInsight,
  fetchExoplanet,
  fetchMediaLibrary,
  fetchTechTransfer,
  fetchTleBySearch,
  fetchTleByCategory,
  fetchTleBySatelliteId,
  fetchTleByPage,
  fetchTleFormat,
  fetchTleStats,
  parseTleData,
  calculateOrbitalPeriod,
  calculateApproximateAltitude,
  classifySatellite,
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