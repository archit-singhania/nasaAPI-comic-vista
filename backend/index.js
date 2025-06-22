const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200 
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
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

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));