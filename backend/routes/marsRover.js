const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5050; 

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'], 
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use(limiter);

const NASA_API_KEY = process.env.NASA_API_KEY;
const NASA_BASE_URL = 'https://api.nasa.gov/mars-photos/api/v1';

console.log(`🔑 NASA API Key: ${NASA_API_KEY === 'DEMO_KEY' ? 'Using DEMO_KEY (limited requests)' : 'Custom key configured'}`);

const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; 

const getCacheKey = (url, params) => {
  return `${url}?${new URLSearchParams(params).toString()}`;
};

const isCacheValid = (cacheEntry) => {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
};

const fetchFromNasa = async (endpoint, params = {}) => {
  const cacheKey = getCacheKey(endpoint, params);
  
  const cachedData = cache.get(cacheKey);
  if (isCacheValid(cachedData)) {
    console.log(`📦 Cache hit for: ${cacheKey}`);
    return cachedData.data;
  }

  try {
    console.log(`🌐 Fetching from NASA API: ${endpoint}`);
    console.log(`📋 Parameters:`, JSON.stringify(params, null, 2));

    const fullUrl = `${endpoint}?${new URLSearchParams({...params, api_key: NASA_API_KEY}).toString()}`;
    console.log(`🔗 Full URL: ${fullUrl.replace(NASA_API_KEY, '[API_KEY]')}`);

    const response = await axios.get(endpoint, {
      params: {
        api_key: NASA_API_KEY,
        ...params
      },
      timeout: 30000,
      headers: {
        'User-Agent': 'Mars-Rover-Gallery/1.0',
        'Accept': 'application/json'
      }
    });

    console.log(`✅ NASA API response received:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data keys: ${Object.keys(response.data)}`);
    console.log(`   Data sample:`, JSON.stringify(response.data, null, 2).substring(0, 500) + '...');

    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    return response.data;
  } catch (error) {
    console.error('❌ NASA API Error Details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Status Text: ${error.response?.statusText}`);
    console.error(`   Response Data:`, error.response?.data);
    console.error(`   Request URL: ${error.config?.url}`);
    console.error(`   Request Params:`, error.config?.params);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 403:
          console.error('🚫 API Key issue - either invalid or rate limited');
          throw new Error('NASA API access forbidden. Please check your API key.');
        case 429:
          console.error('⏰ Rate limit exceeded');
          throw new Error('NASA API rate limit exceeded. Please try again later.');
        case 404:
          console.error('🔍 Resource not found');
          throw new Error('NASA API resource not found.');
        default:
          console.error(`❓ Unexpected HTTP status: ${status}`);
          throw new Error(data?.error?.message || `NASA API Error: ${error.message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏳ Request timeout');
      throw new Error('Request timeout. NASA API is taking too long to respond.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network connection issue');
      throw new Error('Unable to connect to NASA API. Please check your internet connection.');
    } else {
      console.error('💥 Unexpected error type:', error.code);
      throw new Error(`NASA API Error: ${error.message}`);
    }
  }
};

app.get('/api/test', async (req, res) => {
  try {
    console.log('🧪 Testing NASA API connectivity...');
    
    const data = await fetchFromNasa(`${NASA_BASE_URL}/rovers`);
    
    res.json({
      success: true,
      message: 'NASA API connectivity test successful',
      data: {
        rovers_count: data.rovers?.length || 0,
        rovers: data.rovers?.map(r => r.name) || []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ NASA API test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'NASA API connectivity test failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/rovers', async (req, res) => {
  try {
    console.log('🤖 Fetching rovers list...');
    const data = await fetchFromNasa(`${NASA_BASE_URL}/rovers`);
    
    console.log(`✅ Found ${data.rovers?.length || 0} rovers`);
    
    res.json({
      success: true,
      data: data.rovers || [],
      count: data.rovers?.length || 0,
      fetchTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching rovers:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'ROVERS_FETCH_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/rovers/:rover', async (req, res) => {
  try {
    const { rover } = req.params;
    console.log(`🤖 Fetching info for rover: ${rover}`);
    
    const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rover name. Valid options: ' + validRovers.join(', '),
        code: 'INVALID_ROVER'
      });
    }
    
    const data = await fetchFromNasa(`${NASA_BASE_URL}/rovers/${rover.toLowerCase()}`);
    
    res.json({
      success: true,
      data: data.rover,
      fetchTime: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ Error fetching rover ${req.params.rover}:`, error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: `Rover '${req.params.rover}' not found`,
        code: 'ROVER_NOT_FOUND',
        availableRovers: ['curiosity', 'opportunity', 'spirit', 'perseverance']
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'ROVER_INFO_ERROR'
    });
  }
});

