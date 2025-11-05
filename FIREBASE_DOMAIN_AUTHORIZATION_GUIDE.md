# 🔐 Firebase Domain Authorization Setup Guide

## Overview
Firebase requires authorized domains for OAuth authentication (Google Sign-in). This guide will help you configure domain authorization for both development and production environments.

## 🎯 Current Configuration
**Project**: `smart-krishi-sahayak-6871c`  
**Auth Domain**: `smart-krishi-sahayak-6871c.firebaseapp.com`  
**Current Environment**: Development (localhost:3003)

## 📋 Step-by-Step Domain Authorization

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **smart-krishi-sahayak-6871c**
3. Navigate to **Authentication** from the left sidebar

### Step 2: Configure Sign-in Method
1. Click on **"Sign-in method"** tab
2. Find **Google** provider in the list
3. Click on **Google** to configure it

### Step 3: Enable Google Sign-in
1. Toggle **"Enable"** switch to ON
2. Add **Project support email**: `[YOUR_EMAIL@GMAIL.COM]`
3. Click **"Save"**

### Step 4: Authorize Domains
Scroll down to **"Authorized domains"** section and ensure these domains are added:

#### Development Domains (Already Present)
```
localhost
```

#### Production Domains (Add These)
```
your-domain.com
www.your-domain.com
your-netlify-app.netlify.app
your-vercel-app.vercel.app
smart-krishi-sahayak.web.app (Firebase Hosting)
```

### Step 5: Add New Authorized Domain
1. Click **"Add domain"** button
2. Enter your domain name (without http/https)
3. Click **"Add"** to confirm

## 🌐 Common Domain Patterns

### Local Development
```
localhost
127.0.0.1
```

### Firebase Hosting
```
smart-krishi-sahayak-6871c.web.app
smart-krishi-sahayak-6871c.firebaseapp.com
```

### Custom Domain
```
yourdomain.com
www.yourdomain.com
```

### Vercel Deployment
```
your-app-name.vercel.app
your-app-name-git-main.vercel.app
```

### Netlify Deployment
```
your-app-name.netlify.app
your-custom-domain.com
```

## 🔧 Testing Domain Authorization

### 1. Local Testing (localhost:3003)
```bash
# Start development server
npm run dev

# Test Google Sign-in
# Navigate to: http://localhost:3003
# Click: "Google से साइन इन करें"
# Should open Google OAuth popup
```

### 2. Production Testing
```bash
# Build and deploy
npm run build

# Test on production domain
# Navigate to: https://your-domain.com
# Test Google authentication
```

## ❌ Common Error Messages & Solutions

### Error: "unauthorized_domain"
```
Error: This app domain is not authorized for OAuth operations
```
**Solution**: Add the domain to Firebase Console → Authentication → Authorized domains

### Error: "popup_closed_by_user"
```
Error: The popup has been closed by the user before finalizing the operation
```
**Solution**: This is normal - user closed the popup. No action needed.

### Error: "operation_not_allowed"
```
Error: The given sign-in provider is disabled for this Firebase project
```
**Solution**: Enable Google Sign-in provider in Firebase Console

## 🛠️ Development vs Production Setup

### Development Environment
```javascript
// firebase.ts - Development mode
const firebaseConfig = {
  apiKey: "AIzaSyBJpozRU-RqZyAmryb4rPGh8ekZRPZxgXI",
  authDomain: "smart-krishi-sahayak-6871c.firebaseapp.com",
  // ... other config
};

// Authorized domains: localhost
```

### Production Environment
```javascript
// Same Firebase config
// Additional authorized domains: your-production-domain.com
```

## 📱 Mobile App Domain Authorization

For mobile apps (React Native/Cordova), add these to authorized domains:
```
com.yourcompany.smartkrishisahayak
__/auth/handler (for custom URL schemes)
```

## 🔒 Security Considerations

### Best Practices
1. **Only authorize trusted domains**
2. **Remove unused domains** regularly
3. **Use HTTPS** in production
4. **Monitor authentication logs**

### Domain Validation
Firebase automatically validates:
- Domain ownership
- SSL certificate validity
- Proper redirect handling

## 🚀 Quick Setup Checklist

- [ ] Firebase Console access
- [ ] Google Sign-in provider enabled
- [ ] Support email configured
- [ ] localhost authorized (development)
- [ ] Production domain authorized
- [ ] Google OAuth popup tested
- [ ] User profile creation verified

## 🔧 Troubleshooting Commands

### Check Current Configuration
```bash
# View current Firebase config
cat .env | grep FIREBASE

# Check build configuration
npm run build

# Test authentication flow
npm run dev
```

### Debug Authentication Issues
```javascript
// Add to AuthContext.tsx for debugging
console.log('🔥 Firebase Config:', {
  authDomain: auth.app.options.authDomain,
  projectId: auth.app.options.projectId
});

// Test Google provider
console.log('📱 Google Provider:', googleProvider);
```

## 📞 Support Resources

### Firebase Documentation
- [Firebase Auth Domains](https://firebase.google.com/docs/auth/web/redirect-best-practices#authorized_domains)
- [Google Sign-in Setup](https://firebase.google.com/docs/auth/web/google-signin)

### Error Code Reference
- [Firebase Auth Error Codes](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)

---

## ✅ Final Verification

After completing domain authorization:

1. **Development**: ✅ Google Sign-in works on localhost:3003
2. **Production**: ⏳ Add production domain when deploying
3. **Mobile**: ⏳ Add mobile app domains when building mobile version

**Status**: Ready for testing on authorized domains! 🚀

*Last Updated: November 2025*