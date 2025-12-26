# 🚨 URGENT: Firebase Setup Required!

## ❌ Current Error

```
Missing Firebase environment variables:
["NEXT_PUBLIC_FIREBASE_API_KEY","NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",...]
```

**This is why:**
- ❌ Notes won't save
- ❌ Connections won't work
- ❌ Checkbox sync won't work
- ❌ Everything breaks!

---

## ✅ How to Fix (5 Minutes)

### **Step 1: Get Firebase Credentials**

1. Go to https://console.firebase.google.com/
2. Select your project (or create one)
3. Click ⚙️ (Settings) → Project settings
4. Scroll to "Your apps" section
5. Click the **Web app** (</> icon)
6. Copy the `firebaseConfig` object

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### **Step 2: Fill in .env.local**

1. Open `.env.local` file in your project root
2. Replace the placeholder values with your actual Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your-actual-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**⚠️ IMPORTANT:** Use YOUR actual values, not these examples!

---

### **Step 3: Restart Dev Server**

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

### **Step 4: Publish Firebase Rules**

1. Go to Firebase Console → Firestore Database
2. Click **Rules** tab
3. Copy ENTIRE content from `firestore.rules` file
4. Paste into Firebase Console
5. Click **PUBLISH**

---

## 🎯 After Setup

**Everything will work:**
- ✅ Save notes
- ✅ Link notes
- ✅ Checkbox sync between linked notes
- ✅ Footer connections
- ✅ All CRUD operations

---

## 🔗 Checkbox Sync Feature

**How it works:**
1. Link "Bucket List" to "Watchlist"
2. Check a box in "Bucket List"
3. It automatically appears in "Watchlist"

**But it ONLY works after Firebase is set up!**

---

## 📝 Quick Checklist

- [ ] Get Firebase credentials from console
- [ ] Fill in `.env.local` with real values
- [ ] Restart dev server
- [ ] Publish Firebase rules
- [ ] Refresh browser (Ctrl+Shift+R)
- [ ] Test creating a note
- [ ] Test linking notes
- [ ] Test checkbox sync

---

**DO THIS NOW - Nothing works without Firebase setup!** 🔥
