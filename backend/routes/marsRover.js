const express = require('express');
const router = express.Router();
const serviceModule = require('../services/nasaService');

const nasaService = serviceModule.nasaService || serviceModule.NasaService || serviceModule;

router.get('/photos', async (req, res) => {
  try {
    const { rover = 'curiosity', sol, earth_date, camera, page = 1 } = req.query;
    
    if (!sol && !earth_date) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either sol or earth_date'
      });
    }

    const service = typeof nasaService === 'function' ? new nasaService() : nasaService;
    
    if (typeof service.getPhotos !== 'function') {
      console.error('❌ getPhotos method not found. Available methods:', Object.keys(service));
      throw new Error('getPhotos method is not available');
    }

    const photos = await service.getPhotos({
      rover,
      sol,
      earth_date,
      camera,
      page: parseInt(page),
      per_page: 24
    });

    return res.json({ success: true, data: { photos } });
  } catch (err) {
    console.error('❌ Error in photos endpoint:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const service = typeof nasaService === 'function' ? new nasaService() : nasaService;
    
    if (typeof service.getRovers !== 'function') {
      console.error('❌ getRovers method not found. Available methods:', Object.keys(service));
      throw new Error('getRovers method is not available');
    }

    const roversData = await service.getRovers();
    
    const response = {
      success: true,
      data: roversData
    };
    
    return res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:rover/cameras', async (req, res) => {
  try {
    const { rover } = req.params;
    
    const service = typeof nasaService === 'function' ? new nasaService() : nasaService;
    
    if (typeof service.getCameras !== 'function') {
      console.error('❌ getCameras method not found. Available methods:', Object.keys(service));
      throw new Error('getCameras method is not available');
    }

    const cameras = await service.getCameras(rover);
    
    const response = {
      success: true,
      data: {
        cameras: cameras.map(name => ({ name, full_name: name }))
      }
    };
    
    return res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;