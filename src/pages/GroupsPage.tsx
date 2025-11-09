import React, { useState, useEffect } from 'react';
import { Users, Plus, MapPin, Lock, Globe, Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import communityService, { FarmerGroup } from '../services/communityService';

const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<FarmerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: 'All Groups', icon: '🌐' },
    { value: 'crop-specific', label: 'Crop-Specific', icon: '🌾' },
    { value: 'location-based', label: 'Location-Based', icon: '📍' },
    { value: 'equipment-sharing', label: 'Equipment', icon: '🚜' },
    { value: 'market-intelligence', label: 'Market', icon: '💰' },
    { value: 'disease-management', label: 'Disease', icon: '🦠' },
    { value: 'general', label: 'General', icon: '💡' }
  ];

  useEffect(() => {
    loadGroups();
  }, [selectedCategory]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const fetchedGroups = await communityService.getGroups(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await communityService.joinGroup(groupId, 'current_user_id');
      alert('Joined group successfully!');
      loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Users className="w-10 h-10" />
                Farmer Groups
              </h1>
              <p className="text-purple-100 mt-2">
                {groups.length} Groups • Connect with farmers like you
              </p>
            </div>
            <button
              onClick={() => navigate('/community')}
              className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search groups by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No groups found</p>
            <p className="text-gray-500">Try a different search or create a new group!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <div
                key={group.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {/* Group Image/Banner */}
                <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  {group.imageUrl ? (
                    <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-16 h-16 text-white opacity-50" />
                  )}
                </div>

                <div className="p-5">
                  {/* Group Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{group.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {group.privacy === 'private' ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                        <span>{group.privacy === 'private' ? 'Private' : 'Public'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {group.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                        #{tag}
                      </span>
                    ))}
                    {group.tags.length > 3 && (
                      <span className="text-purple-600 text-xs font-semibold">+{group.tags.length - 3}</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{group.members.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{group.posts} posts</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group.id);
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Join
                    </button>
                  </div>

                  {/* Location */}
                  {group.location && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{group.location.village || group.location.district || 'Near you'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
