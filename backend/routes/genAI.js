const express = require('express');
const router = express.Router();
const path = require('path');

const { VertexAI } = require('@google-cloud/vertexai');

const vertexAI = new VertexAI({
  project: 'nasa-comic-landing-page', 
  location: 'europe-west4',          
  keyFile: path.join(__dirname, '../keys/gcp-service-act-key.json')
});

const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.0-pro'
});

router.post('/', async (req, res) => {
  req.setTimeout(30000); 
  
  const { totalSatellites, avgInclination, inclinationBins, launchYears } = req.body;

  const prompt = `
Analyze the following satellite dataset:
- Total satellites: ${totalSatellites}
- Average orbital inclination: ${avgInclination}
- Inclination distribution: ${JSON.stringify(inclinationBins)}
- Launch year distribution: ${JSON.stringify(launchYears)}

Generate:
1. 3–4 key findings.
2. 3–4 actionable recommendations.
3. 3–4 patterns observed.

Respond in this exact JSON format:
{
  "insights": {
    "keyFindings": [...],
    "recommendations": [...],
    "patterns": [...]
  }
}
`;

  try {
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.3,
        topP: 0.8,
        topK: 40
      }
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response text received from Gemini');
    }

    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      
      parsed = {
        insights: {
          keyFindings: ["Analysis completed but response format needs adjustment"],
          recommendations: ["Please check the data format and try again"],
          patterns: ["Raw response available in logs"]
        }
      };
    }
    
    res.json(parsed);
  } catch (error) {
    console.error('❌ Gemini error:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('timeout')) {
      res.status(408).json({ error: 'Request timeout - try again' });
    } else if (error.message.includes('authentication') || error.message.includes('credentials')) {
      res.status(401).json({ error: 'Authentication failed - check GCP credentials' });
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      res.status(429).json({ error: 'API quota exceeded - try again later' });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate insights from Gemini',
        detail: error.message 
      });
    }
  }
});

router.get('/test', async (req, res) => {
  
  try {
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Say "Hello from Gemini!"' }] }],
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.1
      }
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ 
      message: 'Success ✅', 
      response: responseText,
      timestamp: new Date().toISOString(),
      model: 'gemini-1.0-pro',
      project: 'nasa-comic-landing-page',
      location: 'europe-west4'
    });
  } catch (err) {
    console.error('❌ Gemini test route error:', err.message);
    console.error('Full error:', err);
    
    res.status(500).json({ 
      error: 'Test route failed ❌', 
      detail: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'Server running ✅',
    timestamp: new Date().toISOString(),
    env: {
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

module.exports = router;