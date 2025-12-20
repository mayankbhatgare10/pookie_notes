'use client';

import { useEffect, useState } from 'react';

interface RefreshConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const SARCASTIC_REFRESH_MESSAGES = [
    {
        title: "Whoa there, genius! 🤔",
        message: "Refreshing will log you out. Sure you wanna do that?"
    },
    {
        title: "Hold up! 🛑",
        message: "You're about to lose your session. Still feeling lucky?"
    },
    {
        title: "Really? 😒",
        message: "Refresh = Logout. Math is hard, I know."
    },
    {
        title: "Bold move! 🎲",
        message: "Refreshing will kick you out. Proceed at your own risk!"
    },
    {
        title: "Wait a sec! ⏸️",
        message: "You'll need to login again if you refresh. Your choice, pookie!"
    },
    {
        title: "Uh oh! 😬",
        message: "Refresh detected! This will log you out faster than you can say 'oops'."
    },
    {
        title: "Heads up! 💡",
        message: "Refreshing = Starting over. Are you absolutely sure?"
    },
    {
        title: "Think twice! 🤨",
        message: "Your session will vanish like your motivation on Monday."
    }
];

export default function RefreshConfirmModal({ isOpen, onConfirm, onCancel }: RefreshConfirmModalProps) {
    const [message, setMessage] = useState(SARCASTIC_REFRESH_MESSAGES[0]);

    useEffect(() => {
        if (isOpen) {
            // Pick a random message when modal opens
            const randomMessage = SARCASTIC_REFRESH_MESSAGES[Math.floor(Math.random() * SARCASTIC_REFRESH_MESSAGES.length)];
            setMessage(randomMessage);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] animate-fade-in" />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4">
                <div className="bg-white rounded-[24px] border-2 border-black p-6 md:p-8 max-w-md w-full shadow-2xl animate-scale-in">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fff4e6] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-[#2d5016] text-center mb-2">
                        {message.title}
                    </h3>

                    {/* Message */}
                    <p className="text-sm md:text-base text-[#8b7355] text-center mb-6">
                        {message.message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 md:py-3.5 rounded-full bg-white border-2 border-black text-black font-bold text-sm md:text-base hover:bg-[#f5f4e8] transition-colors"
                        >
                            Nah, Stay Here
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 md:py-3.5 rounded-full bg-[#ff6b00] hover:bg-[#ff8533] border-2 border-black text-white font-bold text-sm md:text-base transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            Yeah, Log Me Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
