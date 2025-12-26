'use client';

import { Note } from '@/hooks/useNotes';

interface NoteInfoPanelProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note;
    connectedNotes: Note[];
    onNavigateToNote: (noteId: string) => void;
    onUnlinkNote: (noteId: string) => void;
}

export default function NoteInfoPanel({
    isOpen,
    onClose,
    note,
    connectedNotes,
    onNavigateToNote,
    onUnlinkNote,
}: NoteInfoPanelProps) {
    if (!isOpen) return null;

    const getConnectionTypeLabel = (type: string) => {
        switch (type) {
            case 'completion-sync':
                return '🔄 Completion Sync';
            case 'bidirectional':
                return '↔️ Bidirectional';
            case 'reference':
                return '🔗 Reference';
            default:
                return '🔗 Linked';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-fade-in"
                onClick={onClose}
            />

            {/* Panel - Slides from right */}
            <div className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white shadow-2xl z-[70] overflow-y-auto animate-slide-left">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-[#e0e0e0] px-6 py-4 z-10">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-black">Note Info</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-[#f5f4e8] flex items-center justify-center transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <h3 className="text-sm font-semibold text-[#666] truncate">{note.title}</h3>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Metadata Section */}
                    <div>
                        <h3 className="text-sm font-bold text-black mb-3 uppercase tracking-wide">Metadata</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-[#f5f4e8] rounded-lg">
                                <span className="text-sm text-[#666]">Created</span>
                                <span className="text-sm font-semibold text-black">
                                    {note.metadata?.createdAt || note.createdAt}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-[#f5f4e8] rounded-lg">
                                <span className="text-sm text-[#666]">Last Modified</span>
                                <span className="text-sm font-semibold text-black">
                                    {note.metadata?.lastModified || note.lastEdited}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-[#f5f4e8] rounded-lg">
                                <span className="text-sm text-[#666]">Total Connections</span>
                                <span className="text-sm font-semibold text-black">
                                    {note.metadata?.totalConnections || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Connected Notes Section */}
                    <div>
                        <h3 className="text-sm font-bold text-black mb-3 uppercase tracking-wide">
                            Connected Notes ({connectedNotes.length})
                        </h3>
                        {connectedNotes.length === 0 ? (
                            <div className="text-center py-8 text-[#666] text-sm">
                                No connected notes yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {connectedNotes.map((connectedNote, index) => {
                                    const connection = note.connectedNotes?.find(
                                        (conn) => conn.noteId === connectedNote.id
                                    );

                                    return (
                                        <div
                                            key={`${connectedNote.id}-${index}`}
                                            className="border border-[#e0e0e0] rounded-lg p-4 hover:bg-[#f5f4e8] transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm text-black truncate">
                                                        {connectedNote.title}
                                                    </h4>
                                                    <p className="text-xs text-[#666] mt-1">
                                                        {getConnectionTypeLabel(connection?.connectionType || 'reference')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => onUnlinkNote(connectedNote.id)}
                                                    className="ml-2 p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                                    title="Unlink note"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {connection?.syncConfig?.autoSync && (
                                                <div className="mb-2 px-2 py-1 bg-[#fff4e6] rounded text-xs text-[#d4a574] font-medium">
                                                    ⚡ Auto-sync enabled
                                                </div>
                                            )}

                                            <div className="text-xs text-[#666] mb-3">
                                                Last edited: {typeof connectedNote.lastEdited === 'string'
                                                    ? connectedNote.lastEdited
                                                    : 'Recently'}
                                            </div>

                                            <button
                                                onClick={() => onNavigateToNote(connectedNote.id)}
                                                className="w-full py-2 rounded-lg bg-[#ffd700] hover:bg-[#ffed4e] border border-black text-black font-semibold text-xs transition-colors"
                                            >
                                                Open Note →
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
