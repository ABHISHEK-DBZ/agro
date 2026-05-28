import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';
import profileService from '../services/profileService';
import type { UserSettings } from '../services/profileService';

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings fallback for when Firestore is unreachable
const getDefaultSettings = (userId: string): UserSettings => ({
  userId,
  notifications: {
    weatherAlerts: true,
    marketPriceUpdates: true,
    diseaseAlerts: true,
    governmentSchemes: true,
    cropAdvice: true,
    communityReplies: true,
    expertAnswers: true,
    pushEnabled: true,
    emailEnabled: false,
    smsEnabled: false,
  },
  appearance: {
    theme: 'light',
    language: 'hi',
    fontSize: 'medium',
    colorTheme: 'green',
  },
  privacy: {
    shareLocation: false,
    publicProfile: true,
    showOnlineStatus: true,
    showActivity: true,
    twoFactorAuth: false,
    loginNotifications: true,
  },
  data: {
    autoSync: true,
    offlineMode: false,
    cacheSize: 50,
  },
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const initSettings = async () => {
      try {
        setLoading(true);

        // Set a timeout to provide default settings if Firestore is too slow
        timeoutId = setTimeout(() => {
          if (!settings) {
            console.warn('⚠️ Firestore settings load timed out, using local defaults');
            setSettings(getDefaultSettings(user.uid));
            setLoading(false);
          }
        }, 5000);

        // Check if settings exist
        let userSettings = await profileService.getUserSettings(user.uid);

        // If no settings, initialize them
        if (!userSettings) {
          try {
            await profileService.initializeSettings(user.uid);
            userSettings = await profileService.getUserSettings(user.uid);
          } catch (initError) {
            console.warn('⚠️ Could not initialize settings in Firestore, using defaults');
            userSettings = getDefaultSettings(user.uid);
          }
        }

        // Clear the timeout since we loaded successfully
        if (timeoutId) clearTimeout(timeoutId);

        // Set initial settings
        if (userSettings) {
          setSettings(userSettings);
        } else {
          setSettings(getDefaultSettings(user.uid));
        }

        // Subscribe to real-time updates
        try {
          unsubscribe = profileService.subscribeToSettings(user.uid, (updatedSettings) => {
            if (updatedSettings) {
              setSettings(updatedSettings);

              // Apply appearance settings
              if (updatedSettings.appearance) {
                // Language - force immediate change and reload
                if (updatedSettings.appearance.language) {
                  const currentLang = i18n.language;
                  if (currentLang !== updatedSettings.appearance.language) {
                    i18n.changeLanguage(updatedSettings.appearance.language).then(() => {
                      // Force re-render of all components
                      window.dispatchEvent(new Event('languagechange'));
                      console.log('Language changed to:', updatedSettings.appearance.language);
                    });
                  }
                }

                // Theme
                if (updatedSettings.appearance.theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (updatedSettings.appearance.theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  // System preference
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (prefersDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }

                // Font size
                if (updatedSettings.appearance.fontSize) {
                  document.documentElement.style.fontSize = 
                    updatedSettings.appearance.fontSize === 'small' ? '14px' :
                    updatedSettings.appearance.fontSize === 'large' ? '18px' : '16px';
                }
              }
            }
          });
        } catch (subError) {
          console.warn('⚠️ Real-time settings subscription failed, using static settings');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing settings:', error);
        // Always provide defaults on error so pages don't hang
        setSettings(getDefaultSettings(user.uid));
        setLoading(false);
      }
    };

    initSettings();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, i18n]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;

    const currentSettings = settings || getDefaultSettings(user.uid);

    try {
      // Apply language change immediately for instant feedback
      if (updates.appearance?.language && updates.appearance.language !== i18n.language) {
        await i18n.changeLanguage(updates.appearance.language);
        window.dispatchEvent(new Event('languagechange'));
        console.log('Language immediately changed to:', updates.appearance.language);
      }

      // Update local state immediately for instant feedback
      const mergedSettings: UserSettings = {
        ...currentSettings,
        ...updates,
        notifications: {
          ...currentSettings.notifications,
          ...(updates.notifications || {})
        },
        appearance: {
          ...currentSettings.appearance,
          ...(updates.appearance || {})
        },
        privacy: {
          ...currentSettings.privacy,
          ...(updates.privacy || {})
        },
        data: {
          ...currentSettings.data,
          ...(updates.data || {})
        }
      };
      setSettings(mergedSettings);

      // Try to persist to Firestore (non-blocking)
      try {
        await profileService.updateUserSettings(user.uid, updates);
      } catch (persistError) {
        console.warn('⚠️ Could not persist settings to Firestore, saved locally only');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    if (!user) return;

    try {
      const userSettings = await profileService.getUserSettings(user.uid);
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
