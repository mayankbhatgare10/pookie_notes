'use client';

import { HandwritingToolbarProps } from '@/types/handwriting';

const PRESET_COLORS = [
    '#000000', // Black
    '#FF0000', // Red
    '#0000FF', // Blue
    '#00AA00', // Green
    '#FF6B00', // Orange
    '#9B59B6', // Purple
];

export default function HandwritingToolbar({
    currentTool,
    currentColor,
    onToolChange,
    onColorChange,
    onUndo,
    onRedo,
    onClear,
    onDelete,
    canUndo,
    canRedo,
    readOnly = false,
}: HandwritingToolbarProps) {
    if (readOnly) return null;

    return (
        <div className="handwriting-toolbar flex items-center gap-2 p-2 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border-b-2 border-black/5 rounded-t-xl">
            {/* Tool Selection */}
            <div className="flex items-center gap-1 border-r border-black/10 pr-2">
                <button
                    onClick={() => onToolChange('pen')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${currentTool === 'pen'
                            ? 'bg-[#ffd700] text-black shadow-sm'
                            : 'bg-white/50 text-black/60 hover:bg-white'
                        }`}
                    title="Pen (P)"
                >
                    ✏️ Pen
                </button>
                <button
                    onClick={() => onToolChange('eraser')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${currentTool === 'eraser'
                            ? 'bg-[#ffd700] text-black shadow-sm'
                            : 'bg-white/50 text-black/60 hover:bg-white'
                        }`}
                    title="Eraser (E)"
                >
                    🧹 Eraser
                </button>
            </div>

            {/* Color Picker */}
            {currentTool === 'pen' && (
                <div className="flex items-center gap-1 border-r border-black/10 pr-2">
                    <span className="text-xs font-medium text-black/60 mr-1">Color:</span>
                    {PRESET_COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => onColorChange(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${currentColor === color
                                    ? 'border-[#ffd700] scale-110 shadow-md'
                                    : 'border-black/20 hover:scale-105'
                                }`}
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                    <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => onColorChange(e.target.value)}
                        className="w-6 h-6 rounded-full border-2 border-black/20 cursor-pointer"
                        title="Custom color"
                    />
                </div>
            )}

            {/* Undo/Redo */}
            <div className="flex items-center gap-1 border-r border-black/10 pr-2">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={`px-2 py-1.5 text-sm font-medium rounded-lg transition-all ${canUndo
                            ? 'bg-white/50 text-black/70 hover:bg-white'
                            : 'bg-white/20 text-black/30 cursor-not-allowed'
                        }`}
                    title="Undo (Ctrl+Z)"
                >
                    ↶
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className={`px-2 py-1.5 text-sm font-medium rounded-lg transition-all ${canRedo
                            ? 'bg-white/50 text-black/70 hover:bg-white'
                            : 'bg-white/20 text-black/30 cursor-not-allowed'
                        }`}
                    title="Redo (Ctrl+Y)"
                >
                    ↷
                </button>
            </div>

            {/* Clear */}
            <button
                onClick={onClear}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white/50 text-black/70 hover:bg-red-50 hover:text-red-600 transition-all"
                title="Clear all strokes"
            >
                🗑️ Clear
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Delete Block */}
            <button
                onClick={onDelete}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                title="Delete handwriting block"
            >
                ❌ Delete Block
            </button>
        </div>
    );
}
