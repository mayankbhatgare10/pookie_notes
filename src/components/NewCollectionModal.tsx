'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/contexts/ToastContext';
import { useCollections } from '@/hooks/useCollections';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface NewCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewCollectionModal({ isOpen, onClose }: NewCollectionModalProps) {
    const { showToast } = useToast();
    const { handleCreateCollection: createCollection } = useCollections();
    const [collectionName, setCollectionName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('❤️');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [tagsEnabled, setTagsEnabled] = useState(false);
    const [lockEnabled, setLockEnabled] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tags, setTags] = useState<string[]>(['aesthetic', 'ideas']);
    const [newTag, setNewTag] = useState('');
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleEmojiClick = (emojiData: any) => {
        setSelectedEmoji(emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleCreateCollectionClick = async () => {
        if (!collectionName.trim()) {
            showToast('Please enter a collection name! Even chaos needs a label. 📦', 'warning');
            return;
        }

        if (lockEnabled && password !== confirmPassword) {
            showToast('Passwords don\'t match! Try again, genius. 🔐', 'error');
            return;
        }

        try {
            await createCollection({
                name: collectionName,
                emoji: selectedEmoji,
                tags: tagsEnabled ? tags : [],
            });

            // Reset form
            setCollectionName('');
            setSelectedEmoji('❤️');
            setTagsEnabled(false);
            setLockEnabled(false);
            setPassword('');
            setConfirmPassword('');
            setTags(['aesthetic', 'ideas']);

            onClose();
        } catch (error) {
            console.error('Error creating collection:', error);
        }
    };

    // Close emoji picker when clicking outside
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
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[16px] md:rounded-[20px] p-5 md:p-6 max-w-[400px] w-full relative shadow-lg">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 md:top-5 right-4 md:right-5 text-black hover:text-gray-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Title */}
                <div className="mb-4 md:mb-5">
                    <h2 className="text-lg md:text-xl font-bold text-black mb-0.5">Start a Hoard</h2>
                    <p className="text-xs text-[#666]">Organize your mess, one pixel at a time.</p>
                </div>

                {/* Collection Name with Emoji Picker */}
                <div className="mb-5">
                    <label className="block text-[9px] font-bold text-[#666] uppercase tracking-wider mb-2">
                        Collection Name
                    </label>
                    <div className="flex gap-2">
                        {/* Emoji Picker */}
                        <div className="relative" ref={emojiPickerRef}>
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="w-12 h-[42px] rounded-lg bg-[#f8f7f0] flex items-center justify-center text-xl hover:bg-[#eeeee0] transition-colors flex-shrink-0"
                            >
                                {selectedEmoji}
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

                        {/* Collection Name Input */}
                        <input
                            type="text"
                            placeholder="My chaotic thoughts..."
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-[#f8f7f0] border-none text-black placeholder-[#d0d0d0] text-sm focus:outline-none focus:ring-1 focus:ring-[#ffd700] h-[42px]"
                        />
                    </div>
                </div>

                {/* Add Tags */}
                <div className="mb-4 bg-white rounded-[14px] p-4 border border-[#f0f0f0]">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-black text-sm">Add Tags?</h3>
                            <p className="text-[11px] text-[#999]">For the obsessively organized.</p>
                        </div>
                        <button
                            onClick={() => setTagsEnabled(!tagsEnabled)}
                            className={`relative w-11 h-6 rounded-full transition-all ${tagsEnabled ? 'bg-[#ffd700]' : 'bg-[#e0e0e0]'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${tagsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {tagsEnabled && (
                        <div className="mt-3 pt-3 border-t border-[#f0f0f0]">
                            <div className="flex gap-2 mb-2.5 items-center">
                                <input
                                    type="text"
                                    placeholder="# new-tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                    className="flex-1 px-3 py-2 rounded-lg bg-[#f8f7f0] border-none text-sm placeholder-[#d0d0d0] focus:outline-none focus:ring-1 focus:ring-[#ffd700] h-[36px]"
                                />
                                <button
                                    onClick={handleAddTag}
                                    className="w-[36px] h-[36px] bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors flex-shrink-0"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ffd700] rounded-md text-[11px] font-medium text-black"
                                        >
                                            #{tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-red-600 transition-colors text-sm font-bold"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Lock It Up */}
                <div className="mb-5 bg-white rounded-[14px] p-4 border border-[#f0f0f0]">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-black text-sm">Lock It Up</h3>
                            <p className="text-[11px] text-[#999]">Keep your secrets safe.</p>
                        </div>
                        <button
                            onClick={() => setLockEnabled(!lockEnabled)}
                            className={`relative w-11 h-6 rounded-full transition-all ${lockEnabled ? 'bg-[#ffd700]' : 'bg-[#e0e0e0]'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${lockEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {lockEnabled && (
                        <div className="mt-3 pt-3 border-t border-[#f0f0f0] space-y-2.5">
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 rounded-lg bg-[#f8f7f0] border-none text-sm placeholder-[#d0d0d0] focus:outline-none focus:ring-1 focus:ring-[#ffd700]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-black transition-colors"
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
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 rounded-lg bg-[#f8f7f0] border-none text-sm placeholder-[#d0d0d0] focus:outline-none focus:ring-1 focus:ring-[#ffd700]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-black transition-colors"
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
                </div>

                {/* Create Button */}
                <button
                    onClick={handleCreateCollectionClick}
                    className="w-full py-3 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] text-black font-bold text-sm transition-all mb-3"
                >
                    Create Hoard
                </button>

                {/* Footer Text */}
                <div className="text-center">
                    <button onClick={onClose} className="text-xs text-[#666] hover:text-black transition-colors block w-full">
                        Nevermind, I'll stay disorganized
                    </button>
                </div>
            </div>
        </div>
    );
}
