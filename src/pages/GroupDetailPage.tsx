import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Settings, UserPlus, MessageCircle, MapPin, Tag } from 'lucide-react';
import communityService, { FarmerGroup, CommunityPost } from '../services/communityService';

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<FarmerGroup | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const groupData = await communityService.getGroup(groupId!);
      setGroup(groupData);
      
      // Load posts for this group
      const allPosts = await communityService.getPosts();
      setPosts(allPosts); // In real app, filter by groupId
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupId) return;
    
    try {
      await communityService.joinGroup(groupId, 'current_user_id');
      alert('Joined group successfully!');
      loadGroupData();
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId || !confirm('Are you sure you want to leave this group?')) return;
    
    try {
      await communityService.leaveGroup(groupId, 'current_user_id');
      alert('Left group successfully');
      navigate('/groups');
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-gray-600 mb-4">Group not found</p>
        <button
          onClick={() => navigate('/groups')}
          className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-700 relative">
          {group.imageUrl && (
            <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover opacity-50" />
          )}
          <button
            onClick={() => navigate('/groups')}
            className="absolute top-4 left-4 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-opacity-30 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Group Info */}
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{group.name}</h1>
                  <p className="text-gray-600 mb-4">{group.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.members.length} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{group.posts} posts</span>
                    </div>
                    {group.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{group.location.village || group.location.district}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {group.tags.map((tag, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleJoinGroup}
                  className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Join Group
                </button>
                <button className="bg-gray-100 text-gray-700 p-3 rounded-full hover:bg-gray-200 transition-all">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'posts'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'members'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Members
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-2">No posts yet</p>
                <p className="text-gray-500">Be the first to post in this group!</p>
              </div>
            ) : (
              posts.slice(0, 5).map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{post.farmerName}</span>
                    <span>•</span>
                    <span>{post.replies} replies</span>
                    <span>•</span>
                    <span>{post.likes} likes</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Group Members ({group.members.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.members.map((memberId, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                    F
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Farmer {idx + 1}</p>
                    <p className="text-sm text-gray-500">Member</p>
                  </div>
                  {group.admins.includes(memberId) && (
                    <span className="ml-auto bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailPage;
