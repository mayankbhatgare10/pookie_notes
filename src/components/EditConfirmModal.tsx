'use client';

import { createPortal } from 'react-dom';

interface EditConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    type: 'edit' | 'save';
}

export default function EditConfirmModal({ isOpen, onConfirm, onCancel, type }: EditConfirmModalProps) {
    if (!isOpen || typeof window === 'undefined') return null;

    const messages = {
        edit: {
            title: "Really? Editing Again? 🙄",
            message: "You sure you want to mess with perfection?",
            confirm: "Yeah, let me ruin it",
            cancel: "Nah, keep it safe"
        },
        save: {
            title: "Save Your Masterpiece? 🎨",
            message: "Are you absolutely sure these changes are worth saving?",
            confirm: "Yes, save my genius",
            cancel: "Wait, let me fix it"
        }
    };

    const content = messages[type];

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-modal-backdrop"
                onClick={onCancel}
            />

            {/* Modal - Clean & Minimal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90%] max-w-md animate-modal-enter">
                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-black mb-3">
                        {content.title}
                    </h3>

                    {/* Message */}
                    <p className="text-base text-black/60 mb-8">
                        {content.message}
                    </p>

                    {/* Buttons - Clean, yellow confirm */}
                    <div className="flex gap-3 flex-col-reverse sm:flex-row">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-5 py-3 bg-white border-2 border-black/10 hover:border-black/20 text-black font-semibold rounded-xl transition-all tap-target"
                        >
                            {content.cancel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-5 py-3 bg-[#ffd700] hover:bg-[#ffed4e] text-black font-bold rounded-xl transition-all shadow-md tap-target"
                        >
                            {content.confirm}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
