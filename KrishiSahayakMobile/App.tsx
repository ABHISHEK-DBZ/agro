import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  Platform,
  Alert,
  BackHandler,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  Pressable
} from 'react-native';
import { WebView } from 'react-native-webview';
import SimpleApp from './SimpleApp';

export default function App() {
  const [webViewRef, setWebViewRef] = useState<WebView | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useSimpleMode, setUseSimpleMode] = useState(false);

  // Production URL - Current development servers
  const APP_URL = 'http://localhost:3005';

  // If WebView fails multiple times, switch to simple mode
  if (useSimpleMode) {
    return <SimpleApp />;
  }

  useEffect(() => {
    // Simple initialization without complex splash/orientation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

    // Handle Android back button
    const backAction = () => {
      if (canGoBack && webViewRef) {
        webViewRef.goBack();
        return true;
      } else {
        Alert.alert(
          'Exit Smart Krishi Sahayak?',
          'क्या आप Smart Krishi Sahayak से बाहर निकलना चाहते हैं?',
          [
            {
              text: 'Cancel / रद्द करें',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'Yes / हां',
              onPress: () => BackHandler.exitApp(),
            },
          ]
        );
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack, webViewRef]);

  const onNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  const onLoadEnd = () => {
    setIsLoading(false);
  };

  const onError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setError(true);
  };

  const openInBrowser = () => {
    Linking.openURL(APP_URL);
  };

  const injectedJavaScript = `
    (function() {
      // Add mobile app identifier
      window.isMobileApp = true;
      window.isExpoApp = true;
      
      // Add device info
      window.deviceInfo = {
        platform: '${Platform.OS}',
        version: '${Platform.Version}',
        isTablet: false
      };

      // Enhance for mobile experience
      document.addEventListener('DOMContentLoaded', function() {
        // Prevent zoom on iOS input focus
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.style.fontSize = '16px';
        });

        // Add mobile-specific styles
        const style = document.createElement('style');
        style.textContent = \`
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
          }
          
          body {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .mobile-hidden {
            display: none !important;
          }
          
          /* Improve touch targets */
          button, .btn, [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        \`;
        document.head.appendChild(style);

        // Add mobile app banner
        const banner = document.createElement('div');
        banner.innerHTML = \`
          <div style="
            background: #16a34a;
            color: white;
            text-align: center;
            padding: 5px;
            font-size: 12px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
          ">
            📱 Smart Krishi Sahayak Mobile App
          </div>
        \`;
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Adjust body padding for banner
        document.body.style.paddingTop = '25px';
      });

      // Add pull-to-refresh functionality
      let startY = 0;
      let isRefreshing = false;

      document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        const currentY = e.touches[0].pageY;
        const isAtTop = window.scrollY === 0;
        const isPullingDown = currentY > startY;
        
        if (isAtTop && isPullingDown && currentY - startY > 120 && !isRefreshing) {
          isRefreshing = true;
          window.location.reload();
        }
      }, { passive: true });

      document.addEventListener('touchend', function() {
        setTimeout(() => {
          isRefreshing = false;
        }, 1000);
      }, { passive: true });

      true;
    })();
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌾 Smart Krishi Sahayak</Text>
        <Text style={styles.headerSubtitle}>स्मार्ट कृषि सहायक</Text>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading Smart Krishi Sahayak...</Text>
          <Text style={styles.loadingSubtext}>स्मार्ट कृषि सहायक लोड हो रहा है...</Text>
        </View>
      )}

      {/* Error State with Browser Option */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorText}>WebView failed to load. Please try opening in browser.</Text>
          <Pressable style={styles.browserButton} onPress={openInBrowser}>
            <Text style={styles.browserButtonText}>Open in Browser</Text>
          </Pressable>
          <Pressable style={styles.retryButton} onPress={() => {setError(false); setIsLoading(true)}}>
            <Text style={styles.retryButtonText}>Retry WebView</Text>
          </Pressable>
          <Pressable style={styles.simpleModeButton} onPress={() => setUseSimpleMode(true)}>
            <Text style={styles.simpleModeButtonText}>Use Simple Mode</Text>
          </Pressable>
        </View>
      )}

      {/* Main WebView */}
      {!error && !isLoading && (
        <WebView
          ref={(ref) => setWebViewRef(ref)}
          source={{ uri: APP_URL }}
          style={styles.webview}
          onNavigationStateChange={onNavigationStateChange}
          onError={onError}
          onLoadEnd={onLoadEnd}
          injectedJavaScript={injectedJavaScript}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          allowsInlineMediaPlaybook={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          userAgent="SmartKrishiSahayakMobileApp/1.0 (Expo)"
          cacheEnabled={true}
          incognito={false}
          sharedCookiesEnabled={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          setSupportMultipleWindows={false}
          thirdPartyCookiesEnabled={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16a34a',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingTop: Platform.OS === 'ios' ? 5 : 15,
    paddingBottom: 10,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  headerSubtitle: {
    color: '#dcfce7',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 20,
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  browserButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  browserButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  simpleModeButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  simpleModeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
