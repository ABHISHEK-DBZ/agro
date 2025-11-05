import React from 'react';
import { toast } from 'react-hot-toast';

// Mock Google login for demo purposes
export const mockGoogleLogin = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUser = {
        uid: 'demo-user-123',
        email: 'demo@example.com',
        displayName: 'Demo Farmer',
        photoURL: 'https://via.placeholder.com/150',
        emailVerified: true
      };
      
      // Simulate successful login
      toast.success('Google से सफलतापूर्वक लॉगिन हो गए! (Demo Mode)');
      resolve(mockUser);
    }, 1000);
  });
};

// Mock Firebase auth state for demo
export const mockAuthState = {
  user: null,
  loading: false,
  signInWithGoogle: mockGoogleLogin
};