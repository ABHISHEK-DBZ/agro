import React, { useState, useEffect } from 'react';
import { Users, Plus, MapPin, Lock, Globe, Search, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import communityService, { FarmerGroup } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';

const GroupsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const currentUserId = user?.uid || '';
  const currentUserName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'You';
  
  const [groups, setGroups] = useState<FarmerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for creating group
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'crop-specific' as 'crop-specific' | 'location-based' | 'equipment-sharing' | 'market-intelligence' | 'disease-management' | 'general',
    privacy: 'public' as 'public' | 'private',
    tags: ''
  });

  const categories = [
    { value: 'all', label: 'All Groups', icon: '🌐', key: 'all' },
    { value: 'crop-specific', label: 'Crop-Specific', icon: '🌾', key: 'crop-specific' },
    { value: 'location-based', label: 'Location-Based', icon: '📍', key: 'location-based' },
    { value: 'equipment-sharing', label: 'Equipment', icon: '🚜', key: 'equipment-sharing' },
    { value: 'market-intelligence', label: 'Market', icon: '💰', key: 'market-intelligence' },
    { value: 'disease-management', label: 'Disease', icon: '🦠', key: 'disease-management' },
    { value: 'general', label: 'General', icon: '💡', key: 'general' }
  ];

  // Subscribe to groups real-time
  useEffect(() => {
    setLoading(true);
    const categoryFilter = selectedCategory === 'all' ? undefined : selectedCategory;
    const unsubscribe = communityService.subscribeToGroups(categoryFilter, (fetchedGroups) => {
      setGroups(fetchedGroups);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedCategory]);

  const handleJoinLeaveGroup = async (e: React.MouseEvent, group: FarmerGroup) => {
    e.stopPropagation();
    if (!currentUserId) {
      toast.error(t('profile.loginRequired', 'Please log in to join groups'));
      return;
    }

    const isMember = group.members.includes(currentUserId);
    try {
      if (isMember) {
        // Confirm leaving group
        if (window.confirm(t('community.confirmLeaveGroup', 'Are you sure you want to leave this group?'))) {
          await communityService.leaveGroup(group.id, currentUserId);
          toast.success(t('community.leftGroupSuccess', 'Left group successfully'));
        }
      } else {
        await communityService.joinGroup(group.id, currentUserId);
        toast.success(t('community.joinedGroupSuccess', 'Joined group successfully! 🎉'));
      }
    } catch (error) {
      console.error('Error join/leave group:', error);
      toast.error(t('common.error', 'An error occurred'));
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error(t('profile.loginRequired', 'Please log in to create a group'));
      return;
    }
    if (!newGroup.name.trim() || !newGroup.description.trim()) {
      toast.error(t('common.error', 'Please fill in required fields'));
      return;
    }

    try {
      setLoading(true);
      const groupId = await communityService.createGroup({
        name: newGroup.name,
        description: newGroup.description,
        category: newGroup.category,
        privacy: newGroup.privacy,
        createdBy: currentUserId,
        createdByName: currentUserName,
        tags: newGroup.tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      // Reset Form & Close
      setNewGroup({
        name: '',
        description: '',
        category: 'crop-specific',
        privacy: 'public',
        tags: ''
      });
      setShowCreateModal(false);
      toast.success(t('community.groupCreatedSuccess', 'Group created successfully! 🎉'));
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(t('common.error', 'Failed to create group'));
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#14130f] text-[#26241f] dark:text-[#eeece7] pb-12 transition-colors duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2f4328] to-[#39542f] text-white py-12 px-6 shadow-md border-b border-[#2f4328]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 tracking-tight">
                <Users className="w-9 h-9 text-[#a3bf96]" />
                {t('community.farmerGroups', 'Farmer Groups')}
              </h1>
              <p className="text-[#c7d9bf]/80 mt-1.5 text-sm sm:text-base font-medium">
                {groups.length} {t('community.groups', 'Groups')} • {t('community.connectWithFarmers', 'Connect with farmers around you')}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#7ea26d] hover:bg-[#6c8e5d] text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-5 h-5" />
              {t('community.createGroup', 'Create Group')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {/* Search & Category Filter Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Category Filter */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1f1d18] rounded-2xl p-4 border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-[#39542f] text-white shadow-sm scale-102'
                      : 'bg-[#f1efe9] dark:bg-[#181713] text-[#615b4f] dark:text-[#bfbaad] hover:bg-[#dbd8d0] dark:hover:bg-[#3a3630]'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{t(`community.groupCategories.${cat.key}`, cat.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl p-4 border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9482] w-4.5 h-4.5" />
              <input
                type="text"
                placeholder={t('community.searchGroupsPlaceholder', 'Search groups by name, desc or tags...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-xs placeholder-[#9b9482] dark:placeholder-[#615b4f] focus:outline-none focus:border-[#39542f] focus:ring-1 focus:ring-[#39542f]/25 text-[#26241f] dark:text-[#eeece7]"
              />
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#39542f]"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] p-16 text-center shadow-sm max-w-xl mx-auto">
            <Users className="w-14 h-14 text-[#9b9482] mx-auto mb-4 opacity-55" />
            <h3 className="text-xl font-bold mb-1.5">{t('community.noGroupsFound', 'No Groups Found')}</h3>
            <p className="text-sm text-[#7a7364] dark:text-[#9b9482] mb-6">
              {t('community.tryDifferentSearch', 'Try a different search or create a new group!')}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#39542f] hover:bg-[#2f4328] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {t('community.createGroup', 'Create Group')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => {
              const isMember = group.members.includes(currentUserId);
              return (
                <div
                  key={group.id}
                  className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm hover:shadow-md hover:border-[#c7d9bf] dark:hover:border-[#39542f] transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div>
                    {/* Header Banner Background */}
                    <div className="h-28 bg-gradient-to-br from-[#7ea26d]/20 to-[#39542f]/20 flex items-center justify-center border-b border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] relative">
                      {group.imageUrl ? (
                        <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Users className="w-10 h-10 text-[#476a39] dark:text-[#7ea26d] opacity-80" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#476a39]/70 dark:text-[#7ea26d]/70 mt-1.5">
                            {t(`community.groupCategories.${group.category}`, group.category.replace('-', ' '))}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
                        {group.privacy === 'private' ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>{t('community.private', 'Private')}</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>{t('community.public', 'Public')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold line-clamp-1 mb-1">{group.name}</h3>
                      <p className="text-xs text-[#7a7364] dark:text-[#9b9482] line-clamp-2 min-h-[2rem] mb-4">
                        {group.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {group.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-[#f1efe9] dark:bg-[#181713] text-[#615b4f] dark:text-[#bfbaad] px-2 py-0.5 rounded-md text-[10px] font-bold">
                            #{tag}
                          </span>
                        ))}
                        {group.tags.length > 3 && (
                          <span className="text-[10px] text-[#39542f] dark:text-[#7ea26d] font-bold">
                            +{group.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                    <div className="flex items-center gap-3.5 text-xs text-[#7a7364] dark:text-[#9b9482]">
                      <div className="flex items-center gap-1" title={t('community.members', 'Members')}>
                        <Users className="w-4 h-4 text-[#39542f]/80 dark:text-[#7ea26d]/80" />
                        <span className="font-semibold">{group.members.length}</span>
                      </div>
                      <div className="flex items-center gap-1" title={t('community.posts', 'Posts')}>
                        <TrendingUp className="w-4 h-4 text-blue-500/80" />
                        <span className="font-semibold">{group.posts}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleJoinLeaveGroup(e, group)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isMember
                          ? 'bg-[#7ea26d]/10 text-[#39542f] dark:text-[#a3bf96] border border-[#7ea26d]/20 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/40'
                          : 'bg-[#39542f] hover:bg-[#2f4328] text-white'
                      }`}
                    >
                      {isMember ? t('community.leave', 'Leave') : t('community.join', 'Join')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl w-full max-w-lg overflow-hidden border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#2f4328] to-[#39542f] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#a3bf96]" />
                <h3 className="font-bold text-lg">{t('community.createGroup', 'Create Group')}</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a7364] dark:text-[#9b9482] mb-1.5">
                  {t('community.groupName', 'Group Name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rampur Wheat Growers"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a7364] dark:text-[#9b9482] mb-1.5">
                  {t('community.description', 'Description')} *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="What is this group about? Who should join?"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7a7364] dark:text-[#9b9482] mb-1.5">
                    {t('community.category', 'Category')}
                  </label>
                  <select
                    value={newGroup.category}
                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7]"
                  >
                    <option value="crop-specific">Crop-Specific</option>
                    <option value="location-based">Location-Based</option>
                    <option value="equipment-sharing">Equipment Sharing</option>
                    <option value="market-intelligence">Market Intelligence</option>
                    <option value="disease-management">Disease Management</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7a7364] dark:text-[#9b9482] mb-1.5">
                    {t('community.privacy', 'Privacy')}
                  </label>
                  <select
                    value={newGroup.privacy}
                    onChange={(e) => setNewGroup({ ...newGroup, privacy: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7]"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7a7364] dark:text-[#9b9482] mb-1.5">
                  {t('community.tags', 'Tags')}
                </label>
                <input
                  type="text"
                  placeholder="rice, tractor, mandi (comma separated)"
                  value={newGroup.tags}
                  onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[rgba(38,36,31,0.1)] dark:border-[rgba(255,255,255,0.1)] hover:bg-[#f1efe9] dark:hover:bg-[#181713] text-xs font-bold text-[#7a7364] dark:text-[#9b9482] transition-colors"
                >
                  {t('community.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#39542f] hover:bg-[#2f4328] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>}
                  {t('community.submit', 'Submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
