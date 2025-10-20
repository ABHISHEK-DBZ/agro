import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import Orientation from 'react-native-orientation-locker';

const App = () => {
  const [webViewRef, setWebViewRef] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Production URL - आपका live Vercel deployment
  const APP_URL = 'https://claimbot-chi.vercel.app';

  useEffect(() => {
    // Hide splash screen after app loads
    setTimeout(() => {
      SplashScreen.hide();
    }, 2000);

    // Lock orientation to portrait for better farming app experience
    Orientation.lockToPortrait();

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

  const onNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
  };

  const onLoad = () => {
    console.log('Smart Krishi Sahayak loaded successfully');
  };

  const injectedJavaScript = `
    // Add mobile-specific enhancements
    (function() {
      // Add mobile app identifier
      window.isMobileApp = true;
      
      // Add device info
      window.deviceInfo = {
        platform: '${Platform.OS}',
        version: '${Platform.Version}',
        isTablet: false
      };

      // Add haptic feedback for buttons (if available)
      const originalClick = HTMLElement.prototype.click;
      HTMLElement.prototype.click = function() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'haptic',
            action: 'light'
          }));
        }
        originalClick.call(this);
      };

      // Enhance form inputs for mobile
      document.addEventListener('DOMContentLoaded', function() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          input.style.fontSize = '16px'; // Prevent zoom on iOS
        });
      });

      // Add pull-to-refresh indicator
      let startY = 0;
      document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
      });

      document.addEventListener('touchmove', function(e) {
        const currentY = e.touches[0].pageY;
        const isAtTop = window.scrollY === 0;
        const isPullingDown = currentY > startY;
        
        if (isAtTop && isPullingDown && currentY - startY > 100) {
          window.location.reload();
        }
      });

      true; // Required for injected JavaScript
    })();
  `;

  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    
    if (data.type === 'haptic') {
      // Add haptic feedback here if available
      // For now, we'll just log it
      console.log('Haptic feedback requested:', data.action);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      
      {/* Header with app name */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🌾 Smart Krishi Sahayak</Text>
      </View>

      {/* WebView containing the React app */}
      <WebView
        ref={(ref) => setWebViewRef(ref)}
        source={{ uri: APP_URL }}
        style={styles.webview}
        onNavigationStateChange={onNavigationStateChange}
        onError={onError}
        onLoad={onLoad}
        onMessage={onMessage}
        injectedJavaScript={injectedJavaScript}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Smart Krishi Sahayak...</Text>
            <Text style={styles.loadingSubtext}>Smart farming solutions loading...</Text>
          </View>
        )}
        userAgent="SmartKrishiSahayakMobileApp/1.0"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16a34a',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
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
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default App;