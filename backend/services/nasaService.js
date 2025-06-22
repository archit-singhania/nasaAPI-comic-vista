const axios = require('axios');
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const NASA_BASE_URL = 'https://api.nasa.gov';

class NasaService {
  constructor() {
    this.apiKey = NASA_API_KEY;
    this.baseURL = NASA_BASE_URL;
    this.defaultTimeout = 15000; 
  }

  async fetchFromApi(endpoint, params = {}, options = {}) {
    try {
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const baseUrl = options.baseURL || this.baseURL;
      const fullUrl = `${baseUrl}${normalizedEndpoint}`;
      
      console.log(`[NASA API] Fetching: ${fullUrl}`);
      console.log(`[NASA API] Parameters:`, params);

      const isEonetRequest = baseUrl.includes('eonet.gsfc.nasa.gov');
      
      const config = {
        timeout: options.timeout || this.defaultTimeout,
        headers: {
          'User-Agent': 'NASA-API-Client/1.0',
          'Accept': 'application/json, image/jpeg, image/png, */*',
          ...options.headers
        },
        params: isEonetRequest ? params : {
          api_key: this.apiKey,
          ...params
        },
        responseType: options.responseType || 'json',
        ...options
      };

      const response = await axios.get(fullUrl, config);
      
      console.log(`[NASA API] Response Status: ${response.status}`);
      console.log(`[NASA API] Content Type: ${response.headers['content-type']}`);
      
      return this.processResponse(response, endpoint);
      
    } catch (error) {
      console.error(`[NASA API] Error for endpoint ${endpoint}:`);
      console.error(`[NASA API] Status: ${error.response?.status}`);
      console.error(`[NASA API] Status Text: ${error.response?.statusText}`);
      console.error(`[NASA API] Response Data:`, error.response?.data);
      throw this.handleApiError(error, endpoint);
    }
  }

  processResponse(response, endpoint) {
    const contentType = response.headers['content-type'] || '';

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
    return 'Requested resource not found. Please check your parameters.';
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

  async getEarthImagery(params) {
    try {
      const response = await this.fetchFromApi('/planetary/earth/imagery', params, {
        headers: {
          'Accept': 'application/json, image/jpeg, image/png, */*'
        }
      });

      if (!response.url) {
        const imageUrl = `${this.baseURL}/planetary/earth/imagery?lat=${params.lat}&lon=${params.lon}&dim=${params.dim}&api_key=${this.apiKey}`;
        return {
          url: imageUrl,
          date: params.date || 'Latest available',
          coordinates: { latitude: params.lat, longitude: params.lon },
          dimension: params.dim
        };
      }

      return response;
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('No satellite imagery available')) {
        const adjustedParams = {
          ...params,
          lat: Math.round(params.lat * 100) / 100,
          lon: Math.round(params.lon * 100) / 100
        };

        const imageUrl = `${this.baseURL}/planetary/earth/imagery?lat=${adjustedParams.lat}&lon=${adjustedParams.lon}&dim=${adjustedParams.dim}&api_key=${this.apiKey}`;
        return {
          url: imageUrl,
          date: adjustedParams.date || 'Latest available',
          coordinates: { latitude: adjustedParams.lat, longitude: adjustedParams.lon },
          dimension: adjustedParams.dim,
          note: 'Coordinates adjusted for availability'
        };
      }
      throw error;
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

  async getMarsRoverPhotos(rover, params) {
    return this.fetchFromApi(`/mars-photos/api/v1/rovers/${rover}/photos`, params);
  }

  async customEndpoint(endpoint, params = {}, options = {}) {
    return this.fetchFromApi(endpoint, params, options);
  }
}

const nasaService = new NasaService();

module.exports = {
  NasaService,
  nasaService,
  fetchFromNasa: (url, params, options) => {
    const endpoint = url.replace('https://api.nasa.gov', '');
    return nasaService.fetchFromApi(endpoint, params, options);
  }
};