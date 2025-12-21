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
import RefreshConfirmModal from '@/components/RefreshConfirmModal';
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

// Session storage key
const SESSION_KEY = 'pookie_session_active';

// Sarcastic logout messages
const SARCASTIC_MESSAGES = [
    "Did you really just refresh? Rookie mistake! 🙄 Login again, genius.",
    "Oh great, you refreshed. Now I have trust issues. Login again! 😤",
    "Refresh = Logout. It's not rocket science! Try logging in again. 🚀",
    "You refreshed? Bold move. Now login again, smarty pants! 🤓",
    "Congrats! You discovered the logout button... I mean refresh. Login again! 🎉",
    "Refresh detected! Your session said 'peace out'. Login time! ✌️",
    "Did you think refreshing would work? Cute. Login again! 💅",
    "You refreshed. I logged you out. We're even. Now login! ⚖️",
    "Refresh = Trust broken. Login again to rebuild our relationship! 💔",
    "Oh look, someone hit F5! Now hit that login button again. 🔄"
];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);
    const [showLogoutToast, setShowLogoutToast] = useState(false);
    const [showRefreshModal, setShowRefreshModal] = useState(false);
    const isInitialMount = useRef(true);
    const pendingRefresh = useRef(false);

    useEffect(() => {
        if (!auth) {
            console.warn('⚠️ Firebase Auth not initialized. Please set up your Firebase credentials.');
            setLoading(false);
            return;
        }

        // Intercept refresh keyboard shortcuts (F5, Ctrl+R, Cmd+R)
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only intercept if user is logged in
            if (user && !pendingRefresh.current) {
                // F5 or Ctrl+R or Cmd+R
                if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
                    console.log('⚠️ Refresh shortcut detected - showing custom modal');
                    e.preventDefault();
                    e.stopPropagation();
                    setShowRefreshModal(true);
                }
            }
        };

        // Intercept page unload/refresh to show custom modal
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Only intercept if user is logged in and not already pending refresh
            if (user && !pendingRefresh.current) {
                console.log('⚠️ Page unload detected - showing modal');

                // Prevent the default unload
                e.preventDefault();

                // Show our custom modal
                setShowRefreshModal(true);

                // Set returnValue to trigger browser's confirmation as fallback
                // This is required by modern browsers
                e.returnValue = '';

                // Return empty string (browser will show generic message)
                return '';
            }
        };

        // Add event listeners
        if (user) {
            window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // Check if this is a page refresh using performance API
            const isPageRefresh = typeof window !== 'undefined' &&
                window.performance &&
                window.performance.navigation.type === 1;

            // Check if there's an active session flag (this is set on login and cleared on refresh)
            const hasActiveSession = typeof window !== 'undefined' &&
                (window as any).__pookie_session_active === true;

            console.log('🔐 Auth state changed:', {
                hasUser: !!firebaseUser,
                isInitialMount: isInitialMount.current,
                hasActiveSession,
                isPageRefresh,
                navigationType: window?.performance?.navigation?.type
            });

            if (firebaseUser) {
                // On initial mount, if user exists in Firebase but no session flag, it's a refresh
                if (isInitialMount.current && !hasActiveSession) {
                    console.log('🚪 Page refresh detected - logging out user');
                    // This is a page refresh - log them out
                    const randomMessage = SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)];

                    // Store the message to show after logout
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('logout_message', randomMessage);
                    }

                    if (auth) {
                        await signOut(auth);
                    }
                    setUser(null);
                    setShowLogoutToast(true);
                    isInitialMount.current = false;
                } else if (hasActiveSession) {
                    console.log('✅ Valid session - user stays logged in');
                    // Valid session, user stays logged in
                    setUser(firebaseUser);
                    isInitialMount.current = false;
                } else {
                    console.log('🆕 Fresh login - allowing user in');
                    // Fresh login (session will be set by login function)
                    setUser(firebaseUser);
                    isInitialMount.current = false;
                }
            } else {
                console.log('👤 No user logged in');
                // No user logged in
                setUser(null);
                isInitialMount.current = false;
            }
            setLoading(false);
        });

        // Show toast message if there's a logout message stored
        if (typeof window !== 'undefined') {
            const logoutMessage = sessionStorage.getItem('logout_message');
            if (logoutMessage) {
                setShowLogoutToast(true);
            }
        }

        return () => {
            unsubscribe();
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user]); // Add user to dependencies so listener updates

    // Effect to show toast message
    useEffect(() => {
        if (showLogoutToast && typeof window !== 'undefined') {
            const logoutMessage = sessionStorage.getItem('logout_message');
            if (logoutMessage) {
                console.log('🔔 Showing logout toast:', logoutMessage);
                // Delay to ensure toast system is ready
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('show-logout-toast', {
                        detail: { message: logoutMessage }
                    }));
                    sessionStorage.removeItem('logout_message');
                }, 300);
            }
            setShowLogoutToast(false);
        }
    }, [showLogoutToast]);

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

    // Handle refresh confirmation
    const handleConfirmRefresh = async () => {
        console.log('✅ User confirmed refresh - logging out');
        setShowRefreshModal(false);
        pendingRefresh.current = true;

        // Logout and show sarcastic message
        const randomMessage = SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)];

        // Clear session flag
        if (typeof window !== 'undefined') {
            delete (window as any).__pookie_session_active;
            sessionStorage.setItem('logout_message', randomMessage);
        }

        if (auth) {
            await signOut(auth);
        }

        setUser(null);

        // Redirect to login page instead of reloading
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    const handleCancelRefresh = () => {
        console.log('❌ User cancelled refresh');
        setShowRefreshModal(false);
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
            <RefreshConfirmModal
                isOpen={showRefreshModal}
                onConfirm={handleConfirmRefresh}
                onCancel={handleCancelRefresh}
            />
        </AuthContext.Provider>
    );
}
