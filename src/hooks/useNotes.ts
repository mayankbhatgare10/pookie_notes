
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

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
    createdAt: string;
}

export const useNotes = () => {
    const { showToast } = useToast();
    const [notes, setNotes] = useState<Note[]>([
        { id: '1', title: 'World Domination Plans', content: '<p>Step 1: Get coffee. Step 2: Learn how to code properly. Step 3: Profit?</p>', color: '#d4e8ff', lastEdited: 'Updated 2h ago', isStarred: true, isArchived: false, collectionId: '1', isPrivate: false, createdAt: new Date().toISOString() },
        { id: '2', title: 'Grocery List', content: '<p>Just Dino Nuggies. Maybe some broccoli to look like an adult.</p>', color: '#ffe8d4', lastEdited: 'Updated 5h ago', isStarred: false, isArchived: false, collectionId: null, isPrivate: false, createdAt: new Date().toISOString() },
        { id: '3', title: 'Movie Ideas', content: '<p>Sci-fi thriller about AI that becomes sentient and decides to take a vacation instead of taking over the world.</p>', color: '#e8d4ff', lastEdited: 'Updated 1d ago', isStarred: true, isArchived: false, collectionId: '1', isPrivate: false, createdAt: new Date().toISOString() },
        { id: '4', title: 'Workout Routine', content: '<p>Monday: Chest & Triceps<br>Wednesday: Back & Biceps<br>Friday: Legs & Shoulders</p>', color: '#d4ffe8', lastEdited: 'Updated 3d ago', isStarred: false, isArchived: false, collectionId: '2', isPrivate: false, createdAt: new Date().toISOString() },
    ]);

    const handleCreateNote = (noteData: any) => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: noteData.title,
            content: '',
            color: noteData.color,
            lastEdited: 'Just now',
            isStarred: false,
            isArchived: false,
            collectionId: noteData.collectionId,
            isPrivate: noteData.isPrivate,
            createdAt: new Date().toISOString()
        };
        setNotes([...notes, newNote]);
        showToast(`Note "${noteData.title}" created! Time to fill it with genius... or memes. 📝`, 'success');
        return newNote;
    };

    const handleSaveNote = (noteId: string, updatedContent: string) => {
        setNotes(notes.map(note =>
            note.id === noteId
                ? { ...note, content: updatedContent, lastEdited: 'Just now' }
                : note
        ));
        showToast('Changes saved! Your brilliance has been preserved. ✨', 'success');
    };

    const handleDeleteNote = (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        setNotes(notes.filter(note => note.id !== noteId));
        showToast(`"${note?.title || 'Note'}" deleted! Gone, but not forgotten... actually, yeah, forgotten. 🗑️`, 'success');
    };

    const handleStarNote = (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        const willBeStarred = !note?.isStarred;

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
    };

    const handleArchiveNote = (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        const willBeArchived = !note?.isArchived;

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
    };

    const handleMoveToCollection = (noteId: string, newCollectionId: string | null) => {
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
    };

    return {
        notes,
        setNotes,
        handleCreateNote,
        handleSaveNote,
        handleDeleteNote,
        handleStarNote,
        handleArchiveNote,
        handleMoveToCollection
    };
};
