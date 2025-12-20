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

export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string;
    color: string;
    lastEdited: Timestamp | FieldValue | string;
    isStarred: boolean;
    isArchived: boolean;
    collectionId: string | null;
    isPrivate: boolean;
    passwordHash?: string; // Optional: only for private notes
    createdAt: Timestamp | FieldValue | string;
    updatedAt: Timestamp | FieldValue | string;
}

export interface CreateNoteData {
    title: string;
    content?: string;
    color: string;
    collectionId?: string | null;
    isPrivate?: boolean;
    password?: string; // Plain password (will be hashed before storing)
}

export interface UpdateNoteData {
    title?: string;
    content?: string;
    color?: string;
    isStarred?: boolean;
    isArchived?: boolean;
    collectionId?: string | null;
    isPrivate?: boolean;
    passwordHash?: string; // Hashed password
}

/**
 * Create a new note for a user
 */
export async function createNote(
    userId: string,
    noteData: CreateNoteData
): Promise<Note> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const noteRef = doc(collection(db, 'notes'));
        const now = serverTimestamp();

        // Hash password if provided
        let passwordHash: string | undefined;
        if (noteData.isPrivate && noteData.password) {
            passwordHash = await bcrypt.hash(noteData.password, 10);
        }

        const note: Omit<Note, 'id'> = {
            userId,
            title: noteData.title,
            content: noteData.content || '',
            color: noteData.color,
            lastEdited: now,
            isStarred: false,
            isArchived: false,
            collectionId: noteData.collectionId || null,
            isPrivate: noteData.isPrivate || false,
            passwordHash,
            createdAt: now,
            updatedAt: now,
        };

        await setDoc(noteRef, note);

        return {
            id: noteRef.id,
            ...note,
        } as Note;
    } catch (error) {
        console.error('Error creating note:', error);
        throw error;
    }
}

/**
 * Get all notes for a user
 */
export async function getUserNotes(userId: string): Promise<Note[]> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', userId)
            // Removed orderBy to avoid index requirement - will sort client-side
        );

        const snapshot = await getDocs(notesQuery);
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Note[];

        // Sort by updatedAt client-side (most recent first)
        return notes.sort((a, b) => {
            const aTime = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : 0;
            const bTime = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : 0;
            return bTime - aTime; // Descending order
        });
    } catch (error) {
        console.error('Error getting user notes:', error);
        throw error;
    }
}

/**
 * Get a specific note by ID
 */
export async function getNote(noteId: string): Promise<Note | null> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const noteDoc = await getDoc(doc(db, 'notes', noteId));
        if (noteDoc.exists()) {
            return {
                id: noteDoc.id,
                ...noteDoc.data(),
            } as Note;
        }
        return null;
    } catch (error) {
        console.error('Error getting note:', error);
        throw error;
    }
}

/**
 * Update a note
 */
export async function updateNote(
    noteId: string,
    updates: UpdateNoteData
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const noteRef = doc(db, 'notes', noteId);
        await updateDoc(noteRef, {
            ...updates,
            lastEdited: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating note:', error);
        throw error;
    }
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
}

/**
 * Toggle star status of a note
 */
export async function toggleStarNote(noteId: string, isStarred: boolean): Promise<void> {
    await updateNote(noteId, { isStarred });
}

/**
 * Toggle archive status of a note
 */
export async function toggleArchiveNote(noteId: string, isArchived: boolean): Promise<void> {
    await updateNote(noteId, { isArchived });
}

/**
 * Move note to a different collection
 */
export async function moveNoteToCollection(
    noteId: string,
    collectionId: string | null
): Promise<void> {
    await updateNote(noteId, { collectionId });
}

/**
 * Get notes by collection
 */
export async function getNotesByCollection(
    userId: string,
    collectionId: string | null
): Promise<Note[]> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', userId),
            where('collectionId', '==', collectionId)
            // Removed orderBy to avoid index requirement
        );

        const snapshot = await getDocs(notesQuery);
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Note[];

        // Sort client-side
        return notes.sort((a, b) => {
            const aTime = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : 0;
            const bTime = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : 0;
            return bTime - aTime;
        });
    } catch (error) {
        console.error('Error getting notes by collection:', error);
        throw error;
    }
}

/**
 * Get starred notes
 */
export async function getStarredNotes(userId: string): Promise<Note[]> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', userId),
            where('isStarred', '==', true)
            // Removed orderBy to avoid index requirement
        );

        const snapshot = await getDocs(notesQuery);
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Note[];

        // Sort client-side
        return notes.sort((a, b) => {
            const aTime = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : 0;
            const bTime = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : 0;
            return bTime - aTime;
        });
    } catch (error) {
        console.error('Error getting starred notes:', error);
        throw error;
    }
}

/**
 * Get archived notes
 */
export async function getArchivedNotes(userId: string): Promise<Note[]> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', userId),
            where('isArchived', '==', true)
            // Removed orderBy to avoid index requirement
        );

        const snapshot = await getDocs(notesQuery);
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Note[];

        // Sort client-side
        return notes.sort((a, b) => {
            const aTime = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : 0;
            const bTime = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : 0;
            return bTime - aTime;
        });
    } catch (error) {
        console.error('Error getting archived notes:', error);
        throw error;
    }
}
