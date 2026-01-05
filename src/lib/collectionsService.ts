import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    FieldValue,
} from 'firebase/firestore';
import bcrypt from 'bcryptjs';

export interface Collection {
    id: string;
    userId: string;
    name: string;
    emoji: string;
    tags: string[];
    isPrivate?: boolean;
    passwordHash?: string;
    createdAt: Timestamp | FieldValue | string;
}

export interface CreateCollectionData {
    name: string;
    emoji: string;
    tags?: string[];
    isPrivate?: boolean;
    password?: string;
}

export interface UpdateCollectionData {
    name?: string;
    emoji?: string;
    tags?: string[];
    isPrivate?: boolean;
    passwordHash?: string;
}

/**
 * Create a new collection for a user
 */
export async function createCollection(
    userId: string,
    collectionData: CreateCollectionData
): Promise<Collection> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionRef = doc(collection(db, 'users', userId, 'collections'));
        const now = serverTimestamp();

        // Hash password if provided
        let passwordHash: string | undefined;
        if (collectionData.isPrivate && collectionData.password) {
            passwordHash = await bcrypt.hash(collectionData.password, 10);
        }

        // Build collection object, only including passwordHash if it's defined
        const newCollection: any = {
            userId,
            name: collectionData.name,
            emoji: collectionData.emoji,
            tags: collectionData.tags || [],
            isPrivate: collectionData.isPrivate || false,
            createdAt: now,
        };

        // Only add passwordHash if it's defined (Firestore doesn't accept undefined values)
        if (passwordHash !== undefined) {
            newCollection.passwordHash = passwordHash;
        }

        await setDoc(collectionRef, newCollection);

        return {
            id: collectionRef.id,
            ...newCollection,
        } as Collection;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
}

/**
 * Get all collections for a user
 */
export async function getUserCollections(userId: string): Promise<Collection[]> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionsQuery = query(
            collection(db, 'users', userId, 'collections')
        );

        const snapshot = await getDocs(collectionsQuery);
        const collections = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Collection[];

        // Sort by createdAt client-side
        return collections.sort((a, b) => {
            const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
            const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
            return aTime - bTime;
        });
    } catch (error) {
        console.error('Error getting user collections:', error);
        throw error;
    }
}

/**
 * Get a specific collection by ID
 */
export async function getCollection(userId: string, collectionId: string): Promise<Collection | null> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionDoc = await getDoc(doc(db, 'users', userId, 'collections', collectionId));
        if (collectionDoc.exists()) {
            return {
                id: collectionDoc.id,
                ...collectionDoc.data(),
            } as Collection;
        }
        return null;
    } catch (error) {
        console.error('Error getting collection:', error);
        throw error;
    }
}

/**
 * Update a collection
 */
export async function updateCollection(
    userId: string,
    collectionId: string,
    updates: UpdateCollectionData
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionRef = doc(db, 'users', userId, 'collections', collectionId);
        await updateDoc(collectionRef, updates as any);
    } catch (error) {
        console.error('Error updating collection:', error);
        throw error;
    }
}

/**
 * Delete a collection
 */
export async function deleteCollection(userId: string, collectionId: string): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        await deleteDoc(doc(db, 'users', userId, 'collections', collectionId));
    } catch (error) {
        console.error('Error deleting collection:', error);
        throw error;
    }
}

/**
 * Add a tag to a collection
 */
export async function addTagToCollection(
    userId: string,
    collectionId: string,
    tag: string
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionDoc = await getCollection(userId, collectionId);
        if (!collectionDoc) {
            throw new Error('Collection not found');
        }

        const tags = collectionDoc.tags || [];
        if (!tags.includes(tag)) {
            tags.push(tag);
            await updateCollection(userId, collectionId, { tags });
        }
    } catch (error) {
        console.error('Error adding tag to collection:', error);
        throw error;
    }
}

/**
 * Remove a tag from a collection
 */
export async function removeTagFromCollection(
    userId: string,
    collectionId: string,
    tag: string
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionDoc = await getCollection(userId, collectionId);
        if (!collectionDoc) {
            throw new Error('Collection not found');
        }

        const tags = collectionDoc.tags || [];
        const updatedTags = tags.filter(t => t !== tag);
        await updateCollection(userId, collectionId, { tags: updatedTags });
    } catch (error) {
        console.error('Error removing tag from collection:', error);
        throw error;
    }
}

/**
 * Initialize default collections for a new user
 */
export async function initializeDefaultCollections(userId: string): Promise<void> {
    const defaultCollections = [
        { name: 'Movies', emoji: '🎬', tags: ['Action', 'Comedy', 'Drama'] },
        { name: 'Work', emoji: '💼', tags: ['Meeting', 'Project', 'Task'] },
        { name: 'Personal', emoji: '🏠', tags: ['Family', 'Health', 'Finance'] },
        { name: 'Ideas', emoji: '💡', tags: ['Business', 'Creative', 'Tech'] },
        { name: 'Travel', emoji: '✈️', tags: ['Plans', 'Bucket List', 'Memories'] },
        { name: 'Books', emoji: '📚', tags: [] },
        { name: 'Music', emoji: '🎵', tags: [] },
        { name: 'Recipes', emoji: '🍳', tags: [] },
        { name: 'Fitness', emoji: '💪', tags: [] },
        { name: 'Projects', emoji: '🚀', tags: [] },
    ];

    try {
        for (const collectionData of defaultCollections) {
            await createCollection(userId, collectionData);
        }
    } catch (error) {
        console.error('Error initializing default collections:', error);
        throw error;
    }
}
