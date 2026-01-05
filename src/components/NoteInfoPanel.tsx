'use client';

import { useState } from 'react';
import { Note } from '@/hooks/useNotes';
import { Collection } from '@/hooks/useCollections';

interface NoteInfoPanelProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note;
    connectedNotes: Note[];
    collection?: Collection | null;
    onNavigateToNote: (noteId: string) => void;
    onUnlinkNote: (noteId: string) => void;
}

export default function NoteInfoPanel({
    isOpen,
    onClose,
    note,
    connectedNotes,
    collection,
    onNavigateToNote,
    onUnlinkNote,
}: NoteInfoPanelProps) {
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
    const [noteToUnlink, setNoteToUnlink] = useState<string | null>(null);

    if (!isOpen) return null;

    const getConnectionTypeLabel = (type: string) => {
        switch (type) {
            case 'completion-sync':
                return '🔄 Synced';
            case 'bidirectional':
                return '↔️ Two-way';
            case 'reference':
                return '🔗 Linked';
            default:
                return '🔗 Linked';
        }
    };

    const handleUnlinkClick = (noteId: string) => {
        setNoteToUnlink(noteId);
        setShowUnlinkConfirm(true);
    };

    const handleConfirmUnlink = () => {
        if (noteToUnlink) {
            onUnlinkNote(noteToUnlink);
            setShowUnlinkConfirm(false);
            setNoteToUnlink(null);
        }
    };

    const getSarcasticEmptyMessage = () => {
        const messages = [
            "Zero connections. Living the solo life. 😶",
            "No links. How independent. 🙄",
            "Completely isolated. Classic. 😒"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    const noteToUnlinkData = connectedNotes.find(n => n.id === noteToUnlink);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] animate-fade-in"
                onClick={onClose}
            />

            {/* Panel - Minimal */}
            <div className="fixed right-0 top-0 bottom-0 w-full md:w-[360px] bg-[#f5f4e8] shadow-2xl z-[70] overflow-y-auto animate-slide-left border-l-2 border-black">
                {/* Header */}
                <div className="sticky top-0 bg-[#ffd700] border-b-2 border-black px-4 py-3 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-black">Info</h2>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Collection */}
                    {collection && (
                        <div className="bg-white rounded-xl p-3 border-2 border-black">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{collection.emoji || '📁'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-black/50 uppercase tracking-wide font-bold">Collection</p>
                                    <p className="text-sm font-bold text-black truncate">{collection.name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="bg-white rounded-xl p-3 border-2 border-black">
                        <p className="text-xs text-black/50 uppercase tracking-wide font-bold mb-2">Details</p>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-black/60">Created</span>
                                <span className="font-semibold text-black">{note.metadata?.createdAt || note.createdAt}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-black/60">Modified</span>
                                <span className="font-semibold text-black">{note.metadata?.lastModified || note.lastEdited}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-black/60">Connections</span>
                                <span className="font-semibold text-black">{connectedNotes.length}</span>
                            </div>
                            {note.isStarred && (
                                <div className="flex justify-between">
                                    <span className="text-black/60">Starred</span>
                                    <span className="font-semibold text-black">⭐ Yes</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Connected Notes */}
                    <div className="bg-white rounded-xl p-3 border-2 border-black">
                        <p className="text-xs text-black/50 uppercase tracking-wide font-bold mb-2">
                            Connections ({connectedNotes.length})
                        </p>
                        {connectedNotes.length === 0 ? (
                            <div className="text-center py-4">
                                <div className="text-2xl mb-1">😶</div>
                                <p className="text-xs text-black/50 italic">{getSarcasticEmptyMessage()}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {connectedNotes.map((connectedNote, index) => {
                                    const connection = note.connectedNotes?.find(
                                        (conn) => conn.noteId === connectedNote.id
                                    );

                                    return (
                                        <div
                                            key={`${connectedNote.id}-${index}`}
                                            className="border border-black/10 rounded-lg p-2 hover:bg-[#f5f4e8] transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-1.5">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-xs text-black truncate">
                                                        {connectedNote.title}
                                                    </h4>
                                                    <p className="text-[10px] text-black/50 mt-0.5">
                                                        {getConnectionTypeLabel(connection?.connectionType || 'reference')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleUnlinkClick(connectedNote.id)}
                                                    className="ml-2 p-1 hover:bg-red-100 text-red-500 rounded transition-colors"
                                                    title="Unlink"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {connection?.syncConfig?.autoSync && (
                                                <div className="mb-1.5 px-1.5 py-0.5 bg-[#ffd700]/20 rounded text-[10px] text-black font-medium inline-block">
                                                    ⚡ Auto-sync
                                                </div>
                                            )}

                                            <button
                                                onClick={() => onNavigateToNote(connectedNote.id)}
                                                className="w-full py-1.5 rounded-lg bg-[#ffd700] hover:bg-[#ffed4e] border border-black text-black font-bold text-[11px] transition-colors"
                                            >
                                                Open →
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Unlink Confirmation - Sarcastic & Responsive */}
            {showUnlinkConfirm && noteToUnlinkData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
                    <div className="bg-white rounded-[15px] md:rounded-[20px] p-6 md:p-8 max-w-xs md:max-w-sm w-full shadow-2xl border-2 border-black">
                        <h2 className="text-xl md:text-2xl font-bold mb-3 text-black">Breaking Up? 💔</h2>
                        <p className="text-sm md:text-base mb-2 text-gray-700">
                            You're about to unlink <span className="font-bold">"{noteToUnlinkData.title}"</span>.
                        </p>
                        <p className="text-xs md:text-sm mb-5 md:mb-6 text-gray-600 italic">
                            No syncing, no connection. Just... gone. Forever alone.
                        </p>
                        <div className="flex gap-2 md:gap-3 flex-col sm:flex-row">
                            <button
                                onClick={() => {
                                    setShowUnlinkConfirm(false);
                                    setNoteToUnlink(null);
                                }}
                                className="flex-1 px-4 md:px-6 py-2 md:py-2.5 bg-white hover:bg-gray-50 text-black text-sm md:text-base font-semibold rounded-xl border-2 border-gray-300 transition-colors"
                            >
                                Keep it linked
                            </button>
                            <button
                                onClick={handleConfirmUnlink}
                                className="flex-1 px-4 md:px-6 py-2 md:py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm md:text-base font-semibold rounded-xl transition-colors"
                            >
                                Unlink it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
