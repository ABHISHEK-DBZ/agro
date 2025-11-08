import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Extended Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Firestore reference
const db = admin.firestore();

// JWT secret (in production, use Firebase Config)
const JWT_SECRET = process.env.JWT_SECRET || 'krishi-sahayak-secret-key';

// Middleware for authentication
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Krishi Sahayak API is running on Firebase',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth Routes
app.post('/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, location } = req.body;

    // Check if user already exists
    const userQuery = await db.collection('users').where('email', '==', email).get();
    if (!userQuery.empty) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userRef = await db.collection('users').add({
      email,
      password: hashedPassword,
      name,
      phone,
      location,
      role: 'farmer',
      isVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: userRef.id, email, role: 'farmer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userRef.id,
        name,
        email,
        phone,
        location,
        role: 'farmer'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const userQuery = await db.collection('users').where('email', '==', email).get();
    if (userQuery.empty) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await userDoc.ref.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        location: userData.location,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Weather Routes
app.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const API_KEY = process.env.OPENWEATHER_API_KEY || 'demo-key';
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    const weatherData = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      pressure: response.data.main.pressure,
      visibility: response.data.visibility / 1000,
      icon: response.data.weather[0].icon,
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, data: weatherData });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch weather data',
      message: (error as any)?.response?.data?.message || 'Weather service unavailable'
    });
  }
});

// Crops Routes
app.get('/crops', async (req, res) => {
  try {
    const cropsSnapshot = await db.collection('crops').get();
    const crops = cropsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: crops });
  } catch (error) {
    console.error('Crops fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch crops data' });
  }
});

app.post('/crops', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const cropData = {
      ...req.body,
      userId: req.user!.userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const cropRef = await db.collection('crops').add(cropData);
    
    res.status(201).json({
      success: true,
      message: 'Crop added successfully',
      data: { id: cropRef.id, ...cropData }
    });
  } catch (error) {
    console.error('Crop creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to add crop' });
  }
});

// Government Schemes Routes
app.get('/schemes', async (req, res) => {
  try {
    const schemesSnapshot = await db.collection('schemes').get();
    const schemes = schemesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: schemes });
  } catch (error) {
    console.error('Schemes fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schemes data' });
  }
});

// Market Prices Routes
app.get('/market/prices', async (req, res) => {
  try {
    const pricesSnapshot = await db.collection('marketPrices').get();
    const prices = pricesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: prices });
  } catch (error) {
    console.error('Market prices fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch market prices' });
  }
});

// User Profile Routes
app.get('/users/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userDoc = await db.collection('users').doc(req.user!.userId).get();
    
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    if (userData) {
      delete userData.password; // Remove password from response
    }

    res.json({
      success: true,
      data: {
        id: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

app.put('/users/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updates = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Remove sensitive fields
    delete updates.password;
    delete updates.role;
    delete updates.createdAt;

    await db.collection('users').doc(req.user!.userId).update(updates);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Community Routes
app.get('/community/posts', async (req, res) => {
  try {
    const postsSnapshot = await db.collection('communityPosts')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Community posts fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch community posts' });
  }
});

app.post('/community/posts', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const postData = {
      ...req.body,
      userId: req.user!.userId,
      userEmail: req.user!.email,
      likes: 0,
      comments: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const postRef = await db.collection('communityPosts').add(postData);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { id: postRef.id, ...postData }
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);