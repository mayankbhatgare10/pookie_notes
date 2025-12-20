
'use client';

import { useState, useRef, useEffect } from 'react';
import { SortIcon } from '@/components/icons';

interface SearchBarProps {
    activeTab: 'all' | 'archived';
    setActiveTab: (tab: 'all' | 'archived') => void;
}

export default function SearchBar({ activeTab, setActiveTab }: SearchBarProps) {
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                {/* Sort and Search - Full width on mobile, flex on desktop */}
                <div className="flex gap-2 md:gap-3 flex-1">
                    <div className="relative" ref={sortDropdownRef}>
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="px-3 md:px-4 py-2.5 md:py-3 bg-white border border-[#e0dfd5] rounded-full hover:bg-[#eae9dd] transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                            title="Sort"
                        >
                            <SortIcon className="w-4 h-4 text-[#a89968]" />
                            <span className="text-xs md:text-sm font-medium hidden sm:inline">Sort</span>
                        </button>
                        {showSortDropdown && (
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-[#e0dfd5]">
                                <div className="py-1">
                                    {['Date', 'Notes', 'Collections', 'Name'].map((item) => (
                                        <button key={item} className="w-full px-4 py-2 text-left text-sm hover:bg-[#f5f4e8] transition-colors">
                                            Sort by {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 relative">
                        <svg
                            className="w-4 h-4 absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-[#a89968]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search notes..."
                            className="w-full pl-10 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3 rounded-full bg-white border border-[#e0dfd5] text-sm placeholder-[#a89968] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-transparent shadow-sm"
                        />
                    </div>
                </div>

                {/* Tabs - Full width on mobile */}
                <div className="inline-flex bg-[#f5f4e8] rounded-full p-1.5 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'all' ? 'bg-white text-black shadow-sm' : 'text-[#666] hover:text-black'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('archived')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${activeTab === 'archived' ? 'bg-white text-black shadow-sm' : 'text-[#666] hover:text-black'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span className="hidden sm:inline">Archived</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
