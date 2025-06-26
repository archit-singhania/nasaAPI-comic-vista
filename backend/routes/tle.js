const express = require('express');
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
    
    if (!page || isNaN(page) || parseInt(page) < 1) {
      return res.status(400).json({ error: 'Invalid page number. Must be a positive integer.' });
    }
    
    const pageSize = req.query.page_size || 50;
    if (isNaN(pageSize) || parseInt(pageSize) < 1 || parseInt(pageSize) > 1000) {
      return res.status(400).json({ error: 'Invalid page_size. Must be between 1 and 1000.' });
    }
    
    const queryParams = {
      ...req.query,
      page: page,
      page_size: pageSize
    };
    
    const data = await fetchFromNasa('https://tle.ivanstanojevic.me/api/tle', queryParams);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

router.get('/stats', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://tle.ivanstanojevic.me/api/tle?stats=true', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;