'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { checkUserExists, createUserProfile } from '@/lib/userService';
import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isNewUser: boolean;
    signUp: (email: string, password: string, displayName: string, additionalData?: { firstName: string; lastName: string; avatar?: string }) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<{ isNewUser: boolean }>;
    checkUserProfile: (uid: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isNewUser: false,
    signUp: async () => { },
    signIn: async () => { },
    signInWithGoogle: async () => ({ isNewUser: false }),
    checkUserProfile: async () => false,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);



export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (!auth) {
            console.warn('⚠️ Firebase Auth not initialized. Please set up your Firebase credentials.');
            setLoading(false);
            return;
        }


        // Add event listeners (removed refresh interception)
        // Users can now refresh normally without popups

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('🔐 Auth state changed:', {
                hasUser: !!firebaseUser,
                isInitialMount: isInitialMount.current
            });

            if (firebaseUser) {
                // User is logged in - keep them logged in
                console.log('✅ User logged in');
                setUser(firebaseUser);
                isInitialMount.current = false;
            } else {
                // No user logged in
                console.log('👤 No user logged in');
                setUser(null);
                isInitialMount.current = false;
            }
            setLoading(false);
        });


        return () => {
            unsubscribe();
        };
    }, [user]);

    const signUp = async (
        email: string,
        password: string,
        displayName: string,
        additionalData?: { firstName: string; lastName: string; avatar?: string }
    ) => {
        if (!auth) {
            throw new Error('Firebase Auth is not initialized. Please set up your Firebase credentials.');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name
        if (userCredential.user) {
            await updateProfile(userCredential.user, {
                displayName: displayName,
            });

            // Create user profile in Firestore if additional data is provided
            if (additionalData) {
                await createUserProfile(userCredential.user, additionalData);
            }

            // Set active session flag (this will be cleared on page refresh)
            if (typeof window !== 'undefined') {
                (window as any).__pookie_session_active = true;
            }
        }
    };

    const signIn = async (email: string, password: string) => {
        if (!auth) {
            throw new Error('Firebase Auth is not initialized. Please set up your Firebase credentials.');
        }
        await signInWithEmailAndPassword(auth, email, password);

        // Set active session flag (this will be cleared on page refresh)
        if (typeof window !== 'undefined') {
            (window as any).__pookie_session_active = true;
        }
    };

    const checkUserProfile = async (uid: string): Promise<boolean> => {
        try {
            return await checkUserExists(uid);
        } catch (error) {
            console.error('Error checking user profile:', error);
            return false;
        }
    };

    const signInWithGoogle = async (): Promise<{ isNewUser: boolean }> => {
        if (!auth || !googleProvider) {
            throw new Error('Firebase Auth is not initialized. Please set up your Firebase credentials.');
        }

        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user profile exists in Firestore
        const userExists = await checkUserProfile(user.uid);
        setIsNewUser(!userExists);

        // Set active session flag (this will be cleared on page refresh)
        if (typeof window !== 'undefined') {
            (window as any).__pookie_session_active = true;
        }

        return { isNewUser: !userExists };
    };

    const logout = async () => {
        if (!auth) {
            throw new Error('Firebase Auth is not initialized. Please set up your Firebase credentials.');
        }

        // Clear session flag
        if (typeof window !== 'undefined') {
            delete (window as any).__pookie_session_active;
        }

        await signOut(auth);
        setIsNewUser(false);
    };


    const value = {
        user,
        loading,
        isNewUser,
        signUp,
        signIn,
        signInWithGoogle,
        checkUserProfile,
        logout,
    };

    // Show loader during initial auth check
    if (loading) {
        return <Loader />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
