// Community Dashboard - v2.1 - Fixed all errors
import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next'; // Commented out for now
import { 
  Users, MessageCircle, AlertTriangle, Calendar, MapPin, 
  Plus, Search, TrendingUp, Heart, Share2,
  Camera, Clock, Star, Award, Leaf, Bug, CheckCircle
} from 'lucide-react';
import communityService, { CommunityPost, PestAlert, FarmerProfile } from '../services/communityService';

const CommunityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'alerts' | 'farmers'>('posts');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [alerts, setAlerts] = useState<PestAlert[]>([]);
  const [farmers] = useState<FarmerProfile[]>([]); // setFarmers functionality to be implemented later
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFarmerId] = useState('1'); // In real app, get from auth context

  // Create post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    images: [] as File[],
    type: 'general' as 'general' | 'question' | 'success' | 'alert'
  });

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    setIsLoading(true);
    try {
      const [communityPosts, nearbyAlerts] = await Promise.all([
        communityService.getPosts({}),
        communityService.getPestAlerts(28.6139, 77.2090, 5)
      ]);
      
      setPosts(communityPosts);
      setAlerts(nearbyAlerts);
      // setFarmers(nearbyFarmers); // Farmers functionality to be implemented later
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) return;

    try {
      // Convert images to base64 URLs (in real app, upload to cloud storage)
      const imageUrls = await Promise.all(
        newPost.images.map(async (file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const postData = {
        farmerId: currentFarmerId,
        farmerName: "Anonymous Farmer", // To be replaced with actual farmer name
        title: newPost.title,
        hindiTitle: newPost.title, // To be translated
        description: newPost.content,
        hindiDescription: newPost.content, // To be translated  
        category: 'question' as const,
        images: imageUrls,
        location: { 
          latitude: 28.6139, 
          longitude: 77.2090,
          address: "Delhi, India" // To be replaced with actual location
        },
        tags: newPost.tags,
        urgency: 'medium' as const
      };

      await communityService.createPost(postData);
      await loadCommunityData();
      
      // Reset form
      setNewPost({
        title: '',
        content: '',
        tags: [],
        images: [],
        type: 'general'
      });
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await communityService.likePost(postId);
      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'success': return <Award className="w-5 h-5 text-green-500" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Leaf className="w-5 h-5 text-green-600" />;
    }
  };

  const getAlertSeverity = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="text-green-600 mr-3 h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Farmer Community
                </h1>
                <p className="text-gray-600">किसान समुदाय - Connect, Share, Learn</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Community Posts</p>
                  <p className="text-2xl font-bold text-blue-800">{posts.length}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-800">{alerts.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Nearby Farmers</p>
                  <p className="text-2xl font-bold text-green-800">{farmers.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Engagement</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {posts.reduce((sum, post) => sum + post.likes + post.comments.length, 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts, farmers, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'posts' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Posts
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'alerts' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Alerts
              </button>
              <button
                onClick={() => setActiveTab('farmers')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'farmers' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Farmers
              </button>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Create Community Post</h2>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Type / पोस्ट का प्रकार
                    </label>
                    <select
                      value={newPost.type}
                      onChange={(e) => setNewPost({...newPost, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="general">General (सामान्य)</option>
                      <option value="question">Question (प्रश्न)</option>
                      <option value="success">Success Story (सफलता की कहानी)</option>
                      <option value="alert">Alert (चेतावनी)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title / शीर्षक
                    </label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      placeholder="Enter post title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content / सामग्री
                    </label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      rows={4}
                      placeholder="Share your experience, ask questions, or provide solutions..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Photos / फोटो जोड़ें
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            setNewPost({...newPost, images: Array.from(files).slice(0, 5)});
                          }
                        }}
                        className="hidden"
                        id="postImages"
                      />
                      <label htmlFor="postImages" className="cursor-pointer">
                        <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-600">Click to upload photos</p>
                      </label>
                    </div>
                    
                    {newPost.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {newPost.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setNewPost({
                                ...newPost,
                                images: newPost.images.filter((_, i) => i !== index)
                              })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowCreatePost(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePost}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Create Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading posts...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts found</h3>
                    <p className="text-gray-600 mb-4">Be the first to share with the community</p>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Create First Post
                    </button>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          {getPostTypeIcon(post.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>By Farmer {post.farmerId}</span>
                                <span>•</span>
                                <span>{post.timestamp.toLocaleDateString()}</span>
                                {post.location && (
                                  <>
                                    <span>•</span>
                                    <MapPin className="w-4 h-4" />
                                    <span>Nearby</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">{post.description}</p>

                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {post.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                              {post.images.slice(0, 4).map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Post image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleLikePost(post.id)}
                                className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                              >
                                <Heart className="w-5 h-5" />
                                <span>{post.likes}</span>
                              </button>
                              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                                <span>{post.comments.length}</span>
                              </button>
                              <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors">
                                <Share2 className="w-5 h-5" />
                                Share
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {new Date(post.timestamp).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <AlertTriangle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No active alerts</h3>
                    <p className="text-gray-600">Your area is currently safe from reported pest attacks</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Bug className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">{alert.pestName} Attack</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getAlertSeverity(alert.severity)}`}>
                              {alert.severity} severity
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-4">{alert.description}</p>
                          
                          <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <h4 className="font-semibold text-blue-800 mb-2">Recommended Solutions:</h4>
                            <ul className="list-disc list-inside text-blue-700 space-y-1">
                              {alert.treatment.map((solution: string, index: number) => (
                                <li key={index}>{solution}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{alert.location.radius} km radius</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{alert.alertTime.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>Reported by Farmer {alert.farmerId}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'farmers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farmers.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No farmers found</h3>
                    <p className="text-gray-600">Expand your search radius to find more farmers</p>
                  </div>
                ) : (
                  farmers.map((farmer) => (
                    <div key={farmer.id} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{farmer.name}</h3>
                          <p className="text-gray-600">{farmer.location.village}, {farmer.location.district}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Leaf className="w-4 h-4 text-green-500" />
                          <span>Land: {farmer.farmSize} acres</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Experience: {farmer.experience} years</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>Nearby farmer</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">Crops:</h4>
                        <div className="flex flex-wrap gap-2">
                          {farmer.crops.slice(0, 3).map((crop, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                            >
                              {crop}
                            </span>
                          ))}
                          {farmer.crops.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                              +{farmer.crops.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-yellow-600">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{farmer.reputation.toFixed(1)} reputation</span>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                          Connect
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">5 new posts today</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">2 pest alerts in your area</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">3 farmers joined nearby</span>
                </div>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                {['rice', 'wheat', 'pest-control', 'irrigation', 'fertilizer', 'harvest', 'weather', 'seeds'].map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-green-100 hover:text-green-700 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Guidelines</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Share helpful farming tips and experiences</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Report pest attacks promptly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Be respectful and supportive</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use clear photos for better help</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;