const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:body/:layer/:z/:x/:y', async (req, res) => {
  const { body, layer, z, x, y } = req.params;
  const format = req.query.format || 'png'; 

  const url = `https://trek.nasa.gov/tiles/${body}/EQ/${layer}/${z}/${x}/${y}.${format}`;

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    res.set('Content-Type', `image/${format}`);
    res.send(response.data);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch WMTS tile: ${err.message}` });
  }
});

module.exports = router;
// p;aceholder code