import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Cloud, 
  Sprout, 
  Bug, 
  TrendingUp, 
  FileText, 
  Bot,
  User
} from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('navigation.dashboard') },
    { path: '/weather', icon: Cloud, label: t('navigation.weather') },
    { path: '/crop-info', icon: Sprout, label: t('navigation.crops') },
    { path: '/disease-detection', icon: Bug, label: t('navigation.diseases') },
    { path: '/mandi-prices', icon: TrendingUp, label: t('navigation.prices') },
    { path: '/schemes', icon: FileText, label: t('navigation.schemes') },
    { path: '/agent', icon: Bot, label: t('navigation.agent') },
    { path: '/profile', icon: User, label: t('navigation.profile') }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 shadow-lg z-50 safe-area-bottom">
      <div className="container mx-auto max-w-4xl px-2 sm:px-3">
        <div className="py-1 sm:py-2">
          {/* Mobile Navigation - scrollable if many items */}
          <div className="flex justify-around items-center overflow-x-auto scrollbar-hide -mx-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-1.5 sm:p-2 rounded-lg transition-all duration-300 flex-shrink-0 min-w-0 ${
                    isActive 
                      ? 'text-green-600' 
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  <div className={`p-1 rounded-lg ${
                    isActive ? 'bg-green-100' : 'hover:bg-green-50'
                  }`}>
                    <Icon className="h-5 w-5 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium truncate max-w-[4rem] sm:max-w-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
