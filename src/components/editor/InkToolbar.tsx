'use client';

interface InkToolbarProps {
    isInkMode: boolean;
    currentTool: 'pen' | 'eraser';
    currentColor: string;
    onToggleInkMode: () => void;
    onToolChange: (tool: 'pen' | 'eraser') => void;
    onColorChange: (color: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const PRESET_COLORS = [
    '#000000', // Black
    '#FF0000', // Red
    '#0000FF', // Blue
    '#00AA00', // Green
    '#FF6B00', // Orange
    '#9B59B6', // Purple
    '#FFD700', // Gold
    '#E91E63', // Pink
];

export default function InkToolbar({
    isInkMode,
    currentTool,
    currentColor,
    onToggleInkMode,
    onToolChange,
    onColorChange,
    onUndo,
    onRedo,
    onClear,
    canUndo,
    canRedo,
}: InkToolbarProps) {
    return (
        <div className="px-8 py-4 border-b-2 border-black/5 flex items-center gap-3 flex-wrap bg-white/70 backdrop-blur-sm">
            {/* Text Formatting Tools */}
            <div className="flex items-center gap-2">
                {/* ... other toolbar buttons will be here from EditorToolbar ... */}
            </div>

            <div className="h-8 w-px bg-black/10" />

            {/* Ink Mode Toggle - Small Icon */}
            <button
                onClick={onToggleInkMode}
                className={`p-2 rounded-lg transition-colors ${isInkMode ? 'bg-[#ffd700]' : 'hover:bg-black/5'
                    }`}
                title="Handwriting Mode (I)"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>

            {/* Ink Tools - Only show when ink mode is active */}
            {isInkMode && (
                <>
                    <div className="h-8 w-px bg-black/10" />

                    {/* Pen Tool */}
                    <button
                        onClick={() => onToolChange('pen')}
                        className={`p-2 rounded-lg transition-colors ${currentTool === 'pen' ? 'bg-[#ffd700]' : 'hover:bg-black/5'
                            }`}
                        title="Pen (P)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>

                    {/* Eraser Tool */}
                    <button
                        onClick={() => onToolChange('eraser')}
                        className={`p-2 rounded-lg transition-colors ${currentTool === 'eraser' ? 'bg-[#ffd700]' : 'hover:bg-black/5'
                            }`}
                        title="Eraser (E)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>

                    {/* Color Picker - Only for pen */}
                    {currentTool === 'pen' && (
                        <>
                            <div className="h-8 w-px bg-black/10" />
                            <div className="flex items-center gap-1.5">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => onColorChange(color)}
                                        className={`relative w-6 h-6 rounded-full transition-all hover:scale-110 ${currentColor === color ? 'ring-2 ring-[#ffd700] ring-offset-2' : ''
                                            }`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    >
                                        {currentColor === color && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                                <input
                                    type="color"
                                    value={currentColor}
                                    onChange={(e) => onColorChange(e.target.value)}
                                    className="w-6 h-6 rounded-full cursor-pointer"
                                    style={{
                                        WebkitAppearance: 'none',
                                        border: 'none',
                                        background: 'transparent',
                                    }}
                                    title="Custom color"
                                />
                            </div>
                        </>
                    )}

                    <div className="h-8 w-px bg-black/10" />

                    {/* Undo */}
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`p-2 rounded-lg transition-colors ${canUndo ? 'hover:bg-black/5' : 'opacity-30 cursor-not-allowed'
                            }`}
                        title="Undo (Ctrl+Z)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>

                    {/* Redo */}
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className={`p-2 rounded-lg transition-colors ${canRedo ? 'hover:bg-black/5' : 'opacity-30 cursor-not-allowed'
                            }`}
                        title="Redo (Ctrl+Y)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                        </svg>
                    </button>

                    {/* Clear */}
                    <button
                        onClick={onClear}
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
    );
}
