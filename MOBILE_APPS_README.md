# 📱 Smart Krishi Sahayak Mobile Apps

## 🌾 Agriculture Assistant for Indian Farmers

Smart Krishi Sahayak अब mobile apps के रूप में उपलब्ध है! Choose from multiple app formats:

### 🚀 **App Options**

#### 1. **PWA (Progressive Web App)** - ⭐ Recommended
- **सबसे आसान**: Browser से direct install करें
- **Offline Support**: Internet के बिना भी काम करता है
- **Auto Updates**: Automatically latest version मिलता है
- **Cross Platform**: Android, iOS, Desktop सभी में काम करता है

**📲 How to Install:**
1. Visit: `https://claimbot-chi.vercel.app`
2. Chrome/Safari में "Add to Home Screen" click करें
3. App icon आपके phone में add हो जाएगा

#### 2. **React Native App** - 📱 Native Mobile
- **Native Performance**: Full native app experience
- **Platform Specific**: Android और iOS के लिए अलग builds
- **Device Features**: Camera, GPS, Push notifications

**🔧 Build Instructions:**
```bash
cd mobile-app
npm install
npm run android  # For Android
npm run ios      # For iOS
```

#### 3. **Electron Desktop App** - 💻 Desktop
- **Desktop Application**: Windows, Mac, Linux के लिए
- **Standalone**: Internet connection optional
- **Menu Bar**: Desktop-specific features

**🔧 Build Instructions:**
```bash
cd desktop-app
npm install
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

#### 4. **Capacitor Hybrid App** - 🔄 Hybrid
- **Best of Both**: Web + Native features
- **Easy Deployment**: App stores में publish करना आसान
- **Plugin Support**: Native device features access

**🔧 Build Instructions:**
```bash
npm install @capacitor/core @capacitor/cli
npx cap add android
npx cap add ios
npx cap sync
npx cap open android  # For Android Studio
npx cap open ios      # For Xcode
```

### 🎯 **Quick Setup**

**Windows Users:**
```cmd
build-apps.bat
```

**Mac/Linux Users:**
```bash
chmod +x build-apps.sh
./build-apps.sh
```

### 🌟 **App Features**

#### ✅ **Live Weather Dashboard**
- Open-Meteo API integration
- City search with Hindi support
- 24-hour और 7-day forecasts
- Agricultural weather insights
- Weather alerts for farming

#### ✅ **AI Agriculture Assistant**
- Crop advice और recommendations
- Farming best practices
- Seasonal guidance
- Problem solving assistance

#### ✅ **Disease Detection**
- Image-based crop disease identification
- Treatment recommendations
- Prevention tips
- Expert guidance

#### ✅ **Market Prices**
- Live commodity prices
- Mandi rates
- Price trends और analysis
- Market insights

#### ✅ **Government Schemes**
- PM-KISAN, PMFBY schemes info
- Application processes
- Eligibility criteria
- Benefits calculator

#### ✅ **Additional Features**
- 🌍 Multi-language support (Hindi/English)
- 📱 Responsive design for all devices
- 🔄 Offline support (PWA)
- 🔔 Push notifications
- 📍 GPS location services
- 📸 Camera integration

### 🛠️ **Development**

**Tech Stack:**
- **Frontend**: React + TypeScript + Tailwind CSS
- **Mobile**: React Native + Capacitor
- **Desktop**: Electron
- **PWA**: Service Workers + Web App Manifest
- **Backend**: Node.js + Express
- **APIs**: Open-Meteo Weather API
- **Deployment**: Vercel

**Project Structure:**
```
📁 Smart Krishi Sahayak/
├── 📁 src/                 # React web app
├── 📁 mobile-app/          # React Native app
├── 📁 desktop-app/         # Electron desktop app
├── 📁 public/              # PWA assets
├── 📁 server/              # Backend API
├── 📄 capacitor.config.json # Capacitor config
├── 📄 build-apps.bat       # Windows build script
└── 📄 build-apps.sh        # Unix build script
```

### 📋 **Requirements**

**For PWA:**
- Modern browser (Chrome, Safari, Firefox)
- Internet connection for initial load

**For React Native:**
- Node.js 16+
- React Native CLI
- Android Studio (Android)
- Xcode (iOS)

**For Electron:**
- Node.js 16+
- npm/yarn

**For Capacitor:**
- Node.js 16+
- Android Studio (Android)
- Xcode (iOS)

### 🚀 **Deployment**

**PWA**: Automatically deployed on Vercel  
**React Native**: Build APK/IPA for distribution  
**Electron**: Create installer packages  
**Capacitor**: Publish to Google Play/App Store  

### 🎯 **Installation Recommendations**

**👨‍🌾 For Farmers (End Users):**
- **Best Choice**: PWA (Progressive Web App)
- **Why**: Easy to install, automatic updates, works offline
- **How**: Visit website और "Add to Home Screen"

**👨‍💻 For Developers:**
- **Best Choice**: React Native या Capacitor
- **Why**: Full control, native features, app store distribution
- **How**: Follow build instructions above

**🏢 For Organizations:**
- **Best Choice**: Electron Desktop + PWA Mobile
- **Why**: Desktop productivity + mobile accessibility
- **How**: Deploy both versions

### 📞 **Support**

- **Website**: https://claimbot-chi.vercel.app
- **GitHub**: https://github.com/ABHISHEK-DBZ/agro
- **Issues**: Report bugs on GitHub issues
- **Developer**: ABHISHEK-DBZ

### 📝 **License**

MIT License - Open source agriculture technology for Indian farmers

---

**🌾 Smart Krishi Sahayak - Empowering Indian Agriculture with Technology! 🇮🇳**