const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');

const router = express.Router();

const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; 
const MAX_CACHE_SIZE = 100;

function validateDate(dateString) {
  if (!dateString) return { valid: true };

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return {
      valid: false,
      error: 'Invalid date format. Please use YYYY-MM-DD format.',
      example: '2023-12-25'
    };
  }

  const date = new Date(dateString);
  const minDate = new Date('1995-06-16');
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateString) {
    return {
      valid: false,
      error: 'Invalid date format. Please use YYYY-MM-DD format.',
      example: '2023-12-25'
    };
  }

  if (date < minDate || date > today) {
    return {
      valid: false,
      error: 'Date out of range. APOD is available from June 16, 1995 to present.',
      minDate: '1995-06-16'
    };
  }

  return { valid: true };
}

function ensureHttps(url) {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
}

function createCacheKey(params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return sortedParams || 'default';
}

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expiry) {
      cache.delete(key);
    }
  }
}

router.get('/', async (req, res) => {
  try {
    const { date, hd } = req.query;

    const dateValidation = validateDate(date);
    if (!dateValidation.valid) {
      return res.status(400).json(dateValidation);
    }

    let hdParam = true; 
    if (hd !== undefined) {
      hdParam = hd === 'true' || hd === true;
    }

    const nasaParams = { hd: hdParam };
    if (date) {
      nasaParams.date = date;
    }

    const cacheKey = createCacheKey(nasaParams);

    if (cache.size > 0 && Math.random() < 0.1) {
      cleanExpiredCache();
    }

    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() < cachedData.expiry) {
      return res.json({
        ...cachedData.data,
        cached: true,
        cacheTime: cachedData.timestamp
      });
    }

    const nasaData = await fetchFromNasa('https://api.nasa.gov/planetary/apod', nasaParams);

    if (!nasaData || typeof nasaData !== 'object') {
      return res.status(500).json({
        error: 'Internal server error',
        details: 'Invalid response from NASA API'
      });
    }

    if (!nasaData.title || !nasaData.date || !nasaData.explanation || !nasaData.url) {
      return res.status(500).json({
        error: 'Internal server error',
        details: 'Missing required fields in NASA response'
      });
    }

    const responseData = {
      title: nasaData.title,
      explanation: nasaData.explanation,
      date: nasaData.date,
      url: ensureHttps(nasaData.url),
      mediaType: nasaData.media_type || 'image', 
      service: 'NASA APOD API',
      fetchTime: new Date().toISOString()
    };

    if (nasaData.hdurl) {
      responseData.hdurl = ensureHttps(nasaData.hdurl);
    }
    if (nasaData.copyright) {
      responseData.copyright = nasaData.copyright;
    }
    if (nasaData.service_version) {
      responseData.serviceVersion = nasaData.service_version;
    }
    if (nasaData.media_type === 'video' && nasaData.thumbnail_url) {
      responseData.thumbnailUrl = ensureHttps(nasaData.thumbnail_url);
    }

    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(cacheKey, {
      data: responseData,
      timestamp: new Date().toISOString(),
      expiry: Date.now() + CACHE_TTL
    });

    res.json(responseData);

  } catch (error) {
    console.error('APOD API Error:', error);

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return res.status(400).json({
            error: 'Bad request to NASA API',
            details: data?.error || 'Invalid request parameter',
            suggestion: 'Please check your date parameter format (YYYY-MM-DD)'
          });
        
        case 403:
          return res.status(503).json({
            error: 'NASA API access forbidden',
            details: 'API key may be invalid or rate limit exceeded'
          });
        
        case 404:
          return res.status(404).json({
            error: 'No APOD data available',
            details: data?.error || 'No picture available for this date',
            suggestion: 'Try a different date'
          });
        
        case 429:
          return res.status(429).json({
            error: 'Rate limit exceeded',
            details: 'Too many requests to NASA API'
          });
        
        case 500:
        default:
          return res.status(503).json({
            error: 'NASA API service unavailable',
            details: 'The NASA API is currently experiencing issues'
          });
      }
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Unable to connect to NASA API',
        details: error.code === 'ENOTFOUND' ? 'Network connection error' : 'Connection refused'
      });
    }

    if (error.message && error.message.includes('empty')) {
      return res.status(500).json({
        error: 'Internal server error',
        details: 'Empty response from NASA API'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred'
    });
  }
});

router.get('/health', (req, res) => {
  cleanExpiredCache();
  
  res.json({
    status: 'healthy',
    service: 'APOD API',
    timestamp: new Date().toISOString(),
    cache: {
      size: cache.size,
      maxSize: MAX_CACHE_SIZE
    }
  });
});

router.delete('/cache', (req, res) => {
  const clearedEntries = cache.size;
  cache.clear();
  
  res.json({
    message: 'Cache cleared successfully',
    clearedEntries,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;