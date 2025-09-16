import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

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

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode).then(() => {
      // Store the selected language in localStorage for persistence
      localStorage.setItem('language', languageCode);
      
      // Force a page reload to ensure all components update properly
      window.location.reload();
    }).catch((error) => {
      console.error('Language change failed:', error);
    });
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[1]; // Default to Hindi

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
        <Languages size={18} />
        <span className="text-sm font-medium">{currentLanguage.nativeName}</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="p-2 max-h-80 overflow-y-auto">
          <div className="text-xs text-gray-500 px-2 py-1 border-b border-gray-100 mb-2">
            Select Language / भाषा चुनें
          </div>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-150 flex items-center justify-between ${
                i18n.language === language.code ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
              }`}
            >
              <div>
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-xs text-gray-500">{language.name}</div>
              </div>
              {i18n.language === language.code && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
