
'use client';

import { useState } from 'react';
import NewCollectionModal from './NewCollectionModal';
import SettingsModal from './SettingsModal';
import CollectionsGrid from './CollectionsGrid';
import NewNoteModal from './NewNoteModal';
import NoteEditor from './NoteEditor';
import MoveNoteModal from './MoveNoteModal';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/Header';
import Banner from '@/components/dashboard/Banner';
import SearchBar from '@/components/dashboard/SearchBar';
import NotesSection from '@/components/dashboard/NotesSection';
import { useNotes, Note } from '@/hooks/useNotes';
import { COLLECTIONS } from '@/utils/constants';

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

    // Move Modal State
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [noteToMoveId, setNoteToMoveId] = useState<string | null>(null);

    const {
        notes, handleCreateNote, handleSaveNote, handleDeleteNote,
        handleStarNote, handleArchiveNote, handleMoveToCollection
    } = useNotes();

    const onOpenNote = (note: Note) => {
        setCurrentNote(note);
        setShowNoteEditor(true);
    };

    const handleCreate = (noteData: any) => {
        const newNote = handleCreateNote(noteData);
        setCurrentNote(newNote);
        setShowNoteEditor(true);
        setShowNewNoteModal(false);
    };

    // Move Handler wrapper
    const onMoveHandler = (newCollectionId: string | null) => {
        if (noteToMoveId) {
            handleMoveToCollection(noteToMoveId, newCollectionId);
            setShowMoveModal(false);
            setNoteToMoveId(null);
        }
    };

    const collection = COLLECTIONS.find(c => c.id === selectedCollectionId);

    return (
        <div className="min-h-screen bg-[#f5f4e8] flex">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <DashboardHeader
                    showCollectionsGrid={showCollectionsGrid}
                    setShowCollectionsGrid={setShowCollectionsGrid}
                    setShowSettingsModal={setShowSettingsModal}
                />

                <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#f5f4e8]">
                    {selectedCollectionId && (
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                                <span className="text-4xl">{collection?.emoji || '📝'}</span>
                                <span>{collection?.name || 'Collection'}</span>
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
                collectionTags={selectedCollectionId ? COLLECTIONS.find(c => c.id === selectedCollectionId)?.tags || [] : []}
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
