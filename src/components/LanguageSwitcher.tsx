import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useSafeTranslation } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { changeLanguage, currentLanguage } = useSafeTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
  ];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Update both i18n directly AND our context (which persists & dispatches events)
      await i18n.changeLanguage(languageCode);
      await changeLanguage(languageCode);
      localStorage.setItem('language', languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      document.documentElement.setAttribute('lang', languageCode);
      setOpen(false);
    } catch (e) {
      console.error('Failed to change language:', e);
    }
  };

  const active = languages.find(lang => lang.code === (currentLanguage || i18n.language)) || languages[1];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm hover:bg-sunken transition-colors focus-ring"
        aria-label="Switch language"
        aria-expanded={open}
      >
        <Languages className="w-4 h-4 text-ink-600" />
        <span className="text-sm font-medium text-strong hidden sm:inline">{active.nativeName}</span>
        <span className="text-sm font-medium text-strong sm:hidden">{active.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-64 card animate-fade-in py-1.5 z-50"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider border-b border-subtle">
            Select Language / भाषा चुनें
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {languages.map((language) => {
              const isActive = language.code === (currentLanguage || i18n.language);
              return (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 mx-1 rounded-sm text-sm transition-colors ${
                    isActive ? 'bg-leaf-50 text-leaf-700 font-medium' : 'text-ink-700 hover:bg-sunken'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-muted">{language.name}</div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-leaf-700" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
