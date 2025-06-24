const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/study-files/:studyIds', async (req, res) => {
  try {
    console.log('🔍 OSDR Study Files API called');
    console.log('Study IDs:', req.params.studyIds);
    console.log('Query params:', req.query);
    
    const { studyIds } = req.params;
    const params = {
      page: req.query.page || 0,
      size: Math.min(parseInt(req.query.size) || 25, 25),
      all_files: req.query.all_files || false,
      ...req.query
    };
    
    const endpoint = `https://osdr.nasa.gov/osdr/data/osd/files/${studyIds}/`;
    const data = await fetchFromNasa(endpoint, params);
    res.json(data);
  } catch (err) {
    console.error('❌ Study Files Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/study-metadata/:studyId', async (req, res) => {
  try {
    console.log('🔍 OSDR Study Metadata API called');
    console.log('Study ID:', req.params.studyId);
    
    const { studyId } = req.params;
    const endpoint = `https://osdr.nasa.gov/osdr/data/osd/meta/${studyId}`;
    const data = await fetchFromNasa(endpoint, req.query);
    res.json(data);
  } catch (err) {
    console.error('❌ Study Metadata Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    console.log('🔍 OSDR Search API called');
    console.log('Search params:', req.query);
    
    const searchParams = {
      term: req.query.term || '',
      from: parseInt(req.query.from) || 0,
      size: Math.min(parseInt(req.query.size) || 10, 50),
      type: req.query.type || 'cgene',
      sort: req.query.sort || '',
      order: req.query.order || 'ASC',
      ffield: req.query.ffield || '',
      fvalue: req.query.fvalue || ''
    };

    const endpoint = 'https://osdr.nasa.gov/osdr/data/search';
    const data = await fetchFromNasa(endpoint, searchParams);
    res.json(data);
  } catch (err) {
    console.error('❌ Search Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/search/advanced', async (req, res) => {
  try {
    console.log('🔍 OSDR Advanced Search API called');
    console.log('Search filters:', req.body);
    
    const {
      term = '',
      filters = {},
      pagination = { from: 0, size: 10 },
      sorting = { sort: '', order: 'ASC' },
      type = 'cgene'
    } = req.body;

    const searchParams = {
      term,
      from: pagination.from,
      size: Math.min(pagination.size, 50),
      type,
      sort: sorting.sort,
      order: sorting.order
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.ffield = key;
        searchParams.fvalue = value;
      }
    });

    const endpoint = 'https://osdr.nasa.gov/osdr/data/search';
    const data = await fetchFromNasa(endpoint, searchParams);
    res.json(data);
  } catch (err) {
    console.error('❌ Advanced Search Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const dataTypes = ['experiments', 'missions', 'payloads', 'hardware', 'vehicles', 'subjects', 'biospecimens'];

dataTypes.forEach(dataType => {
  router.get(`/${dataType}`, async (req, res) => {
    try {
      console.log(`🔍 OSDR ${dataType} API called`);
      console.log('Query params:', req.query);
      
      const endpoint = `https://osdr.nasa.gov/geode-py/ws/api/${dataType}`;
      const data = await fetchFromNasa(endpoint, req.query);
      res.json(data);
    } catch (err) {
      console.error(`❌ ${dataType} Error:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get(`/${dataType}/:identifier`, async (req, res) => {
    try {
      console.log(`🔍 OSDR ${dataType} Detail API called`);
      console.log('Identifier:', req.params.identifier);
      
      const { identifier } = req.params;
      const endpoint = `https://osdr.nasa.gov/geode-py/ws/api/${dataType.slice(0, -1)}/${identifier}`;
      const data = await fetchFromNasa(endpoint, req.query);
      res.json(data);
    } catch (err) {
      console.error(`❌ ${dataType} Detail Error:`, err);
      res.status(500).json({ error: err.message });
    }
  });
});

router.get('/study-files/:studyIds/date/:startDate/:endDate', async (req, res) => {
  try {
    console.log('🔍 OSDR Study Files by Date Range API called');
    const { studyIds, startDate, endDate } = req.params;
    
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const params = {
      start_date: startDate,
      end_date: endDate,
      page: req.query.page || 0,
      size: Math.min(parseInt(req.query.size) || 25, 25),
      ...req.query
    };
    
    const endpoint = `https://osdr.nasa.gov/osdr/data/osd/files/${studyIds}/`;
    const data = await fetchFromNasa(endpoint, params);
    res.json(data);
  } catch (err) {
    console.error('❌ Study Files by Date Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/available-dates', async (req, res) => {
  try {
    console.log('🔍 OSDR Available Dates API called');
    
    const endpoint = 'https://osdr.nasa.gov/osdr/data/osd/available-dates';
    const data = await fetchFromNasa(endpoint, req.query);
    res.json(data);
  } catch (err) {
    console.error('❌ Available Dates Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    console.log('🔍 OSDR Analytics API called');
    
    const [experiments, missions, studies] = await Promise.all([
      fetchFromNasa('https://osdr.nasa.gov/geode-py/ws/api/experiments', {}),
      fetchFromNasa('https://osdr.nasa.gov/geode-py/ws/api/missions', {}),
      fetchFromNasa('https://osdr.nasa.gov/osdr/data/search', { term: '', from: 0, size: 1 })
    ]);
    
    const analyticsData = {
      totalExperiments: Array.isArray(experiments) ? experiments.length : experiments?.total || 0,
      totalMissions: Array.isArray(missions) ? missions.length : missions?.total || 0,
      totalStudies: studies?.hits || studies?.total || 0,
      lastUpdated: new Date().toISOString(),
      dataTypes: {
        cgene: 'NASA OSDR',
        nih_geo_gse: 'NIH GEO',
        ebi_pride: 'EBI PRIDE',
        mg_rast: 'MG-RAST'
      }
    };
    
    res.json(analyticsData);
  } catch (err) {
    console.error('❌ Analytics Error:', err);
    res.status(500).json({ 
      error: err.message,
      fallback: {
        totalExperiments: 0,
        totalMissions: 0,
        totalStudies: 0,
        lastUpdated: new Date().toISOString()
      }
    });
  }
});

router.get('/study-types', async (req, res) => {
  try {
    console.log('🔍 OSDR Study Types API called');
    
    const studyTypes = [
      'Spaceflight Study',
      'Ground Study',
      'Transcriptomics',
      'Proteomics',
      'Metabolomics',
      'Epigenomics',
      'Microbiome',
      'Cell Biology',
      'Molecular Biology'
    ];
    
    res.json({ studyTypes });
  } catch (err) {
    console.error('❌ Study Types Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/organisms', async (req, res) => {
  try {
    console.log('🔍 OSDR Organisms API called');
    
    const organisms = [
      'Mus musculus',
      'Homo sapiens',
      'Rattus norvegicus',
      'Arabidopsis thaliana',
      'Saccharomyces cerevisiae',
      'Escherichia coli',
      'Drosophila melanogaster',
      'Caenorhabditis elegans'
    ];
    
    res.json({ organisms });
  } catch (err) {
    console.error('❌ Organisms Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/platforms', async (req, res) => {
  try {
    console.log('🔍 OSDR Platforms API called');
    
    const platforms = [
      'RNA Sequencing',
      'Microarray',
      'Mass Spectrometry',
      'Illumina HiSeq',
      'Illumina MiSeq',
      'Affymetrix',
      'Agilent',
      'Applied Biosystems'
    ];
    
    res.json({ platforms });
  } catch (err) {
    console.error('❌ Platforms Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NASA OSDR API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;