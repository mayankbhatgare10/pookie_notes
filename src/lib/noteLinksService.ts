import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { Note, NoteConnection } from '@/hooks/useNotes';

export interface LinkNotesParams {
    userId: string;
    sourceNoteId: string;
    targetNoteId: string;
    connectionType: 'completion-sync' | 'reference' | 'bidirectional';
    autoSync?: boolean;
}

/**
 * Link two notes together
 */
export async function linkNotes({
    userId,
    sourceNoteId,
    targetNoteId,
    connectionType,
    autoSync = true,
}: LinkNotesParams): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const sourceRef = doc(db!, 'users', userId, 'notes', sourceNoteId);
    const targetRef = doc(db!, 'users', userId, 'notes', targetNoteId);

    // Verify both notes exist
    const [sourceSnap, targetSnap] = await Promise.all([
        getDoc(sourceRef),
        getDoc(targetRef),
    ]);

    console.log('Link Notes Debug:', {
        userId,
        sourceNoteId,
        targetNoteId,
        sourceExists: sourceSnap.exists(),
        targetExists: targetSnap.exists(),
        sourcePath: `users/${userId}/notes/${sourceNoteId}`,
        targetPath: `users/${userId}/notes/${targetNoteId}`,
    });

    if (!sourceSnap.exists() || !targetSnap.exists()) {
        throw new Error('One or both notes do not exist');
    }

    const now = new Date().toISOString();

    const sourceConnection: NoteConnection = {
        noteId: targetNoteId,
        connectionType,
        syncConfig: {
            autoSync,
            syncCompletedItems: connectionType === 'completion-sync',
        },
        createdAt: now,
    };

    const targetConnection: NoteConnection = {
        noteId: sourceNoteId,
        connectionType: connectionType === 'bidirectional' ? 'bidirectional' : 'reference',
        syncConfig: {
            autoSync: false,
            syncCompletedItems: false,
        },
        createdAt: now,
    };

    console.log('🔗 Creating connections:', {
        sourceConnection,
        targetConnection,
    });

    // Update both notes
    try {
        await Promise.all([
            updateDoc(sourceRef, {
                connectedNotes: arrayUnion(sourceConnection),
                'metadata.totalConnections': (sourceSnap.data().metadata?.totalConnections || 0) + 1,
                'metadata.lastModified': now,
            }),
            updateDoc(targetRef, {
                connectedNotes: arrayUnion(targetConnection),
                'metadata.totalConnections': (targetSnap.data().metadata?.totalConnections || 0) + 1,
                'metadata.lastModified': now,
            }),
        ]);
        console.log('✅ Notes linked successfully!');
    } catch (error) {
        console.error('❌ Error linking notes:', error);
        throw error;
    }
}

/**
 * Unlink two notes
 */
export async function unlinkNotes(
    userId: string,
    sourceNoteId: string,
    targetNoteId: string
): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const sourceRef = doc(db!, 'users', userId, 'notes', sourceNoteId);
    const targetRef = doc(db!, 'users', userId, 'notes', targetNoteId);

    const [sourceSnap, targetSnap] = await Promise.all([
        getDoc(sourceRef),
        getDoc(targetRef),
    ]);

    if (!sourceSnap.exists() || !targetSnap.exists()) {
        return;
    }

    const sourceData = sourceSnap.data();
    const targetData = targetSnap.data();

    // Find and remove connections
    const sourceConnections = (sourceData.connectedNotes || []).filter(
        (conn: NoteConnection) => conn.noteId !== targetNoteId
    );
    const targetConnections = (targetData.connectedNotes || []).filter(
        (conn: NoteConnection) => conn.noteId !== sourceNoteId
    );

    const now = new Date().toISOString();

    await Promise.all([
        updateDoc(sourceRef, {
            connectedNotes: sourceConnections,
            'metadata.totalConnections': Math.max(0, (sourceData.metadata?.totalConnections || 0) - 1),
            'metadata.lastModified': now,
        }),
        updateDoc(targetRef, {
            connectedNotes: targetConnections,
            'metadata.totalConnections': Math.max(0, (targetData.metadata?.totalConnections || 0) - 1),
            'metadata.lastModified': now,
        }),
    ]);
}

/**
 * Get all notes connected to a specific note
 */
