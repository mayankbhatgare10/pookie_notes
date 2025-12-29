'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ColorPalettePickerProps {
    currentColor: string;
    onColorChange: (color: string) => void;
    presetColors: string[];
}

export default function ColorPalettePicker({ currentColor, onColorChange, presetColors }: ColorPalettePickerProps) {
    const [showPalette, setShowPalette] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Extended color palette
    const colorPalette = [
        // Reds
        '#FF0000', '#FF3333', '#FF6666', '#FF9999', '#CC0000', '#990000',
        // Oranges
        '#FF6600', '#FF8833', '#FFAA66', '#CC5200', '#994000',
        // Yellows
        '#FFD700', '#FFED4E', '#FFF176', '#FFE082', '#CCAA00',
        // Greens
        '#00AA00', '#33CC33', '#66FF66', '#99FF99', '#008800', '#006600',
        // Blues
        '#0000FF', '#3333FF', '#6666FF', '#9999FF', '#0000CC', '#000099',
        // Purples
        '#9B59B6', '#B07CC6', '#C69FD6', '#7D3C98', '#6C3483',
        // Pinks
        '#E91E63', '#F06292', '#F48FB1', '#C2185B', '#AD1457',
        // Browns
        '#795548', '#8D6E63', '#A1887F', '#5D4037', '#4E342E',
        // Grays
        '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    ];

    useEffect(() => {
        if (showPalette && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;

            const isMobile = window.innerWidth < 640;
            const paletteWidth = isMobile ? 280 : 320;
            const paletteHeight = 300;

            let top = rect.bottom + 8;
            let left = rect.left - 150;

            // Mobile: Center horizontally
            if (isMobile) {
                left = (window.innerWidth - paletteWidth) / 2;
            } else {
                // Desktop: Smart positioning
                // Check if palette fits on the right
                if (spaceRight < paletteWidth && spaceLeft > spaceRight) {
                    // Position to the left
                    left = rect.right - paletteWidth;
                } else if (left < 10) {
                    // Too close to left edge
                    left = 10;
                } else if (left + paletteWidth > window.innerWidth - 10) {
                    // Too close to right edge
                    left = window.innerWidth - paletteWidth - 10;
                }
            }

            // Check vertical space
            if (spaceBelow < paletteHeight && spaceAbove > spaceBelow) {
                // Show above if not enough space below
                top = rect.top - paletteHeight - 8;
            }

            // Ensure it doesn't go off-screen vertically
            if (top < 10) {
                top = 10;
            } else if (top + paletteHeight > window.innerHeight - 10) {
                top = window.innerHeight - paletteHeight - 10;
            }

            setPosition({ top, left });
        }
    }, [showPalette]);

    const isCustomColor = !presetColors.includes(currentColor) && !colorPalette.includes(currentColor);

    return (
        <>
            {/* Color Button */}
            <button
                ref={buttonRef}
                onClick={() => setShowPalette(!showPalette)}
                className={`relative w-6 h-6 rounded-full border-2 border-dashed border-black/30 flex items-center justify-center hover:scale-110 transition-all cursor-pointer shadow-sm tap-target ${isCustomColor ? 'ring-2 ring-[#ffd700] ring-offset-2 scale-110' : ''
                    }`}
                style={{
                    backgroundColor: isCustomColor ? currentColor : 'transparent'
                }}
                title="More colors"
            >
                {!isCustomColor && (
                    <svg className="w-3 h-3 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                )}
            </button>

            {/* Color Palette Popup */}
            {showPalette && typeof window !== 'undefined' && createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[999998]"
                        onClick={() => setShowPalette(false)}
                    />

                    {/* Palette */}
                    <div
                        className="fixed bg-white rounded-xl shadow-2xl border border-black/10 p-4 z-[999999] w-[280px] md:w-[320px]"
                        style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                        }}
                    >
                        <div className="text-xs font-semibold text-black/60 mb-3 uppercase tracking-wide">
                            Color Palette
                        </div>

                        {/* Color Grid */}
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            {colorPalette.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => {
                                        onColorChange(color);
                                        setShowPalette(false);
                                    }}
                                    className={`w-10 h-10 rounded-lg transition-all hover:scale-110 shadow-sm ${currentColor === color ? 'ring-2 ring-[#ffd700] ring-offset-2 scale-110' : ''
                                        }`}
                                    style={{
                                        backgroundColor: color,
                                        border: color === '#FFFFFF' ? '1px solid #e0e0e0' : 'none'
                                    }}
                                    title={color}
                                >
                                    {currentColor === color && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg
                                                className={`w-4 h-4 ${color === '#FFFFFF' || color === '#CCCCCC' ? 'text-black' : 'text-white'} drop-shadow-md`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Current Color Display */}
                        <div className="pt-3 border-t border-black/10">
                            <div className="text-xs text-black/60 mb-2">Current Color</div>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-lg shadow-sm border border-black/10"
                                    style={{ backgroundColor: currentColor }}
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-mono font-semibold text-black">
                                        {currentColor.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
}
