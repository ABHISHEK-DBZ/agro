import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseApp = null;

export const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Try to load service account from file (for local development)
    const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
    
    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });

      console.log('✅ Firebase Admin initialized with service account');
    } catch (fileError) {
      // If file doesn't exist, try environment variables
      console.log('📝 Service account file not found, trying environment variables...');
      
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
          databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });

        console.log('✅ Firebase Admin initialized with environment variables');
      } else {
        console.warn('⚠️ Firebase Admin not initialized - running in fallback mode');
        console.warn('Please provide either serviceAccountKey.json or environment variables');
      }
    }

    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    return null;
  }
};

export const getFirebaseAuth = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp ? admin.auth() : null;
};

export const getFirestore = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp ? admin.firestore() : null;
};

export default admin;
