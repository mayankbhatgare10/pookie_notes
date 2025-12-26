'use client';

import { useState, useRef, useEffect } from 'react';

interface EditorActionsMenuProps {
    onShare: () => void;
    onLinkNote: () => void;
    onDelete: () => void;
}

export default function EditorActionsMenu({
    onShare,
    onLinkNote,
    onDelete,
}: EditorActionsMenuProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Calculate menu position when opening
    const handleToggleMenu = () => {
        setShowMenu(!showMenu);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Don't close if clicking the button or menu
            if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
                return;
            }

            setShowMenu(false);
        };

        if (showMenu) {
            // Use timeout to avoid immediate closing
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggleMenu}
                className="p-2 md:p-2.5 hover:bg-black/5 rounded-xl transition-colors"
                aria-label="More actions"
            >
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>

            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e0e0e0] py-1 z-[100] animate-slide-down"
                >
                    <button
                        onClick={() => {
                            onShare();
                            setShowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                    </button>

                    <button
                        onClick={() => {
                            onLinkNote();
                            setShowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Link to Note
                    </button>

                    <div className="border-t border-[#e0e0e0] my-1"></div>

                    <button
                        onClick={() => {
                            onDelete();
                            setShowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
