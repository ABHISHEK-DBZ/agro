import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  increment
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { User } from 'firebase/auth';

// User Profile Interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'farmer' | 'expert' | 'student';
  state: string;
  district: string;
  village?: string;
  experience: number; // years
  expertise?: string[]; // crops/topics
  bio?: string;
  avatar?: string;
  reputation: number;
  joined: Date;
  lastActive: Date;
  stats: {
    totalPosts: number;
    totalReplies: number;
    helpfulVotes: number;
    questionsAsked: number;
    questionsAnswered: number;
    verifiedAnswers: number;
  };
  verified: boolean;
  publicProfile: boolean;
  photoURL?: string;
  primaryCrops?: string[];
  language?: string;
  soilPh?: number;
  soilN?: number;
  soilP?: number;
  soilK?: number;
  notifications?: {
    weather?: boolean;
    prices?: boolean;
  };
  dataSync?: {
    autoSync?: boolean;
    offlineMode?: boolean;
  };
}

// User Settings Interface
export interface UserSettings {
  userId: string;
  notifications: {
    weatherAlerts: boolean;
    marketPriceUpdates: boolean;
    diseaseAlerts: boolean;
    governmentSchemes: boolean;
    cropAdvice: boolean;
    communityReplies: boolean;
    expertAnswers: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'pa';
    fontSize: 'small' | 'medium' | 'large';
    colorTheme: 'green' | 'blue' | 'purple' | 'orange';
  };
  privacy: {
    shareLocation: boolean;
    publicProfile: boolean;
    showOnlineStatus: boolean;
    showActivity: boolean;
    twoFactorAuth: boolean;
    loginNotifications: boolean;
  };
  data: {
    autoSync: boolean;
    offlineMode: boolean;
    cacheSize: number; // MB
    lastSync?: Date;
  };
}

