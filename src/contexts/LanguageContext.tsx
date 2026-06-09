import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lng: string) => Promise<void>;
  safeT: (key: string, defaultText?: string) => string;
  isLowBandwidthMode: boolean;
  toggleLowBandwidthMode: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useSafeTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useSafeTranslation must be used within a LanguageProvider');
  }
  return context;
};

// Unified International fallback dictionary for missing translations
// Provides safety net when translation file lacks a key
const globalFallbackDictionary: Record<string, Record<string, string>> = {
  en: {
    "app.title": "Smart Krishi Sahayak",
    "app.subtitle": "Your Agriculture Assistant",
    "nav.dashboard": "Dashboard",
    "nav.live": "Live Features",
    "nav.dataManagement": "Data Management",
    "nav.tools": "Farm Tools",
    "nav.community": "Community",
    "nav.liveDashboard": "Live Dashboard",
    "nav.liveWeather": "Live Weather",
    "nav.liveMarket": "Live Market Prices",
    "nav.realTimeDashboard": "Real-Time Dashboard",
    "nav.farmTelemetry": "Farm Telemetry",
    "nav.dataSources": "Data Sources",
    "nav.analytics": "Analytics",
    "nav.cropInfo": "Crop Info",
    "nav.cropCalendar": "Crop Calendar",
    "nav.soilTesting": "Soil Testing",
    "nav.loanCalculator": "Loan Calculator",
    "nav.dailyTracking": "Daily Log",
    "nav.diseaseDetection": "Disease Detection",
    "nav.aiAgent": "AI Assistant",
    "nav.communityHub": "Community",
    "nav.grievances": "Grievances",
    "nav.grievancesAdmin": "Grievances Admin",
    "nav.schemes": "Government Schemes",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.notifications": "Notifications",
    "nav.logout": "Logout",
    "dashboard.welcome": "Welcome to Smart Krishi Sahayak",
    "dashboard.todayWeather": "Today's Weather",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.recentAlerts": "Recent Alerts",
    "dashboard.marketPrices": "Market Prices",
    "dashboard.viewAllPrices": "View All Prices",
    "weather.title": "Weather Forecast",
    "weather.temperature": "Temperature",
    "weather.humidity": "Humidity",
    "weather.rainfall": "Rainfall",
    "weather.windSpeed": "Wind Speed",
    "weather.forecast": "7-Day Forecast",
    "weather.location": "Location",
    "weather.fetching": "Getting weather data...",
    "weather.fetchError": "Unable to fetch weather data",
    "weather.locationError": "Location access denied.",
    "weather.noGeolocation": "Geolocation not supported",
    "weather.searchPlaceholder": "Search for a city or location...",
    "weather.useCurrentLocation": "Use Current Location",
    "crops.title": "Crop Information",
    "crops.subtitle": "Detailed guides for various crops.",
    "diseases.title": "Plant Disease Detection",
    "diseases.subtitle": "Upload an image to identify crop diseases",
    "diseases.chooseImage": "Choose Image",
    "diseases.analyze": "Analyze Disease",
    "diseases.analyzing": "Analyzing...",
    "diseases.uploadPrompt": "Your image will appear here.",
    "diseases.aiWorking": "Our AI is analyzing your image...",
    "diseases.diseaseDetected": "Disease Detected",
    "prices.title": "Mandi Prices",
    "prices.subtitle": "Latest agricultural commodity prices",
    "schemes.title": "Government Schemes",
    "schemes.subtitle": "Explore beneficial schemes for farmers",
    "aiagent.title": "AI Agriculture Agent",
    "aiagent.subtitle": "Ask me anything about farming",
    "aiagent.placeholder": "Type your question here...",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.refresh": "Refresh",
    "common.loading": "Loading...",
    "common.error": "Error occurred",
    "common.retry": "Retry",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.submit": "Submit",
    "common.close": "Close",
    "profile.editProfile": "Edit Profile",
    "profile.farmInfo": "Personal & Farm Information",
    "auth.loginTitle": "Login to Your Account",
    "auth.login": "Login",
    "auth.register": "Register"
  },
  hi: {
    "app.title": "स्मार्ट कृषि सहायक",
    "nav.dashboard": "डैशबोर्ड",
    "nav.live": "लाइव सुविधाएं",
    "nav.tools": "कृषि उपकरण",
    "nav.community": "समुदाय",
    "nav.liveWeather": "लाइव मौसम",
    "nav.cropInfo": "फसल जानकारी",
    "nav.diseaseDetection": "रोग पहचान",
    "nav.aiAgent": "AI सहायक",
    "nav.schemes": "सरकारी योजनाएं",
    "nav.profile": "प्रोफाइल",
    "nav.settings": "सेटिंग्स",
    "nav.grievances": "शिकायतें",
    "nav.analytics": "विश्लेषण",
    "dashboard.welcome": "स्मार्ट कृषि सहायक में आपका स्वागत है",
    "dashboard.todayWeather": "आज का मौसम",
    "dashboard.quickActions": "त्वरित कार्य",
    "dashboard.recentAlerts": "हाल की चेतावनियां",
    "dashboard.marketPrices": "बाजार भाव",
    "dashboard.viewAllPrices": "सभी भाव देखें",
    "weather.title": "मौसम पूर्वानुमान",
    "weather.temperature": "तापमान",
    "weather.humidity": "नमी",
    "weather.rainfall": "वर्षा",
    "weather.windSpeed": "हवा की गति",
    "weather.forecast": "7-दिन पूर्वानुमान",
    "weather.location": "स्थान",
    "weather.fetching": "मौसम डेटा प्राप्त कर रहे हैं...",
    "weather.fetchError": "मौसम डेटा प्राप्त नहीं कर सके",
    "crops.title": "फसल जानकारी",
    "diseases.title": "पौधों की बीमारी की पहचान",
    "prices.title": "मंडी भाव",
    "schemes.title": "सरकारी योजनाएं",
    "aiagent.title": "AI कृषि एजेंट",
    "aiagent.subtitle": "खेती के बारे में मुझसे कुछ भी पूछें",
    "aiagent.placeholder": "अपना सवाल यहां टाइप करें...",
    "common.search": "खोजें",
    "common.filter": "फिल्टर",
    "common.refresh": "रिफ्रेश",
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि हुई",
    "common.retry": "पुनः प्रयास",
    "common.cancel": "रद्द करें",
    "common.save": "सेव करें",
    "common.submit": "सबमिट करें",
    "common.close": "बंद करें",
    "profile.editProfile": "प्रोफाइल संपादित करें",
    "auth.loginTitle": "अपने खाते में लॉगिन करें",
    "auth.login": "लॉगिन",
    "auth.register": "पंजीकरण"
  },
  mr: {
    "app.title": "स्मार्ट कृषी सहाय्यक",
    "nav.dashboard": "डॅशबोर्ड",
    "nav.live": "लाइव्ह वैशिष्ट्ये",
    "nav.tools": "शेती साधने",
    "nav.community": "समुदाय",
    "nav.cropInfo": "पीक माहिती",
    "nav.diseaseDetection": "रोग शोध",
    "nav.aiAgent": "AI सहाय्यक",
    "nav.schemes": "सरकारी योजना",
    "nav.profile": "प्रोफाइल",
    "nav.settings": "सेटिंग्ज",
    "nav.grievances": "तक्रारी",
    "dashboard.welcome": "स्मार्ट कृषी सहाय्यकामध्ये आपले स्वागत आहे",
    "dashboard.todayWeather": "आजचे हवामान",
    "dashboard.quickActions": "जलद कृती",
    "dashboard.recentAlerts": "अलीकडील सूचना",
    "dashboard.marketPrices": "बाजार भाव",
    "dashboard.viewAllPrices": "सर्व भाव पहा",
    "weather.title": "हवामान अंदाज",
    "weather.temperature": "तापमान",
    "crops.title": "पीक माहिती",
    "diseases.title": "पिकांच्या रोगांचा शोध",
    "prices.title": "मंडी भाव",
    "schemes.title": "सरकारी योजना",
    "aiagent.title": "AI कृषी एजंट",
    "aiagent.subtitle": "शेतीबद्दल मला काहीही विचारा",
    "aiagent.placeholder": "तुमचा प्रश्न इथे टाइप करा...",
    "common.search": "शोध",
    "common.loading": "लोड होत आहे...",
    "common.cancel": "रद्द करा",
    "common.save": "जतन करा",
    "common.close": "बंद करा",
    "auth.loginTitle": "तुमच्या खात्यात लॉगिन करा",
    "auth.login": "लॉगिन",
    "auth.register": "नोंदणी"
  }
};

