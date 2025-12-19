'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NewCollectionModal from './NewCollectionModal';
import SettingsModal from './SettingsModal';
import CollectionsGrid from './CollectionsGrid';
import NewNoteModal from './NewNoteModal';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';

// Icon Components
const FlameIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C11.36 3.42 9.56 5.33 9.56 7.78C9.56 8.45 9.69 9.09 9.92 9.68C10.06 10.04 10.29 10.36 10.51 10.66C10.87 11.14 11.22 11.62 11.44 12.18C11.79 13.14 11.68 14.19 11.33 15.09C10.73 16.73 9.5 18.07 8.16 19.12C7.3 19.78 6.67 20.7 6.67 21.75C6.67 23.13 7.76 24.25 9.13 24.25C10.03 24.25 10.87 23.76 11.4 23C11.97 22.19 12.32 21.25 12.32 20.25C12.32 18.98 11.82 17.82 11.02 16.92C11.5 16.78 11.95 16.58 12.35 16.3C13.8 15.43 14.67 13.87 14.67 12.14C14.67 11.81 14.63 11.49 14.57 11.18C15.48 11.08 16.39 11.24 17.18 11.63C17.78 11.91 18.31 12.3 18.72 12.78C19.18 13.32 19.46 13.98 19.5 14.68C19.58 16.25 18.66 17.64 17.28 18.36C17.78 18.72 18.35 19 18.97 19.18C20.14 19.55 21.33 19.55 22.5 19.18C22.89 19.07 23.26 18.93 23.61 18.75C24.04 18.53 24.33 18.09 24.33 17.61C24.33 16.99 23.96 16.46 23.41 16.27C22.68 16 21.97 15.65 21.33 15.18C19.67 14.07 18.67 12.25 17.66 11.2Z" />
    </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
    </svg>
);

const EnvelopeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const BrainIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const CodeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const RocketIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const CartIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const TreeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const HeartIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const StarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const FolderIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

const AirplaneIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const LightbulbIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const MusicIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
);

const UtensilsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
);

const PlusIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
    </svg>
);

const CatIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9c0-2.76 2.24-5 5-5z" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
        <path d="M12 13c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1z" />
    </svg>
);

// 9-Dot Grid Icon (Candy Box) - More Visible
const GridDotsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <circle cx="5" cy="5" r="2" />
        <circle cx="12" cy="5" r="2" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="12" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
    </svg>
);

// Sort Icon
const SortIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
);

// Settings Icon
const SettingsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// Logout Icon
const LogoutIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

