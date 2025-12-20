'use client';

import { useState } from 'react';
import NewCollectionModal from '@/components/NewCollectionModal';
import SettingsModal from '@/components/SettingsModal';
import CollectionsGrid from '@/components/CollectionsGrid';
import NewNoteModal from '@/components/NewNoteModal';
import NoteEditor from '@/components/NoteEditor';
import MoveNoteModal from '@/components/MoveNoteModal';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/Header';
import Banner from '@/components/dashboard/Banner';
import SearchBar from '@/components/dashboard/SearchBar';
import NotesSection from '@/components/dashboard/NotesSection';
import Loader from '@/components/Loader';
import { useNotes, Note } from '@/hooks/useNotes';
import { useCollections } from '@/hooks/useCollections';

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

    const {
        notes, loading: notesLoading, handleCreateNote, handleSaveNote, handleDeleteNote,
        handleStarNote, handleArchiveNote, handleMoveToCollection
    } = useNotes();

    const { collections, loading: collectionsLoading } = useCollections();

    // Show loader while initial data is loading
    if (notesLoading || collectionsLoading) {
        return <Loader />;
    }

    const onOpenNote = (note: Note) => {
        setCurrentNote(note);
        setShowNoteEditor(true);
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
            <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 md:transform-none ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
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
                    />
                </div>
            </div>

            <NewCollectionModal
                isOpen={showNewCollectionModal}
                onClose={() => setShowNewCollectionModal(false)}
            />

            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />

            <CollectionsGrid
                isOpen={showCollectionsGrid}
                onClose={() => setShowCollectionsGrid(false)}
                onAddNew={() => setShowNewCollectionModal(true)}
                onSelectCollection={setSelectedCollectionId}
                selectedCollectionId={selectedCollectionId}
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
                collectionTags={selectedCollectionId ? collections.find(c => c.id === selectedCollectionId)?.tags || [] : []}
            />

            <MoveNoteModal
                isOpen={showMoveModal}
                onClose={() => {
                    setShowMoveModal(false);
                    setNoteToMoveId(null);
                }}
                onMove={onMoveHandler}
            />
        </div>
    );
}
