import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import 'dotenv/config';

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-should-be-in-an-env-file';
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// --- Simple In-Memory Cache ---
const weatherCache = new Map();
const WEATHER_CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// --- Database Connection ---
// Replace with your actual MongoDB connection string
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-krishi-sahayak')
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('Database connection error:', err));

// --- Schemas and Models ---

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Profile Schema
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  email: String,
  phone: String,
  location: String,
  farmSize: String,
  primaryCrops: [String],
  experience: String,
  language: String,
  notifications: {
    weather: Boolean,
    prices: Boolean,
    diseases: Boolean,
    schemes: Boolean
  }
});
const Profile = mongoose.model('Profile', profileSchema);

// Scheme Schema
const schemeSchema = new mongoose.Schema({
  title: { type: Object, required: true }, // To store { en, hi }
  description: { type: Object, required: true }, // To store { en, hi }
  eligibility: { type: Object, required: true }, // To store { en, hi }
  link: { type: String, required: true },
  category: { type: String, required: true }
});
const Scheme = mongoose.model('Scheme', schemeSchema);


app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user payload to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};


// --- API Endpoints ---
// --- Password Reset & Change Endpoints ---
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required.' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  // In production, generate a token and send email. Here, just respond OK.
  res.json({ message: 'Password reset link sent to your email (mock).' });
});

app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  // In production, verify token. Here, just respond OK.
  if (!password) return res.status(400).json({ message: 'Password required.' });
  // Find user by token (mock: not implemented)
  res.json({ message: 'Password reset successful (mock).' });
});

app.post('/api/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Old and new password required.' });
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Old password incorrect.' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password changed successfully.' });
});

// --- Email Verification Endpoint (stub) ---
app.post('/api/verify-email', async (req, res) => {
  // In production, verify token and mark email as verified
  res.json({ message: 'Email verified (mock).' });
});

// --- 2FA Endpoints (stubs) ---
app.post('/api/enable-2fa', authMiddleware, async (req, res) => {
  // In production, generate secret and QR code
  res.json({ message: '2FA enabled (mock).' });
});
app.post('/api/verify-2fa', authMiddleware, async (req, res) => {
  // In production, verify code
  res.json({ message: '2FA verified (mock).' });
});
app.get('/api/2fa-qr', authMiddleware, async (req, res) => {
  // In production, return QR code image
  res.json({ message: 'QR code (mock).' });
});

// --- Social Login Stubs ---
app.get('/api/auth/google', (req, res) => {
  res.json({ message: 'Google login not implemented (stub).' });
});
app.get('/api/auth/facebook', (req, res) => {
  res.json({ message: 'Facebook login not implemented (stub).' });
});
app.get('/api/auth/github', (req, res) => {
  res.json({ message: 'GitHub login not implemented (stub).' });
});

// -- Auth Endpoints --
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Create a default profile for the new user
    const newProfile = new Profile({
      userId: newUser._id,
      email: newUser.email,
      name: 'New User',
      location: 'Not specified',
      // ... set other default profile fields
    });
    await newProfile.save();

    // Send success response
    res.status(201).json({ message: 'Registration successful' });

  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err });
  }
});


// -- Profile Endpoints (Protected) --
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userProfile = await Profile.findOne({ userId: req.user.userId });
    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(userProfile);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err });
  }
});

app.post('/api/profile', authMiddleware, async (req, res) => {
  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: req.user.userId }, 
      req.body, 
      { new: true, upsert: true }
    );
    res.json({ success: true, profile: updatedProfile });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err });
  }
});


// -- Government Schemes Endpoint --
app.get('/api/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching schemes', error: err });
  }
});


// Weather API Proxy
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    if (!OPENWEATHER_API_KEY) {
        return res.status(500).json({ message: 'Weather API key not configured on server' });
    }

    const cacheKey = `${lat},${lon}`;
    const cachedData = weatherCache.get(cacheKey);

    // Check if we have cached data and if it's still valid
    if (cachedData && (Date.now() - cachedData.timestamp < WEATHER_CACHE_DURATION)) {
        console.log('Serving weather data from cache');
        return res.json(cachedData.data);
    }

    try {
        console.log(`Fetching new weather data for ${lat}, ${lon}`);
        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                lat,
                lon,
                appid: OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        // Cache the new data
        weatherCache.set(cacheKey, {
            timestamp: Date.now(),
            data: weatherResponse.data
        });

        res.json(weatherResponse.data);
    } catch (error) {
        console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({ message: 'Failed to fetch weather data' });
    }
});


