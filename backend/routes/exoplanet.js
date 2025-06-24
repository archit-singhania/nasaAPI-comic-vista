const express = require('express');
const axios = require('axios');
const router = express.Router();

const EXOPLANET_BASE_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

async function fetchExoplanetData(query, format = 'json', retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeout = 10000 + (attempt * 5000);
      
      console.log(`[Attempt ${attempt + 1}] Query: ${query.substring(0, 100)}...`);
      
      const response = await axios.get(EXOPLANET_BASE_URL, {
        params: {
          query: query,
          format: format
        },
        timeout: timeout,
        headers: {
          'User-Agent': 'NASA-Exoplanet-Client/1.0'
        }
      });

      console.log(`[Success] Retrieved ${Array.isArray(response.data) ? response.data.length : 1} records`);
      return response.data;
      
    } catch (error) {
      console.error(`[Attempt ${attempt + 1}] Exoplanet API Error:`, error.message);
      
      if (error.code === 'ECONNABORTED') {
        if (attempt === retries) {
          throw new Error('Request timeout after multiple attempts. Try reducing the data size or try again later.');
        }
        console.log(`[Retry] Timeout on attempt ${attempt + 1}, retrying...`);
        continue;
      }
      
      if (error.response) {
        const status = error.response.status;
        console.error('Response data:', error.response.data);
        switch (status) {
          case 400:
            throw new Error('Invalid query syntax. Please check your ADQL query syntax.');
          case 404:
            throw new Error('No exoplanet data found for the specified query.');
          case 500:
            if (attempt === retries) {
              throw new Error('Exoplanet Archive server error after multiple attempts. Please try again later.');
            }
            console.log(`[Retry] Server error on attempt ${attempt + 1}, retrying...`);
            continue;
          default:
            throw new Error(`Exoplanet API error (${status}): ${error.response.statusText}`);
        }
      }
      
      if (attempt === retries) {
        throw new Error('Failed to connect to NASA Exoplanet Archive after multiple attempts');
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
  }
}

router.get('/', async (req, res) => {
  try {
    const { query, format = 'json', limit = 500 } = req.query; 
    
    let sqlQuery = query || `SELECT pl_name, hostname, discoverymethod, disc_year, pl_orbper, pl_rade, pl_masse, sy_dist FROM ps WHERE default_flag=1`;
    
    if (!sqlQuery.toLowerCase().includes('limit') && limit) {
      sqlQuery += ` LIMIT ${Math.min(parseInt(limit), 1000)}`; 
    }
    
    console.log(`[Exoplanet API] Executing query: ${sqlQuery}`);
    
    const data = await fetchExoplanetData(sqlQuery, format);
    
    if (Array.isArray(data)) {
      res.json({
        data: data,
        count: data.length,
        query: sqlQuery,
        source: 'NASA Exoplanet Archive'
      });
    } else {
      res.json(data);
    }
    
  } catch (error) {
    console.error('Exoplanet route error:', error.message);
    res.status(500).json({ 
      error: error.message,
      source: 'NASA Exoplanet Archive'
    });
  }
});

router.get('/confirmed', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const query = `SELECT * FROM ps WHERE default_flag=1 AND pl_name IS NOT NULL LIMIT ${parseInt(limit)}`;
    
    const data = await fetchExoplanetData(query);
    
    res.json({
      data: data,
      count: data.length,
      type: 'confirmed_planets'
    });
    
  } catch (error) {
    console.error('Confirmed planets error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/by-method/:method', async (req, res) => {
  try {
    const { method } = req.params;
    const { limit = 100 } = req.query;
    
    const query = `SELECT * FROM ps WHERE discoverymethod='${method}' AND default_flag=1 LIMIT ${parseInt(limit)}`;
    
    const data = await fetchExoplanetData(query);
    
    res.json({
      data: data,
      count: data.length,
      discovery_method: method
    });
    
  } catch (error) {
    console.error('Discovery method error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const methodQuery = `SELECT discoverymethod, COUNT(*) as method_count FROM ps WHERE default_flag=1 GROUP BY discoverymethod ORDER BY method_count DESC`;
    const methodStats = await fetchExoplanetData(methodQuery);
    
    const yearQuery = `SELECT disc_year, COUNT(*) as year_count FROM ps WHERE default_flag=1 AND disc_year IS NOT NULL GROUP BY disc_year ORDER BY disc_year`;
    const yearStats = await fetchExoplanetData(yearQuery);
    
    const totalQuery = `SELECT COUNT(*) as total_count FROM ps WHERE default_flag=1`;
    const totalStats = await fetchExoplanetData(totalQuery);
    
    const formattedMethodStats = methodStats.map(item => ({
      discoverymethod: item.discoverymethod,
      count: item.method_count
    }));
    
    const formattedYearStats = yearStats.map(item => ({
      disc_year: item.disc_year,
      count: item.year_count
    }));
    
    res.json({
      total_planets: totalStats[0]?.total_count || 0,
      by_discovery_method: formattedMethodStats,
      by_year: formattedYearStats,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 50 } = req.query;
    
    const query = `SELECT * FROM ps WHERE (pl_name LIKE '%${term}%' OR hostname LIKE '%${term}%') AND default_flag=1 LIMIT ${parseInt(limit)}`;
    
    const data = await fetchExoplanetData(query);
    
    res.json({
      data: data,
      count: data.length,
      search_term: term
    });
    
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/simple-stats', async (req, res) => {
  try {
    const query = `SELECT discoverymethod FROM ps WHERE default_flag=1 AND discoverymethod IS NOT NULL LIMIT 2000`;
    console.log('[Stats] Using optimized query for discovery methods...');
    
    const data = await fetchExoplanetData(query);
    
    const methodCounts = {};
    data.forEach(item => {
      if (item.discoverymethod) {
        methodCounts[item.discoverymethod] = (methodCounts[item.discoverymethod] || 0) + 1;
      }
    });
    
    const sortedMethods = Object.entries(methodCounts)
      .map(([method, count]) => ({ discoverymethod: method, count }))
      .sort((a, b) => b.count - a.count);
    
    res.json({
      total_sampled: data.length,
      by_discovery_method: sortedMethods,
      note: 'Statistics based on sample of recent confirmed exoplanets',
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Simple stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/quick-stats', async (req, res) => {
  try {
    const promises = [
      fetchExoplanetData(`SELECT discoverymethod FROM ps WHERE default_flag=1 AND discoverymethod IS NOT NULL LIMIT 1000`),
      fetchExoplanetData(`SELECT COUNT(*) as recent_count FROM ps WHERE default_flag=1 AND disc_year >= 2020`),
    ];

    const [methodData, recentCount] = await Promise.allSettled(promises);
    
    let stats = {
      generated_at: new Date().toISOString(),
      status: 'partial'
    };

    if (methodData.status === 'fulfilled') {
      const methodCounts = {};
      methodData.value.forEach(item => {
        if (item.discoverymethod) {
          methodCounts[item.discoverymethod] = (methodCounts[item.discoverymethod] || 0) + 1;
        }
      });
      
      stats.by_discovery_method = Object.entries(methodCounts)
        .map(([method, count]) => ({ discoverymethod: method, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); 
      
      stats.sample_size = methodData.value.length;
    }

    if (recentCount.status === 'fulfilled' && recentCount.value[0]) {
      stats.recent_discoveries = recentCount.value[0].recent_count || 0;
    }

    res.json(stats);
    
  } catch (error) {
    console.error('Quick stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;