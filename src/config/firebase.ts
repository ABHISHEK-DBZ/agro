import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Determine if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// For testing purposes, let's disable emulator mode temporarily to use real Firebase
const useEmulator = false; // Set to false to use real Firebase

// Firebase configuration - secure load from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
export const analytics = !isDevelopment && typeof window !== 'undefined' 
  ? getAnalytics(app) 
  : null;

// Connect to emulators in development
if (useEmulator && isDevelopment && typeof window !== 'undefined') {
  console.log('🔧 Development mode - setting up offline Firebase');
  
  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9098', { disableWarnings: true });
    console.log('📱 Connected to Firebase Auth Emulator');
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🗄️ Connected to Firebase Firestore Emulator');
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('📁 Connected to Firebase Storage Emulator');
  } catch (error) {
    console.log('ℹ️ Emulator connection info:', error);
  }
} else {
  console.log('🔥 Using production Firebase services');
}

// Auth configuration
auth.useDeviceLanguage(); // Use device language for Firebase Auth UI

export default app;