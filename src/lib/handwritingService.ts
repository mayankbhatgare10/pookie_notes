import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    getDocs,
} from 'firebase/firestore';
import { HandwritingBlockData } from '@/types/handwriting';

/**
 * Save a handwriting block to Firestore
 */
export async function saveHandwritingBlock(
    userId: string,
    noteId: string,
    blockId: string,
    data: Omit<HandwritingBlockData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const blockRef = doc(
            db,
            'users',
            userId,
            'notes',
            noteId,
            'handwritingBlocks',
            blockId
        );

        // Check if block exists to preserve createdAt
        const existingBlock = await getDoc(blockRef);
        const now = new Date().toISOString();

        await setDoc(blockRef, {
            id: blockId,
            ...data,
            createdAt: existingBlock.exists()
                ? existingBlock.data().createdAt
                : now,
            updatedAt: now,
        });

        console.log('✅ Handwriting block saved:', blockId);
    } catch (error) {
        console.error('❌ Error saving handwriting block:', error);
        throw error;
    }
}

/**
 * Load a handwriting block from Firestore
 */
export async function loadHandwritingBlock(
    userId: string,
    noteId: string,
    blockId: string
): Promise<HandwritingBlockData | null> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const blockRef = doc(
            db,
            'users',
            userId,
            'notes',
            noteId,
            'handwritingBlocks',
            blockId
        );

        const snapshot = await getDoc(blockRef);

        if (snapshot.exists()) {
            console.log('✅ Handwriting block loaded:', blockId);
            return snapshot.data() as HandwritingBlockData;
        }

        console.log('⚠️ Handwriting block not found:', blockId);
        return null;
    } catch (error) {
        console.error('❌ Error loading handwriting block:', error);
        throw error;
    }
}

/**
 * Delete a handwriting block from Firestore
 */
export async function deleteHandwritingBlock(
    userId: string,
    noteId: string,
    blockId: string
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const blockRef = doc(
            db,
            'users',
            userId,
            'notes',
            noteId,
            'handwritingBlocks',
            blockId
        );

        await deleteDoc(blockRef);
        console.log('✅ Handwriting block deleted:', blockId);
    } catch (error) {
        console.error('❌ Error deleting handwriting block:', error);
        throw error;
    }
}

/**
 * Load all handwriting blocks for a note
 */
export async function loadAllHandwritingBlocks(
    userId: string,
    noteId: string
): Promise<Record<string, HandwritingBlockData>> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const blocksRef = collection(
            db,
            'users',
            userId,
            'notes',
            noteId,
            'handwritingBlocks'
        );

        const snapshot = await getDocs(blocksRef);
        const blocks: Record<string, HandwritingBlockData> = {};

        snapshot.forEach((doc) => {
            blocks[doc.id] = doc.data() as HandwritingBlockData;
        });

        console.log(
            `✅ Loaded ${Object.keys(blocks).length} handwriting blocks for note:`,
            noteId
        );
        return blocks;
    } catch (error) {
        console.error('❌ Error loading handwriting blocks:', error);
        throw error;
    }
}

/**
 * Delete all handwriting blocks for a note (cleanup when note is deleted)
 */
export async function deleteAllHandwritingBlocks(
    userId: string,
    noteId: string
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const blocksRef = collection(
            db,
            'users',
            userId,
            'notes',
            noteId,
            'handwritingBlocks'
        );

        const snapshot = await getDocs(blocksRef);
        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));

        await Promise.all(deletePromises);
        console.log('✅ All handwriting blocks deleted for note:', noteId);
    } catch (error) {
        console.error('❌ Error deleting handwriting blocks:', error);
        throw error;
    }
}

/**
 * Save ink strokes for a note (full-canvas overlay mode)
 */
export async function saveInkStrokes(
    userId: string,
    noteId: string,
    strokes: any[]
): Promise<void> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const noteRef = doc(db, 'users', userId, 'notes', noteId);

        await setDoc(noteRef, {
            inkStrokes: strokes,
            inkUpdatedAt: new Date().toISOString(),
        }, { merge: true });

        console.log('✅ Ink strokes saved for note:', noteId, '| Count:', strokes.length);
    } catch (error) {
        console.error('❌ Error saving ink strokes:', error);
        throw error;
    }
}

/**
 * Load ink strokes for a note
 */
export async function loadInkStrokes(
    userId: string,
    noteId: string
): Promise<any[]> {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        const noteRef = doc(db, 'users', userId, 'notes', noteId);
        const snapshot = await getDoc(noteRef);

        if (snapshot.exists()) {
            const data = snapshot.data();
            const strokes = data.inkStrokes || [];
            console.log('📥 Loaded ink strokes for note:', noteId, '| Count:', strokes.length);
            return strokes;
        }

        console.log('⚠️ No ink strokes found for note:', noteId);
        return [];
    } catch (error) {
        console.error('❌ Error loading ink strokes:', error);
        throw error;
    }
}
