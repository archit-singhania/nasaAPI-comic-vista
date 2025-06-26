const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

const validEventTypes = [
  'notifications',
  'FLR',     
  'SEP',     
  'CME',     
  'IPS',     
  'MPC',     
  'GST',    
  'RBE'      
];

const buildDonkiUrl = (eventType, queryParams = {}) => {
  const baseUrl = 'https://api.nasa.gov/DONKI';
  
  if (eventType === 'notifications') {
    return `${baseUrl}/notifications`;
  }
  
  return `${baseUrl}/${eventType}`;
};

const validateDateParams = (startDate, endDate) => {
  const errors = [];
  
  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push('Invalid startDate format. Use YYYY-MM-DD');
    }
  }
  
  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push('Invalid endDate format. Use YYYY-MM-DD');
    }
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      errors.push('startDate cannot be after endDate');
    }
  }
  
  return errors;
};

router.get('/:eventType', async (req, res) => {
  try {
    const { eventType } = req.params;
    
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        error: 'Invalid event type',
        validTypes: validEventTypes,
        message: `Event type '${eventType}' is not supported`
      });
    }
    
    const {
      startDate,
      endDate,
      catalog = 'ALL',
      ...otherParams
    } = req.query;
    
    const dateErrors = validateDateParams(startDate, endDate);
    if (dateErrors.length > 0) {
      return res.status(400).json({
        error: 'Invalid date parameters',
        details: dateErrors
      });
    }
    
    const url = buildDonkiUrl(eventType);
    const queryParams = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      catalog,
      ...otherParams
    };
   
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });
    
    const response = await fetchFromNasa(url, queryParams);
    const data = response.data || response; 
    
    let transformedData = data;
    
    if (eventType === 'notifications' && Array.isArray(data)) {
      transformedData = data.map(event => ({
        ...event,
        eventType: 'notification',
        timestamp: event.messageIssueTime
      }));
    }
    
    if (eventType !== 'notifications' && Array.isArray(data)) {
      transformedData = data.map(event => ({
        ...event,
        eventType: eventType.toUpperCase(), 
        timestamp: event.beginTime || event.eventTime || event.peakTime
      }));
    }
    
    res.json({
      success: true,
      eventType,
      count: Array.isArray(transformedData) ? transformedData.length : 0,
      data: transformedData,
      queryParams: queryParams
    });
    
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const message = err.response.data?.error_message || err.message;
      
      if (status === 404) {
        return res.status(404).json({
          error: 'No events found',
          message: 'No space weather events found for the specified parameters'
        });
      }
      
      if (status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        });
      }
      
      return res.status(status).json({
        error: 'NASA API Error',
        message: message
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      eventType: req.params.eventType
    });
  }
});

router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'DONKI API endpoints',
      eventTypes: validEventTypes.map(type => ({
        type,
        endpoint: `/donki/${type}`,
        description: getEventTypeDescription(type)
      })),
      usage: {
        parameters: {
          startDate: 'YYYY-MM-DD format (optional)',
          endDate: 'YYYY-MM-DD format (optional)',
          catalog: 'ALL, SWRC_CATALOG, JANG_ET_AL_CATALOG (default: ALL)'
        },
        example: '/donki/FLR?startDate=2024-01-01&endDate=2024-01-31'
      }
    });
  } catch (err) {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
});

function getEventTypeDescription(eventType) {
  const descriptions = {
    notifications: 'All space weather notifications and alerts',
    FLR: 'Solar Flares - Intense bursts of radiation from the Sun',
    SEP: 'Solar Energetic Particles - High-energy particles from solar events',
    CME: 'Coronal Mass Ejections - Large expulsions of plasma from the Sun',
    IPS: 'Interplanetary Shocks - Shock waves traveling through space',
    MPC: 'Magnetopause Crossings - Boundary interactions with Earth\'s magnetosphere',
    GST: 'Geomagnetic Storms - Disturbances in Earth\'s magnetic field',
    RBE: 'Radiation Belt Enhancements - Increases in trapped radiation around Earth'
  };
  
  return descriptions[eventType] || 'Space weather event';
}

module.exports = router;