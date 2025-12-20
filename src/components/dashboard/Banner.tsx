
'use client';

import { useState, useEffect } from 'react';
import { MEMES } from '@/utils/constants';

export default function Banner({ onClose }: { onClose: () => void }) {
    const [currentMemeIndex, setCurrentMemeIndex] = useState(0);

    // Rotate memes every 5 seconds
    useEffect(() => {
        const memeTimer = setInterval(() => {
            setCurrentMemeIndex((prev) => (prev + 1) % MEMES.length);
        }, 5000);
        return () => clearInterval(memeTimer);
    }, []);

    return (
        <div className="bg-[#ffd700] border-2 border-dashed border-black rounded-[20px] px-6 py-4 mb-8 flex items-center gap-3 shadow-sm relative">
            <span className="text-3xl font-bold text-black leading-none">"</span>
            <span className="font-semibold text-black text-sm transition-opacity duration-500 flex-1">
                {MEMES[currentMemeIndex]}
            </span>
            <button
                onClick={onClose}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-colors"
                title="Close"
            >
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
