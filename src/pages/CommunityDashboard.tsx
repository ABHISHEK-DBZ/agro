import React, { useState, useEffect } from 'react';
import { 
  Plus, MessageCircle, ThumbsUp, Eye, Clock, User, Tag, 
  Search, Send, X, Image as ImageIcon, MapPin, AlertCircle, 
  Edit, Trash2, Users, Bell, BarChart3, Award, MessageSquare, 
  Zap, Cpu, Battery 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import communityService, { CommunityPost, CommunityStats } from '../services/communityService';
import { useSwarmTelemetry } from '../hooks/useSwarmTelemetry';
import { useAuth } from '../contexts/AuthContext';

const CommunityDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const currentUserId = user?.uid || '';
  const currentUserName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'You';

  // Real-time Swarm dispatch and telemetry channels
  const { peers, equipment, soilStats, liveMessages, sendBroadcastMessage } = useSwarmTelemetry();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'crop-specific' as 'crop-specific' | 'location-based' | 'equipment-sharing' | 'market-intelligence' | 'disease-management' | 'general',
    privacy: 'public' as 'public' | 'private',
    tags: ''
  });
  
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    totalPosts: 0,
    activeFarmers: 0,
    resolvedQuestions: 0,
    onlineExperts: 0,
    totalAlerts: 0,
    totalContributions: 0
  });

  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: 'crops',
    tags: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    images: [] as File[]
  });

  const categories = [
    { value: 'all', label: 'All', icon: '🌐', labelHindi: 'सभी' },
    { value: 'crops', label: 'Crops', icon: '🌾', labelHindi: 'फसलें' },
    { value: 'diseases', label: 'Diseases', icon: '🦠', labelHindi: 'रोग' },
    { value: 'weather', label: 'Weather', icon: '🌤️', labelHindi: 'मौसम' },
    { value: 'market', label: 'Market', icon: '💰', labelHindi: 'बाजार' },
    { value: 'equipment', label: 'Equipment', icon: '🚜', labelHindi: 'उपकरण' },
    { value: 'schemes', label: 'Schemes', icon: '📋', labelHindi: 'योजनाएं' },
    { value: 'advice', label: 'Advice', icon: '💡', labelHindi: 'सलाह' }
  ];

  // Subscribe to real-time posts
  useEffect(() => {
    setLoading(true);
    const unsubscribe = communityService.subscribeToPosts(selectedCategory, (fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedCategory]);

  // Load stats dynamically
  useEffect(() => {
    loadStats();
  }, [posts]);

  const loadStats = async () => {
    try {
      const stats = await communityService.getStats();
      setCommunityStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Handle new post submission
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.description.trim()) {
      toast.error(t('common.error', 'Please fill in required fields'));
      return;
    }

    try {
      setLoading(true);
      await communityService.createPost({
        farmerId: currentUserId,
        farmerName: currentUserName,
        title: newPost.title,
        description: newPost.description,
        category: newPost.category,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
        urgency: newPost.urgency
      }, newPost.images);

      // Reset form
      setNewPost({
        title: '',
        description: '',
        category: 'crops',
        tags: '',
        urgency: 'medium',
        images: []
      });
      setShowNewPostForm(false);
      toast.success(t('common.success', 'Post created successfully!'));
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewPost({ ...newPost, images: [...newPost.images, ...files] });
    }
  };

  const removeImage = (index: number) => {
    const newImages = newPost.images.filter((_, i) => i !== index);
    setNewPost({ ...newPost, images: newImages });
  };

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setLoading(true);
      await communityService.deletePost(postId);
      toast.success('Post deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('You do not have permission to delete this post.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit post
  const handleEditPost = (post: CommunityPost) => {
    if (post.farmerId !== currentUserId) {
      toast.error('You can only edit your own posts.');
      return;
    }
    setSelectedPost(post);
    setNewPost({
      title: post.title,
      description: post.description,
      category: post.category,
      tags: post.tags.join(', '),
      urgency: post.urgency,
      images: []
    });
    setShowEditModal(true);
  };

  const handleUpdatePost = async () => {
    if (!selectedPost || !newPost.title.trim() || !newPost.description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    try {
      setLoading(true);
      await communityService.updatePost(selectedPost.id, {
        title: newPost.title,
        description: newPost.description,
        category: newPost.category,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
        urgency: newPost.urgency
      });

      setShowEditModal(false);
      setSelectedPost(null);
      setNewPost({
        title: '',
        description: '',
        category: 'crops',
        tags: '',
        urgency: 'medium',
        images: []
      });
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post.');
    } finally {
      setLoading(false);
    }
  };

  // Handle replies
  const handleOpenReplies = async (post: CommunityPost) => {
    setSelectedPost(post);
    setShowRepliesModal(true);
    try {
      const postReplies = await communityService.getReplies(post.id);
      setReplies(postReplies);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleAddReply = async () => {
    if (!selectedPost || !replyText.trim()) return;

    try {
      await communityService.addReply({
        postId: selectedPost.id,
        farmerId: currentUserId,
        farmerName: currentUserName,
        content: replyText,
        isExpert: userProfile?.role === 'expert'
      });

      setReplyText('');
      const updatedReplies = await communityService.getReplies(selectedPost.id);
      setReplies(updatedReplies);
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply.');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await communityService.toggleLike(postId, currentUserId);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleMarkAsSolved = async (postId: string) => {
    try {
      await communityService.markAsSolved(postId);
      toast.success('Post marked as solved!');
    } catch (error) {
      console.error('Error marking as solved:', error);
    }
  };

  // Handle create group
  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.description.trim()) {
      toast.error('Please fill in group name and description');
      return;
    }

    try {
      setLoading(true);
      await communityService.createGroup({
        name: newGroup.name,
        description: newGroup.description,
        category: newGroup.category,
        privacy: newGroup.privacy,
        createdBy: currentUserId,
        createdByName: currentUserName,
        tags: newGroup.tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      // Reset form
      setNewGroup({
        name: '',
        description: '',
        category: 'crop-specific',
        privacy: 'public',
        tags: ''
      });
      setShowCreateGroupModal(false);
      toast.success('Group created successfully! 🎉');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#14130f] text-[#26241f] dark:text-[#eeece7] pb-24 md:pb-6 transition-colors duration-300">
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-[#2f4328] to-[#39542f] text-[#f1efe9] py-8 shadow-md border-b border-[#2f4328]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 tracking-tight">
                <MessageCircle className="w-9 h-9 text-[#a3bf96]" />
                {t('community.title', 'Farmer Community')}
              </h1>
              <p className="text-[#c7d9bf]/80 mt-1 text-sm sm:text-base font-medium">
                {communityStats.activeFarmers.toLocaleString()} {t('community.activeFarmers', 'Active Farmers')} • {communityStats.onlineExperts} {t('community.onlineExperts', 'Experts Online')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => navigate('/notifications')}
                className="bg-white/10 hover:bg-white/15 text-white p-3 rounded-full transition-all relative border border-white/10"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-[#b94a3e] text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">3</span>
              </button>
              <button
                onClick={() => navigate('/groups')}
                className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 border border-white/10 shadow-sm"
              >
                <Users className="w-4 h-4" />
                {t('community.groups', 'Groups')}
              </button>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 border border-white/10 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {t('community.createGroup', 'Create Group')}
              </button>
              <button
                onClick={() => setShowNewPostForm(true)}
                className="bg-[#7ea26d] hover:bg-[#6c8e5d] text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                {t('community.newPost', 'New Post')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Strip */}
      <div className="bg-white dark:bg-[#1f1d18] border-b border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <button
              onClick={() => navigate('/polls')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/35 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 transition-all text-xs font-semibold whitespace-nowrap border border-blue-100 dark:border-blue-900/30"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('community.polls', 'Polls')}</span>
            </button>
            <button
              onClick={() => navigate('/map')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/35 text-purple-700 dark:text-purple-300 hover:bg-purple-100/70 transition-all text-xs font-semibold whitespace-nowrap border border-purple-100 dark:border-purple-900/30"
            >
              <MapPin className="w-4 h-4" />
              <span>{t('community.mapView', 'Map View')}</span>
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 dark:bg-yellow-950/35 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100/70 transition-all text-xs font-semibold whitespace-nowrap border border-yellow-100 dark:border-yellow-900/30"
            >
              <Award className="w-4 h-4" />
              <span>{t('community.leaderboard', 'Leaderboard')}</span>
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950/35 text-green-700 dark:text-green-300 hover:bg-green-100/70 transition-all text-xs font-semibold whitespace-nowrap border border-green-100 dark:border-green-900/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('community.messages', 'Messages')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {/* Real-time Bently Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: t('community.totalDiscussions', 'Discussions'), val: communityStats.totalPosts, border: 'border-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-950/15', text: 'text-blue-600 dark:text-blue-400', icon: MessageCircle },
            { label: t('community.solutionsShared', 'Solutions'), val: communityStats.resolvedQuestions, border: 'border-green-500', bg: 'bg-green-50/50 dark:bg-green-950/15', text: 'text-green-600 dark:text-green-400', icon: ThumbsUp },
            { label: t('community.activeFarmers', 'Farmers'), val: communityStats.activeFarmers, border: 'border-purple-500', bg: 'bg-purple-50/50 dark:bg-purple-950/15', text: 'text-purple-600 dark:text-purple-400', icon: User },
            { label: t('community.activeAlerts', 'Alerts'), val: communityStats.totalAlerts, border: 'border-orange-500', bg: 'bg-orange-50/50 dark:bg-orange-950/15', text: 'text-orange-600 dark:text-orange-400', icon: AlertCircle }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className={`bg-white dark:bg-[#1f1d18] rounded-2xl p-4 shadow-sm border-l-4 ${card.border} border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] flex items-center justify-between`}>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{card.val.toLocaleString()}</p>
                  <p className="text-xs text-[#7a7364] dark:text-[#9b9482] font-semibold mt-0.5">{card.label}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.text}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Filter & Search */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Categories select card */}
          <div className="md:col-span-2 bg-white dark:bg-[#1f1d18] rounded-2xl p-4 border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-[#39542f] text-white shadow-sm scale-102'
                      : 'bg-[#f1efe9] dark:bg-[#181713] text-[#615b4f] dark:text-[#bfbaad] hover:bg-[#dbd8d0] dark:hover:bg-[#3a3630]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{i18n.language === 'hi' ? cat.labelHindi : cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Search bar */}
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl p-4 border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9482] w-4.5 h-4.5" />
              <input
                type="text"
                placeholder={t('community.searchPlaceholder', 'Search discussions...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-xs placeholder-[#9b9482] dark:placeholder-[#615b4f] focus:outline-none focus:border-[#39542f] focus:ring-1 focus:ring-[#39542f]/25 text-[#26241f] dark:text-[#eeece7]"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#39542f]"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] p-12 text-center shadow-sm max-w-xl mx-auto">
            <MessageCircle className="w-12 h-12 text-[#9b9482] mx-auto mb-4 opacity-55" />
            <h3 className="text-lg font-bold mb-1.5">No posts yet</h3>
            <p className="text-sm text-[#7a7364] dark:text-[#9b9482] mb-5">Be the first one to initiate a farming discussion!</p>
            <button
              onClick={() => setShowNewPostForm(true)}
              className="bg-[#39542f] hover:bg-[#2f4328] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {t('community.createPost', 'Create Post')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Discussions / Posts Column */}
            <div className="lg:col-span-2 space-y-4">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] p-5 shadow-sm hover:shadow-md hover:border-[#c7d9bf] dark:hover:border-[#39542f] transition-all">
                  {/* Post Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7ea26d] to-[#476a39] flex items-center justify-center text-white font-bold text-base shadow-sm">
                        {post.farmerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{post.farmerName}</p>
                        <p className="text-[10px] text-[#9b9482]">{formatTimeAgo(post.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        post.urgency === 'high' ? 'bg-[#fbf0ee] text-[#b94a3e] dark:bg-[rgba(185,74,62,0.15)] dark:text-[#e06b5e]' :
                        post.urgency === 'medium' ? 'bg-[#fdf9f2] text-[#dc8a14] dark:bg-[rgba(220,138,20,0.12)] dark:text-[#eca84c]' :
                        'bg-[#f3f7f1] text-[#476a39] dark:bg-[rgba(93,133,76,0.12)] dark:text-[#a3bf96]'
                      }`}>
                        {post.urgency === 'high' ? '🔴 High' : post.urgency === 'medium' ? '🟡 Medium' : '🟢 Low'}
                      </span>
                      {post.farmerId === currentUserId && (
                        <>
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 p-1.5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-[#b94a3e] hover:bg-[#fbf0ee] dark:hover:bg-[rgba(185,74,62,0.15)] p-1.5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <h3 className="text-base font-bold mb-1">{post.title}</h3>
                  <p className="text-xs text-[#615b4f] dark:text-[#bfbaad] leading-relaxed mb-3">{post.description}</p>

                  {/* Post Images */}
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3.5">
                      {post.imageUrls.slice(0, 2).map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="post upload"
                          className="w-full h-36 object-cover rounded-xl border border-[rgba(38,36,31,0.08)] cursor-zoom-in"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                  {/* Post Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="bg-[#f1efe9] dark:bg-[#181713] text-[#7a7364] dark:text-[#9b9482] px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 font-semibold">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="flex items-center gap-5 pt-3 border-t border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] text-xs text-[#7a7364] dark:text-[#9b9482]">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1.5 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-semibold">{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => handleOpenReplies(post)}
                      className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-semibold">{post.replies} {t('community.replies', 'Replies')}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{post.views}</span>
                    </div>
                    {post.solved ? (
                      <span className="ml-auto bg-[#f3f7f1] text-[#476a39] dark:bg-[rgba(93,133,76,0.12)] dark:text-[#a3bf96] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        ✓ {t('community.solved', 'Solved')}
                      </span>
                    ) : (
                      post.farmerId === currentUserId && (
                        <button
                          onClick={() => handleMarkAsSolved(post.id)}
                          className="ml-auto bg-[#f3f7f1] hover:bg-[#c7d9bf] text-[#476a39] px-3 py-1 rounded-lg text-[10px] font-bold transition-all"
                        >
                          {t('community.markSolved', 'Mark as Solved')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Columns (Cooperative Rentals & soil telemetry) */}
            <div className="space-y-4 lg:sticky lg:top-36">
              
              {/* Telemetry panel */}
              <div className="bg-gradient-to-br from-[#2f4328] to-[#141e12] text-white rounded-2xl shadow-md p-5 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-120 transition-all duration-700"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4.5 h-4.5 text-[#a3bf96] animate-pulse" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">{t('community.liveTelemetry', 'Live Telemetry')}</h3>
                  </div>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7ea26d] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7ea26d]"></span>
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <p className="text-[10px] text-[#c7d9bf] uppercase font-medium">{t('community.moisture', 'Moisture')}</p>
                    <p className="text-xl font-bold tracking-tight">{soilStats.moisture}%</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <p className="text-[10px] text-[#c7d9bf] uppercase font-medium">{t('community.temperature', 'Temperature')}</p>
                    <p className="text-xl font-bold tracking-tight">{soilStats.temperature}°C</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <p className="text-[10px] text-[#c7d9bf] uppercase font-medium">{t('community.soilPh', 'Soil pH')}</p>
                    <p className="text-xl font-bold tracking-tight">{soilStats.ph}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <p className="text-[10px] text-[#c7d9bf] uppercase font-medium">{t('community.npk', 'N-P-K')}</p>
                    <p className="text-sm font-bold tracking-tight pt-1">{soilStats.nitrogen}-{soilStats.phosphorus}-{soilStats.potassium}</p>
                  </div>
                </div>
                
                <div className="text-[9px] text-[#c7d9bf]/60 flex items-center gap-1.5 justify-end relative z-10">
                  <Cpu className="w-3 h-3" />
                  <span>{t('community.lastUpdated', 'Last updated')}: {soilStats.updatedAt.toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Machinery Swarm list */}
              <div className="bg-white dark:bg-[#1f1d18] rounded-2xl p-5 border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm">
                <h3 className="font-extrabold text-sm mb-3.5 flex items-center gap-2 tracking-tight">
                  <Users className="w-4.5 h-4.5 text-[#39542f] dark:text-[#a3bf96]" />
                  {t('community.swarmRentals', 'Cooperative Swarm Rentals')}
                </h3>
                <div className="space-y-3">
                  {equipment.map(eq => (
                    <div key={eq.id} className="border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] bg-[#f8f7f5] dark:bg-[#14130f] rounded-xl p-3 hover:border-[#c7d9bf] transition-all">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <p className="font-bold text-xs">{eq.name}</p>
                          <p className="text-[10px] text-[#9b9482]">{eq.model}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          eq.status === 'Active' ? 'bg-[#f3f7f1] text-[#476a39] dark:bg-[rgba(93,133,76,0.12)]' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/20'
                        }`}>
                          {eq.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mb-2.5 text-[#7a7364] dark:text-[#9b9482]">
                        <span className="flex items-center gap-1">
                          <Battery className="w-3.5 h-3.5 opacity-55" />
                          {eq.battery}%
                        </span>
                        <span className="font-bold text-[#39542f] dark:text-[#a3bf96]">₹{eq.rate}/hr</span>
                      </div>
                      <button
                        onClick={() => {
                          const msg = i18n.language === 'hi' ? 'बुकिंग सफलतापूर्वक स्वीकृत!' : 'Rental request dispatched successfully!';
                          toast.success(`🚜 ${eq.name}: ${msg}`);
                        }}
                        className="w-full py-2 bg-[#39542f] hover:bg-[#2f4328] text-white font-bold rounded-lg text-[10px] transition-colors"
                      >
                        ⚡ {t('community.requestBooking', 'Request Booking')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Broadcast channel */}
              <div className="bg-white dark:bg-[#1f1d18] rounded-2xl p-5 border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm">
                <h3 className="font-extrabold text-sm mb-1 flex items-center gap-2 tracking-tight">
                  <MessageSquare className="w-4.5 h-4.5 text-blue-600" />
                  {t('community.broadcastHub', 'Broadcast Hub')}
                </h3>
                <p className="text-[10px] text-[#9b9482] mb-3 leading-relaxed">Broadcast messages sync across tabs instantly in real-time.</p>
                
                <div className="border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] rounded-xl p-3 bg-[#f8f7f5] dark:bg-[#14130f] h-44 overflow-y-auto space-y-2 mb-3 text-[11px] scrollbar-thin">
                  {liveMessages.length === 0 && (
                    <p className="text-[#9b9482] text-center italic mt-16">No broadcasts yet</p>
                  )}
                  {liveMessages.map(msg => (
                    <div key={msg.id} className="bg-white dark:bg-[#1f1d18] p-2 rounded-lg shadow-sm border border-[rgba(38,36,31,0.04)]">
                      <div className="flex items-center justify-between gap-2 mb-0.5 font-bold text-[#3a3630] dark:text-[#bfbaad]">
                        <span>{msg.sender}</span>
                        <span className="text-[8px] text-[#9b9482] font-normal">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[#615b4f] dark:text-[#bfbaad] leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('broadcastInput') as HTMLInputElement;
                  if (input.value.trim()) {
                    sendBroadcastMessage(currentUserName, input.value);
                    input.value = '';
                  }
                }} className="flex gap-2">
                  <input
                    name="broadcastInput"
                    type="text"
                    placeholder={t('community.broadcastPlaceholder', 'Broadcast...')}
                    className="flex-1 px-3 py-2 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-xs placeholder-[#9b9482] dark:placeholder-[#615b4f] focus:outline-none focus:border-[#39542f] text-[#26241f] dark:text-[#eeece7]"
                  />
                  <button
                    type="submit"
                    className="bg-[#39542f] hover:bg-[#2f4328] text-white p-2 rounded-xl transition-colors shadow-sm flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)]">
            <div className="bg-[#39542f] text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">{t('community.createPost', 'Create Post')}</h2>
              <button onClick={() => setShowNewPostForm(false)} className="text-white hover:bg-white/10 p-1.5 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.postTitle', 'Title')}</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g., Assistance needed with potato crop"
                  className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.description', 'Description')}</label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  placeholder="Describe your issue or query..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.category', 'Category')}</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f]"
                  >
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.urgency', 'Urgency')}</label>
                  <select
                    value={newPost.urgency}
                    onChange={(e) => setNewPost({ ...newPost, urgency: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.tags', 'Tags')}</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="e.g. potato, disease, harvest"
                  className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none focus:border-[#39542f]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.addPhotos', 'Add Photos')}</label>
                <div className="border-2 border-dashed border-[rgba(38,36,31,0.15)] dark:border-[rgba(255,255,255,0.1)] rounded-xl p-4 text-center hover:border-[#39542f] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <ImageIcon className="w-10 h-10 mx-auto mb-1 text-[#9b9482]" />
                    <p className="text-xs text-[#7a7364] dark:text-[#9b9482]">Click to upload images</p>
                  </label>
                </div>
                {newPost.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3 animate-fade-in">
                    {newPost.images.map((file, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-16 object-cover" />
                        <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleCreatePost}
                disabled={loading}
                className="w-full py-3 bg-[#39542f] hover:bg-[#2f4328] text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4.5 h-4.5" />
                {loading ? 'Posting...' : t('community.createPost', 'Post to Community')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl shadow-2xl max-w-xl w-full border border-[rgba(38,36,31,0.08)]">
            <div className="bg-[#2f4328] text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">{t('community.editPost', 'Edit Post')}</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedPost(null); }} className="text-white hover:bg-white/10 p-1.5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.postTitle', 'Title')}</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.description', 'Description')}</label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none"
                />
              </div>
              <button
                onClick={handleUpdatePost}
                disabled={loading}
                className="w-full py-3 bg-[#2f4328] text-white font-bold rounded-xl text-sm transition-all"
              >
                {t('community.updatePost', 'Update Post')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies Modal */}
      {showRepliesModal && selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[rgba(38,36,31,0.08)] flex flex-col">
            <div className="bg-[#2f4328] text-white p-5 rounded-t-2xl flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold tracking-tight">💬 {selectedPost.replies} {t('community.replies', 'Replies')}</h2>
              <button onClick={() => { setShowRepliesModal(false); setSelectedPost(null); setReplies([]); }} className="text-white hover:bg-white/10 p-1.5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Post */}
            <div className="p-5 border-b border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] bg-[#f8f7f5] dark:bg-[#14130f] shrink-0">
              <h3 className="font-bold text-sm mb-1">{selectedPost.title}</h3>
              <p className="text-xs text-[#615b4f] dark:text-[#bfbaad] leading-relaxed">{selectedPost.description}</p>
            </div>

            {/* Replies List */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 max-h-80 min-h-48 scrollbar-thin">
              {replies.length === 0 ? (
                <div className="text-center py-12 text-[#9b9482] italic">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>{t('community.noReplies', 'No replies yet.')}</p>
                </div>
              ) : (
                replies.map((reply, idx) => (
                  <div key={idx} className="bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.04)] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-[#39542f] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {reply.farmerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{reply.farmerName}</p>
                        <p className="text-[9px] text-[#9b9482]">{formatTimeAgo(reply.timestamp)}</p>
                      </div>
                      {reply.isExpert && (
                        <span className="ml-auto bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300 text-[9px] px-2 py-0.5 rounded-full font-bold">
                          ✓ Expert
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#615b4f] dark:text-[#bfbaad] leading-relaxed">{reply.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] bg-white dark:bg-[#1f1d18] shrink-0 sticky bottom-0 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('community.writeReply', 'Write your reply...')}
                className="flex-1 px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-xs focus:outline-none focus:border-[#39542f]"
                onKeyPress={(e) => e.key === 'Enter' && handleAddReply()}
              />
              <button
                onClick={handleAddReply}
                className="bg-[#39542f] hover:bg-[#2f4328] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {t('community.reply', 'Reply')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl shadow-2xl max-w-xl w-full border border-[rgba(38,36,31,0.08)]">
            <div className="bg-[#39542f] text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                <Users className="w-5 h-5 text-[#a3bf96]" />
                {t('community.createGroup', 'Create Farmer Group')}
              </h2>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-white hover:bg-white/10 p-1.5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.groupName', 'Group Name')}</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Wheat Growers Association"
                  className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.description', 'Description')}</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Provide a description of the group's activities..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.category', 'Category')}</label>
                  <select
                    value={newGroup.category}
                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none"
                  >
                    <option value="crop-specific">Crop-specific</option>
                    <option value="location-based">Location-based</option>
                    <option value="equipment-sharing">Equipment sharing</option>
                    <option value="market-intelligence">Market intelligence</option>
                    <option value="disease-management">Disease management</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.privacy', 'Privacy')}</label>
                  <select
                    value={newGroup.privacy}
                    onChange={(e) => setNewGroup({ ...newGroup, privacy: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none"
                  >
                    <option value="public">Public - Anyone can join</option>
                    <option value="private">Private - Request required</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7a7364] dark:text-[#9b9482] mb-1.5 uppercase tracking-wider">{t('community.tags', 'Tags')}</label>
                <input
                  type="text"
                  value={newGroup.tags}
                  onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })}
                  placeholder="e.g. wheat, organic, haryana"
                  className="w-full px-4 py-2.5 bg-[#f8f7f5] dark:bg-[#14130f] border border-[rgba(38,36,31,0.08)] dark:border-[rgba(255,255,255,0.06)] rounded-xl text-sm focus:outline-none"
                />
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={loading}
                className="w-full py-3 bg-[#39542f] hover:bg-[#2f4328] text-white font-bold rounded-xl text-sm transition-all shadow-sm"
              >
                {t('community.createGroup', 'Create Group')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDashboard;
