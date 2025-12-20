# Smart Google OAuth Flow Implementation

## Overview
Implemented a smart authentication flow for Google OAuth that automatically:
- **Existing users** → Redirects to Dashboard
- **New users** → Redirects to Onboarding page to complete profile

## Files Created/Modified

### New Files Created:
1. **`src/lib/userService.ts`** - User profile management service
   - `checkUserExists()` - Check if user profile exists in Firestore
   - `getUserProfile()` - Get user profile data
   - `createUserProfile()` - Create new user profile
   - `updateUserProfile()` - Update existing user profile

2. **`src/components/OnboardingForm.tsx`** - Onboarding form for new Google users
   - Displays user's Google email
   - Allows selection of avatar (pixelated or upload)
   - Collects first name and last name
   - Creates Firestore profile on completion

3. **`src/app/onboarding/page.tsx`** - Onboarding page route

### Modified Files:
1. **`src/contexts/AuthContext.tsx`**
   - Added `isNewUser` state
   - Added `checkUserProfile()` function
   - Updated `signInWithGoogle()` to return `{ isNewUser: boolean }`
   - Updated `signUp()` to accept optional profile data and create Firestore profile
   - Enhanced with Firestore integration

2. **`src/components/LoginForm.tsx`**
   - Updated `handleGoogleLogin()` to check if user is new
   - Smart redirect: new users → `/onboarding`, existing users → `/dashboard`

3. **`src/components/SignupForm.tsx`**
   - Updated `handleGoogleSignup()` to check if user is new
   - Updated `handleSignup()` to pass profile data to `signUp()`
   - Smart redirect for Google OAuth

## How It Works

### Flow Diagram:

```
User clicks "Continue with Google"
           ↓
    Google OAuth Popup
           ↓
    User authenticates
           ↓
    Check Firestore for user profile
           ↓
    ┌──────────────────┐
    │  Profile exists? │
    └──────────────────┘
         ↙        ↘
       YES        NO
        ↓          ↓
   Dashboard   Onboarding
                   ↓
            Complete Profile
            (Name + Avatar)
                   ↓
              Dashboard
```

### Email/Password Signup Flow:
1. User fills in signup form (name, email, password, avatar)
2. Creates Firebase Auth account
3. Automatically creates Firestore profile with all data
4. Redirects to Dashboard

### Google OAuth Flow:
1. User clicks "Continue with Google"
2. Authenticates with Google
3. System checks if Firestore profile exists
4. **If exists**: Redirect to Dashboard
5. **If new**: Redirect to Onboarding to collect name and avatar
6. After onboarding: Create Firestore profile and redirect to Dashboard

## Firestore Structure

### Users Collection:
```
users/
  {uid}/
    - uid: string
    - email: string
    - displayName: string
    - firstName: string
    - lastName: string
    - avatar: string (avatar ID or uploaded image URL)
    - createdAt: timestamp
    - updatedAt: timestamp
```

## Security Rules (To be added to Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can create their own profile (only once)
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own profile
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Prevent deletion
      allow delete: if false;
    }
  }
}
```

## Testing the Flow

### Test Case 1: New Google User
1. Go to `/login` or `/signup`
2. Click "Continue with Google"
3. Sign in with a Google account that hasn't been used before
4. Should redirect to `/onboarding`
5. Fill in first name, last name, select avatar
6. Click "Complete Profile"
7. Should redirect to `/dashboard`
8. Profile should be saved in Firestore

### Test Case 2: Existing Google User
1. Go to `/login` or `/signup`
2. Click "Continue with Google"
3. Sign in with a Google account that already has a profile
4. Should redirect directly to `/dashboard`

### Test Case 3: Email/Password Signup
1. Go to `/signup`
2. Fill in all fields (name, email, password, avatar)
3. Click "Let me in"
4. Should create profile and redirect to `/dashboard`
5. Profile should be saved in Firestore

## Next Steps

1. **Add Firestore Security Rules** (see above)
2. **Test with real Firebase project**
3. **Add error handling** for network issues
4. **Add loading states** during profile creation
5. **Consider adding profile completion progress** indicator
6. **Add ability to edit profile** in settings

## Notes

- The onboarding page uses the same avatar selection UI as the signup page
- User profiles are stored in Firestore for persistence
- The `isNewUser` state is managed in AuthContext
- All profile operations are centralized in `userService.ts`
- The flow works seamlessly for both login and signup pages
