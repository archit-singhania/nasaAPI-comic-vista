const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
const allowedOrigins = [
  ...corsOrigins
].filter(Boolean); 

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200 
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('NASA Cosmic Vista Backend Running 🚀');
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

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`);
});