app.get('/api/rovers/:rover/photos', async (req, res) => {
  try {
    const { rover } = req.params;
    const { 
      earth_date, 
      sol, 
      camera, 
      page = 1, 
      per_page = 25 
    } = req.query;

    console.log(`📸 Fetching photos for rover: ${rover}`);
    console.log(`📸 Query parameters:`, { earth_date, sol, camera, page, per_page });

    const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rover name. Valid options: ' + validRovers.join(', '),
        code: 'INVALID_ROVER'
      });
    }

    const params = {
      page: parseInt(page),
      per_page: Math.min(parseInt(per_page), 100)
    };

    if (earth_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(earth_date)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Please use YYYY-MM-DD format.',
          code: 'INVALID_DATE_FORMAT'
        });
      }
      params.earth_date = earth_date;
    } else if (sol) {
      const solNumber = parseInt(sol);
      
      if (isNaN(solNumber) || solNumber < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid sol value. Must be a non-negative integer.',
          code: 'INVALID_SOL'
        });
      }
      
      if (solNumber > 10000) {
        return res.status(400).json({
          success: false,
          error: 'Sol value too large. Please use a reasonable sol value.',
          code: 'SOL_TOO_LARGE'
        });
      }
      
      params.sol = solNumber;
    } else {
      if (rover.toLowerCase() === 'curiosity') {
        params.sol = 1000; 
      } else if (rover.toLowerCase() === 'perseverance') {
        params.sol = 100;
      } else {
        params.sol = 100; 
      }
      console.log(`📅 Using default sol: ${params.sol}`);
    }

    if (camera) {
      params.camera = camera.toLowerCase();
    }

    console.log(`📋 Final parameters:`, params);

    const data = await fetchFromNasa(
      `${NASA_BASE_URL}/rovers/${rover.toLowerCase()}/photos`,
      params
    );

    console.log(`✅ Found ${data.photos?.length || 0} photos for ${rover}`);

    const response = {
      success: true,
      data: {
        photos: (data.photos || []).map(photo => ({
          ...photo,
          full_name: photo.camera?.full_name || 'Unknown Camera',
          rover_name: photo.rover?.name || rover,
          rover_status: photo.rover?.status || 'unknown',
          img_src: photo.img_src?.replace(/^http:/, 'https:') || photo.img_src
        })),
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(per_page),
          total_photos: data.photos?.length || 0,
          has_more: data.photos?.length === parseInt(per_page)
        },
        filters: {
          rover: rover.toLowerCase(),
          earth_date: params.earth_date,
          sol: params.sol,
          camera: params.camera
        }
      },
      fetchTime: new Date().toISOString()
    };

    console.log(`📤 Sending response with ${response.data.photos.length} photos`);
    res.json(response);

  } catch (error) {
    console.error(`❌ Error fetching photos for ${req.params.rover}:`, error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'No photos found for the specified criteria',
        code: 'PHOTOS_NOT_FOUND',
        suggestion: 'Try different date, sol, or camera parameters'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'PHOTOS_FETCH_ERROR'
    });
  }
});

app.get('/api/rovers/:rover/cameras', async (req, res) => {
  try {
    const { rover } = req.params;
    console.log(`📷 Fetching cameras for rover: ${rover}`);
    
    const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
    if (!validRovers.includes(rover.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rover name. Valid options: ' + validRovers.join(', '),
        code: 'INVALID_ROVER'
      });
    }
    
    const data = await fetchFromNasa(`${NASA_BASE_URL}/rovers/${rover.toLowerCase()}`);
    
    res.json({
      success: true,
      data: {
        rover: rover.toLowerCase(),
        cameras: (data.rover?.cameras || []).map(camera => ({
          name: camera.name,
          full_name: camera.full_name
        }))
      },
      fetchTime: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ Error fetching cameras for ${req.params.rover}:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'CAMERAS_FETCH_ERROR'
    });
  }
});

