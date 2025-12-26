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

            {/* Modal - Responsive */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl md:rounded-3xl shadow-2xl z-[100] p-5 md:p-6 animate-scale-in border-2 border-[#ffd700]">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 md:mb-5">
                    <h2 className="text-base md:text-lg font-bold text-black pr-2">
                        {getSarcasticMessage()}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-[#f5f4e8] flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Item Preview */}
                <div className="bg-[#fffef5] border-l-4 border-[#ffd700] p-3 md:p-4 rounded-lg mb-5 md:mb-6">
                    <p className="text-xs md:text-sm text-black/80 font-medium break-words">
                        ✓ {itemText}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 md:py-3 border-2 border-[#e0e0e0] rounded-xl font-semibold text-sm text-black hover:bg-[#f5f4e8] transition-colors order-2 sm:order-1"
                    >
                        Nah
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 md:py-3 bg-[#ffd700] hover:bg-[#ffed4e] rounded-xl font-bold text-sm text-black transition-colors border-2 border-black order-1 sm:order-2"
                    >
                        Sync It! ✨
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] md:text-xs text-[#999] mt-3 md:mt-4 italic">
                    I'll remember this... maybe. 😏
                </p>
            </div>
        </>
    );
}
