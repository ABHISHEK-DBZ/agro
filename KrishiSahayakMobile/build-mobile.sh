#!/bin/bash

# Smart Krishi Sahayak Mobile App Build Script
# Builds production-ready apps for Android and iOS

echo "🌾 Building Smart Krishi Sahayak Mobile App..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g @expo/cli eas-cli
fi

# Login to Expo (if not already logged in)
echo "Checking Expo authentication..."
eas whoami || eas login

# Build for Android (APK for testing, AAB for Play Store)
echo "🤖 Building Android APK..."
eas build --platform android --profile preview --non-interactive

echo "🤖 Building Android AAB for Play Store..."
eas build --platform android --profile production --non-interactive

# Build for iOS (requires Apple Developer account)
echo "🍎 Building iOS IPA..."
eas build --platform ios --profile production --non-interactive

echo "✅ Build process completed!"
echo "📱 Download your builds from: https://expo.dev/accounts/abhishekdbz/projects/smart-krishi-sahayak/builds"

# Optional: Submit to stores
read -p "Do you want to submit to app stores? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Submitting to Google Play Store..."
    eas submit --platform android --latest
    
    echo "📤 Submitting to Apple App Store..."
    eas submit --platform ios --latest
fi

echo "🎉 Smart Krishi Sahayak mobile app deployment complete!"