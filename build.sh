#!/bin/bash

# Render Build Script for Smart Krishi Sahayak
echo "🌾 Building Smart Krishi Sahayak for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building production bundle..."
npm run build

# Copy necessary files
echo "📁 Copying configuration files..."
cp -r public/* dist/ 2>/dev/null || true

# Add redirects for SPA routing
echo "🔄 Setting up SPA routing..."
cat > dist/_redirects << 'EOF'
/*    /index.html   200
EOF

echo "✅ Build completed successfully for Render!"
echo "📂 Distribution files are in: ./dist"
ls -la dist/