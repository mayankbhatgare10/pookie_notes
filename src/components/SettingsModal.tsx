'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import PixelatedAvatar from './PixelatedAvatar';
import UserAvatar from './UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/contexts/ToastContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user } = useAuth();
    const { profile, updateProfile } = useUserProfile();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState('jethalal');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showReLoginPrompt, setShowReLoginPrompt] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
    });

    // Load profile data when it becomes available
    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                currentPassword: '',
                newPassword: '',
            });
            setSelectedAvatar(profile.avatar || 'jethalal');

            // If it's an uploaded image (data URL or http URL), set it
            if (profile.avatar?.startsWith('data:') || profile.avatar?.startsWith('http')) {
                setUploadedImage(profile.avatar);
            }
        }
    }, [profile]);

    const avatars = [
        { id: 'upload', name: 'Upload', type: null as any },
        { id: 'jethalal', name: 'Jethalal', type: 'jethalal' as const },
        { id: 'akshay', name: 'Akshay', type: 'akshay' as const },
        { id: 'daya', name: 'Daya', type: 'daya' as const },
        { id: 'paresh', name: 'Paresh', type: 'paresh' as const },
        { id: 'pankaj', name: 'Pankaj', type: 'pankaj' as const },
        { id: 'manju', name: 'Manju Devi', type: 'manju' as const },
        { id: 'sameer', name: 'Sameer', type: 'sameer' as const },
        { id: 'rinki', name: 'Rinki', type: 'rinki' as const },
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setSelectedAvatar('upload');
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        try {
            await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                displayName: `${formData.firstName} ${formData.lastName}`,
                avatar: selectedAvatar === 'upload' ? uploadedImage || undefined : selectedAvatar,
            });
            setIsEditing(false);
            showToast('Profile updated! Looking good, Pookie! 😎', 'success');

            // Show re-login prompt after a short delay
            setTimeout(() => {
                setShowReLoginPrompt(true);
            }, 500);
        } catch (error) {
            console.error('Error saving profile:', error);
            showToast('Failed to save profile. Even we make mistakes sometimes. 🤷', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleReLogin = async () => {
        const { logout: logoutFn } = useAuth();
        try {
            showToast('Logging you out... See you in 3 seconds! 👋', 'info');
            await logoutFn();
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleDeleteAccount = () => {
        // TODO: Implement delete account
        console.log('Account deleted');
        setShowDeleteConfirm(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - Covers entire screen with blur */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed right-0 md:right-0 bottom-0 md:top-0 md:bottom-auto h-[85vh] md:h-full w-full md:w-[420px] bg-white shadow-2xl z-[70] overflow-y-auto animate-slide-up md:animate-slide-left rounded-t-[24px] md:rounded-none">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                />

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-[#e0e0e0] px-4 md:px-6 py-4 md:py-5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 md:gap-3">
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-[#f5f4e8] flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <h2 className="text-lg md:text-xl font-bold text-black">Profile Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-[#f5f4e8] flex items-center justify-center transition-colors"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6">
                    {!isEditing ? (
                        /* View Mode - Preview */
                        <>
                            {/* Profile Display */}
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-black overflow-hidden bg-white shadow-sm">
                                    <UserAvatar avatar={profile?.avatar} size={96} />
                                </div>
                            </div>

                            {/* Profile Info Preview */}
                            <div className="space-y-4 mb-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#666] mb-1.5">Full Name</label>
                                    <div className="px-4 py-3 rounded-lg bg-[#f5f4e8] border border-[#e0e0e0] text-black text-sm">
                                        {formData.firstName} {formData.lastName}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#666] mb-1.5">Email Address</label>
                                    <div className="px-4 py-3 rounded-lg bg-[#f5f4e8] border border-[#e0e0e0] text-black text-sm">
                                        {formData.email}
                                    </div>
                                </div>
                            </div>

                            {/* Edit Profile Button */}
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-3.5 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] border-2 border-black text-black font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] mb-4"
                            >
                                Edit Profile
                            </button>

                            {/* Delete Account Button */}
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full py-3 rounded-full bg-red-500 hover:bg-red-600 border-2 border-black text-white font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                            >
                                Delete Account
                            </button>
                        </>
                    ) : (
                        /* Edit Mode */
                        <>
                            {/* Avatar Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-black mb-3">
                                    Profile Picture
                                </label>
                                <div className="relative">
                                    <div
                                        id="settings-avatar-scroll"
                                        className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 cursor-grab active:cursor-grabbing"
                                        style={{
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollBehavior: 'smooth'
                                        }}
                                        onWheel={(e) => {
                                            e.currentTarget.scrollLeft += e.deltaY;
                                        }}
                                    >
                                        {avatars.map((avatar) => (
                                            <div
                                                key={avatar.id}
                                                onClick={() => avatar.id === 'upload' ? triggerFileUpload() : setSelectedAvatar(avatar.id)}
                                                className="flex-shrink-0 cursor-pointer"
                                            >
                                                <div className={`relative ${selectedAvatar === avatar.id ? 'ring-[3px] ring-[#ffd700]' : ''} rounded-full`}>
                                                    {avatar.id === 'upload' ? (
                                                        <div className={`w-14 h-14 rounded-full bg-[#f5f4e8] flex items-center justify-center hover:bg-[#eeeee0] transition-colors overflow-hidden ${selectedAvatar === avatar.id ? '' : 'border border-[#e0e0e0]'}`}>
                                                            {uploadedImage ? (
                                                                <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white hover:scale-105 transition-transform">
                                                            <PixelatedAvatar type={avatar.type!} size={56} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-black mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-black mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-black mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg border border-[#e0e0e0] bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                                />
                            </div>

                            {/* Password Section */}
                            <div className="mb-6 pt-6 border-t border-[#e0e0e0]">
                                <h3 className="text-sm font-bold text-black mb-4">Change Password</h3>

                                <div className="mb-3 relative">
                                    <label className="block text-xs font-semibold text-black mb-2">Current Password</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#e0e0e0] bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-9 text-[#666]"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="relative">
                                    <label className="block text-xs font-semibold text-black mb-2">New Password</label>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#e0e0e0] bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-9 text-[#666]"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 rounded-full bg-white border-2 border-black text-black font-bold text-sm hover:bg-[#f5f4e8] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] border-2 border-black text-black font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Popup */}
            {showDeleteConfirm && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[70] w-[400px]">
                        <div className="bg-white rounded-[20px] border-2 border-black p-6 shadow-2xl">
                            {/* Warning Icon */}
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-black text-center mb-2">
                                Delete Account?
                            </h3>

                            {/* Message */}
                            <p className="text-sm text-[#666] text-center mb-6">
                                This will permanently delete your account and all your pookies. This action cannot be undone!
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 rounded-full bg-white border-2 border-black text-black font-bold text-sm hover:bg-[#f5f4e8] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-600 border-2 border-black text-white font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Re-Login Prompt Modal */}
            {showReLoginPrompt && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
                        onClick={() => setShowReLoginPrompt(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-[420px]">
                        <div className="bg-white rounded-[20px] border-2 border-black p-6 shadow-2xl">
                            {/* Icon */}
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fff4e6] flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#ffd700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-black text-center mb-2">
                                Profile Updated! 🎉
                            </h3>

                            {/* Sarcastic Message */}
                            <p className="text-sm text-[#666] text-center mb-6">
                                Your changes are saved! But here's the thing... to see them <span className="font-bold">everywhere</span> (yes, including that stubborn dropdown), you'll need to log out and back in.
                                <br /><br />
                                I know, I know... it's 2025 and we still need to do this. Technology is amazing! 🙄
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowReLoginPrompt(false)}
                                    className="flex-1 py-3 rounded-full bg-white border-2 border-black text-black font-bold text-sm hover:bg-[#f5f4e8] transition-colors"
                                >
                                    Later, I Guess
                                </button>
                                <button
                                    onClick={handleReLogin}
                                    className="flex-1 py-3 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] border-2 border-black text-black font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                                >
                                    Fine, Log Me Out
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
