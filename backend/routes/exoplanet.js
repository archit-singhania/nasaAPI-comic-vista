const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://exoplanetarchive.ipac.caltech.edu/TAP/sync', req.query);
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// placeholder code