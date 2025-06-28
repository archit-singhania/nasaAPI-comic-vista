const axios = require('axios');
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const NASA_BASE_URL = 'https://api.nasa.gov';

const TLE_CONFIG = {
  BASE_URL: 'https://tle.ivanstanojevic.me/api/tle',
  STATS_URL: 'https://tle.ivanstanojevic.me/api/tle/stats',
  CELESTRAK_URL: 'https://celestrak.org/NORAD/elements/gp.php',
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
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

class NasaService {
    constructor() {
    this.apiKey = NASA_API_KEY;
    this.baseURL = NASA_BASE_URL;
    this.defaultTimeout = TLE_CONFIG.DEFAULT_TIMEOUT;
    this.maxRetries = TLE_CONFIG.MAX_RETRIES;
    this.retryDelay = TLE_CONFIG.RETRY_DELAY;
    this.TLE_BASE_URL = TLE_CONFIG.BASE_URL;
    this.headers = TLE_CONFIG.GET_HEADERS;
  }

  async fetchFromApi(endpoint, params = {}, options = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
            let fullUrl;
            
            if (endpoint.startsWith('http')) {
                fullUrl = endpoint;
            } else if (options.baseURL) {
                const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
                fullUrl = `${options.baseURL.replace(/\/$/, '')}${normalizedEndpoint}`;
            } else {
                const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
                fullUrl = `${this.baseURL}${normalizedEndpoint}`;
            }

            const isEonetRequest = options.baseURL && options.baseURL.includes('eonet.gsfc.nasa.gov');
            const shouldSkipApiKey = isEonetRequest || options.skipApiKey;

            const finalParams = shouldSkipApiKey ? params : { ...params, api_key: this.apiKey };

            const config = {
                timeout: options.timeout || this.defaultTimeout,
                headers: {
                    'User-Agent': 'NASA-API-Client/1.0',
                    'Accept': 'application/json, image/jpeg, image/png, */*',
                    ...options.headers
                },
                params: finalParams,
                responseType: options.responseType || 'json',
                validateStatus: (status) => status < 500 
            };

            const response = await axios.get(fullUrl, config);
            
            if (response.status >= 400) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return this.processResponse(response, endpoint);

        } catch (error) {
            lastError = error;
            const status = error.response?.status;
            
            console.error(`[NASA API] Attempt ${attempt} failed with status: ${status || 'Network Error'}`);
            
            if (error.response) {
                console.error(`[NASA API] Full error details:`, {
                    code: error.code,
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: typeof error.response.data === 'string' ? error.response.data.substring(0, 200) + '...' : error.response.data,
                    url: error.config?.url
                });
            }

            if ([400, 401, 403, 404, 500, 501, 502, 503].includes(status)) {
                console.error(`[NASA API] Non-retryable error (${status}), stopping attempts.`);
                break;
            }

            if (attempt < this.maxRetries) {
                const delay = this.retryDelay * Math.pow(1.5, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw this.handleApiError(lastError, endpoint);
}

  processResponse(response, endpoint) {
    const contentType = response.headers['content-type'] || '';

    if (response.config && response.config.responseType === 'arraybuffer') {
      return response; 
    }

    if (endpoint.includes('/earth/imagery')) {
      const imageUrl = this.buildImageUrl(response.config);
      return {
        url: imageUrl,
        date: response.config.params.date || 'Latest available',
        type: 'image',
        contentType: contentType || 'image/jpeg',
        coordinates: {
          latitude: response.config.params.lat,
          longitude: response.config.params.lon
        },
        dimension: response.config.params.dim
      };
    }

    if (contentType.includes('application/json') || typeof response.data === 'object') {
      if (endpoint.includes('/techtransfer/')) {
        return this.cleanTechTransferResponse(response.data);
      }
      return response.data;
    }

    if (contentType.includes('image/')) {
      return {
        url: this.buildImageUrl(response.config),
        date: response.config.params.date || 'Latest available',
        type: 'image',
        contentType: contentType
      };
    }

    return {
      url: this.buildImageUrl(response.config),
      date: response.config.params.date || 'Latest available',
      type: 'direct_url'
    };
  }

  cleanTechTransferResponse(data) {
    if (!data) return data;
    
    const cleanString = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/<[^>]*>/g, '') 
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
    };

    const cleanObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      } else if (obj && typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          cleaned[key] = cleanObject(value);
        }
        return cleaned;
      } else if (typeof obj === 'string') {
        return cleanString(obj);
      }
      return obj;
    };

    return cleanObject(data);
  }

  buildImageUrl(config) {
    const url = new URL(config.url);
    Object.entries(config.params || {}).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  handleApiError(error, endpoint) {
    console.error(`[NASA API] Full error details:`, {
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });

    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. The NASA API is taking too long to respond.');
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new Error('Cannot connect to NASA API. Please check your internet connection.');
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return new Error(data?.message || 'Invalid request parameters. Please check your input.');
        case 401:
          return new Error('Invalid API key. Please check your NASA API key.');
        case 403:
          return new Error('Access forbidden. Your API key may have exceeded its quota.');
        case 404:
          return new Error(this.get404Message(endpoint));
        case 429:
          return new Error('NASA API rate limit exceeded. Please try again in a few minutes.');
        case 500:
        case 502:
        case 503:
        case 504:
          if (endpoint.includes('/techtransfer/')) {
            return new Error('NASA Tech Transfer API is currently experiencing issues. This is a known problem with the service. Please try again later or contact NASA support.');
          }
          return new Error('NASA API is currently experiencing issues. Please try again later.');
        default:
          return new Error(`NASA API error (${status}): ${error.response.statusText || 'Unknown error'}`);
      }
    }

    return new Error(`Unexpected error: ${error.message}`);
  }

  get404Message(endpoint) {
    if (endpoint.includes('/earth/')) {
      return 'No satellite imagery available for this location and date. Try a different location or date.';
    }
    if (endpoint.includes('/EONET/') || endpoint.includes('eonet.gsfc.nasa.gov')) {
      return 'No natural events found for the specified parameters.';
    }
    if (endpoint.includes('/neo/')) {
      return 'No near-Earth objects found for the specified parameters.';
    }
    if (endpoint.includes('/mars-photos/')) {
      return 'No Mars rover photos found for the specified parameters.';
    }
    if (endpoint.includes('/planetary/apod')) {
      return 'No Astronomy Picture of the Day found for the specified date.';
    }
    if (endpoint.includes('/EPIC/')) {
      return 'No EPIC images available for the specified date or parameters.';
    }
    if (endpoint.includes('/techtransfer/')) {
      return 'No tech transfer data found for the specified parameters.';
    }
    return 'Requested resource not found. Please check your parameters.';
  }

  // ================================
  // TECH TRANSFER API METHODS
  // ================================

  async getTechTransferPatents(params = {}) {
    const endpoint = '/techtransfer/patent/';
    
    try {
      const response = await this.fetchFromApi(endpoint, params);
      return response;
    } catch (error) {
      console.error('❌ Tech Transfer Patents Error in NasaService:', error.message);
      console.error('❌ Full error object:', error.response?.data || error);
      throw error;
    }
  }

  async getTechTransferSoftware(params = {}) {
      const endpoint = '/techtransfer/software/';
      
      try {
        const response = await this.fetchFromApi(endpoint, params);
        return response;
      } catch (error) {
        console.error('❌ Tech Transfer Software Error in NasaService:', error.message);
        throw error;
      }
  }

  async getTechTransferSpinoffs(params = {}) {
      const endpoint = '/techtransfer/spinoff/';
      
      try {
        const response = await this.fetchFromApi(endpoint, params);
        return response;
      } catch (error) {
        console.error('❌ Tech Transfer Spinoffs Error in NasaService:', error.message);
        throw error;
      }
  }


  async searchTechTransfer(searchTerm, category = 'patents', params = {}) {
    if (!searchTerm) {
      throw new Error('Search term is required for Tech Transfer search');
    }

    const validCategories = ['patents', 'software', 'spinoffs'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    let endpoint;
    let queryParams = { ...params };

    switch (category) {
      case 'patents':
        endpoint = '/techtransfer/patent/';
        queryParams.patent = searchTerm;
        break;
      case 'software':
        endpoint = '/techtransfer/software/';
        queryParams.software = searchTerm;
        break;
      case 'spinoffs':
        endpoint = '/techtransfer/spinoff/';
        queryParams.spinoff = searchTerm;
        break;
    }

    try {
      const response = await this.fetchFromApi(endpoint, queryParams);
      return {
        ...response,
        searchTerm,
        category,
        endpoint
      };
    } catch (error) {
      console.error(`❌ Tech Transfer Search Error in NasaService (${category}):`, error.message);
      throw error;
    }
  }

  async testTechTransferEndpoint(category, searchTerm = 'test') {
    
    const validCategories = ['patent', 'software', 'spinoff'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid test category. Must be one of: ${validCategories.join(', ')}`);
    }

    let endpoint = `/techtransfer/${category}`;
    let queryParams = {};

    switch (category) {
      case 'patent':
        queryParams.patent = searchTerm;
        break;
      case 'software':
        queryParams.software = searchTerm;
        break;
      case 'spinoff':
        queryParams.spinoff = searchTerm;
        break;
    }

    try {
      const response = await this.fetchFromApi(endpoint, queryParams);
      return {
        success: true,
        test: true,
        endpoint,
        parameters: queryParams,
        data: response
      };
    } catch (error) {
      console.error(`❌ Tech Transfer Test Error for ${category}:`, error.message);
      return {
        success: false,
        test: true,
        endpoint,
        parameters: queryParams,
        error: error.message
      };
    }
  }

  // ================================
  // EPIC API Methods
  // ================================

  async getEpicNatural(params = {}) {
    return this.fetchFromApi('/EPIC/api/natural/images', params);
  }

  async getEpicNaturalByDate(date, params = {}) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    return this.fetchFromApi(`/EPIC/api/natural/date/${date}`, params);
  }

  async getEpicNaturalDates(params = {}) {
    return this.fetchFromApi('/EPIC/api/natural/available', params);
  }

  async getEpicEnhanced(params = {}) {
    return this.fetchFromApi('/EPIC/api/enhanced/images', params);
  }

  async getEpicEnhancedByDate(date, params = {}) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    return this.fetchFromApi(`/EPIC/api/enhanced/date/${date}`, params);
  }

  async getEpicEnhancedDates(params = {}) {
    return this.fetchFromApi('/EPIC/api/enhanced/available', params);
  }

  buildEpicImageUrl(image, type = 'natural', format = 'jpg') {
    if (!image || !image.image || !image.date) {
      throw new Error('Invalid image object. Must contain "image" and "date" properties.');
    }

    const date = image.date.split(' ')[0]; 
    const archiveDate = date.replace(/-/g, '/'); 
    
    return `${this.baseURL}/EPIC/archive/${type}/${archiveDate}/${format}/${image.image}.${format}?api_key=${this.apiKey}`;
  }

  // ================================
  // Other API Methods 
  // ================================

  async getDonkiEvents(eventType, queryParams = {}) {
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === '' || queryParams[key] === undefined || queryParams[key] === null) {
        delete queryParams[key];
      }
    });

    try {
      const response = await this.fetchFromApi(`/DONKI/${eventType}`, queryParams);
      let transformedData = response;
      
      if (eventType === 'notifications' && Array.isArray(response)) {
        transformedData = response.map(event => ({
          ...event,
          eventType: 'notification',
          timestamp: event.messageIssueTime
        }));
      }
      
      if (eventType !== 'notifications' && Array.isArray(response)) {
        transformedData = response.map(event => ({
          ...event,
          eventType: eventType.toUpperCase(),
          timestamp: event.beginTime || event.eventTime || event.peakTime
        }));
      }

      return {
        success: true,
        eventType,
        count: Array.isArray(transformedData) ? transformedData.length : 0,
        data: transformedData,
        queryParams: queryParams
      };
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('No events found')) {
        return {
          success: true,
          eventType,
          count: 0,
          data: [],
          queryParams: queryParams,
          message: 'No space weather events found for the specified parameters'
        };
      }
      throw error;
    }
  }

  async getEarthImagery(params) {
    try {
        const lat = parseFloat(params.lat);
        const lon = parseFloat(params.lon);
        const dim = parseFloat(params.dim) || 0.15;

        if (
            isNaN(lat) || lat < -90 || lat > 90 ||
            isNaN(lon) || lon < -180 || lon > 180 ||
            isNaN(dim) || dim <= 0 || dim > 1
        ) {
            throw new Error("Invalid parameters: lat (-90 to 90), lon (-180 to 180), dim (>0 and <=1) required.");
        }

        const queryParams = {
            lat: lat,
            lon: lon,
            dim: dim
        };

        if (params.date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(params.date)) {
                queryParams.date = params.date;
            }
        }

        const response = await this.fetchFromApi('/planetary/earth/imagery', queryParams, {
            headers: {
                'Accept': 'application/json, image/jpeg, image/png, */*'
            },
            responseType: 'json'
        });

        if (response && (response.url || response.date)) {
            return {
                url: response.url || `${this.baseURL}/planetary/earth/imagery?${new URLSearchParams({...queryParams, api_key: this.apiKey}).toString()}`,
                date: response.date || params.date || 'Latest available',
                coordinates: { latitude: lat, longitude: lon },
                dimension: dim,
                service: 'NASA Earth Imagery'
            };
        }

        const directUrl = `${this.baseURL}/planetary/earth/imagery?${new URLSearchParams({...queryParams, api_key: this.apiKey}).toString()}`;
        
        return {
            url: directUrl,
            date: params.date || 'Latest available',
            coordinates: { latitude: lat, longitude: lon },
            dimension: dim,
            service: 'NASA Earth Imagery (Direct)'
        };

    } catch (error) {
        console.error("Error fetching NASA Earth imagery:", error.message);
        
        throw new Error(`NASA API is currently experiencing issues. Please try again later.`);
    }
  }

  async getEonetEvents(queryParams = new URLSearchParams()) {
    const params = Object.fromEntries(queryParams.entries());
    
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key];
      }
    });

    try {
      const response = await this.fetchFromApi('/api/v3/events', params, {
        baseURL: 'https://eonet.gsfc.nasa.gov'
      });

      return {
        events: response.events || [],
        title: response.title || 'EONET Events',
        description: response.description || 'NASA EONET Natural Events',
        link: response.link || 'https://eonet.gsfc.nasa.gov'
      };
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('No natural events found')) {
        return {
          events: [],
          title: 'EONET Events',
          description: 'No events found for the specified parameters',
          link: 'https://eonet.gsfc.nasa.gov'
        };
      }
      throw error;
    }
  }

  async getEonetCategories() {
    try {
      const response = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching EONET categories:', error);
      throw this.handleApiError(error, '/categories');
    }
  }

  async getEonetSources() {
    try {
      const response = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/sources');
      return response.data;
    } catch (error) {
      console.error('Error fetching EONET sources:', error);
      throw this.handleApiError(error, '/sources');
    }
  }

  async getEonetEvent(eventId) {
    try {
      const response = await axios.get(`https://eonet.gsfc.nasa.gov/api/v3/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching EONET event ${eventId}:`, error);
      throw this.handleApiError(error, `/events/${eventId}`);
    }
  }

  async getApod(params = {}) {
    return this.fetchFromApi('/planetary/apod', params);
  }

  async getNeoFeed(params) {
    return this.fetchFromApi('/neo/rest/v1/feed', params);
  }

  async getPhotos({ rover = 'curiosity', sol, earth_date, camera, page = 1, per_page = 24 }) {
    try {
      const params = { page, per_page };
      
      if (sol) params.sol = sol;
      if (earth_date) params.earth_date = earth_date;
      if (camera) params.camera = camera;
      
      const data = await this.fetchFromApi(`/mars-photos/api/v1/rovers/${rover}/photos`, params);
      
      const photos = data.photos || [];
      
      return photos;
    } catch (error) {
      console.error(`❌ Error fetching photos for ${rover}:`, error);
      throw error;
    }
  }

  async getRovers() {
    try {
      const data = await this.fetchFromApi('/mars-photos/api/v1/rovers');
      
      const rovers = data.rovers?.map(rover => ({
        name: rover.name,
        status: rover.status,
        launch_date: rover.launch_date,
        landing_date: rover.landing_date,
        max_sol: rover.max_sol,
        max_date: rover.max_date,
        total_photos: rover.total_photos
      })) || [];
      
      return { rovers };
    } catch (error) {
      return {
        rovers: [
          { name: 'Curiosity', status: 'active' },
          { name: 'Perseverance', status: 'active' },
          { name: 'Opportunity', status: 'complete' },
          { name: 'Spirit', status: 'complete' }
        ]
      };
    }
  }

  async getCameras(rover) {
    try {
      
      const manifest = await this.fetchFromApi(`/mars-photos/api/v1/manifests/${rover}`);
      const photos = manifest?.photo_manifest?.photos || [];
      
      const allCameras = new Set();
      photos.forEach(sol => {
        if (sol.cameras && Array.isArray(sol.cameras)) {
          sol.cameras.forEach(cam => allCameras.add(cam));
        }
      });
      
      const cameras = Array.from(allCameras);
      
      return cameras;
    } catch (error) {
      console.error(`❌ Error fetching cameras for ${rover}:`, error);
      const defaultCameras = ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'];
      return defaultCameras;
    }
  }
  
  async checkHealth() {
    try {
      const response = await this.fetchFromApi('/mars-photos/api/v1/rovers/curiosity/photos', { sol: 1000 });
      return { status: 'OK', examplePhotos: response?.photos?.length || 0, uptime: process.uptime() };
    } catch (err) {
      return { status: 'ERROR', message: err.message, uptime: process.uptime() };
    }
  }

  async getExoplanet(params = {}) {
    if (params.query) {
      try {
        const response = await axios.get('https://exoplanetarchive.ipac.caltech.edu/TAP/sync', {
          params: {
            query: params.query,
            format: params.format || 'json'
          },
          timeout: 30000,
          headers: {
            'User-Agent': 'NASA-Exoplanet-Client/1.0'
          }
        });
        return response.data;
      } catch (error) {
        throw this.handleApiError(error, '/api/exoplanet');
      }
    }
    return this.fetchFromApi('/api/exoplanet', params);
  }

  async customEndpoint(endpoint, params = {}, options = {}) {
    return this.fetchFromApi(endpoint, params, options);
  }

  async getImageLibrary(endpoint, params = {}) {
    const baseUrl = 'https://images-api.nasa.gov';
    return this.fetchFromApi(endpoint, params, { 
      baseURL: baseUrl,
      skipApiKey: true 
    });
  }

async retryRequest(requestFn, maxRetries = this.maxRetries) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) break;
        
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  async fetchFromCelesTrak(group = 'stations', page = 1, pageSize = 50) {
    try {
      const url = `${TLE_CONFIG.CELESTRAK_URL}?GROUP=${group}&FORMAT=json`;
      
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: this.defaultTimeout
      });
      
      const transformedData = response.data.map(sat => ({
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
        totalCount: response.data.length,
        currentPage: page,
        pageSize: pageSize,
        source: 'celestrak'
      };
      
    } catch (error) {
      console.error('❌ CelesTrak fallback failed:', error);
      throw new Error(`CelesTrak fallback failed: ${error.message}`);
    }
  }

  matchesCategory(satellite, category) {
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
  }

  // ---------------------------
  // 🧑‍🚀 TLE Service Methods
  // ---------------------------

  async getTleData(params = {}) {
    try {
      const { page = 1, pageSize = 50, ...otherParams } = params;
      
      const requestParams = {
        page,
        'page-size': pageSize,
        ...otherParams
      };
  
      const data = response.data;
      
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
      return await this.fetchFromCelesTrak('stations', params.page || 1, params.pageSize || 50);
    }
  }

  async getTleBySatelliteId(satelliteId, params = {}) {
    try {
      const url = `${this.TLE_BASE_URL}/${satelliteId}`;
      
      const response = await this.retryRequest(() => 
        axios.get(url, {
          params,
          headers: this.headers,
          timeout: this.defaultTimeout
        })
      );
      
      return response.data;
      
    } catch (error) {
      try {
        const fallbackData = await this.fetchFromCelesTrak('stations');
        const satellite = fallbackData.data.find(sat => 
          sat.satelliteId.toString() === satelliteId.toString()
        );
        
        if (satellite) {
          return satellite;
        } else {
          throw new Error(`Satellite ${satelliteId} not found in fallback data`);
        }
      } catch (fallbackError) {
        throw this.handleApiError(error, `/tle/${satelliteId}`);
      }
    }
  }

  async searchTleByName(searchTerm, params = {}) {
    try {
      const searchParams = {
        search: searchTerm,
        ...params
      };
      
      const response = await this.retryRequest(() => 
        axios.get(this.TLE_BASE_URL, {
          params: searchParams,
          headers: this.headers,
          timeout: this.defaultTimeout
        })
      );
      
      const data = response.data;
      return Array.isArray(data) ? data : (data.member || []);
      
    } catch (error) {
      try {
        const fallbackData = await this.fetchFromCelesTrak('stations');
        const filtered = fallbackData.data.filter(sat => 
          sat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered;
      } catch (fallbackError) {
        throw this.handleApiError(error, `/tle?search=${searchTerm}`);
      }
    }
  }

  async getTleByCategory(category, params = {}) {
    try {
      const result = await this.getTleData(params);
      const filtered = (result.data || []).filter(satellite => this.matchesCategory(satellite, category));
      
      return {
        ...result,
        data: filtered,
        totalCount: filtered.length
      };
      
    } catch (error) {
      const celestrakGroup = TLE_CONFIG.CELESTRAK_GROUPS[category] || 'stations';
      try {
        const fallbackData = await this.fetchFromCelesTrak(celestrakGroup);
        return fallbackData;
      } catch (fallbackError) {
        throw this.handleApiError(error, `/tle?category=${category}`);
      }
    }
  }

  async getTleBySatelliteIds(satelliteIds, params = {}) {
    try {
      this.validateSatelliteIds(satelliteIds);
      
      const idsString = Array.isArray(satelliteIds) ? satelliteIds.join(',') : satelliteIds;
      const url = `${this.TLE_BASE_URL}/${idsString}`;
      
      const response = await this.retryRequest(() => 
        axios.get(url, {
          params,
          headers: this.headers,
          timeout: this.defaultTimeout
        })
      );
      
      return Array.isArray(response.data) ? response.data : [response.data];
      
    } catch (error) {
      console.error('Error fetching multiple satellites:', error);
      throw this.handleApiError(error, `/tle/${satelliteIds}`);
    }
  }

  async getTleByPage(page, pageSize = 50, params = {}) {
    try {
      const validatedParams = this.validatePageParams(page, pageSize);
      
      return await this.getTleData({
        page: validatedParams.page,
        pageSize: validatedParams.pageSize,
        ...params
      });
      
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      throw this.handleApiError(error, `/tle?page=${page}`);
    }
  }

  async getTleFormat(satelliteId, params = {}) {
    try {
      const satellite = await this.getTleBySatelliteId(satelliteId, params);
      
      if (satellite.line1 && satellite.line2) {
        const tleFormat = `${satellite.name}\n${satellite.line1}\n${satellite.line2}`;
        return tleFormat;
      } else {
        throw new Error('TLE lines not available for this satellite');
      }
      
    } catch (error) {
      console.error(`Error fetching TLE format for ${satelliteId}:`, error);
      throw this.handleApiError(error, `/tle/${satelliteId}?format=text`);
    }
  }

  async getTleStats(params = {}) {
    try {
      const response = await this.retryRequest(() => 
        axios.get(TLE_CONFIG.STATS_URL, {
          params,
          headers: this.headers,
          timeout: this.defaultTimeout
        })
      );
      
      return response.data;
      
    } catch (error) {
      try {
        const stationsData = await this.fetchFromCelesTrak('stations');
        return {
          totalCount: stationsData.totalCount,
          lastUpdated: new Date().toISOString(),
          categories: {
            stations: stationsData.totalCount,
            total: stationsData.totalCount
          },
          source: 'celestrak-computed'
        };
      } catch (fallbackError) {
        return {
          totalCount: 0,
          lastUpdated: new Date().toISOString(),
          error: 'Stats unavailable',
          source: 'fallback'
        };
      }
    }
  }

  async testTleApi() {
    try {
      const response = await this.retryRequest(() => 
        axios.get(`${this.TLE_BASE_URL}/25544`, {
          headers: this.headers,
          timeout: this.defaultTimeout
        })
      );
      
      return { 
        status: 'success', 
        message: 'TLE API connection successful',
        data: response.data
      };
    } catch (error) {
      console.error('🚨 TLE API test failed:', error);
      return { 
        status: 'error', 
        message: `TLE API test failed: ${error.message}` 
      };
    }
  }

  // ---------------------------
  // 🔍 Validation Methods
  // ---------------------------

  validateCategory(category) {
    const validCategories = [
      'stations', 'visual', 'active-geosynchronous', 'analyst', 'weather', 
      'noaa', 'goes', 'resource', 'cubesat', 'other'
    ];
    
    return validCategories.includes(category.toLowerCase());
  }

  validateSatelliteId(id) {
    return !isNaN(id) && parseInt(id) > 0;
  }

  validateSatelliteIds(ids) {
    const idArray = Array.isArray(ids) ? ids : ids.split(',').map(id => id.trim());
    const invalidIds = idArray.filter(id => isNaN(id) || id === '');
    
    if (invalidIds.length > 0) {
      throw new Error(`Invalid satellite IDs: ${invalidIds.join(', ')}`);
    }
    
    if (idArray.length > 100) {
      throw new Error('Too many satellite IDs. Maximum 100 satellites per request.');
    }
    
    return idArray;
  }

  validatePageParams(page, pageSize) {
    if (isNaN(page) || parseInt(page) < 1) {
      throw new Error('Invalid page number. Must be a positive integer.');
    }
    
    if (pageSize && (isNaN(pageSize) || parseInt(pageSize) < 1 || parseInt(pageSize) > 1000)) {
      throw new Error('Invalid page_size. Must be between 1 and 1000.');
    }
    
    return {
      page: parseInt(page),
      pageSize: pageSize ? parseInt(pageSize) : 50
    };
  }

  // ---------------------------
  // 🛰️ TLE Utility Methods
  // ---------------------------

  parseTleData(tleString) {
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
  }

  calculateOrbitalPeriod(meanMotion) {
    return meanMotion > 0 ? 1440 / meanMotion : 0;
  }

  calculateApproximateAltitude(meanMotion) {
    const earthRadius = 6371;
    const mu = 398600.4418;
    
    if (meanMotion <= 0) return 0;
    
    const period = 1440 / meanMotion * 60;
    const semiMajorAxis = Math.pow((mu * period * period) / (4 * Math.PI * Math.PI), 1/3);
    const altitude = semiMajorAxis - earthRadius;
    
    return Math.max(0, altitude);
  }

  classifySatellite(inclination, altitude, eccentricity) {
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
  }

  // ================================
  // WMTS TILE SERVICE METHODS
  // ================================

  async fetchWmtsTile(body, layer, z, x, y, format = 'jpg') {
    const wmtsEndpoint = this.getWmtsEndpoint(body, layer);
    const tileUrl = `${wmtsEndpoint}/1.0.0/default/default/${z}/${y}/${x}.${format}`;

    try {
      const response = await this.fetchFromApi(tileUrl, {}, {
        responseType: 'arraybuffer',
        baseURL: '',
        skipApiKey: true,
        headers: {
          'Accept': `image/${format}`,
          'User-Agent': 'NASA-Trek-Client/1.0'
        }
      });

      return response.data || response;
    } catch (error) {
      console.error(`Error fetching WMTS tile for ${body}/${layer}/${z}/${x}/${y}:`, error.message);
      throw error;
    }
  }

  getWmtsEndpoint(body, layer) {
    const bodyLower = body.toLowerCase();
    const endpoints = {
      'moon': `https://trek.nasa.gov/tiles/Moon/EQ/${layer}`,
      'mars': `https://trek.nasa.gov/tiles/Mars/EQ/${layer}`,
      'mercury': `https://trek.nasa.gov/tiles/Mercury/EQ/${layer}`,
      'vesta': `https://trek.nasa.gov/tiles/Vesta/EQ/${layer}`,
      'ceres': `https://trek.nasa.gov/tiles/Ceres/EQ/${layer}`,
      'titan': `https://trek.nasa.gov/tiles/Titan/EQ/${layer}`
    };
    
    return endpoints[bodyLower] || `https://trek.nasa.gov/tiles/${body}/EQ/${layer}`;
  }

  async listWmtsBodies() {
    return ['Moon', 'Mars', 'Vesta', 'Ceres'];
  }

  async listWmtsLayers(body) {
    const layers = {
      Moon: ['LRO_WAC_Mosaic_Global_303ppd', 'LOLA_Shade_Global_128ppd'],
      Mars: ['MOLA_ColorHillshade', 'THEMIS_IR_Day'],
      Vesta: ['FC_Mosaic'],
      Ceres: ['FC_Mosaic']
    };
    return layers[body] || [];
  }

  async getWmtsLayerInfo(body, layer) {
    return {
      body,
      layer,
      projection: 'Equirectangular',
      tileSize: 256,
      maxZoom: 7,
      format: 'jpg',
      credits: 'NASA Moon/Mars Trek WMTS'
    };
  }

  // ================================
  // OSDR API Methods
  // ================================

  async getOsdrStudies(params = {}) {
    return this.fetchFromApi('/osdr/api/studies', params);
  }

  async getOsdrStudyById(studyId, params = {}) {
    if (!studyId) {
      throw new Error('Study ID is required');
    }
    return this.fetchFromApi(`/osdr/api/studies/${studyId}`, params);
  }

  async getOsdrDatasets(params = {}) {
    return this.fetchFromApi('/osdr/api/datasets', params);
  }

  async getOsdrDatasetById(datasetId, params = {}) {
    if (!datasetId) {
      throw new Error('Dataset ID is required');
    }
    return this.fetchFromApi(`/osdr/api/datasets/${datasetId}`, params);
  }

  async getOsdrSubjects(params = {}) {
    return this.fetchFromApi('/osdr/api/subjects', params);
  }

  async getOsdrSubjectById(subjectId, params = {}) {
    if (!subjectId) {
      throw new Error('Subject ID is required');
    }
    return this.fetchFromApi(`/osdr/api/subjects/${subjectId}`, params);
  }

  async getOsdrSamples(params = {}) {
    return this.fetchFromApi('/osdr/api/samples', params);
  }

  async getOsdrSampleById(sampleId, params = {}) {
    if (!sampleId) {
      throw new Error('Sample ID is required');
    }
    return this.fetchFromApi(`/osdr/api/samples/${sampleId}`, params);
  }

  async getOsdrAssays(params = {}) {
    return this.fetchFromApi('/osdr/api/assays', params);
  }

  async getOsdrAssayById(assayId, params = {}) {
    if (!assayId) {
      throw new Error('Assay ID is required');
    }
    return this.fetchFromApi(`/osdr/api/assays/${assayId}`, params);
  }

  async searchOsdr(searchTerm, params = {}) {
    if (!searchTerm) {
      throw new Error('Search term is required');
    }
    return this.fetchFromApi('/osdr/api/search', {
      term: searchTerm,
      ...params
    });
  }
}

const nasaService = new NasaService();

module.exports = {
  NasaService,
  nasaService,
  fetchFromNasa: (url, params, options) => {
    if (url.startsWith('http')) {
      return nasaService.fetchFromApi(url, params, { baseURL: '', ...options });
    } else {
      const endpoint = url.replace('https://api.nasa.gov', '');
      return nasaService.fetchFromApi(endpoint, params, options);
    }
  }
};