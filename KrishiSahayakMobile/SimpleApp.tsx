import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  Pressable,
  Linking,
  SafeAreaView,
  ScrollView
} from 'react-native';

export default function SimpleApp() {
  const APP_URL = 'https://claimbot-chi.vercel.app';

  const openInBrowser = () => {
    Linking.openURL(APP_URL);
  };

  const features = [
    '🌦️ Live Weather Updates',
    '🌾 Crop Information',
    '🔍 Disease Detection',
    '💰 Market Prices',
    '🏛️ Government Schemes',
    '🌐 Hindi/English Support'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌾 Smart Krishi Sahayak</Text>
        <Text style={styles.headerSubtitle}>स्मार्ट कृषि सहायक</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Smart Agriculture Assistant</Text>
          <Text style={styles.welcomeSubtitle}>आपका स्मार्ट कृषि सहायक में स्वागत है</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Features / सुविधाएं:</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Access Button */}
        <View style={styles.buttonSection}>
          <Pressable style={styles.primaryButton} onPress={openInBrowser}>
            <Text style={styles.primaryButtonText}>Open Smart Krishi Sahayak</Text>
            <Text style={styles.primaryButtonSubtext}>स्मार्ट कृषि सहायक खोलें</Text>
          </Pressable>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            This app provides comprehensive agricultural assistance for Indian farmers.
          </Text>
          <Text style={styles.infoTextHindi}>
            यह ऐप भारतीय किसानों के लिए व्यापक कृषि सहायता प्रदान करता है।
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#16a34a',
    paddingTop: 15,
    paddingBottom: 15,
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#dcfce7',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuresSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 15,
  },
  featureItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
  buttonSection: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  primaryButtonSubtext: {
    color: '#dcfce7',
    fontSize: 14,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoTextHindi: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});