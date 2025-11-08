import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone,
  MapPin,
  Edit, 
  Save,
  Settings,
  Bell,
  Shield,
  Languages,
  LogOut,
  Camera,
  Sprout,
  Calendar,
  Award,
  TrendingUp,
  ChevronRight,
  Target,
  Leaf,
  BarChart3,
  Heart,
  Cloud,
  AlertCircle,
  Globe
} from 'lucide-react';

interface AdvancedUserProfile {
  // Basic Info (from registration)
  uid?: string;
  name: string;
  email: string;
  phone: string;
  displayName?: string;
  photoURL?: string;
  
  // Location (from registration)
  location: string;
  village?: string;
  district?: string;
  state?: string;
  
  // Farm Details
  farmSize: string;
  primaryCrops: string[];
  experience: string;
  farmingType?: string[];
  landSize?: number;
  
  // Preferences
  language: string;
  theme?: 'light' | 'dark' | 'auto';
  notifications: {
    weather: boolean;
    prices: boolean;
    diseases: boolean;
    schemes: boolean;
    community?: boolean;
  };
  
  // Stats
  joinedDate?: string;
  totalPosts?: number;
  helpfulAnswers?: number;
  reputation?: number;
  
  // Additional Profile Fields
  bio?: string;
  expertise?: string[];
  achievements?: string[];
  dataSync?: {
    autoBackup?: boolean;
    cloudSync?: boolean;
  };
  socialLinks?: {
    whatsapp?: string;
    telegram?: string;
  };
}

