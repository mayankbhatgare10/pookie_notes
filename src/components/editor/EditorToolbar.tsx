
'use client';

import { Editor } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface EditorToolbarProps {
    editor: Editor | null;
    fontFamily: string;
    setFontFamily: (val: string) => void;
    fontSize: string;
    setFontSize: (val: string) => void;
    isDrawing: boolean;
    setIsDrawing: (val: boolean) => void;
}

export default function EditorToolbar({
    editor, fontFamily, setFontFamily, fontSize, setFontSize, isDrawing, setIsDrawing
}: EditorToolbarProps) {
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [highlightButtonRef, setHighlightButtonRef] = useState<HTMLButtonElement | null>(null);
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
    const [showColorPicker, setShowColorPicker] = useState(false); // Unused in original logic shown but present in state

    const highlightColors = [
        { name: 'Yellow', value: '#fef08a' },
        { name: 'Green', value: '#bbf7d0' },
        { name: 'Blue', value: '#bfdbfe' },
        { name: 'Pink', value: '#fbcfe8' },
        { name: 'Orange', value: '#fed7aa' },
        { name: 'Purple', value: '#e9d5ff' },
    ];

    useEffect(() => {
        if (showHighlightPicker && highlightButtonRef) {
            const rect = highlightButtonRef.getBoundingClientRect();
            setPickerPosition({
                top: rect.bottom + 8,
                left: rect.left
            });
        }
    }, [showHighlightPicker, highlightButtonRef]);

    return (
        <div className="px-8 py-4 border-b-2 border-black/5 flex items-center gap-3 flex-wrap bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <select
                    value={fontFamily}
                    onChange={(e) => {
                        setFontFamily(e.target.value);
                        editor?.chain().focus().setFontFamily(e.target.value).run();
                    }}
                    className="px-4 py-2 bg-white border border-[#e0e0e0] rounded-lg text-sm font-medium focus:outline-none focus:border-[#ffd700] transition-colors cursor-pointer"
                >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Comic Sans MS">Comic Sans</option>
                </select>

                <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="px-4 py-2 bg-white border border-[#e0e0e0] rounded-lg text-sm font-medium focus:outline-none focus:border-[#ffd700] transition-colors cursor-pointer"
                >
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                    <option value="20">20px</option>
                    <option value="24">24px</option>
                </select>
            </div>

            <div className="h-8 w-px bg-black/10"></div>

            <div className="flex items-center gap-1">
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor?.chain().focus().toggleBold().run();
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${editor?.isActive('bold') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                >
                    <span className="font-bold text-sm">B</span>
                </button>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor?.chain().focus().toggleItalic().run();
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${editor?.isActive('italic') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                >
                    <span className="italic text-sm">I</span>
                </button>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor?.chain().focus().toggleUnderline().run();
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${editor?.isActive('underline') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                >
                    <span className="underline text-sm">U</span>
                </button>
            </div>

            <div className="h-8 w-px bg-black/10"></div>

            {/* Highlight Color */}
            <div className="relative">
                <button
                    ref={setHighlightButtonRef}
                    onClick={() => {
                        setShowHighlightPicker(!showHighlightPicker);
                    }}
                    className="p-2 rounded-lg hover:bg-black/5 transition-colors flex items-center gap-1.5"
                    title="Highlight"
                >
                    <div className="w-5 h-5 flex items-center justify-center">
                        <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to bottom, #fef08a 0%, #fef08a 50%, transparent 50%)' }}>
                            <span className="text-[10px] font-bold">A</span>
                        </div>
                    </div>
                </button>
                {showHighlightPicker && typeof window !== 'undefined' && createPortal(
                    <>
                        <div
                            className="fixed inset-0 z-[999998]"
                            onClick={() => setShowHighlightPicker(false)}
                        />
                        <div
                            className="fixed bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-black/10 p-4 z-[999999]"
                            style={{
                                top: `${pickerPosition.top}px`,
                                left: `${pickerPosition.left}px`,
                                minWidth: '160px'
                            }}
                        >
                            <div className="text-[11px] font-semibold text-black/60 mb-3 uppercase tracking-wide">Highlight</div>
                            <div className="grid grid-cols-3 gap-2">
                                {highlightColors.map((color) => (
                                    <button
                                        key={color.value}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            editor?.chain().focus().toggleHighlight({ color: color.value }).run();
                                            setShowHighlightPicker(false);
                                        }}
                                        className="group flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-black/5 transition-all cursor-pointer"
                                        title={color.name}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-md border border-black/10 group-hover:border-black/30 group-hover:scale-105 transition-all"
                                            style={{ backgroundColor: color.value }}
                                        />
                                        <span className="text-[9px] font-medium text-black/50 group-hover:text-black/70">{color.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>,
                    document.body
                )}
            </div>

            <div className="h-8 w-px bg-black/10"></div>

            <div className="flex items-center gap-1">
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor?.chain().focus().toggleBulletList().run();
                    }}
                    className={`p-2 rounded-lg transition-colors ${editor?.isActive('bulletList') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor?.chain().focus().toggleOrderedList().run();
                    }}
                    className={`p-2 rounded-lg transition-colors ${editor?.isActive('orderedList') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                >
                    <span className="text-sm font-bold">1.</span>
                </button>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor?.chain().focus().toggleTaskList().run();
                    }}
                    className={`p-2 rounded-lg transition-colors ${editor?.isActive('taskList') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </button>
            </div>

            <div className="h-8 w-px bg-black/10"></div>

            <button
                onClick={() => setIsDrawing(!isDrawing)}
                className={`p-2 rounded-lg transition-colors ${isDrawing ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                title="Handwriting"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>
        </div>
    );
}
