'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PixelatedAvatar from '@/components/PixelatedAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile } from '@/lib/userService';

export default function OnboardingForm() {
    const [selectedAvatar, setSelectedAvatar] = useState('jethalal');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
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

    const router = useRouter();
    const { user } = useAuth();

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

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.firstName || !formData.lastName) {
            setError('Please enter your full name');
            return;
        }

        if (!user) {
            setError('No user found. Please sign in again.');
            return;
        }

        setLoading(true);

        try {
            // Create user profile in Firestore
            await createUserProfile(user, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                avatar: selectedAvatar === 'upload' ? uploadedImage || undefined : selectedAvatar,
            });

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to complete profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffef0] flex flex-col animate-fade-in">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-md animate-scale-in">
                    {/* Logo */}
                    <div className="flex justify-center mb-6 animate-slide-down">
                        <div className="flex items-center gap-2 md:gap-3">
                            <Image
                                src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG"
                                alt="Pookie Notes Logo"
                                width={32}
                                height={32}
                                className="object-contain md:w-10 md:h-10"
                                unoptimized
                            />
                            <span className="text-2xl md:text-3xl font-bold text-[#2d5016]">Pookie Notes</span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-[#2d5016] mb-2">Welcome, Pookie! 👋</h1>
                        <p className="text-sm text-[#8b7355]">
                            {user?.email && `Signed in as ${user.email}`}
                        </p>
                        <p className="text-sm text-[#8b7355] mt-2">
                            Let's complete your profile so we can judge you properly.
                        </p>
                    </div>

                    {/* Avatar Selection - Horizontal Scrollable */}
                    <div className="mb-6 -mx-6 relative">
                        <h2 className="text-sm font-semibold text-[#2d5016] mb-4 px-6">Choose your profile picture:</h2>

                        {/* Scroll Container */}
                        <div className="relative">
                            {/* Avatar Container */}
                            <div
                                id="avatar-scroll"
                                className="flex gap-3 overflow-x-auto overflow-y-hidden py-2 px-6 cursor-grab active:cursor-grabbing"
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
                                        className="flex-shrink-0 cursor-pointer transition-all"
                                    >
                                        <div className={`relative ${selectedAvatar === avatar.id ? 'ring-[4px] ring-[#ffd700]' : ''} rounded-full`}>
                                            {avatar.id === 'upload' ? (
                                                <div className="w-14 h-14 rounded-full bg-[#e8e8e8] border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors overflow-hidden">
                                                    {uploadedImage ? (
                                                        <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm hover:scale-105 transition-transform">
                                                    <PixelatedAvatar type={avatar.type!} size={56} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Name Form */}
                    <div className="space-y-3 mb-5">
                        {/* First and Last Name - Side by Side */}
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-3 animate-slide-down">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleComplete}
                        disabled={loading}
                        className="w-full py-3 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] border border-black text-black font-bold text-base transition-colors flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Setting up your hoard...' : 'Complete Profile →'}
                    </button>

                    {/* Footer */}
                    <div className="text-center text-xs text-[#8b7355] pb-6 mt-6">
                        © 2025 Crafted by Mayank Bhatgare ❣️ All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
