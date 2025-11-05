# Firestore Database Setup Guide

## 🗃️ Firestore Database Configuration

User profiles और community data store करने के लिए Firestore Database enable करना जरूरी है।

## 📋 Firestore Setup Steps

### Step 1: Firestore Database Create करें
1. Firebase Console में आपका project open करें
2. Left sidebar में **"Firestore Database"** पर click करें
3. **"Create database"** button पर click करें

### Step 2: Security Rules Choose करें
**Production mode** select करें (recommended for security):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Community posts - authenticated users can read all, write their own
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // Comments - authenticated users can read all, write their own
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

### Step 3: Location Choose करें
**asia-south1 (Mumbai)** select करें (closest to India)

### Step 4: Complete Setup
**"Done"** button पर click करें

## 🔧 Collection Structure

App automatically create करेगा ये collections:

### Users Collection (`users`)
```json
{
  "uid": "user123",
  "email": "farmer@example.com",
  "displayName": "Farmer Name",
  "photoURL": "profile-pic-url",
  "role": "farmer",
  "verified": false,
  "createdAt": "timestamp",
  "preferences": {
    "language": "hi",
    "notifications": {...}
  }
}
```

### Posts Collection (`posts`)
```json
{
  "id": "post123",
  "authorId": "user123",
  "title": "My Question",
  "content": "Need help with...",
  "category": "crops",
  "createdAt": "timestamp"
}
```

## 🚀 Quick Start Commands

After Firestore setup, restart your app:
```bash
npm run dev
```

## ✅ Verification Steps

1. Open app at http://localhost:3003
2. Login with Google
3. Check Firebase Console → Firestore → users collection
4. आपका user profile automatically create हो जाना चाहिए

---

**Important**: Firestore security rules properly configured हैं user privacy और security के लिए। 🔒