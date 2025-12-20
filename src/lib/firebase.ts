// Firebase configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Validate environment variables
const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
);

if (missingVars.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingVars);
    console.error('📝 Please create a .env.local file with your Firebase credentials.');
    console.error('📖 See FIREBASE_SETUP.md for instructions.');
}

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('📝 Make sure you have created .env.local with valid Firebase credentials.');
    console.error('📖 See FIREBASE_SETUP.md for setup instructions.');
}

export { auth, googleProvider, db };
export default app;
