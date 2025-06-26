const express = require('express');
const { nasaService } = require('../services/nasaService');
const router = express.Router();

const handleTechTransferError = (res, error, endpoint) => {
  console.error(`❌ Tech Transfer ${endpoint} Error:`, error.message);

  if (error.message.includes('experiencing issues') || error.message.includes('500')) {
    return res.status(503).json({
      success: false,
      error: 'NASA Tech Transfer API Unavailable',
      message: 'The NASA Tech Transfer API is currently experiencing server issues (HTTP 500).',
      endpoint: endpoint,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.message.includes('timeout')) {
    return res.status(504).json({
      success: false,
      error: 'Request Timeout',
      message: 'The request took too long to complete.',
      endpoint: endpoint,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.message.includes('rate limit')) {
    return res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please wait before trying again.',
      endpoint: endpoint,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.message.includes('404')) {
    return res.status(404).json({
      success: false,
      error: 'Endpoint Not Found',
      message: 'The requested tech transfer endpoint is not available.',
      endpoint: endpoint,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Unable to connect to NASA services. Please try again later.',
      endpoint: endpoint,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(500).json({
    success: false,
    error: 'API Error',
    message: error.message,
    endpoint: endpoint,
    timestamp: new Date().toISOString(),
  });
};

const formatResponse = (data, category = null, searchTerm = null) => {
  let results = [];
  
  if (data?.results) {
    results = data.results;
  } else if (data?.data?.results) {
    results = data.data.results;
  } else if (data?.data) {
    results = data.data;
  } else if (Array.isArray(data)) {
    results = data;
  }

  return {
    success: true,
    results: Array.isArray(results) ? results : [],
    count: Array.isArray(results) ? results.length : 0,
    ...(category && { category }),
    ...(searchTerm && { searchTerm }),
    timestamp: new Date().toISOString(),
  };
};

router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Tech Transfer API router is available',
    timestamp: new Date().toISOString(),
  });
});

router.get('/patents', async (req, res) => {
  try {
    console.log('🔍 Fetching patents with params:', req.query);
    const data = await nasaService.getTechTransferPatents(req.query);
    const formattedResponse = formatResponse(data, 'patents', req.query.search);
    res.json(formattedResponse);
  } catch (error) {
    handleTechTransferError(res, error, 'Patents');
  }
});

router.get('/patents/issued', async (req, res) => {
  try {
    console.log('🔍 Fetching patents by issued date with params:', req.query);
    const data = await nasaService.getTechTransferPatentsByIssued(req.query);
    const formattedResponse = formatResponse(data, 'patents-issued', req.query.search);
    res.json(formattedResponse);
  } catch (error) {
    handleTechTransferError(res, error, 'Patents by Issued Date');
  }
});

router.get('/software', async (req, res) => {
  try {
    console.log('🔍 Fetching software with params:', req.query);
    const data = await nasaService.getTechTransferSoftware(req.query);
    const formattedResponse = formatResponse(data, 'software', req.query.search);
    res.json(formattedResponse);
  } catch (error) {
    handleTechTransferError(res, error, 'Software');
  }
});

router.get('/spinoffs', async (req, res) => {
  try {
    console.log('🔍 Fetching spinoffs with params:', req.query);
    const data = await nasaService.getTechTransferSpinoffs(req.query);
    const formattedResponse = formatResponse(data, 'spinoffs', req.query.search);
    res.json(formattedResponse);
  } catch (error) {
    handleTechTransferError(res, error, 'Spinoffs');
  }
});

router.get('/search', async (req, res) => {
  try {
    const { search, category = 'patents', ...params } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing Search Parameter',
        message: 'Search query is required and cannot be empty',
        example: '/api/techtransfer/search?search=satellite&category=patents',
        availableCategories: ['patents', 'software', 'spinoffs'],
        timestamp: new Date().toISOString(),
      });
    }

    console.log('🔍 Searching tech transfer:', { search, category, params });
    const data = await nasaService.searchTechTransfer(search.trim(), category, params);
    const formattedResponse = formatResponse(data, category, search.trim());

    res.json(formattedResponse);
  } catch (error) {
    handleTechTransferError(res, error, 'General Search');
  }
});

router.get('/test/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { search = 'test' } = req.query;

    const validCategories = ['patents', 'software', 'spinoffs'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        test: true,
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`,
        providedCategory: category,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('🧪 Testing tech transfer endpoint:', { category, search });
    const data = await nasaService.testTechTransferEndpoint(category, search);

    res.json({
      success: true,
      test: true,
      results: data,
      category,
      searchTerm: search,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      test: true,
      error: error.message,
      category: req.params.category,
      searchTerm: req.query.search,
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/categories', (req, res) => {
  res.json({
    success: true,
    categories: [
      {
        name: 'patents',
        description: 'NASA patent portfolio - innovations available for licensing',
        endpoint: '/api/techtransfer/patents'
      },
      {
        name: 'software',
        description: 'NASA software packages available for download',
        endpoint: '/api/techtransfer/software'
      },
      {
        name: 'spinoffs',
        description: 'NASA technologies successfully commercialized',
        endpoint: '/api/techtransfer/spinoffs'
      }
    ],
    searchEndpoint: '/api/techtransfer/search',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;