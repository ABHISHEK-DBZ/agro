import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, ThumbsUp, Eye, Clock, User, Tag, Search, Send, X, Image as ImageIcon, MapPin, AlertCircle, Edit, Trash2, Users, Bell, BarChart3, Award, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import communityService, { CommunityPost, CommunityStats } from '../services/communityService';

const CommunityDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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

  // Load posts from Firebase
  useEffect(() => {
    loadPosts();
    loadStats();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await communityService.getPosts(selectedCategory);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Loading community stats...');
      const stats = await communityService.getStats();
      console.log('✅ Stats loaded:', stats);
      setCommunityStats(stats);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      // Keep showing zeros if error occurs
    }
  };

  // Handle new post submission
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    try {
      setLoading(true);
      await communityService.createPost({
        farmerId: 'current_user_id', // TODO: Get from auth
        farmerName: 'Current User', // TODO: Get from auth
        title: newPost.title,
        description: newPost.description,
        category: newPost.category,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
        urgency: newPost.urgency
      }, newPost.images); // Pass images

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

      // Reload posts
      await loadPosts();
      await loadStats();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
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
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setLoading(true);
      await communityService.deletePost(postId);
      await loadPosts();
      await loadStats();
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit post
  const handleEditPost = (post: CommunityPost) => {
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
      alert('Please fill in title and description');
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

      await loadPosts();
      alert('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
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
    if (!selectedPost || !replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      await communityService.addReply({
        postId: selectedPost.id,
        farmerId: 'current_user_id', // TODO: Get from auth
        farmerName: 'Current User', // TODO: Get from auth
        content: replyText,
        isExpert: false
      });

      setReplyText('');
      const updatedReplies = await communityService.getReplies(selectedPost.id);
      setReplies(updatedReplies);
      
      // Update post reply count
      await loadPosts();
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply.');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await communityService.toggleLike(postId, 'current_user_id');
      await loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleMarkAsSolved = async (postId: string) => {
    try {
      await communityService.markAsSolved(postId);
      await loadPosts();
      alert('Post marked as solved!');
    } catch (error) {
      console.error('Error marking as solved:', error);
    }
  };

  // Handle create group
  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.description.trim()) {
      alert('Please fill in group name and description');
      return;
    }

    try {
      setLoading(true);
      await communityService.createGroup({
        name: newGroup.name,
        description: newGroup.description,
        category: newGroup.category,
        privacy: newGroup.privacy,
        createdBy: 'current_user_id', // TODO: Get from auth
        createdByName: 'Current User', // TODO: Get from auth
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
      
      alert('Group created successfully! 🎉');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group.');
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
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* WhatsApp-Style Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <MessageCircle className="w-8 h-8" />
                Farmer Community
              </h1>
              <p className="text-green-100 mt-1">
                {communityStats.activeFarmers.toLocaleString()} Active Farmers • {communityStats.onlineExperts} Experts Online
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/notifications')}
                className="bg-white text-green-600 p-3 rounded-full hover:bg-green-50 transition-all shadow-lg relative"
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
              </button>
              <button
                onClick={() => navigate('/groups')}
                className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-all flex items-center gap-2 shadow-lg"
              >
                <Users className="w-5 h-5" />
                Groups
              </button>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                New Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={() => navigate('/polls')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all whitespace-nowrap"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">Polls</span>
            </button>
            <button
              onClick={() => navigate('/map')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all whitespace-nowrap"
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Map View</span>
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span className="font-medium">Leaderboard</span>
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-all whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Messages</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{communityStats.totalPosts.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Discussions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{communityStats.resolvedQuestions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Solutions Shared</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{communityStats.activeFarmers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Active Farmers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{communityStats.totalAlerts}</p>
                <p className="text-sm text-gray-600">Active Alerts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters - WhatsApp Style */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium">{i18n.language === 'hi' ? cat.labelHindi : cat.label}</span>
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
              placeholder="Search discussions, problems, solutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Posts List - WhatsApp Style */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No posts yet in this category</p>
            <p className="text-gray-500">Be the first to start a discussion!</p>
            <button
              onClick={() => setShowNewPostForm(true)}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* User Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                        {post.farmerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{post.farmerName}</p>
                        <p className="text-sm text-gray-500">{formatTimeAgo(post.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Urgency Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.urgency === 'high' ? 'bg-red-100 text-red-700' :
                        post.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {post.urgency === 'high' ? '🔴 Urgent' :
                         post.urgency === 'medium' ? '🟡 Medium' :
                         '🟢 Low'}
                      </span>
                      
                      {/* Edit & Delete Buttons */}
                      <button
                        onClick={() => handleEditPost(post)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.description}</p>

                  {/* Images */}
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.imageUrls.slice(0, 4).map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Post image ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                      {post.imageUrls.length > 4 && (
                        <div className="relative">
                          <img
                            src={post.imageUrls[4]}
                            alt="More images"
                            className="w-full h-48 object-cover rounded-lg opacity-50"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <span className="text-white text-2xl font-bold">+{post.imageUrls.length - 4}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-medium">{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => handleOpenReplies(post)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{post.replies} Replies</span>
                    </button>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Eye className="w-5 h-5" />
                      <span>{post.views} Views</span>
                    </div>
                    {!post.solved && (
                      <button
                        onClick={() => handleMarkAsSolved(post.id)}
                        className="ml-auto bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-200 transition-colors"
                      >
                        ✓ Mark as Solved
                      </button>
                    )}
                    {post.solved && (
                      <span className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Solved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Post Modal - WhatsApp Style */}
      {showNewPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-green-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create New Post</h2>
              <button
                onClick={() => setShowNewPostForm(false)}
                className="text-white hover:bg-green-700 p-2 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g., Need help with wheat crop disease"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  placeholder="Describe your problem or question in detail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="e.g., wheat, disease, fungus"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Urgency Level
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewPost({ ...newPost, urgency: 'low' })}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      newPost.urgency === 'low'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🟢 Low
                  </button>
                  <button
                    onClick={() => setNewPost({ ...newPost, urgency: 'medium' })}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      newPost.urgency === 'medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🟡 Medium
                  </button>
                  <button
                    onClick={() => setNewPost({ ...newPost, urgency: 'high' })}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      newPost.urgency === 'high'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔴 High
                  </button>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📷 Add Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
                  </label>
                </div>

                {/* Image Previews */}
                {newPost.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {newPost.images.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCreatePost}
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Posting...' : 'Post to Community'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">Edit Post</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedPost(null); }} className="text-white hover:bg-blue-700 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleUpdatePost}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies Modal */}
      {showRepliesModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold">💬 {selectedPost.replies} Replies</h2>
              <button onClick={() => { setShowRepliesModal(false); setSelectedPost(null); setReplies([]); }} className="text-white hover:bg-blue-700 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Original Post */}
            <div className="p-6 border-b bg-gray-50">
              <h3 className="font-bold text-lg mb-2">{selectedPost.title}</h3>
              <p className="text-gray-700">{selectedPost.description}</p>
            </div>

            {/* Replies List */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {replies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No replies yet. Be the first to reply!</p>
                </div>
              ) : (
                replies.map((reply, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                        {reply.farmerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{reply.farmerName}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(reply.timestamp)}</p>
                      </div>
                      {reply.isExpert && (
                        <span className="ml-auto bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-semibold">
                          ✓ Expert
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{reply.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="p-6 border-t bg-white sticky bottom-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddReply()}
                />
                <button
                  onClick={handleAddReply}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-7 h-7" />
                Create Farmer Group
              </h2>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-white hover:bg-purple-700 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Wheat Farmers Pune"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Describe what this group is about..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select 
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="crop-specific">Crop-specific</option>
                  <option value="location-based">Location-based</option>
                  <option value="equipment-sharing">Equipment Sharing</option>
                  <option value="market-intelligence">Market Intelligence</option>
                  <option value="disease-management">Disease Management</option>
                  <option value="general">General Farming</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newGroup.tags}
                  onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })}
                  placeholder="e.g., wheat, organic, Maharashtra"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Privacy</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="privacy" 
                      checked={newGroup.privacy === 'public'}
                      onChange={() => setNewGroup({ ...newGroup, privacy: 'public' })}
                      className="text-purple-600" 
                    />
                    <span>Public - Anyone can join</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="privacy"
                      checked={newGroup.privacy === 'private'}
                      onChange={() => setNewGroup({ ...newGroup, privacy: 'private' })}
                      className="text-purple-600" 
                    />
                    <span>Private - Admin approval required</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Users className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Group'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                Groups help farmers with similar interests connect and share knowledge
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDashboard;
