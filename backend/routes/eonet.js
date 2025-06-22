const express = require('express');
const { nasaService } = require('../services/nasaService');
const router = express.Router();

router.get('/events', async (req, res) => {
  try {
    const { 
      status = 'all', 
      limit = 100, 
      days = 20,
      source,
      category 
    } = req.query;
    
    const queryParams = new URLSearchParams();
    
    if (status !== 'all') {
      queryParams.append('status', status);
    }
    
    if (limit && !isNaN(parseInt(limit))) {
      queryParams.append('limit', Math.min(parseInt(limit), 500)); 
    }
    
    if (days && !isNaN(parseInt(days))) {
      queryParams.append('days', Math.min(parseInt(days), 365)); 
    }
    
    if (source) {
      queryParams.append('source', source);
    }
    
    if (category && category.trim() !== '' && category !== 'all' && category !== 'undefined') {
      queryParams.append('category', category.trim());
    }
    
    console.log('Fetching EONET events with params:', Object.fromEntries(queryParams));
    
    const data = await nasaService.getEonetEvents(queryParams);
    
    const processedData = {
      ...data,
      events: data.events ? data.events.map(event => ({
        ...event,
        latestGeometry: event.geometry && event.geometry.length > 0 
          ? event.geometry[event.geometry.length - 1] 
          : null,
        totalGeometries: event.geometry ? event.geometry.length : 0,
        isActive: event.closed === null,
        duration: event.closed 
          ? new Date(event.closed) - new Date(event.date)
          : Date.now() - new Date(event.date),
        formattedDate: new Date(event.date).toLocaleDateString(),
        formattedClosed: event.closed ? new Date(event.closed).toLocaleDateString() : null,
        coordinates: event.geometry && event.geometry.length > 0 
          ? event.geometry.map(geo => ({
              type: geo.type,
              coordinates: geo.coordinates,
              date: geo.date
            })) 
          : []
      })) : []
    };
    
    res.json(processedData);
    
  } catch (err) {
    console.error('Error fetching EONET events:', err);
    
    if (err.response) {
      return res.status(err.response.status).json({ 
        error: 'NASA EONET API error',
        details: err.response.data || err.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch natural events',
      details: err.message 
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    console.log('Fetching EONET categories');
    
    const data = await nasaService.getEonetCategories();
    
    const response = {
      categories: data.categories || data || [],
      title: data.title || 'EONET Categories',
      description: data.description || 'Available event categories'
    };
    
    res.json(response);
    
  } catch (err) {
    console.error('Error fetching EONET categories:', err);
    
    if (err.response) {
      return res.status(err.response.status).json({ 
        error: 'NASA EONET API error',
        details: err.response.data || err.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch event categories',
      details: err.message 
    });
  }
});

router.get('/sources', async (req, res) => {
  try {
    console.log('Fetching EONET sources');
    
    const data = await nasaService.getEonetSources();
    
    const response = {
      sources: data.sources || data || [],
      title: data.title || 'EONET Sources',
      description: data.description || 'Available data sources'
    };

    res.json(response);
    
  } catch (err) {
    console.error('Error fetching EONET sources:', err);
    
    if (err.response) {
      return res.status(err.response.status).json({ 
        error: 'NASA EONET API error',
        details: err.response.data || err.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch event sources',
      details: err.message 
    });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        error: 'Event ID is required' 
      });
    }
    
    console.log('Fetching EONET event:', id);
    
    const data = await nasaService.getEonetEvent(id);
    
    const processedEvent = {
      ...data,
      latestGeometry: data.geometry && data.geometry.length > 0 
        ? data.geometry[data.geometry.length - 1] 
        : null,
      totalGeometries: data.geometry ? data.geometry.length : 0,
      isActive: data.closed === null,
      duration: data.closed 
        ? new Date(data.closed) - new Date(data.date)
        : Date.now() - new Date(data.date),
      formattedDate: new Date(data.date).toLocaleDateString(),
      formattedClosed: data.closed ? new Date(data.closed).toLocaleDateString() : null,
      geometryTimeline: data.geometry ? data.geometry.map((geo, index) => ({
        ...geo,
        index,
        formattedDate: geo.date ? new Date(geo.date).toLocaleDateString() : 'Unknown'
      })) : [],
      coordinates: data.geometry && data.geometry.length > 0 
        ? data.geometry.map(geo => ({
            type: geo.type,
            coordinates: geo.coordinates,
            date: geo.date
          })) 
        : []
    };
    
    res.json(processedEvent);
    
  } catch (err) {
    console.error('Error fetching EONET event:', err);
    
    if (err.response) {
      if (err.response.status === 404) {
        return res.status(404).json({ 
          error: 'Event not found',
          details: `No event found with ID: ${req.params.id}`
        });
      }
      return res.status(err.response.status).json({ 
        error: 'NASA EONET API error',
        details: err.response.data || err.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch event details',
      details: err.message 
    });
  }
});

router.get('/categories/:categoryId/events', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { 
      status = 'all', 
      limit = 100, 
      days = 20 
    } = req.query;
    
    if (!categoryId) {
      return res.status(400).json({ 
        error: 'Category ID is required' 
      });
    }
    
    const queryParams = new URLSearchParams();
    
    const categoryValue = isNaN(parseInt(categoryId)) ? categoryId : parseInt(categoryId);
    queryParams.append('category', categoryValue);
    
    if (status !== 'all') {
      queryParams.append('status', status);
    }
    
    if (limit && !isNaN(parseInt(limit))) {
      queryParams.append('limit', Math.min(parseInt(limit), 500));
    }
    
    if (days && !isNaN(parseInt(days))) {
      queryParams.append('days', Math.min(parseInt(days), 365));
    }
    
    console.log('Fetching EONET events for category:', categoryId, 'with params:', Object.fromEntries(queryParams));
    
    const data = await nasaService.getEonetEvents(queryParams);
    
    const processedData = {
      ...data,
      events: data.events ? data.events.map(event => ({
        ...event,
        latestGeometry: event.geometry && event.geometry.length > 0 
          ? event.geometry[event.geometry.length - 1] 
          : null,
        coordinates: event.geometry && event.geometry.length > 0 
          ? event.geometry.map(geo => ({
              type: geo.type,
              coordinates: geo.coordinates,
              date: geo.date
            })) 
          : []
      })) : []
    };
    
    res.json(processedData);
    
  } catch (err) {
    console.error('Error fetching EONET events by category:', err);
    
    if (err.response) {
      return res.status(err.response.status).json({ 
        error: 'NASA EONET API error',
        details: err.response.data || err.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch events by category',
      details: err.message 
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { days = 30, category, status = 'all' } = req.query;
    
    console.log('Generating EONET statistics for past', days, 'days');
    
    const queryParams = new URLSearchParams();
    queryParams.append('days', Math.min(parseInt(days), 365));
    queryParams.append('limit', 500);
    
    if (status !== 'all') {
      queryParams.append('status', status);
    }
    if (category && category !== '' && category !== 'all') {
      const categoryValue = isNaN(parseInt(category)) ? category : parseInt(category);
      queryParams.append('category', categoryValue);
    }
    
    const data = await nasaService.getEonetEvents(queryParams);
    const events = data.events || [];
    
    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.closed === null).length,
      closedEvents: events.filter(e => e.closed !== null).length,
      categoriesCount: {},
      sourcesCount: {},
      timeRange: {
        from: days + ' days ago',
        to: 'now'
      },
      lastUpdated: new Date().toISOString()
    };
    
    events.forEach(event => {
      if (event.categories && Array.isArray(event.categories)) {
        event.categories.forEach(cat => {
          const categoryTitle = cat.title || 'Unknown';
          stats.categoriesCount[categoryTitle] = (stats.categoriesCount[categoryTitle] || 0) + 1;
        });
      }
    });
    
    events.forEach(event => {
      if (event.sources && Array.isArray(event.sources)) {
        event.sources.forEach(source => {
          const sourceId = source.id || 'Unknown';
          stats.sourcesCount[sourceId] = (stats.sourcesCount[sourceId] || 0) + 1;
        });
      }
    });
    
    res.json(stats);
    
  } catch (err) {
    console.error('Error generating EONET statistics:', err);
    
    res.status(500).json({ 
      error: 'Failed to generate statistics',
      details: err.message 
    });
  }
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'NASA EONET Natural Events API',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /events - Get natural events with optional filters',
      'GET /events/:id - Get specific event details',
      'GET /categories - Get available event categories',
      'GET /sources - Get available data sources',
      'GET /categories/:categoryId/events - Get events by category',
      'GET /stats - Get events statistics'
    ]
  });
});

module.exports = router;