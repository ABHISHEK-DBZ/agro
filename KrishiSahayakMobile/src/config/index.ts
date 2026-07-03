// App Configuration
export const APP_CONFIG = {
  name: 'Krishi Sahayak',
  version: '2.0.0',
  buildNumber: 1,

  // API Endpoints
  api: {
    // Backend server (Node.js/Express)
    baseUrl: __DEV__
      ? 'http://localhost:5000/api'
      : 'https://smart-krishi-backend.azurewebsites.net/api',

    // External APIs
    openMeteo: 'https://api.open-meteo.com/v1',
    dataGov: 'https://api.data.gov.in/resource',
    dataGovApiKey: '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
  },

  // Firebase config (loaded from environment)
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  },

  // Cache durations (ms)
  cache: {
    weather: 5 * 60 * 1000, // 5 minutes
    market: 10 * 60 * 1000, // 10 minutes
    crops: 24 * 60 * 60 * 1000, // 24 hours
    schemes: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Feature flags
  features: {
    enableDiseaseDetection: true,
    enableCommunity: true,
    enableOfflineMode: true,
    enablePushNotifications: true,
  },
} as const;

export default APP_CONFIG;
