@echo off
echo Building Windows Desktop App for Smart Krishi Sahayak...

REM Create dist directory
if not exist "dist" mkdir dist
if not exist "dist\win-app" mkdir dist\win-app

REM Copy application files
copy main.js dist\win-app\
copy preload.js dist\win-app\
copy index.html dist\win-app\
copy package.json dist\win-app\

REM Install production dependencies
cd dist\win-app
npm install --production

REM Create Windows executable
npx electron-packager . "Smart Krishi Sahayak" --platform=win32 --arch=x64 --out=..\ --overwrite --no-prune --ignore="node_modules/(electron|electron-packager)"

cd ..\..
echo Windows app built successfully in dist folder!
echo You can find the executable in: dist\Smart Krishi Sahayak-win32-x64\
pause