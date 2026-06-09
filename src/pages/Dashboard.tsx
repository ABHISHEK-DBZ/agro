import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, TrendingDown, Bug, Bot, Settings, Cpu, Users, Shield,
  CloudRain, ArrowRight, Calendar, Activity, Bell, Sun, Cloud, Droplets,
  Wind, AlertTriangle, MapPin, CheckCircle2, Sprout, Clock, RefreshCw, X as XIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSafeTranslation } from '../contexts/LanguageContext';
import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';
import communityService, { CommunityPost, Notification } from '../services/communityService';
import { Kpi, Badge, Button, PageHeader, SectionTitle, Skeleton } from '../components/ui';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage, isLowBandwidthMode } = useSafeTranslation();
  const { user, userProfile } = useAuth();
  const { soilStats, equipment, peers } = useSwarmTelemetry();
  const [timeStr, setTimeStr] = useState('');
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [marketPrices, setMarketPrices] = useState<{ name: string; price: number; change: number; unit: string }[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Update clock
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString(
          currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'mr' ? 'mr-IN' : 'en-IN',
          { hour: '2-digit', minute: '2-digit' },
        ),
      );
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [currentLanguage]);

  // Load real data from services
  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      communityService.getPosts?.() || Promise.resolve([]),
      communityService.getUserNotifications?.(user?.uid || '') || Promise.resolve([]),
    ]).then(([postsRes, notifRes]) => {
      if (!mounted) return;
      if (postsRes.status === 'fulfilled') {
        setRecentPosts((postsRes.value as CommunityPost[]).slice(0, 5));
      }
      if (notifRes.status === 'fulfilled') {
        setNotifications((notifRes.value as Notification[]).slice(0, 3));
      }
      setLoadingData(false);
    });
    return () => { mounted = false; };
  }, [user]);

  // Real-time notifications subscription
  useEffect(() => {
    if (!user) return;
    const unsub = communityService.subscribeToNotifications?.(user.uid, (data) => {
      setNotifications((data as Notification[]).slice(0, 3));
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [user]);

  // Build market ticker from real prices when available, otherwise show minimal placeholder
  const ticker = useMemo(() => {
    if (marketPrices.length > 0) {
      return marketPrices.map((p, i) => ({
        id: `mkt-${i}`,
        name: p.name,
        price: `₹${p.price.toLocaleString('en-IN')}/${p.unit}`,
        change: `${p.change > 0 ? '+' : ''}${p.change.toFixed(1)}%`,
        up: p.change >= 0,
      }));
    }
    return []; // No data — render nothing rather than fake numbers
  }, [marketPrices]);

  // Real derived stats from auth and swarm data
  const stats = useMemo(() => {
    const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Farmer';
    const activeEquipment = equipment.filter((e) => e.status === 'Active').length;
    const onlinePeers = peers.filter((p) => p.status === 'Online' || p.status === 'In-Field').length;
    return [
      {
        label: t('dashboard.onlineFarmers', 'Online farmers'),
        value: onlinePeers > 0 ? onlinePeers : '—',
        hint: onlinePeers > 0 ? t('dashboard.onlineNow', 'Connected now') : t('dashboard.connectingPeers', 'Discovering peers...'),
        icon: <Users className="w-4 h-4" />,
        tone: 'leaf' as const,
      },
      {
        label: t('dashboard.equipmentOnline', 'Equipment online'),
        value: activeEquipment,
        hint: activeEquipment > 0 ? t('dashboard.activeUnits', 'Active units') : t('dashboard.noEquipment', 'No equipment reporting'),
        icon: <Cpu className="w-4 h-4" />,
        tone: 'soil' as const,
      },
      {
        label: t('dashboard.soilHealth', 'Soil health'),
        value: soilStats.ph ? `pH ${soilStats.ph.toFixed(1)}` : '—',
        hint: soilStats.nitrogen ? `N: ${Math.round(soilStats.nitrogen)} mg/kg` : t('dashboard.noSensorData', 'Connect a sensor for live data'),
        icon: <Activity className="w-4 h-4" />,
        tone: 'harvest' as const,
      },
      {
        label: t('dashboard.notifications', 'Notifications'),
        value: notifications.length,
        hint: notifications.filter((n) => !n.read).length > 0
          ? `${notifications.filter((n) => !n.read).length} unread`
          : t('dashboard.allCaughtUp', 'All caught up'),
        icon: <Bell className="w-4 h-4" />,
        tone: 'sky' as const,
      },
    ];
  }, [equipment, peers, soilStats, notifications, t, user, userProfile]);

  // Quick actions — clean professional list
  const actions = [
    { to: '/live-weather', icon: CloudRain, tone: 'sky' as const, titleKey: 'nav.liveWeather', descKey: 'dashboard.weatherDesc' },
    { to: '/market-prices', icon: TrendingUp, tone: 'leaf' as const, titleKey: 'nav.liveMarket', descKey: 'dashboard.marketDesc' },
    { to: '/community', icon: Users, tone: 'harvest' as const, titleKey: 'nav.community', descKey: 'dashboard.communityDesc' },
    { to: '/ai-agent', icon: Bot, tone: 'sky' as const, titleKey: 'nav.aiAgent', descKey: 'dashboard.aiDesc', badge: 'AI' as const },
    { to: '/crop-calendar', icon: Calendar, tone: 'leaf' as const, titleKey: 'nav.cropCalendar', descKey: 'dashboard.calendarDesc' },
    { to: '/disease-detection', icon: Bug, tone: 'danger' as const, titleKey: 'nav.diseaseDetection', descKey: 'dashboard.diseaseDesc' },
    { to: '/grievances', icon: Shield, tone: 'harvest' as const, titleKey: 'nav.grievances', descKey: 'dashboard.grievancesDesc' },
    { to: '/settings', icon: Settings, tone: 'default' as const, titleKey: 'nav.settings', descKey: 'dashboard.settingsDesc' },
  ];

  const actionToneClass: Record<string, { bg: string; fg: string }> = {
    sky:     { bg: 'bg-sky-50',     fg: 'text-sky-700' },
    leaf:    { bg: 'bg-leaf-50',    fg: 'text-leaf-700' },
    soil:    { bg: 'bg-soil-50',    fg: 'text-soil-700' },
    harvest: { bg: 'bg-harvest-50', fg: 'text-harvest-700' },
    danger:  { bg: 'bg-[#fef2f2]',  fg: 'text-danger-600' },
    default: { bg: 'bg-sunken',     fg: 'text-ink-700' },
  };

  // Soil recommendation based on real soilStats
  const soilAdvisory = useMemo(() => {
    if (!soilStats.ph) return null;
    if (soilStats.ph < 6) {
      return { tone: 'warn' as const, title: t('dashboard.soilAcidic', 'Soil is acidic'), body: t('dashboard.soilAcidicRec', 'Add lime to raise pH. Target 6.0-7.0 for most crops.') };
    }
    if (soilStats.ph > 7.5) {
      return { tone: 'warn' as const, title: t('dashboard.soilAlkaline', 'Soil is alkaline'), body: t('dashboard.soilAlkalineRec', 'Add gypsum or organic matter. Target 6.0-7.0.') };
    }
    return { tone: 'success' as const, title: t('dashboard.soilOptimal', 'Soil is optimal'), body: t('dashboard.soilOptimalRec', 'pH within ideal range. Continue current fertilization.') };
  }, [soilStats, t]);

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || t('common.farmer', 'Farmer');

  return (
    <div className={`min-h-screen bg-canvas ${isLowBandwidthMode ? 'low-bandwidth-mode' : ''}`}>
      <div className="container-app py-5 md:py-8">
        <PageHeader
          eyebrow={`${t('dashboard.welcome', 'Welcome back')}, ${displayName}`}
          title={t('dashboard.subtitle', 'Your farm at a glance')}
          description={t('dashboard.description', 'Real-time weather, market prices, crop health, and equipment status — all in one place.')}
          actions={
            <>
              {timeStr && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted font-mono">
                  <Clock className="w-3.5 h-3.5" /> {timeStr}
                </span>
              )}
              <Link to="/notifications">
                <Button variant="secondary" size="sm">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1.5">{t('dashboard.alertsTitle', `Today's advisories`)}</span>
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-danger-600 text-white text-[10px] font-bold">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </Button>
              </Link>
            </>
          }
        />

        {/* Price ticker — only if real data exists */}
        {ticker.length > 0 && (
          <div className="hidden md:block card mb-6 overflow-hidden">
            <div className="px-4 py-2.5 flex items-center gap-6 overflow-hidden">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider shrink-0">
                {t('dashboard.marketTicker', 'Mandi prices today')}
              </span>
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-7 whitespace-nowrap text-sm animate-marquee">
                  {[...ticker, ...ticker].map((item, i) => (
                    <span key={`${item.id}-${i}`} className="flex items-center gap-2 shrink-0">
                      <span className="font-medium text-strong">{item.name}</span>
                      <span className="text-ink-700">{item.price}</span>
                      <span className={item.up ? 'text-success-600' : 'text-danger-600'}>{item.change}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advisories — real */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {soilAdvisory ? (
            <div className={`alert alert-${soilAdvisory.tone}`}>
              <Sprout className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">{soilAdvisory.title}</div>
                <div className="text-sm opacity-90 mt-0.5">{soilAdvisory.body}</div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <Sprout className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">{t('dashboard.connectSensor', 'Connect a soil sensor')}</div>
                <div className="text-sm opacity-90 mt-0.5">
                  {t('dashboard.connectSensorDesc', 'Pair an IoT sensor to get live pH, NPK, and moisture readings.')}
                </div>
              </div>
            </div>
          )}
          <div className="alert alert-info">
            <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">
                {notifications.length > 0
                  ? `${notifications.filter((n) => !n.read).length} ${t('dashboard.unreadLabel', 'unread notifications')}`
                  : t('dashboard.noAlerts', 'You are all caught up')}
              </div>
              <div className="text-sm opacity-90 mt-0.5">
                {notifications[0]?.title || t('dashboard.openInboxDesc', 'Open the inbox to see advisories, replies, and alerts.')}
              </div>
            </div>
          </div>
        </div>

        {/* KPIs — real */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {stats.map((s) => (
            <Kpi key={s.label} label={s.label} value={s.value} hint={s.hint} icon={s.icon} />
          ))}
        </div>

        {/* Quick actions */}
        <SectionTitle title={t('dashboard.quickActions', 'Quick actions')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {actions.map((a) => {
            const tone = actionToneClass[a.tone] || actionToneClass.default;
            return (
              <Link key={a.to} to={a.to} className="card card-interactive card-padded group block">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-md ${tone.bg} ${tone.fg} flex items-center justify-center`}>
                    <a.icon className="w-4.5 h-4.5" />
                  </div>
                  {'badge' in a && a.badge && <Badge tone="sky">{a.badge}</Badge>}
                </div>
                <h3 className="text-sm font-semibold text-strong leading-snug">{t(a.titleKey, a.titleKey)}</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">{t(a.descKey, a.descKey)}</p>
                <div className={`mt-3 text-xs font-medium ${tone.fg} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {t('common.open', 'Open')} <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent activity / latest posts */}
        {recentPosts.length > 0 && (
          <div className="mt-8">
            <SectionTitle
              title={t('dashboard.recentPosts', 'Recent community posts')}
              description={t('dashboard.recentPostsDesc', 'Latest questions and discussions from farmers.')}
              action={
                <Link to="/community" className="text-xs font-medium text-leaf-700 hover:text-leaf-800 inline-flex items-center gap-1">
                  {t('common.viewAll', 'View all')} <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {recentPosts.slice(0, 3).map((post) => (
                <Link key={post.id} to="/community" className="card card-interactive card-padded block">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="default">{post.category || 'general'}</Badge>
                    {post.urgency === 'high' && <Badge tone="danger">{t('dashboard.urgent', 'Urgent')}</Badge>}
                  </div>
                  <h4 className="text-sm font-semibold text-strong line-clamp-2">{post.title}</h4>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{post.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-ink-500">
                    <Users className="w-3 h-3" />
                    <span>{post.farmerName || t('dashboard.anonymous', 'Anonymous')}</span>
                    {(post as any).createdAt && (
                      <>
                        <span>·</span>
                        <span>{new Date((post as any).createdAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
