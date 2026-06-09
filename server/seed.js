import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  console.log('Seeding Firestore...\n');

  // Seed crops
  const crops = [
    { name: { en: 'Wheat', hi: 'गेहूं' }, season: 'Rabi', duration: '120-150 days', temperature: '15-25°C', rainfall: '50-75 cm' },
    { name: { en: 'Rice', hi: 'धान' }, season: 'Kharif', duration: '90-150 days', temperature: '20-35°C', rainfall: '100-200 cm' },
    { name: { en: 'Cotton', hi: 'कपास' }, season: 'Kharif', duration: '150-180 days', temperature: '21-30°C', rainfall: '50-100 cm' },
    { name: { en: 'Sugarcane', hi: 'गन्ना' }, season: 'Kharif', duration: '10-12 months', temperature: '25-30°C', rainfall: '100-150 cm' },
    { name: { en: 'Maize', hi: 'मक्का' }, season: 'Kharif', duration: '90-110 days', temperature: '20-30°C', rainfall: '50-100 cm' },
  ];
  for (const crop of crops) {
    await db.collection('crops').add({ ...crop, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  console.log(`✅ Added ${crops.length} crops`);

  // Seed swarm peers
  const peers = [
    { name: 'Rahul Sharma', avatar: '', status: 'Online', location: 'Ludhiana, Punjab', lat: 30.9, lng: 75.85, activity: 'Checking wheat crop', role: 'farmer' },
    { name: 'Dr. Priya Patel', avatar: '', status: 'Online', location: 'Delhi', lat: 28.61, lng: 77.23, activity: 'Providing expert advice', role: 'expert' },
    { name: 'Tractor Hub-01', avatar: '', status: 'In-Field', location: 'Karnal, Haryana', lat: 29.68, lng: 76.98, activity: 'Ploughing', role: 'machinery-hub' },
    { name: 'Amit Verma', avatar: '', status: 'Offline', location: 'Jaipur, Rajasthan', lat: 26.91, lng: 75.78, activity: '', role: 'farmer' },
    { name: 'Neha Singh', avatar: '', status: 'Online', location: 'Lucknow, UP', lat: 26.84, lng: 80.94, activity: 'Monitoring rice field', role: 'farmer' },
  ];
  for (const peer of peers) {
    await db.collection('swarmPeers').add(peer);
  }
  console.log(`✅ Added ${peers.length} swarm peers`);

  // Seed telemetry equipment
  const equipment = [
    { name: 'Tractor-01', type: 'tractor', model: 'John Deere 5310', status: 'Active', battery: 100, performance: '98%', coordinates: { lat: 30.9, lng: 75.85 }, rate: 1200, owner: 'Rahul Sharma' },
    { name: 'Drone-02', type: 'drone', model: 'DJI Agras T30', status: 'Deploying', battery: 85, performance: '92%', coordinates: { lat: 29.68, lng: 76.98 }, rate: 2500, owner: 'Drone Services' },
    { name: 'Sensor-A1', type: 'sensor', model: 'Soil Scout', status: 'Active', battery: 72, performance: '100%', coordinates: { lat: 26.84, lng: 80.94 }, rate: 500, owner: 'Neha Singh' },
    { name: 'Tractor-02', type: 'tractor', model: 'Mahindra 475 DI', status: 'Idle', battery: 100, performance: '95%', coordinates: { lat: 28.61, lng: 77.23 }, rate: 1000, owner: 'Farm Co-op' },
    { name: 'Drone-01', type: 'drone', model: 'DJI Phantom 4', status: 'Charging', battery: 30, performance: '88%', coordinates: { lat: 26.91, lng: 75.78 }, rate: 2000, owner: 'Amit Verma' },
  ];
  for (const eq of equipment) {
    await db.collection('telemetryEquipment').add(eq);
  }
  console.log(`✅ Added ${equipment.length} telemetry equipment`);

  // Seed market prices
  const prices = [
    { commodity: 'Wheat', state: 'Punjab', district: 'Ludhiana', market: 'Ludhiana Mandi', minPrice: 2400, maxPrice: 2600, modalPrice: 2500, unit: 'quintal', variety: 'PBW 343' },
    { commodity: 'Rice', state: 'Haryana', district: 'Karnal', market: 'Karnal Grain Market', minPrice: 3000, maxPrice: 3400, modalPrice: 3200, unit: 'quintal', variety: 'Basmati 1121' },
    { commodity: 'Cotton', state: 'Gujarat', district: 'Rajkot', market: 'Rajkot Cotton Market', minPrice: 8200, maxPrice: 8800, modalPrice: 8500, unit: 'quintal', variety: 'H-1236' },
    { commodity: 'Sugarcane', state: 'UP', district: 'Muzaffarnagar', market: 'Muzaffarnagar Market', minPrice: 320, maxPrice: 380, modalPrice: 350, unit: 'quintal', variety: 'Co 0238' },
    { commodity: 'Potato', state: 'West Bengal', district: 'Hooghly', market: 'Hooghly Market', minPrice: 18, maxPrice: 32, modalPrice: 25, unit: 'kg', variety: 'Jyoti' },
  ];
  for (const price of prices) {
    await db.collection('marketPrices').add({ ...price, date: new Date().toISOString() });
  }
  console.log(`✅ Added ${prices.length} market prices`);

  // Seed community posts
  const posts = [
    { title: 'Best fertilizer for wheat?', content: 'Looking for recommendations on the best fertilizer for wheat crop in Punjab region.', userId: 'seed-user-1', userEmail: 'farmer@example.com', likes: 5, comments: [], createdAt: admin.firestore.FieldValue.serverTimestamp() },
    { title: 'Rice field pest problem', content: 'Noticed some pests in my rice field near Karnal. Any organic solutions?', userId: 'seed-user-2', userEmail: 'farmer2@example.com', likes: 3, comments: [], createdAt: admin.firestore.FieldValue.serverTimestamp() },
  ];
  for (const post of posts) {
    await db.collection('communityPosts').add(post);
  }
  console.log(`✅ Added ${posts.length} community posts`);

  // Seed health data
  await db.collection('health').add({ status: 'healthy', uptime: 100, timestamp: admin.firestore.FieldValue.serverTimestamp() });
  console.log('✅ Added health data');

  // Seed visitor stats
  await db.collection('visitor_stats').add({ page: '/', visits: 1, timestamp: admin.firestore.FieldValue.serverTimestamp() });
  console.log('✅ Added visitor stats');

  // Seed system metrics
  await db.collection('system_metrics').add({ name: 'api_response_time', value: 120, unit: 'ms', timestamp: admin.firestore.FieldValue.serverTimestamp() });
  console.log('✅ Added system metrics');

  console.log('\n✨ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