// -- AI Agent Query Endpoint --
app.post('/api/agent/query', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  // Simulate a delay for a more realistic experience
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerCaseQuery = query.toLowerCase();
  let reply = "I'm sorry, I don't have information about that right now. Please try asking about weather, specific crops like wheat or rice, or government schemes like PM-KISAN.";

  // Simple keyword-based responses
  if (lowerCaseQuery.includes('weather') || lowerCaseQuery.includes('मौसम')) {
    reply = "You can get the latest weather forecast by visiting the 'Weather' section of the app. It provides real-time temperature, humidity, and rainfall information for your location.";
  } else if (lowerCaseQuery.includes('rice') || lowerCaseQuery.includes('धान')) {
    reply = "Rice is a major Kharif crop. For best results, use disease-resistant varieties and maintain a water level of 2-5 cm in the field. You can find more details in the 'Crop Info' section.";
  } else if (lowerCaseQuery.includes('wheat') || lowerCaseQuery.includes('गेहूं')) {
    reply = "Wheat is a primary Rabi crop in India. It requires cool weather during its growing phase. Ensure timely irrigation, especially during the crown root initiation and flowering stages. More details are in 'Crop Info'.";
  } else if (lowerCaseQuery.includes('pm-kisan') || lowerCaseQuery.includes('kisan scheme')) {
    reply = "The PM-KISAN scheme provides financial support of ₹6,000 per year to eligible farmer families. You can find more details and eligibility criteria under the 'Govt Schemes' section.";
  } else if (lowerCaseQuery.includes('disease') || lowerCaseQuery.includes('रोग')) {
    reply = "Our 'Disease Detection' feature can help you identify crop diseases. Just upload a clear photo of the affected plant part, and our AI will analyze it for you.";
  } else if (lowerCaseQuery.includes('hello') || lowerCaseQuery.includes('नमस्ते')) {
    reply = "Hello! How can I assist you with your farming questions today?";
  }

  res.json({ reply });
});


// --- Database Seeding ---
const seedSchemes = async () => {
  try {
    const count = await Scheme.countDocuments();
    if (count > 0) {
      console.log('Government schemes already seeded.');
      return;
    }

    const schemesToSeed = [
      {
        title: { en: 'PM-KISAN Scheme', hi: 'पीएम-किसान योजना' },
        description: { 
          en: 'A central sector scheme with 100% funding from Government of India. It provides income support to all landholding farmer families in the country.',
          hi: 'भारत सरकार से 100% वित्त पोषण के साथ एक केंद्रीय क्षेत्र की योजना। यह देश के सभी भूमिधारक किसान परिवारों को आय सहायता प्रदान करती है।'
        },
        eligibility: {
          en: 'All landholding farmer families.',
          hi: 'सभी भूमिधारक किसान परिवार।'
        },
        link: 'https://pmkisan.gov.in/',
        category: 'Financial Support'
      },
      {
        title: { en: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', hi: 'प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)' },
        description: {
          en: 'Provides comprehensive insurance coverage against failure of the crop thus helping in stabilising the income of the farmers.',
          hi: 'फसल की विफलता के खिलाफ व्यापक बीमा कवरेज प्रदान करता है जिससे किसानों की आय को स्थिर करने में मदद मिलती है।'
        },
        eligibility: {
          en: 'All farmers including sharecroppers and tenant farmers growing notified crops in the notified areas are eligible for coverage.',
          hi: 'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले बटाईदारों और काश्तकारों सहित सभी किसान कवरेज के लिए पात्र हैं।'
        },
        link: 'https://pmfby.gov.in/',
        category: 'Insurance'
      },
      {
        title: { en: 'Soil Health Card Scheme', hi: 'मृदा स्वास्थ्य कार्ड योजना' },
        description: {
          en: 'A scheme to provide every farmer with a Soil Health Card, which will carry crop-wise recommendations of nutrients and fertilizers required for the individual farms.',
          hi: 'प्रत्येक किसान को मृदा स्वास्थ्य कार्ड प्रदान करने की एक योजना, जिसमें व्यक्तिगत खेतों के लिए आवश्यक पोषक तत्वों और उर्वरकों की फसल-वार सिफारिशें होंगी।'
        },
        eligibility: {
          en: 'Available to all farmers across the country.',
          hi: 'देश भर के सभी किसानों के लिए उपलब्ध है।'
        },
        link: 'https://soilhealth.dac.gov.in/',
        category: 'Farming Practices'
      }
    ];

    await Scheme.insertMany(schemesToSeed);
    console.log('Government schemes have been successfully seeded.');

  } catch (err) {
    console.error('Error seeding schemes:', err);
  }
};


app.listen(PORT, () => {
  console.log(`Smart Krishi Sahayak backend running on http://localhost:${PORT}`);
  seedSchemes();
});
