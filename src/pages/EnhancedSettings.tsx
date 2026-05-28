import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSafeTranslation } from '../contexts/LanguageContext';
import profileService from '../services/profileService';
import type { UserSettings } from '../services/profileService';
import toast from 'react-hot-toast';
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Database,
  Moon,
  Sun,
  Smartphone,
  Mail,
  MessageSquare,
  Eye,
  EyeOff,
  Lock,
  Download,
  Upload,
  Trash2,
  Check,
  X,
  AlertCircle,
  Save,
  RefreshCw,
  Languages,
  Palette,
  Volume2,
  ChevronRight,
  Cloud,
  HardDrive,
  Wifi,
  WifiOff,
  Monitor,
  Cpu,
  Activity,
  BarChart3,
  FileText,
  MapPin,
  Sprout,
  Award
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { settings, loading: settingsLoading, updateSettings: updateSettingsContext, refreshSettings } = useSettings();
  
  // Strict low-bandwidth 2G/3G throttler (Module C)
  const { isLowBandwidthMode, toggleLowBandwidthMode } = useSafeTranslation();
  
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'appearance' | 'privacy' | 'data'>('notifications');

  const loading = settingsLoading;

  const updateSetting = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;
    
    try {
      setSaving(true);
      
      await updateSettingsContext(updates);
      
      toast.success('सेटिंग्स सेव हो गई और पूरी ऐप में लागू हो गई');
      
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('सेटिंग्स अपडेट करने में त्रुटि');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (key: keyof UserSettings['notifications']) => {
    if (!settings) return;
    
    const updatedNotifications = {
      ...settings.notifications,
      [key]: !settings.notifications[key]
    };
    
    updateSetting({ notifications: updatedNotifications });
  };

  const handleAppearanceChange = (key: keyof UserSettings['appearance'], value: string) => {
    if (!settings) return;
    
    const updatedAppearance = {
      ...settings.appearance,
      [key]: value
    };
    
    updateSetting({ appearance: updatedAppearance });
  };

  const handlePrivacyToggle = (key: keyof UserSettings['privacy']) => {
    if (!settings) return;
    
    const updatedPrivacy = {
      ...settings.privacy,
      [key]: !settings.privacy[key]
    };
    
    updateSetting({ privacy: updatedPrivacy });
  };

  const handleDataToggle = (key: keyof UserSettings['data']) => {
    if (!settings) return;
    
    const updatedData = {
      ...settings.data,
      [key]: !settings.data[key]
    };
    
    updateSetting({ data: updatedData });
  };

  const handleExportData = async () => {
    if (!user) return;
    
    try {
      toast.loading('डेटा एक्सपोर्ट हो रहा है...');
      
      const data = await profileService.exportUserData(user.uid);
      
      // Create JSON file
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Download file
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-krishi-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('डेटा सफलतापूर्वक एक्सपोर्ट हो गया');
      
    } catch (error) {
      toast.dismiss();
      toast.error('डेटा एक्सपोर्ट करने में त्रुटि');
      console.error('Export error:', error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        toast.loading('डेटा इम्पोर्ट हो रहा है...');
        
        const jsonData = JSON.parse(e.target?.result as string);
        await profileService.importUserData(user.uid, jsonData);
        
        // Reload settings
        await refreshSettings();
        
        toast.dismiss();
        toast.success('डेटा सफलतापूर्वक इम्पोर्ट हो गया');
        
      } catch (error) {
        toast.dismiss();
        toast.error('डेटा इम्पोर्ट करने में त्रुटि');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = async () => {
    if (!user) return;
    
    try {
      toast.loading('कैश साफ़ हो रहा है...');
      
      await profileService.clearCache(user.uid);
      
      toast.dismiss();
      toast.success('कैश सफलतापूर्वक साफ़ हो गया');
      
    } catch (error) {
      toast.dismiss();
      toast.error('कैश साफ़ करने में त्रुटि');
      console.error('Clear cache error:', error);
    }
  };

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    checked: boolean; 
    onChange: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    checked, 
    onChange,
    disabled = false
  }: { 
    icon: React.ElementType; 
    title: string; 
    description: string; 
    checked: boolean; 
    onChange: () => void;
    disabled?: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
      <div className="flex items-start space-x-3 flex-1">
        <Icon className="text-green-600 mt-1" size={20} />
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-[#F9F9F6] to-emerald-50 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-green-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin"></div>
            <Sprout className="absolute inset-0 m-auto text-green-600 animate-pulse" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">सेटिंग्स लोड हो रही हैं...</h2>
            <p className="text-sm text-gray-500 mt-1">कृपया प्रतीक्षा करें</p>
          </div>
        </div>
      </div>
    );
  }


  // Ensure settings is always available for the render (fallback to defaults)
  const safeSettings = settings || {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-[#F9F9F6] to-emerald-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-green-100/50">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg">
              <SettingsIcon className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">सेटिंग्स</h1>
              <p className="text-gray-600">अपनी प्राथमिकताएं प्रबंधित करें</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { key: 'notifications', label: 'सूचनाएं', icon: Bell },
              { key: 'appearance', label: 'दिखावट', icon: Palette },
              { key: 'privacy', label: 'गोपनीयता', icon: Shield },
              { key: 'data', label: 'डेटा', icon: Database }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center justify-center p-4 rounded-xl transition-all ${
                  activeTab === key
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} className="mr-2" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                  <Bell className="mr-2 text-green-600" size={24} />
                  सूचना सेटिंग्स
                </h2>
                <p className="text-gray-600 mb-4">
                  आप किस प्रकार की सूचनाएं प्राप्त करना चाहते हैं
                </p>
              </div>

              <div className="space-y-3">
                <SettingItem
                  icon={Cloud}
                  title="मौसम अलर्ट"
                  description="मौसम की जानकारी और चेतावनियां प्राप्त करें"
                  checked={safeSettings.notifications.weatherAlerts}
                  onChange={() => handleNotificationToggle('weatherAlerts')}
                />

                <SettingItem
                  icon={BarChart3}
                  title="बाजार मूल्य अपडेट"
                  description="फसलों के बाजार भाव की जानकारी"
                  checked={safeSettings.notifications.marketPriceUpdates}
                  onChange={() => handleNotificationToggle('marketPriceUpdates')}
                />

                <SettingItem
                  icon={AlertCircle}
                  title="रोग चेतावनी"
                  description="फसल रोगों और कीटों की चेतावनी"
                  checked={safeSettings.notifications.diseaseAlerts}
                  onChange={() => handleNotificationToggle('diseaseAlerts')}
                />

                <SettingItem
                  icon={FileText}
                  title="सरकारी योजनाएं"
                  description="नई सरकारी योजनाओं की जानकारी"
                  checked={safeSettings.notifications.governmentSchemes}
                  onChange={() => handleNotificationToggle('governmentSchemes')}
                />

                <SettingItem
                  icon={Sprout}
                  title="फसल सलाह"
                  description="विशेषज्ञों की फसल सलाह"
                  checked={safeSettings.notifications.cropAdvice}
                  onChange={() => handleNotificationToggle('cropAdvice')}
                />

                <SettingItem
                  icon={MessageSquare}
                  title="समुदाय के जवाब"
                  description="आपकी पोस्ट पर प्रतिक्रियाएं"
                  checked={safeSettings.notifications.communityReplies}
                  onChange={() => handleNotificationToggle('communityReplies')}
                />

                <SettingItem
                  icon={Award}
                  title="विशेषज्ञ उत्तर"
                  description="विशेषज्ञों के सत्यापित उत्तर"
                  checked={safeSettings.notifications.expertAnswers}
                  onChange={() => handleNotificationToggle('expertAnswers')}
                />
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-gray-800 mb-4">सूचना माध्यम</h3>
                <div className="space-y-3">
                  <SettingItem
                    icon={Smartphone}
                    title="पुश सूचनाएं"
                    description="मोबाइल पर तुरंत सूचनाएं"
                    checked={safeSettings.notifications.pushEnabled}
                    onChange={() => handleNotificationToggle('pushEnabled')}
                  />

                  <SettingItem
                    icon={Mail}
                    title="ईमेल सूचनाएं"
                    description="ईमेल पर सूचनाएं भेजें"
                    checked={safeSettings.notifications.emailEnabled}
                    onChange={() => handleNotificationToggle('emailEnabled')}
                  />

                  <SettingItem
                    icon={MessageSquare}
                    title="SMS सूचनाएं"
                    description="SMS के माध्यम से सूचनाएं"
                    checked={safeSettings.notifications.smsEnabled}
                    onChange={() => handleNotificationToggle('smsEnabled')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                  <Palette className="mr-2 text-green-600" size={24} />
                  दिखावट सेटिंग्स
                </h2>
                <p className="text-gray-600 mb-4">
                  ऐप की दिखावट को अपनी पसंद के अनुसार बदलें
                </p>
              </div>

              {/* Theme Selection */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Sun className="mr-2" size={18} />
                  थीम
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'लाइट', icon: Sun },
                    { value: 'dark', label: 'डार्क', icon: Moon },
                    { value: 'system', label: 'सिस्टम', icon: Monitor }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleAppearanceChange('theme', value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        safeSettings.appearance.theme === value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`mx-auto mb-2 ${
                        safeSettings.appearance.theme === value ? 'text-green-600' : 'text-gray-600'
                      }`} size={24} />
                      <p className="text-sm font-medium text-center">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Globe className="mr-2" size={18} />
                  भाषा
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: 'hi', name: 'हिंदी' },
                    { code: 'en', name: 'English' },
                    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
                    { code: 'mr', name: 'मराठी' },
                    { code: 'ta', name: 'தமிழ்' },
                    { code: 'te', name: 'తెలుగు' }
                  ].map(({ code, name }) => (
                    <button
                      key={code}
                      onClick={() => handleAppearanceChange('language', code)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        safeSettings.appearance.language === code
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-center">{name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">फ़ॉन्ट साइज़</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'small', label: 'छोटा' },
                    { value: 'medium', label: 'मध्यम' },
                    { value: 'large', label: 'बड़ा' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleAppearanceChange('fontSize', value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        safeSettings.appearance.fontSize === value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`font-medium text-center ${
                        value === 'small' ? 'text-sm' : value === 'large' ? 'text-lg' : ''
                      }`}>
                        {label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">रंग थीम</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'green', color: 'bg-green-500' },
                    { value: 'blue', color: 'bg-blue-500' },
                    { value: 'purple', color: 'bg-purple-500' },
                    { value: 'orange', color: 'bg-orange-500' }
                  ].map(({ value, color }) => (
                    <button
                      key={value}
                      onClick={() => handleAppearanceChange('colorTheme', value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        safeSettings.appearance.colorTheme === value
                          ? 'border-gray-800'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-8 rounded ${color}`}></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                  <Shield className="mr-2 text-green-600" size={24} />
                  गोपनीयता और सुरक्षा
                </h2>
                <p className="text-gray-600 mb-4">
                  अपनी गोपनीयता और सुरक्षा सेटिंग्स प्रबंधित करें
                </p>
              </div>

              <div className="space-y-3">
                <SettingItem
                  icon={MapPin}
                  title="लोकेशन शेयर करें"
                  description="मौसम की सटीक जानकारी के लिए"
                  checked={safeSettings.privacy.shareLocation}
                  onChange={() => handlePrivacyToggle('shareLocation')}
                />

                <SettingItem
                  icon={Eye}
                  title="सार्वजनिक प्रोफाइल"
                  description="अन्य उपयोगकर्ता आपकी प्रोफाइल देख सकें"
                  checked={safeSettings.privacy.publicProfile}
                  onChange={() => handlePrivacyToggle('publicProfile')}
                />

                <SettingItem
                  icon={Wifi}
                  title="ऑनलाइन स्टेटस दिखाएं"
                  description="अन्य को पता चले कि आप ऑनलाइन हैं"
                  checked={safeSettings.privacy.showOnlineStatus}
                  onChange={() => handlePrivacyToggle('showOnlineStatus')}
                />

                <SettingItem
                  icon={Activity}
                  title="गतिविधि दिखाएं"
                  description="आपकी पोस्ट और टिप्पणियां दिखाएं"
                  checked={safeSettings.privacy.showActivity}
                  onChange={() => handlePrivacyToggle('showActivity')}
                />

                <SettingItem
                  icon={Lock}
                  title="दो-चरणीय प्रमाणीकरण"
                  description="अतिरिक्त सुरक्षा परत जोड़ें"
                  checked={safeSettings.privacy.twoFactorAuth}
                  onChange={() => handlePrivacyToggle('twoFactorAuth')}
                />

                <SettingItem
                  icon={Bell}
                  title="लॉगिन सूचनाएं"
                  description="नए लॉगिन पर सूचना प्राप्त करें"
                  checked={safeSettings.privacy.loginNotifications}
                  onChange={() => handlePrivacyToggle('loginNotifications')}
                />
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                  <Database className="mr-2 text-green-600" size={24} />
                  डेटा प्रबंधन
                </h2>
                <p className="text-gray-600 mb-4">
                  अपने डेटा को प्रबंधित करें और बैकअप लें
                </p>
              </div>

              <div className="space-y-3">
                <SettingItem
                  icon={RefreshCw}
                  title="ऑटो सिंक"
                  description="डेटा स्वचालित रूप से सिंक करें"
                  checked={safeSettings.data.autoSync}
                  onChange={() => handleDataToggle('autoSync')}
                />

                <SettingItem
                  icon={WifiOff}
                  title="ऑफलाइन मोड"
                  description="बिना इंटरनेट के काम करें"
                  checked={safeSettings.data.offlineMode}
                  onChange={() => handleDataToggle('offlineMode')}
                />

                <SettingItem
                  icon={Wifi}
                  title="न्यूनतम बैंडविड्थ मोड (2G/3G Network Throttle)"
                  description="कम इंटरनेट में इमेज कंप्रेस करें और एनिमेशन रोकें"
                  checked={isLowBandwidthMode}
                  onChange={toggleLowBandwidthMode}
                />
              </div>

              {/* IoT Hardware Sync Console */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Cpu className="text-green-600" size={20} />
                  स्मार्ट फील्ड हार्डवेयर सिंक (IoT Node Synchronization)
                </h3>
                
                <div className="space-y-3 bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">मातीचे तापमान सेन्सर (Soil Temperature Sensor Node)</p>
                      <p className="text-xs text-green-600">📡 सिंक यशस्वी (Telemetry Stream Active)</p>
                    </div>
                    <span className="h-2.5 w-2.5 bg-green-500 rounded-full"></span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">ड्रोन कॅमेरा फीड (Garuda Drone Imaging Node)</p>
                      <p className="text-xs text-blue-500">🔌 स्टँडबाय (Charging - Ready to Deploy)</p>
                    </div>
                    <span className="h-2.5 w-2.5 bg-blue-500 rounded-full"></span>
                  </div>

                  <button
                    onClick={() => toast.success('सर्व IoT हार्डवेअर नोड्स पुन्हा स्कॅन केले आणि सिंक झाले! 📡')}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    🔄 नवीन हार्डवेअर नोड सिंक करा (Scan & Sync Nodes)
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">डेटा का बैकअप</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Download className="text-green-600" size={20} />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">डेटा एक्सपोर्ट करें</p>
                        <p className="text-sm text-gray-600">अपना डेटा JSON फाइल में डाउनलोड करें</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </button>

                  <label className="w-full flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Upload className="text-blue-600" size={20} />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">डेटा इम्पोर्ट करें</p>
                        <p className="text-sm text-gray-600">बैकअप फाइल से डेटा पुनर्स्थापित करें</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleClearCache}
                    className="w-full flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Trash2 className="text-red-600" size={20} />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">कैश साफ़ करें</p>
                        <p className="text-sm text-gray-600">अस्थायी डेटा हटाएं ({safeSettings.data.cacheSize} MB)</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </button>
                </div>
              </div>

              {safeSettings.data.lastSync && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    आखिरी सिंक: {new Date(safeSettings.data.lastSync).toLocaleString('hi-IN')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Indicator */}
        {saving && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
            <RefreshCw className="animate-spin" size={20} />
            <span>सेव हो रहा है...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
