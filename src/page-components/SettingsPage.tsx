'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PixelatedAvatar from '@/components/PixelatedAvatar';

export default function SettingsPage() {
    const router = useRouter();
    const [selectedAvatar, setSelectedAvatar] = useState('jethalal');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: 'Mayank',
        lastName: 'Bhatgare',
        email: 'mayank@pookienotes.com',
        currentPassword: '',
        newPassword: '',
    });

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

    const handleSave = () => {
        // TODO: Implement save functionality
        console.log('Settings saved:', formData);
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you sure? This will delete all your pookies forever!')) {
            // TODO: Implement delete account
            console.log('Account deleted');
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f4e8] flex flex-col">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* Header */}
            <div className="w-full px-8 py-6 flex justify-between items-center border-b-2 border-black">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-black hover:text-[#666] transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-black">Settings</h1>
                </div>
                <Image
                    src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG"
                    alt="Pookie Notes Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    unoptimized
                />
            </div>

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-2xl">
                    {/* Profile Section */}
                    <div className="bg-white rounded-[24px] border-2 border-black p-8 mb-6">
                        <h2 className="text-xl font-bold text-black mb-6">Profile Information</h2>

                        {/* Avatar Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-black mb-3">
                                Profile Picture
                            </label>
                            <div className="flex gap-3 overflow-x-auto py-2" style={{ scrollbarWidth: 'none' }}>
                                {avatars.map((avatar) => (
                                    <div
                                        key={avatar.id}
                                        onClick={() => avatar.id === 'upload' ? triggerFileUpload() : setSelectedAvatar(avatar.id)}
                                        className="flex-shrink-0 cursor-pointer transition-all"
                                    >
                                        <div className={`relative ${selectedAvatar === avatar.id ? 'ring-[4px] ring-[#ffd700]' : ''} rounded-full`}>
                                            {avatar.id === 'upload' ? (
                                                <div className="w-16 h-16 rounded-full bg-[#f5f4e8] border-2 border-black flex items-center justify-center hover:bg-[#eeeee0] transition-colors overflow-hidden">
                                                    {uploadedImage ? (
                                                        <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-black shadow-sm hover:scale-105 transition-transform">
                                                    <PixelatedAvatar type={avatar.type!} size={64} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-black bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-black bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-black mb-2">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-black bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                            />
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="bg-white rounded-[24px] border-2 border-black p-8 mb-6">
                        <h2 className="text-xl font-bold text-black mb-6">Change Password</h2>

                        {/* Current Password */}
                        <div className="mb-4 relative">
                            <label className="block text-sm font-semibold text-black mb-2">Current Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-black bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-11 text-[#666] hover:text-black transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>

                        {/* New Password */}
                        <div className="mb-4 relative">
                            <label className="block text-sm font-semibold text-black mb-2">New Password</label>
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-black bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-11 text-[#666] hover:text-black transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-[24px] border-2 border-red-500 p-8 mb-6">
                        <h2 className="text-xl font-bold text-red-600 mb-3">Danger Zone</h2>
                        <p className="text-sm text-[#666] mb-4">
                            Once you delete your account, there is no going back. All your notes will be gone forever.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 border-2 border-black text-white font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            Delete Account
                        </button>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="w-full py-4 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] border-2 border-black text-black font-bold text-base transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        Save Changes
                    </button>

                    {/* Footer */}
                    <div className="text-center text-xs text-[#8b7355] mt-8">
                        © 2025 Crafted by Vivek ❣️ All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
