import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sprout,
  Home,
  Bug,
  TrendingUp,
  FileText,
  Bot,
  User,
  BarChart3,
  Wifi
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  hideLogout?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ hideLogout }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
  { path: '/dashboard', icon: Home, label: t('navigation.dashboard') || 'Dashboard' },
  { path: '/live-weather', icon: Wifi, label: 'Live Weather', isNew: true },
  { path: '/crop-info', icon: Sprout, label: t('navigation.crops') || 'Crops' },
  { path: '/disease-detection', icon: Bug, label: t('navigation.diseases') || 'Diseases' },
  { path: '/mandi-prices', icon: TrendingUp, label: t('navigation.prices') || 'Prices' },
  { path: '/live-market', icon: BarChart3, label: 'Live Market', isNew: true },
  { path: '/government-schemes', icon: FileText, label: t('navigation.schemes') || 'Schemes' },
  { path: '/agent', icon: Bot, label: t('navigation.agent') || 'AI Agent' },
  { path: '/profile', icon: User, label: t('navigation.profile') || 'Profile' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b border-green-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="relative p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Sprout className="h-8 w-8 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                {t('app.title')}
              </span>
              <div className="text-xs text-green-600 font-medium">Smart Agriculture</div>
            </div>
          </div>

          {/* Enhanced Navigation Links */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-b from-green-500 to-emerald-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-green-700 hover:bg-white/60 hover:shadow-md'
                  }`}
                >
                  <div className={`p-1 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-white/20' : 'group-hover:bg-green-100'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <>
                    <span className="ml-2">{item.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"></div>
                    )}
                  </>
                </Link>
              );
            })}
            {/* Logout Button */}
            {!hideLogout && (
              <button
                className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>

          {/* Enhanced Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      <div className="lg:hidden bg-gradient-to-r from-green-50 to-blue-50 border-t border-green-200/50">
        <div className="flex overflow-x-auto py-3 px-4 space-x-3 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex flex-col items-center min-w-20 py-3 px-3 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-b from-green-500 to-emerald-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-green-700 hover:bg-white/60 hover:shadow-md'
                }`}
              >
                <div className={`p-2 rounded-xl mb-1 transition-all duration-300 ${
                  isActive ? 'bg-white/20' : 'group-hover:bg-green-100'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="whitespace-nowrap leading-tight">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