class ProfileService {
  // Create or update user profile
  async createUserProfile(user: User, additionalData: Partial<UserProfile> = {}): Promise<UserProfile> {
    const userRef = doc(db, 'users', user.uid);
    
    const profileData: UserProfile = {
      id: user.uid,
      name: additionalData.name || user.displayName || 'User',
      email: user.email || '',
      phone: user.phoneNumber || additionalData.phone || '',
      role: additionalData.role || 'farmer',
      state: additionalData.state || '',
      district: additionalData.district || '',
      village: additionalData.village || '',
      experience: additionalData.experience || 0,
      expertise: additionalData.expertise || [],
      bio: additionalData.bio || '',
      avatar: additionalData.avatar || user.photoURL || '',
      reputation: 0,
      joined: new Date(),
      lastActive: new Date(),
      stats: {
        totalPosts: 0,
        totalReplies: 0,
        helpfulVotes: 0,
        questionsAsked: 0,
        questionsAnswered: 0,
        verifiedAnswers: 0,
      },
      verified: false,
      publicProfile: true,
    };

    await setDoc(userRef, {
      ...profileData,
      joined: Timestamp.fromDate(profileData.joined),
      lastActive: Timestamp.fromDate(profileData.lastActive),
    });

    // Initialize default settings
    await this.initializeSettings(user.uid);
    
    return profileData;
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (userId === 'demo-user-123') {
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            joined: parsed.joined ? new Date(parsed.joined) : new Date(),
            lastActive: new Date()
          } as UserProfile;
        } catch (e) {}
      }
      return {
        id: 'demo-user-123',
        name: 'Demo Farmer (डेमो किसान)',
        email: 'demo@example.com',
        phone: '+91 98765 43210',
        role: 'farmer',
        state: 'Maharashtra',
        district: 'Pune',
        village: 'Khed',
        experience: 12,
        expertise: ['Organic Farming', 'Crop Rotation'],
        bio: 'मी एक प्रगतीशील शेतकरी आहे आणि जैविक शेती करतो.',
        avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Demo%20Farmer&backgroundColor=22c55e',
        reputation: 150,
        joined: new Date(),
        lastActive: new Date(),
        stats: {
          totalPosts: 5,
          totalReplies: 3,
          helpfulVotes: 10,
          questionsAsked: 2,
          questionsAnswered: 1,
          verifiedAnswers: 1,
        },
        verified: true,
        publicProfile: true,
        soilPh: 6.5,
        soilN: 140,
        soilP: 48,
        soilK: 220
      } as UserProfile;
    }
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          joined: data.joined?.toDate(),
          lastActive: data.lastActive?.toDate(),
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (userId === 'demo-user-123') {
      const current = await this.getUserProfile(userId);
      const merged = { ...current, ...updates };
      localStorage.setItem('userProfile', JSON.stringify(merged));
      return;
    }
    try {
      const userRef = doc(db, 'users', userId);
      
      // Convert Date objects to Timestamps
      const updateData: any = { ...updates };
      if (updates.lastActive) {
        updateData.lastActive = Timestamp.fromDate(updates.lastActive);
      }

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Subscribe to real-time profile updates
  subscribeToProfile(userId: string, callback: (profile: UserProfile) => void): () => void {
    if (userId === 'demo-user-123') {
      this.getUserProfile(userId).then(profile => {
        if (profile) callback(profile);
      });
      return () => {};
    }
    const userRef = doc(db, 'users', userId);
    
    return onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const profile: UserProfile = {
          ...data,
          joined: data.joined?.toDate(),
          lastActive: data.lastActive?.toDate(),
        } as UserProfile;
        callback(profile);
      }
    });
  }

  // Update user stats
  async updateUserStats(userId: string, statType: keyof UserProfile['stats']): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`stats.${statType}`]: increment(1),
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  // Update reputation
  async updateReputation(userId: string, points: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        reputation: increment(points),
      });
    } catch (error) {
      console.error('Error updating reputation:', error);
    }
  }

  // Mark user as verified
  async verifyUser(userId: string, verified: boolean): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { verified });
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  // Initialize default settings
  async initializeSettings(userId: string): Promise<void> {
    const settingsRef = doc(db, 'settings', userId);
    
    const defaultSettings: UserSettings = {
      userId,
      notifications: {
        weatherAlerts: true,
        marketPriceUpdates: true,
        diseaseAlerts: true,
        governmentSchemes: true,
        cropAdvice: true,
        communityReplies: true,
        expertAnswers: true,
        pushEnabled: false,
        emailEnabled: true,
        smsEnabled: false,
      },
      appearance: {
        theme: 'system',
        language: 'hi',
        fontSize: 'medium',
        colorTheme: 'green',
      },
      privacy: {
        shareLocation: true,
        publicProfile: true,
        showOnlineStatus: true,
        showActivity: true,
        twoFactorAuth: false,
        loginNotifications: true,
      },
      data: {
        autoSync: true,
        offlineMode: true,
        cacheSize: 50,
      },
    };

    await setDoc(settingsRef, defaultSettings);
  }

  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    if (userId === 'demo-user-123') {
      const stored = localStorage.getItem('userSettings');
      if (stored) {
        try {
          return JSON.parse(stored) as UserSettings;
        } catch (e) {}
      }
      return {
        userId: 'demo-user-123',
        notifications: {
          weatherAlerts: true,
          marketPriceUpdates: true,
          diseaseAlerts: true,
          governmentSchemes: true,
          cropAdvice: true,
          communityReplies: true,
          expertAnswers: true,
          pushEnabled: false,
          emailEnabled: true,
          smsEnabled: false
        },
        appearance: {
          theme: 'light',
          language: 'hi',
          fontSize: 'medium',
          colorTheme: 'green'
        },
        privacy: {
          shareLocation: true,
          publicProfile: true,
          showOnlineStatus: true,
          showActivity: true,
          twoFactorAuth: false,
          loginNotifications: true
        },
        data: {
          autoSync: true,
          offlineMode: true,
          cacheSize: 50,
          lastSync: new Date()
        }
      } as UserSettings;
    }
    try {
      const settingsRef = doc(db, 'settings', userId);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        return {
          ...data,
          data: {
            ...data.data,
            lastSync: data.data?.lastSync?.toDate(),
          },
        } as UserSettings;
      }
      return null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  // Update user settings
  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    if (userId === 'demo-user-123') {
      const current = await this.getUserSettings(userId);
      const merged = { 
        ...current, 
        ...updates,
        notifications: { ...current?.notifications, ...updates.notifications },
        appearance: { ...current?.appearance, ...updates.appearance },
        privacy: { ...current?.privacy, ...updates.privacy },
        data: { ...current?.data, ...updates.data }
      };
      localStorage.setItem('userSettings', JSON.stringify(merged));
      return;
    }
    try {
      const settingsRef = doc(db, 'settings', userId);
      await setDoc(settingsRef, updates, { merge: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  // Subscribe to real-time settings updates
  subscribeToSettings(userId: string, callback: (settings: UserSettings) => void): () => void {
    if (userId === 'demo-user-123') {
      this.getUserSettings(userId).then(settings => {
        if (settings) callback(settings);
      });
      return () => {};
    }
    const settingsRef = doc(db, 'settings', userId);
    
    return onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const settings: UserSettings = {
          ...data,
          data: {
            ...data.data,
            lastSync: data.data?.lastSync?.toDate(),
          },
        } as UserSettings;
        callback(settings);
      }
    });
  }

  // Update last active timestamp
  async updateLastActive(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastActive: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  }

  // Export user data
  async exportUserData(userId: string): Promise<{ profile: UserProfile; settings: UserSettings }> {
    try {
      const [profile, settings] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserSettings(userId),
      ]);

      if (!profile || !settings) {
        throw new Error('User data not found');
      }

      return { profile, settings };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Import user data
  async importUserData(
    userId: string, 
    data: { profile: Partial<UserProfile>; settings: Partial<UserSettings> }
  ): Promise<void> {
    try {
      const batch: Promise<void>[] = [];

      if (data.profile) {
        batch.push(this.updateUserProfile(userId, data.profile));
      }

      if (data.settings) {
        batch.push(this.updateUserSettings(userId, data.settings));
      }

      await Promise.all(batch);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Search users by criteria
  async searchUsers(criteria: {
    role?: string;
    state?: string;
    expertise?: string;
    minReputation?: number;
  }): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef);

      if (criteria.role) {
        q = query(usersRef, where('role', '==', criteria.role));
      }
      if (criteria.state) {
        q = query(usersRef, where('state', '==', criteria.state));
      }
      if (criteria.minReputation) {
        q = query(usersRef, where('reputation', '>=', criteria.minReputation));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          joined: data.joined?.toDate(),
          lastActive: data.lastActive?.toDate(),
        } as UserProfile;
      });
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Clear cache (simulated)
  async clearCache(userId: string): Promise<void> {
    try {
      const settingsRef = doc(db, 'settings', userId);
      await updateDoc(settingsRef, {
        'data.cacheSize': 0,
        'data.lastSync': Timestamp.now(),
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default new ProfileService();
