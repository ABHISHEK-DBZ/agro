// Authentication Context & Provider
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeFirebase, getFirebaseAuth, getFirestoreDB } from '../config/firebase';
import { UserProfile } from '../types';
import storageService, { KEYS } from '../services/storage';

/**
 * IMPORTANT: We use getter functions (getFirebaseAuth, getFirestoreDB) instead of
 * destructured imports ({ auth, db }) because Metro/CommonJS creates local copies
 * at import time. The getters always return the current value from the module.
 */

// Configure Google Sign-In safely to prevent startup crashes when webClientId is empty
try {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (webClientId) {
    GoogleSignin.configure({
      webClientId,
      offlineAccess: true,
    });
  } else {
    console.warn('[Google Sign-In] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not configured. Google Sign-In is disabled.');
  }
} catch (error) {
  console.error('[Google Sign-In] Failed to configure:', error);
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const createUserProfileDoc = async (user: User, additionalData?: Partial<UserProfile>) => {
  const firestore = getFirestoreDB();
  if (!firestore) throw new Error('Firestore not initialized');
  const userRef = doc(firestore, 'users', user.uid);

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || additionalData?.displayName || '',
    photoURL: user.photoURL || undefined,
    role: 'farmer',
    verified: user.emailVerified,
    preferences: {
      language: 'hi',
      theme: 'light',
      notifications: {
        weather: true,
        prices: true,
        schemes: true,
        community: true,
        disease: true,
      },
    },
    stats: {
      postsCount: 0,
      questionsCount: 0,
      answersCount: 0,
      helpfulVotes: 0,
      joinDate: new Date(),
      lastActive: new Date(),
    },
    ...additionalData,
    createdAt: new Date(),
  };

  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  return profile;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize Firebase on mount — MUST await before setting initialized
  useEffect(() => {
    (async () => {
      try {
        const fb = await initializeFirebase();
        if (fb.auth) {
          console.log('[Auth] Firebase initialized with persistence');
        }
      } catch (e) {
        console.error('[Auth] Firebase init error:', e);
      }
      setInitialized(true);
    })();
  }, []);

  useEffect(() => {
    const _auth = getFirebaseAuth();
    const _db = getFirestoreDB();

    if (!initialized || !_auth) {
      if (initialized && !_auth) {
        console.warn('[Auth] Firebase auth not available');
        setLoading(false);
      }
      return;
    }

    console.log('[Auth] Setting up onAuthStateChanged listener');
    const unsubscribe = onAuthStateChanged(_auth, async (firebaseUser) => {
      console.log('[Auth] Auth state changed:', firebaseUser?.uid || 'null');
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          if (_db) {
            const docSnap = await getDoc(doc(_db, 'users', firebaseUser.uid));
            if (docSnap.exists()) {
              const profile = docSnap.data() as UserProfile;
              setUserProfile(profile);
              await storageService.setItem(KEYS.USER_PROFILE, profile);
            }
          }
        } catch (error) {
          console.error('[Auth] Error loading profile:', error);
        }
      } else {
        setUserProfile(null);
        await storageService.removeItem(KEYS.USER_PROFILE);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [initialized]);

  const login = useCallback(async (email: string, password: string) => {
    const _auth = getFirebaseAuth();
    if (!_auth) throw new Error('Firebase not initialized');
    await signInWithEmailAndPassword(_auth, email, password);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const _auth = getFirebaseAuth();
    const _db = getFirestoreDB();
    if (!_auth || !_db) throw new Error('Firebase not initialized');

    const credential = await createUserWithEmailAndPassword(_auth, email, password);
    const { user: newUser } = credential;

    await updateProfile(newUser, { displayName });
    await createUserProfileDoc(newUser, { displayName });

    setUserProfile(prev => prev ? { ...prev, displayName } : null);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const googleUser = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(googleUser.data?.idToken || '');
      const _auth = getFirebaseAuth();
      const _db = getFirestoreDB();
      if (!_auth || !_db) throw new Error('Firebase not initialized');
      const credential = await signInWithCredential(_auth, googleCredential);

      // Check if profile exists
      const docSnap = await getDoc(doc(_db, 'users', credential.user.uid));
      if (!docSnap.exists()) {
        await createUserProfileDoc(credential.user);
      }
    } catch (error: any) {
      if (error.code !== '-100') {
        // User cancelled
        throw error;
      }
    }
  }, []);

  const logout = useCallback(async () => {
    const _auth = getFirebaseAuth();
    if (!_auth) throw new Error('Firebase not initialized');
    await signOut(_auth);
    setUserProfile(null);
    // Clear only user data, NOT onboarding or language preferences
    const keys = await storageService.getAllKeys();
    const preserve = ['@krishi_onboarding_done', '@krishi_language', '@krishi_settings_data'];
    for (const key of keys) {
      if (!preserve.includes(key)) {
        await storageService.removeItem(key);
      }
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const _auth = getFirebaseAuth();
    if (!_auth) throw new Error('Firebase not initialized');
    await sendPasswordResetEmail(_auth, email);
  }, []);

  const updateUserProfileCb = useCallback(async (data: Partial<UserProfile>) => {
    const _db = getFirestoreDB();
    if (!user || !_db) throw new Error('Not authenticated');

    const userRef = doc(_db, 'users', user.uid);
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });

    setUserProfile(prev => prev ? { ...prev, ...data } : null);
  }, [user]);

  const refreshProfile = useCallback(async () => {
    const _db = getFirestoreDB();
    if (!user || !_db) return;
    const docSnap = await getDoc(doc(_db, 'users', user.uid));
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfile);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    initialized,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile: updateUserProfileCb,
    resetPassword,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
