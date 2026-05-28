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

// Unified International fallback dictionary for extreme security cases
const globalFallbackDictionary: Record<string, Record<string, string>> = {
  en: {
    "dashboard.welcome": "Welcome to Smart Krishi Sahayak",
    "dashboard.todayWeather": "Today's Weather",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.recentAlerts": "Recent Alerts",
    "dashboard.marketPrices": "Market Prices",
    "weather.title": "Weather Forecast",
    "words.dashboard": "Dashboard",
    "words.weather": "Weather",
    "words.crops": "Crops",
    "words.diseases": "Diseases",
    "words.prices": "Prices",
    "words.community": "Community",
    "words.settings": "Settings"
  },
  hi: {
    "dashboard.welcome": "स्मार्ट कृषि सहायक में आपका स्वागत है",
    "dashboard.todayWeather": "आज का मौसम",
    "dashboard.quickActions": "त्वरित कार्य",
    "dashboard.recentAlerts": "हाल की चेतावनियां",
    "dashboard.marketPrices": "बाजार भाव",
    "weather.title": "मौसम पूर्वानुमान",
    "words.dashboard": "डैशबोर्ड",
    "words.weather": "मौसम",
    "words.crops": "फसल",
    "words.diseases": "रोग",
    "words.prices": "भाव",
    "words.community": "समुदाय",
    "words.settings": "सेटिंग्स"
  },
  mr: {
    "dashboard.welcome": "स्मार्ट कृषी सहाय्यक मध्ये आपले स्वागत आहे",
    "dashboard.todayWeather": "आजचे हवामान",
    "dashboard.quickActions": "त्वरित कार्ये",
    "dashboard.recentAlerts": "नुकत्याच आलेल्या चेतावणी",
    "dashboard.marketPrices": "बाजार भाव",
    "weather.title": "हवामान अंदाज",
    "words.dashboard": "डॅशबोर्ड",
    "words.weather": "हवामान",
    "words.crops": "पिके",
    "words.diseases": "रोग",
    "words.prices": "बाजार भाव",
    "words.community": "समुदाय",
    "words.settings": "सेटिंग्ज"
  }
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
      const localDict = globalFallbackDictionary[currentLanguage] || globalFallbackDictionary['hi'];
      if (localDict[key]) {
        return localDict[key];
      }
      return defaultText || globalFallbackDictionary['en'][key] || key;
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
