import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Settings, UserPlus, MessageCircle, MapPin, Tag, UserMinus, Globe, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import communityService, { FarmerGroup, CommunityPost } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';

const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, userProfile } = useAuth();
  const currentUserId = user?.uid || '';
  const currentUserName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'You';

  const [group, setGroup] = useState<FarmerGroup | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');

  // Subscribe to Group Details real-time
  useEffect(() => {
    if (!groupId) return;

    setLoading(true);
    const docRef = doc(db, 'farmer_groups', groupId);
    const unsubscribeGroup = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGroup({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as FarmerGroup);
      } else {
        setGroup(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to group data:', error);
      setLoading(false);
    });

    // Subscribe to Group Posts real-time
    const postsRef = collection(db, 'community_posts');
    const q = query(
      postsRef,
      where('groupId', '==', groupId),
      orderBy('timestamp', 'desc')
    );
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const groupPosts: CommunityPost[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        groupPosts.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as CommunityPost);
      });
      setPosts(groupPosts);
    }, (error) => {
      console.error('Error listening to group posts:', error);
    });

    return () => {
      unsubscribeGroup();
      unsubscribePosts();
    };
  }, [groupId]);

  const isMember = useMemo(() => {
    if (!group || !currentUserId) return false;
    return Array.isArray(group.members) && group.members.includes(currentUserId);
  }, [group, currentUserId]);

  const handleJoinLeaveGroup = async () => {
    if (!groupId || !currentUserId) {
      toast.error(t('profile.loginRequired', 'Please log in to perform this action'));
      return;
    }

    try {
      if (isMember) {
        if (window.confirm(t('community.confirmLeaveGroup', 'Are you sure you want to leave this group?'))) {
          await communityService.leaveGroup(groupId, currentUserId);
          toast.success(t('community.leftGroupSuccess', 'Left group successfully'));
          navigate('/groups');
        }
      } else {
        await communityService.joinGroup(groupId, currentUserId);
        toast.success(t('community.joinedGroupSuccess', 'Joined group successfully! 🎉'));
      }
    } catch (error) {
      console.error('Error join/leave group:', error);
      toast.error(t('common.error', 'An error occurred'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#14130f] flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#39542f]"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#14130f] text-[#26241f] dark:text-[#eeece7] flex flex-col items-center justify-center p-6">
        <p className="text-xl font-bold mb-4">{t('community.groupNotFound', 'Group not found')}</p>
        <button
          onClick={() => navigate('/groups')}
          className="bg-[#39542f] hover:bg-[#2f4328] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
        >
          {t('community.backToGroups', 'Back to Groups')}
        </button>
      </div>
    );
  }

  const isAdmin = Array.isArray(group.admins) && group.admins.includes(currentUserId);

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-[#14130f] text-[#26241f] dark:text-[#eeece7] pb-12 transition-colors duration-300">
      {/* Cover / Banner Area */}
      <div className="h-44 bg-gradient-to-br from-[#2f4328] via-[#39542f] to-[#1c2c18] relative shadow-md">
        {group.imageUrl && (
          <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover opacity-50" />
        )}
        <button
          onClick={() => navigate('/groups')}
          className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white p-2.5 rounded-xl border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Info Card (Overlapping) */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10 sm:px-6">
        <div className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7ea26d] to-[#476a39] flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
                  <span className="bg-[#f1efe9] dark:bg-[#181713] text-[#615b4f] dark:text-[#bfbaad] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {t(`community.groupCategories.${group.category}`, group.category.replace('-', ' '))}
                  </span>
                </div>
                <p className="text-sm text-[#7a7364] dark:text-[#9b9482] max-w-2xl mb-3">
                  {group.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-[#7a7364] dark:text-[#9b9482] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#39542f]/80 dark:text-[#7ea26d]/80" />
                    <span>{group.members.length} {t('community.members', 'Members')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-blue-500/80" />
                    <span>{posts.length} {t('community.posts', 'Posts')}</span>
                  </div>
                  {group.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500/80" />
                      <span>{group.location.village || group.location.district || t('community.nearYou', 'Near you')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 w-full md:w-auto">
              <button
                onClick={handleJoinLeaveGroup}
                className={`flex-1 md:flex-initial px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isMember
                    ? 'bg-[#7ea26d]/10 text-[#39542f] dark:text-[#a3bf96] border border-[#7ea26d]/20 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/40'
                    : 'bg-[#39542f] hover:bg-[#2f4328] text-white'
                }`}
              >
                {isMember ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    {t('community.leave', 'Leave Group')}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {t('community.join', 'Join Group')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tags */}
          {group.tags && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)]">
              {group.tags.map((tag, idx) => (
                <span key={idx} className="bg-[#f1efe9] dark:bg-[#181713] text-[#615b4f] dark:text-[#bfbaad] px-2.5 py-1 rounded-md text-[10px] font-bold">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="max-w-7xl mx-auto px-4 mt-8 sm:px-6">
        <div className="bg-white dark:bg-[#1f1d18] rounded-xl p-1.5 border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] shadow-xs flex gap-1 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'posts'
                ? 'bg-[#39542f] text-white shadow-xs'
                : 'text-[#615b4f] dark:text-[#bfbaad] hover:bg-[#f1efe9] dark:hover:bg-[#181713]'
            }`}
          >
            {t('community.posts', 'Posts')}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'members'
                ? 'bg-[#39542f] text-white shadow-xs'
                : 'text-[#615b4f] dark:text-[#bfbaad] hover:bg-[#f1efe9] dark:hover:bg-[#181713]'
            }`}
          >
            {t('community.members', 'Members')}
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] p-16 text-center shadow-sm max-w-xl mx-auto">
                <MessageCircle className="w-12 h-12 text-[#9b9482] mx-auto mb-4 opacity-55" />
                <h3 className="text-lg font-bold mb-1.5">{t('community.noReplies', 'No posts yet')}</h3>
                <p className="text-sm text-[#7a7364] dark:text-[#9b9482] mb-5">
                  {t('community.noPostsSub', 'Be the first one to write a post in this group!')}
                </p>
                <button
                  onClick={() => navigate('/community')}
                  className="bg-[#39542f] hover:bg-[#2f4328] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {t('community.newPost', 'New Post')}
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {posts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => navigate('/community')}
                    className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] p-5 shadow-sm hover:shadow-md hover:border-[#c7d9bf] dark:hover:border-[#39542f] transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-4 mb-2.5">
                      <h3 className="text-lg font-bold text-[#26241f] dark:text-[#eeece7] line-clamp-1">{post.title}</h3>
                      {post.solved && (
                        <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {t('community.solved', 'Solved')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7a7364] dark:text-[#9b9482] line-clamp-3 mb-4">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#9b9482] dark:text-[#615b4f] font-semibold pt-3 border-t border-[rgba(38,36,31,0.04)] dark:border-[rgba(255,255,255,0.04)]">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-[#7ea26d] text-white flex items-center justify-center font-bold text-[10px]">
                          {post.farmerName.charAt(0).toUpperCase()}
                        </div>
                        <span>{post.farmerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{post.replies} {t('community.replies', 'Replies')}</span>
                        <span>•</span>
                        <span>{post.likes} {t('words.like', 'Likes')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white dark:bg-[#1f1d18] rounded-2xl border border-[rgba(38,36,31,0.06)] dark:border-[rgba(255,255,255,0.05)] p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#39542f]" />
              {t('community.members', 'Members')} ({group.members.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.members.map((memberId, idx) => {
                const isMemberAdmin = Array.isArray(group.admins) && group.admins.includes(memberId);
                const isCurrentUser = memberId === currentUserId;
                return (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-[#f8f7f5] dark:bg-[#14130f] rounded-xl border border-[rgba(38,36,31,0.04)] dark:border-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7ea26d] to-[#476a39] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                        {isCurrentUser ? currentUserName.charAt(0).toUpperCase() : `F`}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {isCurrentUser ? `${currentUserName} (${t('words.user', 'You')})` : `Farmer ${idx + 1}`}
                        </p>
                        <p className="text-[10px] text-[#9b9482] dark:text-[#615b4f] font-bold">
                          {isMemberAdmin ? 'GROUP LEADER' : 'MEMBER'}
                        </p>
                      </div>
                    </div>
                    {isMemberAdmin && (
                      <span className="bg-[#39542f]/10 text-[#39542f] dark:text-[#a3bf96] border border-[#39542f]/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailPage;
