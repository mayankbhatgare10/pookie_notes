'use client';

import { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface NewNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCollectionId?: string | null;
    editMode?: boolean;
    noteData?: {
        title: string;
        color: string;
        emoji: string;
        collectionId: string | null;
        isPrivate: boolean;
    };
}

export default function NewNoteModal({
    isOpen,
    onClose,
    selectedCollectionId = null,
    editMode = false,
    noteData
}: NewNoteModalProps) {
    const [title, setTitle] = useState(noteData?.title || '');
    const [selectedColor, setSelectedColor] = useState(noteData?.color || '#e8d4ff');
    const [selectedEmoji, setSelectedEmoji] = useState(noteData?.emoji || '📝');
    const [selectedCollection, setSelectedCollection] = useState(noteData?.collectionId || selectedCollectionId || null);
    const [isPrivate, setIsPrivate] = useState(noteData?.isPrivate || false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const colors = [
        { name: 'Purple', value: '#e8d4ff' },
        { name: 'Blue', value: '#d4e8ff' },
        { name: 'Green', value: '#d4ffe8' },
        { name: 'Yellow', value: '#fffacd' },
        { name: 'Pink', value: '#ffd4e8' },
        { name: 'Orange', value: '#ffe8d4' },
        { name: 'Red', value: '#ffd4d4' },
        { name: 'Mint', value: '#d4fff4' },
    ];

    const collections = [
        { id: '1', name: 'Movies', emoji: '🎬' },
        { id: '2', name: 'Work', emoji: '💼' },
        { id: '3', name: 'Personal', emoji: '🏠' },
        { id: '4', name: 'Ideas', emoji: '💡' },
        { id: '5', name: 'Travel', emoji: '✈️' },
    ];

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setSelectedEmoji(emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleCreate = () => {
        // TODO: Implement note creation logic
        console.log({
            title,
            color: selectedColor,
            emoji: selectedEmoji,
            collectionId: selectedCollection,
            isPrivate,
            password: isPrivate ? password : null,
        });
        onClose();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[480px] shadow-2xl relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-black hover:text-gray-600 transition-colors z-10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Title */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-black mb-0.5">
                            {editMode ? 'Edit Note' : 'Create New Note'}
                        </h2>
                        <p className="text-xs text-[#666]">Set up your note details.</p>
                    </div>

                    {/* Note Title */}
                    <div className="mb-5">
                        <label className="block text-[9px] font-bold text-[#666] uppercase tracking-wider mb-2">
                            Note Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My awesome note..."
                            className="w-full px-4 py-2.5 rounded-lg bg-[#f8f7f0] border border-[#e0e0e0] text-sm focus:outline-none focus:ring-1 focus:ring-[#999] transition-all"
                        />
                    </div>

                    {/* Color Selection */}
                    <div className="mb-5">
                        <label className="block text-[9px] font-bold text-[#666] uppercase tracking-wider mb-2">
                            Note Color
                        </label>
                        <div className="grid grid-cols-8 gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-10 h-10 rounded-lg transition-all ${selectedColor === color.value
                                            ? 'ring-2 ring-black scale-110'
                                            : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Icon Selection */}
                    <div className="mb-5">
                        <label className="block text-[9px] font-bold text-[#666] uppercase tracking-wider mb-2">
                            Note Icon
                        </label>
                        <div className="relative" ref={emojiPickerRef}>
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="w-full px-4 py-2.5 rounded-lg bg-[#f8f7f0] border border-[#e0e0e0] text-left flex items-center gap-3 hover:bg-[#eeeee0] transition-colors"
                            >
                                <span className="text-2xl">{selectedEmoji}</span>
                                <span className="text-sm text-[#666]">Click to change icon</span>
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute top-12 left-0 z-50">
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        width={320}
                                        height={400}
                                        searchDisabled={false}
                                        skinTonesDisabled={true}
                                        previewConfig={{ showPreview: false }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Collection Selection - Hidden if creating from collection */}
                    {!selectedCollectionId && (
                        <div className="mb-5">
                            <label className="block text-[9px] font-bold text-[#666] uppercase tracking-wider mb-2">
                                Collection (Optional)
                            </label>
                            <select
                                value={selectedCollection || ''}
                                onChange={(e) => setSelectedCollection(e.target.value || null)}
                                className="w-full px-4 py-2.5 rounded-lg bg-[#f8f7f0] border border-[#e0e0e0] text-sm focus:outline-none focus:ring-1 focus:ring-[#999] transition-all"
                            >
                                <option value="">No Collection</option>
                                {collections.map((collection) => (
                                    <option key={collection.id} value={collection.id}>
                                        {collection.emoji} {collection.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Privacy Toggle */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#f8f7f0] border border-[#e0e0e0]">
                            <div>
                                <h3 className="text-sm font-semibold text-black">Lock It Up</h3>
                                <p className="text-xs text-[#666]">Keep your secrets safe.</p>
                            </div>
                            <button
                                onClick={() => setIsPrivate(!isPrivate)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${isPrivate ? 'bg-black' : 'bg-[#d0d0d0]'
                                    }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0.5'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Password Fields - Show when private */}
                    {isPrivate && (
                        <div className="mb-5 space-y-3">
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#f8f7f0] border border-[#e0e0e0] text-sm focus:outline-none focus:ring-1 focus:ring-[#999] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-black"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#f8f7f0] border border-[#e0e0e0] text-sm focus:outline-none focus:ring-1 focus:ring-[#999] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-black"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Create Button */}
                    <button
                        onClick={handleCreate}
                        className="w-full py-3 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] text-black font-bold text-sm transition-all mb-3"
                    >
                        {editMode ? 'Save Changes' : 'Create Note'}
                    </button>

                    {/* Footer Text */}
                    <div className="text-center">
                        <button onClick={onClose} className="text-xs text-[#666] hover:text-black transition-colors">
                            Nevermind, I'll procrastinate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
