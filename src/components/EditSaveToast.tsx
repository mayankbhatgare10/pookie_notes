'use client';

import { useEffect, useState } from 'react';

interface EditSaveToastProps {
    isEditing: boolean;
    isSaving?: boolean;
}

export default function EditSaveToast({ isEditing, isSaving }: EditSaveToastProps) {
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [prevEditing, setPrevEditing] = useState(isEditing);

    const sarcasticMessages = {
        editing: [
            "Oh great, you're editing now 🙄",
            "Time to mess things up! ✏️",
            "Edit mode activated. Don't break it! 😏",
            "Let the chaos begin... 📝",
            "Editing mode: Where mistakes happen ✨",
            "Ready to ruin perfection? 🎨",
        ],
        saving: [
            "Saving your masterpiece... 🎨",
            "Okay fine, I'll save it 💾",
            "Saved! You're welcome 😌",
            "Your precious words are safe now 🙏",
            "Saved! Don't mess it up again 😏",
            "Backed up your brilliance 💫",
        ]
    };

    useEffect(() => {
        // Detect when editing mode changes
        if (isEditing !== prevEditing) {
            setPrevEditing(isEditing);

            if (isEditing) {
                // Show editing message
                const randomMsg = sarcasticMessages.editing[Math.floor(Math.random() * sarcasticMessages.editing.length)];
                setMessage(randomMsg);
                setShow(true);

                // Hide after 2.5 seconds
                const timer = setTimeout(() => setShow(false), 2500);
                return () => clearTimeout(timer);
            } else {
                // Show saving message when exiting edit mode
                const randomMsg = sarcasticMessages.saving[Math.floor(Math.random() * sarcasticMessages.saving.length)];
                setMessage(randomMsg);
                setShow(true);

                // Hide after 2.5 seconds
                const timer = setTimeout(() => setShow(false), 2500);
                return () => clearTimeout(timer);
            }
        }
    }, [isEditing, prevEditing]);

    if (!show) return null;

    return (
        <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[9999] animate-modal-enter pointer-events-none">
            <div className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-black px-4 md:px-6 py-2.5 md:py-3 rounded-full shadow-2xl border-2 border-black/10 flex items-center gap-2 md:gap-3 max-w-[90vw] md:max-w-md">
                <span className="text-sm md:text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    {message}
                </span>
            </div>
        </div>
    );
}
