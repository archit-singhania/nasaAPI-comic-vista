const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://data.nasa.gov/resource/gh4g-9sfh.json', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// placeholder code 