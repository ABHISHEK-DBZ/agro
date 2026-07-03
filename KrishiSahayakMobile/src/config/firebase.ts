// Firebase Configuration with React Native Persistence
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APP_CONFIG from '../config';

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

const firebaseConfig = APP_CONFIG.firebase;

/**
 * Initialize Firebase with React Native persistence.
 * This ensures the user stays logged in across app restarts.
 */
export const initializeFirebase = async () => {
  if (app) return { app, auth, db, storage };

  // Validate config before initializing
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('[Firebase] Missing config (apiKey or projectId). Auth will be unavailable.');
    return { app: null, auth: null, db: null, storage: null };
  }

  try {
    app = initializeApp(firebaseConfig);

    // Use AsyncStorage for auth persistence (REQUIRED for React Native)
    // This prevents the "login again each time" issue
    try {
      // Dynamically import getReactNativePersistence — it's available at runtime
      // despite TS declaration mismatch in some SDK versions
      const { getReactNativePersistence } = require('firebase/auth') as {
        getReactNativePersistence: (storage: any) => any;
      };
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (initError) {
      // initializeAuth may fail if already called — use getAuth as safe fallback
      console.warn('[Firebase] initializeAuth fallback to getAuth:', initError);
      auth = getAuth(app);
    }

    db = getFirestore(app);
    storage = getStorage(app);

    // Connect to emulators in development
    if (__DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        if (auth) connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        if (db) connectFirestoreEmulator(db, 'localhost', 8080);
        if (storage) connectStorageEmulator(storage, 'localhost', 9199);
        console.log('[Firebase] Connected to emulators');
      } catch (emulatorError) {
        console.warn('[Firebase] Emulator connection failed:', emulatorError);
      }
    }

    console.log('[Firebase] Initialized successfully');
    return { app, auth, db, storage };
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
    return { app: null, auth: null, db: null, storage: null };
  }
};

export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirestoreDB = () => db;
export const getFirebaseStorage = () => storage;

export { auth, db, storage };
export default initializeFirebase;
