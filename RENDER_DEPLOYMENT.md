# 🌾 Smart Krishi Sahayak - Render Deployment Guide

## Quick Deploy to Render

### Option 1: One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ABHISHEK-DBZ/agro)

### Option 2: Manual Deployment

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub account
   - Select the `agro` repository

2. **Configure Build Settings**
   - **Name**: `smart-krishi-sahayak`
   - **Root Directory**: `/` (leave empty)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**
   Copy these from `.env.render` to Render dashboard:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_OPENWEATHER_API_KEY=your_openweather_key
   VITE_GEMINI_API_KEY=your_gemini_key
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy

## Features on Render
- ✅ Free SSL Certificate
- ✅ Global CDN
- ✅ Automatic deploys from GitHub
- ✅ Custom domain support
- ✅ SPA routing support
- ✅ Environment variables

## Post-Deployment
Your app will be available at: `https://smart-krishi-sahayak.onrender.com`

## Troubleshooting
- Check build logs in Render dashboard
- Ensure all environment variables are set
- Verify Firebase configuration
- Test locally with `npm run build` first

## Support
For issues, check the Render documentation or contact support.