// User Icon
const UserIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export default function Dashboard() {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showCollectionsGrid, setShowCollectionsGrid] = useState(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
    const [showNewNoteModal, setShowNewNoteModal] = useState(false);
    const [showNoteEditor, setShowNoteEditor] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');
    const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
    const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
    const [showBanner, setShowBanner] = useState(true);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // Motivational Quotes with Authors
    const thoughts = [
        { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
        { quote: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.", author: "Roy T. Bennett" },
        { quote: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
        { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
        { quote: "In this life we cannot do great things. We can only do small things with great love.", author: "Mother Teresa" }
    ];

    // Rotating Memes for Banner
    const memes = [
        "Oh look, you're actually working. Weird.",
        "Kal se pakka productivity mode on.",
        "Main kaam avoid nahi karta, mentally prepare ho raha hoon.",
        "Overthinking free hai, isliye zyada use karta hoon.",
        "Procrastination koi aadat nahi, lifestyle hai bro.",
        "Zindagi sorted hai, bas sab kuch alag jagah pada hai."
    ];

    // Sample Notes Data
    const [notes, setNotes] = useState([
        { id: '1', title: 'World Domination Plans', emoji: '🚀', color: '#d4e8ff', lastEdited: 'Updated 2h ago', isStarred: true, isArchived: false, collectionId: '1', isPrivate: false },
        { id: '2', title: 'Grocery List', emoji: '🛒', color: '#ffe8d4', lastEdited: 'Updated 5h ago', isStarred: false, isArchived: false, collectionId: null, isPrivate: false },
        { id: '3', title: 'Movie Ideas', emoji: '🎬', color: '#e8d4ff', lastEdited: 'Updated 1d ago', isStarred: true, isArchived: false, collectionId: '1', isPrivate: false },
        { id: '4', title: 'Workout Routine', emoji: '💪', color: '#d4ffe8', lastEdited: 'Updated 3d ago', isStarred: false, isArchived: false, collectionId: '2', isPrivate: false },
    ]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Rotate memes every 5 seconds
    useEffect(() => {
        const memeTimer = setInterval(() => {
            setCurrentMemeIndex((prev) => (prev + 1) % memes.length);
        }, 5000);
        return () => clearInterval(memeTimer);
    }, [memes.length]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;

        // Get day and date
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const dateNum = date.getDate();

        return {
            time: `${displayHours}:${minutes.toString().padStart(2, '0')}`,
            period: ampm,
            dayDate: `${dayName}, ${monthName} ${dateNum}`
        };
    };

    const { time, period, dayDate } = formatTime(currentTime);

    return (
        <div className="min-h-screen bg-[#f5f4e8] flex">
            {/* Left Sidebar */}
            <div className="w-[280px] bg-[#f5f4e8] px-8 py-8 flex flex-col">
                {/* Clock - White Rectangular Box */}
                <div className="bg-white rounded-[20px] px-6 py-6 mb-6 text-center shadow-sm">
                    <div className="mb-2 flex items-end justify-center gap-1.5">
                        <span className="text-[52px] font-bold leading-none tracking-tight text-black">
                            {time}
                        </span>
                        <span className="text-[16px] font-bold text-[#d4a574] mb-2">
                            {period}
                        </span>
                    </div>
                    <div className="inline-block bg-[#fff4e6] rounded-lg px-4 py-1.5">
                        <span className="text-[10px] text-[#d4a574] tracking-wide font-semibold">
                            {dayDate}
                        </span>
                    </div>
                </div>

                {/* Quote of the Day */}
                <div className="mb-6 bg-[#e8e4d4] rounded-[20px] px-6 py-6">
                    <h2 className="text-[13px] font-bold leading-tight mb-3 text-black uppercase tracking-wide">
                        Quote of the Day
                    </h2>
                    <p className="text-[12px] text-black leading-relaxed mb-2">
                        "{thoughts[0].quote}"
                    </p>
                    <p className="text-[11px] text-[#666] font-medium text-right">
                        — {thoughts[0].author}
                    </p>
                </div>

                {/* Streak - White Rectangular Box with Full Calendar */}
                <div className="bg-white rounded-[20px] px-6 py-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[15px] font-bold text-black">Streak</h3>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fff4e6] rounded-full">
                            <FlameIcon className="w-3 h-3 text-orange-500" />
                            <span className="text-[10px] font-semibold text-black">5 Days (Barely)</span>
                        </div>
                    </div>

                    {/* Month Name */}
                    <div className="text-center mb-3">
                        <span className="text-[11px] font-bold text-[#666] uppercase tracking-wide">
                            {currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>

                    {/* Calendar Grid - Full Month */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {/* Day Headers */}
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-[9px] text-[#999] font-semibold pb-1">
                                {day}
                            </div>
                        ))}

                        {/* Calendar Days */}
                        {(() => {
                            const today = currentTime.getDate();
                            const firstDay = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1).getDay();
                            const daysInMonth = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).getDate();
                            const daysInPrevMonth = new Date(currentTime.getFullYear(), currentTime.getMonth(), 0).getDate();

                            const days = [];

                            // Previous month days
                            for (let i = firstDay - 1; i >= 0; i--) {
                                days.push(
                                    <div key={`prev-${i}`} className="aspect-square rounded-full flex items-center justify-center text-[11px] text-[#ccc] font-medium">
                                        {daysInPrevMonth - i}
                                    </div>
                                );
                            }

                            // Current month days
                            for (let day = 1; day <= daysInMonth; day++) {
                                if (day === today) {
                                    days.push(
                                        <div key={day} className="aspect-square rounded-full bg-[#ffd700] border border-black flex items-center justify-center text-[11px] font-bold text-black shadow-[1px_1px_0px_#000]">
                                            {day}
                                        </div>
                                    );
                                } else {
                                    days.push(
                                        <div key={day} className="aspect-square rounded-full flex items-center justify-center text-[11px] text-black font-semibold">
                                            {day}
                                        </div>
                                    );
                                }
                            }

                            // Next month days to fill the grid
                            const remainingDays = 42 - days.length; // 6 rows × 7 days
                            for (let day = 1; day <= remainingDays; day++) {
                                days.push(
                                    <div key={`next-${day}`} className="aspect-square rounded-full flex items-center justify-center text-[11px] text-[#ccc] font-medium">
                                        {day}
                                    </div>
                                );
                            }

                            return days;
                        })()}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header - No Border */}
                <header className="bg-[#f5f4e8] px-10 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG"
                            alt="Pookie Notes"
                            width={28}
                            height={28}
                            className="object-contain"
                            unoptimized
                        />
                        <span className="text-[17px] font-bold">Pookie Notes</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowCollectionsGrid(!showCollectionsGrid)}
                            className="p-2.5 hover:bg-[#eae9dd] rounded-lg transition-colors"
                            title="Collections"
                        >
                            <GridDotsIcon className="w-5 h-5" />
                        </button>

                        {/* Profile with Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="relative focus:outline-none"
                            >
                                <div className="w-9 h-9 rounded-full border-2 border-black overflow-hidden shadow-sm hover:scale-105 transition-transform bg-white">
                                    <Image
                                        src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG"
                                        alt="Profile"
                                        width={36}
                                        height={36}
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            </button>

                            {showProfileDropdown && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg z-50 border border-[#e0e0e0]">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white flex-shrink-0">
                                            <Image
                                                src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG"
                                                alt="Profile"
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-black truncate">Mayank Bhatgare</p>
                                            <p className="text-xs text-[#666] mt-0.5 truncate">mayank@pookienotes.com</p>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setShowSettingsModal(true);
                                                setShowProfileDropdown(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#f5f4e8] transition-colors flex items-center gap-3"
                                        >
                                            <SettingsIcon className="w-4 h-4 text-[#666]" />
                                            <span className="text-black">Settings</span>
                                        </button>
                                        <button
                                            onClick={() => router.push('/login')}
                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#ffe8e8] transition-colors flex items-center gap-3 text-red-600"
                                        >
                                            <LogoutIcon className="w-4 h-4" />
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#f5f4e8]">
                    {/* Collection Title Banner */}
                    {selectedCollectionId && (
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                                <span className="text-4xl">
                                    {(() => {
                                        const collections = [
                                            { id: '1', name: 'Movies', emoji: '🎬' },
                                            { id: '2', name: 'Work', emoji: '💼' },
                                            { id: '3', name: 'Personal', emoji: '🏠' },
                                            { id: '4', name: 'Ideas', emoji: '💡' },
                                            { id: '5', name: 'Travel', emoji: '✈️' },
                                            { id: '6', name: 'Books', emoji: '📚' },
                                            { id: '7', name: 'Music', emoji: '🎵' },
                                            { id: '8', name: 'Recipes', emoji: '🍳' },
                                            { id: '9', name: 'Fitness', emoji: '💪' },
                                            { id: '10', name: 'Projects', emoji: '🚀' },
                                        ];
                                        const collection = collections.find(c => c.id === selectedCollectionId);
                                        return collection?.emoji || '📝';
                                    })()}
                                </span>
                                <span>
                                    {(() => {
                                        const collections = [
                                            { id: '1', name: 'Movies', emoji: '🎬' },
                                            { id: '2', name: 'Work', emoji: '💼' },
                                            { id: '3', name: 'Personal', emoji: '🏠' },
                                            { id: '4', name: 'Ideas', emoji: '💡' },
                                            { id: '5', name: 'Travel', emoji: '✈️' },
                                            { id: '6', name: 'Books', emoji: '📚' },
                                            { id: '7', name: 'Music', emoji: '🎵' },
                                            { id: '8', name: 'Recipes', emoji: '🍳' },
                                            { id: '9', name: 'Fitness', emoji: '💪' },
                                            { id: '10', name: 'Projects', emoji: '🚀' },
                                        ];
                                        const collection = collections.find(c => c.id === selectedCollectionId);
                                        return collection?.name || 'Collection';
                                    })()}
                                </span>
                            </h1>
                        </div>
                    )}

                    {/* Banner with Rotating Memes */}
                    {showBanner && (
                        <div className="bg-[#ffd700] border-2 border-dashed border-black rounded-[20px] px-6 py-4 mb-8 flex items-center gap-3 shadow-sm relative">
                            <span className="text-3xl font-bold text-black leading-none">"</span>
                            <span className="font-semibold text-black text-sm transition-opacity duration-500 flex-1">
                                {memes[currentMemeIndex]}
                            </span>
                            <button
                                onClick={() => setShowBanner(false)}
                                className="flex-shrink-0 w-6 h-6 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-colors"
                                title="Close"
                            >
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Search Bar with Sort and Tabs */}
                    <div className="mb-6">
                        <div className="flex gap-3 items-center">
                            <div className="relative" ref={sortDropdownRef}>
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="px-4 py-3 bg-white border border-[#e0dfd5] rounded-full hover:bg-[#eae9dd] transition-colors flex items-center gap-2 shadow-sm"
                                    title="Sort"
                                >
                                    <SortIcon className="w-4 h-4 text-[#a89968]" />
                                    <span className="text-sm font-medium">Sort</span>
                                </button>
                                {showSortDropdown && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                                        <div className="py-1">
                                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-[#f5f4e8] transition-colors">
                                                Sort by Date
                                            </button>
                                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-[#f5f4e8] transition-colors">
                                                Sort by Notes
                                            </button>
                                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-[#f5f4e8] transition-colors">
                                                Sort by Collections
                                            </button>
                                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-[#f5f4e8] transition-colors">
                                                Sort by Name
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 relative">
                                <svg
                                    className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a89968]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search notes, collections..."
                                    className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#e0dfd5] text-sm placeholder-[#a89968] focus:outline-none focus:ring-2 focus:ring-[#ffd700] focus:border-transparent shadow-sm"
                                />
                            </div>
                            {/* All / Archived Tabs - Next to Search */}
                            <div className="inline-flex bg-[#f5f4e8] rounded-full p-1.5">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${activeTab === 'all'
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-[#666] hover:text-black'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveTab('archived')}
                                    className={`px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-1.5 ${activeTab === 'archived'
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-[#666] hover:text-black'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Archived
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === 'all' ? (
                        <>
                            {/* Notes Section - Simple when collection selected */}
                            {selectedCollectionId ? (
                                /* Collection Notes - No categorization */
                                <div className="mb-10">
                                    <div className="grid grid-cols-4 gap-5">
                                        {/* New Note Card */}
                                        <button
                                            onClick={() => setShowNewNoteModal(true)}
                                            className="bg-[#fffacd] border-2 border-dashed border-black rounded-[24px] p-8 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                                        >
                                            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mb-4">
                                                <PlusIcon className="w-8 h-8 text-[#fffacd]" />
                                            </div>
                                            <h3 className="font-bold text-black text-base mb-1">New Note!</h3>
                                            <p className="text-xs text-black/80">Add to this collection.</p>
                                        </button>

                                        {/* Collection Notes */}
                                        {notes
                                            .filter(note => !note.isArchived && note.collectionId === selectedCollectionId)
                                            .map((note) => (
                                                <NoteCard
                                                    key={note.id}
                                                    id={note.id}
                                                    title={note.title}
                                                    emoji={note.emoji}
                                                    color={note.color}
                                                    lastEdited={note.lastEdited}
                                                    isStarred={note.isStarred}
                                                    onEdit={() => {
                                                        setEditingNoteId(note.id);
                                                        setShowNewNoteModal(true);
                                                    }}
                                                    onStar={() => {
                                                        setNotes(notes.map(n =>
                                                            n.id === note.id ? { ...n, isStarred: !n.isStarred } : n
                                                        ));
                                                    }}
                                                    onArchive={() => {
                                                        setNotes(notes.map(n =>
                                                            n.id === note.id ? { ...n, isArchived: true } : n
                                                        ));
                                                    }}
                                                    onDelete={() => {
                                                        setNotes(notes.filter(n => n.id !== note.id));
                                                    }}
                                                    onClick={() => setShowNoteEditor(true)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            ) : (
                                /* All Notes - With categorization */
                                <>
                                    {/* Recent Notes */}
                                    <div className="mb-10">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2.5">
                                                <ClockIcon className="w-5 h-5 text-[#a89968]" />
                                                <h2 className="text-lg font-bold">
                                                    {selectedCollectionId
                                                        ? (() => {
                                                            const collections = [
                                                                { id: '1', name: 'Movies', emoji: '🎬' },
                                                                { id: '2', name: 'Work', emoji: '💼' },
                                                                { id: '3', name: 'Personal', emoji: '🏠' },
                                                                { id: '4', name: 'Ideas', emoji: '💡' },
                                                                { id: '5', name: 'Travel', emoji: '✈️' },
                                                            ];
                                                            const collection = collections.find(c => c.id === selectedCollectionId);
                                                            return collection ? `${collection.emoji} ${collection.name}` : 'Recent Notes';
                                                        })()
                                                        : 'Recent Notes'
                                                    }
                                                </h2>
                                            </div>
                                            <button className="text-sm text-[#a89968] hover:text-black transition-colors">
                                                View All
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-4 gap-5">
                                            {/* New Note Card - Lighter with Dotted Border */}
                                            <button
                                                onClick={() => setShowNewNoteModal(true)}
                                                className="bg-[#fffacd] border-2 border-dashed border-black rounded-[24px] p-8 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                                            >
                                                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mb-4">
                                                    <PlusIcon className="w-8 h-8 text-[#fffacd]" />
                                                </div>
                                                <h3 className="font-bold text-black text-base mb-1">New Note!</h3>
                                                <p className="text-xs text-black/80">Unleash your inner chaos.</p>
                                            </button>

                                            {/* Sample Cards */}
                                            {[
                                                {
                                                    Icon: EnvelopeIcon,
                                                    bg: '#e8d4ff',
                                                    iconColor: '#9b59d6',
                                                    title: 'Meeting notes that could have been an email',
                                                    desc: 'Discussed Q3 goals which are basically just "survive". Also, apparently Brenda needs to stop bringing tuna casserole...',
                                                    time: 'Updated 14:00 PM',
                                                    tag: 'Work',
                                                    tagColor: '#9b59d6',
                                                },
                                                {
                                                    Icon: BrainIcon,
                                                    bg: '#ffd4e5',
                                                    iconColor: '#ff6b9d',
                                                    title: 'Therapy Journaling',
                                                    desc: 'Why do I procrastinate until the panic monster arrives? Is it a coping mechanism? Or just pure laziness? Th...',
                                                    time: 'Updated Yesterday',
                                                    tag: 'Self-Care',
                                                    tagColor: '#ff6b9d',
                                                },
                                                {
                                                    Icon: CodeIcon,
                                                    bg: '#d4e8ff',
                                                    iconColor: '#4a90e2',
                                                    title: 'CSS Hacks that shouldn\'t work',
                                                    desc: 'Using !important on everything is a lifestyle choice. Also, remember that time I used floats for layout? The horro...',
                                                    time: 'Updated Oct 28',
                                                    tag: 'Code',
                                                    tagColor: '#4a90e2',
                                                },
                                            ].map((card, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white rounded-[24px] p-6 border border-[#f0f0f0] cursor-pointer shadow-[0_10px_28px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-shadow"
                                                >
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: card.bg }}
                                                    >
                                                        <card.Icon className="w-6 h-6" style={{ color: card.iconColor }} />
                                                    </div>
                                                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-snug">
                                                        {card.title}
                                                    </h3>
                                                    <p className="text-xs text-[#8b8b8b] mb-4 line-clamp-3 leading-relaxed">
                                                        {card.desc}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-[#a89968]">{card.time}</span>
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${card.tagColor}20`, color: card.tagColor }}>
                                                            {card.tag}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Starred Notes */}
                                    <div className="mb-10">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2.5">
                                                <StarIcon className="w-5 h-5 text-[#a89968]" />
                                                <h2 className="text-lg font-bold">Starred Notes</h2>
                                            </div>
                                            <button className="text-sm text-[#a89968] hover:text-black transition-colors">
                                                View All
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-4 gap-5">
                                            {[
                                                {
                                                    Icon: RocketIcon,
                                                    bg: '#d4e8ff',
                                                    iconColor: '#4a90e2',
                                                    title: 'World Domination Plans',
                                                    desc: 'Step 1: Get coffee. Step 2: Learn how to code properly. Step 3: Profit? Need to rethink the timeline. Also, recruit more...',
                                                    time: 'Updated 2h ago',
                                                    tag: 'Strategy',
                                                    tagColor: '#4a90e2',
                                                },
                                                {
                                                    Icon: CartIcon,
                                                    bg: '#ffe8d4',
                                                    iconColor: '#ff9f43',
                                                    title: 'Grocery List',
                                                    desc: 'Just Dino Nuggies. Maybe some broccoli to look like an adult at the checkout counter. And that fancy...',
                                                    time: 'Updated 5h ago',
                                                    tag: 'Life',
                                                    tagColor: '#ff9f43',
                                                },
                                                {
                                                    Icon: TreeIcon,
                                                    bg: '#d4ffe8',
                                                    iconColor: '#26de81',
                                                    title: 'My Top 10 Houseplants',
                                                    desc: 'A definitive ranking of my leafy friends. Spoilers: the one I haven\'t killed yet is number one. P.S. Send help for the...',
                                                    time: 'Updated 1 day ago',
                                                    tag: 'Hobby',
                                                    tagColor: '#26de81',
                                                },
                                                {
                                                    Icon: HeartIcon,
                                                    bg: '#ffd4d4',
                                                    iconColor: '#fc5c65',
                                                    title: 'Reasons Why My Cat is a God',
                                                    desc: 'Proof that Mittens is superior to all other life forms. Exhibit A: her purr. Exhibit B: her disdain for my existence....',
                                                    time: 'Updated 3 days ago',
                                                    tag: 'Pets',
                                                    tagColor: '#fc5c65',
                                                },
                                            ].map((card, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white rounded-[24px] p-6 border border-[#f0f0f0] cursor-pointer shadow-[0_10px_28px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-shadow"
                                                >
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: card.bg }}
                                                    >
                                                        <card.Icon className="w-6 h-6" style={{ color: card.iconColor }} />
                                                    </div>
                                                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-snug">
                                                        {card.title}
                                                    </h3>
                                                    <p className="text-xs text-[#8b8b8b] mb-4 line-clamp-3 leading-relaxed">
                                                        {card.desc}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-[#a89968]">{card.time}</span>
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${card.tagColor}20`, color: card.tagColor }}>
                                                            {card.tag}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Other Notes From Collections */}
                                    <div className="mb-10">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2.5">
                                                <FolderIcon className="w-5 h-5 text-[#a89968]" />
                                                <h2 className="text-lg font-bold">Other Notes From Collections</h2>
                                            </div>
                                            <button className="text-sm text-[#a89968] hover:text-black transition-colors">
                                                Browse Collections
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-4 gap-5">
                                            {[
                                                {
                                                    Icon: AirplaneIcon,
                                                    bg: '#ffe8d4',
                                                    iconColor: '#ff9f43',
                                                    title: 'Dream Vacations I Can\'t Afford',
                                                    desc: 'A list of exotic locales, five-star resorts, and private islands. Currently accepting donations for my "escape reality" fund.',
                                                    collection: 'Wanderlust',
                                                    collectionColor: '#ff9f43',
                                                    tag: 'Travel',
                                                    tagColor: '#ffd700',
                                                },
                                                {
                                                    Icon: LightbulbIcon,
                                                    bg: '#d4e8ff',
                                                    iconColor: '#4a90e2',
                                                    title: 'Brilliant Business Ideas (Probably Not)',
                                                    desc: 'Featuring: a coffee shop for cats, an app that finds lost socks, and a professional napper service. Investors, hit me up.',
                                                    collection: 'Brainstorms',
                                                    collectionColor: '#4a90e2',
                                                    tag: 'Ideas',
                                                    tagColor: '#4a90e2',
                                                },
                                                {
                                                    Icon: MusicIcon,
                                                    bg: '#ffd4ff',
                                                    iconColor: '#a55eea',
                                                    title: 'My Shameful Guilty Pleasure Playlist',
                                                    desc: 'Includes: 90s boy bands, early 2000s pop-punk, and that one song from a children\'s cartoon. Don\'t judge my...',
                                                    collection: 'Jamz',
                                                    collectionColor: '#a55eea',
                                                    tag: 'Music',
                                                    tagColor: '#a55eea',
                                                },
                                                {
                                                    Icon: UtensilsIcon,
                                                    bg: '#d4ffd4',
                                                    iconColor: '#26de81',
                                                    title: 'Recipes I\'ll Never Actually Cook',
                                                    desc: 'Gourmet meals, elaborate desserts, and anything requiring more than 3 ingredients. My diet consists mostly of...',
                                                    collection: 'Foodie Dreams',
                                                    collectionColor: '#26de81',
                                                    tag: 'Cooking',
                                                    tagColor: '#26de81',
                                                },
                                            ].map((card, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white rounded-[24px] p-6 border border-[#f0f0f0] cursor-pointer shadow-[0_10px_28px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-shadow"
                                                >
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                                        style={{ backgroundColor: card.bg }}
                                                    >
                                                        <card.Icon className="w-6 h-6" style={{ color: card.iconColor }} />
                                                    </div>
                                                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-snug">
                                                        {card.title}
                                                    </h3>
                                                    <p className="text-xs text-[#8b8b8b] mb-4 line-clamp-3 leading-relaxed">
                                                        {card.desc}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-[#a89968]">Collection: {card.collection}</span>
                                                        <span className="px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${card.tagColor}20`, color: card.tagColor }}>
                                                            {card.tag}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Loading More */}
                                    <div className="text-center text-sm text-[#a89968] py-8">
                                        Loading more notes... or just more existential dread.
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        /* Archived Section */
                        <div className="text-center py-20">
                            <div className="inline-block bg-white rounded-[20px] px-8 py-12 shadow-sm">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f5f4e8] flex items-center justify-center text-4xl">
                                    📦
                                </div>
                                <h3 className="text-lg font-bold text-black mb-2">No Archived Notes</h3>
                                <p className="text-sm text-[#a89968]">Your archived notes will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Collection Modal */}
            <NewCollectionModal
                isOpen={showNewCollectionModal}
                onClose={() => setShowNewCollectionModal(false)}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />

            {/* Collections Grid */}
            <CollectionsGrid
                isOpen={showCollectionsGrid}
                onClose={() => setShowCollectionsGrid(false)}
                onAddNew={() => setShowNewCollectionModal(true)}
                onSelectCollection={setSelectedCollectionId}
                selectedCollectionId={selectedCollectionId}
            />

            {/* New Note Modal */}
            <NewNoteModal
                isOpen={showNewNoteModal}
                onClose={() => {
                    setShowNewNoteModal(false);
                    setEditingNoteId(null);
                }}
                selectedCollectionId={selectedCollectionId}
                editMode={editingNoteId !== null}
                noteData={editingNoteId ? notes.find(n => n.id === editingNoteId) : undefined}
            />

            {/* Note Editor */}
            <NoteEditor
                isOpen={showNoteEditor}
                onClose={() => setShowNoteEditor(false)}
            />
        </div>
    );
}
