import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell, Shield, Database, Palette, Globe, Sun, Moon, Monitor,
  Smartphone, Mail, MessageSquare, MapPin, Eye, Lock, Activity,
  Wifi, WifiOff, RefreshCw, Download, Upload, Trash2, AlertCircle,
  Cloud, BarChart3, FileText, Sprout, Award, Cpu, Check, X,
  ChevronRight, Languages, Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSafeTranslation } from '../contexts/LanguageContext';
import profileService from '../services/profileService';
import type { UserSettings } from '../services/profileService';
import { PageHeader, Tabs, Kpi, Button, Badge, SectionTitle, Alert as UiAlert, EmptyState, Skeleton } from '../components/ui';
import toast from 'react-hot-toast';

type SettingTab = 'notifications' | 'appearance' | 'privacy' | 'data';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { settings, loading: settingsLoading, updateSettings: updateSettingsContext, refreshSettings } = useSettings();
  const { isLowBandwidthMode, toggleLowBandwidthMode } = useSafeTranslation();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingTab>('notifications');
  const [pendingChange, setPendingChange] = useState<{ section: string; key: string; value: any } | null>(null);

  const updateSetting = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;
    try {
      setSaving(true);
      await updateSettingsContext(updates);
      toast.success(t('settings.savedSuccess', 'Settings saved'));
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(t('settings.savedError', 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (key: keyof UserSettings['notifications']) => {
    if (!settings) return;
    updateSetting({
      notifications: { ...settings.notifications, [key]: !settings.notifications[key] },
    });
  };

  const handleAppearanceChange = (key: keyof UserSettings['appearance'], value: string) => {
    if (!settings) return;
    updateSetting({ appearance: { ...settings.appearance, [key]: value as any } });
  };

  const handlePrivacyToggle = (key: keyof UserSettings['privacy']) => {
    if (!settings) return;
    updateSetting({ privacy: { ...settings.privacy, [key]: !settings.privacy[key] } });
  };

  const handleDataToggle = (key: keyof UserSettings['data']) => {
    if (!settings) return;
    updateSetting({ data: { ...settings.data, [key]: !settings.data[key] } });
  };

  const handleExportData = async () => {
    if (!user) return;
    const loadingToast = toast.loading(t('settings.exporting', 'Exporting data...'));
    try {
      const data = await profileService.exportUserData(user.uid);
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-krishi-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.dismiss(loadingToast);
      toast.success(t('settings.exportSuccess', 'Data exported successfully'));
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(t('settings.exportError', 'Export failed'));
      console.error('Export error:', error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    const loadingToast = toast.loading(t('settings.importing', 'Importing data...'));
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        await profileService.importUserData(user.uid, jsonData);
        await refreshSettings();
        toast.dismiss(loadingToast);
        toast.success(t('settings.importSuccess', 'Data imported successfully'));
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error(t('settings.importError', 'Import failed — invalid file'));
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearCache = async () => {
    if (!user) return;
    if (!window.confirm(t('settings.clearCacheConfirm', 'Clear all cached data? This cannot be undone.'))) return;
    const loadingToast = toast.loading(t('settings.clearing', 'Clearing cache...'));
    try {
      await profileService.clearCache(user.uid);
      toast.dismiss(loadingToast);
      toast.success(t('settings.clearSuccess', 'Cache cleared'));
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(t('settings.clearError', 'Failed to clear cache'));
    }
  };

  // ToggleSwitch component — accessible, professional
  const Toggle: React.FC<{ checked: boolean; onChange: () => void; disabled?: boolean; label?: string }> = ({
    checked, onChange, disabled, label,
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors focus-ring flex-shrink-0 ${
        checked ? 'bg-leaf-600' : 'bg-ink-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ height: '1.375rem' }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );

  // Setting row component
  const Row: React.FC<{
    icon: React.ReactNode;
    iconTone?: 'leaf' | 'sky' | 'soil' | 'harvest' | 'danger' | 'default';
    title: string;
    description?: string;
    control: React.ReactNode;
    meta?: React.ReactNode;
  }> = ({ icon, iconTone = 'leaf', title, description, control, meta }) => {
    const toneClass: Record<string, string> = {
      leaf: 'bg-leaf-50 text-leaf-700',
      sky: 'bg-sky-50 text-sky-700',
      soil: 'bg-soil-50 text-soil-700',
      harvest: 'bg-harvest-50 text-harvest-700',
      danger: 'bg-[#fef2f2] text-danger-600',
      default: 'bg-sunken text-ink-700',
    };
    return (
      <div className="flex items-start gap-3 py-3.5">
        <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${toneClass[iconTone]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-strong">{title}</p>
            {meta}
          </div>
          {description && <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>}
        </div>
        <div className="flex-shrink-0 mt-1.5">{control}</div>
      </div>
    );
  };

  if (settingsLoading && !settings) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container-app py-8 space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Fallback to defaults if settings null
  const safeSettings: UserSettings = settings || {
    userId: user?.uid || '',
    notifications: {
      weatherAlerts: true, marketPriceUpdates: true, diseaseAlerts: true,
      governmentSchemes: true, cropAdvice: true, communityReplies: true,
      expertAnswers: true, pushEnabled: true, emailEnabled: false, smsEnabled: false,
    },
    appearance: { theme: 'light' as const, language: 'hi' as const, fontSize: 'medium' as const, colorTheme: 'green' as const },
    privacy: {
      shareLocation: false, publicProfile: true, showOnlineStatus: true,
      showActivity: true, twoFactorAuth: false, loginNotifications: true,
    },
    data: { autoSync: true, offlineMode: false, cacheSize: 50 },
  };

  const tabs = [
    { id: 'notifications' as SettingTab, label: t('settings.tabNotifications', 'Notifications'), icon: <Bell className="w-3.5 h-3.5" />, badge: Object.values(safeSettings.notifications).filter(Boolean).length },
    { id: 'appearance' as SettingTab, label: t('settings.tabAppearance', 'Appearance'), icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'privacy' as SettingTab, label: t('settings.tabPrivacy', 'Privacy & Security'), icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'data' as SettingTab, label: t('settings.tabData', 'Data & Storage'), icon: <Database className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-app py-5 md:py-8">
        <PageHeader
          eyebrow={t('nav.settings', 'Settings')}
          title={t('settings.title', 'Settings')}
          description={t('settings.subtitle', 'Manage your preferences, notifications, and data.')}
          actions={
            saving ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t('settings.saving', 'Saving...')}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="status-dot status-dot-leaf" />
                {t('settings.synced', 'Synced')}
              </div>
            )
          }
        />

        <div className="mt-5">
          <Tabs variant="pill" tabs={tabs} active={activeTab} onChange={(id) => setActiveTab(id as SettingTab)} />
        </div>

        <div className="mt-5">
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.notifications.alertTypes', 'Alert Types')}
                  description={t('settings.notifications.alertTypesDesc', 'Choose what you want to be notified about.')}
                />
                <div className="divide-y divide-subtle">
                  <Row
                    icon={<Cloud className="w-4 h-4" />}
                    iconTone="sky"
                    title={t('settings.notifications.weatherAlerts', 'Weather Alerts')}
                    description={t('settings.notifications.weatherAlertsDesc', 'Severe weather warnings and forecasts.')}
                    control={<Toggle checked={safeSettings.notifications.weatherAlerts} onChange={() => handleNotificationToggle('weatherAlerts')} label="Weather alerts" />}
                  />
                  <Row
                    icon={<BarChart3 className="w-4 h-4" />}
                    iconTone="leaf"
                    title={t('settings.notifications.marketPrices', 'Market Price Updates')}
                    description={t('settings.notifications.marketPricesDesc', 'Live mandi price changes for your crops.')}
                    control={<Toggle checked={safeSettings.notifications.marketPriceUpdates} onChange={() => handleNotificationToggle('marketPriceUpdates')} label="Market prices" />}
                  />
                  <Row
                    icon={<AlertCircle className="w-4 h-4" />}
                    iconTone="danger"
                    title={t('settings.notifications.diseaseAlerts', 'Disease Outbreak Alerts')}
                    description={t('settings.notifications.diseaseAlertsDesc', 'Early warnings of pest and disease outbreaks in your region.')}
                    control={<Toggle checked={safeSettings.notifications.diseaseAlerts} onChange={() => handleNotificationToggle('diseaseAlerts')} label="Disease alerts" />}
                  />
                  <Row
                    icon={<FileText className="w-4 h-4" />}
                    iconTone="soil"
                    title={t('settings.notifications.govSchemes', 'Government Schemes')}
                    description={t('settings.notifications.govSchemesDesc', 'New schemes, subsidies, and policy updates.')}
                    control={<Toggle checked={safeSettings.notifications.governmentSchemes} onChange={() => handleNotificationToggle('governmentSchemes')} label="Government schemes" />}
                  />
                  <Row
                    icon={<Sprout className="w-4 h-4" />}
                    iconTone="leaf"
                    title={t('settings.notifications.cropAdvice', 'Crop Advisory')}
                    description={t('settings.notifications.cropAdviceDesc', 'Personalized advice from agriculture experts.')}
                    control={<Toggle checked={safeSettings.notifications.cropAdvice} onChange={() => handleNotificationToggle('cropAdvice')} label="Crop advice" />}
                  />
                  <Row
                    icon={<MessageSquare className="w-4 h-4" />}
                    iconTone="sky"
                    title={t('settings.notifications.communityReplies', 'Community Replies')}
                    description={t('settings.notifications.communityRepliesDesc', 'When farmers reply to your posts.')}
                    control={<Toggle checked={safeSettings.notifications.communityReplies} onChange={() => handleNotificationToggle('communityReplies')} label="Community replies" />}
                  />
                  <Row
                    icon={<Award className="w-4 h-4" />}
                    iconTone="harvest"
                    title={t('settings.notifications.expertAnswers', 'Expert Answers')}
                    description={t('settings.notifications.expertAnswersDesc', 'Verified expert responses to your questions.')}
                    control={<Toggle checked={safeSettings.notifications.expertAnswers} onChange={() => handleNotificationToggle('expertAnswers')} label="Expert answers" />}
                  />
                </div>
              </div>

              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.notifications.channels', 'Notification Channels')}
                  description={t('settings.notifications.channelsDesc', 'How you want to receive alerts.')}
                />
                <div className="divide-y divide-subtle">
                  <Row
                    icon={<Smartphone className="w-4 h-4" />}
                    title={t('settings.notifications.push', 'Push Notifications')}
                    description={t('settings.notifications.pushDesc', 'Instant alerts on your mobile device.')}
                    control={<Toggle checked={safeSettings.notifications.pushEnabled} onChange={() => handleNotificationToggle('pushEnabled')} label="Push notifications" />}
                  />
                  <Row
                    icon={<Mail className="w-4 h-4" />}
                    title={t('settings.notifications.email', 'Email')}
                    description={t('settings.notifications.emailDesc', 'Daily digest to your registered email.')}
                    control={<Toggle checked={safeSettings.notifications.emailEnabled} onChange={() => handleNotificationToggle('emailEnabled')} label="Email notifications" />}
                  />
                  <Row
                    icon={<MessageSquare className="w-4 h-4" />}
                    title={t('settings.notifications.sms', 'SMS')}
                    description={t('settings.notifications.smsDesc', 'Critical alerts via SMS.')}
                    control={<Toggle checked={safeSettings.notifications.smsEnabled} onChange={() => handleNotificationToggle('smsEnabled')} label="SMS notifications" />}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.appearance.theme', 'Theme')}
                  description={t('settings.appearance.themeDesc', 'Choose how the app looks.')}
                />
                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  {[
                    { value: 'light', label: t('settings.appearance.light', 'Light'), icon: Sun, preview: 'bg-white border-subtle' },
                    { value: 'dark', label: t('settings.appearance.dark', 'Dark'), icon: Moon, preview: 'bg-slate-900 border-slate-700' },
                    { value: 'system', label: t('settings.appearance.system', 'System'), icon: Monitor, preview: 'bg-gradient-to-r from-white to-slate-900' },
                  ].map(({ value, label, icon: Icon, preview }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAppearanceChange('theme', value)}
                      className={`relative p-3 rounded-md border-2 text-left transition-all ${
                        safeSettings.appearance.theme === value
                          ? 'border-leaf-500 ring-2 ring-leaf-100'
                          : 'border-subtle hover:border-ink-300'
                      }`}
                    >
                      <div className={`h-12 rounded mb-2 ${preview}`} />
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-ink-600" />
                        <span className="text-sm font-medium text-strong">{label}</span>
                      </div>
                      {safeSettings.appearance.theme === value && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-leaf-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.appearance.language', 'Language')}
                  description={t('settings.appearance.languageDesc', 'Select your preferred language. Changes apply instantly.')}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                  {[
                    { code: 'hi', name: 'हिंदी', sub: 'Hindi' },
                    { code: 'en', name: 'English', sub: 'English' },
                    { code: 'mr', name: 'मराठी', sub: 'Marathi' },
                    { code: 'gu', name: 'ગુજરાતી', sub: 'Gujarati' },
                    { code: 'ta', name: 'தமிழ்', sub: 'Tamil' },
                    { code: 'te', name: 'తెలుగు', sub: 'Telugu' },
                    { code: 'pa', name: 'ਪੰਜਾਬੀ', sub: 'Punjabi' },
                    { code: 'bn', name: 'বাংলা', sub: 'Bengali' },
                    { code: 'kn', name: 'ಕನ್ನಡ', sub: 'Kannada' },
                  ].map(({ code, name, sub }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleAppearanceChange('language', code)}
                      className={`p-2.5 rounded-md border text-left transition-all ${
                        safeSettings.appearance.language === code
                          ? 'border-leaf-500 bg-leaf-50 ring-1 ring-leaf-200'
                          : 'border-subtle hover:border-ink-300 bg-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-strong">{name}</div>
                          <div className="text-[10px] text-muted uppercase tracking-wider">{sub}</div>
                        </div>
                        {safeSettings.appearance.language === code && (
                          <Check className="w-4 h-4 text-leaf-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.appearance.fontSize', 'Text Size')}
                  description={t('settings.appearance.fontSizeDesc', 'Adjust the text size for better readability.')}
                />
                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  {[
                    { value: 'small', label: t('settings.appearance.small', 'Small'), size: 'text-xs' },
                    { value: 'medium', label: t('settings.appearance.medium', 'Medium'), size: 'text-sm' },
                    { value: 'large', label: t('settings.appearance.large', 'Large'), size: 'text-base' },
                  ].map(({ value, label, size }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAppearanceChange('fontSize', value)}
                      className={`p-3 rounded-md border transition-all ${
                        safeSettings.appearance.fontSize === value
                          ? 'border-leaf-500 bg-leaf-50 ring-1 ring-leaf-200'
                          : 'border-subtle hover:border-ink-300 bg-surface'
                      }`}
                    >
                      <div className={`${size} font-semibold text-strong`}>Aa</div>
                      <div className="text-xs text-muted mt-1">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.appearance.colorTheme', 'Accent Color')}
                  description={t('settings.appearance.colorThemeDesc', 'Personalize the accent color.')}
                />
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                  {[
                    { value: 'green', color: 'bg-leaf-600', label: 'Green' },
                    { value: 'blue', color: 'bg-sky-600', label: 'Blue' },
                    { value: 'amber', color: 'bg-harvest-600', label: 'Amber' },
                    { value: 'brown', color: 'bg-soil-600', label: 'Brown' },
                    { value: 'slate', color: 'bg-slate-700', label: 'Slate' },
                    { value: 'rose', color: 'bg-rose-600', label: 'Rose' },
                  ].map(({ value, color, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAppearanceChange('colorTheme', value)}
                      title={label}
                      className={`relative aspect-square rounded-md ${color} transition-transform hover:scale-105 ${
                        safeSettings.appearance.colorTheme === value ? 'ring-2 ring-offset-2 ring-ink-900' : ''
                      }`}
                    >
                      {safeSettings.appearance.colorTheme === value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.privacy.profile', 'Profile Visibility')}
                  description={t('settings.privacy.profileDesc', 'Control who can see your information.')}
                />
                <div className="divide-y divide-subtle">
                  <Row
                    icon={<Eye className="w-4 h-4" />}
                    title={t('settings.privacy.publicProfile', 'Public Profile')}
                    description={t('settings.privacy.publicProfileDesc', 'Allow other farmers to view your profile.')}
                    control={<Toggle checked={safeSettings.privacy.publicProfile} onChange={() => handlePrivacyToggle('publicProfile')} label="Public profile" />}
                  />
                  <Row
                    icon={<Activity className="w-4 h-4" />}
                    title={t('settings.privacy.showActivity', 'Show Activity')}
                    description={t('settings.privacy.showActivityDesc', 'Display your posts and comments on the community feed.')}
                    control={<Toggle checked={safeSettings.privacy.showActivity} onChange={() => handlePrivacyToggle('showActivity')} label="Show activity" />}
                  />
                  <Row
                    icon={<Wifi className="w-4 h-4" />}
                    title={t('settings.privacy.showOnlineStatus', 'Online Status')}
                    description={t('settings.privacy.showOnlineStatusDesc', 'Let others know when you are online.')}
                    control={<Toggle checked={safeSettings.privacy.showOnlineStatus} onChange={() => handlePrivacyToggle('showOnlineStatus')} label="Online status" />}
                  />
                </div>
              </div>

              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.privacy.location', 'Location')}
                  description={t('settings.privacy.locationDesc', 'Manage location sharing and visibility.')}
                />
                <div className="divide-y divide-subtle">
                  <Row
                    icon={<MapPin className="w-4 h-4" />}
                    title={t('settings.privacy.shareLocation', 'Share Location')}
                    description={t('settings.privacy.shareLocationDesc', 'Required for accurate weather, market, and soil data.')}
                    control={<Toggle checked={safeSettings.privacy.shareLocation} onChange={() => handlePrivacyToggle('shareLocation')} label="Share location" />}
                  />
                </div>
              </div>

              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.privacy.security', 'Security')}
                  description={t('settings.privacy.securityDesc', 'Protect your account with additional security.')}
                />
                <div className="divide-y divide-subtle">
                  <Row
                    icon={<Lock className="w-4 h-4" />}
                    title={t('settings.privacy.twoFactor', 'Two-Factor Authentication')}
                    description={t('settings.privacy.twoFactorDesc', 'Add an extra layer of security at sign-in.')}
                    meta={safeSettings.privacy.twoFactorAuth ? <Badge tone="leaf">On</Badge> : <Badge tone="default">Off</Badge>}
                    control={<Toggle checked={safeSettings.privacy.twoFactorAuth} onChange={() => handlePrivacyToggle('twoFactorAuth')} label="Two-factor authentication" />}
                  />
                  <Row
                    icon={<Bell className="w-4 h-4" />}
                    title={t('settings.privacy.loginAlerts', 'Login Alerts')}
                    description={t('settings.privacy.loginAlertsDesc', 'Get notified about new device sign-ins.')}
                    control={<Toggle checked={safeSettings.privacy.loginNotifications} onChange={() => handlePrivacyToggle('loginNotifications')} label="Login alerts" />}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.data.sync', 'Sync & Connectivity')}
                  description={t('settings.data.syncDesc', 'Configure how your data syncs across devices.')}
                />
                <div className="divide-y divide-subtle">
                  <Row
                    icon={<RefreshCw className="w-4 h-4" />}
                    title={t('settings.data.autoSync', 'Auto Sync')}
                    description={t('settings.data.autoSyncDesc', 'Sync changes automatically when online.')}
                    control={<Toggle checked={safeSettings.data.autoSync} onChange={() => handleDataToggle('autoSync')} label="Auto sync" />}
                  />
                  <Row
                    icon={<WifiOff className="w-4 h-4" />}
                    title={t('settings.data.offlineMode', 'Offline Mode')}
                    description={t('settings.data.offlineModeDesc', 'Work without internet using cached data.')}
                    control={<Toggle checked={safeSettings.data.offlineMode} onChange={() => handleDataToggle('offlineMode')} label="Offline mode" />}
                  />
                  <Row
                    icon={<Wifi className="w-4 h-4" />}
                    title={t('settings.data.lowBandwidth', 'Low-Bandwidth Mode')}
                    description={t('settings.data.lowBandwidthDesc', 'Compress images and disable animations for 2G/3G.')}
                    control={<Toggle checked={isLowBandwidthMode} onChange={toggleLowBandwidthMode} label="Low bandwidth mode" />}
                  />
                </div>
              </div>

              <div className="card card-padded">
                <SectionTitle
                  title={t('settings.data.backup', 'Backup & Restore')}
                  description={t('settings.data.backupDesc', 'Export your data or import a previous backup.')}
                />
                <div className="space-y-2.5 mt-3">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between p-3 bg-surface border border-subtle rounded-md hover:border-leaf-400 hover:bg-leaf-50/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-leaf-50 text-leaf-700 flex items-center justify-center">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-strong">{t('settings.data.export', 'Export Data')}</p>
                        <p className="text-xs text-muted">{t('settings.data.exportDesc', 'Download a JSON backup of all your data')}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <label className="w-full flex items-center justify-between p-3 bg-surface border border-subtle rounded-md hover:border-sky-400 hover:bg-sky-50/40 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-strong">{t('settings.data.import', 'Import Data')}</p>
                        <p className="text-xs text-muted">{t('settings.data.importDesc', 'Restore from a JSON backup file')}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-400 group-hover:translate-x-0.5 transition-transform" />
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="w-full flex items-center justify-between p-3 bg-surface border border-subtle rounded-md hover:border-danger-400 hover:bg-[#fef2f2]/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-[#fef2f2] text-danger-600 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-strong">{t('settings.data.clearCache', 'Clear Cache')}</p>
                        <p className="text-xs text-muted">
                          {t('settings.data.clearCacheDesc', 'Remove temporary data')} ({safeSettings.data.cacheSize ?? 0} MB)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="card card-padded bg-sunken border-subtle">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Database className="w-3.5 h-3.5" />
                  <span>
                    {t('settings.data.lastSync', 'Last synced')}: {' '}
                    <span className="font-medium text-ink-700">
                      {safeSettings.data.lastSync
                        ? new Date(safeSettings.data.lastSync as any).toLocaleString()
                        : t('settings.data.never', 'Never')}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
