# Smart Krishi Sahayak Mobile App

## 🌾 Smart Agriculture Assistant for Indian Farmers

This is the production-ready mobile app version of Smart Krishi Sahayak, built with Expo and React Native.

### 📱 Features
- **Live Weather Updates** - Real-time weather data for farming decisions
- **Crop Information** - Comprehensive crop database with farming tips
- **Disease Detection** - AI-powered crop disease identification
- **Market Prices** - Live mandi prices and market trends
- **Government Schemes** - Information about agricultural policies
- **Multi-language Support** - Hindi and English support

### 🚀 Build and Deploy

#### Prerequisites
```bash
npm install -g @expo/cli eas-cli
```

#### Development
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android (requires Android Studio/emulator)
npm run android

# Run on iOS (requires Xcode - macOS only)
npm run ios

# Run on web
npm run web
```

#### Production Build

1. **Login to Expo**
```bash
eas login
```

2. **Configure Project**
```bash
eas build:configure
```

3. **Build Android APK**
```bash
# For Play Store
eas build --platform android --profile production

# For testing/internal distribution
eas build --platform android --profile preview
```

4. **Build iOS IPA** (requires Apple Developer account)
```bash
eas build --platform ios --profile production
```

5. **Build Both Platforms**
```bash
eas build --platform all --profile production
```

#### App Store Submission

1. **Submit to Google Play Store**
```bash
eas submit --platform android
```

2. **Submit to Apple App Store**
```bash
eas submit --platform ios
```

### 📋 App Store Requirements

#### Android (Google Play Store)
- ✅ Target Android API level 34 (Android 14)
- ✅ App Bundle format (.aab) - automatically handled by EAS
- ✅ 64-bit architecture support
- ✅ Required permissions declared
- ✅ Content rating for Educational/Agriculture category

#### iOS (Apple App Store)
- ✅ iOS 13.4+ support
- ✅ App Store guidelines compliance
- ✅ Privacy policy and usage descriptions
- ✅ Apple Developer Program membership required
- ✅ App Review Guidelines compliance

### 🔧 Configuration

#### Bundle Identifiers
- **Android**: `com.abhishekdbz.smartkrishisahayak`
- **iOS**: `com.abhishekdbz.smartkrishisahayak`

#### Permissions
- **Camera**: For crop disease detection and field photography
- **Location**: For local weather data and location-specific information
- **Microphone**: For voice commands and audio features
- **Storage**: For offline data and image caching

### 🌐 App URLs
- **Production Web**: https://claimbot-chi.vercel.app
- **Expo Project**: https://expo.dev/@abhishekdbz/smart-krishi-sahayak

### 📝 Release Notes

#### Version 1.0.0
- Initial release of Smart Krishi Sahayak mobile app
- Full web app functionality in mobile wrapper
- Optimized for Indian farmers with Hindi/English support
- Integrated weather, crop, disease, and market features
- Production-ready for Play Store and App Store

### 🛠️ Technical Stack
- **Framework**: Expo SDK 51+ / React Native
- **Language**: TypeScript
- **UI**: React Native components with WebView wrapper
- **Backend**: Express.js API (integrated via WebView)
- **APIs**: Open-Meteo Weather API, Government agriculture APIs
- **Deployment**: EAS Build and Submit

### 🚨 Troubleshooting

#### Common Issues
1. **Build Errors**: Ensure all dependencies are compatible with Expo SDK
2. **WebView Loading**: Check internet connection and API endpoints
3. **Camera Permissions**: Verify permissions in app.json and device settings
4. **iOS Build**: Requires Apple Developer account and proper certificates

#### Support
For technical support or issues:
- Email: abhishekdbz@gmail.com
- GitHub: https://github.com/abhishekdbz/smart-krishi-sahayak

### 📄 License
MIT License - Free for agricultural and educational use

---

**Made with ❤️ for Indian Farmers**
**भारतीय किसानों के लिए प्रेम से बनाया गया**