
'use client';

import { useState } from 'react';
import { useCollections } from '@/hooks/useCollections';

interface MoveNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (collectionId: string | null) => void;
}

export default function MoveNoteModal({ isOpen, onClose, onMove }: MoveNoteModalProps) {
    const [targetCollection, setTargetCollection] = useState<string | null>(null);
    const { collections } = useCollections();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-[90%] md:w-full shadow-2xl">
                <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Move to Collection</h2>
                <p className="text-xs md:text-sm text-black/60 mb-5 md:mb-6">Select a collection to move this note to:</p>

                <select
                    value={targetCollection || ''}
                    onChange={(e) => setTargetCollection(e.target.value || null)}
                    className="w-full px-4 py-2.5 md:py-3 border-2 border-black/10 rounded-xl mb-5 md:mb-6 text-sm focus:outline-none focus:border-[#ffd700]"
                >
                    <option value="">No Collection</option>
                    {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                            {collection.emoji} {collection.name}
                        </option>
                    ))}
                </select>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-2.5 md:py-3 border-2 border-black/10 rounded-xl font-bold text-sm hover:bg-black/5 transition-colors order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onMove(targetCollection)}
                        className="flex-1 px-6 py-2.5 md:py-3 bg-[#ffd700] hover:bg-[#ffed4e] rounded-xl font-bold text-sm transition-colors order-1 sm:order-2"
                    >
                        Move
                    </button>
                </div>
            </div>
        </div>
    );
}