// Auto-fill fallback for any language that doesn't have a translation
// Always falls back to English if a key is missing in the user's selected language
const ensureFallbacks = (_lng: string, key: string, currentValue: string): string => {
  if (currentValue && currentValue !== key) return currentValue;
  // If current value is missing or equal to key, try the English dictionary
  return globalFallbackDictionary['en']?.[key] || currentValue || key;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language || 'hi');
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState(() => {
    return localStorage.getItem('lowBandwidthMode') === 'true';
  });

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLanguage(i18nInstance.language);
    };
    window.addEventListener('languagechange', handleLangChange);
    return () => {
      window.removeEventListener('languagechange', handleLangChange);
    };
  }, [i18nInstance.language]);

  const changeLanguage = async (lng: string) => {
    await i18nInstance.changeLanguage(lng);
    setCurrentLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    document.documentElement.setAttribute('lang', lng);
  };

  const toggleLowBandwidthMode = () => {
    setIsLowBandwidthMode(prev => {
      const newVal = !prev;
      localStorage.setItem('lowBandwidthMode', String(newVal));
      return newVal;
    });
  };

  // Mixed script detection regex
  const isMixedScript = (text: string): boolean => {
    // English alphabets: [a-zA-Z]
    // Devanagari script: [\u0900-\u097F]
    const hasEnglish = /[a-zA-Z]/.test(text);
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    
    // Ignore URL patterns, file formats, and tags
    if (text.includes('http') || text.includes('://') || text.includes('.svg') || text.includes('.png')) {
      return false;
    }
    
    // Return true if it mixes standard English lettering with Devanagari within a single sentence label
    return hasEnglish && hasDevanagari;
  };

  // Safe translation resolver enforcing Module A Zero-Truncation Multilingual rules
  const safeT = (key: string, defaultText?: string): string => {
    const rawTranslation = t(key);

    // Fallback if missing or equal to raw key structure
    if (!rawTranslation || rawTranslation === key) {
      // 1) Try the local-language dictionary
      const localDict = globalFallbackDictionary[currentLanguage] || globalFallbackDictionary['hi'];
      if (localDict[key]) {
        return localDict[key];
      }
      // 2) Try English dictionary (cross-language safety net)
      const enValue = globalFallbackDictionary['en'][key];
      if (enValue) {
        return enValue;
      }
      // 3) Use defaultText provided, else the key itself
      return defaultText || key;
    }

    // Guard against half-translated outputs containing mixed scripts
    if (isMixedScript(rawTranslation)) {
      console.warn(`[Strict Regex Locale Guard] Mixed script detected on translation key: "${key}" ("${rawTranslation}"). Enforcing clean fallback.`);
      
      // Attempt clean fallback inside dictionaries
      const localDict = globalFallbackDictionary[currentLanguage];
      if (localDict && localDict[key]) {
        return localDict[key];
      }
      
      // Unified fallback
      return globalFallbackDictionary['en'][key] || defaultText || rawTranslation;
    }

    return rawTranslation;
  };

  // Register postProcessor dynamically to secure all standard i18next calls as well
  useEffect(() => {
    const mixedScriptProcessor = {
      name: 'mixedScriptGuard',
      type: 'postProcessor' as const,
      process: (value: string, key: string | string[]) => {
        const textKey = Array.isArray(key) ? key[0] : key;
        if (isMixedScript(value)) {
          const activeLng = i18nInstance.language || 'hi';
          const resolvedFallback = globalFallbackDictionary[activeLng]?.[textKey] || globalFallbackDictionary['en']?.[textKey];
          return resolvedFallback || value;
        }
        return value;
      }
    };
    
    // Register custom postProcessor
    try {
      i18n.use(mixedScriptProcessor);
    } catch (e) {
      // Already registered or loaded
    }
  }, [i18nInstance.language]);

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      safeT,
      isLowBandwidthMode,
      toggleLowBandwidthMode
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
