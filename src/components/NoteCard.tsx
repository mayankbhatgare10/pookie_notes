'use client';

import { useState, useRef, useEffect } from 'react';
import { StarIcon, MultiDotsIcon, EditIcon, ArchiveIcon, MoveIcon, TrashIcon, ShareIcon } from '@/components/icons';

interface NoteCardProps {
    id: string;
    title: string;
    content?: string;
    color: string;
    lastEdited: string;
    isStarred?: boolean;
    onEdit: () => void;
    onStar: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onMove?: () => void;
    onShare?: () => void;
    onClick: () => void;
}

export default function NoteCard({
    id,
    title,
    content,
    color,
    lastEdited,
    isStarred = false,
    onEdit,
    onStar,
    onArchive,
    onDelete,
    onMove,
    onShare,
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
            className="bg-white rounded-[20px] p-6 cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-md relative animate-scale-in"
            onClick={onClick}
        >
            {/* Title */}
            <h3 className="font-bold text-black text-base mb-2 line-clamp-1 leading-snug pr-8">
                {title}
            </h3>

            {/* Content Preview */}
            {content && (
                <div
                    className="text-xs text-black/60 mb-3 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{
                        __html: content.replace(/<[^>]*>/g, ' ').substring(0, 150)
                    }}
                />
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] text-[#999]">{lastEdited}</span>

                {/* Star Icon */}
                {isStarred && (
                    <span className="text-[#ffd700]">
                        <StarIcon className="w-4 h-4 fill-current" />
                    </span>
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
                    <MultiDotsIcon className="w-4 h-4 text-[#666]" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#e0e0e0] py-1 z-10 animate-slide-down max-h-[280px] overflow-y-auto">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onEdit();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
                        >
                            <EditIcon className="w-4 h-4" />
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
                            <StarIcon className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                            {isStarred ? 'Unstar' : 'Star'}
                        </button>
                        {onShare && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onShare();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
                            >
                                <ShareIcon className="w-4 h-4" />
                                Share
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onArchive();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
                        >
                            <ArchiveIcon className="w-4 h-4" />
                            Archive
                        </button>
                        {onMove && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onMove();
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
                            >
                                <MoveIcon className="w-4 h-4" />
                                Move to Collection
                            </button>
                        )}
                        <div className="border-t border-[#e0e0e0] my-1"></div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onDelete();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
