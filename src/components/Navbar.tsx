import React, { useState, useRef, useEffect } from 'react';
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
  Wifi,
  Users,
  Calendar,
  ChevronDown,
  Menu,
  X,
  CloudRain,
  Leaf,
  Activity,
  Settings
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  hideLogout?: boolean;
}

interface MenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  isNew?: boolean;
}

interface MenuSection {
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
}

const Navbar: React.FC<NavbarProps> = ({ hideLogout }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Organized menu sections
  const menuSections: MenuSection[] = [
    {
      title: 'Dashboard',
      icon: Home,
      items: [
        { path: '/dashboard', icon: Home, label: t('navigation.dashboard') || 'Home Dashboard' }
      ]
    },
    {
      title: 'Weather & Live Data',
      icon: CloudRain,
      items: [
        { path: '/live-weather', icon: Wifi, label: 'Live Weather', isNew: true },
        { path: '/live-market', icon: BarChart3, label: 'Live Market', isNew: true }
      ]
    },
    {
      title: 'Farming Tools',
      icon: Leaf,
      items: [
        { path: '/crop-info', icon: Sprout, label: t('navigation.crops') || 'Crop Info' },
        { path: '/disease-detection', icon: Bug, label: t('navigation.diseases') || 'Disease Detection' },
        { path: '/daily-tracking', icon: Calendar, label: 'Daily Tracking', isNew: true }
      ]
    },
    {
      title: 'Market & Schemes',
      icon: Activity,
      items: [
        { path: '/mandi-prices', icon: TrendingUp, label: t('navigation.prices') || 'Mandi Prices' },
        { path: '/government-schemes', icon: FileText, label: t('navigation.schemes') || 'Gov Schemes' }
      ]
    },
    {
      title: 'AI & Community',
      icon: Settings,
      items: [
        { path: '/agent', icon: Bot, label: t('navigation.agent') || 'AI Agent' },
        { path: '/community', icon: Users, label: 'Community', isNew: true },
        { path: '/profile', icon: User, label: t('navigation.profile') || 'Profile' }
      ]
    }
  ];

  const toggleDropdown = (sectionTitle: string) => {
    setOpenDropdown(openDropdown === sectionTitle ? null : sectionTitle);
  };

  const isCurrentPath = (path: string) => location.pathname === path;
  
  const hasActiveItemInSection = (section: MenuSection) => {
    return section.items.some(item => isCurrentPath(item.path));
  };

  return (
    <nav className="glass-effect shadow-xl border-b border-green-200/50 sticky top-0 z-50 elevated-shadow">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="relative p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Sprout className="h-8 w-8 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="text-2xl font-bold high-contrast-text">
                {t('app.title')}
              </span>
              <div className="text-xs text-green-700 font-semibold">Smart Agriculture</div>
            </div>
          </div>

          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden xl:flex items-center space-x-2" ref={dropdownRef}>
            {menuSections.map((section) => {
              const SectionIcon = section.icon;
              const isOpen = openDropdown === section.title;
              const hasActiveItem = hasActiveItemInSection(section);
              
              // Single item sections link directly
              if (section.items.length === 1) {
                const item = section.items[0];
                const ItemIcon = item.icon;
                const isActive = isCurrentPath(item.path);
                
                return (
                  <Link
                    key={section.title}
                    to={item.path}
                    className={`group flex items-center px-3 py-2 rounded-lg text-sm font-semibold smooth-transition ${
                      isActive 
                        ? 'enhanced-button text-white shadow-lg transform scale-105' 
                        : 'text-contrast-light hover:text-green-700 hover:bg-white/80 hover:shadow-md enhanced-card'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg smooth-transition ${
                      isActive ? 'bg-white/20' : 'group-hover:bg-green-100'
                    }`}>
                      <ItemIcon className="h-4 w-4" />
                    </div>
                    <span className="ml-2">{item.label}</span>
                    {item.isNew && (
                      <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">NEW</span>
                    )}
                  </Link>
                );
              }

              // Multi-item sections show dropdown
              return (
                <div key={section.title} className="relative">
                  <button
                    onClick={() => toggleDropdown(section.title)}
                    className={`group flex items-center px-3 py-2 rounded-lg text-sm font-semibold smooth-transition ${
                      hasActiveItem || isOpen
                        ? 'enhanced-button text-white shadow-lg' 
                        : 'text-contrast-light hover:text-green-700 hover:bg-white/80 hover:shadow-md enhanced-card'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg smooth-transition ${
                      hasActiveItem || isOpen ? 'bg-white/20' : 'group-hover:bg-green-100'
                    }`}>
                      <SectionIcon className="h-4 w-4" />
                    </div>
                    <span className="ml-2">{section.title}</span>
                    <ChevronDown className={`h-4 w-4 ml-1 smooth-transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-green-100 py-2 z-50 animate-fade-in">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        {section.title}
                      </div>
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = isCurrentPath(item.path);
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpenDropdown(null)}
                            className={`flex items-center px-4 py-3 text-sm smooth-transition ${
                              isActive 
                                ? 'bg-green-50 text-green-700 border-r-2 border-green-500' 
                                : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                            }`}
                          >
                            <div className={`p-2 rounded-lg mr-3 ${
                              isActive ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <ItemIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{item.label}</div>
                              {item.isNew && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                                  NEW FEATURE
                                </span>
                              )}
                            </div>
                            {isActive && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Logout Button */}
            {!hideLogout && (
              <button
                className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 smooth-transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center space-x-3">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg enhanced-card text-gray-700 hover:text-green-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop Language Switcher */}
          <div className="hidden xl:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden glass-effect border-t border-green-200/50 animate-fade-in">
          <div className="max-h-96 overflow-y-auto">
            {menuSections.map((section) => (
              <div key={section.title} className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = isCurrentPath(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm smooth-transition ${
                        isActive 
                          ? 'bg-green-50 text-green-700 border-r-2 border-green-500' 
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${
                        isActive ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        {item.isNew && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                            NEW
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
            
            {/* Mobile Logout */}
            {!hideLogout && (
              <div className="px-4 py-3 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 smooth-transition"
                >
                  Logout
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
