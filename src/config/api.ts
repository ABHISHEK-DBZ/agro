// API Configuration for Firebase Functions
export const API_CONFIG = {
  // Firebase Functions URL - will be set after deployment
  FIREBASE_FUNCTIONS_URL: import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'https://us-central1-smart-krishi-sahayak-6871c.cloudfunctions.net/api',
  
  // Local development fallback
  LOCAL_API_URL: 'http://localhost:5001/smart-krishi-sahayak-6871c/us-central1/api',
  
  // Current backend URL (for comparison)
  CURRENT_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Determine which API to use
  getApiUrl: () => {
    const isDevelopment = import.meta.env.MODE === 'development';
    const useFirebase = import.meta.env.VITE_USE_FIREBASE_FUNCTIONS === 'true';
    
    if (isDevelopment && !useFirebase) {
      return API_CONFIG.LOCAL_API_URL;
    }
    
    return API_CONFIG.FIREBASE_FUNCTIONS_URL;
  }
};

export default API_CONFIG;