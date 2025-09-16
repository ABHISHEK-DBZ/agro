import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import mrTranslations from './locales/mr.json';
import guTranslations from './locales/gu.json';
import taTranslations from './locales/ta.json';
import teTranslations from './locales/te.json';
import paTranslations from './locales/pa.json';
import bnTranslations from './locales/bn.json';
import knTranslations from './locales/kn.json';
import mlTranslations from './locales/ml.json';
import orTranslations from './locales/or.json';
import urTranslations from './locales/ur.json';

// Enhanced language configuration with proper fallbacks
const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  mr: { translation: mrTranslations },
  gu: { translation: guTranslations },
  ta: { translation: taTranslations },
  te: { translation: teTranslations },
  pa: { translation: paTranslations },
  bn: { translation: bnTranslations },
  kn: { translation: knTranslations },
  ml: { translation: mlTranslations },
  or: { translation: orTranslations },
  ur: { translation: urTranslations },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'hi', // Default to Hindi for Indian farmers
    fallbackLng: ['hi', 'en'], // Try Hindi first, then English
    debug: true, // Enable debug to see what's happening
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false // Disable suspense to prevent loading issues
    },
    
    // Namespace configuration for better organization
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'], // language to not persist on localStorage
    },
    
    // Supported languages list (fixed property name)
    supportedLngs: ['en', 'hi', 'mr', 'gu', 'ta', 'te', 'pa', 'bn', 'kn', 'ml', 'or', 'ur'],
    
    // Load path for dynamic loading if needed
    load: 'languageOnly',
    
    // Missing key handling for better debugging
    saveMissing: false,
    missingKeyHandler: (lng, _ns, key) => {
      console.warn(`Missing translation key: ${key} for language: ${lng}`);
    }
  });

export default i18n;
