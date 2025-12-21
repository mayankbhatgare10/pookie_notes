
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { GridDotsIcon, SettingsIcon, LogoutIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserAvatar from '@/components/UserAvatar';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';

interface HeaderProps {
    showCollectionsGrid: boolean;
    setShowCollectionsGrid: (show: boolean) => void;
    setShowSettingsModal: (show: boolean) => void;
    onMenuClick?: () => void;
}

export default function Header({ showCollectionsGrid, setShowCollectionsGrid, setShowSettingsModal, onMenuClick }: HeaderProps) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { profile } = useUserProfile();
    const { showToast } = useToast();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const userImage = "https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG";

    const handleLogout = async () => {
        try {
            await logout();
            showToast('Logged out successfully. See you later, Pookie! 👋', 'success');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Failed to logout. You\'re stuck with us! 😅', 'error');
        }
    };

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
        <header className="bg-[#f5f4e8] px-4 md:px-6 lg:px-10 py-4 md:py-5 flex items-center justify-between border-b border-[#e0dfd5] md:border-none">
            <div className="flex items-center gap-2 md:gap-3">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 hover:bg-[#eae9dd] rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <Image
                    src={userImage}
                    alt="Pookie Notes"
                    width={24}
                    height={24}
                    className="object-contain md:w-7 md:h-7"
                    unoptimized
                />
                <span className="text-[15px] md:text-[17px] font-bold">Pookie Notes</span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={() => setShowCollectionsGrid(!showCollectionsGrid)}
                    className="p-2 md:p-2.5 hover:bg-[#eae9dd] rounded-lg transition-colors"
                    title="Collections"
                >
                    <GridDotsIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <div className="relative" ref={profileDropdownRef}>
                    <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="relative focus:outline-none"
                    >
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-black overflow-hidden shadow-sm hover:scale-105 transition-transform bg-white">
                            <UserAvatar key={profile?.avatar || 'default'} avatar={profile?.avatar} size={36} />
                        </div>
                    </button>

                    {showProfileDropdown && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg z-50 border border-[#e0e0e0]">
                            <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white flex-shrink-0">
                                    <UserAvatar key={profile?.avatar || 'default-dropdown'} avatar={profile?.avatar} size={40} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-black truncate">
                                        {profile?.displayName || user?.displayName || 'User'}
                                    </p>
                                    <p className="text-xs text-[#666] mt-0.5 truncate">
                                        {profile?.email || user?.email || ''}
                                    </p>
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
                                    onClick={() => {
                                        setShowLogoutConfirm(true);
                                        setShowProfileDropdown(false);
                                    }}
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

            {/* Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Leaving so soon?"
                message="Are you sure you want to log out? Your pookies will miss you! We promise we won't judge your notes while you're gone... much. 👀"
                confirmText="Yeah, I'm Out"
                cancelText="Nah, I'll Stay"
                type="warning"
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                }
            />
        </header>
    );
}
