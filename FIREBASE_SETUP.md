# Firebase Setup Guide for Pookie Notes

## 🔥 Firebase Authentication Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `pookie-notes` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Click on it → Toggle "Enable" → Save
   - **Google**: Click on it → Toggle "Enable" → Enter project support email → Save

### Step 3: Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app with nickname: "Pookie Notes Web"
6. Copy the `firebaseConfig` object

### Step 4: Set Up Environment Variables

1. In your project root, create a file named `.env.local`
2. Copy the content from `.env.local.example`
3. Fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 5: Set Up Firestore Database

1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

### Step 6: Configure Firestore Security Rules

Go to "Firestore Database" → "Rules" tab and add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notes - users can only access their own notes
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Collections - users can only access their own collections
    match /collections/{collectionId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### Step 7: Configure Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" → "Credentials"
4. Click "Configure Consent Screen"
5. Fill in the required information
6. Add authorized domains (e.g., `localhost`, your production domain)

### Step 8: Test Your Setup

1. Restart your development server:
   ```bash
   bun run dev
   ```

2. Navigate to `/signup` and try creating an account
3. Try logging in with Google
4. Check Firebase Console → Authentication → Users to see registered users

## 🎉 You're All Set!

Your Pookie Notes app is now connected to Firebase with:
- ✅ Email/Password Authentication
- ✅ Google OAuth
- ✅ Firestore Database (ready for notes storage)

## Next Steps

- Implement note storage in Firestore
- Add user profile management
- Set up note syncing across devices
- Add offline support with Firebase caching

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Make sure `.env.local` is in the project root
   - Restart the dev server after adding environment variables

2. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add `localhost` to authorized domains in Firebase Console
   - Go to Authentication → Settings → Authorized domains

3. **Google Sign-In not working**
   - Make sure Google provider is enabled in Firebase Console
   - Check that you've configured the OAuth consent screen

## Security Notes

- Never commit `.env.local` to version control
- The `.env.local.example` file is for reference only
- Keep your Firebase API keys secure
- Use Firestore security rules to protect user data
