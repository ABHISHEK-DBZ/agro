import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, ThumbsUp, Eye, Clock, User, Tag, Search, Filter, Wifi, Activity, Bell, Users, Zap, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import realTimeDataService from '../services/realTimeDataService';

interface Post {
  id: string;
  title: string;
  titleHindi: string;
  content: string;
  author: string;
  authorLocation: string;
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  createdAt: string;
  isExpert: boolean;
  solved: boolean;
  isLive?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface CommunityStats {
  totalPosts: number;
  activeFarmers: number;
  resolvedQuestions: number;
  onlineExperts: number;
}

const CommunityDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [realTimeConnected, setRealTimeConnected] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    totalPosts: 0,
    activeFarmers: 0,
    resolvedQuestions: 0,
    onlineExperts: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const categories = [
    { value: 'all', label: 'All Categories', labelHindi: 'सभी श्रेणियां' },
    { value: 'crops', label: 'Crops', labelHindi: 'फसलें' },
    { value: 'diseases', label: 'Plant Diseases', labelHindi: 'पौधों के रोग' },
    { value: 'weather', label: 'Weather', labelHindi: 'मौसम' },
    { value: 'market', label: 'Market Prices', labelHindi: 'बाजार भाव' },
    { value: 'equipment', label: 'Equipment', labelHindi: 'उपकरण' },
    { value: 'schemes', label: 'Government Schemes', labelHindi: 'सरकारी योजनाएं' }
  ];

  // Initialize with sample posts
  useEffect(() => {
    const samplePosts: Post[] = [
      {
        id: '1',
        title: 'Best fertilizer for wheat crop in winter?',
        titleHindi: 'सर्दियों में गेहूं की फसल के लिए सबसे अच्छा उर्वरक कौन सा है?',
        content: 'I am planning to sow wheat this season. What fertilizer combination works best for good yield?',
        author: 'राम कुमार',
        authorLocation: 'Punjab',
        category: 'crops',
        tags: ['wheat', 'fertilizer', 'winter'],
        likes: 24,
        replies: 8,
        views: 156,
        createdAt: '2 hours ago',
        isExpert: false,
        solved: false,
        isLive: true,
        priority: 'medium'
      },
      {
        id: '2',
        title: 'Tomato plants showing yellow leaves',
        titleHindi: 'टमाटर के पौधों में पीले पत्ते दिख रहे हैं',
        content: 'My tomato plants have started showing yellow leaves. Is this a disease or nutrient deficiency?',
        author: 'प्रिया शर्मा',
        authorLocation: 'Maharashtra',
        category: 'diseases',
        tags: ['tomato', 'yellow-leaves', 'disease'],
        likes: 18,
        replies: 12,
        views: 203,
        createdAt: '4 hours ago',
        isExpert: true,
        solved: true,
        isLive: false,
        priority: 'high'
      },
      {
        id: '3',
        title: 'Live: Heavy rainfall alert for North India',
        titleHindi: 'लाइव: उत्तर भारत के लिए भारी बारिश की चेतावनी',
        content: 'Meteorological department has issued heavy rainfall warning. Farmers should take precautionary measures.',
        author: 'Weather Expert',
        authorLocation: 'Delhi',
        category: 'weather',
        tags: ['rainfall', 'alert', 'north-india'],
        likes: 45,
        replies: 23,
        views: 892,
        createdAt: '30 minutes ago',
        isExpert: true,
        solved: false,
        isLive: true,
        priority: 'urgent'
      },
      {
        id: '4',
        title: 'PM-KISAN scheme application help needed',
        titleHindi: 'पीएम-किसान योजना आवेदन में सहायता चाहिए',
        content: 'I need help with PM-KISAN scheme application. Documents required and process?',
        author: 'सुरेश यादव',
        authorLocation: 'Uttar Pradesh',
        category: 'schemes',
        tags: ['pm-kisan', 'application', 'documents'],
        likes: 32,
        replies: 15,
        views: 445,
        createdAt: '1 day ago',
        isExpert: false,
        solved: true,
        isLive: false,
        priority: 'low'
      }
    ];
    
    setPosts(samplePosts);
    setCommunityStats({
      totalPosts: samplePosts.length,
      activeFarmers: 1247,
      resolvedQuestions: 856,
      onlineExperts: 23
    });
  }, []);

