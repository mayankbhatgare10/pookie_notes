
'use client';

import { Note } from '@/hooks/useNotes';
import NoteCard from '@/components/NoteCard';
import { PlusIcon, ClockIcon, StarIcon, FolderIcon } from '@/components/icons';

interface NotesSectionProps {
    notes: Note[];
    selectedCollectionId: string | null;
    activeTab: 'all' | 'archived';
    onNewNote: () => void;
    onEditNote: (note: Note) => void;
    onDeleteNote: (id: string) => void;
    onStarNote: (id: string) => void;
    onArchiveNote: (id: string) => void;
    onMoveNote: (id: string) => void;
}

export default function NotesSection({
    notes, selectedCollectionId, activeTab,
    onNewNote, onEditNote, onDeleteNote, onStarNote, onArchiveNote, onMoveNote
}: NotesSectionProps) {

    if (activeTab === 'archived') {
        return (
            <div className="mb-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold">Archived Notes</h2>
                </div>
                {notes.filter(note => note.isArchived).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                        {notes.filter(note => note.isArchived).map(note => (
                            <NoteCard
                                key={note.id}
                                id={note.id}
                                title={note.title}
                                content={note.content}
                                color={note.color}
                                lastEdited={note.lastEdited}
                                isStarred={note.isStarred}
                                onEdit={() => onEditNote(note)}
                                onStar={() => onStarNote(note.id)}
                                onArchive={() => onArchiveNote(note.id)}
                                onDelete={() => onDeleteNote(note.id)}
                                onMove={() => onMoveNote(note.id)}
                                onClick={() => onEditNote(note)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-block bg-white rounded-[20px] px-8 py-12 shadow-sm">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f5f4e8] flex items-center justify-center text-4xl">
                                📦
                            </div>
                            <h3 className="text-lg font-bold text-black mb-2">No Archived Notes</h3>
                            <p className="text-sm text-[#a89968]">Your archived notes will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (selectedCollectionId) {
        return (
            <div className="mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    <button
                        onClick={onNewNote}
                        className="bg-[#fffacd] border-2 border-dashed border-black rounded-[24px] p-8 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                    >
                        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mb-4">
                            <PlusIcon className="w-8 h-8 text-[#fffacd]" />
                        </div>
                        <h3 className="font-bold text-black text-base mb-1">New Note!</h3>
                        <p className="text-xs text-black/80">Add to this collection.</p>
                    </button>
                    {notes
                        .filter(note => !note.isArchived && note.collectionId === selectedCollectionId)
                        .map(note => (
                            <NoteCard
                                key={note.id}
                                id={note.id}
                                title={note.title}
                                content={note.content}
                                color={note.color}
                                lastEdited={note.lastEdited}
                                isStarred={note.isStarred}
                                onEdit={() => onEditNote(note)}
                                onStar={() => onStarNote(note.id)}
                                onArchive={() => onArchiveNote(note.id)}
                                onDelete={() => onDeleteNote(note.id)}
                                onMove={() => onMoveNote(note.id)}
                                onClick={() => onEditNote(note)}
                            />
                        ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <ClockIcon className="w-5 h-5 text-[#a89968]" />
                        <h2 className="text-lg font-bold">Recent Notes</h2>
                    </div>
                    <button className="text-sm text-[#a89968] hover:text-black transition-colors">View All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    <button
                        onClick={onNewNote}
                        className="bg-[#fffacd] border-2 border-dashed border-black rounded-[24px] p-8 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                    >
                        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mb-4">
                            <PlusIcon className="w-8 h-8 text-[#fffacd]" />
                        </div>
                        <h3 className="font-bold text-black text-base mb-1">New Note!</h3>
                        <p className="text-xs text-black/80">Unleash your inner chaos.</p>
                    </button>
                    {notes
                        .filter(note => !note.isArchived)
                        .sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0))
                        .slice(0, 3)
                        .map(note => (
                            <NoteCard
                                key={note.id}
                                id={note.id}
                                title={note.title}
                                content={note.content}
                                color={note.color}
                                lastEdited={note.lastEdited}
                                isStarred={note.isStarred}
                                onEdit={() => onEditNote(note)}
                                onStar={() => onStarNote(note.id)}
                                onArchive={() => onArchiveNote(note.id)}
                                onDelete={() => onDeleteNote(note.id)}
                                onMove={() => onMoveNote(note.id)}
                                onClick={() => onEditNote(note)}
                            />
                        ))}
                </div>
            </div>

            {/* Starred Notes - Only show if there are starred notes */}
            {notes.filter(note => !note.isArchived && note.isStarred).length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <StarIcon className="w-5 h-5 text-[#a89968]" />
                            <h2 className="text-lg font-bold">Starred Notes</h2>
                        </div>
                        <button className="text-sm text-[#a89968] hover:text-black transition-colors">View All</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                        {notes
                            .filter(note => !note.isArchived && note.isStarred)
                            .slice(0, 4)
                            .map(note => (
                                <NoteCard
                                    key={note.id}
                                    id={note.id}
                                    title={note.title}
                                    content={note.content}
                                    color={note.color}
                                    lastEdited={note.lastEdited}
                                    isStarred={note.isStarred}
                                    onEdit={() => onEditNote(note)}
                                    onStar={() => onStarNote(note.id)}
                                    onArchive={() => onArchiveNote(note.id)}
                                    onDelete={() => onDeleteNote(note.id)}
                                    onMove={() => onMoveNote(note.id)}
                                    onClick={() => onEditNote(note)}
                                />
                            ))}
                    </div>
                </div>
            )}

            {/* Other Notes From Collections - Only show if there are notes in collections */}
            {notes.filter(note => !note.isArchived && note.collectionId !== null).length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <FolderIcon className="w-5 h-5 text-[#a89968]" />
                            <h2 className="text-lg font-bold">Other Notes From Collections</h2>
                        </div>
                        <button className="text-sm text-[#a89968] hover:text-black transition-colors">Browse Collections</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                        {notes
                            .filter(note => !note.isArchived && note.collectionId !== null)
                            .slice(0, 4)
                            .map(note => (
                                <NoteCard
                                    key={note.id}
                                    id={note.id}
                                    title={note.title}
                                    content={note.content}
                                    color={note.color}
                                    lastEdited={note.lastEdited}
                                    isStarred={note.isStarred}
                                    onEdit={() => onEditNote(note)}
                                    onStar={() => onStarNote(note.id)}
                                    onArchive={() => onArchiveNote(note.id)}
                                    onDelete={() => onDeleteNote(note.id)}
                                    onMove={() => onMoveNote(note.id)}
                                    onClick={() => onEditNote(note)}
                                />
                            ))}
                    </div>
                </div>
            )}
        </>
    );
}

