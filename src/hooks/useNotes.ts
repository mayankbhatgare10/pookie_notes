
import { useState } from 'react';

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
        return newNote;
    };

    const handleSaveNote = (noteId: string, updatedContent: string) => {
        setNotes(notes.map(note =>
            note.id === noteId
                ? { ...note, content: updatedContent, lastEdited: 'Just now' }
                : note
        ));
    };

    const handleDeleteNote = (noteId: string) => {
        setNotes(notes.filter(note => note.id !== noteId));
    };

    const handleStarNote = (noteId: string) => {
        setNotes(notes.map(note =>
            note.id === noteId
                ? { ...note, isStarred: !note.isStarred }
                : note
        ));
    };

    const handleArchiveNote = (noteId: string) => {
        setNotes(notes.map(note =>
            note.id === noteId
                ? { ...note, isArchived: !note.isArchived }
                : note
        ));
    };

    const handleMoveToCollection = (noteId: string, newCollectionId: string | null) => {
        setNotes(notes.map(note =>
            note.id === noteId
                ? { ...note, collectionId: newCollectionId }
                : note
        ));
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
