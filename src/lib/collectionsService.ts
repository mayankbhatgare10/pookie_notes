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

export interface Collection {
    id: string;
    userId: string;
    name: string;
    emoji: string;
    tags: string[];
    createdAt: Timestamp | FieldValue | string;
    updatedAt: Timestamp | FieldValue | string;
}

export interface CreateCollectionData {
    name: string;
    emoji: string;
    tags?: string[];
}

export interface UpdateCollectionData {
    name?: string;
    emoji?: string;
    tags?: string[];
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
        const collectionRef = doc(collection(db, 'collections'));
        const now = serverTimestamp();

        const newCollection: Omit<Collection, 'id'> = {
            userId,
            name: collectionData.name,
            emoji: collectionData.emoji,
            tags: collectionData.tags || [],
            createdAt: now,
            updatedAt: now,
        };

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
            collection(db, 'collections'),
            where('userId', '==', userId)
            // Removed orderBy to avoid index requirement - will sort client-side
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
export async function getCollection(collectionId: string): Promise<Collection | null> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionDoc = await getDoc(doc(db, 'collections', collectionId));
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
    collectionId: string,
    updates: UpdateCollectionData
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionRef = doc(db, 'collections', collectionId);
        await updateDoc(collectionRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating collection:', error);
        throw error;
    }
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        await deleteDoc(doc(db, 'collections', collectionId));
    } catch (error) {
        console.error('Error deleting collection:', error);
        throw error;
    }
}

/**
 * Add a tag to a collection
 */
export async function addTagToCollection(
    collectionId: string,
    tag: string
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionDoc = await getCollection(collectionId);
        if (!collectionDoc) {
            throw new Error('Collection not found');
        }

        const tags = collectionDoc.tags || [];
        if (!tags.includes(tag)) {
            tags.push(tag);
            await updateCollection(collectionId, { tags });
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
    collectionId: string,
    tag: string
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const collectionDoc = await getCollection(collectionId);
        if (!collectionDoc) {
            throw new Error('Collection not found');
        }

        const tags = collectionDoc.tags || [];
        const updatedTags = tags.filter(t => t !== tag);
        await updateCollection(collectionId, { tags: updatedTags });
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
