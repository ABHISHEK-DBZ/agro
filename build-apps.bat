@echo off
echo 🌾 Smart Krishi Sahayak Mobile App Setup
echo.

echo Choose app type to build:
echo 1. PWA (Progressive Web App) - Recommended
echo 2. React Native (Android/iOS)
echo 3. Electron Desktop App
echo 4. Capacitor Hybrid App
echo 5. All Apps
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo Building PWA...
    call npm run build
    echo ✅ PWA ready! Install from browser on mobile devices
    echo Visit: https://claimbot-chi.vercel.app
    pause
) else if "%choice%"=="2" (
    echo Setting up React Native...
    cd mobile-app
    call npm install
    echo For Android: npm run android
    echo For iOS: npm run ios
    pause
) else if "%choice%"=="3" (
    echo Building Electron Desktop App...
    cd desktop-app
    call npm install
    call npm run build:win
    echo ✅ Desktop app built in desktop-app/dist/
    pause
) else if "%choice%"=="4" (
    echo Setting up Capacitor Hybrid App...
    call npm install @capacitor/core @capacitor/cli
    call npx cap init
    call npm run build
    call npx cap add android
    call npx cap add ios
    call npx cap sync
    echo For Android: npx cap open android
    echo For iOS: npx cap open ios
    pause
) else if "%choice%"=="5" (
    echo Building all apps...
    
    REM PWA
    call npm run build
    
    REM React Native
    cd mobile-app
    call npm install
    cd ..
    
    REM Electron
    cd desktop-app
    call npm install
    call npm run build:win
    cd ..
    
    REM Capacitor
    call npm install @capacitor/core @capacitor/cli
    call npx cap add android
    call npx cap add ios
    call npx cap sync
    
    echo ✅ All apps ready!
    pause
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo 🎉 Smart Krishi Sahayak app setup complete!
echo.
echo App Features:
echo • Live Weather Dashboard with Open-Meteo API
echo • AI Agriculture Assistant
echo • Crop Disease Detection  
echo • Market Prices ^& Government Schemes
echo • Offline Support (PWA)
echo • Multi-language Support (Hindi/English)
echo.
pause