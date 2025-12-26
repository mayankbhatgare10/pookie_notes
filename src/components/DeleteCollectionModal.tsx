'use client';

import { useState } from 'react';
import { Collection } from '@/lib/collectionsService';

interface DeleteCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collection: Collection | null;
    noteCount: number;
    availableCollections: Collection[];
    onConfirm: (action: 'delete' | 'move', targetCollectionId?: string) => void;
}

export default function DeleteCollectionModal({
    isOpen,
    onClose,
    collection,
    noteCount,
    availableCollections,
    onConfirm,
}: DeleteCollectionModalProps) {
    const [selectedAction, setSelectedAction] = useState<'delete' | 'move'>('move');
    const [targetCollectionId, setTargetCollectionId] = useState('');

    if (!isOpen || !collection) return null;

    const handleConfirm = () => {
        if (selectedAction === 'move' && !targetCollectionId) {
            return; // Don't proceed if move is selected but no target chosen
        }
        onConfirm(selectedAction, targetCollectionId || undefined);
        onClose();
    };

    const getSarcasticMessage = () => {
        if (noteCount === 0) {
            return "This collection is emptier than your promises to organize your life. Safe to delete! 🗑️";
        }
        if (noteCount === 1) {
            return `Oh look, 1 lonely note is about to lose its home. How sad. 😢`;
        }
        if (noteCount < 5) {
            return `You've got ${noteCount} notes here. Not much, but still... what should we do with them? 🤔`;
        }
        if (noteCount < 10) {
            return `Whoa, ${noteCount} notes! Someone's been busy. Or just hoarding. Probably hoarding. 📚`;
        }
        return `${noteCount} notes?! That's a lot of digital clutter. Time for some spring cleaning? 🧹`;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl md:rounded-3xl shadow-2xl z-[90] p-5 md:p-6 animate-scale-in">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-black flex items-center gap-2">
                            <span>{collection.emoji}</span>
                            Delete "{collection.name}"?
                        </h2>
                        <p className="text-xs md:text-sm text-[#666] mt-1">
                            {getSarcasticMessage()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-[#f5f4e8] flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {noteCount > 0 && (
                    <>
                        {/* Options */}
                        <div className="space-y-3 mb-6">
                            {/* Move Option */}
                            <label className="flex items-start gap-3 p-4 border-2 border-[#e0e0e0] rounded-xl cursor-pointer hover:bg-[#f5f4e8] transition-colors">
                                <input
                                    type="radio"
                                    name="action"
                                    value="move"
                                    checked={selectedAction === 'move'}
                                    onChange={() => setSelectedAction('move')}
                                    className="mt-1 w-4 h-4 text-[#ffd700] focus:ring-[#ffd700]"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-black">Move notes to another collection</div>
                                    <div className="text-xs text-[#666] mt-1">
                                        Because you're not THAT heartless... right? 💛
                                    </div>
                                    {selectedAction === 'move' && (
                                        <select
                                            value={targetCollectionId}
                                            onChange={(e) => setTargetCollectionId(e.target.value)}
                                            className="mt-3 w-full px-3 py-2 border-2 border-[#e0e0e0] rounded-lg focus:border-[#ffd700] focus:outline-none text-sm"
                                        >
                                            <option value="">Choose a new home...</option>
                                            {availableCollections
                                                .filter(c => c.id !== collection.id)
                                                .map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.emoji} {c.name}
                                                    </option>
                                                ))}
                                        </select>
                                    )}
                                </div>
                            </label>

                            {/* Delete Option */}
                            <label className="flex items-start gap-3 p-4 border-2 border-red-200 rounded-xl cursor-pointer hover:bg-red-50 transition-colors">
                                <input
                                    type="radio"
                                    name="action"
                                    value="delete"
                                    checked={selectedAction === 'delete'}
                                    onChange={() => setSelectedAction('delete')}
                                    className="mt-1 w-4 h-4 text-red-500 focus:ring-red-500"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-red-600">Delete everything</div>
                                    <div className="text-xs text-red-500 mt-1">
                                        Scorched earth policy. No survivors. 🔥💀
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Warning */}
                        {selectedAction === 'delete' && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-600 font-medium">
                                    ⚠️ Hold up! This will permanently delete {noteCount} {noteCount === 1 ? 'note' : 'notes'}.
                                    No undo button. No "oops, my bad." Just... gone. Forever.
                                    Are you SURE about this? 🤨
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 md:py-3 border-2 border-[#e0e0e0] rounded-xl font-semibold text-sm text-black hover:bg-[#f5f4e8] transition-colors order-2 sm:order-1"
                    >
                        Nevermind
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedAction === 'move' && !targetCollectionId && noteCount > 0}
                        className={`flex-1 px-4 py-2.5 md:py-3 rounded-xl font-bold text-sm transition-colors border-2 order-1 sm:order-2 ${selectedAction === 'delete'
                            ? 'bg-red-500 hover:bg-red-600 text-white border-red-600 disabled:bg-red-300 disabled:border-red-300'
                            : 'bg-[#ffd700] hover:bg-[#ffed4e] text-black border-black disabled:bg-[#e0e0e0] disabled:border-[#e0e0e0]'
                            } disabled:cursor-not-allowed`}
                    >
                        {noteCount === 0
                            ? "Delete It"
                            : selectedAction === 'delete'
                                ? "Yes, Delete Everything"
                                : "Move & Delete"}
                    </button>
                </div>

                {/* Sarcastic Footer */}
                {noteCount > 0 && (
                    <p className="text-center text-xs text-[#999] mt-4 italic">
                        {selectedAction === 'delete'
                            ? "Bold choice. I respect the chaos. 😈"
                            : "Responsible AND organized? Look at you go! ⭐"}
                    </p>
                )}
            </div>
        </>
    );
}
