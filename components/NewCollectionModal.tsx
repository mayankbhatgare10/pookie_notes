'use client';

import { useState } from 'react';

interface NewCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewCollectionModal({ isOpen, onClose }: NewCollectionModalProps) {
    const [collectionName, setCollectionName] = useState('');
    const [selectedVibe, setSelectedVibe] = useState('heart');
    const [tagsEnabled, setTagsEnabled] = useState(false);
    const [tags, setTags] = useState<string[]>(['aesthetic', 'ideas']);
    const [newTag, setNewTag] = useState('');

    const vibes = [
        { id: 'heart', icon: '❤️', bg: '#ffd700' },
        { id: 'skull', icon: '💀', bg: '#666' },
        { id: 'star', icon: '⭐', bg: '#ccc' },
        { id: 'save', icon: '💾', bg: '#ccc' },
        { id: 'coffee', icon: '☕', bg: '#ccc' },
    ];

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[28px] p-10 max-w-md w-full relative shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-black/60 hover:text-black transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Title */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-black mb-2">Start a Hoard</h2>
                    <p className="text-sm text-[#a89968]">Organize your mess, one pixel at a time.</p>
                </div>

                {/* Collection Name */}
                <div className="mb-7">
                    <label className="block text-[10px] font-bold text-[#a89968] uppercase tracking-widest mb-3">
                        Collection Name
                    </label>
                    <input
                        type="text"
                        placeholder="My chaotic thoughts..."
                        value={collectionName}
                        onChange={(e) => setCollectionName(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl bg-[#f8f7f0] border border-[#e5e4da] text-black placeholder-[#c0c0c0] text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-transparent transition-all"
                    />
                </div>

                {/* Pick a Vibe */}
                <div className="mb-7">
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-[10px] font-bold text-[#a89968] uppercase tracking-widest">
                            Pick a Vibe
                        </label>
                        <button className="text-[10px] text-[#a89968] hover:text-black transition-colors">
                            Scroll for more
                        </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {vibes.map((vibe) => (
                            <button
                                key={vibe.id}
                                onClick={() => setSelectedVibe(vibe.id)}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-[18px] flex items-center justify-center text-2xl transition-all ${selectedVibe === vibe.id ? 'ring-[3px] ring-black ring-offset-2' : 'hover:scale-105'
                                    }`}
                                style={{ backgroundColor: vibe.bg }}
                            >
                                {vibe.icon}
                                {selectedVibe === vibe.id && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Add Tags */}
                <div className="mb-6 bg-[#f8f7f0] rounded-[20px] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-black text-sm mb-0.5">Add Tags?</h3>
                            <p className="text-xs text-[#8b8b8b]">For the obsessively organized.</p>
                        </div>
                        <button
                            onClick={() => setTagsEnabled(!tagsEnabled)}
                            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${tagsEnabled ? 'bg-[#ffd700]' : 'bg-[#e5e4da]'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${tagsEnabled ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {tagsEnabled && (
                        <div className="mt-5 pt-5 border-t border-[#e5e4da]">
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="# new-tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-[#e5e4da] text-sm placeholder-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#ffd700] transition-all"
                                />
                                <button
                                    onClick={handleAddTag}
                                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                                >
                                    <span className="text-white text-xl font-light">+</span>
                                </button>
                            </div>

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffd700] rounded-full text-xs font-medium text-black"
                                        >
                                            #{tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-red-600 transition-colors ml-0.5"
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
                <div className="mb-8 bg-[#f8f7f0] rounded-[20px] p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-black text-sm mb-0.5">Lock It Up</h3>
                            <p className="text-xs text-[#8b8b8b]">Keep your secrets safe.</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#e5e4da] flex items-center justify-center text-xl">
                            🔓
                        </div>
                    </div>
                </div>

                {/* Create Button */}
                <button
                    onClick={onClose}
                    className="w-full py-4 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] text-black font-bold text-base transition-all mb-4"
                >
                    Create Hoard
                </button>

                {/* Footer Text */}
                <div className="text-center">
                    <button onClick={onClose} className="text-sm text-[#a89968] hover:text-black transition-colors mb-2">
                        Nevermind, I'll stay disorganized
                    </button>
                    <p className="text-[10px] text-[#c0c0c0] uppercase tracking-widest font-medium">
                        Don't forget this one like the others
                    </p>
                </div>
            </div>
        </div>
    );
}
