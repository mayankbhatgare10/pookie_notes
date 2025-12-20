
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { GridDotsIcon, SettingsIcon, LogoutIcon } from '@/components/icons';

interface HeaderProps {
    showCollectionsGrid: boolean;
    setShowCollectionsGrid: (show: boolean) => void;
    setShowSettingsModal: (show: boolean) => void;
}

export default function Header({ showCollectionsGrid, setShowCollectionsGrid, setShowSettingsModal }: HeaderProps) {
    const router = useRouter();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const userImage = "https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-[#f5f4e8] px-10 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Image
                    src={userImage}
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

                <div className="relative" ref={profileDropdownRef}>
                    <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="relative focus:outline-none"
                    >
                        <div className="w-9 h-9 rounded-full border-2 border-black overflow-hidden shadow-sm hover:scale-105 transition-transform bg-white">
                            <Image
                                src={userImage}
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
                            <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white flex-shrink-0">
                                    <Image
                                        src={userImage}
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
    );
}
