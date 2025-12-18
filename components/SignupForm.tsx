'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PixelatedAvatar from './PixelatedAvatar';

export default function SignupForm() {
  const [selectedAvatar, setSelectedAvatar] = useState('jethalal');
  const [formData, setFormData] = useState({
    firstName: 'Pookie',
    lastName: 'Bear',
    email: 'totally.real.email@example.com',
    password: 'Make it weird',
    confirmPassword: 'Make it weird... again',
  });
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const avatars = [
    { id: 'upload', name: 'Upload', type: null as any },
    { id: 'jethalal', name: 'Jethalal', type: 'jethalal' as const },
    { id: 'akshay', name: 'Akshay', type: 'akshay' as const },
    { id: 'paresh', name: 'Paresh', type: 'paresh' as const },
    { id: 'pankaj', name: 'Pankaj', type: 'pankaj' as const },
    { id: 'rinki', name: 'Rinki', type: 'rinki' as const },
  ];

  return (
    <div className="min-h-screen bg-[#fffef0] flex flex-col">
      {/* Header */}
      <div className="w-full px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG"
            alt="Pookie Notes Logo"
            width={32}
            height={32}
            className="object-contain"
            unoptimized
          />
          <span className="text-2xl font-bold text-[#2d5016]">Pookie Notes</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#2d5016] text-base">Already have an account?</span>
          <Link href="/login">
            <button className="bg-[#ffd700] border-2 border-black px-6 py-2.5 rounded-lg text-[#2d5016] font-bold hover:bg-[#ffed4e] transition-colors text-base">
              Log in, loser
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-[#2d5016] mb-3 leading-tight">Commitment Issues?</h1>
            <p className="text-lg text-[#8b7355]">Just sign up. We promise not to sell your data to a chaotic AI.</p>
          </div>

          {/* Avatar Selection */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-[#2d5016] mb-4">Choose your fighter (or upload your own face):</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${selectedAvatar === avatar.id ? 'ring-4 ring-[#ffd700] rounded-full p-1' : ''
                    }`}
                >
                  {avatar.id === 'upload' ? (
                    <div className="relative w-16 h-16 rounded-full bg-[#c8e6c9] flex items-center justify-center">
                      <svg className="w-7 h-7 text-[#4caf50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  ) : (
                    <PixelatedAvatar type={avatar.type!} size={64} />
                  )}
                  <span className="text-xs text-[#2d5016] font-medium">{avatar.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-up Form */}
          <div className="space-y-3.5 mb-6">
            {/* First and Last Name - Side by Side */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="px-4 py-3 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
              />
            </div>

            {/* Email Address */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-[#8b7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              >
                <svg className="w-5 h-5 text-[#8b7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              >
                <svg className="w-5 h-5 text-[#8b7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          {/* Submit Button - More rounded */}
          <button className="w-full py-3.5 rounded-full bg-[#ffd700] border-2 border-black text-black font-bold text-base hover:bg-[#ffed4e] transition-colors flex items-center justify-center gap-2 mb-4">
            Let me in →
          </button>

          {/* Disclaimer */}
          <p className="text-center text-xs text-[#8b7355] mb-16">
            By clicking this, you agree that you are indeed the main character.
          </p>

          {/* Footer */}
          <div className="text-center text-xs text-[#8b7355]">
            © 2024 Pookie Notes. We're judging you quietly.
          </div>
        </div>
      </div>
    </div>
  );
}
