import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Camera
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  farmSize: string;
  primaryCrops: string[];
  experience: string;
  language: string;
  notifications: {
    weather: boolean;
    prices: boolean;
    diseases: boolean;
    schemes: boolean;
  }
}

const API_URL = 'http://localhost:5000/api';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        setProfile(response.data);
        setEditedProfile(response.data);
        if (response.data.language) {
          i18n.changeLanguage(response.data.language);
        }
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [i18n]);

  const cropOptions = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Corn', 'Soybean', 'Mustard', 'Barley'];
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
  ];

  const handleSave = async () => {
    if (!editedProfile) return;
    try {
      const response = await axios.post(`${API_URL}/profile`, editedProfile);
      setProfile(response.data.profile);
      setEditedProfile(response.data.profile);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!editedProfile) return;
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const handleLanguageChange = (langCode: string) => {
    if (!editedProfile) return;
    i18n.changeLanguage(langCode);
    setEditedProfile({ ...editedProfile, language: langCode });
  };

  const handleNotificationChange = (key: keyof UserProfile['notifications'], value: boolean) => {
    if (!editedProfile) return;
    setEditedProfile({
      ...editedProfile,
      notifications: {
        ...editedProfile.notifications,
        [key]: value
      }
    });
  };

  const toggleCrop = (crop: string) => {
    if (!editedProfile) return;
    const updatedCrops = editedProfile.primaryCrops.includes(crop)
      ? editedProfile.primaryCrops.filter(c => c !== crop)
      : [...editedProfile.primaryCrops, crop];
    
    setEditedProfile({ ...editedProfile, primaryCrops: updatedCrops });
  };

  const ProfileField = ({ label, value, icon: Icon, isEditing, children }: { label: string, value: string, icon: React.ElementType, isEditing: boolean, children?: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        {isEditing ? (
            children
        ) : (
            <p className="mt-1 text-gray-800 flex items-center">
                <Icon className="mr-2 text-gray-400" size={18} />
                {value}
            </p>
        )}
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p>Loading profile...</p></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  if (!profile || !editedProfile) {
    return <div className="text-center p-8">Could not load profile.</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-0">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center">
                <div className="relative">
                    <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`} alt="avatar" className="w-20 h-20 rounded-full mr-4 border-4 border-green-200" />
                    <button className="absolute bottom-0 right-4 bg-green-500 text-white p-1.5 rounded-full shadow-md hover:bg-green-600 transition">
                        <Camera size={14} />
                    </button>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                    <p className="text-gray-500">{profile.location}</p>
                </div>
            </div>
            <div className="flex space-x-2 self-end sm:self-center">
                {isEditing ? (
                <>
                    <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center font-semibold transition-colors">
                        <Save className="mr-2" size={16} /> {t('common.save')}
                    </button>
                    <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold transition-colors">
                        {t('common.cancel')}
                    </button>
                </>
                ) : (
                <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center font-semibold transition-colors">
                    <Edit className="mr-2" size={16} /> {t('profile.editProfile')}
                </button>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Personal & Farm Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">{t('profile.farmInfo')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField label={t('profile.name')} value={profile.name} icon={User} isEditing={isEditing}>
                        <input type="text" value={editedProfile.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </ProfileField>
                    <ProfileField label={t('profile.email')} value={profile.email} icon={Mail} isEditing={isEditing}>
                        <input type="email" value={editedProfile.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </ProfileField>
                    <ProfileField label={t('profile.phone')} value={profile.phone} icon={Phone} isEditing={isEditing}>
                        <input type="tel" value={editedProfile.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </ProfileField>
                    <ProfileField label={t('profile.location')} value={profile.location} icon={MapPin} isEditing={isEditing}>
                        <textarea value={editedProfile.location} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={1} />
                    </ProfileField>
                    <ProfileField label={t('profile.farmSize')} value={profile.farmSize} icon={MapPin} isEditing={isEditing}>
                        <input type="text" value={editedProfile.farmSize} onChange={(e) => handleInputChange('farmSize', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </ProfileField>
                    <ProfileField label={t('profile.experience')} value={profile.experience} icon={User} isEditing={isEditing}>
                        <input type="text" value={editedProfile.experience} onChange={(e) => handleInputChange('experience', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </ProfileField>
                </div>
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-500 mb-2">{t('profile.primaryCrops')}</label>
                    {isEditing ? (
                        <div className="flex flex-wrap gap-3">
                        {cropOptions.map(crop => (
                            <label key={crop} className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={editedProfile.primaryCrops.includes(crop)} onChange={() => toggleCrop(crop)} className="hidden" />
                            <span className={`px-3 py-1 rounded-full text-sm transition-colors ${editedProfile.primaryCrops.includes(crop) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                {crop}
                            </span>
                            </label>
                        ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                        {profile.primaryCrops.map(crop => (
                            <span key={crop} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {crop}
                            </span>
                        ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-8">
            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Settings className="mr-3 text-gray-500" /> {t('profile.settings')}
                </h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium mb-2 flex items-center text-gray-600">
                            <Languages className="mr-2" size={18} /> {t('profile.language')}
                        </h3>
                        <select value={editedProfile.language} onChange={(e) => handleLanguageChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            {languageOptions.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <h3 className="font-medium mb-3 flex items-center text-gray-600">
                            <Bell className="mr-2" size={18} /> {t('profile.notifications')}
                        </h3>
                        <div className="space-y-2">
                        {(Object.keys(editedProfile.notifications) as Array<keyof typeof editedProfile.notifications>).map((key) => (
                            <label key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm capitalize text-gray-700">{t(`profile.notificationTypes.${key}`)}</span>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" checked={editedProfile.notifications[key]} onChange={(e) => handleNotificationChange(key, e.target.checked)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                </div>
                            </label>
                        ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Shield className="mr-3 text-gray-500" /> {t('profile.account')}
                </h2>
                <div className="space-y-3">
                    {/* Change Name Inline Form */}
                    <details className="mb-2">
                      <summary className="w-full text-left text-green-600 hover:underline cursor-pointer">Change Name</summary>
                      <form className="mt-2" onSubmit={async e => {
                        e.preventDefault();
                        setLoading(true);
                        setError(null);
                        try {
                          await axios.post(`${API_URL}/update-profile`, { name: editedProfile?.name });
                          setProfile({ ...profile, name: editedProfile?.name || profile.name });
                          setEditedProfile({ ...editedProfile, name: editedProfile?.name || profile.name });
                          setError('Name updated successfully!');
                        } catch {
                          setError('Error updating name.');
                        }
                        setLoading(false);
                      }}>
                        <input
                          type="text"
                          className="w-full p-2 mb-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          value={editedProfile?.name || ''}
                          onChange={e => setEditedProfile({ ...editedProfile!, name: e.target.value })}
                          required
                        />
                        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700" disabled={loading}>Update Name</button>
                      </form>
                    </details>
                    {/* Change Password Inline Form */}
                    <details>
                      <summary className="w-full text-left text-blue-600 hover:underline cursor-pointer">Change Password</summary>
                      <form className="mt-2" onSubmit={async e => {
                        e.preventDefault();
                        setLoading(true);
                        setError(null);
                        const oldPassword = (document.getElementById('oldPassword') as HTMLInputElement)?.value;
                        const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value;
                        const confirmNewPassword = (document.getElementById('confirmNewPassword') as HTMLInputElement)?.value;
                        if (newPassword !== confirmNewPassword) {
                          setError('New passwords do not match.');
                          setLoading(false);
                          return;
                        }
                        try {
                          await axios.post(`${API_URL}/change-password`, { oldPassword, newPassword });
                          setError('Password changed successfully!');
                        } catch {
                          setError('Error changing password.');
                        }
                        setLoading(false);
                      }}>
                        <input id="oldPassword" type="password" placeholder="Current password" className="w-full p-2 mb-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                        <input id="newPassword" type="password" placeholder="New password" className="w-full p-2 mb-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                        <input id="confirmNewPassword" type="password" placeholder="Confirm new password" className="w-full p-2 mb-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={loading}>Change Password</button>
                      </form>
                    </details>
                    {error && <p className="mt-2 text-center text-green-600 dark:text-green-400">{error}</p>}
                    <button className="w-full text-left text-red-600 hover:underline flex items-center">
                        <LogOut size={16} className="mr-2" /> {t('profile.logout')}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
