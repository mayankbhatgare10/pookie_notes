'use client';

import { useState } from 'react';
import { Note } from '@/hooks/useNotes';

interface LinkNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentNote: Note;
    availableNotes: Note[];
    onLink: (targetNoteId: string, connectionType: 'bidirectional', autoSync: boolean) => void;
}

export default function LinkNoteModal({
    isOpen,
    onClose,
    currentNote,
    availableNotes,
    onLink,
}: LinkNoteModalProps) {
    const [selectedNoteId, setSelectedNoteId] = useState('');

    if (!isOpen) return null;

    // Filter out current note and already connected notes
    const connectedNoteIds = currentNote.connectedNotes?.map(conn => conn.noteId) || [];
    const filteredNotes = availableNotes.filter(
        note => note.id !== currentNote.id && !connectedNoteIds.includes(note.id)
    );

    const handleLink = () => {
        if (!selectedNoteId) return;

        // Always bidirectional, no auto-sync
        onLink(selectedNoteId, 'bidirectional', false);
        setSelectedNoteId('');
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[90] p-6 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-black">Link to Note</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-[#f5f4e8] flex items-center justify-center transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-[#666] mb-4">
                    Select a note to link with <strong>{currentNote.title}</strong>
                </p>

                {filteredNotes.length === 0 ? (
                    <div className="text-center py-8 text-[#666]">
                        <p>No notes available to link</p>
                        <p className="text-xs mt-2">Create more notes to link them together!</p>
                    </div>
                ) : (
                    <>
                        {/* Note Selection Dropdown */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-black mb-2">
                                Select Note
                            </label>
                            <select
                                value={selectedNoteId}
                                onChange={(e) => setSelectedNoteId(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:border-[#ffd700] focus:outline-none text-black bg-white"
                            >
                                <option value="">Choose a note...</option>
                                {filteredNotes.map((note) => (
                                    <option key={note.id} value={note.id}>
                                        {note.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border-2 border-[#e0e0e0] rounded-xl font-semibold text-black hover:bg-[#f5f4e8] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLink}
                                disabled={!selectedNoteId}
                                className="flex-1 px-4 py-3 bg-[#ffd700] hover:bg-[#ffed4e] disabled:bg-[#e0e0e0] disabled:cursor-not-allowed rounded-xl font-bold text-black transition-colors border-2 border-black disabled:border-[#e0e0e0]"
                            >
                                Link Notes
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
