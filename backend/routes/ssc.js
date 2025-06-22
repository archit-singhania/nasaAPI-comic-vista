const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/locations', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://sscweb.gsfc.nasa.gov/WS/sscr/2/locations', req.query);
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// placeholder code 