  // Real-time community updates
  const toggleLiveMode = async () => {
    if (!isLiveMode) {
      try {
        console.log('Starting community live mode...');
        
        // Simulate real-time updates
        const interval = setInterval(() => {
          // Update stats randomly
          setCommunityStats(prev => ({
            ...prev,
            activeFarmers: prev.activeFarmers + Math.floor(Math.random() * 5),
            onlineExperts: 20 + Math.floor(Math.random() * 10)
          }));
          
          // Add new live posts occasionally
          if (Math.random() > 0.7) {
            const newPost: Post = {
              id: Date.now().toString(),
              title: 'Live: New farming question',
              titleHindi: 'लाइव: नया खेती संबंधी प्रश्न',
              content: 'A farmer needs immediate help with crop management.',
              author: 'Live Farmer',
              authorLocation: 'Various',
              category: 'crops',
              tags: ['live', 'help'],
              likes: 0,
              replies: 0,
              views: 1,
              createdAt: 'Just now',
              isExpert: false,
              solved: false,
              isLive: true,
              priority: 'medium'
            };
            
            setPosts(prev => [newPost, ...prev]);
          }
          
          setLastUpdated(new Date());
        }, 10000); // 10 seconds
        
        (window as any).communityInterval = interval;
        setIsLiveMode(true);
        setRealTimeConnected(true);
        
      } catch (error) {
        console.error('Error starting community live mode:', error);
      }
    } else {
      console.log('Stopping community live mode...');
      
      if ((window as any).communityInterval) {
        clearInterval((window as any).communityInterval);
        delete (window as any).communityInterval;
      }
      
      setIsLiveMode(false);
      setRealTimeConnected(false);
    }
  };

  // Simulate real-time post interactions
  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleReply = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies: post.replies + 1 }
        : post
    ));
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.titleHindi.includes(searchTerm) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farmer Community</h1>
              <p className="text-gray-600 mt-2">किसान समुदाय - Connect, share, and learn together</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Real-time Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isLiveMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {isLiveMode ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>Live Mode</span>
                    {realTimeConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></div>}
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 opacity-50" />
                    <span>Static Mode</span>
                  </>
                )}
              </div>
              
              {/* Live Mode Toggle */}
              <button
                onClick={toggleLiveMode}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiveMode 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                title={isLiveMode ? 'Click to stop live updates' : 'Click to start live updates'}
              >
                <Activity size={16} className={isLiveMode ? 'animate-pulse' : ''} />
                <span>{isLiveMode ? 'Stop Live' : 'Go Live'}</span>
              </button>
              
              <button
                onClick={() => setShowNewPostForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                New Post
              </button>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">12,450</h3>
                <p className="text-sm text-gray-600">Active Farmers</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">8,923</h3>
                <p className="text-sm text-gray-600">Discussions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ThumbsUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">45,789</h3>
                <p className="text-sm text-gray-600">Solutions Shared</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">234K</h3>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Posts / पोस्ट खोजें
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search discussions, problems, solutions..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category / श्रेणी
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label} / {category.labelHindi}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                    {post.solved && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Solved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{post.titleHindi}</p>
                  <p className="text-gray-700 mb-3">{post.content}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span className={post.isExpert ? 'text-blue-600 font-medium' : ''}>
                        {post.author} {post.isExpert && '(Expert)'}
                      </span>
                      <span>• {post.authorLocation}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    categories.find(c => c.value === post.category)?.value === 'crops' ? 'bg-green-100 text-green-800' :
                    categories.find(c => c.value === post.category)?.value === 'diseases' ? 'bg-red-100 text-red-800' :
                    categories.find(c => c.value === post.category)?.value === 'schemes' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {categories.find(c => c.value === post.category)?.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {post.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {post.likes} Likes
                  </button>
                  <button 
                    onClick={() => handleReply(post.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.replies} Replies
                  </button>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    {post.views} Views
                  </div>
                </div>
                
                <button 
                  onClick={() => handleReply(post.id)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Join Discussion
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Expert Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expert Tips / विशेषज्ञ सुझाव</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Seasonal Farming</h3>
              <p className="text-sm text-green-700">
                Plan your crops according to seasonal weather patterns for better yield.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Water Management</h3>
              <p className="text-sm text-blue-700">
                Use efficient irrigation methods to conserve water and reduce costs.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Market Intelligence</h3>
              <p className="text-sm text-purple-700">
                Track market prices regularly to sell your produce at the right time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;