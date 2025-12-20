import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { initializeDefaultCollections } from './collectionsService';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    createdAt: any;
    updatedAt: any;
}

/**
 * Check if a user profile exists in Firestore
 */
export async function checkUserExists(uid: string): Promise<boolean> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.exists();
    } catch (error) {
        console.error('Error checking user existence:', error);
        throw error;
    }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

/**
 * Create a new user profile in Firestore
 */
export async function createUserProfile(
    user: User,
    additionalData: {
        firstName: string;
        lastName: string;
        avatar?: string;
    }
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: `${additionalData.firstName} ${additionalData.lastName}`,
            firstName: additionalData.firstName,
            lastName: additionalData.lastName,
            avatar: additionalData.avatar,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);

        // Initialize default collections for the new user
        await initializeDefaultCollections(user.uid);
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
    uid: string,
    data: Partial<UserProfile>
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        await setDoc(
            doc(db, 'users', uid),
            {
                ...data,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}
