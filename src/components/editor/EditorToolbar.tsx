
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
    // Ink mode props
    isInkMode: boolean;
    inkTool: 'pen' | 'pencil' | 'brush' | 'highlighter' | 'eraser';
    inkColor: string;
    inkStrokeSize: number;
    onToggleInkMode: () => void;
    onInkToolChange: (tool: 'pen' | 'pencil' | 'brush' | 'highlighter' | 'eraser') => void;
    onInkColorChange: (color: string) => void;
    onInkStrokeSizeChange: (size: number) => void;
    onInkUndo: () => void;
    onInkRedo: () => void;
    onInkClear: () => void;
    canInkUndo: boolean;
    canInkRedo: boolean;
}

export default function EditorToolbar({
    editor, fontFamily, setFontFamily, fontSize, setFontSize,
    isInkMode, inkTool, inkColor, inkStrokeSize, onToggleInkMode, onInkToolChange,
    onInkColorChange, onInkStrokeSizeChange, onInkUndo, onInkRedo, onInkClear, canInkUndo, canInkRedo
}: EditorToolbarProps) {
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [highlightButtonRef, setHighlightButtonRef] = useState<HTMLButtonElement | null>(null);
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

    const highlightColors = [
        { name: 'Yellow', value: '#fef08a' },
        { name: 'Green', value: '#bbf7d0' },
        { name: 'Blue', value: '#bfdbfe' },
        { name: 'Pink', value: '#fbcfe8' },
        { name: 'Orange', value: '#fed7aa' },
        { name: 'Purple', value: '#e9d5ff' },
    ];

    const presetInkColors = ['#000000', '#FF0000', '#0000FF', '#00AA00', '#FF6B00', '#9B59B6', '#FFD700', '#E91E63'];
    const strokeSizes = [1, 2, 4, 6, 8, 12];

    useEffect(() => {
        if (showHighlightPicker && highlightButtonRef) {
            const rect = highlightButtonRef.getBoundingClientRect();
            setPickerPosition({
                top: rect.bottom + 8,
                left: rect.left
            });
        }
    }, [showHighlightPicker, highlightButtonRef]);

    // Tool display names
    const toolNames = {
        pen: 'Pen',
        pencil: 'Pencil',
        brush: 'Brush',
        highlighter: 'Highlighter',
        eraser: 'Eraser'
    };

    return (
        <div className="border-b-2 border-black/5 bg-white/70 backdrop-blur-sm">
            <div className="px-3 md:px-6 lg:px-8 py-2 md:py-3 flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-wrap">
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

                <div className="h-8 w-px bg-black/10" />

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

                <div className="h-8 w-px bg-black/10" />

                {/* Highlight Color */}
                <div className="relative">
                    <button
                        ref={setHighlightButtonRef}
                        onClick={() => setShowHighlightPicker(!showHighlightPicker)}
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

                <div className="h-8 w-px bg-black/10" />

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

                <div className="h-8 w-px bg-black/10" />

                {/* Ink Mode Toggle - Yellow Square with Pen */}
                <button
                    onClick={onToggleInkMode}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all tap-target ${isInkMode
                            ? 'bg-[#ffd700] shadow-lg scale-105'
                            : 'bg-[#ffd700]/20 hover:bg-[#ffd700]/40'
                        }`}
                    title="Handwriting Mode (I)"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z" />
                    </svg>
                </button>

                {/* Ink Tools - Only show when ink mode is active */}
                {isInkMode && (
                    <>
                        <div className="h-8 w-px bg-black/10" />

                        {/* Brush Type Dropdown */}
                        <select
                            value={inkTool}
                            onChange={(e) => onInkToolChange(e.target.value as any)}
                            className="px-4 py-2 bg-white border border-[#e0e0e0] rounded-lg text-sm font-medium focus:outline-none focus:border-[#ffd700] transition-colors cursor-pointer"
                        >
                            <option value="pen">✏️ Pen</option>
                            <option value="pencil">✎ Pencil</option>
                            <option value="brush">🖌️ Brush</option>
                            <option value="highlighter">🖍️ Highlighter</option>
                            <option value="eraser">🧹 Eraser</option>
                        </select>

                        {/* Stroke Size - Only for non-eraser tools */}
                        {inkTool !== 'eraser' && (
                            <>
                                <div className="h-8 w-px bg-black/10" />
                                <div className="flex items-center gap-1">
                                    {strokeSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => onInkStrokeSizeChange(size)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${inkStrokeSize === size ? 'bg-[#ffd700]' : 'hover:bg-black/5'
                                                }`}
                                            title={`${size}px`}
                                        >
                                            <div
                                                className="rounded-full bg-black"
                                                style={{ width: `${size + 2}px`, height: `${size + 2}px` }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Color Picker - Only for non-eraser tools */}
                        {inkTool !== 'eraser' && (
                            <>
                                <div className="h-8 w-px bg-black/10" />
                                <div className="flex items-center gap-1.5">
                                    {presetInkColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => onInkColorChange(color)}
                                            className={`relative w-6 h-6 rounded-full transition-all hover:scale-110 shadow-sm ${inkColor === color ? 'ring-2 ring-[#ffd700] ring-offset-2 scale-110' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        >
                                            {inkColor === color && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                    {/* Custom Color Picker */}
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={inkColor}
                                            onChange={(e) => onInkColorChange(e.target.value)}
                                            className="w-6 h-6 rounded-full cursor-pointer opacity-0 absolute inset-0"
                                            title="Custom color"
                                        />
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 border-dashed border-black/30 flex items-center justify-center hover:scale-110 transition-all cursor-pointer shadow-sm ${!presetInkColors.includes(inkColor) ? 'ring-2 ring-[#ffd700] ring-offset-2 scale-110' : ''
                                                }`}
                                            style={{
                                                backgroundColor: !presetInkColors.includes(inkColor) ? inkColor : 'transparent'
                                            }}
                                        >
                                            {presetInkColors.includes(inkColor) && (
                                                <svg className="w-3 h-3 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="h-8 w-px bg-black/10" />

                        {/* Undo */}
                        <button
                            onClick={onInkUndo}
                            disabled={!canInkUndo}
                            className={`p-2 rounded-lg transition-colors ${canInkUndo ? 'hover:bg-black/5' : 'opacity-30 cursor-not-allowed'}`}
                            title="Undo (Ctrl+Z)"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </button>

                        {/* Redo */}
                        <button
                            onClick={onInkRedo}
                            disabled={!canInkRedo}
                            className={`p-2 rounded-lg transition-colors ${canInkRedo ? 'hover:bg-black/5' : 'opacity-30 cursor-not-allowed'}`}
                            title="Redo (Ctrl+Y)"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                            </svg>
                        </button>

                        {/* Clear - Trash can icon */}
                        <button
                            onClick={onInkClear}
                            className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Clear all ink"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
