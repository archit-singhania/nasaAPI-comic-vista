const express = require('express');
const router = express.Router();
const { fetchFromNasa } = require('../services/nasaService');

router.get('/tile/:body/:layer/:z/:x/:y', async (req, res) => {
  const { body, layer, z, x, y } = req.params;
  const format = req.query.format || 'png';
  
  try {
    const zNum = parseInt(z);
    const xNum = parseInt(x);
    const yNum = parseInt(y);
    
    if (zNum < 0 || zNum > 10 || xNum < 0 || yNum < 0) {
      return res.status(400).json({
        error: 'Invalid tile coordinates',
        message: 'Coordinates out of valid range'
      });
    }
    
    const maxTiles = Math.pow(2, zNum);
    if (xNum >= maxTiles || yNum >= maxTiles) {
      return res.status(400).json({
        error: 'Invalid tile coordinates',
        message: `Tile coordinates (${xNum}, ${yNum}) exceed maximum for zoom level ${zNum} (max: ${maxTiles-1})`
      });
    }
    
    const layerConfig = getLayerConfig(body, layer);
    if (!layerConfig) {
      return res.status(400).json({
        error: 'Invalid layer',
        message: `Layer ${layer} not found for ${body}`
      });
    }
    
    const wmtsUrl = buildWmtsUrl(layerConfig, z, x, y, format);
    const tile = await fetchFromNasa(wmtsUrl, {}, {
      responseType: 'arraybuffer',
      timeout: 30000,
      skipApiKey: true,
      headers: {
        'Accept': `image/${format}`,
        'User-Agent': 'NASA-Trek-Client/1.0',
        'Referer': 'https://trek.nasa.gov/'
      }
    });
    
    const contentType = format === 'png' ? 'image/png' :
                       format === 'webp' ? 'image/webp' : 'image/jpeg';
    
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.send(tile);
    
  } catch (err) {
    console.error('Error fetching WMTS tile:', err.message);
    
    if (err.message.includes('404')) {
      try {
        const alternativeFormat = format === 'png' ? 'jpg' : 'png';
        const layerConfig = getLayerConfig(body, layer);
        const alternativeUrl = buildWmtsUrl(layerConfig, z, x, y, alternativeFormat);
        
        console.log(`🔄 Trying alternative format: ${alternativeUrl}`);
        
        const tile = await fetchFromNasa(alternativeUrl, {}, {
          responseType: 'arraybuffer',
          timeout: 30000,
          skipApiKey: true,
          headers: {
            'Accept': `image/${alternativeFormat}`,
            'User-Agent': 'NASA-Trek-Client/1.0',
            'Referer': 'https://trek.nasa.gov/'
          }
        });
        
        const contentType = alternativeFormat === 'png' ? 'image/png' : 'image/jpeg';
        res.set({
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        });
        
        return res.send(tile);
      } catch (altErr) {
        console.error('Alternative format also failed:', altErr.message);
      }
    }
    
    res.status(500).json({
      error: 'Failed to fetch WMTS tile',
      message: err.message,
      url: err.config?.url || 'Unknown URL'
    });
  }
});

router.get('/bodies', async (req, res) => {
  try {
    console.log('🔍 WMTS Bodies API called');
    
    const bodies = ['Moon', 'Mars', 'Mercury', 'Vesta', 'Ceres'];
    res.json(bodies);
    
  } catch (err) {
    console.error('Error fetching celestial bodies:', err.message);
    res.status(500).json({
      error: 'Failed to fetch celestial bodies',
      message: err.message
    });
  }
});

router.get('/layers/:body', async (req, res) => {
  const { body } = req.params;
  
  try {
    const layers = getAvailableLayers(body);
    res.json(layers);
  } catch (err) {
    console.error('Error fetching layers:', err.message);
    res.status(500).json({
      error: 'Failed to fetch layers',
      message: err.message
    });
  }
});

router.get('/info/:body/:layer', async (req, res) => {
  const { body, layer } = req.params;
  
  try {
    const info = getLayerInfo(body, layer);
    res.json(info);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch layer info',
      message: err.message
    });
  }
});

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'WMTS API'
  });
});

function buildWmtsUrl(layerConfig, z, x, y, format) {
  const { endpoint, style, tileMatrixSet, format: defaultFormat } = layerConfig;
  const actualFormat = format || defaultFormat;
  return `${endpoint}/1.0.0/${style}/${tileMatrixSet}/${z}/${x}/${y}.${actualFormat}`;
}

