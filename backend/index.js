const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://nasa-api-comic-vista.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://nasa-api-comic-vista.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'NASA Cosmic Vista Backend Running 🚀',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/apod', require('./routes/apod'));
app.use('/api/mars', require('./routes/marsRover'));
app.use('/api/neo', require('./routes/neows'));
app.use('/api/donki', require('./routes/donki'));
app.use('/api/earth', require('./routes/earth'));
app.use('/api/eonet', require('./routes/eonet'));
app.use('/api/epic', require('./routes/epic'));
app.use('/api/exoplanet', require('./routes/exoplanet'));
app.use('/api/osdr', require('./routes/osdr'));
app.use('/api/insight', require('./routes/insight'));
app.use('/api/images', require('./routes/imageLibrary'));
app.use('/api/techtransfer', require('./routes/techTransfer'));
app.use('/api/ssc', require('./routes/ssc'));
app.use('/api/ssdcneos', require('./routes/ssdcneos'));
app.use('/api/techport', require('./routes/techport'));
app.use('/api/tle', require('./routes/tle'));
app.use('/api/wmts', require('./routes/wmts'));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.originalUrl
    });
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Origin not allowed'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NASA Cosmic Vista Backend`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Backend URL: https://nasaapi-comic-vista-backend.onrender.com`);
  console.log(`🎯 Frontend URL: https://nasa-api-comic-vista.vercel.app`);
});