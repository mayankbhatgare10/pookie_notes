'use client';

import { useState } from 'react';
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

    const { collections, loading: collectionsLoading, refreshCollections } = useCollections();

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
                            <h1 className="text-2xl md:text-3xl font-bold text-black flex items-center gap-2 md:gap-3">
                                <span className="text-3xl md:text-4xl">{collection?.emoji || '📝'}</span>
                                <span className="truncate">{collection?.name || 'Collection'}</span>
                            </h1>
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
        </div>
    );
}
