import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
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
  ArrowLeft,
  User,
  MessageCircle
} from 'lucide-react';
import { collection, doc, getDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import communityService from '../services/communityService';
import type { UserAchievement, Achievement, CommunityPost } from '../services/communityService';
import { PageHeader, Tabs, Badge, EmptyState, Skeleton } from '../components/ui';

interface ProfileUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  locationLabel: string;
  joinDate: Date | null;
  verified: boolean;
  crops: string[];
  expertise: string[];
  stats: {
    postsCount: number;
    questionsCount: number;
    answersCount: number;
    helpfulVotes: number;
    reputation: number;
    followers: number;
    following: number;
    level: string;
    contributionPoints: number;
  };
}

interface ProfilePost {
  id: string;
  title: string;
  description: string;
  category: string;
  timestamp: Date;
  likes: number;
  replies: number;
  views: number;
}

const formatNumber = (n: number | undefined): string => {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

const formatJoinDate = (d: Date | null): string => {
  if (!d) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const computeLevel = (contributionPoints: number): string => {
  if (contributionPoints >= 3000) return 'Master Farmer';
  if (contributionPoints >= 1500) return 'Expert Farmer';
  if (contributionPoints >= 500) return 'Advanced Farmer';
  return 'New Farmer';
};

const EnhancedProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'achievements' | 'stats'>('posts');
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [userPosts, setUserPosts] = useState<ProfilePost[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setProfile(null);
    setUserPosts([]);

    const targetId = userId || '';
    if (!targetId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    (async () => {
      try {
        // 1. Real user profile from Firestore
        const userSnap = await getDoc(doc(db, 'users', targetId));
        if (cancelled) return;

        if (!userSnap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = userSnap.data() as Record<string, any>;
        const loc = data.location || {};
        const village = loc.village || data.village || '';
        const district = loc.district || data.district || '';
        const state = loc.state || data.state || '';
        const locationLabel = [village, district, state].filter(Boolean).join(', ') || 'Location not set';

        const createdAt = data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt instanceof Date
            ? data.createdAt
            : null;
        const stats = data.stats || {};
        const contributionPoints = typeof stats.contributionPoints === 'number' ? stats.contributionPoints : 0;

        const expertise: string[] = [];
        if (Array.isArray(data.crops)) expertise.push(...data.crops.filter((s: unknown): s is string => typeof s === 'string'));
        if (Array.isArray(data.farmingType)) expertise.push(...data.farmingType.filter((s: unknown): s is string => typeof s === 'string'));

        const mapped: ProfileUser = {
          uid: userSnap.id,
          displayName: data.displayName || data.name || 'Farmer',
          photoURL: data.photoURL || undefined,
          bio: data.bio || undefined,
          locationLabel,
          joinDate: createdAt,
          verified: data.verified === true,
          crops: Array.isArray(data.crops) ? data.crops.filter((s: unknown): s is string => typeof s === 'string') : [],
          expertise,
          stats: {
            postsCount: typeof stats.postsCount === 'number' ? stats.postsCount : 0,
            questionsCount: typeof stats.questionsCount === 'number' ? stats.questionsCount : 0,
            answersCount: typeof stats.answersCount === 'number' ? stats.answersCount : 0,
            helpfulVotes: typeof stats.helpfulVotes === 'number' ? stats.helpfulVotes : 0,
            reputation: typeof stats.reputation === 'number' ? stats.reputation : 0,
            followers: typeof stats.followers === 'number' ? stats.followers : 0,
            following: typeof stats.following === 'number' ? stats.following : 0,
            level: stats.level || computeLevel(contributionPoints),
            contributionPoints
          }
        };
        setProfile(mapped);

        // 2. Recent posts from this user
        try {
          const postsQ = query(
            collection(db, 'communityPosts'),
            where('authorId', '==', targetId),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const postsSnap = await getDocs(postsQ);
          const posts: ProfilePost[] = [];
          postsSnap.forEach((docSnap) => {
            const p = docSnap.data() as Partial<CommunityPost> & { createdAt?: Timestamp | Date };
            const ts = p.timestamp instanceof Timestamp
              ? p.timestamp.toDate()
              : p.createdAt instanceof Timestamp
                ? p.createdAt.toDate()
                : p.createdAt instanceof Date
                  ? p.createdAt
                  : new Date();
            posts.push({
              id: docSnap.id,
              title: p.title || 'Untitled',
              description: p.description || '',
              category: p.category || 'General',
              timestamp: ts,
              likes: typeof p.likes === 'number' ? p.likes : 0,
              replies: typeof p.replies === 'number' ? p.replies : 0,
              views: typeof p.views === 'number' ? p.views : 0
            });
          });
          if (!cancelled) setUserPosts(posts);
        } catch (err) {
          console.warn('EnhancedProfilePage: failed to load user posts', err);
          if (!cancelled) setUserPosts([]);
        }

        // 3. Achievements (existing community service call)
        try {
          const [userAch, allAch] = await Promise.all([
            communityService.getUserAchievements(targetId),
            communityService.getAllAchievements()
          ]);
          if (cancelled) return;
          setUserAchievements(userAch);
          setAllAchievements(allAch);
        } catch (err) {
          console.warn('EnhancedProfilePage: failed to load achievements', err);
        }
      } catch (err) {
        console.error('EnhancedProfilePage: failed to load profile', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

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

  const getLevelBadgeTone = (level: string): 'leaf' | 'sky' | 'harvest' => {
    if (level.includes('Expert') || level.includes('Master')) return 'harvest';
    if (level.includes('Advanced')) return 'sky';
    return 'leaf';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <div className="container-app py-6">
          <Skeleton height={24} width="30%" className="mb-3" />
          <Skeleton height={40} width="60%" className="mb-2" />
          <Skeleton height={16} width="40%" />
        </div>
        <div className="container-app py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={120} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="container-app py-6">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost mb-4"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <PageHeader
            eyebrow="Profile"
            title="User not found"
            description="We couldn't find a user with that identifier. The account may have been deleted or the link is incorrect."
          />
          <div className="mt-4 card card-padded">
            <EmptyState
              icon={<User className="w-8 h-8" />}
              title="No such user"
              description="Try going back and selecting a different profile."
              action={
                <button onClick={() => navigate('/community')} className="btn btn-primary btn-sm" type="button">
                  Back to community
                </button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="bg-gradient-to-r from-leaf-700 to-soil-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl bg-leaf-100 flex items-center justify-center text-leaf-700 text-4xl font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {profile.verified && (
                <div className="absolute -bottom-2 -right-2 bg-harvest-400 text-harvest-900 rounded-full p-2 shadow-lg">
                  <Trophy className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold text-white truncate">{profile.displayName}</h1>
                <Badge tone={getLevelBadgeTone(profile.stats.level)} className="bg-white/15 text-white border-white/20">
                  {profile.stats.level}
                </Badge>
                {profile.verified && (
                  <Badge tone="success" className="bg-white/15 text-white border-white/20">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>

              {profile.bio ? (
                <p className="text-white/85 mb-3 max-w-2xl">{profile.bio}</p>
              ) : (
                <p className="text-white/60 italic mb-3">This user hasn't added a bio yet.</p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/85">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {profile.locationLabel}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined {formatJoinDate(profile.joinDate)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-harvest-300" />
                  {formatNumber(profile.stats.reputation)} Reputation
                </div>
              </div>

              {/* Expertise Tags */}
              {profile.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.expertise.slice(0, 6).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-white/15 rounded-full text-sm font-medium text-white">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                className="bg-white text-leaf-700 px-5 py-2.5 rounded-md font-semibold hover:bg-white/90 transition-all flex items-center gap-2 shadow-md"
              >
                <MessageSquare className="w-5 h-5" />
                Message
              </button>
              <button
                type="button"
                className="bg-white/10 border border-white/30 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
              >
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
          <div className="card card-padded text-center">
            <MessageCircle className="w-7 h-7 text-sky-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-strong">{formatNumber(profile.stats.postsCount)}</div>
            <div className="text-sm text-muted">Posts</div>
          </div>
          <div className="card card-padded text-center">
            <Share2 className="w-7 h-7 text-leaf-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-strong">{formatNumber(profile.stats.answersCount)}</div>
            <div className="text-sm text-muted">Replies</div>
          </div>
          <div className="card card-padded text-center">
            <Heart className="w-7 h-7 text-danger-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-strong">{formatNumber(profile.stats.helpfulVotes)}</div>
            <div className="text-sm text-muted">Helpful Votes</div>
          </div>
          <div className="card card-padded text-center">
            <Trophy className="w-7 h-7 text-harvest-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-strong">{formatNumber(profile.stats.contributionPoints)}</div>
            <div className="text-sm text-muted">Points</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="card overflow-hidden mb-8">
          <div className="px-2">
            <Tabs
              variant="pill"
              value={activeTab}
              onChange={(v) => setActiveTab(v)}
              tabs={[
                { value: 'posts', label: 'Posts', badge: <span className="text-xs opacity-70">{userPosts.length}</span> },
                { value: 'replies', label: 'Replies', badge: <span className="text-xs opacity-70">{formatNumber(profile.stats.answersCount)}</span> },
                { value: 'achievements', label: 'Achievements', badge: <span className="text-xs opacity-70">{userAchievements.length}</span> },
                { value: 'stats', label: 'Stats' }
              ]}
            />
          </div>

          <div className="p-6">
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-strong">Recent Posts</h2>
                {userPosts.length === 0 ? (
                  <EmptyState
                    icon={<MessageCircle className="w-7 h-7" />}
                    title="This user hasn't posted yet"
                    description="When this user shares a post, it'll show up here."
                  />
                ) : (
                  userPosts.map((post) => (
                    <Link
                      to={`/post/${post.id}`}
                      key={post.id}
                      className="block border border-subtle rounded-lg p-4 hover:bg-sunken transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2 gap-3">
                        <h3 className="text-base font-semibold text-strong">{post.title}</h3>
                        <span className="text-xs text-muted whitespace-nowrap">{post.timestamp.toLocaleDateString()}</span>
                      </div>
                      {post.description && (
                        <p className="text-sm text-muted line-clamp-2 mb-2">{post.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <Badge tone="default">{post.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          {formatNumber(post.likes)} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {formatNumber(post.replies)} replies
                        </span>
                        <span>{formatNumber(post.views)} views</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Replies Tab */}
            {activeTab === 'replies' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-strong">Recent Replies</h2>
                {profile.stats.answersCount === 0 ? (
                  <EmptyState
                    icon={<MessageSquare className="w-7 h-7" />}
                    title="No replies yet"
                    description={`${profile.displayName} hasn't replied to any posts yet.`}
                  />
                ) : (
                  <p className="text-sm text-muted">
                    {profile.displayName} has {formatNumber(profile.stats.answersCount)} replies. Open a post in the
                    community feed to see their replies.
                  </p>
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-strong">Achievements</h2>
                {allAchievements.length === 0 ? (
                  <EmptyState
                    icon={<Award className="w-7 h-7" />}
                    title="No achievements available"
                    description="Achievements will appear here once the community defines them."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allAchievements.map((achievement) => {
                      const userAch = userAchievements.find((ua) => ua.achievementId === achievement.id);
                      const isEarned = !!userAch;

                      return (
                        <div
                          key={achievement.id}
                          className={`border rounded-lg p-5 transition-all ${
                            isEarned
                              ? 'border-leaf-300 bg-leaf-50/50'
                              : 'border-subtle bg-sunken/40 opacity-60'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                            isEarned ? 'bg-harvest-100 text-harvest-700' : 'bg-sunken text-ink-500'
                          }`}>
                            {getAchievementIcon(achievement.icon)}
                          </div>
                          <h3 className="text-base font-semibold text-strong mb-1">{achievement.name}</h3>
                          <p className="text-sm text-muted mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-leaf-700 font-medium">+{achievement.points || 100} pts</span>
                            {isEarned && userAch && (
                              <span className="text-success-600 font-medium">
                                Earned {new Date(userAch.earnedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-strong">Detailed Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card card-padded border border-subtle">
                    <h3 className="text-sm font-semibold text-strong mb-3">Community Impact</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted">Total Posts</span><span className="font-semibold text-strong">{formatNumber(profile.stats.postsCount)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Questions</span><span className="font-semibold text-strong">{formatNumber(profile.stats.questionsCount)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Replies</span><span className="font-semibold text-strong">{formatNumber(profile.stats.answersCount)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Helpful Votes</span><span className="font-semibold text-success-600">{formatNumber(profile.stats.helpfulVotes)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Reputation</span><span className="font-semibold text-leaf-700">{formatNumber(profile.stats.reputation)}</span></div>
                    </div>
                  </div>

                  <div className="card card-padded border border-subtle">
                    <h3 className="text-sm font-semibold text-strong mb-3">Network</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted">Followers</span><span className="font-semibold text-strong">{formatNumber(profile.stats.followers)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Following</span><span className="font-semibold text-strong">{formatNumber(profile.stats.following)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Contribution Points</span><span className="font-semibold text-sky-600">{formatNumber(profile.stats.contributionPoints)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Level</span><span className="font-semibold text-strong">{profile.stats.level}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfilePage;
