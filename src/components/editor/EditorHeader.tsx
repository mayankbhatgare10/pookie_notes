'use client';

import { Note } from '@/hooks/useNotes';
import EditorActionsMenu from './EditorActionsMenu';
import ExportMenu from '../editor/ExportMenu';
import { Editor } from '@tiptap/react';

interface EditorHeaderProps {
    title: string;
    onTitleChange: (title: string) => void;
    isEditing: boolean;
    onSave: () => void;
    onEdit: () => void;
    note?: Note | null;
    onShowInfo: () => void;
    onShare: () => void;
    onLinkNote: () => void;
    onDelete: () => void;
    onClose: () => void;
    editor: Editor | null;
    wordCount: number;
    showExportMenu: boolean;
    setShowExportMenu: (show: boolean) => void;
    exportButtonRef: HTMLButtonElement | null;
    setExportButtonRef: (ref: HTMLButtonElement | null) => void;
    inkCanvasRef?: React.RefObject<any>;
}

export default function EditorHeader({
    title,
    onTitleChange,
    isEditing,
    onSave,
    onEdit,
    note,
    onShowInfo,
    onShare,
    onLinkNote,
    onDelete,
    onClose,
    editor,
    wordCount,
    showExportMenu,
    setShowExportMenu,
    exportButtonRef,
    setExportButtonRef,
    inkCanvasRef,
}: EditorHeaderProps) {
    return (
        <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-5 border-b-2 border-black/5 bg-white/50 backdrop-blur-sm rounded-t-[18px] md:rounded-t-[30px] relative z-20">
            <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Give it a cool name..."
                className="text-lg md:text-2xl font-bold text-black bg-transparent focus:outline-none w-full max-w-[200px] md:max-w-[320px] placeholder:text-black/30"
            />

            <div className="flex items-center gap-1 md:gap-2">
                {/* Info Button with Connection Count Badge */}
                <button
                    onClick={onShowInfo}
                    className="p-2 md:p-2.5 hover:bg-black/5 rounded-xl transition-colors relative"
                    title="Note info & connections"
                >
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {note?.metadata?.totalConnections && note.metadata.totalConnections > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ffd700] border border-black rounded-full text-[10px] font-bold flex items-center justify-center">
                            {note.metadata.totalConnections}
                        </span>
                    )}
                </button>

                {/* Save/Edit Button */}
                <button
                    onClick={isEditing ? onSave : onEdit}
                    className="px-3 md:px-5 py-1.5 md:py-2.5 bg-[#ffd700] hover:bg-[#ffed4e] text-black font-bold text-xs md:text-sm rounded-xl md:rounded-2xl transition-colors shadow-md flex items-center gap-1 md:gap-2"
                >
                    {isEditing ? 'Save' : 'Edit'}
                </button>

                {/* Export Button */}
                <div className="relative">
                    <button
                        ref={setExportButtonRef}
                        onClick={() => setShowExportMenu(true)}
                        className="p-2 md:p-2.5 hover:bg-black/5 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                    <ExportMenu
                        editor={editor}
                        title={title}
                        wordCount={wordCount}
                        isOpen={showExportMenu}
                        onClose={() => setShowExportMenu(false)}
                        position={exportButtonRef ? {
                            top: exportButtonRef.getBoundingClientRect().bottom + 8,
                            left: exportButtonRef.getBoundingClientRect().left
                        } : { top: 0, left: 0 }}
                        inkCanvasRef={inkCanvasRef}
                    />
                </div>

                {/* 3-Dot Actions Menu */}
                <EditorActionsMenu
                    onShare={onShare}
                    onLinkNote={onLinkNote}
                    onDelete={onDelete}
                />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="p-1.5 md:p-2.5 hover:bg-black/5 rounded-xl transition-colors"
                >
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
