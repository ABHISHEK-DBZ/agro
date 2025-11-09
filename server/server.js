import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import 'dotenv/config';

// Import Firebase Admin
import { initializeFirebase } from './config/firebase-admin.js';

// Import routes
import cropsRouter from './routes/crops.js';
import weatherRouter from './routes/weather.js';
import marketRouter from './routes/market.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
initializeFirebase();

// ===== Middleware =====

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173', 'https://smart-krishi-sahayak-6871c.web.app'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.'
});

// ===== Routes =====

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Smart Krishi Sahayak Backend API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      crops: '/api/crops',
      weather: '/api/weather',
      market: '/api/market'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    firebase: initializeFirebase() ? 'connected' : 'not configured'
  });
});

// API Routes
app.use('/api/crops', cropsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/market', marketRouter);

// AI Agent endpoint (simple keyword-based responses)
app.post('/api/ai/query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerQuery = query.toLowerCase();
    let response = "I'm here to help with your farming questions! You can ask me about crops, weather, market prices, or government schemes.";

    if (lowerQuery.includes('weather') || lowerQuery.includes('मौसम')) {
      response = "Check the Weather section for real-time forecasts, temperature, humidity, and rainfall predictions for your location.";
    } else if (lowerQuery.includes('wheat') || lowerQuery.includes('गेहूं')) {
      response = "Wheat is a Rabi crop best sown in November-December. It needs cool weather (15-25°C) and moderate irrigation. Use certified seeds at 100-125 kg/hectare.";
    } else if (lowerQuery.includes('rice') || lowerQuery.includes('धान')) {
      response = "Rice thrives in hot, humid conditions with abundant water. Maintain 2-5 cm water level. Transplant 20-30 day old seedlings for best results.";
    } else if (lowerQuery.includes('price') || lowerQuery.includes('mandi') || lowerQuery.includes('market')) {
      response = "Visit the Market Prices section to check current mandi rates for various crops across different states and districts.";
    } else if (lowerQuery.includes('disease') || lowerQuery.includes('रोग')) {
      response = "Use our Disease Detection feature to identify crop diseases by uploading a photo of affected leaves or plants.";
    } else if (lowerQuery.includes('scheme') || lowerQuery.includes('pm-kisan') || lowerQuery.includes('योजना')) {
      response = "Check Government Schemes section for PM-KISAN (₹6000/year), Fasal Bima Yojana (crop insurance), and other farmer welfare programs.";
    } else if (lowerQuery.includes('loan') || lowerQuery.includes('ऋण')) {
      response = "Explore the Loan Calculator to calculate EMI for agricultural loans. KCC, crop loans, and equipment loans are available through banks.";
    } else if (lowerQuery.includes('soil') || lowerQuery.includes('मिट्टी')) {
      response = "Use our Soil Testing feature to analyze pH, NPK levels, and get recommendations for soil improvement and fertilizer application.";
    }

    res.json({ 
      query,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI query error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/crops',
      'GET /api/crops/:id',
      'GET /api/weather/current',
      'GET /api/weather/forecast',
      'GET /api/market/prices',
      'GET /api/market/trending',
      'POST /api/ai/query'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('🌾 Smart Krishi Sahayak Backend API');
  console.log('========================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase: ${initializeFirebase() ? 'Connected' : 'Not configured'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  - GET  ${PORT}/api/health`);
  console.log(`  - GET  ${PORT}/api/crops`);
  console.log(`  - GET  ${PORT}/api/weather/current`);
  console.log(`  - GET  ${PORT}/api/market/prices`);
  console.log(`  - POST ${PORT}/api/ai/query`);
  console.log('========================================');
  console.log('');
});

export default app;