app.get('/api/latest', async (req, res) => {
  try {
    console.log('📸 Fetching latest photos from active rovers...');
    const { per_rover = 10, rover: roverFilter } = req.query;
    
    let rovers = ['curiosity', 'perseverance'];
    if (roverFilter) {
      const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
      if (!validRovers.includes(roverFilter.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid rover name. Valid options: ' + validRovers.join(', '),
          code: 'INVALID_ROVER'
        });
      }
      rovers = [roverFilter.toLowerCase()];
    }
    
    const promises = rovers.map(async (rover) => {
      try {
        const data = await fetchFromNasa(
          `${NASA_BASE_URL}/rovers/${rover}/latest_photos`,
          { per_page: parseInt(per_rover) }
        );
        return {
          rover,
          photos: (data.latest_photos || []).map(photo => ({
            ...photo,
            img_src: photo.img_src?.replace(/^http:/, 'https:') || photo.img_src
          })),
          status: 'success'
        };
      } catch (error) {
        console.error(`❌ Error fetching latest photos for ${rover}:`, error.message);
        return {
          rover,
          photos: [],
          status: 'error',
          error: error.message
        };
      }
    });

    const results = await Promise.all(promises);
    
    console.log(`✅ Latest photos fetch completed`);
    
    res.json({
      success: true,
      data: results,
      totalPhotos: results.reduce((sum, result) => sum + result.photos.length, 0),
      fetchTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching latest photos:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'LATEST_PHOTOS_ERROR'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'Mars Rover Photos API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cache: {
      size: cache.size,
      maxSize: 100
    },
    nasa_api_key: NASA_API_KEY === 'DEMO_KEY' ? 'DEMO_KEY' : 'CONFIGURED',
    port: PORT
  });
});

app.delete('/api/cache', (req, res) => {
  const cacheSize = cache.size;
  cache.clear();
  res.json({
    success: true,
    message: 'Cache cleared successfully',
    clearedEntries: cacheSize,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Mars Rover Photos API',
    version: '2.1.0',
    description: 'Enhanced API for fetching Mars rover photos from NASA',
    nasa_api_key_status: NASA_API_KEY === 'DEMO_KEY' ? 'Using DEMO_KEY (limited requests)' : 'Custom key configured',
    base_url: `http://localhost:${PORT}`,
    endpoints: {
      'GET /api/test': 'Test NASA API connectivity',
      'GET /api/health': 'API health check',
      'GET /api/rovers': 'Get all available rovers',
      'GET /api/rovers/:rover': 'Get specific rover information',
      'GET /api/rovers/:rover/photos': 'Get rover photos with filtering',
      'GET /api/rovers/:rover/cameras': 'Get available cameras for a rover',
      'GET /api/latest': 'Get latest photos from active rovers',
      'DELETE /api/cache': 'Clear API cache'
    },
    parameters: {
      earth_date: 'YYYY-MM-DD format',
      sol: 'Martian sol (non-negative integer)',
      camera: 'Camera abbreviation (e.g., FHAZ, RHAZ, MAST)',
      page: 'Page number (default: 1)',
      per_page: 'Photos per page (max: 100, default: 25)',
      per_rover: 'Photos per rover for latest endpoint (default: 10)'
    },
    valid_rovers: ['curiosity', 'opportunity', 'spirit', 'perseverance'],
    sample_requests: {
      test_api: 'GET /api/test',
      rovers: 'GET /api/rovers',
      curiosity_photos: 'GET /api/rovers/curiosity/photos?sol=1000',
      perseverance_cameras: 'GET /api/rovers/perseverance/cameras',
      latest_photos: 'GET /api/latest?per_rover=5'
    }
  });
});

app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  console.log(`❓ 404 - Not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    requested: `${req.method} ${req.url}`,
    availableEndpoints: [
      'GET /api/test',
      'GET /api/health',
      'GET /api/docs',
      'GET /api/rovers',
      'GET /api/rovers/:rover',
      'GET /api/rovers/:rover/photos',
      'GET /api/rovers/:rover/cameras',
      'GET /api/latest',
      'DELETE /api/cache'
    ]
  });
});

module.exports = app;