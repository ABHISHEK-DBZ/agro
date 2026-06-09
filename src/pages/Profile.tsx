import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Edit3, Save, X, Camera, LogOut,
  Sprout, Calendar, Award, TrendingUp, Target, Leaf, BarChart3,
  Heart, Cloud, Globe, CheckCircle2, MessageSquare, Shield,
  ChevronRight, Loader2, AtSign, Hash, CalendarDays, Tractor,
  Bell, Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import type { UserProfile, UserSettings } from '../services/profileService';
import { PageHeader, Tabs, Button, Badge, Kpi, SectionTitle, Alert, Skeleton, FormField, Input, Select, Textarea, Modal } from '../components/ui';
import toast from 'react-hot-toast';

type ProfileTab = 'basic' | 'farm' | 'stats' | 'preferences';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile, logout, refreshUserProfile } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(userProfile || null);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!userProfile);
  const [activeTab, setActiveTab] = useState<ProfileTab>('basic');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let mounted = true;

    const unsub = profileService.subscribeToProfile?.(user.uid, (p) => {
      if (!mounted) return;
      setProfile(p);
      setEditedProfile(p || {});
      setLoading(false);
    });

    if (!unsub) {
      // Fallback
      profileService.getUserProfile(user.uid).then((p) => {
        if (!mounted) return;
        setProfile(p);
        setEditedProfile(p || {});
        setLoading(false);
      }).catch(() => setLoading(false));
    }

    return () => {
      mounted = false;
      if (typeof unsub === 'function') unsub();
    };
  }, [user]);

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Farmer';
  const initials = displayName
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const email = profile?.email || user?.email || '';
  const joinedDate = (profile as any)?.createdAt
    ? new Date((profile as any).createdAt)
    : (user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : null);
  const isVerified = (profile as any)?.emailVerified ?? !!user?.emailVerified;
  const location = (profile as any)?.location;
  const locationStr = location
    ? [location.village, location.district, location.state].filter(Boolean).join(', ')
    : null;

  const handleEdit = () => {
    setEditedProfile(profile || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await profileService.updateUserProfile(user.uid, editedProfile);
      await refreshUserProfile?.();
      setIsEditing(false);
      toast.success(t('profile.saved', 'Profile updated'));
    } catch (e) {
      console.error('Profile save failed', e);
      toast.error(t('profile.saveError', 'Failed to save profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  // Stats — derived from profile where available
  const stats = useMemo(() => {
    const farmSize = (profile as any)?.farmSize ?? null;
    const experience = (profile as any)?.experience ?? null;
    const primaryCrops = (profile as any)?.primaryCrops ?? [];
    return { farmSize, experience, primaryCrops };
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container-app py-8 space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-app py-5 md:py-8">
        {/* Hero card with avatar */}
        <div className="card overflow-hidden mb-5">
          <div className="h-24 md:h-32 bg-gradient-to-r from-leaf-700 via-leaf-600 to-leaf-700 relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,white,transparent_50%)]" />
          </div>
          <div className="px-4 md:px-6 pb-5 -mt-12 md:-mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-surface shadow-md">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt={displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-leaf-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-leaf-700"
                    aria-label="Change photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Name & email */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-semibold text-strong truncate">{displayName}</h1>
                  {isVerified && (
                    <span title="Verified" className="inline-flex items-center text-leaf-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted truncate flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" /> {email}
                </p>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted">
                  {locationStr && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {locationStr}
                    </span>
                  )}
                  {joinedDate && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {t('profile.joined', 'Joined')} {joinedDate.toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleCancel} leftIcon={<X className="w-3.5 h-3.5" />}>
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave} loading={saving} leftIcon={<Save className="w-3.5 h-3.5" />}>
                      {t('common.save', 'Save')}
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" size="sm" onClick={handleEdit} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                    {t('profile.editProfile', 'Edit Profile')}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowLogoutConfirm(true)} leftIcon={<LogOut className="w-3.5 h-3.5" />}>
                  {t('common.logout', 'Logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          variant="pill"
          tabs={[
            { id: 'basic', label: t('profile.tabBasic', 'Basic Info'), icon: <User className="w-3.5 h-3.5" /> },
            { id: 'farm', label: t('profile.tabFarm', 'Farm Details'), icon: <Tractor className="w-3.5 h-3.5" /> },
            { id: 'stats', label: t('profile.tabStats', 'Stats & Activity'), icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'preferences', label: t('profile.tabPrefs', 'Preferences'), icon: <Globe className="w-3.5 h-3.5" /> },
          ]}
          active={activeTab}
          onChange={(id) => setActiveTab(id as ProfileTab)}
        />

        {/* Tab content */}
        <div className="mt-5 space-y-4">
          {activeTab === 'basic' && (
            <div className="card card-padded">
              <SectionTitle
                title={t('profile.basicInfo', 'Basic Information')}
                description={t('profile.basicInfoDesc', 'Your personal details and contact information.')}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField label={t('profile.name', 'Full Name')}>
                  {isEditing ? (
                    <Input
                      value={editedProfile.displayName || ''}
                      onChange={(e) => setEditedProfile((p) => ({ ...p, displayName: e.target.value }))}
                      leftIcon={<User className="w-4 h-4" />}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <ReadonlyField icon={<User className="w-4 h-4" />} value={profile?.displayName || '—'} />
                  )}
                </FormField>

                <FormField label={t('profile.email', 'Email')}>
                  <ReadonlyField icon={<Mail className="w-4 h-4" />} value={email} verified={isVerified} />
                </FormField>

                <FormField label={t('profile.phone', 'Phone Number')}>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={(editedProfile as any)?.phone || ''}
                      onChange={(e) => setEditedProfile((p) => ({ ...p, phone: e.target.value } as any))}
                      leftIcon={<Phone className="w-4 h-4" />}
                      placeholder="+91 98765 43210"
                    />
                  ) : (
                    <ReadonlyField
                      icon={<Phone className="w-4 h-4" />}
                      value={(profile as any)?.phone || t('profile.notSet', 'Not set')}
                    />
                  )}
                </FormField>

                <FormField label={t('profile.role', 'Role')}>
                  <ReadonlyField icon={<Shield className="w-4 h-4" />} value={(profile as any)?.role || 'Farmer'} />
                </FormField>
              </div>

              <div className="mt-4">
                <FormField label={t('profile.bio', 'About me')}>
                  {isEditing ? (
                    <Textarea
                      value={(editedProfile as any)?.bio || ''}
                      onChange={(e) => setEditedProfile((p) => ({ ...p, bio: e.target.value } as any))}
                      placeholder={t('profile.bioPlaceholder', 'Tell us about your farming journey...')}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-ink-700 leading-relaxed">
                      {(profile as any)?.bio || (
                        <span className="text-muted italic">{t('profile.noBio', 'No bio yet. Click "Edit Profile" to add one.')}</span>
                      )}
                    </p>
                  )}
                </FormField>
              </div>
            </div>
          )}

          {activeTab === 'farm' && (
            <div className="space-y-4">
              <div className="card card-padded">
                <SectionTitle
                  title={t('profile.location', 'Location')}
                  description={t('profile.locationDesc', 'Your farm location helps us provide local weather, market, and soil data.')}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField label={t('profile.state', 'State')}>
                    {isEditing ? (
                      <Select
                        value={(editedProfile as any)?.state || ''}
                        onChange={(e) => setEditedProfile((p) => ({ ...p, state: e.target.value } as any))}
                      >
                        <option value="">{t('common.select', 'Select...')}</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    ) : (
                      <ReadonlyField icon={<MapPin className="w-4 h-4" />} value={(profile as any)?.state || '—'} />
                    )}
                  </FormField>
                  <FormField label={t('profile.district', 'District')}>
                    {isEditing ? (
                      <Input
                        value={(editedProfile as any)?.district || ''}
                        onChange={(e) => setEditedProfile((p) => ({ ...p, district: e.target.value } as any))}
                        placeholder="e.g. Pune"
                      />
                    ) : (
                      <ReadonlyField value={(profile as any)?.district || '—'} />
                    )}
                  </FormField>
                  <FormField label={t('profile.village', 'Village / Town')}>
                    {isEditing ? (
                      <Input
                        value={(editedProfile as any)?.village || ''}
                        onChange={(e) => setEditedProfile((p) => ({ ...p, village: e.target.value } as any))}
                        placeholder="e.g. Hinjewadi"
                      />
                    ) : (
                      <ReadonlyField value={(profile as any)?.village || '—'} />
                    )}
                  </FormField>
                </div>
              </div>

              <div className="card card-padded">
                <SectionTitle
                  title={t('profile.farmInfo', 'Farm Information')}
                  description={t('profile.farmInfoDesc', 'Tell us about your farm so we can give tailored advice.')}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField label={t('profile.farmSize', 'Farm Size')} hint={t('profile.farmSizeHint', 'In acres')}>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.1"
                        value={(editedProfile as any)?.farmSize ?? ''}
                        onChange={(e) => setEditedProfile((p) => ({ ...p, farmSize: parseFloat(e.target.value) || 0 } as any))}
                        leftIcon={<Tractor className="w-4 h-4" />}
                        placeholder="e.g. 5.5"
                      />
                    ) : (
                      <ReadonlyField
                        icon={<Tractor className="w-4 h-4" />}
                        value={stats.farmSize != null ? `${stats.farmSize} acres` : '—'}
                      />
                    )}
                  </FormField>
                  <FormField label={t('profile.experience', 'Experience')} hint={t('profile.experienceHint', 'Years of farming')}>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={(editedProfile as any)?.experience ?? ''}
                        onChange={(e) => setEditedProfile((p) => ({ ...p, experience: parseInt(e.target.value) || 0 } as any))}
                        leftIcon={<Award className="w-4 h-4" />}
                        placeholder="e.g. 10"
                      />
                    ) : (
                      <ReadonlyField
                        icon={<Award className="w-4 h-4" />}
                        value={stats.experience != null ? `${stats.experience} years` : '—'}
                      />
                    )}
                  </FormField>
                </div>
                <div className="mt-4">
                  <FormField label={t('profile.primaryCrops', 'Primary Crops')} hint={t('profile.primaryCropsHint', 'Comma-separated, e.g. Rice, Wheat, Cotton')}>
                    {isEditing ? (
                      <Input
                        value={Array.isArray((editedProfile as any)?.primaryCrops) ? (editedProfile as any).primaryCrops.join(', ') : ''}
                        onChange={(e) => setEditedProfile((p) => ({
                          ...p,
                          primaryCrops: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        } as any))}
                        leftIcon={<Sprout className="w-4 h-4" />}
                        placeholder="Rice, Wheat, Cotton"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {stats.primaryCrops.length > 0 ? (
                          stats.primaryCrops.map((c: string) => (
                            <Badge key={c} tone="leaf">{c}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted italic">—</span>
                        )}
                      </div>
                    )}
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Kpi label={t('profile.statCrops', 'Crops')} value={stats.primaryCrops.length || '—'} icon={<Sprout className="w-4 h-4" />} />
                <Kpi label={t('profile.statFarmSize', 'Farm Size')} value={stats.farmSize != null ? `${stats.farmSize}` : '—'} hint={t('common.acres', 'acres')} icon={<Tractor className="w-4 h-4" />} />
                <Kpi label={t('profile.statExperience', 'Experience')} value={stats.experience != null ? `${stats.experience}` : '—'} hint={t('common.years', 'years')} icon={<Award className="w-4 h-4" />} />
                <Kpi label={t('profile.statMember', 'Member since')} value={joinedDate ? joinedDate.getFullYear() : '—'} icon={<Calendar className="w-4 h-4" />} />
              </div>

              <div className="card card-padded">
                <SectionTitle
                  title={t('profile.activity', 'Recent Activity')}
                  description={t('profile.activityDesc', 'Your recent actions across the platform.')}
                />
                <Alert tone="info" className="mt-3">
                  <Heart className="w-4 h-4" />
                  <span>
                    {t('profile.activityEmpty', 'Activity history will appear here as you use the app.')}
                  </span>
                </Alert>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card card-padded">
              <SectionTitle
                title={t('profile.preferences', 'Preferences')}
                description={t('profile.preferencesDesc', 'Quick access to your account preferences.')}
              />
              <div className="divide-y divide-subtle">
                <PrefLink
                  icon={<Globe className="w-4 h-4" />}
                  iconTone="sky"
                  title={t('profile.language', 'Language')}
                  description={t('profile.languageDesc', 'Change your preferred language')}
                  trailing={i18n.language.toUpperCase()}
                  onClick={() => navigate('/settings')}
                />
                <PrefLink
                  icon={<Bell className="w-4 h-4" />}
                  iconTone="harvest"
                  title={t('profile.notifications', 'Notifications')}
                  description={t('profile.notificationsDesc', 'Choose how you want to be notified')}
                  onClick={() => navigate('/settings')}
                />
                <PrefLink
                  icon={<Shield className="w-4 h-4" />}
                  iconTone="leaf"
                  title={t('profile.privacy', 'Privacy & Security')}
                  description={t('profile.privacyDesc', 'Manage your privacy settings')}
                  onClick={() => navigate('/settings')}
                />
                <PrefLink
                  icon={<Database className="w-4 h-4" />}
                  iconTone="soil"
                  title={t('profile.data', 'Data & Storage')}
                  description={t('profile.dataDesc', 'Export, import, and clear your data')}
                  onClick={() => navigate('/settings')}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout confirmation modal */}
      <Modal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={t('profile.logoutConfirmTitle', 'Log out?')}
        description={t('profile.logoutConfirmDesc', 'You will need to sign in again to access your data.')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button variant="danger" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
              {t('common.logout', 'Logout')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">
          {t('profile.logoutMessage', 'Are you sure you want to end your session?')}
        </p>
      </Modal>
    </div>
  );
};

// Read-only field with icon
const ReadonlyField: React.FC<{ icon?: React.ReactNode; value: string; verified?: boolean }> = ({ icon, value, verified }) => (
  <div className="input flex items-center gap-2 cursor-default">
    {icon && <span className="text-ink-500">{icon}</span>}
    <span className="text-sm text-strong flex-1">{value}</span>
    {verified && <CheckCircle2 className="w-4 h-4 text-leaf-600 flex-shrink-0" />}
  </div>
);

const PrefLink: React.FC<{
  icon: React.ReactNode;
  iconTone: 'leaf' | 'sky' | 'soil' | 'harvest' | 'danger' | 'default';
  title: string;
  description: string;
  trailing?: React.ReactNode;
  onClick: () => void;
}> = ({ icon, iconTone, title, description, trailing, onClick }) => {
  const tones: Record<string, string> = {
    leaf: 'bg-leaf-50 text-leaf-700',
    sky: 'bg-sky-50 text-sky-700',
    soil: 'bg-soil-50 text-soil-700',
    harvest: 'bg-harvest-50 text-harvest-700',
    danger: 'bg-[#fef2f2] text-danger-600',
    default: 'bg-sunken text-ink-700',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 hover:bg-sunken/50 transition-colors rounded-md -mx-2 px-2"
    >
      <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${tones[iconTone]}`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-strong">{title}</p>
        <p className="text-xs text-muted truncate">{description}</p>
      </div>
      {trailing && <span className="text-xs font-medium text-muted">{trailing}</span>}
      <ChevronRight className="w-4 h-4 text-ink-400 flex-shrink-0" />
    </button>
  );
};

export default Profile;
