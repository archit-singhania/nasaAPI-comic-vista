const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/natural', async (req, res) => {
  try {
    console.log('🔍 EPIC Natural API called');
    console.log('Query params:', req.query);
    const data = await fetchFromNasa('https://api.nasa.gov/EPIC/api/natural/images', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/natural/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    const data = await fetchFromNasa(`https://api.nasa.gov/EPIC/api/natural/date/${date}`, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/natural/available', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://api.nasa.gov/EPIC/api/natural/available', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/natural/all', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://api.nasa.gov/EPIC/api/natural/all', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/enhanced', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://api.nasa.gov/EPIC/api/enhanced/images', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/enhanced/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    const data = await fetchFromNasa(`https://api.nasa.gov/EPIC/api/enhanced/date/${date}`, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/enhanced/available', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://api.nasa.gov/EPIC/api/enhanced/available', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/enhanced/all', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://api.nasa.gov/EPIC/api/enhanced/all', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/image-url/:type/:date/:format/:imageName', (req, res) => {
  try {
    const { type, date, format, imageName } = req.params;
    const { api_key } = req.query;
    
    if (!['natural', 'enhanced'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "natural" or "enhanced"' });
    }
    
    if (!['png', 'jpg'].includes(format)) {
      return res.status(400).json({ error: 'Format must be "png" or "jpg"' });
    }
    
    const archiveDate = date.replace(/-/g, '/');
    const imageUrl = `https://api.nasa.gov/EPIC/archive/${type}/${archiveDate}/${format}/${imageName}.${format}${api_key ? `?api_key=${api_key}` : ''}`;
    
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;