import { db } from './firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { deleteCollection as deleteCollectionDoc } from './collectionsService';
import { moveNoteToCollection } from './notesService';

/**
 * Delete a collection and handle its notes
 * @param userId - User ID
 * @param collectionId - Collection to delete
 * @param action - What to do with notes: 'delete' or 'move'
 * @param targetCollectionId - If moving, which collection to move to
 */
export async function deleteCollectionWithNotes(
    userId: string,
    collectionId: string,
    action: 'delete' | 'move',
    targetCollectionId?: string
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        // Get all notes in this collection
        const notesQuery = query(
            collection(db, 'users', userId, 'notes'),
            where('collectionId', '==', collectionId)
        );

        const notesSnapshot = await getDocs(notesQuery);
        const noteIds = notesSnapshot.docs.map(doc => doc.id);

        if (action === 'move' && targetCollectionId) {
            // Move all notes to target collection
            for (const noteId of noteIds) {
                await moveNoteToCollection(userId, noteId, targetCollectionId);
            }
        } else if (action === 'delete') {
            // Delete all notes in batch
            const batch = writeBatch(db);
            notesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        // Finally, delete the collection
        await deleteCollectionDoc(userId, collectionId);
    } catch (error) {
        console.error('Error deleting collection with notes:', error);
        throw error;
    }
}

/**
 * Get count of notes in a collection
 */
export async function getCollectionNoteCount(
    userId: string,
    collectionId: string
): Promise<number> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const notesQuery = query(
            collection(db, 'users', userId, 'notes'),
            where('collectionId', '==', collectionId)
        );

        const snapshot = await getDocs(notesQuery);
        return snapshot.size;
    } catch (error) {
        console.error('Error getting collection note count:', error);
        return 0;
    }
}
