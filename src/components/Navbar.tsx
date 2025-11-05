import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sprout,
  Bug,
  TrendingUp,
  FileText,
  Bot,
  User,
  Settings,
  Users,
  ChevronDown,
  Menu,
  X,
  CloudRain,
  Leaf,
  Activity,
  LogOut,
  Bell,
  Database,
  BarChart3
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  hideLogout?: boolean;
}

interface MenuItem {
  path: string;
  name: string;
  nameKey: string;
  icon: React.ComponentType<any>;
  badge?: string;
  isLive?: boolean;
}

interface MenuSection {
  title: string;
  titleKey: string;
  items: MenuItem[];
}

const Navbar: React.FC<NavbarProps> = ({ hideLogout = false }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const menuSections: MenuSection[] = [
    {
      title: 'Live Features',
      titleKey: 'nav.live',
      items: [
        { path: '/live-weather', name: 'Live Weather', nameKey: 'nav.liveWeather', icon: CloudRain, badge: 'LIVE', isLive: true },
        { path: '/market-prices', name: 'Market Prices', nameKey: 'nav.liveMarket', icon: TrendingUp, badge: 'LIVE', isLive: true },
        { path: '/real-time-dashboard', name: 'Real-Time Dashboard', nameKey: 'nav.realTimeDashboard', icon: Activity, badge: 'LIVE', isLive: true },
      ]
    },
    {
      title: 'Data Management',
      titleKey: 'nav.dataManagement',
      items: [
        { path: '/data-sources', name: 'Data Sources', nameKey: 'nav.dataSources', icon: Database, badge: 'NEW' },
        { path: '/analytics', name: 'Analytics', nameKey: 'nav.analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'Farm Tools',
      titleKey: 'nav.tools',
      items: [
        { path: '/crop-management', name: 'Crop Management', nameKey: 'nav.cropInfo', icon: Leaf },
        { path: '/disease-detection', name: 'Disease Detection', nameKey: 'nav.diseaseDetection', icon: Bug },
        { path: '/ai-agent', name: 'AI Assistant', nameKey: 'nav.aiAgent', icon: Bot, badge: 'AI', isLive: false },
      ]
    },
    {
      title: 'Community',
      titleKey: 'nav.community',
      items: [
        { path: '/community', name: 'Community', nameKey: 'nav.communityHub', icon: Users },
        { path: '/government-schemes', name: 'Schemes', nameKey: 'nav.schemes', icon: FileText },
        { path: '/profile', name: 'Profile', nameKey: 'nav.profile', icon: User },
        { path: '/settings', name: 'Settings', nameKey: 'nav.settings', icon: Settings },
      ]
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const toggleDropdown = (section: string) => {
    setActiveDropdown(activeDropdown === section ? null : section);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (userProfile?.displayName) return userProfile.displayName;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'किसान';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-xl border-b border-green-200/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Sprout className="h-8 w-8" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  Smart Krishi Sahayak
                </span>
                <div className="text-xs text-green-700 font-semibold">Smart Agriculture</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-1" ref={dropdownRef}>
            {menuSections.map((section) => {
              const isDropdownActive = activeDropdown === section.title;
              const hasActiveItem = section.items.some(item => isActive(item.path));
              
              // For single-item sections, show direct links
              if (section.items.length === 1) {
                const item = section.items[0];
                const isItemActive = isActive(item.path);
                return (
                  <Link
                    key={section.title}
                    to={item.path}
                    className={`group flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isItemActive 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                        : 'text-gray-700 hover:text-green-700 hover:bg-green-50 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isItemActive ? 'bg-white/20' : 'group-hover:bg-green-100'
                    }`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="ml-2">{t(item.nameKey)}</span>
                    {item.badge && (
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full font-bold ${
                        item.isLive 
                          ? 'bg-red-100 text-red-600 animate-pulse' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              // For multi-item sections, show dropdown
              return (
                <div key={section.title} className="relative">
                  <button
                    onClick={() => toggleDropdown(section.title)}
                    className={`group flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      hasActiveItem || isDropdownActive
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:text-green-700 hover:bg-green-50 hover:shadow-md'
                    }`}
                  >
                    <span>{t(section.titleKey)}</span>
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      isDropdownActive ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {isDropdownActive && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-green-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        {t(section.titleKey)}
                      </div>
                      {section.items.map((item) => {
                        const isItemActive = isActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-3 py-2 text-sm transition-all duration-200 ${
                              isItemActive
                                ? 'bg-green-50 text-green-700 border-r-2 border-green-500' 
                                : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                              isItemActive ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-green-100'
                            }`}>
                              <item.icon className="h-4 w-4" />
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="font-medium">{t(item.nameKey)}</div>
                              {item.badge && (
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                                  item.isLive 
                                    ? 'bg-red-100 text-red-600 animate-pulse' 
                                    : 'bg-orange-100 text-orange-600'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            {user && !hideLogout && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials()}
                </div>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop Language Switcher and User Menu */}
          <div className="hidden xl:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {user && !hideLogout && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-green-700 hover:bg-green-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                    <span className="font-medium text-sm max-w-24 truncate">
                      {getUserDisplayName()}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-green-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {userProfile?.location && (
                        <p className="text-xs text-green-600 mt-1">
                          📍 {userProfile.location.village || userProfile.location.district || userProfile.location.state}
                        </p>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        प्रोफाइल देखें
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        सेटिंग्स
                      </Link>
                      <Link
                        to="/notifications"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <Bell className="w-4 h-4 mr-3" />
                        सूचनाएं
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        लॉग आउट
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-green-200/50 bg-white/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {menuSections.map((section) => (
              <div key={section.title} className="py-2">
                <div className="px-3 py-1 text-xs font-semibold text-green-700 uppercase tracking-wider">
                  {t(section.titleKey)}
                </div>
                {section.items.map((item) => {
                  const isItemActive = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isItemActive
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        isItemActive ? 'bg-white/20' : 'group-hover:bg-green-100'
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3 flex-1">
                        <span>{t(item.nameKey)}</span>
                        {item.badge && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold ${
                            item.isLive 
                              ? 'bg-red-100 text-red-600 animate-pulse' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
            
            {/* Mobile User Menu */}
            {user && !hideLogout && (
              <div className="border-t border-green-200 pt-4 mt-4">
                <div className="px-3 py-2 text-xs font-semibold text-green-700 uppercase tracking-wider">
                  खाता
                </div>
                <div className="flex items-center px-3 py-3 bg-green-50 rounded-lg mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getUserInitials()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors"
                >
                  <User className="w-5 h-5 mr-3" />
                  प्रोफाइल देखें
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  सेटिंग्स
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  लॉग आउट
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
