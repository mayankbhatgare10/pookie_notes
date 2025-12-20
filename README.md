<div align="center">
  <img src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG" alt="Pookie Notes Logo" width="200"/>
  
  # 📝 Pookie Notes
  ### *Your chaos, beautifully organized* ✨
  
  A super minimal and aesthetic notes application with Firebase integration.  
  Built with Next.js, TypeScript, and a whole lot of sarcasm.
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
  
  [Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation) • [License](#-license)
  
</div>

---

## 🎯 Overview

**Pookie Notes** is a modern, full-stack notes application that combines beautiful design with powerful functionality. Whether you're organizing your thoughts, managing projects, or just hoarding ideas, Pookie Notes makes it fun and effortless.

### Why Pookie Notes?

- 🎨 **Beautiful UI** - Minimal, aesthetic design that's a joy to use
- 🔐 **Secure** - Firebase authentication with Google OAuth support
- 📱 **Responsive** - Works flawlessly on mobile, tablet, and desktop
- ⚡ **Fast** - Optimized performance with Next.js 15
- 😎 **Personality** - Sarcastic messages that make you smile
- 🔄 **Real-time** - All your data synced instantly with Firebase

---

## ✨ Features

### 🔐 Authentication
- **Email/Password** authentication
- **Google OAuth** sign-in
- Secure session management
- Sarcastic logout warnings on refresh

### 📝 Rich Text Editor
- **TipTap** powered editor with full formatting
- **Tag insertion** - Quick tags from collections
- **Color highlighting** - Custom text colors
- **Drawing support** - Sketch and insert drawings
- **Code blocks** - Syntax highlighting
- **Task lists** - Interactive checkboxes
- **Image support** - Inline images

### 📂 Collections (Hoards)
- **Custom collections** with emojis and names
- **Tag management** - Organize with custom tags
- **Color-coded** note cards
- **10 default collections** for new users
- **Move notes** between collections

### ⭐ Note Management
- **Create, Edit, Delete** notes
- **Star** important notes
- **Archive** old notes
- **Color coding** - 8 beautiful colors
- **Privacy toggle** - Mark notes as private
- **Search & Filter** - Find notes quickly

### 🎨 User Experience
- **Sarcastic toasts** - Fun error/success messages
- **Loading animations** - Beautiful loader with rotating memes
- **Responsive design** - Mobile-first approach
- **Dark patterns** - Smooth gradients and shadows
- **Keyboard shortcuts** - Efficient navigation

---

## 🚀 Demo

### Live Demo

**🎉 [Try Pookie Notes Live!](https://pookie-notes.mayankbhatgare.dev)**

Experience the full app with all features - create notes, organize collections, and enjoy the sarcastic UI!

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ or **Bun** runtime
- **Firebase** account ([Create one here](https://console.firebase.google.com))
- **Git** installed

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/pookie-notes.git
cd pookie-notes
```

### Step 2: Install Dependencies

Using **Bun** (recommended):
```bash
bun install
```

Or using **npm**:
```bash
npm install
```

### Step 3: Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add Project"
   - Follow the setup wizard

2. **Enable Authentication**
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**
   - Enable **Google** provider

3. **Enable Firestore Database**
   - Go to **Firestore Database**
   - Click "Create database"
   - Start in **test mode** (we'll add security rules later)

4. **Get Firebase Config**
   - Go to **Project Settings** → **General**
   - Scroll to "Your apps" → Click web icon
   - Copy your Firebase configuration

### Step 4: Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 5: Run Development Server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

---

## 🎯 Usage

### Creating Your First Note

1. **Sign up** with email or Google
2. Complete **onboarding** (choose your avatar)
3. Click the **"New Note!"** card
4. Enter a title and start writing
5. Assign to a collection (optional)
6. Click **Save** - your note is now in Firebase!

### Managing Collections

1. Click **"Hoards"** button in the header
2. Click **"Add New"** to create a collection
3. Choose an emoji, name, and tags
4. Click **"Create Hoard"**
5. Organize your notes by collection!

### Organizing Notes

| Action | How To |
|--------|--------|
| **Star** | Click the star icon on any note |
| **Archive** | Click the archive icon to hide notes |
| **Move** | Click move icon → Select new collection |
| **Delete** | Click trash icon (permanent!) |
| **Edit** | Click on any note card to open editor |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F5` or `Ctrl+R` | Refresh warning modal |
| `/` | Command menu in editor |
| `Ctrl+B` | Bold text |
| `Ctrl+I` | Italic text |
| `Ctrl+U` | Underline text |

---

## 📁 Project Structure

```
pookie-notes/
├── .agent/                      # Agent documentation
├── public/                      # Static assets
│   ├── loading-animation.svg    # Loader animation
│   └── ...
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── dashboard/           # Dashboard route
│   │   ├── login/               # Login route
│   │   ├── signup/              # Signup route
│   │   ├── onboarding/          # Onboarding route
│   │   ├── settings/            # Settings route
│   │   ├── forgot-password/     # Password reset route
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── not-found.tsx        # 404 page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Banner.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── NotesSection.tsx
│   │   ├── editor/              # Editor components
│   │   │   ├── EditorToolbar.tsx
│   │   │   └── ExportMenu.tsx
│   │   ├── CollectionsGrid.tsx  # Collections modal
│   │   ├── NewCollectionModal.tsx
│   │   ├── NewNoteModal.tsx
│   │   ├── NoteCard.tsx
│   │   ├── NoteEditor.tsx       # TipTap editor
│   │   ├── MoveNoteModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── RefreshConfirmModal.tsx
│   │   ├── Loader.tsx           # Loading component
│   │   ├── TagNode.tsx          # Custom tag node
│   │   └── icons/               # Icon components
│   │
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ToastContext.tsx     # Toast notifications
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useNotes.ts          # Notes management
│   │   └── useCollections.ts    # Collections management
│   │
│   ├── lib/                     # Firebase & utilities
│   │   ├── firebase.ts          # Firebase config
│   │   ├── userService.ts       # User operations
│   │   ├── notesService.ts      # Notes CRUD
│   │   ├── collectionsService.ts # Collections CRUD
│   │   └── cleanupData.ts       # Cleanup utility
│   │
│   ├── page-components/         # Page-level components
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   │
│   └── utils/                   # Helper functions
│       └── constants.ts         # App constants
│
├── .env.local                   # Environment variables (create this)
├── .env.local.example           # Example env file
├── .eslintrc.json               # ESLint config
├── .gitignore                   # Git ignore rules
├── bun.lock                     # Bun lockfile
├── next.config.ts               # Next.js config
├── package.json                 # Dependencies
├── postcss.config.mjs           # PostCSS config
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
├── FIREBASE_SETUP.md            # Firebase setup guide
├── QUICKSTART.md                # Quick start guide
├── LICENSE                      # MIT License
└── README.md                    # This file
```

---

## 🔥 Firebase Configuration

### Firestore Collections

The app uses three main Firestore collections:

#### 1. **users** Collection
```typescript
{
  uid: string;              // User ID (matches Firebase Auth)
  email: string;            // User email
  displayName: string;      // Full name
  firstName: string;        // First name
  lastName: string;         // Last name
  avatar?: string;          // Avatar URL (optional)
  createdAt: Timestamp;     // Account creation time
  updatedAt: Timestamp;     // Last update time
}
```

#### 2. **notes** Collection
```typescript
{
  id: string;               // Auto-generated note ID
  userId: string;           // Owner's user ID
  title: string;            // Note title
  content: string;          // HTML content from TipTap
  color: string;            // Note card color
  isStarred: boolean;       // Star status
  isArchived: boolean;      // Archive status
  isPrivate: boolean;       // Privacy toggle
  collectionId: string | null; // Parent collection ID
  createdAt: Timestamp;     // Creation time
  updatedAt: Timestamp;     // Last update time
  lastEdited: Timestamp;    // Last edit time
}
```

#### 3. **collections** Collection
```typescript
{
  id: string;               // Auto-generated collection ID
  userId: string;           // Owner's user ID
  name: string;             // Collection name
  emoji: string;            // Collection emoji
  tags: string[];           // Array of tags
  createdAt: Timestamp;     // Creation time
  updatedAt: Timestamp;     // Last update time
}
```

### Security Rules

Add these rules in **Firebase Console** → **Firestore** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notes are private to the user
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Collections are private to the user
    match /collections/{collectionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.5.9](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TipTap](https://tiptap.dev/)** - Headless rich text editor

### Backend & Database
- **[Firebase Authentication](https://firebase.google.com/products/auth)** - User authentication
- **[Cloud Firestore](https://firebase.google.com/products/firestore)** - NoSQL database
- **[Firebase Hosting](https://firebase.google.com/products/hosting)** - Static hosting (optional)

### Development Tools
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime
- **[ESLint](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing

---

## 📱 Responsive Design

Pookie Notes is built with a **mobile-first** approach and works flawlessly across all devices:

| Device | Breakpoint | Layout |
|--------|------------|--------|
| 📱 **Mobile** | < 768px | Single column, hamburger menu |
| 📱 **Tablet** | 768px - 1024px | 2 columns, visible sidebar |
| 💻 **Laptop** | 1024px - 1280px | 3 columns, full sidebar |
| 🖥️ **Desktop** | > 1280px | 4 columns, optimal spacing |

### Responsive Features
- ✅ Collapsible sidebar on mobile
- ✅ Adaptive grid layouts
- ✅ Touch-friendly buttons (min 44px)
- ✅ Responsive typography
- ✅ Mobile-optimized modals

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Click "Deploy"

3. **Done!** Your app is live! 🎉

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build the app
bun run build

# Deploy
firebase deploy
```

---

## 🧪 Testing

### Run Development Server
```bash
bun dev
```

### Build for Production
```bash
bun run build
```

### Start Production Server
```bash
bun start
```

### Lint Code
```bash
bun run lint
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Firebase not initialized" error
**Solution:** Make sure `.env.local` exists with valid Firebase credentials. All variables must be prefixed with `NEXT_PUBLIC_`.

#### Old test data showing up
**Solution:** Delete old data from Firebase Console:
1. Go to Firestore Database
2. Delete documents in `collections` and `notes` collections
3. Refresh your app

#### Build errors
**Solution:**
```bash
# Clear build cache
rm -rf .next

# Reinstall dependencies
bun install

# Rebuild
bun run build
```

#### Session logout on refresh
**Solution:** This is intentional! It's a security feature. Click "Nah, Stay Here" to cancel the refresh.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Mayank Bhatgare

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

**Mayank Bhatgare**

- GitHub: [@mayankbhatgare10](https://github.com/mayankbhatgare10)
- Email: mayankbhatgare10@gmail.com

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Firebase Team** - For the powerful backend
- **TipTap Team** - For the excellent editor
- **Tailwind CSS** - For the beautiful styling
- **You** - For using Pookie Notes! ❤️

---

## 📚 Additional Resources

- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [Quick Start Guide](QUICKSTART.md)
- [API Documentation](#) (Coming soon)
- [Contributing Guidelines](#) (Coming soon)

---

<div align="center">
  
  ### ⭐ Star this repo if you like it!
  
  Made with ❤️ and a whole lot of sarcasm
  
  **[Report Bug](https://github.com/yourusername/pookie-notes/issues)** • **[Request Feature](https://github.com/yourusername/pookie-notes/issues)**
  
</div>
