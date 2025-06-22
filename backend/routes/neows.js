const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/feed', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (start_date && !isValidDate(start_date)) {
      return res.status(400).json({ error: 'Invalid start_date format. Use YYYY-MM-DD' });
    }
    
    if (end_date && !isValidDate(end_date)) {
      return res.status(400).json({ error: 'Invalid end_date format. Use YYYY-MM-DD' });
    }

    const queryParams = {
      start_date: start_date || new Date().toISOString().slice(0, 10),
      end_date: end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      ...req.query
    };

    const data = await fetchFromNasa('https://api.nasa.gov/neo/rest/v1/feed', queryParams);
    
    const response = {
      ...data,
      metadata: {
        fetched_at: new Date().toISOString(),
        total_objects: Object.values(data.near_earth_objects || {}).flat().length,
        date_range: {
          start: queryParams.start_date,
          end: queryParams.end_date
        }
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error('Neo feed error:', err);
    res.status(500).json({ 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/lookup/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Asteroid ID is required' });
    }

    const data = await fetchFromNasa(`https://api.nasa.gov/neo/rest/v1/neo/${id}`);
    res.json(data);
  } catch (err) {
    console.error('Neo lookup error:', err);
    if (err.message.includes('404')) {
      res.status(404).json({ error: 'Asteroid not found' });
    } else {
      res.status(500).json({ 
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  }
});

router.get('/browse', async (req, res) => {
  try {
    const { page = 0, size = 20 } = req.query;
    
    if (isNaN(page) || page < 0) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }
    
    if (isNaN(size) || size < 1 || size > 100) {
      return res.status(400).json({ error: 'Invalid size parameter (1-100)' });
    }

    const queryParams = {
      page: parseInt(page),
      size: parseInt(size),
      ...req.query
    };

    const data = await fetchFromNasa('https://api.nasa.gov/neo/rest/v1/neo/browse', queryParams);
    res.json(data);
  } catch (err) {
    console.error('Neo browse error:', err);
    res.status(500).json({ 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://api.nasa.gov/neo/rest/v1/stats');
    res.json(data);
  } catch (err) {
    console.error('Neo stats error:', err);
    res.status(500).json({ 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/sentry', async (req, res) => {
  try {
    const { is_active_sentry = true, page = 0, size = 20 } = req.query;
    
    const queryParams = {
      is_active_sentry: is_active_sentry === 'true',
      page: parseInt(page) || 0,
      size: Math.min(parseInt(size) || 20, 100)
    };

    const data = await fetchFromNasa('https://api.nasa.gov/neo/rest/v1/neo/sentry', queryParams);
    res.json(data);
  } catch (err) {
    console.error('Neo sentry error:', err);
    res.status(500).json({ 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { date_range, analysis_type = 'basic' } = req.body;
    
    if (!date_range || !date_range.start || !date_range.end) {
      return res.status(400).json({ error: 'Date range with start and end dates required' });
    }

    const feedData = await fetchFromNasa('https://api.nasa.gov/neo/rest/v1/feed', {
      start_date: date_range.start,
      end_date: date_range.end
    });

    const analysis = performAnalysis(feedData, analysis_type);
    
    res.json({
      analysis,
      metadata: {
        analyzed_at: new Date().toISOString(),
        date_range,
        analysis_type,
        total_objects_analyzed: Object.values(feedData.near_earth_objects || {}).flat().length
      }
    });
  } catch (err) {
    console.error('Neo analysis error:', err);
    res.status(500).json({ 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

function performAnalysis(feedData, analysisType) {
  const allAsteroids = Object.values(feedData.near_earth_objects || {}).flat();
  
  const basicStats = {
    total_count: allAsteroids.length,
    potentially_hazardous_count: allAsteroids.filter(a => a.is_potentially_hazardous_asteroid).length,
    average_size_km: calculateAverageSize(allAsteroids),
    closest_approach_km: findClosestApproach(allAsteroids),
    size_distribution: calculateSizeDistribution(allAsteroids),
    velocity_stats: calculateVelocityStats(allAsteroids)
  };

  if (analysisType === 'detailed') {
    return {
      ...basicStats,
      daily_breakdown: calculateDailyBreakdown(feedData.near_earth_objects),
      risk_assessment: calculateRiskAssessment(allAsteroids),
      orbital_characteristics: calculateOrbitalStats(allAsteroids)
    };
  }

  return basicStats;
}

function calculateAverageSize(asteroids) {
  if (asteroids.length === 0) return 0;
  
  const sizes = asteroids.map(a => 
    (a.estimated_diameter.kilometers.estimated_diameter_min + 
     a.estimated_diameter.kilometers.estimated_diameter_max) / 2
  );
  
  return (sizes.reduce((sum, size) => sum + size, 0) / sizes.length).toFixed(3);
}

function findClosestApproach(asteroids) {
  const distances = asteroids
    .map(a => parseFloat(a.close_approach_data[0]?.miss_distance?.kilometers || Infinity))
    .filter(d => d !== Infinity);
  
  return distances.length > 0 ? Math.min(...distances).toFixed(0) : null;
}

function calculateSizeDistribution(asteroids) {
  const ranges = {
    'tiny': 0,      
    'small': 0,     
    'medium': 0,    
    'large': 0,     
    'giant': 0      
  };

  asteroids.forEach(a => {
    const avgSize = (a.estimated_diameter.kilometers.estimated_diameter_min + 
                    a.estimated_diameter.kilometers.estimated_diameter_max) / 2;
    
    if (avgSize < 0.01) ranges.tiny++;
    else if (avgSize < 0.1) ranges.small++;
    else if (avgSize < 1) ranges.medium++;
    else if (avgSize < 10) ranges.large++;
    else ranges.giant++;
  });

  return ranges;
}

function calculateVelocityStats(asteroids) {
  const velocities = asteroids
    .map(a => parseFloat(a.close_approach_data[0]?.relative_velocity?.kilometers_per_second || 0))
    .filter(v => v > 0);

  if (velocities.length === 0) return null;

  return {
    min: Math.min(...velocities).toFixed(2),
    max: Math.max(...velocities).toFixed(2),
    average: (velocities.reduce((sum, v) => sum + v, 0) / velocities.length).toFixed(2)
  };
}

function calculateDailyBreakdown(nearEarthObjects) {
  return Object.keys(nearEarthObjects).map(date => ({
    date,
    total_count: nearEarthObjects[date].length,
    hazardous_count: nearEarthObjects[date].filter(a => a.is_potentially_hazardous_asteroid).length,
    average_size: calculateAverageSize(nearEarthObjects[date])
  }));
}

function calculateRiskAssessment(asteroids) {
  const hazardous = asteroids.filter(a => a.is_potentially_hazardous_asteroid);
  
  return {
    risk_level: hazardous.length > 5 ? 'HIGH' : hazardous.length > 2 ? 'MEDIUM' : 'LOW',
    hazardous_percentage: ((hazardous.length / asteroids.length) * 100).toFixed(1),
    largest_hazardous: hazardous.length > 0 ? calculateAverageSize([
      hazardous.reduce((max, a) => {
        const aSize = (a.estimated_diameter.kilometers.estimated_diameter_min + 
                      a.estimated_diameter.kilometers.estimated_diameter_max) / 2;
        const maxSize = (max.estimated_diameter.kilometers.estimated_diameter_min + 
                        max.estimated_diameter.kilometers.estimated_diameter_max) / 2;
        return aSize > maxSize ? a : max;
      })
    ]) : null
  };
}

function calculateOrbitalStats(asteroids) {
  const orbitalData = asteroids.map(a => a.orbital_data).filter(Boolean);
  
  if (orbitalData.length === 0) return null;

  return {
    average_orbital_period: orbitalData.length > 0 ? 
      (orbitalData.reduce((sum, o) => sum + parseFloat(o.orbital_period || 0), 0) / orbitalData.length).toFixed(2) : null,
    eccentricity_range: {
      min: Math.min(...orbitalData.map(o => parseFloat(o.eccentricity || 1))).toFixed(3),
      max: Math.max(...orbitalData.map(o => parseFloat(o.eccentricity || 0))).toFixed(3)
    }
  };
}

router.use((err, req, res, next) => {
  console.error('NEO API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;