import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Data Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  location: {
    state: string;
    district: string;
    village?: string;
    pincode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  farmInfo: {
    farmSize: number; // in acres
    experience: number; // in years
    primaryCrops: string[];
    farmingType: 'organic' | 'conventional' | 'mixed';
    irrigationType: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
  };
  preferences: {
    language: string;
    notifications: {
      weather: boolean;
      prices: boolean;
      diseases: boolean;
      schemes: boolean;
      community: boolean;
    };
  };
  stats: {
    joinDate: Timestamp;
    lastActive: Timestamp;
    postsCount: number;
    helpfulVotes: number;
    questionsAsked: number;
    answersGiven: number;
  };
  isVerified: boolean;
  role: 'farmer' | 'expert' | 'admin';
  status: 'active' | 'suspended' | 'inactive';
  soilPh?: number;
  soilN?: number;
  soilP?: number;
  soilK?: number;
}

export interface CommunityPost {
  id?: string;
  authorId: string;
  authorName: string;
  authorLocation: string;
  title: string;
  content: string;
  images?: string[];
  category: 'question' | 'tip' | 'success-story' | 'problem' | 'market-info';
  tags: string[];
  crops: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likes: number;
  likedBy: string[];
  comments: number;
  views: number;
  isResolved: boolean;
  isApproved: boolean;
  moderatorNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Comment {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  images?: string[];
  createdAt: Timestamp;
  likes: number;
  likedBy: string[];
  isApproved: boolean;
  isAnswer: boolean;
  helpfulVotes: number;
}

export interface VisitorStats {
  id?: string;
  date: string; // YYYY-MM-DD format
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  avgSessionDuration: number;
  topPages: { page: string; views: number }[];
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  locationStats: {
    [state: string]: number;
  };
  timestamp: Timestamp;
}

export interface SystemMetrics {
  id?: string;
  timestamp: Timestamp;
  activeUsers: number;
  totalPosts: number;
  totalComments: number;
  totalQuestions: number;
  resolvedQuestions: number;
  errorCount: number;
  performanceMetrics: {
    avgLoadTime: number;
    errorRate: number;
    uptime: number;
  };
}

// User Management Service
// Service Classes (removing duplicate declarations)
class UserServiceClass {
  private static collection = 'users';

