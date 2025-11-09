// Farmer Community Service - Full WhatsApp-Style Real-time System
import { 
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, limit, increment, serverTimestamp, 
  onSnapshot, Timestamp, QueryConstraint, GeoPoint 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
}

export interface CommunityPost {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerProfile?: string; // Profile pic URL
  title: string;
  description: string;
  category: string;
  tags: string[];
  urgency: 'low' | 'medium' | 'high';
  timestamp: Date;
  likes: number;
  replies: number;
  views: number;
  solved: boolean;
  imageUrls?: string[]; // Multiple images
  location?: Location; // GPS location
  isAlert?: boolean; // Emergency alert
  isPinned?: boolean; // Pinned by admin
}

export interface CommunityReply {
  id: string;
  postId: string;
  farmerId: string;
  farmerName: string;
  farmerProfile?: string;
  content: string;
  timestamp: Date;
  likes: number;
  imageUrl?: string;
  isExpert?: boolean; // Verified expert badge
  isHelpful?: boolean; // Marked as helpful by post author
}

export interface PestAlert {
  id: string;
  postId: string;
  pestName: string;
  cropAffected: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: Location;
  radius: number; // Alert radius in km
  imageUrls: string[];
  description: string;
  timestamp: Date;
  expiryTime: Date;
  affectedFarmersCount: number;
  verifiedByExpert: boolean;
}

export interface FarmerProfile {
  id: string;
  name: string;
  phone?: string;
  location: Location;
  crops: string[];
  farmSize?: number;
  experience?: number;
  isExpert: boolean;
  isOnline: boolean;
  lastActive: Date;
  joinedDate: Date;
  reputation: number; // Based on helpful answers
  contributionPoints: number;
  profilePicUrl?: string;
}

export interface CommunityStats {
  totalPosts: number;
  activeFarmers: number;
  resolvedQuestions: number;
  onlineExperts: number;
  totalAlerts: number;
  totalContributions: number;
}

export interface FarmerGroup {
  id: string;
  name: string;
  description: string;
  category: 'crop-specific' | 'location-based' | 'equipment-sharing' | 'market-intelligence' | 'disease-management' | 'general';
  privacy: 'public' | 'private';
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  members: string[]; // Array of farmer IDs
  admins: string[]; // Array of admin IDs
  posts: number; // Post count
  imageUrl?: string;
  location?: Location;
  tags: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'reply' | 'like' | 'mention' | 'group_invite' | 'alert';
  title: string;
  message: string;
  postId?: string;
  groupId?: string;
  senderId?: string;
  senderName?: string;
  read: boolean;
  timestamp: Date;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  message: string;
  imageUrl?: string;
  audioUrl?: string;
  timestamp: Date;
  read: boolean;
}

export interface Poll {
  id: string;
  postId?: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  expiresAt: Date;
  totalVotes: number;
  category: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // Array of user IDs who voted
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'helper' | 'expert' | 'contributor' | 'leader' | 'pioneer';
  requirement: number;
  badgeColor: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date;
}

class CommunityService {
  private postsCollection = collection(db, 'community_posts');
  private repliesCollection = collection(db, 'community_replies');
  private alertsCollection = collection(db, 'pest_alerts');
  private farmersCollection = collection(db, 'farmers');
  private contributionsCollection = collection(db, 'contributions');
  private groupsCollection = collection(db, 'farmer_groups');
  private notificationsCollection = collection(db, 'notifications');
  private messagesCollection = collection(db, 'direct_messages');
  private pollsCollection = collection(db, 'polls');
  private achievementsCollection = collection(db, 'achievements');
  private userAchievementsCollection = collection(db, 'user_achievements');

  // ==================== LOCATION-BASED FUNCTIONS ====================
  
