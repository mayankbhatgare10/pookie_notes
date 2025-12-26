'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/hooks/useNotes';
import { useNoteLinks } from '@/hooks/useNoteLinks';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

export function useNoteLinking(note: Note | null | undefined, allNotes: Note[]) {
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [connectedNotes, setConnectedNotes] = useState<Note[]>([]);

    const { linkNotes, unlinkNotes, getConnectedNotes, syncCompletedItems } = useNoteLinks();
    const { showToast } = useToast();
    const { user } = useAuth();

    // Reload note with connections when note changes
    useEffect(() => {
        if (note?.id && user) {
            loadConnectedNotes();

            // Also reload the full note to get connectedNotes field
            const reloadNote = async () => {
                try {
                    const { getNote } = await import('@/lib/notesService');
                    const freshNote = await getNote(user.uid, note.id);
                    console.log('🔄 Reloaded note from Firestore:', {
                        noteId: note.id,
                        hasConnectedNotes: !!freshNote?.connectedNotes,
                        connectedNotes: freshNote?.connectedNotes
                    });
                    // Update the note reference if it has connections
                    if (freshNote?.connectedNotes) {
                        // The note object is immutable from props, but we can use it for sync
                        Object.assign(note, { connectedNotes: freshNote.connectedNotes });
                    }
                } catch (error) {
                    console.error('Error reloading note:', error);
                }
            };
            reloadNote();
        }
    }, [note?.id, user]);

    // Load connected notes when note changes
    useEffect(() => {
        if (note?.id) {
            loadConnectedNotes();
        }
    }, [note?.id]);

    const loadConnectedNotes = async () => {
        if (!note?.id) return;
        const notes = await getConnectedNotes(note.id);
        setConnectedNotes(notes);
    };

    const handleLinkNote = async (
        targetNoteId: string,
        connectionType: 'completion-sync' | 'reference' | 'bidirectional',
        autoSync: boolean
    ) => {
        if (!note?.id) return;

        await linkNotes({
            sourceNoteId: note.id,
            targetNoteId,
            connectionType,
            autoSync,
        });

        await loadConnectedNotes();
    };

    const handleUnlinkNote = async (targetNoteId: string) => {
        if (!note?.id) return;
        await unlinkNotes(note.id, targetNoteId);
        await loadConnectedNotes();
    };

    const handleSyncCompletedItems = async (content: string) => {
        if (!note?.id) return;

        console.log('🔍 handleSyncCompletedItems called', {
            noteId: note.id,
            hasConnections: !!note.connectedNotes,
            connectedNotes: note.connectedNotes,
            fullNote: note
        });

        // Sync if there are bidirectional OR completion-sync connections
        const hasSyncableConnections = note.connectedNotes?.some(
            conn => conn.connectionType === 'bidirectional' || conn.connectionType === 'completion-sync'
        );

        if (hasSyncableConnections) {
            console.log('✅ Has syncable connections, calling syncCompletedItems');
            await syncCompletedItems(note.id, content);
        } else {
            console.log('⚠️ No syncable connections found');
        }
    };

    return {
        showLinkModal,
        setShowLinkModal,
        showInfoPanel,
        setShowInfoPanel,
        connectedNotes,
        handleLinkNote,
        handleUnlinkNote,
        handleSyncCompletedItems,
    };
}
