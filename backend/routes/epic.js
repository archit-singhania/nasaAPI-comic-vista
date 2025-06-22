const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/natural', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://api.nasa.gov/EPIC/api/natural', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// placeholder code