  static async createUser(userData: Partial<UserProfile>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...userData,
        stats: {
          joinDate: Timestamp.now(),
          lastActive: Timestamp.now(),
          postsCount: 0,
          helpfulVotes: 0,
          questionsAsked: 0,
          answersGiven: 0,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserById(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, this.collection, uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  static async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, this.collection, uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        'stats.lastActive': Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async getAllUsers(limitCount = 50): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, this.collection),
        orderBy('stats.joinDate', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as UserProfile[];
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  static async getUsersByLocation(state: string, district?: string): Promise<UserProfile[]> {
    try {
      let q = query(
        collection(db, this.collection),
        where('location.state', '==', state)
      );

      if (district) {
        q = query(q, where('location.district', '==', district));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as UserProfile[];
    } catch (error) {
      console.error('Error getting users by location:', error);
      throw error;
    }
  }
}

// Community Service
class CommunityServiceClass {
  private static collection = 'community_posts';
  private static commentsCollection = 'comments';

  static async createPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...postData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        likes: 0,
        likedBy: [],
        comments: 0,
        views: 0,
        isResolved: false,
        isApproved: false, // Requires admin approval
      });

      // Update user stats
      const userRef = doc(db, 'users', postData.authorId);
      await updateDoc(userRef, {
        'stats.postsCount': increment(1),
        'stats.lastActive': Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  static async getPosts(
    category?: string, 
    limitCount = 20, 
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{ posts: CommunityPost[], lastDoc: QueryDocumentSnapshot | null }> {
    try {
      let q = query(
        collection(db, this.collection),
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (category) {
        q = query(q, where('category', '==', category));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];

      const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { posts, lastDoc: lastDocument };
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  static async getPostById(postId: string): Promise<CommunityPost | null> {
    try {
      const docRef = doc(db, this.collection, postId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Increment view count
        await updateDoc(docRef, {
          views: increment(1)
        });
        
        return { id: docSnap.id, ...docSnap.data() } as CommunityPost;
      }
      return null;
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  }

  static async likePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, this.collection, postId);
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  static async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, this.collection, postId);
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  static async addComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.commentsCollection), {
        ...commentData,
        createdAt: Timestamp.now(),
        likes: 0,
        likedBy: [],
        isApproved: false, // Requires moderation
        helpfulVotes: 0,
      });

      // Update post comment count
      const postRef = doc(db, this.collection, commentData.postId);
      await updateDoc(postRef, {
        comments: increment(1)
      });

      // Update user stats
      const userRef = doc(db, 'users', commentData.authorId);
      await updateDoc(userRef, {
        'stats.answersGiven': increment(1),
        'stats.lastActive': Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  static async getComments(postId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, this.commentsCollection),
        where('postId', '==', postId),
        where('isApproved', '==', true),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }
}

// Analytics Service
class AnalyticsServiceClass {
  private static visitorCollection = 'visitor_stats';
  private static metricsCollection = 'system_metrics';

  static async trackVisitor(
    sessionId: string, 
    page: string, 
    userAgent: string, 
    location?: { state?: string; city?: string }
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, this.visitorCollection, today);
      
      // Get or create today's stats
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as VisitorStats;
        const updatedTopPages = [...data.topPages];
        
        // Update page views
        const pageIndex = updatedTopPages.findIndex(p => p.page === page);
        if (pageIndex >= 0) {
          updatedTopPages[pageIndex].views++;
        } else {
          updatedTopPages.push({ page, views: 1 });
        }

        // Device detection
        const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
        const isTablet = /iPad|Tablet/.test(userAgent);
        
        const deviceUpdate = isMobile 
          ? { 'deviceStats.mobile': increment(1) }
          : isTablet 
          ? { 'deviceStats.tablet': increment(1) }
          : { 'deviceStats.desktop': increment(1) };

        // Location update
        const locationUpdate = location?.state 
          ? { [`locationStats.${location.state}`]: increment(1) }
          : {};

        await updateDoc(docRef, {
          totalVisitors: increment(1),
          pageViews: increment(1),
          topPages: updatedTopPages,
          ...deviceUpdate,
          ...locationUpdate,
          timestamp: Timestamp.now(),
        });
      } else {
        // Create new day's stats
        const newStats: Omit<VisitorStats, 'id'> = {
          date: today,
          totalVisitors: 1,
          uniqueVisitors: 1,
          pageViews: 1,
          avgSessionDuration: 0,
          topPages: [{ page, views: 1 }],
          deviceStats: {
            mobile: /Mobile|Android|iPhone/.test(userAgent) ? 1 : 0,
            desktop: !/Mobile|Android|iPhone|iPad|Tablet/.test(userAgent) ? 1 : 0,
            tablet: /iPad|Tablet/.test(userAgent) ? 1 : 0,
          },
          locationStats: location?.state ? { [location.state]: 1 } : {},
          timestamp: Timestamp.now(),
        };
        
        await updateDoc(docRef, newStats);
      }
    } catch (error) {
      console.error('Error tracking visitor:', error);
      // Don't throw - analytics shouldn't break the app
    }
  }

  static async getVisitorStats(days = 7): Promise<VisitorStats[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const q = query(
        collection(db, this.visitorCollection),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisitorStats[];
    } catch (error) {
      console.error('Error getting visitor stats:', error);
      throw error;
    }
  }

  static async recordSystemMetrics(metrics: Omit<SystemMetrics, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, this.metricsCollection), {
        ...metrics,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error recording system metrics:', error);
    }
  }
}

// File Upload Service
class FileServiceClass {
  static async uploadImage(
    file: File, 
    path: string, 
    userId: string
  ): Promise<string> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Create unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `${userId}_${timestamp}.${extension}`;
      const storageRef = ref(storage, `${path}/${filename}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

// Real-time updates and error handling
class DatabaseServiceClass {
  static async healthCheck(): Promise<boolean> {
    try {
      const testDoc = doc(db, 'health', 'check');
      await updateDoc(testDoc, {
        timestamp: Timestamp.now(),
        status: 'healthy'
      }).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'health'), {
          timestamp: Timestamp.now(),
          status: 'healthy'
        });
      });
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  static async getSystemStatus(): Promise<{
    database: boolean;
    storage: boolean;
    auth: boolean;
  }> {
    try {
      const dbStatus = await this.healthCheck();
      
      // Test storage
      let storageStatus = true;
      try {
        const testRef = ref(storage, 'health/test.txt');
        // Just check if we can create a reference (doesn't upload)
      } catch {
        storageStatus = false;
      }

      return {
        database: dbStatus,
        storage: storageStatus,
        auth: true, // If we can call this function, auth is working
      };
    } catch (error) {
      console.error('Error checking system status:', error);
      return {
        database: false,
        storage: false,
        auth: false,
      };
    }
  }
}

// Create singleton instances
export const UserService = new UserServiceClass();
export const CommunityService = new CommunityServiceClass();
export const AnalyticsService = new AnalyticsServiceClass();
export const FileService = new FileServiceClass();
export const DatabaseService = new DatabaseServiceClass();

// Export the classes as well for type checking
export { UserServiceClass, CommunityServiceClass, AnalyticsServiceClass, FileServiceClass, DatabaseServiceClass };