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
// 🛡️ NASA OSDR Functions
// ---------------------------

const apiRequest = async (endpoint, options = {}) => {
  try {
    console.log('🔍 API Request:', endpoint);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
};

const handleFetchError = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
    } catch {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }
  return response;
};

export const fetchStudyFiles = async (studyIds, options = {}) => {
  const { page = 0, size = 25, all_files = false } = options;
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    all_files: all_files.toString()
  });
  
  return apiRequest(`/api/osdr/study-files/${studyIds}?${params}`);
};

export const fetchStudyFilesByDateRange = async (studyIds, startDate, endDate, options = {}) => {
  const { page = 0, size = 25 } = options;
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });
  
  return apiRequest(`/api/osdr/study-files/${studyIds}/date/${startDate}/${endDate}?${params}`);
};

export const fetchStudyMetadata = async (studyId) => {
  return apiRequest(`/api/osdr/study-metadata/${studyId}`);
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

  const params = new URLSearchParams({
    term,
    from: from.toString(),
    size: size.toString(),
    type,
    sort,
    order,
    ffield,
    fvalue
  });

  return apiRequest(`/api/osdr/search?${params}`);
};

export const advancedSearchStudies = async (searchData) => {
  return apiRequest('/api/osdr/search/advanced', {
    method: 'POST',
    body: JSON.stringify(searchData)
  });
};

export const fetchExperiments = async (options = {}) => {
  const params = new URLSearchParams(options);
  return apiRequest(`/api/osdr/experiments?${params}`);
};

export const fetchExperimentById = async (experimentId) => {
  return apiRequest(`/api/osdr/experiments/${experimentId}`);
};

export const fetchMissions = async (options = {}) => {
  const params = new URLSearchParams(options);
  return apiRequest(`/api/osdr/missions?${params}`);
};

export const fetchMissionById = async (missionId) => {
  return apiRequest(`/api/osdr/missions/${missionId}`);
};

export const fetchPayloads = async (options = {}) => {
  const params = new URLSearchParams(options);
  return apiRequest(`/api/osdr/payloads?${params}`);
};

export const fetchPayloadById = async (payloadId) => {
  return apiRequest(`/api/osdr/payloads/${payloadId}`);
};

export const fetchHardware = async (options = {}) => {
  const params = new URLSearchParams(options);
  return apiRequest(`/api/osdr/hardware?${params}`);
};

export const fetchHardwareById = async (hardwareId) => {
  return apiRequest(`/api/osdr/hardware/${hardwareId}`);
};

export const fetchVehicles = async (options = {}) => {
  const params = new URLSearchParams(options);
  return apiRequest(`/api/osdr/vehicles?${params}`);
};

export const fetchVehicleById = async (vehicleId) => {
  return apiRequest(`/api/osdr/vehicles/${vehicleId}`);
};

export const fetchSubjects = async (options = {}) => {
  const params = new URLSearchParams(options);
  return apiRequest(`/api/osdr/subjects?${params}`);
};

export const fetchSubjectById = async (subjectId) => {
  return apiRequest(`/api/osdr/subjects/${subjectId}`);
};

export const fetchBiospecimens = async (options = {}) => {
  const params = new URLSearchParams(options);
  return apiRequest(`/api/osdr/biospecimens?${params}`);
};

export const fetchBiospecimenById = async (biospecimenId) => {
  return apiRequest(`/api/osdr/biospecimens/${biospecimenId}`);
};

export const fetchAnalytics = async () => {
  return apiRequest('/api/osdr/analytics');
};

export const fetchAvailableDates = async () => {
  return apiRequest('/api/osdr/available-dates');
};

export const fetchStudyTypes = async () => {
  return apiRequest('/api/osdr/study-types');
};

export const fetchOrganisms = async () => {
  return apiRequest('/api/osdr/organisms');
};

export const fetchPlatforms = async () => {
  return apiRequest('/api/osdr/platforms');
};

export const fetchHealthStatus = async () => {
  return apiRequest('/api/osdr/health');
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

export default {
  api,
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
  DATA_TYPES,
  STUDY_TYPES,
  PLATFORMS,
  ORGANISMS
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