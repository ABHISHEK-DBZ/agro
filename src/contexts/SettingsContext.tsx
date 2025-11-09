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

    const initSettings = async () => {
      try {
        setLoading(true);

        // Check if settings exist
        let userSettings = await profileService.getUserSettings(user.uid);

        // If no settings, initialize them
        if (!userSettings) {
          await profileService.initializeSettings(user.uid);
          userSettings = await profileService.getUserSettings(user.uid);
        }

        // Subscribe to real-time updates
        unsubscribe = profileService.subscribeToSettings(user.uid, (updatedSettings) => {
          setSettings(updatedSettings);

          // Apply appearance settings
          if (updatedSettings?.appearance) {
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
        });

        setLoading(false);
      } catch (error) {
        console.error('Error initializing settings:', error);
        setLoading(false);
      }
    };

    initSettings();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, i18n]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;

    try {
      // Apply language change immediately for instant feedback
      if (updates.appearance?.language && updates.appearance.language !== i18n.language) {
        await i18n.changeLanguage(updates.appearance.language);
        window.dispatchEvent(new Event('languagechange'));
        console.log('Language immediately changed to:', updates.appearance.language);
      }

      await profileService.updateUserSettings(user.uid, updates);
      
      // Settings will be updated automatically via real-time listener
      // But also update local state immediately for instant feedback
      setSettings({
        ...settings,
        ...updates,
        notifications: {
          ...settings.notifications,
          ...(updates.notifications || {})
        },
        appearance: {
          ...settings.appearance,
          ...(updates.appearance || {})
        },
        privacy: {
          ...settings.privacy,
          ...(updates.privacy || {})
        },
        data: {
          ...settings.data,
          ...(updates.data || {})
        }
      });
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
