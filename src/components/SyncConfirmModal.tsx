'use client';

interface SyncConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    targetNoteName: string;
    itemText: string;
}

export default function SyncConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    targetNoteName,
    itemText,
}: SyncConfirmModalProps) {
    if (!isOpen) return null;

    const getSarcasticMessage = () => {
        const messages = [
            `Oh, you checked something? Want me to move this to "${targetNoteName}"? 🙄`,
            `Look at you, being productive! Should I sync this to "${targetNoteName}"? ✨`,
            `Checkbox checked! Feeling generous enough to share with "${targetNoteName}"? 🎁`,
            `Wow, actual progress! Want this in "${targetNoteName}" too? 🚀`,
            `Oh my, a completed task! Shall we tell "${targetNoteName}" about this achievement? 🏆`,
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[100] p-6 animate-scale-in border-2 border-[#ffd700]">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-black mb-2">
                            {getSarcasticMessage()}
                        </h2>
                        <div className="bg-[#fffef5] border-l-4 border-[#ffd700] p-3 rounded">
                            <p className="text-sm text-black/80 font-medium">
                                ✓ {itemText}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-[#f5f4e8] flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Info */}
                <div className="mb-6">
                    <p className="text-sm text-[#666] mb-3">
                        This will add the completed item to <strong>"{targetNoteName}"</strong> with a timestamp.
                    </p>
                    <p className="text-xs text-[#999] italic">
                        Because apparently one checklist wasn't enough for you. 📝
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border-2 border-[#e0e0e0] rounded-xl font-semibold text-black hover:bg-[#f5f4e8] transition-colors"
                    >
                        Nah, Keep It Here
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-3 bg-[#ffd700] hover:bg-[#ffed4e] rounded-xl font-bold text-black transition-colors border-2 border-black"
                    >
                        Yes, Sync It! ✨
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-[#999] mt-4 italic">
                    Don't worry, I'll remember this decision... for now. 😏
                </p>
            </div>
        </>
    );
}
