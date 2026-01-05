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
import InkCanvas from './editor/InkCanvas';
import EditConfirmModal from './EditConfirmModal';

import { Note } from '@/hooks/useNotes';
import { Collection } from '@/hooks/useCollections';
import { useNoteLinking } from '@/hooks/useNoteLinking';
import { useToast } from '@/contexts/ToastContext';
import { shareNoteContent } from '@/utils/noteFormatting';
import { saveInkStrokes, loadInkStrokes } from '@/lib/handwritingService';
import { debounce } from '@/utils/debounce';
import { useAuth } from '@/contexts/AuthContext';

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    note?: Note | null;
    onSave?: (noteId: string, title: string, content: string) => void;
    onDelete?: (noteId: string) => void;
    collectionTags?: string[];
    allNotes?: Note[];
    collections?: Collection[];
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
    collections = [],
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
    const [showSyncConfirm, setShowSyncConfirm] = useState(false);
    const [showEditConfirm, setShowEditConfirm] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [syncPendingItem, setSyncPendingItem] = useState('');
    const [syncPendingContent, setSyncPendingContent] = useState('');

    // Ink overlay state
    const [isInkMode, setIsInkMode] = useState(false);
    const [inkTool, setInkTool] = useState<'pen' | 'pencil' | 'brush' | 'highlighter' | 'eraser' | 'hand'>('pen');
    const [inkColor, setInkColor] = useState('#000000');
    const [inkStrokeSize, setInkStrokeSize] = useState(2);
    const [isPanMode, setIsPanMode] = useState(false);
    const [inkStrokes, setInkStrokes] = useState<any[]>([]);
    const [canInkRedo, setCanInkRedo] = useState(false);
    const inkCanvasRef = useRef<any>(null);

    // Hand tool drag-to-scroll ref
    const editorContainerRef = useRef<HTMLDivElement>(null);

    // Zoom state
    const [zoom, setZoom] = useState(1);

    // Zoom with Ctrl+scroll or trackpad pinch
    useEffect(() => {
        const container = editorContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Ctrl+scroll or pinch gesture
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();

                const delta = e.deltaY;
                const zoomSpeed = 0.001;

                setZoom(prevZoom => {
                    const newZoom = prevZoom - delta * zoomSpeed;
                    // Limit zoom between 0.5x and 3x
                    return Math.min(Math.max(newZoom, 0.5), 3);
                });
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // Hand tool drag-to-scroll effect
    useEffect(() => {
        const container = editorContainerRef.current;
        if (!container || inkTool !== 'hand') return;

        let isMouseDown = false;
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;
        let scrollTop = 0;

        const handleMouseDown = (e: MouseEvent) => {
            isMouseDown = true;
            startX = e.pageX - container.offsetLeft;
            startY = e.pageY - container.offsetTop;
            scrollLeft = container.scrollLeft;
            scrollTop = container.scrollTop;
            container.style.cursor = 'grabbing';
            e.preventDefault();
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isMouseDown) return;
            e.preventDefault();

            const x = e.pageX - container.offsetLeft;
            const y = e.pageY - container.offsetTop;
            const walkX = (x - startX) * 1.5; // Scroll speed multiplier
            const walkY = (y - startY) * 1.5;

            container.scrollLeft = scrollLeft - walkX;
            container.scrollTop = scrollTop - walkY;
        };

        const handleMouseUp = () => {
            isMouseDown = false;
            container.style.cursor = 'grab';
        };

        const handleMouseLeave = () => {
            isMouseDown = false;
            container.style.cursor = 'grab';
        };

        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [inkTool]);

    const { user } = useAuth();
    const { showToast } = useToast();
    const availableTags = collectionTags || [];

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

            // Load ink strokes
            const loadInk = async () => {
                if (!note.id || !user) return;
                try {
                    const strokes = await loadInkStrokes(user.uid, note.id);
                    console.log('📝 Loaded ink strokes:', strokes.length);
                    setInkStrokes(strokes);
                    // Update the canvas with loaded strokes
                    if (inkCanvasRef.current && strokes.length > 0) {
                        inkCanvasRef.current.setStrokes(strokes);
                    }
                } catch (error) {
                    console.error('Failed to load ink strokes:', error);
                }
            };
            loadInk();
        }
    }, [isOpen, editor, note?.id, user]);

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
        editor?.setEditable(isEditing && !isInkMode);

        // Disable ink mode when exiting edit mode
        if (!isEditing && isInkMode) {
            setIsInkMode(false);
        }
    }, [isEditing, isInkMode, editor]);

    // Ink save handler (debounced)
    const saveInkDebounced = useRef(
        debounce(async (strokes: any[], noteId: string, userId: string) => {
            try {
                await saveInkStrokes(userId, noteId, strokes);
                console.log('✅ Ink strokes auto-saved');
            } catch (error) {
                console.error('Failed to save ink strokes:', error);
            }
        }, 500)
    ).current;

    const handleInkStrokesChange = (strokes: any[]) => {
        setInkStrokes(strokes);
        if (note?.id && user) {
            saveInkDebounced(strokes, note.id, user.uid);
        }
    };

    // Keyboard shortcuts for ink mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't intercept if user is typing in an input, textarea, or contenteditable
            const target = e.target as HTMLElement;
            const isTyping = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            // Toggle ink mode with 'I' key (only when not typing)
            if ((e.key === 'i' || e.key === 'I') && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping) {
                e.preventDefault();
                setIsInkMode(prev => !prev);
                return;
            }

            // Ink mode shortcuts (only when not typing)
            if (isInkMode && !isTyping) {
                if (e.key === 'p' || e.key === 'P') {
                    e.preventDefault();
                    setInkTool('pen');
                } else if (e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                    setInkTool('eraser');
                } else if (e.ctrlKey || e.metaKey) {
                    if (e.key === 'z' && !e.shiftKey) {
                        e.preventDefault();
                        inkCanvasRef.current?.undo();
                    } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                        e.preventDefault();
                        inkCanvasRef.current?.redo();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isInkMode]);

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



    if (!isOpen) return null;

    return (
        <>
            {/* Edit Confirmation Modal */}
            <EditConfirmModal
                isOpen={showEditConfirm}
                type="edit"
                onConfirm={() => {
                    setShowEditConfirm(false);
                    setIsEditing(true);
                }}
                onCancel={() => setShowEditConfirm(false)}
            />

            {/* Save Confirmation Modal */}
            <EditConfirmModal
                isOpen={showSaveConfirm}
                type="save"
                onConfirm={() => {
                    setShowSaveConfirm(false);
                    handleSaveWithSync();
                }}
                onCancel={() => setShowSaveConfirm(false)}
            />

            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-modal-backdrop no-overscroll">
                <div className="bg-gradient-to-br from-[#fffef5] to-[#f5f4e8] rounded-[20px] md:rounded-[32px] w-full max-w-5xl max-h-[95vh] md:max-h-[92vh] shadow-2xl flex flex-col border-2 border-black/5 animate-modal-enter gpu-accelerated relative">

                    {/* Header */}
                    <EditorHeader
                        title={title}
                        onTitleChange={setTitle}
                        isEditing={isEditing}
                        onSave={() => setShowSaveConfirm(true)}
                        onEdit={() => setShowEditConfirm(true)}
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
                        inkCanvasRef={inkCanvasRef}
                    />

                    {/* Toolbar with integrated ink controls */}
                    {isEditing && (
                        <EditorToolbar
                            editor={editor}
                            fontFamily={fontFamily}
                            setFontFamily={setFontFamily}
                            fontSize={fontSize}
                            setFontSize={setFontSize}
                            isInkMode={isInkMode}
                            inkTool={inkTool}
                            inkColor={inkColor}
                            inkStrokeSize={inkStrokeSize}
                            onToggleInkMode={() => setIsInkMode(!isInkMode)}
                            onInkToolChange={setInkTool}
                            onInkColorChange={setInkColor}
                            onInkStrokeSizeChange={setInkStrokeSize}
                            onInkUndo={() => inkCanvasRef.current?.undo()}
                            onInkRedo={() => inkCanvasRef.current?.redo()}
                            onInkClear={() => inkCanvasRef.current?.clear()}
                            canInkUndo={inkStrokes.length > 0}
                            canInkRedo={canInkRedo}
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
                    <div
                        ref={editorContainerRef}
                        className="flex-1 overflow-auto px-4 md:px-10 py-4 md:py-8 bg-white relative"
                        style={{
                            cursor: inkTool === 'hand' ? 'grab' : 'auto',
                            userSelect: inkTool === 'hand' ? 'none' : 'auto'
                        }}
                    >
                        {/* Ink Canvas Overlay */}
                        <InkCanvas
                            ref={inkCanvasRef}
                            isActive={isInkMode}
                            currentTool={inkTool}
                            currentColor={inkColor}
                            currentStrokeSize={inkStrokeSize}
                            onStrokesChange={handleInkStrokesChange}
                            onRedoStackChange={setCanInkRedo}
                            initialStrokes={inkStrokes}
                            zoom={zoom}
                        />

                        {/* Editor Content */}
                        <div
                            className="mx-auto"
                            style={{
                                pointerEvents: (isInkMode || inkTool === 'hand') ? 'none' : 'auto',
                                minHeight: '200vh', // 2x viewport height for vertical scroll
                                minWidth: '200vw',  // 2x viewport width for horizontal scroll
                                maxWidth: 'none',   // Remove width limit
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top left',
                                transition: 'transform 0.1s ease-out'
                            }}
                        >

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
                            collection={note.collectionId ? collections.find(c => c.id === note.collectionId) : null}
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
        </>
    );
}
