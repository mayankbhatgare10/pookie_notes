# 🔥 Firestore Security Rules for Password Protection

## Copy these rules to Firebase Console

Go to: **Firebase Console** → **Firestore Database** → **Rules**

Replace the existing rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Notes collection - with password protection support
    match /notes/{noteId} {
      // Allow read if:
      // 1. User owns the note
      // 2. Note exists (for password verification)
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Allow create if:
      // 1. User is authenticated
      // 2. userId in the note matches the authenticated user
      // 3. If isPrivate is true, passwordHash must be provided
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        (!request.resource.data.isPrivate || 
         (request.resource.data.isPrivate && request.resource.data.passwordHash != null));
      
      // Allow update if:
      // 1. User owns the note
      // 2. userId cannot be changed
      // 3. If changing to private, passwordHash must be provided
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == resource.data.userId &&
        (!request.resource.data.isPrivate || 
         (request.resource.data.isPrivate && request.resource.data.passwordHash != null));
      
      // Allow delete if user owns the note
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Collections - user's note collections
    match /collections/{collectionId} {
      // Allow read if user owns the collection
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Allow create if user is authenticated and userId matches
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Allow update if user owns the collection and userId doesn't change
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == resource.data.userId;
      
      // Allow delete if user owns the collection
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## What These Rules Do:

### 🔐 **Security Features:**

1. **User Authentication Required** - All operations require a logged-in user
2. **Data Isolation** - Users can only access their own data
3. **Password Protection** - Private notes MUST have a passwordHash
4. **Immutable User IDs** - userId cannot be changed after creation
5. **Read Protection** - Only the owner can read their notes

### 📝 **Notes Collection Rules:**

- ✅ **Read**: Only if you own the note
- ✅ **Create**: Only if authenticated and you set yourself as owner
- ✅ **Update**: Only if you own it and don't change the owner
- ✅ **Delete**: Only if you own it
- ✅ **Private Notes**: Must have a passwordHash if isPrivate is true

### 📂 **Collections Rules:**

- ✅ **Read**: Only your own collections
- ✅ **Create**: Only if you're the owner
- ✅ **Update**: Only your own, can't change owner
- ✅ **Delete**: Only your own

### 👤 **Users Collection Rules:**

- ✅ **Read/Write**: Only your own profile

## How to Apply:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `pookie-notes79`
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab
5. **Copy the rules above**
6. **Paste** into the editor
7. Click **Publish**

## Testing:

After applying rules, test that:
- ✅ You can create notes
- ✅ You can create private notes with passwords
- ✅ You can read only your own notes
- ✅ You cannot read other users' notes
- ✅ Private notes require passwordHash

## Important Notes:

⚠️ **Password Hashes are Visible** - The passwordHash is stored in Firestore and can be read by the note owner. This is necessary for client-side verification.

⚠️ **Client-Side Verification** - Password verification happens on the client. For maximum security, consider server-side verification with Firebase Functions.

✅ **Bcrypt Hashes are Safe** - Even though hashes are visible, bcrypt makes them extremely difficult to reverse-engineer.

## Security Best Practices:

1. ✅ **Never store plain passwords** - Always hash with bcrypt
2. ✅ **Use strong passwords** - Encourage users to use complex passwords
3. ✅ **HTTPS only** - Firebase enforces this automatically
4. ✅ **Regular security audits** - Review rules periodically

---

**Rules are ready! Copy and paste them into Firebase Console now! 🔥**