const API_URL = 'http://localhost:5000/api';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<AdvancedUserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<AdvancedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'farm' | 'preferences' | 'achievements'>('basic');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // Get data from Firebase Auth context first
        if (user && userProfile) {
          const advancedProfile: AdvancedUserProfile = {
            uid: user.uid,
            name: userProfile.displayName || user.displayName || 'किसान',
            displayName: userProfile.displayName || user.displayName || '',
            email: user.email || userProfile.email || '',
            phone: userProfile.phoneNumber || '',
            location: userProfile.location 
              ? `${userProfile.location.village || ''} ${userProfile.location.district || ''} ${userProfile.location.state || ''}`.trim()
              : 'भारत',
            village: userProfile.location?.village || '',
            district: userProfile.location?.district || '',
            state: userProfile.location?.state || '',
            farmSize: userProfile.landSize ? `${userProfile.landSize} एकड़` : '2-5 एकड़',
            primaryCrops: userProfile.crops || ['गेहूं', 'धान'],
            experience: userProfile.experience ? `${userProfile.experience} वर्ष` : '5+ वर्ष',
            farmingType: userProfile.farmingType || ['organic'],
            landSize: userProfile.landSize || 3,
            language: userProfile.preferences?.language || 'hi',
            theme: userProfile.preferences?.theme || 'auto',
            notifications: {
              weather: userProfile.preferences?.notifications?.weather ?? true,
              prices: userProfile.preferences?.notifications?.prices ?? true,
              diseases: true,
              schemes: userProfile.preferences?.notifications?.schemes ?? true,
              community: userProfile.preferences?.notifications?.community ?? true
            },
            joinedDate: userProfile.createdAt?.toDate?.()?.toLocaleDateString('hi-IN') || new Date().toLocaleDateString('hi-IN'),
            totalPosts: userProfile.stats?.postsCount || 0,
            helpfulAnswers: userProfile.stats?.answersCount || 0,
            reputation: userProfile.stats?.helpfulVotes || 0,
            photoURL: user.photoURL || undefined,
            bio: 'एक समर्पित किसान जो आधुनिक तकनीक के साथ पारंपरिक खेती करता है।',
            expertise: ['Organic Farming', 'Crop Rotation', 'Pest Management'],
            achievements: ['Best Farmer 2023', 'Organic Certification', 'High Yield Award']
          };
          
          setProfile(advancedProfile);
          setEditedProfile(advancedProfile);
          
          // Also save to localStorage for offline access
          localStorage.setItem('userProfile', JSON.stringify(advancedProfile));
          
          if (advancedProfile.language) {
            i18n.changeLanguage(advancedProfile.language);
          }
          
          setLoading(false);
          return;
        }
        
        // Fallback: Try localStorage
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
          setEditedProfile(parsedProfile);
          if (parsedProfile.language) {
            i18n.changeLanguage(parsedProfile.language);
          }
          setLoading(false);
          return;
        }
        
        // Default profile if nothing found
        const defaultProfile: AdvancedUserProfile = {
          name: 'स्मार्ट किसान',
          email: 'farmer@smartkrishi.com',
          phone: '+91 98765 43210',
          location: 'पंजाब, भारत',
          farmSize: '5 एकड़',
          primaryCrops: ['गेहूं', 'धान', 'कपास'],
          experience: '10+ वर्ष',
          language: 'hi',
          notifications: {
            weather: true,
            prices: true,
            diseases: true,
            schemes: true,
            community: true
          },
          joinedDate: new Date().toLocaleDateString('hi-IN'),
          totalPosts: 12,
          helpfulAnswers: 8,
          reputation: 95,
          bio: 'एक अनुभवी किसान जो आधुनिक तकनीक और पारंपरिक ज्ञान का उपयोग करता है।',
          expertise: ['जैविक खेती', 'फसल चक्र', 'कीट प्रबंधन'],
          achievements: ['सर्वश्रेष्ठ किसान 2023', 'जैविक प्रमाणन', 'उच्च उत्पादन पुरस्कार']
        };
        
        setProfile(defaultProfile);
        setEditedProfile(defaultProfile);
        localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
        
      } catch (err) {
        console.error('Profile loading error:', err);
        setError('प्रोफाइल लोड करने में त्रुटि');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user, userProfile, i18n]);

  const cropOptions = [
    'गेहूं', 'धान', 'कपास', 'गन्ना', 'मक्का', 'सोयाबीन', 
    'सरसों', 'जौ', 'चना', 'मसूर', 'अरहर', 'तिल'
  ];
  
  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'or', name: 'ଓଡ଼ିଆ' }
  ];
  
  const expertiseOptions = [
    'Organic Farming', 'Crop Rotation', 'Pest Management', 'Soil Health',
    'Water Management', 'Dairy Farming', 'Poultry Farming', 'Horticulture',
    'Agricultural Technology', 'Marketing & Sales'
  ];

  const handleSave = async () => {
    if (!editedProfile) return;
    try {
      setLoading(true);
      
      // Save to localStorage first
      localStorage.setItem('userProfile', JSON.stringify(editedProfile));
      
      // Try to update Firebase user profile
      if (user && updateUserProfile) {
        try {
          const firebaseProfileData = {
            displayName: editedProfile.name,
            phoneNumber: editedProfile.phone,
            location: {
              village: editedProfile.village || '',
              district: editedProfile.district || '',
              state: editedProfile.state || ''
            },
            landSize: editedProfile.landSize,
            crops: editedProfile.primaryCrops,
            farmingType: editedProfile.farmingType || [],
            preferences: {
              language: editedProfile.language,
              theme: editedProfile.theme || 'auto',
              notifications: editedProfile.notifications
            }
          };
          
          await updateUserProfile(firebaseProfileData);
          console.log('✅ Firebase profile updated successfully');
        } catch (firebaseError) {
          console.log('⚠️ Firebase update failed, saved locally only:', firebaseError);
        }
      }
      
      // Try to save to API backend (optional)
      try {
        const response = await axios.post(`${API_URL}/profile`, editedProfile, {
          timeout: 5000
        });
        console.log('✅ API profile updated successfully');
      } catch (apiError) {
        console.log('⚠️ API save failed, saved locally only');
      }
      
      setProfile(editedProfile);
      setIsEditing(false);
      setError(null);
      
      // Change language if updated
      if (editedProfile.language && editedProfile.language !== i18n.language) {
        i18n.changeLanguage(editedProfile.language);
      }
      
    } catch (err) {
      setError('प्रोफाइल सेव करने में त्रुटि');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof AdvancedUserProfile, value: string | number) => {
    if (!editedProfile) return;
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const handleLocationChange = (field: 'village' | 'district' | 'state', value: string) => {
    if (!editedProfile) return;
    const updated = { ...editedProfile, [field]: value };
    // Update combined location string
    updated.location = `${updated.village || ''} ${updated.district || ''} ${updated.state || ''}`.trim();
    setEditedProfile(updated);
  };

  const handleLanguageChange = (langCode: string) => {
    if (!editedProfile) return;
    i18n.changeLanguage(langCode);
    setEditedProfile({ ...editedProfile, language: langCode });
  };

  const handleNotificationChange = (key: keyof AdvancedUserProfile['notifications'], value: boolean) => {
    if (!editedProfile) return;
    setEditedProfile({
      ...editedProfile,
      notifications: {
        ...editedProfile.notifications,
        [key]: value
      }
    });
  };

  const handleDataSyncChange = (key: string, value: boolean) => {
    if (!editedProfile) return;
    setEditedProfile({
      ...editedProfile,
      dataSync: {
        ...editedProfile.dataSync,
        [key]: value
      }
    });
  };

  const toggleExpertise = (expertise: string) => {
    if (!editedProfile) return;
    const currentExpertise = editedProfile.expertise || [];
    const updatedExpertise = currentExpertise.includes(expertise) 
      ? currentExpertise.filter(item => item !== expertise)
      : [...currentExpertise, expertise];
    
    setEditedProfile({
      ...editedProfile,
      expertise: updatedExpertise
    });
  };

  const toggleCrop = (crop: string) => {
    if (!editedProfile) return;
    const updatedCrops = editedProfile.primaryCrops.includes(crop)
      ? editedProfile.primaryCrops.filter(c => c !== crop)
      : [...editedProfile.primaryCrops, crop];
    
    setEditedProfile({ ...editedProfile, primaryCrops: updatedCrops });
  };

  const achievements = [
    {
      title: 'पहला लॉगिन',
      description: 'ऐप में पहली बार लॉगिन किया',
      icon: <User size={20} />,
      earned: true,
      earnedDate: '15 दिसंबर 2024'
    },
    {
      title: 'फसल विशेषज्ञ',
      description: '5 फसलों की जानकारी जोड़ी',
      icon: <Sprout size={20} />,
      earned: true,
      progress: 100,
      earnedDate: '20 दिसंबर 2024'
    },
    {
      title: 'मौसम ट्रैकर',
      description: '30 दिन तक मौसम ट्रैक किया',
      icon: <Cloud size={20} />,
      earned: false,
      progress: 75
    },
    {
      title: 'मार्केट मास्टर',
      description: '50 मार्केट प्राइस चेक किए',
      icon: <BarChart3 size={20} />,
      earned: false,
      progress: 60
    },
    {
      title: 'सामुदायिक सहायक',
      description: '10 किसानों की मदद की',
      icon: <Heart size={20} />,
      earned: false,
      progress: 30
    },
    {
      title: 'टेक्नोलॉजी एडाप्टर',
      description: 'सभी फीचर्स इस्तेमाल किए',
      icon: <Award size={20} />,
      earned: false,
      progress: 85
    }
  ];

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      localStorage.removeItem('userProfile');
      // Navigate will be handled by AuthContext
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const ProfileField = ({ 
    label, 
    value, 
    icon: Icon, 
    isEditing, 
    children, 
    type = 'text',
    className = '' 
  }: { 
    label: string;
    value: string | number;
    icon: React.ElementType;
    isEditing: boolean;
    children?: React.ReactNode;
    type?: string;
    className?: string;
  }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      {isEditing ? (
        children
      ) : (
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <Icon className="mr-3 text-gray-500" size={18} />
          <span className="text-gray-800 font-medium">{value}</span>
        </div>
      )}
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = 'green' }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: 'green' | 'blue' | 'purple' | 'orange';
  }) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    
    return (
      <div className={`p-4 rounded-xl border-2 ${colors[color]} transition-transform hover:scale-105`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon size={24} className="opacity-60" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  if (!profile || !editedProfile) {
    return (
      <div className="text-center p-8">
        <User size={48} className="mx-auto mb-4 text-gray-400" />
        <p>प्रोफाइल लोड नहीं हो सका।</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Enhanced Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              
              {/* Profile Picture */}
              <div className="relative group">
                <img 
                  src={profile.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}&backgroundColor=22c55e`} 
                  alt="प्रोफाइल फोटो" 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <button className="absolute bottom-2 right-2 bg-white text-green-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={16} />
                </button>
              </div>
              
              {/* Profile Info */}
              <div className="text-center lg:text-left text-white flex-1">
                <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                <p className="text-green-100 text-lg mb-4 flex items-center justify-center lg:justify-start">
                  <MapPin size={18} className="mr-2" />
                  {profile.location}
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                    🌾 {profile.farmSize}
                  </span>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                    📅 {profile.experience}
                  </span>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                    ⭐ {profile.reputation} प्रतिष्ठा
                  </span>
                </div>
                {profile.bio && (
                  <p className="text-green-100 mt-4 text-lg italic">"{profile.bio}"</p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSave} 
                      disabled={loading}
                      className="bg-white text-green-600 px-6 py-3 rounded-xl hover:bg-green-50 flex items-center font-semibold transition-all shadow-lg disabled:opacity-50"
                    >
                      <Save className="mr-2" size={18} /> 
                      {loading ? 'सेव हो रहा है...' : 'सेव करें'}
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 font-semibold transition-all"
                    >
                      रद्द करें
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-white text-green-600 px-6 py-3 rounded-xl hover:bg-green-50 flex items-center font-semibold transition-all shadow-lg"
                  >
                    <Edit className="mr-2" size={18} /> 
                    प्रोफाइल एडिट करें
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="px-8 py-6 bg-white border-t border-gray-100">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                icon={Calendar} 
                label="सदस्य बने" 
                value={profile.joinedDate || 'आज'}
                color="blue"
              />
              <StatCard 
                icon={User} 
                label="कुल पोस्ट" 
                value={profile.totalPosts || 0}
                color="green"
              />
              <StatCard 
                icon={Award} 
                label="सहायक उत्तर" 
                value={profile.helpfulAnswers || 0}
                color="purple"
              />
              <StatCard 
                icon={TrendingUp} 
                label="प्रतिष्ठा स्कोर" 
                value={profile.reputation || 0}
                color="orange"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'basic', label: 'बुनियादी जानकारी', icon: User },
              { key: 'farm', label: 'खेती की जानकारी', icon: Sprout },
              { key: 'preferences', label: 'सेटिंग्स', icon: Settings },
              { key: 'achievements', label: 'उपलब्धियां', icon: Award }
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="mr-3 text-green-600" size={24} />
                व्यक्तिगत जानकारी
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfileField 
                  label="नाम" 
                  value={profile.name} 
                  icon={User} 
                  isEditing={isEditing}
                >
                  <input 
                    type="text" 
                    value={editedProfile.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="आपका नाम दर्ज करें"
                  />
                </ProfileField>
                
                <ProfileField 
                  label="ईमेल" 
                  value={profile.email} 
                  icon={Mail} 
                  isEditing={isEditing}
                >
                  <input 
                    type="email" 
                    value={editedProfile.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="आपका ईमेल दर्ज करें"
                  />
                </ProfileField>
                
                <ProfileField 
                  label="मोबाइल नंबर" 
                  value={profile.phone} 
                  icon={Phone} 
                  isEditing={isEditing}
                >
                  <input 
                    type="tel" 
                    value={editedProfile.phone} 
                    onChange={(e) => handleInputChange('phone', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="+91 98765 43210"
                  />
                </ProfileField>
                
                <ProfileField 
                  label="गांव" 
                  value={profile.village || 'गांव का नाम'} 
                  icon={MapPin} 
                  isEditing={isEditing}
                >
                  <input 
                    type="text" 
                    value={editedProfile.village || ''} 
                    onChange={(e) => handleLocationChange('village', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="आपके गांव का नाम"
                  />
                </ProfileField>
                
                <ProfileField 
                  label="जिला" 
                  value={profile.district || 'जिला का नाम'} 
                  icon={MapPin} 
                  isEditing={isEditing}
                >
                  <input 
                    type="text" 
                    value={editedProfile.district || ''} 
                    onChange={(e) => handleLocationChange('district', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="आपके जिले का नाम"
                  />
                </ProfileField>
                
                <ProfileField 
                  label="राज्य" 
                  value={profile.state || 'राज्य का नाम'} 
                  icon={MapPin} 
                  isEditing={isEditing}
                >
                  <input 
                    type="text" 
                    value={editedProfile.state || ''} 
                    onChange={(e) => handleLocationChange('state', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="आपके राज्य का नाम"
                  />
                </ProfileField>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">परिचय</label>
                  {isEditing ? (
                    <textarea 
                      value={editedProfile.bio || ''} 
                      onChange={(e) => handleInputChange('bio', e.target.value)} 
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                      placeholder="अपने बारे में कुछ बताएं..."
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-800">{profile.bio || 'कोई परिचय नहीं दिया गया।'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Farm Information Tab */}
          {activeTab === 'farm' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Sprout className="mr-3 text-green-600" size={24} />
                खेती की जानकारी
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfileField 
                  label="खेत का आकार" 
                  value={profile.farmSize} 
                  icon={MapPin} 
                  isEditing={isEditing}
                >
                  <input 
                    type="text" 
                    value={editedProfile.farmSize} 
                    onChange={(e) => handleInputChange('farmSize', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="जैसे: 5 एकड़, 2 हेक्टेयर"
                  />
                </ProfileField>
                
                <ProfileField 
                  label="अनुभव" 
                  value={profile.experience} 
                  icon={Calendar} 
                  isEditing={isEditing}
                >
                  <input 
                    type="text" 
                    value={editedProfile.experience} 
                    onChange={(e) => handleInputChange('experience', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="जैसे: 10+ वर्ष, 5 साल"
                  />
                </ProfileField>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-3">मुख्य फसलें</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {cropOptions.map(crop => (
                        <label key={crop} className="flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editedProfile.primaryCrops.includes(crop)} 
                            onChange={() => toggleCrop(crop)} 
                            className="hidden" 
                          />
                          <span className={`w-full px-3 py-2 rounded-lg text-sm text-center transition-all ${
                            editedProfile.primaryCrops.includes(crop) 
                              ? 'bg-green-500 text-white transform scale-105' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}>
                            {crop}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.primaryCrops.map(crop => (
                        <span key={crop} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
                          🌾 {crop}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-3">विशेषज्ञता</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-3">
                      {expertiseOptions.map(expertise => (
                        <label key={expertise} className="flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(editedProfile.expertise || []).includes(expertise)} 
                            onChange={() => toggleExpertise(expertise)} 
                            className="hidden" 
                          />
                          <span className={`w-full px-3 py-2 rounded-lg text-sm text-center transition-all ${
                            (editedProfile.expertise || []).includes(expertise) 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}>
                            {expertise}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(profile.expertise || []).map(expertise => (
                        <span key={expertise} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                          ⭐ {expertise}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings className="mr-3 text-green-600" size={24} />
                सेटिंग्स और प्राथमिकताएं
              </h2>
              
              <div className="space-y-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Globe className="mr-2 text-blue-500" size={20} />
                    भाषा सेटिंग्स
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center cursor-pointer p-3 bg-white rounded-lg border hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="language" 
                        value="hi" 
                        checked={editedProfile.language === 'hi'} 
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="mr-3 text-green-500"
                      />
                      <span className="text-gray-800">हिंदी</span>
                    </label>
                    <label className="flex items-center cursor-pointer p-3 bg-white rounded-lg border hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="language" 
                        value="en" 
                        checked={editedProfile.language === 'en'} 
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="mr-3 text-green-500"
                      />
                      <span className="text-gray-800">English</span>
                    </label>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Bell className="mr-2 text-yellow-500" size={20} />
                    सूचना सेटिंग्स
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">मौसम की चेतावनी</span>
                      <input 
                        type="checkbox" 
                        checked={editedProfile.notifications?.weather || false}
                        onChange={(e) => handleNotificationChange('weather', e.target.checked)}
                        className="toggle-checkbox" 
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">मार्केट की कीमतें</span>
                      <input 
                        type="checkbox" 
                        checked={editedProfile.notifications?.prices || false}
                        onChange={(e) => handleNotificationChange('prices', e.target.checked)}
                        className="toggle-checkbox" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Award className="mr-3 text-green-600" size={24} />
                उपलब्धियां और बैज
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`p-6 rounded-xl border-2 transition-all ${
                    achievement.earned 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-full ${
                        achievement.earned 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 text-gray-500'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className={`font-semibold ${
                          achievement.earned ? 'text-green-800' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 font-semibold"
              >
                {loading ? 'सेव हो रहा है...' : 'सेव करें'}
              </button>
              <button 
                onClick={handleCancel}
                className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
              >
                कैंसल करें
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
            >
              प्रोफाइल एडिट करें
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
