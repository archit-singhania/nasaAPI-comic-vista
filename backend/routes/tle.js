const express = require('express');
const fetch = require('node-fetch');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://tle.ivanstanojevic.me/api/tle', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/satellite/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid satellite ID. Must be a number.' });
    }
    
    const data = await fetchFromNasa(`https://tle.ivanstanojevic.me/api/tle/${id}`, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Satellite name is required' });
    }
    
    const data = await fetchFromNasa(`https://tle.ivanstanojevic.me/api/tle?search=${encodeURIComponent(name.trim())}`, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const validCategories = [
      'stations', 'visual', 'active-geosynchronous', 'analyst', 'weather', 
      'noaa', 'goes', 'resource', 'cubesat', 'other'
    ];
    
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({ 
        error: `Invalid category. Valid categories: ${validCategories.join(', ')}` 
      });
    }
    
    const data = await fetchFromNasa(`https://tle.ivanstanojevic.me/api/tle?category=${category}`, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/satellites/:ids', async (req, res) => {
  try {
    const { ids } = req.params;
    
    const idArray = ids.split(',').map(id => id.trim());
    const invalidIds = idArray.filter(id => isNaN(id) || id === '');
    
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        error: `Invalid satellite IDs: ${invalidIds.join(', ')}. All IDs must be numbers.` 
      });
    }
    
    if (idArray.length > 100) {
      return res.status(400).json({ 
        error: 'Too many satellite IDs. Maximum 100 satellites per request.' 
      });
    }
    
    const data = await fetchFromNasa(`https://tle.ivanstanojevic.me/api/tle/${ids}`, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/page/:page', async (req, res) => {
  try {
    const { page } = req.params;
    
    const pageNum = parseInt(page);
    if (!page || isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ 
        error: 'Invalid page number. Must be a positive integer.',
        received: page 
      });
    }
    
    const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 50;
    if (req.query.page_size && (isNaN(pageSize) || pageSize < 1 || pageSize > 1000)) {
      return res.status(400).json({ 
        error: 'Invalid page_size. Must be between 1 and 1000.',
        received: req.query.page_size 
      });
    }
    
    const queryParams = {
      page: pageNum,
      page_size: pageSize,
      ...req.query
    };
    
    if (req.query.page_size) {
      delete queryParams.page_size;
      queryParams.page_size = pageSize;
    }
    
    const data = await fetchFromNasa('https://tle.ivanstanojevic.me/api/tle', queryParams);
    
    res.json({
      ...data,
      pagination: {
        current_page: pageNum,
        page_size: pageSize,
        requested_at: new Date().toISOString()
      }
    });
    
  } catch (err) {
    console.error('TLE Pagination Error:', {
      message: err.message,
      page: req.params.page,
      query: req.query,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch paginated TLE data',
      details: err.message,
      page: req.params.page
    });
  }
});

router.get('/paginated', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 50;
    
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ 
        error: 'Invalid page number. Must be a positive integer.',
        received: req.query.page 
      });
    }
    
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 1000) {
      return res.status(400).json({ 
        error: 'Invalid page_size. Must be between 1 and 1000.',
        received: req.query.page_size 
      });
    }
    
    const queryParams = {
      page,
      page_size: pageSize,
      ...req.query
    };
    
    const data = await fetchFromNasa('https://tle.ivanstanojevic.me/api/tle', queryParams);
    res.json(data);
    
  } catch (err) {
    console.error('TLE Paginated Error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch paginated TLE data',
      details: err.message
    });
  }
});

router.get('/debug/external', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10; 
    
    const testUrl = `https://tle.ivanstanojevic.me/api/tle?page=${page}&page_size=${pageSize}`;
    
    const response = await fetch(testUrl);
    const responseText = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'External API returned non-JSON response',
        status: response.status,
        responseStart: responseText.substring(0, 500),
        parseError: parseErr.message
      });
    }
    
    res.json({
      success: true,
      externalApiStatus: response.status,
      data: parsedData
    });
    
  } catch (err) {
    console.error('Debug route error:', err);
    res.status(500).json({
      error: 'Debug request failed',
      details: err.message
    });
  }
});

router.get('/debug/external/:page', async (req, res) => {
  try {
    const page = req.params.page ? parseInt(req.params.page) : 1;
    const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
    
    const testUrl = `https://tle.ivanstanojevic.me/api/tle?page=${page}&page_size=${pageSize}`;
  
    const response = await fetch(testUrl);
    const responseText = await response.text();

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'External API returned non-JSON response',
        status: response.status,
        responseStart: responseText.substring(0, 500),
        parseError: parseErr.message
      });
    }
    
    res.json({
      success: true,
      externalApiStatus: response.status,
      data: parsedData
    });
    
  } catch (err) {
    console.error('Debug route error:', err);
    res.status(500).json({
      error: 'Debug request failed',
      details: err.message
    });
  }
});

router.get('/format/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid satellite ID for TLE format' });
    }
    
    const data = await fetchFromNasa(`https://tle.ivanstanojevic.me/api/tle/${id}?format=text`, req.query);
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/celestrak/:group', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://tle.ivanstanojevic.me/api/tle?stats=true', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/celestrak/:group', async (req, res) => {
  const { group } = req.params;

  const validGroups = [
    'stations', 'visual', 'active-geosynchronous', 'analyst',
    'weather', 'noaa', 'goes', 'resource', 'cubesat'
  ];

  if (!validGroups.includes(group)) {
    return res.status(400).json({ error: `Invalid CelesTrak group: ${group}` });
  }

  try {
    const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NASA-Cosmic-Vista/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `CelesTrak fetch failed: ${response.statusText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `CelesTrak proxy error: ${err.message}` });
  }
});

module.exports = router;