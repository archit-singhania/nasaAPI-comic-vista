const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/projects', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://api.nasa.gov/techport/api/projects', req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// placeholder code 