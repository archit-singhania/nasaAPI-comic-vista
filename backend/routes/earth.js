const express = require('express');
const { nasaService } = require('../services/nasaService');
const router = express.Router();

router.get('/imagery', async (req, res) => {
  try {
    const { lat, lon, dim = '0.15', date } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon are required' 
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        error: 'Invalid latitude: must be between -90 and 90' 
      });
    }
    
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Invalid longitude: must be between -180 and 180' 
      });
    }
    
    const queryParams = {
      lat: latitude,
      lon: longitude,
      dim: parseFloat(dim) || 0.15
    };
    
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(date)) {
        queryParams.date = date;
      }
    }
    
    console.log('Fetching Earth imagery with params:', queryParams);
    
    try {
      const data = await nasaService.getEarthImagery(queryParams);
      return res.json(data);
    } catch (nasaError) {
      console.log('NASA API failed, trying fallback services...');
      
      const fallbackServices = [
        {
          name: 'Mapbox Satellite',
          url: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${longitude},${latitude},14,0/400x400?access_token=${process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'}`,
          requiresAuth: !!process.env.MAPBOX_TOKEN
        },
        {
          name: 'Esri World Imagery',
          url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&size=400,400&format=png&f=image`,
          requiresAuth: false
        },
        {
          name: 'OpenStreetMap Satellite (Esri)',
          url: `https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/14/${Math.floor((1 - Math.log(Math.tan(latitude * Math.PI/180) + 1/Math.cos(latitude * Math.PI/180))/Math.PI)/2 * Math.pow(2,14))}/${Math.floor((longitude + 180)/360 * Math.pow(2,14))}`,
          requiresAuth: false
        }
      ];
      
      for (const service of fallbackServices) {
        try {
          if (service.requiresAuth && !process.env.MAPBOX_TOKEN) {
            continue; 
          }
          
          const axios = require('axios');
          const testResponse = await axios.head(service.url, { 
            timeout: 10000,
            validateStatus: (status) => status < 500 
          });
          
          if (testResponse.status < 400) {
            return res.json({
              url: service.url,
              service: service.name,
              date: date || 'Latest available',
              coordinates: { latitude, longitude },
              dimension: dim,
              fallback: true,
              message: 'NASA API unavailable, using fallback service'
            });
          }
        } catch (serviceError) {
          console.log(`${service.name} failed:`, serviceError.message);
          continue;
        }
      }
      
      return res.json({
        url: `https://via.placeholder.com/400x400/4A90E2/FFFFFF?text=Satellite+Image+Unavailable+for+${latitude.toFixed(2)},${longitude.toFixed(2)}`,
        service: 'Placeholder',
        date: date || 'N/A',
        coordinates: { latitude, longitude },
        dimension: dim,
        fallback: true,
        error: 'All imagery services are currently unavailable',
        message: 'NASA API and all fallback services are unavailable. Please try again later.'
      });
    }
    
  } catch (err) {
    console.error('Error in imagery endpoint:', err);
    res.status(500).json({ 
      error: 'Failed to fetch satellite imagery',
      details: err.message 
    });
  }
});

router.get('/assets', async (req, res) => {
  try {
    const { lat, lon, dim = '0.15', date } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon are required' 
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        error: 'Invalid latitude: must be between -90 and 90' 
      });
    }
    
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Invalid longitude: must be between -180 and 180' 
      });
    }
    
    const queryParams = {
      lat: latitude,
      lon: longitude,
      dim: parseFloat(dim) || 0.15
    };
    
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(date)) {
        queryParams.date = date;
      }
    }
    
    console.log('Fetching Earth assets with params:', queryParams);
    
    const data = await nasaService.getEarthAssets(queryParams);
    
    res.json(data);
    
  } catch (err) {
    console.error('Error fetching Earth assets:', err);
    
    if (err.response) {
      return res.status(err.response.status).json({ 
        error: 'NASA API error',
        details: err.response.data || err.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch Earth assets',
      details: err.message 
    });
  }
});

router.get('/dates', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon are required' 
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        error: 'Invalid latitude: must be between -90 and 90' 
      });
    }
    
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Invalid longitude: must be between -180 and 180' 
      });
    }
    
    const queryParams = {
      lat: latitude,
      lon: longitude
    };
    
    console.log('Fetching available dates with params:', queryParams);
    
    const data = await nasaService.getEarthDates(queryParams);
    
    res.json(data);
    
  } catch (err) {
    console.error('Error fetching available dates:', err);
    
    if (err.response) {
      return res.status(err.response.status).json({ 
        error: 'NASA API error',
        details: err.response.data || err.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch available dates',
      details: err.message 
    });
  }
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Earth Imagery API',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /imagery - Get satellite imagery for coordinates',
      'GET /assets - Get available assets for coordinates', 
      'GET /dates - Get available dates for coordinates'
    ]
  });
});

router.get('/imagery-fallback', async (req, res) => {
  try {
    const { lat, lon, dim = '0.15' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat and lon are required' 
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    const fallbackServices = [
      {
        name: 'NASA Earth Imagery',
        url: `https://api.nasa.gov/planetary/earth/imagery?lat=${latitude}&lon=${longitude}&dim=${dim}&api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`
      },
      {
        name: 'Mapbox Satellite',
        url: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${longitude},${latitude},14,0/400x400?access_token=${process.env.MAPBOX_TOKEN}`
      },
      {
        name: 'Esri World Imagery',
        url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&size=400,400&format=png&f=image`
      }
    ];
    
    for (const service of fallbackServices) {
      try {
        const axios = require('axios');
        const testResponse = await axios.head(service.url, { timeout: 5000 });
        
        if (testResponse.status === 200) {
          return res.json({
            url: service.url,
            service: service.name,
            date: 'Latest available',
            coordinates: { latitude, longitude },
            dimension: dim
          });
        }
      } catch (error) {
        console.log(`${service.name} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All imagery services failed');
    
  } catch (err) {
    console.error('All fallback services failed:', err);
    res.status(404).json({ 
      error: 'No satellite imagery available for this location from any service',
      details: err.message 
    });
  }
});

module.exports = router;