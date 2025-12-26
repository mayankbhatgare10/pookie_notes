'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import {
    getUserNotes,
    createNote as createNoteService,
    updateNote as updateNoteService,
    deleteNote as deleteNoteService,
    toggleStarNote,
    toggleArchiveNote,
    moveNoteToCollection,
    CreateNoteData,
} from '@/lib/notesService';
import { Timestamp } from 'firebase/firestore';

export interface NoteConnection {
    noteId: string;
    connectionType: 'completion-sync' | 'reference' | 'bidirectional';
    syncConfig?: {
        autoSync: boolean;
        syncCompletedItems: boolean;
    };
    createdAt: string;
}

export interface NoteMetadata {
    createdAt: string;
    lastModified: string;
    totalConnections: number;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    color: string;
    lastEdited: string;
    isStarred: boolean;
    isArchived: boolean;
    collectionId: string | null;
    isPrivate: boolean;
    passwordHash?: string;
    createdAt: string;
    connectedNotes?: NoteConnection[];
    metadata?: NoteMetadata;
}

// Helper function to format timestamp
const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Just now';

    if (timestamp instanceof Timestamp) {
        const date = timestamp.toDate();
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `Updated ${diffMins}m ago`;
        if (diffHours < 24) return `Updated ${diffHours}h ago`;
        if (diffDays < 7) return `Updated ${diffDays}d ago`;
        return `Updated ${date.toLocaleDateString()}`;
    }

    return timestamp;
};

export const useNotes = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    // Load notes when user changes
    useEffect(() => {
        if (user) {
            loadNotes();
        } else {
            setNotes([]);
            setLoading(false);
        }
    }, [user]);

    const loadNotes = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userNotes = await getUserNotes(user.uid);

            // Convert Firebase notes to UI format
            const formattedNotes = userNotes.map(note => ({
                id: note.id,
                title: note.title,
                content: note.content,
                color: note.color,
                lastEdited: formatTimestamp(note.lastEdited),
                isStarred: note.isStarred,
                isArchived: note.isArchived,
                collectionId: note.collectionId,
                isPrivate: note.isPrivate,
                passwordHash: note.passwordHash,
                createdAt: formatTimestamp(note.createdAt),
            }));

            setNotes(formattedNotes);
        } catch (error) {
            console.error('Error loading notes:', error);
            showToast('Failed to load notes. Please try again. 😢', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async (noteData: CreateNoteData): Promise<Note> => {
        if (!user) {
            throw new Error('User must be logged in to create notes');
        }

        try {
            const newNote = await createNoteService(user.uid, noteData);

            const formattedNote: Note = {
                id: newNote.id,
                title: newNote.title,
                content: newNote.content,
                color: newNote.color,
                lastEdited: 'Just now',
                isStarred: newNote.isStarred,
                isArchived: newNote.isArchived,
                collectionId: newNote.collectionId,
                isPrivate: newNote.isPrivate,
                passwordHash: newNote.passwordHash,
                createdAt: 'Just now',
            };

            setNotes([formattedNote, ...notes]);
            showToast(`Note "${noteData.title}" created! Time to fill it with genius... or memes. 📝`, 'success');

            return formattedNote;
        } catch (error) {
            console.error('Error creating note:', error);
            showToast('Failed to create note. Please try again. 😢', 'error');
            throw error;
        }
    };

    const handleSaveNote = async (noteId: string, title: string, updatedContent: string) => {
        try {
            if (!user) return;
            await updateNoteService(user.uid, noteId, {
                title,
                content: updatedContent
            });

            setNotes(notes.map(note =>
                note.id === noteId
                    ? { ...note, title, content: updatedContent, lastEdited: 'Just now' }
                    : note
            ));

            showToast('Changes saved! Your brilliance has been preserved. ✨', 'success');
        } catch (error) {
            console.error('Error saving note:', error);
            showToast('Failed to save note. Please try again. 😢', 'error');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        const note = notes.find(n => n.id === noteId);

        try {
            if (!user) return;
            await deleteNoteService(user.uid, noteId);
            setNotes(notes.filter(note => note.id !== noteId));
            showToast(`"${note?.title || 'Note'}" deleted! Gone, but not forgotten... actually, yeah, forgotten. 🗑️`, 'success');
        } catch (error) {
            console.error('Error deleting note:', error);
            showToast('Failed to delete note. Please try again. 😢', 'error');
        }
    };

    const handleStarNote = async (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        const willBeStarred = !note?.isStarred;

        try {
            if (!user) return;
            await toggleStarNote(user.uid, noteId, willBeStarred);

            setNotes(notes.map(note =>
                note.id === noteId
                    ? { ...note, isStarred: !note.isStarred }
                    : note
            ));

            if (willBeStarred) {
                showToast('Note starred! Look at you, playing favorites. ⭐', 'success');
            } else {
                showToast('Star removed. Guess it wasn\'t that special after all. 💔', 'info');
            }
        } catch (error) {
            console.error('Error starring note:', error);
            showToast('Failed to update note. Please try again. 😢', 'error');
        }
    };

    const handleArchiveNote = async (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        const willBeArchived = !note?.isArchived;

        try {
            if (!user) return;
            await toggleArchiveNote(user.uid, noteId, willBeArchived);

            setNotes(notes.map(note =>
                note.id === noteId
                    ? { ...note, isArchived: !note.isArchived }
                    : note
            ));

            if (willBeArchived) {
                showToast('Note archived! Out of sight, out of mind... until you need it. 📦', 'success');
            } else {
                showToast('Note unarchived! Welcome back to the chaos. 🎉', 'success');
            }
        } catch (error) {
            console.error('Error archiving note:', error);
            showToast('Failed to update note. Please try again. 😢', 'error');
        }
    };

    const handleMoveToCollection = async (noteId: string, newCollectionId: string | null) => {
        try {
            if (!user) return;
            await moveNoteToCollection(user.uid, noteId, newCollectionId);

            setNotes(notes.map(note =>
                note.id === noteId
                    ? { ...note, collectionId: newCollectionId }
                    : note
            ));

            if (newCollectionId) {
                showToast('Note moved to collection! Organization level: slightly less chaotic. 📂', 'success');
            } else {
                showToast('Note removed from collection! Back to the wild. 🌿', 'info');
            }
        } catch (error) {
            console.error('Error moving note:', error);
            showToast('Failed to move note. Please try again. 😢', 'error');
        }
    };

    return {
        notes,
        setNotes,
        loading,
        handleCreateNote,
        handleSaveNote,
        handleDeleteNote,
        handleStarNote,
        handleArchiveNote,
        handleMoveToCollection,
        refreshNotes: loadNotes,
    };
};
