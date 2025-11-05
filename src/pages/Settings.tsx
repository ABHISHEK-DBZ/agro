import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Shield, 
  Database,
  Wifi,
  Volume2,
  MapPin,
  Camera,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  Info,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from 'lucide-react';

interface SettingsData {
  notifications: {
    weather: boolean;
    marketPrices: boolean;
    diseaseAlerts: boolean;
    governmentSchemes: boolean;
    cropAdvice: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: 'green' | 'blue' | 'purple';
  };
  privacy: {
    shareLocation: boolean;
    shareProfile: boolean;
    allowAnalytics: boolean;
    showOnlineStatus: boolean;
  };
  data: {
    autoSync: boolean;
    offlineMode: boolean;
    dataUsage: 'low' | 'medium' | 'high';
    cacheSize: string;
  };
  account: {
    twoFactorAuth: boolean;
    loginNotifications: boolean;
    sessionTimeout: number;
  };
}

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      weather: true,
      marketPrices: true,
      diseaseAlerts: true,
      governmentSchemes: true,
      cropAdvice: true,
      push: true,
      email: false,
      sms: false,
    },
    appearance: {
      theme: 'light',
      language: 'en',
      fontSize: 'medium',
      colorScheme: 'green',
    },
    privacy: {
      shareLocation: true,
      shareProfile: false,
      allowAnalytics: true,
      showOnlineStatus: true,
    },
    data: {
      autoSync: true,
      offlineMode: false,
      dataUsage: 'medium',
      cacheSize: '256 MB',
    },
    account: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30,
    },
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const languageOptions = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  ];

  const colorSchemes = [
    { name: 'green', label: 'Agriculture Green', color: 'bg-green-500' },
    { name: 'blue', label: 'Sky Blue', color: 'bg-blue-500' },
    { name: 'purple', label: 'Royal Purple', color: 'bg-purple-500' },
  ];

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('krishiSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Check for dark mode
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('krishiSettings', JSON.stringify(settings));
    setLastSaved(new Date());
    setSaving(false);
  };

  const updateSetting = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    updateSetting('appearance', 'language', langCode);
  };

  const clearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  const exportData = () => {
    const data = {
      settings,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'krishi-sahayak-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          checked ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SettingsSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Icon className="text-green-600 dark:text-green-400 mr-3" size={24} />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Customize your Smart Krishi Sahayak experience</p>
          </div>
          <div className="flex items-center space-x-3">
            {lastSaved && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications Settings */}
          <SettingsSection title="Notifications" icon={Bell}>
            <div className="space-y-3">
              <div className="border-b dark:border-gray-700 pb-3">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Content Notifications</h3>
                <ToggleSwitch
                  checked={settings.notifications.weather}
                  onChange={(checked) => updateSetting('notifications', 'weather', checked)}
                  label="Weather Alerts"
                />
                <ToggleSwitch
                  checked={settings.notifications.marketPrices}
                  onChange={(checked) => updateSetting('notifications', 'marketPrices', checked)}
                  label="Market Price Updates"
                />
                <ToggleSwitch
                  checked={settings.notifications.diseaseAlerts}
                  onChange={(checked) => updateSetting('notifications', 'diseaseAlerts', checked)}
                  label="Disease Alerts"
                />
                <ToggleSwitch
                  checked={settings.notifications.governmentSchemes}
                  onChange={(checked) => updateSetting('notifications', 'governmentSchemes', checked)}
                  label="Government Schemes"
                />
                <ToggleSwitch
                  checked={settings.notifications.cropAdvice}
                  onChange={(checked) => updateSetting('notifications', 'cropAdvice', checked)}
                  label="Crop Advice"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Delivery Methods</h3>
                <ToggleSwitch
                  checked={settings.notifications.push}
                  onChange={(checked) => updateSetting('notifications', 'push', checked)}
                  label="Push Notifications"
                />
                <ToggleSwitch
                  checked={settings.notifications.email}
                  onChange={(checked) => updateSetting('notifications', 'email', checked)}
                  label="Email Notifications"
                />
                <ToggleSwitch
                  checked={settings.notifications.sms}
                  onChange={(checked) => updateSetting('notifications', 'sms', checked)}
                  label="SMS Notifications"
                />
              </div>
            </div>
          </SettingsSection>

          {/* Appearance Settings */}
          <SettingsSection title="Appearance" icon={Sun}>
            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleDarkMode}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      !isDarkMode 
                        ? 'bg-white border-green-500 text-green-600' 
                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Sun size={16} />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800 border-green-500 text-green-400' 
                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Moon size={16} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {languageOptions.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
                <select
                  value={settings.appearance.fontSize}
                  onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              {/* Color Scheme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Scheme</label>
                <div className="flex space-x-3">
                  {colorSchemes.map(scheme => (
                    <button
                      key={scheme.name}
                      onClick={() => updateSetting('appearance', 'colorScheme', scheme.name)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        settings.appearance.colorScheme === scheme.name
                          ? 'border-gray-400 bg-gray-50 dark:bg-gray-700'
                          : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${scheme.color}`}></div>
                      <span className="text-sm">{scheme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection title="Privacy & Security" icon={Shield}>
            <div className="space-y-3">
              <ToggleSwitch
                checked={settings.privacy.shareLocation}
                onChange={(checked) => updateSetting('privacy', 'shareLocation', checked)}
                label="Share Location for Weather"
              />
              <ToggleSwitch
                checked={settings.privacy.shareProfile}
                onChange={(checked) => updateSetting('privacy', 'shareProfile', checked)}
                label="Public Profile"
              />
              <ToggleSwitch
                checked={settings.privacy.allowAnalytics}
                onChange={(checked) => updateSetting('privacy', 'allowAnalytics', checked)}
                label="Allow Analytics"
              />
              <ToggleSwitch
                checked={settings.privacy.showOnlineStatus}
                onChange={(checked) => updateSetting('privacy', 'showOnlineStatus', checked)}
                label="Show Online Status"
              />
              <ToggleSwitch
                checked={settings.account.twoFactorAuth}
                onChange={(checked) => updateSetting('account', 'twoFactorAuth', checked)}
                label="Two-Factor Authentication"
              />
              <ToggleSwitch
                checked={settings.account.loginNotifications}
                onChange={(checked) => updateSetting('account', 'loginNotifications', checked)}
                label="Login Notifications"
              />
            </div>
          </SettingsSection>

          {/* Data & Storage */}
          <SettingsSection title="Data & Storage" icon={Database}>
            <div className="space-y-4">
              <ToggleSwitch
                checked={settings.data.autoSync}
                onChange={(checked) => updateSetting('data', 'autoSync', checked)}
                label="Auto Sync Data"
              />
              <ToggleSwitch
                checked={settings.data.offlineMode}
                onChange={(checked) => updateSetting('data', 'offlineMode', checked)}
                label="Offline Mode"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Usage</label>
                <select
                  value={settings.data.dataUsage}
                  onChange={(e) => updateSetting('data', 'dataUsage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Low (Data Saver)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Best Quality)</option>
                </select>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Data Management</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cache Size: {settings.data.cacheSize}</span>
                    <button
                      onClick={clearCache}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Clear Cache
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={exportData}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Download size={14} />
                      <span>Export Data</span>
                    </button>
                    <label className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium cursor-pointer">
                      <Upload size={14} />
                      <span>Import Data</span>
                      <input type="file" accept=".json" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* App Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center mb-4">
            <Info className="text-green-600 dark:text-green-400 mr-3" size={24} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">App Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <div className="font-medium">Version</div>
              <div>1.0.0</div>
            </div>
            <div>
              <div className="font-medium">Last Updated</div>
              <div>November 5, 2025</div>
            </div>
            <div>
              <div className="font-medium">Storage Used</div>
              <div>256 MB</div>
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <HelpCircle size={14} />
              <span>Help & Support</span>
            </button>
            <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">Privacy Policy</button>
            <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">Terms of Service</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;