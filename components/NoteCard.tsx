'use client';

import { useState, useRef, useEffect } from 'react';

interface NoteCardProps {
    id: string;
    title: string;
    emoji: string;
    color: string;
    lastEdited: string;
    isStarred?: boolean;
    onEdit: () => void;
    onStar: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function NoteCard({
    id,
    title,
    emoji,
    color,
    lastEdited,
    isStarred = false,
    onEdit,
    onStar,
    onArchive,
    onDelete,
    onClick,
}: NoteCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            className="bg-white rounded-[20px] p-6 cursor-pointer hover:scale-[1.02] transition-all shadow-sm hover:shadow-md relative"
            onClick={onClick}
        >
            {/* Icon Circle */}
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-2xl"
                style={{ backgroundColor: color }}
            >
                {emoji}
            </div>

            {/* Title */}
            <h3 className="font-bold text-black text-base mb-3 line-clamp-2 leading-snug pr-8">
                {title}
            </h3>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#999]">{lastEdited}</span>

                {/* Star Icon */}
                {isStarred && (
                    <svg className="w-4 h-4 text-[#ffd700] fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                )}
            </div>

            {/* 3-Dot Menu */}
            <div className="absolute top-4 right-4" ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="w-7 h-7 rounded-full hover:bg-[#f5f4e8] flex items-center justify-center transition-colors"
                >
                    <svg className="w-4 h-4 text-[#666]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-[#e0e0e0] py-1 z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onEdit();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onStar();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill={isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {isStarred ? 'Unstar' : 'Star'}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onArchive();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            Archive
                        </button>
                        <div className="border-t border-[#e0e0e0] my-1"></div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onDelete();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
