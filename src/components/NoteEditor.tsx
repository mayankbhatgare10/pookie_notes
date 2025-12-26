'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import { useState, useEffect, useRef } from 'react';

import { TagNode } from './TagNode';
import EditorToolbar from './editor/EditorToolbar';
import EditorHeader from './editor/EditorHeader';
import CommandMenu from './editor/CommandMenu';
import FooterConnectionsPopup from './editor/FooterConnectionsPopup';
import LinkNoteModal from './LinkNoteModal';
import NoteInfoPanel from './NoteInfoPanel';
import SyncConfirmModal from './SyncConfirmModal';

import { Note } from '@/hooks/useNotes';
import { useNoteLinking } from '@/hooks/useNoteLinking';
import { useToast } from '@/contexts/ToastContext';
import { shareNoteContent } from '@/utils/noteFormatting';

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    note?: Note | null;
    onSave?: (noteId: string, title: string, content: string) => void;
    onDelete?: (noteId: string) => void;
    collectionTags?: string[];
    allNotes?: Note[];
    onNavigateToNote?: (noteId: string) => void;
}

export default function NoteEditor({
    isOpen,
    onClose,
    note,
    onSave,
    onDelete,
    collectionTags = [],
    allNotes = [],
    onNavigateToNote
}: NoteEditorProps) {
    // Basic editor state
    const [title, setTitle] = useState(note?.title || 'Untitled');
    const [isEditing, setIsEditing] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [fontSize, setFontSize] = useState('16');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [showCommandMenu, setShowCommandMenu] = useState(false);
    const [commandSearch, setCommandSearch] = useState('');
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [exportButtonRef, setExportButtonRef] = useState<HTMLButtonElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCanvasDrawing, setIsCanvasDrawing] = useState(false);
    const [showSyncConfirm, setShowSyncConfirm] = useState(false);
    const [syncPendingItem, setSyncPendingItem] = useState('');
    const [syncPendingContent, setSyncPendingContent] = useState('');

    // Track synced items in localStorage to persist across sessions
    const getSyncedItems = () => {
        if (typeof window === 'undefined' || !note?.id) return new Set<string>();
        const stored = localStorage.getItem(`synced_items_${note.id}`);
        return new Set(stored ? JSON.parse(stored) : []);
    };

    const addSyncedItem = (itemText: string) => {
        if (typeof window === 'undefined' || !note?.id) return;
        const synced = getSyncedItems();
        synced.add(itemText);
        localStorage.setItem(`synced_items_${note.id}`, JSON.stringify([...synced]));
    };

    const clearSyncedItems = () => {
        if (typeof window === 'undefined' || !note?.id) return;
        localStorage.removeItem(`synced_items_${note.id}`);
        console.log('🗑️ Cleared synced items for note:', note.id);
    };

    // Expose clear function to window for testing
    if (typeof window !== 'undefined' && note?.id) {
        (window as any).clearSyncedItems = clearSyncedItems;
    }

    const { showToast } = useToast();
    const availableTags = collectionTags || [];

    // Note linking hook
    const {
        showLinkModal,
        setShowLinkModal,
        showInfoPanel,
        setShowInfoPanel,
        connectedNotes,
        handleLinkNote,
        handleUnlinkNote,
        handleSyncCompletedItems,
    } = useNoteLinking(note, allNotes);

    // TipTap editor configuration
    const editor = useEditor({
        immediatelyRender: false, // Fix SSR hydration mismatch
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            TextStyle,
            Color,
            FontFamily,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false }),
            TaskList,
            TaskItem.configure({ nested: true }),
            CodeBlock,
            Image,
            TagNode,
            Placeholder.configure({ placeholder: 'Start writing your masterpiece...' }),
        ],
        content: note?.content || '',
        editable: isEditing,
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);

            // Command menu logic
            if (isEditing) {
                const { from } = editor.state.selection;
                const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from, '\n');
                if (textBefore.endsWith('/') || textBefore.match(/\/(\w*)$/)) {
                    const match = textBefore.match(/\/(\w*)$/);
                    setCommandSearch(match ? match[1] : '');
                    setShowCommandMenu(true);
                    const coords = editor.view.coordsAtPos(from);
                    setMenuPosition({ top: coords.top + 20, left: coords.left });
                } else {
                    setShowCommandMenu(false);
                }
            } else {
                setShowCommandMenu(false);
            }
        },
    });

    // Update editor content when note changes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                editor?.commands.setContent('');
            }, 0);
            setTitle('Untitled');
            setWordCount(0);
            setIsEditing(false);
        } else if (note) {
            setTitle(note.title || 'Untitled');

            // Force reload from Firestore to get latest synced content
            const loadLatestContent = async () => {
                try {
                    const { getNote } = await import('@/lib/notesService');
                    const { auth } = await import('@/lib/firebase');
                    const user = auth?.currentUser;

                    if (user && note.id) {
                        const latestNote = await getNote(user.uid, note.id);
                        if (latestNote?.content) {
                            console.log('🔄 Loaded latest content from Firestore');
                            setTimeout(() => {
                                editor?.commands.setContent(latestNote.content);
                            }, 0);
                            setIsEditing(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('❌ Error loading latest note:', error);
                }

                // Fallback to prop content
                if (note.content) {
                    setTimeout(() => {
                        editor?.commands.setContent(note.content);
                    }, 0);
                    setIsEditing(false);
                } else {
                    setIsEditing(true);
                }
            };

            loadLatestContent();
        }
    }, [isOpen, editor, note?.id]);

    // Listen for content updates from sync
    useEffect(() => {
        if (!note?.id || !editor) return;

        console.log('👂 Setting up event listener for note:', note.id);

        const handleContentUpdate = async (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('📨 Event received:', customEvent.detail);
            const { noteId, content } = customEvent.detail;
            if (noteId === note.id) {
                console.log('📥 Received content update for this note!');

                // Reload from Firestore to get the absolute latest content
                try {
                    const { getNote } = await import('@/lib/notesService');
                    const { auth } = await import('@/lib/firebase');
                    const user = auth?.currentUser;

                    if (user) {
                        const latestNote = await getNote(user.uid, noteId);
                        if (latestNote?.content) {
                            console.log('🔄 Reloading content from Firestore');
                            editor.commands.setContent(latestNote.content);
                            showToast('Note updated from sync!', 'success');
                        }
                    }
                } catch (error) {
                    console.error('❌ Error reloading note:', error);
                    // Fallback to event content
                    editor.commands.setContent(content);
                    showToast('Note updated from sync!', 'success');
                }
            } else {
                console.log('📭 Event for different note:', noteId, 'vs', note.id);
            }
        };

        window.addEventListener('note-content-updated', handleContentUpdate);
        console.log('✅ Event listener attached');

        return () => {
            window.removeEventListener('note-content-updated', handleContentUpdate);
            console.log('🔇 Event listener removed for note:', note.id);
        };
    }, [note?.id, editor, showToast]);

    useEffect(() => {
        editor?.setEditable(isEditing);
    }, [isEditing, editor]);

    // Sync on checkbox change with confirmation
    useEffect(() => {
        if (!editor || !note?.id) return;

        console.log('🔧 Sync listener setup:', {
            noteId: note.id,
            isEditing,
            hasConnections: connectedNotes.length > 0
        });

        const parser = new DOMParser();
        let lastCheckedCount = 0;
        let lastCheckedItems = new Set<string>();

        // Initialize count
        const initContent = editor.getHTML();
        const initDoc = parser.parseFromString(initContent, 'text/html');
        const initChecked = initDoc.querySelectorAll('li[data-checked="true"]');
        lastCheckedCount = initChecked.length;
        initChecked.forEach(item => {
            const text = item.textContent?.trim();
            if (text) lastCheckedItems.add(text);
        });
        console.log('📊 Initial checked count:', lastCheckedCount);

        const handleUpdate = () => {
            if (!isEditing) {
                console.log('⏸️ Not in edit mode, skipping');
                return;
            }

            const content = editor.getHTML();
            const doc = parser.parseFromString(content, 'text/html');
            const checkedItems = doc.querySelectorAll('li[data-checked="true"]');
            const currentCount = checkedItems.length;
            const currentCheckedSet = new Set<string>();

            checkedItems.forEach(item => {
                const text = item.textContent?.trim();
                if (text) currentCheckedSet.add(text);
            });

            console.log('📝 Update detected:', {
                lastCount: lastCheckedCount,
                currentCount,
                hasConnections: connectedNotes.length > 0
            });

            // Check for newly checked items
            if (currentCount > lastCheckedCount && connectedNotes.length > 0) {
                const lastCheckedItem = checkedItems[checkedItems.length - 1];
                const itemText = lastCheckedItem?.textContent?.trim() || 'this item';

                console.log('✅ New item checked:', itemText);

                const syncedItems = getSyncedItems();
                console.log('📋 Already synced:', Array.from(syncedItems));

                if (!syncedItems.has(itemText)) {
                    console.log('🎯 Showing popup for:', itemText);
                    setSyncPendingItem(itemText);
                    setSyncPendingContent(content);
                    setShowSyncConfirm(true);
                } else {
                    console.log('⏭️ Item already synced, skipping');
                }
            }

            // Check for unchecked items - remove from localStorage
            if (currentCount < lastCheckedCount) {
                lastCheckedItems.forEach(itemText => {
                    if (!currentCheckedSet.has(itemText)) {
                        console.log('❌ Item unchecked, removing from synced:', itemText);
                        const syncedItems = getSyncedItems();
                        syncedItems.delete(itemText);
                        if (note?.id) {
                            localStorage.setItem(`synced_items_${note.id}`, JSON.stringify([...syncedItems]));
                        }
                    }
                });
            }

            lastCheckedCount = currentCount;
            lastCheckedItems = currentCheckedSet;
        };

        editor.on('update', handleUpdate);

        return () => {
            editor.off('update', handleUpdate);
        };
    }, [editor, note?.id, connectedNotes, isEditing]);

    // Handler for sync confirmation
    const handleConfirmSync = async () => {
        if (!note?.id || !syncPendingContent) return;

        // Auto-save
        if (onSave) {
            onSave(note.id, title, syncPendingContent);
        }

        // Sync to connected notes
        await handleSyncCompletedItems(syncPendingContent);

        // Mark this item as synced
        addSyncedItem(syncPendingItem);

        // Show success toast
        const connectedNoteNames = connectedNotes.map(n => n.title).join(', ');
        showToast(`✓ Synced "${syncPendingItem}" to ${connectedNoteNames}!`, 'success');

        // Close modal and reset
        setShowSyncConfirm(false);
        setSyncPendingContent('');
        setSyncPendingItem('');
    };

    // Handlers
    const handleSaveWithSync = async () => {
        if (!note?.id || !editor) return;

        const content = editor.getHTML();

        if (onSave) {
            onSave(note.id, title, content);
        }

        // Sync completed items if there are connections
        await handleSyncCompletedItems(content);

        setIsEditing(false);
    };

    const handleShare = async () => {
        if (!note) return;

        await shareNoteContent(
            note.title,
            note.content || '',
            (message) => showToast(message, 'success'),
            () => showToast('Share cancelled. Your secrets are safe! 🤫', 'info')
        );
    };

    const handleNavigate = (noteId: string) => {
        if (onNavigateToNote) {
            // Save current note first
            if (note?.id && editor) {
                onSave?.(note.id, title, editor.getHTML());
            }
            onNavigateToNote(noteId);
            setShowInfoPanel(false);
        }
    };

    // Drawing functions
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        setIsCanvasDrawing(true);
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isCanvasDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const insertDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        editor?.chain().focus().setImage({ src: dataUrl }).run();
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        setIsDrawing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#fffef5] to-[#f5f4e8] rounded-[20px] md:rounded-[32px] w-full max-w-5xl max-h-[95vh] md:max-h-[92vh] shadow-2xl flex flex-col border-2 border-black/5 animate-in zoom-in-95 duration-300 relative">

                {/* Header */}
                <EditorHeader
                    title={title}
                    onTitleChange={setTitle}
                    isEditing={isEditing}
                    onSave={handleSaveWithSync}
                    onEdit={() => setIsEditing(true)}
                    note={note}
                    onShowInfo={() => setShowInfoPanel(true)}
                    onShare={handleShare}
                    onLinkNote={() => setShowLinkModal(true)}
                    onDelete={() => note && onDelete?.(note.id)}
                    onClose={onClose}
                    editor={editor}
                    wordCount={wordCount}
                    showExportMenu={showExportMenu}
                    setShowExportMenu={setShowExportMenu}
                    exportButtonRef={exportButtonRef}
                    setExportButtonRef={setExportButtonRef}
                />

                {/* Toolbar */}
                {isEditing && (
                    <EditorToolbar
                        editor={editor}
                        fontFamily={fontFamily}
                        setFontFamily={setFontFamily}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        isDrawing={isDrawing}
                        setIsDrawing={setIsDrawing}
                    />
                )}

                {/* Quick Tags */}
                {availableTags.length > 0 && (
                    <div className="px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border-b-2 border-black/5">
                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                            <span className="text-xs md:text-sm font-bold text-black/60">Quick Tags:</span>
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => editor?.chain().focus().insertContent({ type: 'tag', attrs: { label: tag } }).run()}
                                    className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-white hover:bg-[#f5f4e8] text-black/70 font-medium rounded-full transition-colors border border-black/10 hover:border-[#ffd700]"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-10 py-4 md:py-8 bg-white relative">
                    <div className="max-w-4xl mx-auto">
                        {isDrawing && (
                            <div className="mb-4 p-3 md:p-4 bg-[#fffef5] rounded-xl md:rounded-2xl border-2 border-[#ffd700]">
                                <canvas
                                    ref={canvasRef}
                                    width={800}
                                    height={200}
                                    className="w-full border-2 border-dashed border-black/20 rounded-xl cursor-crosshair bg-white"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={() => setIsCanvasDrawing(false)}
                                    onMouseLeave={() => setIsCanvasDrawing(false)}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 800, 200)}
                                        className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={insertDrawing}
                                        className="px-3 py-1 text-xs bg-[#ffd700] hover:bg-[#ffed4e] text-black rounded-lg transition-colors font-semibold"
                                    >
                                        Insert
                                    </button>
                                </div>
                            </div>
                        )}
                        <EditorContent editor={editor} style={{ fontSize: `${fontSize}px`, fontFamily }} />

                        {/* Command Menu */}
                        <CommandMenu
                            isOpen={showCommandMenu}
                            position={menuPosition}
                            search={commandSearch}
                            editor={editor}
                            onClose={() => setShowCommandMenu(false)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 md:px-8 py-3 md:py-4 border-t-2 border-black/5 flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-b-[18px] md:rounded-b-[30px]">
                    <div className="flex items-center gap-3 md:gap-6">
                        <span className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="font-medium text-black/60">Auto-saved</span>
                        </span>
                        <span className="text-xs md:text-sm text-black/60 font-medium">{wordCount} words</span>
                        {Array.isArray(connectedNotes) && connectedNotes.length > 0 && (
                            <FooterConnectionsPopup
                                connectedNotes={connectedNotes}
                                onNavigateToNote={handleNavigate}
                            />
                        )}
                    </div>
                    <span className="text-xs md:text-sm text-black/40 font-medium hidden md:inline">Press / for commands</span>
                </div>
            </div>

            {/* Modals */}
            {note && (
                <>
                    <LinkNoteModal
                        isOpen={showLinkModal}
                        onClose={() => setShowLinkModal(false)}
                        currentNote={note}
                        availableNotes={allNotes}
                        onLink={handleLinkNote}
                    />

                    <NoteInfoPanel
                        isOpen={showInfoPanel}
                        onClose={() => setShowInfoPanel(false)}
                        note={note}
                        connectedNotes={connectedNotes}
                        onNavigateToNote={handleNavigate}
                        onUnlinkNote={handleUnlinkNote}
                    />

                    <SyncConfirmModal
                        isOpen={showSyncConfirm}
                        onClose={() => setShowSyncConfirm(false)}
                        onConfirm={handleConfirmSync}
                        targetNoteName={connectedNotes.map(n => n.title).join(', ')}
                        itemText={syncPendingItem}
                    />
                </>
            )}
        </div>
    );
}
