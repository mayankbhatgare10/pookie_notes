'use client';

interface Collection {
    id: string;
    name: string;
    emoji: string;
}

interface CollectionsGridProps {
    isOpen: boolean;
    onClose: () => void;
    onAddNew: () => void;
    onSelectCollection: (collectionId: string | null) => void;
    selectedCollectionId: string | null;
}

export default function CollectionsGrid({
    isOpen,
    onClose,
    onAddNew,
    onSelectCollection,
    selectedCollectionId
}: CollectionsGridProps) {
    // Sample collections - TODO: Replace with actual data
    const collections: Collection[] = [
        { id: '1', name: 'Movies', emoji: '🎬' },
        { id: '2', name: 'Work', emoji: '💼' },
        { id: '3', name: 'Personal', emoji: '🏠' },
        { id: '4', name: 'Ideas', emoji: '💡' },
        { id: '5', name: 'Travel', emoji: '✈️' },
        { id: '6', name: 'Books', emoji: '📚' },
        { id: '7', name: 'Music', emoji: '🎵' },
        { id: '8', name: 'Recipes', emoji: '🍳' },
        { id: '9', name: 'Fitness', emoji: '💪' },
        { id: '10', name: 'Projects', emoji: '🚀' },
    ];

    // Only show first 11 items (Add New + All Notes + 9 collections) for 3x4 grid
    const displayedCollections = collections.slice(0, 10);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Grid Popup */}
            <div className="fixed top-16 right-10 z-50 w-[320px] bg-white rounded-[20px] border border-[#e0e0e0] shadow-2xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-black">Hoards</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-[#f5f4e8] flex items-center justify-center transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Collections Grid - 3x4 strictly */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Add New Collection */}
                    <button
                        onClick={() => {
                            onAddNew();
                            onClose();
                        }}
                        className="aspect-square flex flex-col items-center justify-center gap-2 p-3 rounded-[16px] border-2 border-dashed border-[#d0d0d0] hover:border-[#999] hover:bg-[#f5f5f5] transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#f5f4e8] group-hover:bg-[#e0e0e0] flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-semibold text-black">Add New</span>
                    </button>

                    {/* All Notes (Default) */}
                    <button
                        onClick={() => {
                            onSelectCollection(null);
                            onClose();
                        }}
                        className="aspect-square flex flex-col items-center justify-center gap-2 p-3 rounded-[16px] border border-[#e0e0e0] hover:border-[#999] hover:bg-[#f5f5f5] transition-all group"
                    >
                        <div className="text-3xl">
                            📝
                        </div>
                        <span className="text-[10px] font-semibold text-black">All Notes</span>
                    </button>

                    {/* Existing Collections - Max 10 for 3x4 grid */}
                    {displayedCollections.map((collection) => (
                        <button
                            key={collection.id}
                            onClick={() => {
                                onSelectCollection(collection.id);
                                onClose();
                            }}
                            className="aspect-square flex flex-col items-center justify-center gap-2 p-3 rounded-[16px] border border-[#e0e0e0] hover:border-[#999] hover:bg-[#f5f5f5] transition-all group"
                        >
                            <div className="text-3xl">
                                {collection.emoji}
                            </div>
                            <span className="text-[10px] font-semibold text-black truncate w-full text-center">
                                {collection.name}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-5 pt-4 border-t border-[#e0e0e0]">
                    <p className="text-xs text-[#666] text-center">
                        {collections.length} hoard{collections.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </>
    );
}
