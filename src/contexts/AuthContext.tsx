import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-hot-toast';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'farmer' | 'expert' | 'admin';
  location?: {
    state: string;
    district: string;
    village?: string;
  };
  farmingType?: string[];
  experience?: number;
  landSize?: number;
  crops?: string[];
  verified: boolean;
  soilPh?: number;
  soilN?: number;
  soilP?: number;
  soilK?: number;
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      weather: boolean;
      prices: boolean;
      schemes: boolean;
      community: boolean;
    };
  };
  stats: {
    postsCount: number;
    questionsCount: number;
    answersCount: number;
    helpfulVotes: number;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Profile methods
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  
  // Verification
  sendVerificationEmail: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Additional parameters for better popup handling
  display: 'popup',
  login_hint: '',
  access_type: 'online'
});

// Add required scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

const githubProvider = new GithubAuthProvider();
githubProvider.setCustomParameters({
  allow_signup: 'true'
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await loadUserProfile(user.uid);
        await updateLastLogin(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle redirect results from Google sign-in
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('✅ Google redirect login successful:', result.user.email);
          setLoading(true); // Show loading state while processing
          
          // Check if user profile exists
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          if (!userDoc.exists()) {
            console.log('👤 Creating new user profile from redirect...');
            await createUserProfile(result.user);
          } else {
            console.log('👤 Loading existing user profile from redirect...');
            setUserProfile(userDoc.data() as UserProfile);
          }
          
          toast.success('Google से सफलतापूर्वक लॉगिन हो गए! 🎉');
          
          // Navigate to dashboard after successful authentication
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
            window.location.href = '/dashboard';
          }
        }
      } catch (error: any) {
        console.error('❌ Redirect result error:', error);
        if (error.code !== 'auth/null-user') {
          toast.error(`साइन-इन त्रुटि: ${getAuthErrorMessage(error.code)}`);
        }
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  // Load user profile from Firestore
  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLoginAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    const userRef = doc(db, 'users', user.uid);
    
    const defaultProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || undefined,
      role: 'farmer',
      verified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      preferences: {
        language: 'hi',
        theme: 'auto',
        notifications: {
          weather: true,
          prices: true,
          schemes: true,
          community: true
        }
      },
      stats: {
        postsCount: 0,
        questionsCount: 0,
        answersCount: 0,
        helpfulVotes: 0
      },
      ...additionalData
    };

    await setDoc(userRef, defaultProfile);
    setUserProfile(defaultProfile);
  };

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Demo Account Bypass
      if (email === 'demo@example.com' && password === 'password123') {
        const mockUser = {
          uid: 'demo-user-123',
          email: 'demo@example.com',
          displayName: 'Demo Farmer (डेमो किसान)',
          photoURL: 'https://api.dicebear.com/8.x/initials/svg?seed=Demo%20Farmer&backgroundColor=22c55e',
          emailVerified: true
        } as User;

        setUser(mockUser);

        // Load default mock profile in context
        const mockProfile: UserProfile = {
          uid: 'demo-user-123',
          email: 'demo@example.com',
          displayName: 'Demo Farmer (डेमो किसान)',
          photoURL: 'https://api.dicebear.com/8.x/initials/svg?seed=Demo%20Farmer&backgroundColor=22c55e',
          role: 'farmer',
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            language: 'hi',
            theme: 'light',
            notifications: {
              weather: true,
              prices: true,
              schemes: true,
              community: true
            }
          },
          stats: {
            postsCount: 5,
            questionsCount: 2,
            answersCount: 1,
            helpfulVotes: 10
          }
        };
        setUserProfile(mockProfile);

        // Save profile in localStorage for PWA offline capability
        localStorage.setItem('userProfile', JSON.stringify(mockProfile));

        toast.success('डेमो लॉगिन सफल! (Demo Bypass Active) 🌱');
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      toast.success('सफलतापूर्वक लॉगिन हो गए!');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register with email/password
  const register = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (userData.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }
      
      // Create user profile
      await createUserProfile(user, userData);
      
      // Send verification email
      await sendEmailVerification(user);
      
      toast.success('खाता सफलतापूर्वक बनाया गया! कृपया अपना ईमेल सत्यापित करें।');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('🔥 Attempting Google login with real Firebase...');
      
      // Use redirect method for development to avoid popup issues
      const isDevelopment = import.meta.env.MODE === 'development';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isDevelopment || isLocalhost) {
        console.log('🔄 Using redirect method for development environment...');
        await signInWithRedirect(auth, googleProvider);
        // The redirect will handle the rest, so we return here
        return;
      }
      
      // For production, try popup first with fallback to redirect
      try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        console.log('✅ Google popup login successful:', userCredential.user.email);
        
        const user = userCredential.user;
        
        // Check if user profile exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.log('👤 Creating new user profile...');
          await createUserProfile(user);
        } else {
          console.log('👤 Loading existing user profile...');
          setUserProfile(userDoc.data() as UserProfile);
        }
        
        toast.success('Google से सफलतापूर्वक लॉगिन हो गए!');
      } catch (popupError: any) {
        console.log('⚠️ Popup failed, using redirect method...', popupError.code);
        await signInWithRedirect(auth, googleProvider);
        return;
      }
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      
      // Handle specific errors
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Google साइन-इन रद्द किया गया। Redirect method का उपयोग कर रहे हैं...');
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          console.error('❌ Redirect also failed:', redirectError);
        }
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Google साइन-इन सक्षम नहीं है। कृपया Firebase Console में enable करें।');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('यह डोमेन Google साइन-इन के लिए अधिकृत नहीं है।');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('नेटवर्क त्रुटि। इंटरनेट कनेक्शन जांचें।');
      } else {
        const errorMessage = getAuthErrorMessage(error.code);
        toast.error(`Google साइन-इन त्रुटि: ${errorMessage}`);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with GitHub
  const loginWithGitHub = async () => {
    try {
      setLoading(true);
      const { user } = await signInWithPopup(auth, githubProvider);
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await createUserProfile(user);
      }
      
      toast.success('GitHub से सफलतापूर्वक लॉगिन हो गए!');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('सफलतापूर्वक लॉगआउट हो गए!');
    } catch (error: any) {
      toast.error('लॉगआउट में त्रुटि हुई।');
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updateData });
      }
      
      // Update Firebase Auth profile if needed
      if (data.displayName || data.photoURL) {
        await updateProfile(user, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL
        });
      }
      
      toast.success('प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!');
    } catch (error: any) {
      toast.error('प्रोफ़ाइल अपडेट में त्रुटि हुई।');
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('पासवर्ड रीसेट लिंक भेजा गया!');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('User not authenticated');
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      toast.success('पासवर्ड सफलतापूर्वक बदला गया!');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async (password: string) => {
    if (!user || !user.email) throw new Error('User not authenticated');
    
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Delete user data from Firestore
      // Note: In production, this should be done via Cloud Functions
      
      // Delete user account
      await deleteUser(user);
      toast.success('खाता सफलतापूर्वक हटाया गया।');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await sendEmailVerification(user);
      toast.success('सत्यापन ईमेल भेजा गया!');
    } catch (error: any) {
      toast.error('सत्यापन ईमेल भेजने में त्रुटि हुई।');
      throw error;
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!user) return;
    await loadUserProfile(user.uid);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    register,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    updateUserProfile,
    resetPassword,
    changePassword,
    deleteAccount,
    sendVerificationEmail,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'यह ईमेल पंजीकृत नहीं है।';
    case 'auth/wrong-password':
      return 'गलत पासवर्ड।';
    case 'auth/email-already-in-use':
      return 'यह ईमेल पहले से उपयोग में है।';
    case 'auth/weak-password':
      return 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए।';
    case 'auth/invalid-email':
      return 'अमान्य ईमेल पता।';
    case 'auth/too-many-requests':
      return 'बहुत सारे असफल प्रयास। कुछ समय बाद कोशिश करें।';
    case 'auth/network-request-failed':
      return 'नेटवर्क त्रुटि। इंटरनेट कनेक्शन जांचें।';
    case 'auth/popup-closed-by-user':
      return 'साइन-इन रद्द किया गया।';
    case 'auth/account-exists-with-different-credential':
      return 'यह ईमेल दूसरे तरीके से पंजीकृत है।';
    case 'auth/operation-not-allowed':
      return 'यह साइन-इन विधि सक्षम नहीं है।';
    case 'auth/unauthorized-domain':
      return 'यह डोमेन साइन-इन के लिए अधिकृत नहीं है।';
    case 'auth/popup-blocked':
      return 'पॉप-अप ब्लॉक किया गया। कृपया पॉप-अप अनुमति दें।';
    case 'auth/cancelled-popup-request':
      return 'साइन-इन प्रक्रिया रद्द की गई।';
    default:
      return 'लॉगिन में त्रुटि हुई। कृपया पुनः प्रयास करें।';
  }
};