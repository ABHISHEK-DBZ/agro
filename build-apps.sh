#!/bin/bash

# Smart Krishi Sahayak Mobile App Setup Script
echo "🌾 Setting up Smart Krishi Sahayak Mobile Apps..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Choose app type to build:${NC}"
echo "1. PWA (Progressive Web App) - Recommended"
echo "2. React Native (Android/iOS)"
echo "3. Electron Desktop App"
echo "4. Capacitor Hybrid App"
echo "5. All Apps"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}Building PWA...${NC}"
        npm run build
        echo -e "${GREEN}✅ PWA ready! Install from browser on mobile devices${NC}"
        echo -e "${YELLOW}Visit: https://claimbot-chi.vercel.app${NC}"
        ;;
    2)
        echo -e "${GREEN}Setting up React Native...${NC}"
        cd mobile-app
        npm install
        echo -e "${YELLOW}For Android: npm run android${NC}"
        echo -e "${YELLOW}For iOS: npm run ios${NC}"
        ;;
    3)
        echo -e "${GREEN}Building Electron Desktop App...${NC}"
        cd desktop-app
        npm install
        npm run build:win
        echo -e "${GREEN}✅ Desktop app built in desktop-app/dist/${NC}"
        ;;
    4)
        echo -e "${GREEN}Setting up Capacitor Hybrid App...${NC}"
        npm install @capacitor/core @capacitor/cli
        npx cap init
        npm run build
        npx cap add android
        npx cap add ios
        npx cap sync
        echo -e "${YELLOW}For Android: npx cap open android${NC}"
        echo -e "${YELLOW}For iOS: npx cap open ios${NC}"
        ;;
    5)
        echo -e "${GREEN}Building all apps...${NC}"
        # PWA
        npm run build
        
        # React Native
        cd mobile-app && npm install && cd ..
        
        # Electron
        cd desktop-app && npm install && npm run build:win && cd ..
        
        # Capacitor
        npm install @capacitor/core @capacitor/cli
        npx cap add android
        npx cap add ios
        npx cap sync
        
        echo -e "${GREEN}✅ All apps ready!${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice!${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Smart Krishi Sahayak app setup complete!${NC}"
echo -e "${BLUE}App Features:${NC}"
echo "• Live Weather Dashboard with Open-Meteo API"
echo "• AI Agriculture Assistant" 
echo "• Crop Disease Detection"
echo "• Market Prices & Government Schemes"
echo "• Offline Support (PWA)"
echo "• Multi-language Support (Hindi/English)"