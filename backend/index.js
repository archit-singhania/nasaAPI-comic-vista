const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

const allowedOrigins = [
  'https://nasa-api-comic-vista.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

app.post('/notify', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const timestamp = new Date().toLocaleString();
  const message = `🚀 Your site was accessed!\nIP: ${ip}\nTime: ${timestamp}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Site Access Alert',
      text: message,
    });
    console.log('✅ Email sent');

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_SMS_FROM,
      to: process.env.TWILIO_SMS_TO,
    });
    console.log('✅ SMS sent');

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.TWILIO_WHATSAPP_TO,
    });
    console.log('✅ WhatsApp message sent');

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error sending alerts:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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

app.use('/api/insights', require('./routes/genAI'));
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
    return res.status(404).json({
      error: 'API endpoint not found',
      path: req.originalUrl
    });
  }
  next();
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