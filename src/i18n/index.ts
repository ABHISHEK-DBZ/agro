import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translations
import en from './locales/en.json';
import hi from './locales/hi.json';
import gu from './locales/gu.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import bn from './locales/bn.json';
import pa from './locales/pa.json';
import or from './locales/or.json';
import ur from './locales/ur.json';

// Language configuration with native names
export const languages = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false
  },
  gu: {
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    rtl: false
  },
  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    rtl: false
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    rtl: false
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    rtl: false
  },
  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    rtl: false
  },
  ml: {
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    rtl: false
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    rtl: false
  },
  pa: {
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    rtl: false
  },
  or: {
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    flag: '🇮🇳',
    rtl: false
  },
  ur: {
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    rtl: true
  }
};

// Resources object
const resources = {
  en: { translation: en },
  hi: { translation: hi },
  gu: { translation: gu },
  mr: { translation: mr },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
  ml: { translation: ml },
  bn: { translation: bn },
  pa: { translation: pa },
  or: { translation: or },
  ur: { translation: ur }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (!lng) return value;
        if (format === 'currency' && typeof value === 'number') {
          return new Intl.NumberFormat(lng === 'hi' ? 'hi-IN' : lng, {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(value);
        }
        if (format === 'number' && typeof value === 'number') {
          return new Intl.NumberFormat(lng === 'hi' ? 'hi-IN' : lng).format(value);
        }
        if (format === 'date' && (value instanceof Date || typeof value === 'string')) {
          const date = typeof value === 'string' ? new Date(value) : value;
          return new Intl.DateTimeFormat(lng === 'hi' ? 'hi-IN' : lng, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(date);
        }
        return value;
      }
    },

    defaultNS: 'translation',
    ns: ['translation'],

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },

    debug: false,
    supportedLngs: Object.keys(languages),
    nonExplicitSupportedLngs: true,
    returnNull: false,
    returnEmptyString: false,
    returnObjects: true,

    // Performance
    load: 'languageOnly',
    preload: ['en', 'hi']
  });

export default i18n;