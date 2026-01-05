'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import NewCollectionModal from '@/components/NewCollectionModal';
import SettingsModal from '@/components/SettingsModal';
import CollectionsGrid from '@/components/CollectionsGrid';
import NewNoteModal from '@/components/NewNoteModal';
import NoteEditor from '@/components/NoteEditor';
import MoveNoteModal from '@/components/MoveNoteModal';
import PasswordPromptModal from '@/components/PasswordPromptModal';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/Header';
import Banner from '@/components/dashboard/Banner';
import SearchBar from '@/components/dashboard/SearchBar';
import NotesSection from '@/components/dashboard/NotesSection';
import Loader from '@/components/Loader';
import { useNotes, Note } from '@/hooks/useNotes';
import { useCollections } from '@/hooks/useCollections';
import { verifyPassword } from '@/lib/passwordUtils';
import { useToast } from '@/contexts/ToastContext';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export default function Dashboard() {
    const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showCollectionsGrid, setShowCollectionsGrid] = useState(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
    const [showNewNoteModal, setShowNewNoteModal] = useState(false);
    const [showNoteEditor, setShowNoteEditor] = useState(false);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');
    const [showBanner, setShowBanner] = useState(true);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Move Modal State
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [noteToMoveId, setNoteToMoveId] = useState<string | null>(null);

    // Password Protection State
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [pendingNote, setPendingNote] = useState<Note | null>(null);
    const [pendingCollectionId, setPendingCollectionId] = useState<string | null>(null);
    const [passwordPromptType, setPasswordPromptType] = useState<'note' | 'collection'>('note');
    const [unlockedCollections, setUnlockedCollections] = useState<Set<string>>(new Set());

    const { showToast } = useToast();

    const {
        notes, loading: notesLoading, handleCreateNote, handleSaveNote, handleDeleteNote,
        handleStarNote, handleArchiveNote, handleMoveToCollection
    } = useNotes();

    const { collections, loading: collectionsLoading, refreshCollections, handleUpdateCollection, handleDeleteCollection } = useCollections();

    // Collection edit/delete state
    const [isEditingCollection, setIsEditingCollection] = useState(false);
    const [editedCollectionName, setEditedCollectionName] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Show loader while initial data is loading
    if (notesLoading || collectionsLoading) {
        return <Loader />;
    }

    const onOpenNote = (note: Note) => {
        // Check if note is private and has password
        if (note.isPrivate && note.passwordHash) {
            setPendingNote(note);
            setPasswordPromptType('note');
            setShowPasswordPrompt(true);
        } else {
            setCurrentNote(note);
            setShowNoteEditor(true);
        }
    };

    const handlePasswordSuccess = async (password: string) => {
        if (passwordPromptType === 'note') {
            if (!pendingNote || !pendingNote.passwordHash) return;

            const isValid = await verifyPassword(password, pendingNote.passwordHash);

            if (isValid) {
                setCurrentNote(pendingNote);
                setShowNoteEditor(true);
                setShowPasswordPrompt(false);
                setPendingNote(null);
                showToast('Access granted! Welcome to your secret note. 🔓', 'success');
            } else {
                showToast('Wrong password! Nice try, hacker. 🚫', 'error');
            }
        } else if (passwordPromptType === 'collection') {
            if (!pendingCollectionId) return;

            const collection = collections.find(c => c.id === pendingCollectionId);
            if (!collection || !collection.passwordHash) return;

            const isValid = await verifyPassword(password, collection.passwordHash);

            if (isValid) {
                setUnlockedCollections(prev => new Set([...prev, pendingCollectionId]));
                setSelectedCollectionId(pendingCollectionId);
                setShowPasswordPrompt(false);
                setPendingCollectionId(null);
                showToast('Collection unlocked! Your secrets await. 🔓', 'success');
            } else {
                showToast('Wrong password! This collection stays locked. 🚫', 'error');
            }
        }
    };

    const handlePasswordCancel = () => {
        setShowPasswordPrompt(false);
        setPendingNote(null);
        setPendingCollectionId(null);
    };

    const handleSelectCollection = (collectionId: string | null) => {
        if (!collectionId) {
            setSelectedCollectionId(null);
            return;
        }

        const collection = collections.find(c => c.id === collectionId);

        if (collection?.isPrivate && collection.passwordHash && !unlockedCollections.has(collectionId)) {
            setPendingCollectionId(collectionId);
            setPasswordPromptType('collection');
            setShowPasswordPrompt(true);
        } else {
            setSelectedCollectionId(collectionId);
        }
    };

    const handleCreate = async (noteData: any) => {
        const newNote = await handleCreateNote(noteData);
        setCurrentNote(newNote);
        setShowNoteEditor(true);
        setShowNewNoteModal(false);
    };

    const onMoveHandler = (newCollectionId: string | null) => {
        if (noteToMoveId) {
            handleMoveToCollection(noteToMoveId, newCollectionId);
            setShowMoveModal(false);
            setNoteToMoveId(null);
        }
    };

    const handleNewCollectionClose = () => {
        setShowNewCollectionModal(false);
        // Refresh collections when modal closes
        refreshCollections();
    };

    const handleStartEditCollection = () => {
        if (collection) {
            setEditedCollectionName(collection.name);
            setIsEditingCollection(true);
        }
    };

    const handleRequestSave = () => {
        if (!editedCollectionName.trim()) return;
        setShowSaveConfirm(true);
    };

    const handleSaveCollectionName = async () => {
        if (!selectedCollectionId || !editedCollectionName.trim()) return;

        await handleUpdateCollection(selectedCollectionId, { name: editedCollectionName.trim() });
        setIsEditingCollection(false);
        setShowSaveConfirm(false);
        showToast('Collection renamed! Identity crisis averted. ✨', 'success');
    };

    const handleCancelEditCollection = () => {
        setIsEditingCollection(false);
        setEditedCollectionName('');
    };

    const handleConfirmDelete = async () => {
        if (!selectedCollectionId) return;

        await handleDeleteCollection(selectedCollectionId);
        setSelectedCollectionId(null);
        setShowDeleteConfirm(false);
        showToast('Collection deleted! Hope you didn\'t need that. 🗑️', 'success');
    };

    const collection = collections.find(c => c.id === selectedCollectionId);

    return (
        <div className="min-h-screen bg-[#f5f4e8] flex flex-col md:flex-row animate-fade-in">
            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 md:transform-none shadow-xl md:shadow-none ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader
                    showCollectionsGrid={showCollectionsGrid}
                    setShowCollectionsGrid={setShowCollectionsGrid}
                    setShowSettingsModal={setShowSettingsModal}
                    onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
                />

                <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8 bg-[#f5f4e8]">
                    {selectedCollectionId && (
                        <div className="mb-4 md:mb-6">
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
                                {isEditingCollection ? (
                                    <>
                                        {/* Emoji Picker Button */}
                                        <div className="relative flex-shrink-0">
                                            <button
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className="w-12 h-12 md:w-16 md:h-14 rounded-lg bg-[#f8f7f0] hover:bg-[#eeeee0] flex items-center justify-center text-2xl md:text-3xl transition-colors border-2 border-gray-200"
                                            >
                                                {collection?.emoji || '📝'}
                                            </button>

                                            {showEmojiPicker && (
                                                <div className="absolute top-14 md:top-16 left-0 z-50">
                                                    <EmojiPicker
                                                        onEmojiClick={(emojiData: any) => {
                                                            handleUpdateCollection(selectedCollectionId, { emoji: emojiData.emoji });
                                                            setShowEmojiPicker(false);
                                                        }}
                                                        width={280}
                                                        height={350}
                                                        searchDisabled={false}
                                                        skinTonesDisabled={true}
                                                        previewConfig={{ showPreview: false }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Inline Edit Mode - Responsive */}
                                        <input
                                            type="text"
                                            value={editedCollectionName}
                                            onChange={(e) => setEditedCollectionName(e.target.value)}
                                            className="text-xl md:text-2xl lg:text-3xl font-bold text-black bg-white border-2 border-black px-2 md:px-3 py-1 rounded-lg flex-1 min-w-0"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRequestSave();
                                                if (e.key === 'Escape') handleCancelEditCollection();
                                            }}
                                        />
                                        {/* Check button - Responsive */}
                                        <button
                                            onClick={handleRequestSave}
                                            className="p-1.5 md:p-2 hover:bg-green-100 rounded-lg transition-colors flex-shrink-0"
                                            title="Save"
                                        >
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                        {/* X button - Responsive */}
                                        <button
                                            onClick={handleCancelEditCollection}
                                            className="p-1.5 md:p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                                            title="Cancel"
                                        >
                                            <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Display Mode - Responsive */}
                                        <span className="text-2xl md:text-3xl lg:text-4xl flex-shrink-0">{collection?.emoji || '📝'}</span>
                                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black truncate flex-1 min-w-0">
                                            {collection?.name || 'Collection'}
                                        </h1>
                                        {/* Edit button - Responsive */}
                                        <button
                                            onClick={handleStartEditCollection}
                                            className="p-1.5 md:p-2 hover:bg-yellow-100 rounded-lg transition-colors flex-shrink-0"
                                            title="Edit collection name"
                                        >
                                            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        {/* Delete button - Responsive */}
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="p-1.5 md:p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                                            title="Delete collection"
                                        >
                                            <svg className="w-4 h-4 md:w-5 md:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {showBanner && <Banner onClose={() => setShowBanner(false)} />}

                    <SearchBar activeTab={activeTab} setActiveTab={setActiveTab} />

                    <NotesSection
                        notes={notes}
                        selectedCollectionId={selectedCollectionId}
                        activeTab={activeTab}
                        onNewNote={() => setShowNewNoteModal(true)}
                        onEditNote={onOpenNote}
                        onDeleteNote={handleDeleteNote}
                        onStarNote={handleStarNote}
                        onArchiveNote={handleArchiveNote}
                        onMoveNote={(id) => {
                            setNoteToMoveId(id);
                            setShowMoveModal(true);
                        }}
                        onShareNote={(note) => {
                            // Convert HTML content to readable text with proper formatting
                            const formatContent = (html: string) => {
                                if (!html) return '';

                                // Create a temporary div to parse HTML
                                const temp = document.createElement('div');
                                temp.innerHTML = html;

                                // Process task lists
                                const taskItems = temp.querySelectorAll('li[data-type="taskItem"]');
                                taskItems.forEach(item => {
                                    const checkbox = item.querySelector('input[type="checkbox"]');
                                    const isChecked = checkbox?.getAttribute('checked') !== null;
                                    const text = item.textContent || '';
                                    const prefix = isChecked ? '☑' : '☐';
                                    item.textContent = `${prefix} ${text}`;
                                });

                                // Replace common HTML elements with text equivalents
                                let text = temp.innerHTML;
                                text = text.replace(/<br\s*\/?>/gi, '\n');
                                text = text.replace(/<\/p>/gi, '\n');
                                text = text.replace(/<p>/gi, '');
                                text = text.replace(/<\/li>/gi, '\n');
                                text = text.replace(/<li>/gi, '• ');
                                text = text.replace(/<\/ul>/gi, '\n');
                                text = text.replace(/<ul>/gi, '');
                                text = text.replace(/<\/ol>/gi, '\n');
                                text = text.replace(/<ol>/gi, '');
                                text = text.replace(/<\/h[1-6]>/gi, '\n');
                                text = text.replace(/<h[1-6]>/gi, '');
                                text = text.replace(/<[^>]*>/g, '');

                                // Decode HTML entities
                                const textarea = document.createElement('textarea');
                                textarea.innerHTML = text;
                                text = textarea.value;

                                // Clean up extra newlines
                                text = text.replace(/\n{3,}/g, '\n\n');
                                text = text.trim();

                                return text;
                            };

                            const formattedContent = formatContent(note.content || '');
                            const shareText = `${note.title}\n\n${formattedContent}`;

                            if (navigator.share) {
                                navigator.share({
                                    title: note.title,
                                    text: shareText,
                                }).catch(() => {
                                    showToast('Share cancelled. Your secrets are safe! 🤫', 'info');
                                });
                            } else {
                                navigator.clipboard.writeText(shareText);
                                showToast('Note copied to clipboard! Share away! 📋', 'success');
                            }
                        }}
                    />
                </div>
            </div>

            <NewCollectionModal
                isOpen={showNewCollectionModal}
                onClose={handleNewCollectionClose}
            />

            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />

            <CollectionsGrid
                isOpen={showCollectionsGrid}
                onClose={() => setShowCollectionsGrid(false)}
                onAddNew={() => setShowNewCollectionModal(true)}
                onSelectCollection={handleSelectCollection}
                selectedCollectionId={selectedCollectionId}
                collections={collections}
            />

            <NewNoteModal
                isOpen={showNewNoteModal}
                onClose={() => setShowNewNoteModal(false)}
                onCreate={handleCreate}
                selectedCollectionId={selectedCollectionId}
            />

            <NoteEditor
                isOpen={showNoteEditor}
                onClose={() => {
                    setShowNoteEditor(false);
                    setCurrentNote(null);
                }}
                note={currentNote}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
                collectionTags={currentNote?.collectionId ? collections.find(c => c.id === currentNote.collectionId)?.tags || [] : []}
                allNotes={notes}
                collections={collections}
                onNavigateToNote={(noteId) => {
                    const targetNote = notes.find(n => n.id === noteId);
                    if (targetNote) {
                        setCurrentNote(targetNote);
                    }
                }}
            />

            <MoveNoteModal
                isOpen={showMoveModal}
                onClose={() => {
                    setShowMoveModal(false);
                    setNoteToMoveId(null);
                }}
                onMove={onMoveHandler}
            />

            <PasswordPromptModal
                isOpen={showPasswordPrompt}
                onClose={handlePasswordCancel}
                onSuccess={handlePasswordSuccess}
                itemName={passwordPromptType}
            />

            {/* Save Collection Confirmation Modal - Sarcastic Style - Responsive */}
            {showSaveConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[15px] md:rounded-[20px] p-6 md:p-8 max-w-xs md:max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-black">
                            Changing Names Again? 🙄
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 mb-5 md:mb-6">
                            Can't commit to anything, can you? Fine, go ahead and rename it.
                        </p>
                        <div className="flex gap-2 md:gap-3 flex-col sm:flex-row">
                            <button
                                onClick={() => setShowSaveConfirm(false)}
                                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-white hover:bg-gray-50 text-black text-sm md:text-base font-semibold rounded-xl border-2 border-gray-300 transition-colors"
                            >
                                Actually, nevermind
                            </button>
                            <button
                                onClick={handleSaveCollectionName}
                                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-[#ffd700] hover:bg-[#ffed4e] text-black text-sm md:text-base font-semibold rounded-xl transition-colors"
                            >
                                Yeah, I'm indecisive
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Collection Confirmation Modal - Sarcastic Style - Responsive */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[15px] md:rounded-[20px] p-6 md:p-8 max-w-xs md:max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-black">
                            Burn It All Down? 🔥
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 mb-5 md:mb-6">
                            Collection + notes = gone forever. Hope you're not having second thoughts!
                        </p>
                        <div className="flex gap-2 md:gap-3 flex-col sm:flex-row">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-white hover:bg-gray-50 text-black text-sm md:text-base font-semibold rounded-xl border-2 border-gray-300 transition-colors"
                            >
                                Wait, I panicked
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-red-500 hover:bg-red-600 text-white text-sm md:text-base font-semibold rounded-xl transition-colors"
                            >
                                Burn it down
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
