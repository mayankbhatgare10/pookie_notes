'use client';

import { useState, useRef, useEffect } from 'react';
import { Note } from '@/hooks/useNotes';

interface FooterConnectionsPopupProps {
    connectedNotes: Note[];
    onNavigateToNote: (noteId: string) => void;
}

export default function FooterConnectionsPopup({
    connectedNotes,
    onNavigateToNote,
}: FooterConnectionsPopupProps) {
    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ bottom: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const handleTogglePopup = () => {
        if (!showPopup && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPopupPosition({
                bottom: window.innerHeight - rect.top + 4, // Closer to button
                left: rect.left,
            });
        }
        setShowPopup(!showPopup);
    };

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (buttonRef.current?.contains(target) || popupRef.current?.contains(target)) {
                return;
            }

            setShowPopup(false);
        };

        if (showPopup) {
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPopup]);

    const totalConnections = connectedNotes.length;

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setShowPopup(!showPopup)}
                className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-black/5 px-2 py-1 rounded-lg transition-colors"
                title="Connected notes"
            >
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="font-medium text-black/60">
                    {totalConnections} {totalConnections === 1 ? 'connection' : 'connections'}
                </span>
            </button>

            {showPopup && totalConnections > 0 && (
                <div
                    ref={popupRef}
                    className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-lg border border-[#e0e0e0] py-2 z-[100]"
                >
                    <div className="px-3 py-2 border-b border-[#e0e0e0]">
                        <h4 className="text-xs font-bold text-black uppercase tracking-wide">
                            Connected Notes
                        </h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {connectedNotes.map((note, index) => (
                            <button
                                key={`${note.id}-${index}`}
                                onClick={() => {
                                    onNavigateToNote(note.id);
                                    setShowPopup(false);
                                }}
                                className="w-full px-3 py-2.5 text-left hover:bg-[#f5f4e8] transition-colors flex items-center gap-2 group"
                            >
                                <svg className="w-4 h-4 text-[#666] group-hover:text-black transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-black truncate">
                                        {note.title}
                                    </p>
                                    <p className="text-xs text-[#666] truncate">
                                        {typeof note.lastEdited === 'string'
                                            ? note.lastEdited
                                            : 'Recently edited'}
                                    </p>
                                </div>
                                <svg className="w-4 h-4 text-[#666] group-hover:text-black transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
