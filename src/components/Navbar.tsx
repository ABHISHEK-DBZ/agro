import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  Sprout,
  CloudRain,
  TrendingUp,
  Activity,
  Cpu,
  Database,
  BarChart3,
  Leaf,
  Bug,
  Bot,
  Users,
  FileText,
  Shield,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  Calculator,
  FlaskConical,
  ClipboardList,
  ScanLine,
} from 'lucide-react';
import { Badge } from './ui';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  hideLogout?: boolean;
}

interface NavItem {
  path: string;
  name: string;
  nameKey: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: 'LIVE' | 'AI' | 'NEW' | 'ADMIN';
}

interface NavSection {
  title: string;
  titleKey: string;
  items: NavItem[];
}

const Navbar: React.FC<NavbarProps> = ({ hideLogout = false }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, userProfile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [userMenu, setUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const menuSections: NavSection[] = [
    {
      title: 'Dashboard',
      titleKey: 'nav.dashboard',
      items: [
        { path: '/dashboard', name: 'Dashboard', nameKey: 'nav.dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Live Data',
      titleKey: 'nav.live',
      items: [
        { path: '/live-weather', name: 'Live Weather', nameKey: 'nav.liveWeather', icon: CloudRain, badge: 'LIVE' },
        { path: '/market-prices', name: 'Market Prices', nameKey: 'nav.market', icon: TrendingUp, badge: 'LIVE' },
        { path: '/real-time-dashboard', name: 'Real-Time', nameKey: 'nav.realTimeDashboard', icon: Activity, badge: 'LIVE' },
        { path: '/farm-telemetry', name: 'Farm Telemetry', nameKey: 'nav.farmTelemetry', icon: Cpu, badge: 'NEW' },
        { path: '/data-sources', name: 'Data Sources', nameKey: 'nav.dataSources', icon: Database, badge: 'NEW' },
        { path: '/analytics', name: 'Analytics', nameKey: 'nav.analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Farm Tools',
      titleKey: 'nav.tools',
      items: [
        { path: '/crop-management', name: 'Crop Guide', nameKey: 'nav.cropInfo', icon: Leaf },
        { path: '/crop-calendar', name: 'Crop Calendar', nameKey: 'nav.cropCalendar', icon: CalendarDays },
        { path: '/disease-detection', name: 'Disease Detection', nameKey: 'nav.diseaseDetection', icon: Bug },
        { path: '/soil-testing', name: 'Soil Testing', nameKey: 'nav.soilTesting', icon: FlaskConical },
        { path: '/loan-calculator', name: 'Loan Calculator', nameKey: 'nav.loanCalculator', icon: Calculator },
        { path: '/daily-tracking', name: 'Daily Log', nameKey: 'nav.dailyTracking', icon: ClipboardList },
        { path: '/ai-agent', name: 'AI Assistant', nameKey: 'nav.aiAgent', icon: Bot, badge: 'AI' },
      ],
    },
    {
      title: 'Community',
      titleKey: 'nav.community',
      items: [
        { path: '/community', name: 'Community', nameKey: 'nav.communityHub', icon: Users },
        { path: '/grievances', name: 'Grievances', nameKey: 'nav.grievances', icon: FileText },
        { path: '/government-schemes', name: 'Schemes', nameKey: 'nav.schemes', icon: Shield },
        { path: '/profile', name: 'Profile', nameKey: 'nav.profile', icon: UserIcon },
        { path: '/settings', name: 'Settings', nameKey: 'nav.settings', icon: SettingsIcon },
        ...(userProfile?.role === 'admin' ? [
          { path: '/admin', name: 'Admin Panel', nameKey: 'nav.admin', icon: Shield, badge: 'ADMIN' as const },
          { path: '/admin/grievances', name: 'Grievances Admin', nameKey: 'nav.grievancesAdmin', icon: FileText, badge: 'ADMIN' as const },
        ] : []),
      ],
    },
  ];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpenSection(null);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenSection(null);
    setUserMenu(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) { console.error(e); }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'किसान';
  const initials = displayName.charAt(0).toUpperCase();
  const location_str = userProfile?.location
    ? [userProfile.location.village, userProfile.location.district, userProfile.location.state].filter(Boolean).join(', ')
    : null;

  return (
    <nav className="app-nav relative">
      <div className="container-app">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-md bg-leaf-700 text-white flex items-center justify-center group-hover:bg-leaf-800 transition-colors">
              <Sprout className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm md:text-base font-semibold text-strong leading-tight">Smart Krishi Sahayak</div>
              <div className="text-[10px] md:text-xs text-muted leading-tight">किसान सहायक</div>
            </div>
          </Link>

          {/* Desktop nav (lg and up) */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center" ref={dropdownRef}>
            {menuSections.map((section) => {
              if (section.items.length === 1) {
                const item = section.items[0];
                const active = isActive(item.path);
                return (
                  <Link
                    key={section.title}
                    to={item.path}
                    className={`nav-link ${active ? 'active' : ''}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{t(item.nameKey)}</span>
                  </Link>
                );
              }

              const sectionActive = section.items.some((i) => isActive(i.path));
              const isOpen = openSection === section.title;

              return (
                <div key={section.title} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenSection(isOpen ? null : section.title)}
                    className={`nav-link ${sectionActive ? 'active' : ''}`}
                    aria-expanded={isOpen}
                  >
                    <span>{t(section.titleKey)}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div
                      className="absolute top-full left-0 mt-1.5 w-64 card animate-fade-in py-1.5 z-50"
                      style={{ boxShadow: 'var(--shadow-lg)' }}
                    >
                      {section.items.map((item) => {
                        const active = isActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm mx-1 ${
                              active ? 'bg-leaf-50 text-leaf-700 font-medium' : 'text-ink-700 hover:bg-sunken'
                            }`}
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 truncate">{t(item.nameKey)}</span>
                            {item.badge && <Badge tone={item.badge === 'ADMIN' ? 'soil' : item.badge === 'AI' ? 'sky' : 'leaf'}>{item.badge}</Badge>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right cluster (desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher />
            {user && !hideLogout && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-sunken transition-colors focus-ring"
                >
                  <div className="w-8 h-8 rounded-full bg-leaf-700 text-white flex items-center justify-center text-sm font-medium">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-strong max-w-[10rem] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-ink-400 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 card animate-fade-in py-1.5 z-50" style={{ boxShadow: 'var(--shadow-lg)' }}>
                    <div className="px-3 py-2.5 border-b border-subtle">
                      <p className="text-sm font-medium text-strong truncate">{displayName}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                      {location_str && <p className="text-xs text-leaf mt-1 truncate">📍 {location_str}</p>}
                    </div>
                    <div className="py-1">
                      <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 hover:bg-sunken mx-1 rounded-sm">
                        <UserIcon className="w-4 h-4" /> प्रोफ़ाइल
                      </Link>
                      <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 hover:bg-sunken mx-1 rounded-sm">
                        <SettingsIcon className="w-4 h-4" /> सेटिंग्स
                      </Link>
                      <Link to="/notifications" className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 hover:bg-sunken mx-1 rounded-sm">
                        <Bell className="w-4 h-4" /> सूचनाएं
                      </Link>
                    </div>
                    <div className="border-t border-subtle py-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-sunken mx-1 rounded-sm"
                      >
                        <LogOut className="w-4 h-4" /> लॉग आउट
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile: language + menu trigger */}
          <div className="flex lg:hidden items-center gap-1.5">
            <LanguageSwitcher />
            {user && !hideLogout && (
              <div className="w-8 h-8 rounded-full bg-leaf-700 text-white flex items-center justify-center text-sm font-medium sm:flex hidden">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 -mr-2 text-ink-700 hover:bg-sunken rounded-md focus-ring"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — dropdown below navbar with backdrop */}
      {mobileOpen && (
        <>
          {/* Semi-transparent backdrop so hero/content is partially visible */}
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden absolute left-0 right-0 top-full z-40 bg-white/95 dark:bg-[#1f1d18]/95 backdrop-blur-xl border-b border-subtle shadow-lg animate-fade-in max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
            <div className="container-app py-4 pb-6">
              {/* User card on mobile */}
              {user && !hideLogout && (
                <div className="card card-padded mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-leaf-700 text-white flex items-center justify-center font-medium">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-strong truncate">{displayName}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                    {location_str && <p className="text-xs text-leaf mt-0.5 truncate">📍 {location_str}</p>}
                  </div>
                </div>
              )}

              {menuSections.map((section) => (
                <div key={section.title} className="mb-4">
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider px-2 mb-1.5">
                    {t(section.titleKey)}
                  </div>
                  <div className="card p-1.5">
                    {section.items.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm ${
                            active ? 'bg-leaf-50 text-leaf-700 font-medium' : 'text-ink-800 hover:bg-sunken'
                          }`}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1">{t(item.nameKey)}</span>
                          {item.badge && <Badge tone={item.badge === 'ADMIN' ? 'soil' : item.badge === 'AI' ? 'sky' : 'leaf'}>{item.badge}</Badge>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {user && !hideLogout && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm text-danger bg-surface border border-subtle hover:bg-sunken"
                >
                  <LogOut className="w-4 h-4" /> लॉग आउट
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
