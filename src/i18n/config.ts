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
    lng: 'en', // Set to English first for faster loading
    fallbackLng: 'en',
    debug: false, // Disable debug for production
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false // Disable suspense to prevent loading issues
    }
  });

export default i18n;
