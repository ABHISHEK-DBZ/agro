/**
 * Capacitor Native Plugins Integration
 * Provides wrapper functions for all native device features
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';
import { Share } from '@capacitor/share';

// ============================================
// CAMERA FUNCTIONS
// ============================================

/**
 * Take a photo using device camera
 */
export const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    
    return {
      success: true,
      imageUrl: image.webPath,
      format: image.format
    };
  } catch (error) {
    console.error('Camera error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to take photo'
    };
  }
};

/**
 * Pick image from gallery
 */
export const pickImage = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });
    
    return {
      success: true,
      imageUrl: image.dataUrl || image.webPath,
      format: image.format
    };
  } catch (error) {
    console.error('Gallery error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pick image'
    };
  }
};

// ============================================
// GEOLOCATION FUNCTIONS
// ============================================

/**
 * Get current GPS coordinates
 */
export const getCurrentLocation = async (): Promise<{
  success: boolean;
  position?: Position;
  error?: string;
}> => {
  try {
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
    
    return {
      success: true,
      position: coordinates
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get location'
    };
  }
};

/**
 * Watch position changes (live tracking)
 */
export const watchPosition = (callback: (position: Position) => void) => {
  const watchId = Geolocation.watchPosition(
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    },
    (position, err) => {
      if (err) {
        console.error('Position watch error:', err);
        return;
      }
      if (position) {
        callback(position);
      }
    }
  );
  
  return watchId;
};

/**
 * Stop watching position
 */
export const clearWatch = async (watchId: string) => {
  await Geolocation.clearWatch({ id: watchId });
};

// ============================================
// PUSH NOTIFICATIONS
// ============================================

/**
 * Initialize and request push notification permissions
 */
export const initPushNotifications = async () => {
  try {
    // Request permission
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    
    if (permStatus.receive !== 'granted') {
      throw new Error('Push notification permission denied');
    }
    
    // Register with APNs / FCM
    await PushNotifications.register();
    
    // Listen for registration
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
      // Send token to backend server
      localStorage.setItem('fcm_token', token.value);
    });
    
    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });
    
    // Listen for push notifications
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push received:', notification);
        // Handle notification when app is in foreground
      }
    );
    
    // Listen for notification taps
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('Push action performed:', notification);
        // Handle notification tap
      }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Push notification init error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to init push notifications'
    };
  }
};

/**
 * Send local notification
 */
export const sendLocalNotification = async (title: string, body: string) => {
  try {
    await PushNotifications.createChannel({
      id: 'krishi_alerts',
      name: 'Krishi Alerts',
      description: 'Important agricultural alerts and updates',
      importance: 5,
      visibility: 1,
      sound: 'default'
    });
    
    // Note: Local notifications require additional plugin
    // This is a placeholder for the notification structure
    console.log('Local notification:', { title, body });
    
    return { success: true };
  } catch (error) {
    console.error('Local notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification'
    };
  }
};

// ============================================
// APP LIFECYCLE
// ============================================

/**
 * Initialize app lifecycle listeners
 */
export const initAppListeners = () => {
  // Listen for app state changes
  App.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Is active:', isActive);
    if (isActive) {
      // App came to foreground - refresh data
      window.dispatchEvent(new CustomEvent('app-resumed'));
    }
  });
  
  // Listen for back button on Android
  App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp();
    } else {
      window.history.back();
    }
  });
  
  // Listen for deep links
  App.addListener('appUrlOpen', (data) => {
    console.log('App opened with URL:', data.url);
    // Handle deep link navigation
  });
};

/**
 * Get app info
 */
export const getAppInfo = async () => {
  const info = await App.getInfo();
  return info;
};

// ============================================
// SPLASH SCREEN
// ============================================

/**
 * Hide splash screen
 */
export const hideSplashScreen = async () => {
  await SplashScreen.hide();
};

/**
 * Show splash screen
 */
export const showSplashScreen = async () => {
  await SplashScreen.show({
    showDuration: 2000,
    autoHide: true
  });
};

// ============================================
// STATUS BAR
// ============================================

/**
 * Configure status bar
 */
export const setupStatusBar = async (color: string = '#16a34a', isDark: boolean = true) => {
  try {
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color });
    await StatusBar.show();
  } catch (error) {
    console.error('Status bar error:', error);
  }
};

/**
 * Hide status bar
 */
export const hideStatusBar = async () => {
  await StatusBar.hide();
};

// ============================================
// KEYBOARD
// ============================================

/**
 * Show keyboard
 */
export const showKeyboard = async () => {
  await Keyboard.show();
};

/**
 * Hide keyboard
 */
export const hideKeyboard = async () => {
  await Keyboard.hide();
};

/**
 * Listen for keyboard events
 */
export const initKeyboardListeners = () => {
  Keyboard.addListener('keyboardWillShow', (info) => {
    console.log('Keyboard will show with height:', info.keyboardHeight);
    document.body.style.paddingBottom = `${info.keyboardHeight}px`;
  });
  
  Keyboard.addListener('keyboardWillHide', () => {
    console.log('Keyboard will hide');
    document.body.style.paddingBottom = '0px';
  });
};

// ============================================
// NETWORK
// ============================================

/**
 * Get network status
 */
export const getNetworkStatus = async () => {
  const status = await Network.getStatus();
  return {
    connected: status.connected,
    connectionType: status.connectionType
  };
};

/**
 * Listen for network changes
 */
export const initNetworkListener = (callback: (connected: boolean) => void) => {
  Network.addListener('networkStatusChange', (status) => {
    console.log('Network status changed:', status);
    callback(status.connected);
  });
};

// ============================================
// SHARE
// ============================================

/**
 * Share content
 */
export const shareContent = async (title: string, text: string, url?: string) => {
  try {
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Share via'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Share error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share'
    };
  }
};

// ============================================
// PLATFORM DETECTION
// ============================================

/**
 * Check if running on native platform
 */
export const isNativePlatform = () => {
  return (
    typeof window !== 'undefined' &&
    window.Capacitor &&
    window.Capacitor.isNativePlatform()
  );
};

/**
 * Get platform name
 */
export const getPlatform = () => {
  if (typeof window !== 'undefined' && window.Capacitor) {
    return window.Capacitor.getPlatform();
  }
  return 'web';
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all Capacitor plugins
 */
export const initializeCapacitor = async () => {
  if (!isNativePlatform()) {
    console.log('Running on web platform, skipping native plugin initialization');
    return;
  }
  
  console.log('Initializing Capacitor plugins...');
  
  try {
    // Setup status bar
    await setupStatusBar('#16a34a', true);
    
    // Hide splash screen after 2 seconds
    setTimeout(() => {
      hideSplashScreen();
    }, 2000);
    
    // Initialize app listeners
    initAppListeners();
    
    // Initialize keyboard listeners
    initKeyboardListeners();
    
    // Initialize push notifications (safely check configuration to prevent startup crashes)
    try {
      const enablePush = localStorage.getItem('enable_push_notifications') === 'true';
      if (enablePush) {
        await initPushNotifications();
      } else {
        console.log('[Capacitor] Push notifications are disabled for testing. Enable by setting localStorage "enable_push_notifications" to "true" if google-services.json is configured.');
      }
    } catch (pushError) {
      console.warn('[Capacitor] Failed to initialize push notifications:', pushError);
    }
    
    // Initialize network listener
    initNetworkListener((connected) => {
      if (!connected) {
        console.warn('Network connection lost');
      } else {
        console.log('Network connection restored');
      }
    });
    
    console.log('Capacitor plugins initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

// Type augmentation for Capacitor on window
declare global {
  interface Window {
    Capacitor: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
  }
}
