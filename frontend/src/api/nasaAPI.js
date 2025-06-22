import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
if (!BASE_URL) {
  throw new Error("⚠️ REACT_APP_BACKEND_URL is not defined");
}

const api = axios.create({
  baseURL: BASE_URL,
});

// ---------------------------
// 🛡️ Error Handling Helper
// ---------------------------
const handleApiError = (error) => {
  if (error.response) {
    const message = error.response.data?.error || error.response.data?.message || error.message;
    throw new Error(message);
  } else if (error.request) {
    throw new Error('Network error: Unable to connect to backend server');
  } else {
    throw new Error(error.message);
  }
};

// ---------------------------
// 🚀 NASA API Request Methods
// ---------------------------

export const fetchApod = async (params = {}) => {
  try {
    return await api.get('/apod', { params });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchMarsPhotos = async ({ rover, sol }) => {
  if (!rover) throw new Error('Rover is required to fetch Mars photos');
  try {
    return await api.get(`/api/mars/${rover}/photos`, { params: { sol } });
  } catch (error) {
    handleApiError(error);
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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

  const NASA_API_KEY = process.env.VITE_NASA_API_KEY || process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';
  const date = image.date.split(' ')[0]; 
  const archiveDate = date.replace(/-/g, '/'); 
  
  return `https://api.nasa.gov/EPIC/archive/${type}/${archiveDate}/${format}/${image.image}.${format}?api_key=${NASA_API_KEY}`;
};

// ================================
// 🌎 Other NASA API Methods
// ================================

export const fetchDonki = async (eventType, params = {}) => {
  try {
    // Make sure the path matches your backend route registration
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

export const fetchMediaLibrary = async (params = {}) => {
  try {
    return await api.get('/api/images/search', { params });
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

export const fetchTle = async (params = {}) => {
  try {
    return await api.get('/api/tle', { params });
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

// ---------------------------
// 🔧 Utility Functions
// ---------------------------

export const checkApiHealth = async () => {
  try {
    return await api.get('/health');
  } catch (error) {
    handleApiError(error);
  }
};

export const getApiVersion = async () => {
  try {
    return await api.get('/version');
  } catch (error) {
    handleApiError(error);
  }
};

export default api;