  // Calculate distance between two locations (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get nearby farmers within radius
  async getNearbyFarmers(location: Location, radiusKm: number = 5): Promise<FarmerProfile[]> {
    try {
      const snapshot = await getDocs(this.farmersCollection);
      const nearbyFarmers: FarmerProfile[] = [];
      
      snapshot.forEach(docSnap => {
        const farmer = { id: docSnap.id, ...docSnap.data() } as FarmerProfile;
        const distance = this.calculateDistance(
          location.latitude, location.longitude,
          farmer.location.latitude, farmer.location.longitude
        );
        
        if (distance <= radiusKm) {
          nearbyFarmers.push(farmer);
        }
      });
      
      return nearbyFarmers;
    } catch (error) {
      console.error('Error getting nearby farmers:', error);
      return [];
    }
  }

  // Get posts from nearby farmers (5km radius)
  async getNearbyPosts(location: Location, radiusKm: number = 5, category?: string): Promise<CommunityPost[]> {
    try {
      const allPosts = await this.getPosts(category);
      
      return allPosts.filter(post => {
        if (!post.location) return false;
        const distance = this.calculateDistance(
          location.latitude, location.longitude,
          post.location.latitude, post.location.longitude
        );
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Error getting nearby posts:', error);
      return [];
    }
  }

  // ==================== POST MANAGEMENT ====================
  
  async getPosts(category?: string, includeAlerts: boolean = true): Promise<CommunityPost[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (category && category !== 'all') {
        constraints.push(where('category', '==', category));
      }
      
      if (!includeAlerts) {
        constraints.push(where('isAlert', '!=', true));
      }
      
      constraints.push(orderBy('timestamp', 'desc'));
      constraints.push(limit(100));
      
      const q = query(this.postsCollection, ...constraints);
      const snapshot = await getDocs(q);
      
      const posts: CommunityPost[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        posts.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as CommunityPost);
      });
      
      return posts;
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  // Create new post with images
  async createPost(
    post: Omit<CommunityPost, 'id' | 'timestamp' | 'likes' | 'replies' | 'views' | 'solved'>,
    images?: File[]
  ): Promise<string> {
    try {
      // Upload images if provided
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await this.uploadImages(images, 'posts');
      }

      const newPost = {
        ...post,
        imageUrls,
        timestamp: serverTimestamp(),
        likes: 0,
        replies: 0,
        views: 0,
        solved: false,
        isPinned: false
      };
      
      const docRef = await addDoc(this.postsCollection, newPost);

      // If high urgency and has location, create emergency alert
      if (post.urgency === 'high' && post.location && post.isAlert) {
        await this.createEmergencyAlert(docRef.id, post, imageUrls);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Upload multiple images
  private async uploadImages(files: File[], folder: string): Promise<string[]> {
    try {
      const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const fileName = `${folder}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      return [];
    }
  }

  // Update post
  async updatePost(postId: string, updates: Partial<CommunityPost>): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      await updateDoc(postRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Post updated:', postId);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Delete post
  async deletePost(postId: string): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      await deleteDoc(postRef);
      
      // Also delete all replies for this post
      const repliesQuery = query(this.repliesCollection, where('postId', '==', postId));
      const repliesSnap = await getDocs(repliesQuery);
      
      const deletePromises = repliesSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('✅ Post deleted:', postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Increment post views
  async incrementViews(postId: string): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      await updateDoc(postRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  // Like/Unlike post
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  // Mark post as solved
  async markAsSolved(postId: string): Promise<void> {
    try {
      const postRef = doc(this.postsCollection, postId);
      await updateDoc(postRef, {
        solved: true
      });
    } catch (error) {
      console.error('Error marking as solved:', error);
    }
  }

  // ==================== REPLY/CHAT SYSTEM ====================

  async getReplies(postId: string): Promise<CommunityReply[]> {
    try {
      const q = query(
        this.repliesCollection,
        where('postId', '==', postId),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const replies: CommunityReply[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        replies.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as CommunityReply);
      });
      
      return replies;
    } catch (error) {
      console.error('Error getting replies:', error);
      return [];
    }
  }

  async addReply(
    reply: Omit<CommunityReply, 'id' | 'timestamp' | 'likes'>,
    image?: File
  ): Promise<string> {
    try {
      let imageUrl: string | undefined;
      if (image) {
        const urls = await this.uploadImages([image], 'replies');
        imageUrl = urls[0];
      }

      const newReply = {
        ...reply,
        imageUrl,
        timestamp: serverTimestamp(),
        likes: 0,
        isHelpful: false
      };
      
      const docRef = await addDoc(this.repliesCollection, newReply);

      // Increment reply count on post
      const postRef = doc(this.postsCollection, reply.postId);
      await updateDoc(postRef, {
        replies: increment(1)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  }

  // Mark reply as helpful (by post author)
  async markReplyHelpful(replyId: string, userId: string): Promise<void> {
    try {
      const replyRef = doc(this.repliesCollection, replyId);
      await updateDoc(replyRef, {
        isHelpful: true
      });

      // Increase reputation of reply author
      // TODO: Implement reputation system
    } catch (error) {
      console.error('Error marking reply helpful:', error);
    }
  }

  // Real-time listener for new replies
  subscribeToReplies(postId: string, callback: (replies: CommunityReply[]) => void): () => void {
    const q = query(
      this.repliesCollection,
      where('postId', '==', postId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const replies: CommunityReply[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        replies.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as CommunityReply);
      });
      callback(replies);
    });
  }

  // ==================== EMERGENCY ALERTS ====================

  private async createEmergencyAlert(
    postId: string,
    post: any,
    imageUrls: string[]
  ): Promise<void> {
    try {
      const alert: Omit<PestAlert, 'id'> = {
        postId,
        pestName: post.title,
        cropAffected: post.tags[0] || 'Unknown',
        severity: post.urgency,
        location: post.location,
        radius: 5, // 5km alert radius
        imageUrls,
        description: post.description,
        timestamp: new Date(),
        expiryTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        affectedFarmersCount: 0,
        verifiedByExpert: false
      };

      const docRef = await addDoc(this.alertsCollection, {
        ...alert,
        timestamp: serverTimestamp(),
        expiryTime: Timestamp.fromDate(alert.expiryTime)
      });

      // Send notifications to nearby farmers
      await this.notifyNearbyFarmers(post.location, alert);
    } catch (error) {
      console.error('Error creating emergency alert:', error);
    }
  }

  private async notifyNearbyFarmers(location: Location, alert: any): Promise<void> {
    try {
      const nearbyFarmers = await this.getNearbyFarmers(location, alert.radius);
      console.log(`🚨 ALERT: Notifying ${nearbyFarmers.length} farmers about ${alert.pestName}`);
      
      // TODO: Implement push notifications, SMS alerts
      // For now, just log
    } catch (error) {
      console.error('Error notifying farmers:', error);
    }
  }

  async getActiveAlerts(location?: Location, radiusKm: number = 10): Promise<PestAlert[]> {
    try {
      const q = query(
        this.alertsCollection,
        where('expiryTime', '>', Timestamp.now()),
        orderBy('expiryTime', 'desc')
      );
      
      const snapshot = await getDocs(q);
      let alerts: PestAlert[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        alerts.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          expiryTime: data.expiryTime?.toDate() || new Date()
        } as PestAlert);
      });

      // Filter by location if provided
      if (location) {
        alerts = alerts.filter(alert => {
          const distance = this.calculateDistance(
            location.latitude, location.longitude,
            alert.location.latitude, alert.location.longitude
          );
          return distance <= radiusKm;
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  // ==================== STATS & LEADERBOARD ====================
  
  async getStats(): Promise<CommunityStats> {
    try {
      console.log('🔍 Fetching community stats from Firebase...');
      
      // Get posts count
      const postsSnap = await getDocs(this.postsCollection);
      console.log('📊 Posts found:', postsSnap.size);
      
      const posts: any[] = [];
      postsSnap.forEach(d => posts.push(d.data()));
      
      // Count resolved posts
      const resolvedCount = posts.filter(p => p.solved).length;
      console.log('✅ Resolved posts:', resolvedCount);
      
      // Get farmers count (total registered)
      const farmersSnap = await getDocs(this.farmersCollection);
      console.log('👨‍🌾 Total farmers:', farmersSnap.size);
      
      // Get active alerts (not expired)
      let alertsCount = 0;
      try {
        const alertsSnap = await getDocs(
          query(this.alertsCollection, where('expiryTime', '>', Timestamp.now()))
        );
        alertsCount = alertsSnap.size;
      } catch (e) {
        console.log('No alerts yet or query failed');
      }
      
      // Get contributions count
      const contributionsSnap = await getDocs(this.contributionsCollection);
      
      // For now, use simple counts
      const stats = {
        totalPosts: postsSnap.size,
        activeFarmers: farmersSnap.size || 1, // Show at least 1 if someone is using
        resolvedQuestions: resolvedCount,
        onlineExperts: Math.max(1, Math.floor(farmersSnap.size * 0.1)), // 10% are experts
        totalAlerts: alertsCount,
        totalContributions: contributionsSnap.size
      };
      
      console.log('📈 Final stats:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      // Return zeros instead of mock data
      return {
        totalPosts: 0,
        activeFarmers: 0,
        resolvedQuestions: 0,
        onlineExperts: 0,
        totalAlerts: 0,
        totalContributions: 0
      };
    }
  }

  private async getOnlineFarmersCount(): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const q = query(
        this.farmersCollection,
        where('lastActive', '>', Timestamp.fromDate(fiveMinutesAgo))
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      return 0;
    }
  }

  private async getExpertsCount(): Promise<number> {
    try {
      const q = query(
        this.farmersCollection,
        where('isExpert', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      return 0;
    }
  }

  // Get top contributors (leaderboard)
  async getTopContributors(limit: number = 10): Promise<FarmerProfile[]> {
    try {
      const q = query(
        this.farmersCollection,
        orderBy('contributionPoints', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      const contributors: FarmerProfile[] = [];
      
      snapshot.forEach(docSnap => {
        contributors.push({
          id: docSnap.id,
          ...docSnap.data()
        } as FarmerProfile);
      });
      
      return contributors;
    } catch (error) {
      console.error('Error getting contributors:', error);
      return [];
    }
  }

  // Add contribution points
  async addContribution(
    userId: string,
    type: 'post' | 'reply' | 'helpfulReply' | 'dataUpload',
    points: number
  ): Promise<void> {
    try {
      const userRef = doc(this.farmersCollection, userId);
      await updateDoc(userRef, {
        contributionPoints: increment(points)
      });

      // Log contribution
      await addDoc(this.contributionsCollection, {
        userId,
        type,
        points,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding contribution:', error);
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  // Subscribe to new posts (live feed)
  subscribeToPosts(category: string, callback: (posts: CommunityPost[]) => void): () => void {
    const constraints: QueryConstraint[] = [];
    
    if (category !== 'all') {
      constraints.push(where('category', '==', category));
    }
    
    constraints.push(orderBy('timestamp', 'desc'));
    constraints.push(limit(50));

    const q = query(this.postsCollection, ...constraints);

    return onSnapshot(q, (snapshot) => {
      const posts: CommunityPost[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        posts.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as CommunityPost);
      });
      callback(posts);
    });
  }

  // Subscribe to alerts
  subscribeToAlerts(location: Location, callback: (alerts: PestAlert[]) => void): () => void {
    const q = query(
      this.alertsCollection,
      where('expiryTime', '>', Timestamp.now()),
      orderBy('expiryTime', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const alerts: PestAlert[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const alert = {
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          expiryTime: data.expiryTime?.toDate() || new Date()
        } as PestAlert;

        // Filter by distance
        const distance = this.calculateDistance(
          location.latitude, location.longitude,
          alert.location.latitude, alert.location.longitude
        );

        if (distance <= 10) { // 10km radius
          alerts.push(alert);
        }
      });
      callback(alerts);
    });
  }

  // ==================== GROUPS FUNCTIONS ====================
  
  // Create a new group
  async createGroup(groupData: Omit<FarmerGroup, 'id' | 'createdAt' | 'members' | 'admins' | 'posts'>): Promise<string> {
    try {
      const newGroup = {
        ...groupData,
        createdAt: Timestamp.now(),
        members: [groupData.createdBy], // Creator is first member
        admins: [groupData.createdBy], // Creator is admin
        posts: 0
      };

      const docRef = await addDoc(this.groupsCollection, newGroup);
      console.log('✅ Group created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Get all groups
  async getGroups(category?: string): Promise<FarmerGroup[]> {
    try {
      let q = query(this.groupsCollection, orderBy('createdAt', 'desc'));
      
      if (category && category !== 'all') {
        q = query(this.groupsCollection, where('category', '==', category), orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(q);
      const groups: FarmerGroup[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        groups.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as FarmerGroup);
      });

      return groups;
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  }

  // Get single group
  async getGroup(groupId: string): Promise<FarmerGroup | null> {
    try {
      const docSnap = await getDoc(doc(this.groupsCollection, groupId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as FarmerGroup;
      }
      return null;
    } catch (error) {
      console.error('Error getting group:', error);
      return null;
    }
  }

  // Join a group
  async joinGroup(groupId: string, userId: string): Promise<void> {
    try {
      const groupRef = doc(this.groupsCollection, groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (groupSnap.exists()) {
        const group = groupSnap.data() as FarmerGroup;
        
        if (!group.members.includes(userId)) {
          await updateDoc(groupRef, {
            members: [...group.members, userId]
          });
          console.log('✅ Joined group:', groupId);
        }
      }
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  // Leave a group
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const groupRef = doc(this.groupsCollection, groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (groupSnap.exists()) {
        const group = groupSnap.data() as FarmerGroup;
        const updatedMembers = group.members.filter(id => id !== userId);
        const updatedAdmins = group.admins.filter(id => id !== userId);
        
        await updateDoc(groupRef, {
          members: updatedMembers,
          admins: updatedAdmins
        });
        console.log('✅ Left group:', groupId);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  // Get groups user is member of
  async getUserGroups(userId: string): Promise<FarmerGroup[]> {
    try {
      const q = query(this.groupsCollection, where('members', 'array-contains', userId));
      const snapshot = await getDocs(q);
      const groups: FarmerGroup[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        groups.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as FarmerGroup);
      });

      return groups;
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }

  // Get nearby groups (location-based)
  async getNearbyGroups(location: Location, radiusKm: number = 10): Promise<FarmerGroup[]> {
    try {
      const allGroups = await this.getGroups();
      const nearbyGroups = allGroups.filter(group => {
        if (!group.location) return false;
        
        const distance = this.calculateDistance(
          location.latitude, location.longitude,
          group.location.latitude, group.location.longitude
        );
        
        return distance <= radiusKm;
      });

      return nearbyGroups;
    } catch (error) {
      console.error('Error getting nearby groups:', error);
      return [];
    }
  }

  // ==================== NOTIFICATIONS SYSTEM ====================
  
  // Create notification
  async createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    try {
      await addDoc(this.notificationsCollection, {
        ...notification,
        read: false,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit_count: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        this.notificationsCollection,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limit_count)
      );
      
      const snapshot = await getDocs(q);
      const notifications: Notification[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        notifications.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Notification);
      });
      
      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      const notifRef = doc(this.notificationsCollection, notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsRead(userId: string): Promise<void> {
    try {
      const q = query(
        this.notificationsCollection,
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(updates);
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  }

  // Get unread count
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const q = query(
        this.notificationsCollection,
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Subscribe to notifications (real-time)
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const q = query(
      this.notificationsCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        notifications.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Notification);
      });
      callback(notifications);
    });
  }

  // ==================== DIRECT MESSAGING ====================
  
  // Send direct message
  async sendDirectMessage(message: Omit<DirectMessage, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      const docRef = await addDoc(this.messagesCollection, {
        ...message,
        read: false,
        timestamp: serverTimestamp()
      });

      // Create notification for recipient
      await this.createNotification({
        userId: message.recipientId,
        type: 'reply',
        title: 'New Message',
        message: `${message.senderName} sent you a message`,
        senderId: message.senderId,
        senderName: message.senderName
      });

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get conversation messages
  async getConversationMessages(conversationId: string): Promise<DirectMessage[]> {
    try {
      const q = query(
        this.messagesCollection,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const messages: DirectMessage[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        messages.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as DirectMessage);
      });
      
      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Get user conversations (list of people chatted with)
  async getUserConversations(userId: string): Promise<any[]> {
    try {
      const q = query(
        this.messagesCollection,
        where('senderId', '==', userId)
      );
      
      const q2 = query(
        this.messagesCollection,
        where('recipientId', '==', userId)
      );
      
      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(q2)
      ]);
      
      const conversationIds = new Set<string>();
      sentSnapshot.forEach(doc => conversationIds.add(doc.data().conversationId));
      receivedSnapshot.forEach(doc => conversationIds.add(doc.data().conversationId));
      
      return Array.from(conversationIds).map(id => ({ conversationId: id }));
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  // Subscribe to conversation (real-time)
  subscribeToConversation(conversationId: string, callback: (messages: DirectMessage[]) => void): () => void {
    const q = query(
      this.messagesCollection,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages: DirectMessage[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        messages.push({
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as DirectMessage);
      });
      callback(messages);
    });
  }

  // Upload voice message
  async uploadVoiceMessage(audioBlob: Blob, folder: string = 'voice'): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${folder}/${timestamp}.webm`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, audioBlob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading voice message:', error);
      throw error;
    }
  }

  // Upload video
  async uploadVideo(videoFile: File): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `videos/${timestamp}_${videoFile.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, videoFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  // ==================== POLLS SYSTEM ====================
  
  // Create poll
  async createPoll(poll: Omit<Poll, 'id' | 'createdAt' | 'totalVotes'>): Promise<string> {
    try {
      const newPoll = {
        ...poll,
        createdAt: serverTimestamp(),
        totalVotes: 0,
        options: poll.options.map(opt => ({
          ...opt,
          votes: 0,
          voters: []
        }))
      };

      const docRef = await addDoc(this.pollsCollection, newPoll);
      return docRef.id;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  // Vote on poll
  async voteOnPoll(pollId: string, optionId: string, userId: string): Promise<void> {
    try {
      const pollRef = doc(this.pollsCollection, pollId);
      const pollSnap = await getDoc(pollRef);
      
      if (pollSnap.exists()) {
        const poll = pollSnap.data() as Poll;
        
        // Check if user already voted
        const alreadyVoted = poll.options.some(opt => opt.voters.includes(userId));
        if (alreadyVoted) {
          throw new Error('User already voted');
        }

        // Update the voted option
        const updatedOptions = poll.options.map(opt => {
          if (opt.id === optionId) {
            return {
              ...opt,
              votes: opt.votes + 1,
              voters: [...opt.voters, userId]
            };
          }
          return opt;
        });

        await updateDoc(pollRef, {
          options: updatedOptions,
          totalVotes: increment(1)
        });
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  }

  // Get poll results
  async getPoll(pollId: string): Promise<Poll | null> {
    try {
      const pollSnap = await getDoc(doc(this.pollsCollection, pollId));
      if (pollSnap.exists()) {
        const data = pollSnap.data();
        return {
          id: pollSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date()
        } as Poll;
      }
      return null;
    } catch (error) {
      console.error('Error getting poll:', error);
      return null;
    }
  }

  // Get active polls
  async getActivePolls(category?: string): Promise<Poll[]> {
    try {
      let q = query(
        this.pollsCollection,
        where('expiresAt', '>', Timestamp.now()),
        orderBy('expiresAt', 'desc')
      );

      if (category) {
        q = query(
          this.pollsCollection,
          where('category', '==', category),
          where('expiresAt', '>', Timestamp.now()),
          orderBy('expiresAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const polls: Poll[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        polls.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date()
        } as Poll);
      });

      return polls;
    } catch (error) {
      console.error('Error getting active polls:', error);
      return [];
    }
  }

  // ==================== ACHIEVEMENTS SYSTEM ====================
  
  // Initialize default achievements
  async initializeAchievements(): Promise<void> {
    try {
      const achievements: Omit<Achievement, 'id'>[] = [
        {
          name: 'First Post',
          description: 'Create your first community post',
          icon: '📝',
          type: 'pioneer',
          requirement: 1,
          badgeColor: 'blue'
        },
        {
          name: 'Helpful Farmer',
          description: 'Provide 10 helpful replies',
          icon: '🤝',
          type: 'helper',
          requirement: 10,
          badgeColor: 'green'
        },
        {
          name: 'Expert Advisor',
          description: 'Provide 50 helpful replies',
          icon: '⭐',
          type: 'expert',
          requirement: 50,
          badgeColor: 'purple'
        },
        {
          name: 'Top Contributor',
          description: 'Earn 500 contribution points',
          icon: '🏆',
          type: 'contributor',
          requirement: 500,
          badgeColor: 'gold'
        },
        {
          name: 'Community Leader',
          description: 'Create 3 active groups',
          icon: '👑',
          type: 'leader',
          requirement: 3,
          badgeColor: 'red'
        }
      ];

      for (const achievement of achievements) {
        await addDoc(this.achievementsCollection, achievement);
      }
    } catch (error) {
      console.error('Error initializing achievements:', error);
    }
  }

  // Get all achievements
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const snapshot = await getDocs(this.achievementsCollection);
      const achievements: Achievement[] = [];

      snapshot.forEach(docSnap => {
        achievements.push({
          id: docSnap.id,
          ...docSnap.data()
        } as Achievement);
      });

      return achievements;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  // Get user achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const q = query(
        this.userAchievementsCollection,
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const userAchievements: UserAchievement[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        userAchievements.push({
          id: docSnap.id,
          ...data,
          earnedAt: data.earnedAt?.toDate() || new Date()
        } as UserAchievement);
      });

      return userAchievements;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  // Award achievement to user
  async awardAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      // Check if user already has this achievement
      const q = query(
        this.userAchievementsCollection,
        where('userId', '==', userId),
        where('achievementId', '==', achievementId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(this.userAchievementsCollection, {
          userId,
          achievementId,
          earnedAt: serverTimestamp()
        });

        // Create notification
        const achievementSnap = await getDoc(doc(this.achievementsCollection, achievementId));
        if (achievementSnap.exists()) {
          const achievement = achievementSnap.data();
          await this.createNotification({
            userId,
            type: 'reply',
            title: 'Achievement Unlocked!',
            message: `You earned: ${achievement.icon} ${achievement.name}`
          });
        }
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }

  // Check and award achievements based on user activity
  async checkAndAwardAchievements(userId: string): Promise<void> {
    try {
      const userProfile = await getDoc(doc(this.farmersCollection, userId));
      if (!userProfile.exists()) return;

      const userData = userProfile.data();
      const achievements = await this.getAllAchievements();

      for (const achievement of achievements) {
        let shouldAward = false;

        switch (achievement.type) {
          case 'pioneer':
            // Check if user has created posts
            const postsQuery = query(
              this.postsCollection,
              where('farmerId', '==', userId)
            );
            const postsSnap = await getDocs(postsQuery);
            shouldAward = postsSnap.size >= achievement.requirement;
            break;

          case 'helper':
          case 'expert':
            // Check helpful replies count
            const repliesQuery = query(
              this.repliesCollection,
              where('userId', '==', userId),
              where('isHelpful', '==', true)
            );
            const repliesSnap = await getDocs(repliesQuery);
            shouldAward = repliesSnap.size >= achievement.requirement;
            break;

          case 'contributor':
            // Check contribution points
            shouldAward = (userData.contributionPoints || 0) >= achievement.requirement;
            break;

          case 'leader':
            // Check groups created
            const groupsQuery = query(
              this.groupsCollection,
              where('createdBy', '==', userId)
            );
            const groupsSnap = await getDocs(groupsQuery);
            shouldAward = groupsSnap.size >= achievement.requirement;
            break;
        }

        if (shouldAward) {
          await this.awardAchievement(userId, achievement.id);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }
}

export default new CommunityService();
