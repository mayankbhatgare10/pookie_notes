
'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { FlameIcon } from '@/components/icons';
import { THOUGHTS } from '@/utils/constants';
import { formatTime } from '@/utils/time';

export default function Sidebar() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { time, period, dayDate } = formatTime(currentTime);

    return (
        <div className="w-[280px] md:w-[280px] bg-[#f5f4e8] px-4 md:px-8 py-6 md:py-8 flex flex-col h-screen overflow-y-auto">
            {/* Clock */}
            <div className="bg-white rounded-[16px] md:rounded-[20px] px-4 md:px-6 py-4 md:py-6 mb-4 md:mb-6 text-center shadow-sm">
                <div className="mb-2 flex items-end justify-center gap-1.5">
                    <span className="text-[40px] md:text-[52px] font-bold leading-none tracking-tight text-black">
                        {time}
                    </span>
                    <span className="text-[14px] md:text-[16px] font-bold text-[#d4a574] mb-1 md:mb-2">
                        {period}
                    </span>
                </div>
                <div className="inline-block bg-[#fff4e6] rounded-lg px-4 py-1.5">
                    <span className="text-[9px] md:text-[10px] text-[#d4a574] tracking-wide font-semibold">
                        {dayDate}
                    </span>
                </div>
            </div>

            {/* Quote of the Day */}
            <div className="mb-4 md:mb-6 bg-[#e8e4d4] rounded-[16px] md:rounded-[20px] px-4 md:px-6 py-4 md:py-6">
                <h2 className="text-[11px] md:text-[13px] font-bold leading-tight mb-2 md:mb-3 text-black uppercase tracking-wide">
                    Quote of the Day
                </h2>
                <p className="text-[11px] md:text-[12px] text-black leading-relaxed mb-2">
                    "{THOUGHTS[0].quote}"
                </p>
                <p className="text-[10px] md:text-[11px] text-[#666] font-medium text-right">
                    — {THOUGHTS[0].author}
                </p>
            </div>

            {/* Streak & Calendar */}
            <div className="bg-white rounded-[16px] md:rounded-[20px] px-4 md:px-6 py-4 md:py-6 shadow-sm">
                <StreakCalendar currentTime={currentTime} />
            </div>
        </div>
    );
}

function StreakCalendar({ currentTime }: { currentTime: Date }) {
    const [streakDays, setStreakDays] = useState<number[]>([]);
    const { user } = useAuth();
    const today = currentTime.getDate();
    const currentMonth = currentTime.getMonth();
    const currentYear = currentTime.getFullYear();

    // Fetch actual user activity from Firebase
    useEffect(() => {
        if (!user || !db) {
            setStreakDays([]);
            return;
        }

        const fetchUserActivity = async () => {
            try {
                const notesRef = collection(db!, `users/${user.uid}/notes`);
                const q = query(notesRef);
                const snapshot = await getDocs(q);

                const activeDaysSet = new Set<number>();

                snapshot.forEach((doc) => {
                    const noteData = doc.data();

                    // Check createdAt
                    if (noteData.createdAt) {
                        const createdDate = noteData.createdAt.toDate();
                        if (
                            createdDate.getMonth() === currentMonth &&
                            createdDate.getFullYear() === currentYear
                        ) {
                            activeDaysSet.add(createdDate.getDate());
                        }
                    }

                    // Check updatedAt
                    if (noteData.updatedAt) {
                        const updatedDate = noteData.updatedAt.toDate();
                        if (
                            updatedDate.getMonth() === currentMonth &&
                            updatedDate.getFullYear() === currentYear
                        ) {
                            activeDaysSet.add(updatedDate.getDate());
                        }
                    }
                });

                // Convert to array and calculate consecutive streak
                const activeDaysArray = Array.from(activeDaysSet).sort((a, b) => a - b);

                // Calculate consecutive days from today backwards
                const consecutiveDays: number[] = [];
                let currentDay = today;

                while (activeDaysArray.includes(currentDay) && currentDay > 0) {
                    consecutiveDays.unshift(currentDay);
                    currentDay--;
                }

                setStreakDays(consecutiveDays);
            } catch (error) {
                console.error('Error fetching user activity:', error);
                setStreakDays([]);
            }
        };

        fetchUserActivity();
    }, [user, currentMonth, currentYear, today]);

    const streakCount = streakDays.length;
    const hasActiveStreak = streakDays.includes(today);

    return (
        <>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-black">Streak</h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fff4e6] rounded-full">
                    <FlameIcon className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-semibold text-black">
                        {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
                    </span>
                </div>
            </div>

            <div className="text-center mb-3">
                <span className="text-[11px] font-bold text-[#666] uppercase tracking-wide">
                    {currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[9px] text-[#999] font-semibold pb-1">
                        {day}
                    </div>
                ))}
                <CalendarDays currentTime={currentTime} streakDays={streakDays} />
            </div>
        </>
    );
}

function CalendarDays({ currentTime, streakDays }: { currentTime: Date; streakDays: number[] }) {
    const today = currentTime.getDate();
    const firstDay = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentTime.getFullYear(), currentTime.getMonth(), 0).getDate();

    const streakSet = new Set(streakDays);
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
        const hasStreak = streakSet.has(day);

        if (day === today) {
            // Current date - just circle, NO slash
            days.push(
                <div key={day} className="aspect-square rounded-full bg-[#ffd700] border border-black flex items-center justify-center text-[11px] font-bold text-black shadow-[1px_1px_0px_#000]">
                    {day}
                </div>
            );
        } else if (hasStreak) {
            days.push(
                <div key={day} className="aspect-square rounded-full flex items-center justify-center text-[11px] text-black font-semibold relative">
                    {day}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-[1.5px] bg-black transform rotate-45"></div>
                    </div>
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

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
        days.push(
            <div key={`next-${day}`} className="aspect-square rounded-full flex items-center justify-center text-[11px] text-[#ccc] font-medium">
                {day}
            </div>
        );
    }

    return <>{days}</>;
}