export async function getConnectedNotes(
    userId: string,
    noteId: string
): Promise<Note[]> {
    if (!db) throw new Error('Firestore not initialized');

    const noteRef = doc(db!, 'users', userId, 'notes', noteId);
    const noteSnap = await getDoc(noteRef);

    if (!noteSnap.exists()) {
        return [];
    }

    const noteData = noteSnap.data();
    const connections: NoteConnection[] = noteData.connectedNotes || [];

    if (connections.length === 0) {
        return [];
    }

    // Fetch all connected notes
    const connectedNotesPromises = connections.map(async (conn) => {
        const connectedRef = doc(db!, 'users', userId, 'notes', conn.noteId);
        const connectedSnap = await getDoc(connectedRef);

        if (!connectedSnap.exists()) {
            return null;
        }

        return {
            id: connectedSnap.id,
            ...connectedSnap.data(),
        } as Note;
    });

    const connectedNotes = await Promise.all(connectedNotesPromises);
    return connectedNotes.filter((note): note is Note => note !== null);
}

/**
 * Sync completed checklist items from source to target note
 */
export async function syncCompletedItems(
    userId: string,
    sourceNoteId: string,
    sourceContent: string
): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    console.log('🔄 SYNC START:', { userId, sourceNoteId });

    const sourceRef = doc(db!, 'users', userId, 'notes', sourceNoteId);
    const sourceSnap = await getDoc(sourceRef);

    if (!sourceSnap.exists()) {
        console.log('❌ Source note does not exist');
        return;
    }

    const sourceData = sourceSnap.data();
    const connections: NoteConnection[] = sourceData.connectedNotes || [];
    console.log('📎 Connections found:', connections);

    // Sync to ALL bidirectional connections
    const syncConnections = connections.filter(
        (conn) => conn.connectionType === 'bidirectional' ||
            (conn.connectionType === 'completion-sync' && conn.syncConfig?.autoSync)
    );
    console.log('✅ Sync connections:', syncConnections);

    if (syncConnections.length === 0) {
        console.log('⚠️ No sync connections found');
        return;
    }

    // Extract completed items (☑)
    const completedItems = extractCompletedItems(sourceContent);
    console.log('📝 Completed items extracted:', completedItems);

    if (completedItems.length === 0) {
        console.log('⚠️ No completed items found');
        return;
    }

    // Update each connected note
    const updatePromises = syncConnections.map(async (conn) => {
        console.log('🎯 Syncing to note:', conn.noteId);
        const targetRef = doc(db!, 'users', userId, 'notes', conn.noteId);
        const targetSnap = await getDoc(targetRef);

        if (!targetSnap.exists()) {
            console.log('❌ Target note does not exist:', conn.noteId);
            return;
        }

        const targetData = targetSnap.data();
        let targetContent = targetData.content || '';
        console.log('📄 Current target content length:', targetContent.length);

        // Append completed items to target note
        const timestamp = new Date().toLocaleString();
        const itemsToAdd = completedItems
            .map((item) => `<p>✓ ${item} <em>(added ${timestamp})</em></p>`)
            .join('');

        targetContent += `\n${itemsToAdd}`;
        console.log('📝 New content to add:', itemsToAdd);

        await updateDoc(targetRef, {
            content: targetContent,
            'metadata.lastModified': new Date().toISOString(),
        });
        console.log('✅ Updated target note:', conn.noteId);

        // Emit event to notify that this note was updated
        if (typeof window !== 'undefined') {
            console.log('📡 Dispatching update event for note:', conn.noteId);
            window.dispatchEvent(new CustomEvent('note-content-updated', {
                detail: { noteId: conn.noteId, content: targetContent }
            }));
        }
    });

    await Promise.all(updatePromises);
    console.log('🎉 SYNC COMPLETE');
}

/**
 * Extract completed checklist items from HTML content
 */
function extractCompletedItems(htmlContent: string): string[] {
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    const completedItems: string[] = [];

    // Find all task items with data-checked="true"
    const taskItems = temp.querySelectorAll('li[data-checked="true"]');
    taskItems.forEach((item) => {
        const text = item.textContent?.trim() || '';
        if (text) {
            completedItems.push(text);
        }
    });

    return completedItems;
}

