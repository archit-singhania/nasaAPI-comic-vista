const express = require('express');
const { fetchFromNasa } = require('../services/nasaService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log('🔍 InSight Weather API called');
    console.log('Query params:', req.query);
    
    const apiParams = {
      api_key: process.env.NASA_API_KEY || 'DEMO_KEY',
      feedtype: 'json',
      ver: '1.0',
      ...req.query
    };
    
    const data = await fetchFromNasa('https://api.nasa.gov/insight_weather/', apiParams);
    
    console.log('📡 Raw NASA API response:', data);
    
    const processedData = processInsightData(data);
    
    console.log('🔄 Processed data:', processedData);
    
    res.json(processedData);
  } catch (err) {
    console.error('❌ InSight API Error:', err);
    res.status(500).json({ 
      error: err.message,
      sols: [],
      metadata: {
        total_sols: 0,
        latest_sol: null,
        oldest_sol: null,
        validity_checks: null
      },
      processed_at: new Date().toISOString()
    });
  }
});

router.get('/sol/:sol', async (req, res) => {
  try {
    const { sol } = req.params;
    
    if (!/^\d+$/.test(sol)) {
      return res.status(400).json({ error: 'Invalid sol number. Must be a positive integer.' });
    }
    
    console.log(`🔍 InSight Sol ${sol} API called`);
    
    const data = await fetchFromNasa('https://api.nasa.gov/insight_weather/', {
      ...req.query,
      sol: sol
    });
    
    const processedData = processInsightData(data);
    
    res.json(processedData);
  } catch (err) {
    console.error('❌ InSight Sol API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

function processInsightData(rawData) {
  console.log('🔄 Processing raw data:', rawData);
  
  if (!rawData) {
    return {
      sols: [],
      metadata: {
        total_sols: 0,
        latest_sol: null,
        oldest_sol: null,
        validity_checks: null
      },
      processed_at: new Date().toISOString()
    };
  }

  const sols = [];
  
  let solKeys = rawData.sol_keys || [];
  
  if (solKeys.length === 0 && typeof rawData === 'object') {
    solKeys = Object.keys(rawData).filter(key => !isNaN(key) && key !== 'sol_keys' && key !== 'validity_checks');
  }
  
  console.log('🔍 Found sol keys:', solKeys);
  
  solKeys.forEach(solKey => {
    const solData = rawData[solKey];
    if (solData && typeof solData === 'object') {
      console.log(`📊 Processing sol ${solKey}:`, solData);
      
      sols.push({
        sol: parseInt(solKey),
        earth_date: solData.First_UTC || solData.Last_UTC || null,
        season: solData.Season || 'Unknown',
        temperature: {
          average: solData.AT?.av || null,
          minimum: solData.AT?.mn || null,
          maximum: solData.AT?.mx || null,
          unit: '°C'
        },
        pressure: {
          average: solData.PRE?.av || null,
          minimum: solData.PRE?.mn || null,
          maximum: solData.PRE?.mx || null,
          unit: 'Pa'
        },
        wind: {
          speed: {
            average: solData.HWS?.av || null,
            minimum: solData.HWS?.mn || null,
            maximum: solData.HWS?.mx || null,
            unit: 'm/s'
          },
          direction: {
            most_common: solData.WD?.most_common?.compass_point || null,
            most_common_degrees: solData.WD?.most_common?.compass_degrees || null,
            compass_rose: solData.WD?.compass_rose || null
          }
        },
        data_quality: {
          temperature_samples: solData.AT?.ct || 0,
          pressure_samples: solData.PRE?.ct || 0,
          wind_samples: solData.HWS?.ct || 0
        }
      });
    }
  });

  sols.sort((a, b) => b.sol - a.sol);

  const result = {
    sols: sols,
    metadata: {
      total_sols: sols.length,
      latest_sol: sols.length > 0 ? sols[0].sol : null,
      oldest_sol: sols.length > 0 ? sols[sols.length - 1].sol : null,
      validity_checks: rawData.validity_checks || null
    },
    processed_at: new Date().toISOString()
  };
  
  console.log('✅ Final processed result:', result);
  return result;
}

router.get('/range/:startSol/:endSol', async (req, res) => {
  try {
    const { startSol, endSol } = req.params;
    
    if (!/^\d+$/.test(startSol) || !/^\d+$/.test(endSol)) {
      return res.status(400).json({ error: 'Invalid sol numbers. Must be positive integers.' });
    }
    
    if (parseInt(endSol) < parseInt(startSol)) {
      return res.status(400).json({ error: 'End sol must be greater than or equal to start sol.' });
    }
    
    console.log(`🔍 InSight Range Sol ${startSol}-${endSol} API called`);
    
    const data = await fetchFromNasa('https://api.nasa.gov/insight_weather/', {
      ...req.query,
      start_sol: startSol,
      end_sol: endSol
    });
    
    const processedData = processInsightData(data);
    
    res.json(processedData);
  } catch (err) {
    console.error('❌ InSight Range API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/available', async (req, res) => {
  try {
    console.log('🔍 InSight Available Sols API called');
    
    const data = await fetchFromNasa('https://api.nasa.gov/insight_weather/', {
      ...req.query,
      feedtype: 'json',
      ver: '1.0'
    });
    
    const availableSols = data?.sol_keys || Object.keys(data || {}).filter(key => !isNaN(key));
    
    res.json({
      available_sols: availableSols,
      count: availableSols.length,
      latest_sol: availableSols.length > 0 ? Math.max(...availableSols.map(Number)) : null
    });
  } catch (err) {
    console.error('❌ InSight Available Sols API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/health', async (req, res) => {
  try {
    const data = await fetchFromNasa('https://api.nasa.gov/insight_weather/', {
      feedtype: 'json',
      ver: '1.0'
    });
    
    const isHealthy = data && (data.sol_keys || Object.keys(data).some(key => !isNaN(key)));
    
    res.json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      api_responsive: true,
      data_available: isHealthy
    });
  } catch (err) {
    console.error('❌ InSight Health Check Error:', err);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      api_responsive: false,
      error: err.message
    });
  }
});

function processInsightData(rawData) {
  if (!rawData) {
    return {
      sols: [],
      metadata: null,
      processed_at: new Date().toISOString()
    };
  }

  const sols = [];
  const solKeys = rawData.sol_keys || Object.keys(rawData).filter(key => !isNaN(key));
  
  solKeys.forEach(solKey => {
    const solData = rawData[solKey];
    if (solData && typeof solData === 'object') {
      sols.push({
        sol: parseInt(solKey),
        earth_date: solData.First_UTC || solData.Last_UTC || null,
        season: solData.Season || 'Unknown',
        temperature: {
          average: solData.AT?.av || null,
          minimum: solData.AT?.mn || null,
          maximum: solData.AT?.mx || null,
          unit: '°C'
        },
        pressure: {
          average: solData.PRE?.av || null,
          minimum: solData.PRE?.mn || null,
          maximum: solData.PRE?.mx || null,
          unit: 'Pa'
        },
        wind: {
          speed: {
            average: solData.HWS?.av || null,
            minimum: solData.HWS?.mn || null,
            maximum: solData.HWS?.mx || null,
            unit: 'm/s'
          },
          direction: {
            most_common: solData.WD?.most_common?.compass_point || null,
            most_common_degrees: solData.WD?.most_common?.compass_degrees || null,
            compass_rose: solData.WD?.compass_rose || null
          }
        },
        data_quality: {
          temperature_samples: solData.AT?.ct || 0,
          pressure_samples: solData.PRE?.ct || 0,
          wind_samples: solData.HWS?.ct || 0
        }
      });
    }
  });

  sols.sort((a, b) => b.sol - a.sol);

  return {
    sols: sols,
    metadata: {
      total_sols: sols.length,
      latest_sol: sols.length > 0 ? sols[0].sol : null,
      oldest_sol: sols.length > 0 ? sols[sols.length - 1].sol : null,
      validity_checks: rawData.validity_checks || null
    },
    processed_at: new Date().toISOString()
  };
}

function celsiusToFahrenheit(celsius) {
  if (celsius === null || celsius === undefined) return null;
  return (celsius * 9/5) + 32;
}

function convertPressure(pascals, unit = 'hPa') {
  if (pascals === null || pascals === undefined) return null;
  switch (unit) {
    case 'hPa':
      return pascals / 100;
    case 'mmHg':
      return pascals * 0.00750062;
    case 'inHg':
      return pascals * 0.000295301;
    default:
      return pascals;
  }
}

router.get('/convert/temperature/:celsius/:unit', (req, res) => {
  try {
    const { celsius, unit } = req.params;
    const temp = parseFloat(celsius);
    
    if (isNaN(temp)) {
      return res.status(400).json({ error: 'Invalid temperature value' });
    }
    
    let converted;
    switch (unit.toLowerCase()) {
      case 'f':
      case 'fahrenheit':
        converted = celsiusToFahrenheit(temp);
        break;
      case 'k':
      case 'kelvin':
        converted = temp + 273.15;
        break;
      default:
        converted = temp;
    }
    
    res.json({
      original: { value: temp, unit: '°C' },
      converted: { value: converted, unit: unit.toUpperCase() }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/convert/pressure/:pascals/:unit', (req, res) => {
  try {
    const { pascals, unit } = req.params;
    const pressure = parseFloat(pascals);
    
    if (isNaN(pressure)) {
      return res.status(400).json({ error: 'Invalid pressure value' });
    }
    
    const converted = convertPressure(pressure, unit);
    
    res.json({
      original: { value: pressure, unit: 'Pa' },
      converted: { value: converted, unit: unit }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;