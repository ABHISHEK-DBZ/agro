import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, User, Star, Crown, Medal, Trophy } from 'lucide-react';
import communityService, { FarmerProfile } from '../services/communityService';

const LeaderboardPage: React.FC = () => {
  const [topContributors, setTopContributors] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [timeFilter]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const contributors = await communityService.getTopContributors(50);
      setTopContributors(contributors);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Medal className="w-7 h-7 text-amber-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-amber-700';
    return 'bg-gradient-to-r from-green-400 to-green-600';
  };

  const getLevel = (points: number) => {
    if (points >= 1000) return { name: 'Master Farmer', icon: '🏆', color: 'text-purple-600' };
    if (points >= 500) return { name: 'Expert Farmer', icon: '⭐', color: 'text-blue-600' };
    if (points >= 250) return { name: 'Advanced Farmer', icon: '🌟', color: 'text-green-600' };
    if (points >= 100) return { name: 'Intermediate Farmer', icon: '💪', color: 'text-yellow-600' };
    return { name: 'Beginner Farmer', icon: '🌱', color: 'text-gray-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-600 text-white py-8 shadow-xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16" />
            </div>
            <h1 className="text-5xl font-bold mb-2">Leaderboard</h1>
            <p className="text-yellow-100 text-lg">
              Top Contributing Farmers • Rewarding Knowledge Sharing
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Time Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                timeFilter === 'week'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                timeFilter === 'month'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                timeFilter === 'all'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          </div>
        ) : topContributors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No contributors yet</p>
            <p className="text-gray-500">Start contributing to appear on the leaderboard!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topContributors.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center pt-12">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full ${getRankBadge(2)} flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-3`}>
                      {topContributors[1].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gray-400 rounded-full p-2 shadow-lg">
                      <Medal className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 text-center">{topContributors[1].name}</h3>
                  <p className="text-2xl font-bold text-gray-600">{topContributors[1].contributionPoints}</p>
                  <p className="text-sm text-gray-500">points</p>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-full ${getRankBadge(1)} flex items-center justify-center text-white text-4xl font-bold shadow-2xl mb-3 ring-4 ring-yellow-300`}>
                      {topContributors[0].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-3 shadow-xl animate-pulse">
                      <Crown className="w-8 h-8 text-yellow-900" />
                    </div>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-800 text-center">{topContributors[0].name}</h3>
                  <p className="text-3xl font-bold text-yellow-600">{topContributors[0].contributionPoints}</p>
                  <p className="text-sm text-gray-500">points</p>
                  <span className="mt-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                    👑 CHAMPION
                  </span>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center pt-12">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full ${getRankBadge(3)} flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-3`}>
                      {topContributors[2].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-amber-600 rounded-full p-2 shadow-lg">
                      <Medal className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 text-center">{topContributors[2].name}</h3>
                  <p className="text-2xl font-bold text-amber-700">{topContributors[2].contributionPoints}</p>
                  <p className="text-sm text-gray-500">points</p>
                </div>
              </div>
            )}

            {/* Rest of Rankings */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Full Rankings
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {topContributors.map((farmer, index) => {
                  const rank = index + 1;
                  const level = getLevel(farmer.contributionPoints);
                  const isTop3 = rank <= 3;

                  return (
                    <div
                      key={farmer.id}
                      className={`p-5 hover:bg-gray-50 transition-all ${
                        isTop3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        {/* Rank */}
                        <div className="flex-shrink-0 w-16 flex justify-center">
                          {getRankIcon(rank)}
                        </div>

                        {/* Avatar */}
                        <div className={`w-14 h-14 rounded-full ${getRankBadge(rank)} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                          {farmer.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-800">{farmer.name}</h3>
                            {farmer.isExpert && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Expert
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className={`font-semibold ${level.color} flex items-center gap-1`}>
                              {level.icon} {level.name}
                            </span>
                            <span>•</span>
                            <span>{farmer.reputation} reputation</span>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">
                            {farmer.contributionPoints.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">points</div>
                        </div>

                        {/* Badge */}
                        {isTop3 && (
                          <div className="flex-shrink-0">
                            {rank === 1 && <Trophy className="w-8 h-8 text-yellow-500" />}
                            {rank === 2 && <Medal className="w-7 h-7 text-gray-400" />}
                            {rank === 3 && <Medal className="w-7 h-7 text-amber-600" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Points Guide */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                How to Earn Points
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="font-bold text-gray-800">+10</div>
                  <div className="text-sm text-gray-600">Create Post</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-3xl mb-2">💬</div>
                  <div className="font-bold text-gray-800">+5</div>
                  <div className="text-sm text-gray-600">Add Reply</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="font-bold text-gray-800">+20</div>
                  <div className="text-sm text-gray-600">Helpful Reply</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="font-bold text-gray-800">+15</div>
                  <div className="text-sm text-gray-600">Upload Data</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
