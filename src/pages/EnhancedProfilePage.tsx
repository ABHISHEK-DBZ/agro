import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Award,
  TrendingUp,
  MapPin,
  Calendar,
  MessageSquare,
  Heart,
  Share2,
  Trophy,
  Target,
  Zap,
  Star,
  CheckCircle,
  Edit,
  ArrowLeft
} from 'lucide-react';
import communityService from '../services/communityService';
import type { UserAchievement, Achievement } from '../services/communityService';

const EnhancedProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'achievements' | 'stats'>('posts');
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user data
  const user = {
    id: userId || '1',
    name: 'Rajesh Kumar',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    location: 'Meerut, Uttar Pradesh',
    joinDate: new Date('2024-01-15'),
    bio: '🌾 Wheat farmer with 15 years experience. Love helping fellow farmers solve crop problems! Organic farming enthusiast.',
    stats: {
      reputation: 2450,
      posts: 127,
      replies: 489,
      helpfulVotes: 234,
      followers: 89,
      following: 145,
      level: 'Expert Farmer',
      contributionPoints: 3650,
    },
    expertise: ['Wheat', 'Rice', 'Organic Farming', 'Pest Control'],
    recentActivity: [
      { id: 1, type: 'post', content: 'How to control wheat rust disease naturally?', date: '2 hours ago', votes: 15 },
      { id: 2, type: 'reply', content: 'Try neem oil spray twice a week', date: '5 hours ago', votes: 8 },
      { id: 3, type: 'post', content: 'Best fertilizer for wheat in sandy soil', date: '1 day ago', votes: 23 },
    ]
  };

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const [achievements, allAch] = await Promise.all([
        communityService.getUserAchievements(userId || ''),
        communityService.getAllAchievements()
      ]);
      setUserAchievements(achievements);
      setAllAchievements(allAch);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (icon: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      trophy: <Trophy className="w-6 h-6" />,
      target: <Target className="w-6 h-6" />,
      zap: <Zap className="w-6 h-6" />,
      star: <Star className="w-6 h-6" />,
      heart: <Heart className="w-6 h-6" />
    };
    return icons[icon] || <Award className="w-6 h-6" />;
  };

  const getLevelColor = (level: string) => {
    if (level.includes('Expert') || level.includes('Master')) return 'text-purple-600';
    if (level.includes('Advanced')) return 'text-blue-600';
    return 'text-green-600';
  };

  const getLevelBadgeColor = (level: string) => {
    if (level.includes('Expert') || level.includes('Master')) return 'bg-purple-100 text-purple-800';
    if (level.includes('Advanced')) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-2 shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{user.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getLevelBadgeColor(user.stats.level)}`}>
                  {user.stats.level}
                </span>
              </div>

              <p className="text-purple-100 mb-3">{user.bio}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {user.joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  {user.stats.reputation} Reputation
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {user.expertise.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all flex items-center gap-2 shadow-lg">
                <MessageSquare className="w-5 h-5" />
                Message
              </button>
              <button className="bg-purple-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-800 transition-all flex items-center gap-2 shadow-lg">
                <User className="w-5 h-5" />
                Follow
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-800">{user.stats.posts}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Share2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-800">{user.stats.replies}</div>
            <div className="text-sm text-gray-600">Replies</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-800">{user.stats.helpfulVotes}</div>
            <div className="text-sm text-gray-600">Helpful Votes</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-800">{user.stats.contributionPoints}</div>
            <div className="text-sm text-gray-600">Points</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-t-xl shadow-lg border-b">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'posts'
                  ? 'text-purple-600 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Posts ({user.stats.posts})
            </button>
            <button
              onClick={() => setActiveTab('replies')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'replies'
                  ? 'text-purple-600 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Replies ({user.stats.replies})
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'achievements'
                  ? 'text-purple-600 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Achievements ({userAchievements.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'text-purple-600 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Stats
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-lg p-6 mb-8">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Posts</h2>
              {user.recentActivity
                .filter((a) => a.type === 'post')
                .map((activity) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{activity.content}</h3>
                      <span className="text-sm text-gray-500">{activity.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {activity.votes} votes
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        12 replies
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Replies Tab */}
          {activeTab === 'replies' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Replies</h2>
              {user.recentActivity
                .filter((a) => a.type === 'reply')
                .map((activity) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-gray-800 mb-2">{activity.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{activity.date}</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {activity.votes} helpful
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allAchievements.map((achievement) => {
                  const userAch = userAchievements.find((ua) => ua.achievementId === achievement.id);
                  const isEarned = !!userAch;

                  return (
                    <div
                      key={achievement.id}
                      className={`border-2 rounded-xl p-6 transition-all ${
                        isEarned
                          ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                        isEarned ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-600 font-semibold">+{achievement.points || 100} points</span>
                        {isEarned && (
                          <span className="text-xs text-green-600 font-semibold">
                            Earned {new Date(userAch.earnedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Impact</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Posts</span>
                      <span className="font-bold text-gray-800">{user.stats.posts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Replies</span>
                      <span className="font-bold text-gray-800">{user.stats.replies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Helpful Votes Received</span>
                      <span className="font-bold text-green-600">{user.stats.helpfulVotes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reputation Score</span>
                      <span className="font-bold text-purple-600">{user.stats.reputation}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Network</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Followers</span>
                      <span className="font-bold text-gray-800">{user.stats.followers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Following</span>
                      <span className="font-bold text-gray-800">{user.stats.following}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contribution Points</span>
                      <span className="font-bold text-blue-600">{user.stats.contributionPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className={`font-bold ${getLevelColor(user.stats.level)}`}>{user.stats.level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfilePage;
