import express from 'express';
import { getFirestore } from '../config/firebase-admin.js';
import axios from 'axios';

const router = express.Router();

/**
 * GET /api/market/prices
 * Get current market prices for crops
 */
router.get('/prices', async (req, res) => {
  try {
    const { state, district, commodity, limit = 10 } = req.query;
    const db = getFirestore();

    if (!db) {
      return res.json(getMockMarketPrices());
    }

    // Query Firestore for market prices
    let query = db.collection('marketPrices');

    if (state) query = query.where('state', '==', state);
    if (district) query = query.where('district', '==', district);
    if (commodity) query = query.where('commodity', '==', commodity);

    query = query.orderBy('date', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.json(getMockMarketPrices());
    }

    const prices = [];
    snapshot.forEach(doc => {
      prices.push({ id: doc.id, ...doc.data() });
    });

    res.json(prices);
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.json(getMockMarketPrices());
  }
});

/**
 * GET /api/market/trending
 * Get trending commodity prices
 */
router.get('/trending', async (req, res) => {
  try {
    const db = getFirestore();

    if (!db) {
      return res.json({
        trending: ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Potato'],
        updatedAt: new Date().toISOString()
      });
    }

    // In production, calculate trending based on query frequency or price changes
    const trendingCommodities = [
      { name: 'Wheat', priceChange: '+5%', currentPrice: 2500 },
      { name: 'Rice', priceChange: '+3%', currentPrice: 3200 },
      { name: 'Cotton', priceChange: '-2%', currentPrice: 8500 },
      { name: 'Sugarcane', priceChange: '+7%', currentPrice: 350 },
      { name: 'Potato', priceChange: '+12%', currentPrice: 25 }
    ];

    res.json({
      trending: trendingCommodities,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trending commodities:', error);
    res.status(500).json({ error: 'Failed to fetch trending data' });
  }
});

/**
 * GET /api/market/states
 * Get list of states with market data
 */
router.get('/states', async (req, res) => {
  try {
    const indianStates = [
      'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
      'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
      'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
      'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    res.json(indianStates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

/**
 * GET /api/market/commodities
 * Get list of available commodities
 */
router.get('/commodities', async (req, res) => {
  try {
    const commodities = [
      { id: 'wheat', name: 'Wheat', category: 'Grains', unit: 'quintal' },
      { id: 'rice', name: 'Rice', category: 'Grains', unit: 'quintal' },
      { id: 'cotton', name: 'Cotton', category: 'Cash Crop', unit: 'quintal' },
      { id: 'sugarcane', name: 'Sugarcane', category: 'Cash Crop', unit: 'quintal' },
      { id: 'maize', name: 'Maize', category: 'Grains', unit: 'quintal' },
      { id: 'bajra', name: 'Bajra', category: 'Grains', unit: 'quintal' },
      { id: 'jowar', name: 'Jowar', category: 'Grains', unit: 'quintal' },
      { id: 'potato', name: 'Potato', category: 'Vegetable', unit: 'kg' },
      { id: 'onion', name: 'Onion', category: 'Vegetable', unit: 'kg' },
      { id: 'tomato', name: 'Tomato', category: 'Vegetable', unit: 'kg' }
    ];

    res.json(commodities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commodities' });
  }
});

/**
 * POST /api/market/price-alert
 * Set price alert for a commodity
 */
router.post('/price-alert', async (req, res) => {
  try {
    const { userId, commodity, targetPrice, condition } = req.body;

    if (!userId || !commodity || !targetPrice || !condition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getFirestore();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const alertRef = await db.collection('priceAlerts').add({
      userId,
      commodity,
      targetPrice,
      condition, // 'above' or 'below'
      active: true,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Price alert created successfully',
      alertId: alertRef.id
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({ error: 'Failed to create price alert' });
  }
});

// Mock data for fallback
function getMockMarketPrices() {
  return [
    {
      id: '1',
      commodity: 'Wheat',
      state: 'Punjab',
      district: 'Ludhiana',
      market: 'Ludhiana Mandi',
      minPrice: 2400,
      maxPrice: 2600,
      modalPrice: 2500,
      unit: 'quintal',
      date: new Date().toISOString(),
      variety: 'PBW 343'
    },
    {
      id: '2',
      commodity: 'Rice',
      state: 'Haryana',
      district: 'Karnal',
      market: 'Karnal Grain Market',
      minPrice: 3000,
      maxPrice: 3400,
      modalPrice: 3200,
      unit: 'quintal',
      date: new Date().toISOString(),
      variety: 'Basmati 1121'
    },
    {
      id: '3',
      commodity: 'Cotton',
      state: 'Gujarat',
      district: 'Rajkot',
      market: 'Rajkot Cotton Market',
      minPrice: 8200,
      maxPrice: 8800,
      modalPrice: 8500,
      unit: 'quintal',
      date: new Date().toISOString(),
      variety: 'H-1236'
    },
    {
      id: '4',
      commodity: 'Sugarcane',
      state: 'Uttar Pradesh',
      district: 'Muzaffarnagar',
      market: 'Muzaffarnagar Market',
      minPrice: 320,
      maxPrice: 380,
      modalPrice: 350,
      unit: 'quintal',
      date: new Date().toISOString(),
      variety: 'Co 0238'
    },
    {
      id: '5',
      commodity: 'Potato',
      state: 'West Bengal',
      district: 'Hooghly',
      market: 'Hooghly Vegetable Market',
      minPrice: 18,
      maxPrice: 32,
      modalPrice: 25,
      unit: 'kg',
      date: new Date().toISOString(),
      variety: 'Jyoti'
    }
  ];
}

export default router;
