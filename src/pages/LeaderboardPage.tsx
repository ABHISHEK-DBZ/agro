import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Star, Crown, Medal, Trophy, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import communityService, { FarmerProfile } from '../services/communityService';

const LeaderboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [topContributors, setTopContributors] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');

  // Real-time synchronization
  useEffect(() => {
    setLoading(true);
    const unsubscribe = communityService.subscribeToTopContributors(50, (contributors) => {
      setTopContributors(contributors);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500 animate-bounce" />;
      case 2:
        return <Medal className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Medal className="w-7 h-7 text-amber-600" />;
      default:
        return <span className="text-base font-bold text-[#9b9482] dark:text-[#615b4f]">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 ring-4 ring-yellow-300 dark:ring-yellow-800/35';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 ring-2 ring-gray-200 dark:ring-gray-800/20';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 ring-2 ring-amber-400 dark:ring-amber-900/25';
    return 'bg-gradient-to-r from-[#7ea26d] to-[#476a39]';
  };

  const getLevel = (points: number) => {
    if (points >= 1000) return { name: t('community.levelMaster', 'Master Farmer'), icon: '🏆', color: 'text-purple-600 dark:text-purple-400' };
    if (points >= 500) return { name: t('community.levelExpert', 'Expert Farmer'), icon: '⭐', color: 'text-blue-600 dark:text-blue-400' };
    if (points >= 250) return { name: t('community.levelAdvanced', 'Advanced Farmer'), icon: '🌟', color: 'text-green-600 dark:text-green-400' };
    if (points >= 100) return { name: t('community.levelIntermediate', 'Intermediate Farmer'), icon: '💪', color: 'text-yellow-600 dark:text-yellow-400' };
    return { name: t('community.levelBeginner', 'Beginner Farmer'), icon: '🌱', color: 'text-gray-600 dark:text-gray-400' };
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#14130f] text-[#26241f] dark:text-[#eeece7] pb-12 transition-colors duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2f4328] to-[#39542f] text-white py-10 px-6 shadow-md border-b border-[#2f4328]/10 relative">
        <button
          onClick={() => navigate('/community')}
          className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white p-2.5 rounded-xl border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="max-w-6xl mx-auto px-4 text-center mt-4">
          <div className="flex justify-center mb-3">
            <Trophy className="w-12 h-12 text-[#a3bf96]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('community.leaderboard', 'Leaderboard')}</h1>
          <p className="text-[#c7d9bf]/80 mt-1.5 text-sm sm:text-base font-medium">
            {t('community.leaderboardSub', 'Top Contributing Farmers • Rewarding Knowledge Sharing')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {/* Time Filter Tabs */}
        <div className="bg-white dark:bg-[#1f1d18] rounded-2xl p-2.5 border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm mb-8 flex justify-center gap-1.5 max-w-md mx-auto">
          <button
            onClick={() => setTimeFilter('week')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              timeFilter === 'week'
                ? 'bg-[#39542f] text-white shadow-xs'
                : 'text-[#615b4f] dark:text-[#bfbaad] hover:bg-[#f1efe9] dark:hover:bg-[#181713]'
            }`}
          >
            {t('words.week', 'This Week')}
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              timeFilter === 'month'
                ? 'bg-[#39542f] text-white shadow-xs'
                : 'text-[#615b4f] dark:text-[#bfbaad] hover:bg-[#f1efe9] dark:hover:bg-[#181713]'
            }`}
          >
            {t('words.month', 'This Month')}
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              timeFilter === 'all'
                ? 'bg-[#39542f] text-white shadow-xs'
                : 'text-[#615b4f] dark:text-[#bfbaad] hover:bg-[#f1efe9] dark:hover:bg-[#181713]'
            }`}
          >
            {t('words.year', 'All Time')}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#39542f]"></div>
          </div>
        ) : topContributors.length === 0 ? (
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] p-16 text-center shadow-sm max-w-xl mx-auto">
            <Award className="w-14 h-14 text-[#9b9482] mx-auto mb-4 opacity-55" />
            <h3 className="text-xl font-bold mb-1.5">{t('community.noContributorsYet', 'No contributors yet')}</h3>
            <p className="text-sm text-[#7a7364] dark:text-[#9b9482] mb-6">
              {t('community.startContributingSub', 'Start contributing to appear on the leaderboard!')}
            </p>
          </div>
        ) : (
          <>
            {/* Gamified Rankings Podium */}
            {topContributors.length >= 3 && (
              <div className="flex flex-col sm:flex-row justify-center items-end gap-6 sm:gap-4 mb-10 max-w-3xl mx-auto px-4">
                {/* 2nd Place Podium */}
                <div className="flex flex-col items-center order-2 sm:order-1 w-full sm:w-1/3">
                  <div className="relative mb-3">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${getRankBadge(2)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                      {topContributors[1].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 bg-gray-400 rounded-full p-1.5 shadow-md border border-white dark:border-[#1f1d18]">
                      <Medal className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#1f1d18] border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] rounded-2xl p-4 w-full shadow-sm text-center">
                    <h3 className="font-bold text-sm line-clamp-1">{topContributors[1].name}</h3>
                    <p className="text-lg font-bold text-[#615b4f] dark:text-[#bfbaad] mt-0.5">{topContributors[1].contributionPoints.toLocaleString()}</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#9b9482]">{t('community.points', 'points')}</p>
                  </div>
                </div>

                {/* 1st Place Podium (Center, Tallest) */}
                <div className="flex flex-col items-center order-1 sm:order-2 w-full sm:w-1/3">
                  <div className="relative mb-3">
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full ${getRankBadge(1)} flex items-center justify-center text-white text-3xl font-bold shadow-xl`}>
                      {topContributors[0].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -top-2.5 -right-2.5 bg-yellow-400 rounded-full p-2 shadow-md border border-white dark:border-[#1f1d18] animate-pulse">
                      <Crown className="w-5 h-5 text-yellow-900" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#1f1d18] border border-[#c7d9bf] dark:border-[#39542f]/45 rounded-2xl p-5 w-full shadow-md text-center ring-2 ring-yellow-400/20">
                    <h3 className="font-extrabold text-base line-clamp-1">{topContributors[0].name}</h3>
                    <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400 mt-0.5">{topContributors[0].contributionPoints.toLocaleString()}</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-yellow-500">{t('community.points', 'points')}</p>
                    <span className="mt-2.5 inline-block bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      👑 {t('community.champion', 'CHAMPION')}
                    </span>
                  </div>
                </div>

                {/* 3rd Place Podium */}
                <div className="flex flex-col items-center order-3 sm:order-3 w-full sm:w-1/3">
                  <div className="relative mb-3">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${getRankBadge(3)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                      {topContributors[2].name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-600 rounded-full p-1.5 shadow-md border border-white dark:border-[#1f1d18]">
                      <Medal className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#1f1d18] border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] rounded-2xl p-4 w-full shadow-sm text-center">
                    <h3 className="font-bold text-sm line-clamp-1">{topContributors[2].name}</h3>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-500 mt-0.5">{topContributors[2].contributionPoints.toLocaleString()}</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#9b9482]">{t('community.points', 'points')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of Rankings Table */}
            <div className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-sm overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] bg-[#f8f7f5] dark:bg-[#181713] flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#39542f]" />
                  {t('community.rankings', 'Full Rankings')}
                </h2>
              </div>

              <div className="divide-y divide-[rgba(38,36,31,0.05)] dark:divide-[rgba(255,255,255,0.05)]">
                {topContributors.map((farmer, index) => {
                  const rank = index + 1;
                  const level = getLevel(farmer.contributionPoints);
                  const isTop3 = rank <= 3;

                  return (
                    <div
                      key={farmer.id}
                      className={`p-5 flex items-center justify-between gap-4 transition-all hover:bg-[#f8f7f5] dark:hover:bg-[#181713] ${
                        isTop3 ? 'bg-yellow-400/[0.02] dark:bg-yellow-400/[0.01]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Rank Icon / Number */}
                        <div className="w-10 flex justify-center flex-shrink-0">
                          {getRankIcon(rank)}
                        </div>

                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-xl ${getRankBadge(rank)} flex items-center justify-center text-white text-base font-bold shadow-xs flex-shrink-0`}>
                          {farmer.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info details */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="font-bold text-sm text-[#26241f] dark:text-[#eeece7]">{farmer.name}</h3>
                            {farmer.isExpert && (
                              <span className="bg-[#39542f]/10 text-[#39542f] dark:text-[#a3bf96] border border-[#39542f]/20 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 uppercase tracking-wide">
                                <Star className="w-2.5 h-2.5" />
                                {t('community.expertBadge', 'Expert')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#9b9482] dark:text-[#615b4f] font-bold">
                            <span className={`flex items-center gap-0.5 font-bold ${level.color}`}>
                              {level.icon} {level.name}
                            </span>
                            <span>•</span>
                            <span>{farmer.reputation} {t('community.reputation', 'reputation')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Points score */}
                      <div className="text-right">
                        <div className="text-lg font-black text-[#26241f] dark:text-[#eeece7]">
                          {farmer.contributionPoints.toLocaleString()}
                        </div>
                        <div className="text-[9px] uppercase font-extrabold tracking-wider text-[#9b9482]">
                          {t('community.points', 'points')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Points Guide Card */}
            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-2xl p-6 border border-blue-100/50 dark:border-blue-900/10 shadow-xs">
              <h3 className="text-base font-bold text-[#26241f] dark:text-[#eeece7] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                {t('community.howToEarn', 'How to Earn Points')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: '📝', points: '+10', title: t('community.createPost', 'Create Post') },
                  { icon: '💬', points: '+5', title: t('community.reply', 'Add Reply') },
                  { icon: '✅', points: '+20', title: t('community.helpfulReply', 'Helpful Reply') },
                  { icon: '📊', points: '+15', title: t('community.uploadData', 'Upload Data') }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#1f1d18] border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] rounded-xl p-4 text-center shadow-xs">
                    <div className="text-2xl mb-1.5">{item.icon}</div>
                    <div className="font-black text-sm text-[#26241f] dark:text-[#eeece7]">{item.points}</div>
                    <div className="text-[10px] text-[#7a7364] dark:text-[#9b9482] font-semibold mt-0.5">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