function getLayerConfig(body, layer) {
  const configs = {
    'Moon': {
      'LRO_WAC_Mosaic_Global_303ppd_v02': {
        endpoint: 'http://moontrek.jpl.nasa.gov/trektiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02',
        style: 'default',
        tileMatrixSet: 'default028mm',
        format: 'jpg'
      },
      'LOLA_Shade_Global_128ppd': {
        endpoint: 'http://moontrek.jpl.nasa.gov/trektiles/Moon/EQ/LOLA_Shade_Global_128ppd',
        style: 'default',
        tileMatrixSet: 'default028mm',
        format: 'png'
      }
    },
    'Mars': {
      'Viking_Color_Mosaic': {
        endpoint: 'http://marstrek.jpl.nasa.gov/trektiles/Mars/EQ/Viking_Color_Mosaic',
        style: 'default',
        tileMatrixSet: 'default028mm',
        format: 'jpg'
      },
      'MOLA_ColorHillshade': {
        endpoint: 'http://marstrek.jpl.nasa.gov/trektiles/Mars/EQ/MOLA_ColorHillshade',
        style: 'default',
        tileMatrixSet: 'default028mm',
        format: 'jpg'
      },
      'THEMIS_IR_Day': {
        endpoint: 'http://marstrek.jpl.nasa.gov/trektiles/Mars/EQ/THEMIS_IR_Day_100m_v12',
        style: 'default',
        tileMatrixSet: 'default028mm',
        format: 'jpg'
      },
      'CTX_Mosaic_Curiosity': {
        endpoint: 'http://marstrek.jpl.nasa.gov/trektiles/Mars/EQ/CTX_Mosaic_Curiosity_Landing_Site',
        style: 'default',
        tileMatrixSet: 'default028mm',
        format: 'jpg'
      }
    },
    'Vesta': {
      'global_LAMO': {
        endpoint: 'http://vestatrek.jpl.nasa.gov/trektiles/Vesta/EQ/global_LAMO',
        style: 'default',
        tileMatrixSet: 'default028mm',
        format: 'jpg'
      },
      'Vesta_Dawn_HAMO_DTM_DLR_Global_48ppd': {
        endpoint: 'http://vestatrek.jpl.nasa.gov/trektiles/Vesta/EQ/Vesta_Dawn_HAMO_DTM_DLR_Global_48ppd_8Bit',
        style: 'default',
        tileMatrixSet: 'default028mm',
        format: 'jpg'
      },
      'Vesta_Dawn_Geology_Global_32ppd_IAU': {
        endpoint: 'http://vestatrek.jpl.nasa.gov/trektiles/Vesta/EQ/Vesta_Dawn_Geology_Global_32ppd_IAU',
        style: 'default',
        tileMatrixSet: 'default028mm',
        format: 'jpg'
      }
    }
  };
  
  return configs[body]?.[layer];
}

function getAvailableLayers(body) {
  const layers = {
    'Moon': [
      'LRO_WAC_Mosaic_Global_303ppd_v02',
      'LOLA_Shade_Global_128ppd'
    ],
    'Mars': [
      'Viking_Color_Mosaic',
      'MOLA_ColorHillshade',
      'THEMIS_IR_Day',
      'CTX_Mosaic_Curiosity'
    ],
    'Vesta': [
      'global_LAMO',
      'Vesta_Dawn_HAMO_DTM_DLR_Global_48ppd',
      'Vesta_Dawn_Geology_Global_32ppd_IAU'
    ]
  };
  
  return layers[body] || [];
}

function getLayerInfo(body, layer) {
  const layerConfig = getLayerConfig(body, layer);
  
  if (!layerConfig) {
    throw new Error(`Layer ${layer} not found for ${body}`);
  }
  
  return {
    body,
    layer,
    projection: 'Equirectangular',
    tileSize: 256,
    maxZoom: 7,
    minZoom: 0,
    format: layerConfig.format,
    bounds: [-180, -90, 180, 90], 
    credits: `NASA ${body} Trek WMTS`,
    description: `${layer} layer for ${body}`,
    endpoint: layerConfig.endpoint,
    style: layerConfig.style,
    tileMatrixSet: layerConfig.tileMatrixSet,
    lastUpdated: new Date().toISOString()
  };
}

module.exports = router;