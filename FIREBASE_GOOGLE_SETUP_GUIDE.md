# Firebase Google Sign-in Setup Guide

## 🚀 Complete Setup for Google Authentication

आपका Smart Krishi Sahayak app अब real Firebase configuration के साथ configured है। Google Sign-in को properly work करने के लिए Firebase Console में कुछ settings enable करनी होंगी।

## 📋 Firebase Console Setup Steps

### Step 1: Firebase Console Open करें
1. [Firebase Console](https://console.firebase.google.com) पर जाएं
2. आपका project **"smart-krishi-sahayak-6871c"** select करें

### Step 2: Authentication Enable करें
1. Left sidebar में **"Authentication"** पर click करें
2. **"Get started"** button पर click करें (अगर पहली बार है)
3. **"Sign-in method"** tab पर जाएं

### Step 3: Google Sign-in Provider Enable करें
1. **"Google"** provider पर click करें
2. **"Enable"** toggle को ON करें
3. **Project support email** में आपका email address डालें
4. **"Save"** button पर click करें

### Step 4: Authorized Domains Add करें
1. Same **"Sign-in method"** tab में scroll down करें
2. **"Authorized domains"** section में:
   - `localhost` (already present)
   - आपका production domain (जब deploy करेंगे)

### Step 5: Web App Configuration Verify करें
1. Left sidebar में **"Project settings"** (gear icon) पर click करें
2. **"General"** tab में scroll down
3. **"Your apps"** section में Web app check करें
4. यह configuration already properly set है:
   ```
   Project ID: smart-krishi-sahayak-6871c
   API Key: AIzaSyBJpozRU-RqZyAmryb4rPGh8ekZRPZxgXI
   ```

## 🔧 Current Application Status

### ✅ Completed
- Real Firebase project configuration
- Environment variables updated
- Authentication context modified
- Development server running on http://localhost:3003

### 🎯 What to Test Now
1. Open http://localhost:3003 in browser
2. Click **"Google से साइन इन करें"** button
3. Google popup should open for authentication
4. After successful login, user profile should be created in Firestore

## 🐛 Troubleshooting

### If Google popup doesn't open:
- Check browser popup blocker
- Open browser console for error messages
- Verify Firebase Console Google Sign-in is enabled

### If "Operation not allowed" error:
- Double-check Google Sign-in provider is enabled in Firebase Console
- Verify project email is set in Google provider settings

### If "Unauthorized domain" error:
- Add current domain to Authorized domains list
- For localhost, ensure `localhost` is in the authorized domains

## 📊 Firebase Console Navigation
```
Firebase Console → Your Project → Authentication → Sign-in method → Google → Enable
```

## 🔍 Testing Checklist
- [ ] Firebase Console: Google Sign-in enabled
- [ ] Browser: http://localhost:3003 opens
- [ ] Login: Google signin button works
- [ ] Auth: Google popup opens
- [ ] Profile: User data saved in Firestore
- [ ] UI: Proper Hindi error messages shown

---

**Next Steps**: After completing Firebase Console setup, test Google authentication और फिर production deployment के लिए prepare करेंगे। 🚀