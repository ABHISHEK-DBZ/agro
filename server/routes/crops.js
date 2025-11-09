import express from 'express';
import { getFirestore } from '../config/firebase-admin.js';

const router = express.Router();

/**
 * GET /api/crops
 * Get list of crops with information
 */
router.get('/', async (req, res) => {
  try {
    const db = getFirestore();
    
    if (!db) {
      // Fallback data if Firebase is not configured
      return res.json(getMockCropsData());
    }

    const cropsSnapshot = await db.collection('crops').get();
    
    if (cropsSnapshot.empty) {
      return res.json(getMockCropsData());
    }

    const crops = [];
    cropsSnapshot.forEach(doc => {
      crops.push({ id: doc.id, ...doc.data() });
    });

    res.json(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crops data',
      message: error.message 
    });
  }
});

/**
 * GET /api/crops/:id
 * Get detailed information about a specific crop
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();

    if (!db) {
      const mockData = getMockCropsData();
      const crop = mockData.find(c => c.id === id);
      return res.json(crop || { error: 'Crop not found' });
    }

    const cropDoc = await db.collection('crops').doc(id).get();

    if (!cropDoc.exists) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    res.json({ id: cropDoc.id, ...cropDoc.data() });
  } catch (error) {
    console.error('Error fetching crop details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crop details',
      message: error.message 
    });
  }
});

/**
 * POST /api/crops
 * Add a new crop (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const cropData = req.body;
    const db = getFirestore();

    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const cropRef = await db.collection('crops').add({
      ...cropData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({ 
      message: 'Crop added successfully', 
      id: cropRef.id 
    });
  } catch (error) {
    console.error('Error adding crop:', error);
    res.status(500).json({ 
      error: 'Failed to add crop',
      message: error.message 
    });
  }
});

// Mock data for fallback
function getMockCropsData() {
  return [
    {
      id: 'wheat',
      name: { en: 'Wheat', hi: 'गेहूं' },
      season: 'Rabi',
      duration: '120-150 days',
      soilType: 'Loamy soil with good drainage',
      climate: 'Cool and moist climate',
      temperature: '15-25°C',
      rainfall: '50-75 cm annually',
      majorStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh'],
      bestPractices: {
        en: [
          'Sow in November-December',
          'Use certified seeds (100-125 kg/hectare)',
          'Apply balanced fertilizers (NPK)',
          'Irrigate at critical stages (CRI, tillering, flowering)',
          'Control weeds early',
          'Harvest when grains are hard'
        ],
        hi: [
          'नवंबर-दिसंबर में बुवाई करें',
          'प्रमाणित बीज का उपयोग करें (100-125 किलो/हेक्टेयर)',
          'संतुलित उर्वरक (NPK) डालें',
          'महत्वपूर्ण चरणों में सिंचाई करें',
          'खरपतवार जल्दी नियंत्रित करें',
          'दाने कठोर होने पर कटाई करें'
        ]
      },
      diseases: ['Rust', 'Smut', 'Blight'],
      avgYield: '3-4 tons/hectare'
    },
    {
      id: 'rice',
      name: { en: 'Rice', hi: 'धान' },
      season: 'Kharif',
      duration: '90-150 days',
      soilType: 'Clay or loamy soil with water retention',
      climate: 'Hot and humid',
      temperature: '20-35°C',
      rainfall: '100-200 cm annually',
      majorStates: ['West Bengal', 'Punjab', 'Uttar Pradesh', 'Andhra Pradesh'],
      bestPractices: {
        en: [
          'Prepare nursery beds',
          'Transplant 20-30 day old seedlings',
          'Maintain 2-5 cm water level',
          'Apply nitrogen in splits',
          'Control stem borer and leaf folder',
          'Harvest at 80% maturity'
        ],
        hi: [
          'नर्सरी बेड तैयार करें',
          '20-30 दिन पुरानी पौध लगाएं',
          '2-5 सेमी जल स्तर बनाए रखें',
          'नाइट्रोजन विभाजित रूप से डालें',
          'तना छेदक और पत्ती मोड़क नियंत्रित करें',
          '80% परिपक्वता पर कटाई करें'
        ]
      },
      diseases: ['Blast', 'Brown spot', 'Sheath blight'],
      avgYield: '4-6 tons/hectare'
    },
    {
      id: 'cotton',
      name: { en: 'Cotton', hi: 'कपास' },
      season: 'Kharif',
      duration: '150-180 days',
      soilType: 'Deep, well-drained black cotton soil',
      climate: 'Warm and sunny',
      temperature: '21-30°C',
      rainfall: '50-100 cm',
      majorStates: ['Gujarat', 'Maharashtra', 'Telangana', 'Punjab'],
      bestPractices: {
        en: [
          'Use Bt cotton varieties',
          'Maintain proper plant spacing',
          'Apply balanced NPK fertilizers',
          'Control bollworms regularly',
          'Irrigate at flowering and boll formation',
          'Pick cotton when fully opened'
        ],
        hi: [
          'बीटी कपास की किस्मों का उपयोग करें',
          'उचित पौधे की दूरी बनाए रखें',
          'संतुलित NPK उर्वरक डालें',
          'गुलाबी सुंडी नियंत्रित करें',
          'फूल और गोल्ड बनने पर सिंचाई करें',
          'पूरी तरह खिलने पर कपास तोड़ें'
        ]
      },
      diseases: ['Wilt', 'Root rot', 'Leaf curl virus'],
      avgYield: '500-600 kg/hectare (lint)'
    }
  ];
}

export default router;
