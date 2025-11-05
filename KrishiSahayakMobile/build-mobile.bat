@echo off
REM Smart Krishi Sahayak Mobile App Build Script for Windows
REM Builds production-ready apps for Android and iOS

echo 🌾 Building Smart Krishi Sahayak Mobile App...

REM Check if EAS CLI is installed
where eas >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing EAS CLI...
    npm install -g @expo/cli eas-cli
)

REM Login to Expo (if not already logged in)
echo Checking Expo authentication...
eas whoami || eas login

REM Build for Android (APK for testing)
echo 🤖 Building Android APK for testing...
eas build --platform android --profile preview --non-interactive

REM Build for Android (AAB for Play Store)
echo 🤖 Building Android AAB for Play Store...
eas build --platform android --profile production --non-interactive

REM Build for iOS (requires Apple Developer account)
echo 🍎 Building iOS IPA...
eas build --platform ios --profile production --non-interactive

echo ✅ Build process completed!
echo 📱 Download your builds from: https://expo.dev/accounts/abhishekdbz/projects/smart-krishi-sahayak/builds

REM Optional: Submit to stores
set /p submit="Do you want to submit to app stores? (y/n): "
if /i "%submit%"=="y" (
    echo 📤 Submitting to Google Play Store...
    eas submit --platform android --latest
    
    echo 📤 Submitting to Apple App Store...
    eas submit --platform ios --latest
)

echo 🎉 Smart Krishi Sahayak mobile app deployment complete!
pause