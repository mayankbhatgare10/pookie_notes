'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import PixelatedAvatar from './PixelatedAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getFirebaseErrorMessage } from '@/utils/errorMessages';

export default function SignupForm() {
  const [selectedAvatar, setSelectedAvatar] = useState('jethalal');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const { signUp, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName) {
      showToast('Please enter your full name', 'warning');
      return;
    }

    if (!formData.email) {
      showToast('Please enter your email', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    setLoading(true);

    try {
      const displayName = `${formData.firstName} ${formData.lastName}`;
      await signUp(formData.email, formData.password, displayName, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatar: selectedAvatar === 'upload' ? uploadedImage || undefined : selectedAvatar,
      });

      showToast('Account created! Welcome to the Pookie family! 🎉', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(getFirebaseErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);

    try {
      const result = await signInWithGoogle();

      // Smart flow: redirect based on whether user is new or existing
      if (result.isNewUser) {
        showToast('Welcome to Pookie Notes! Let\'s set up your profile 🚀', 'success');
        router.push('/onboarding');
      } else {
        showToast('Welcome back! Your pookies missed you 💛', 'success');
        router.push('/dashboard');
      }
    } catch (err: any) {
      showToast(getFirebaseErrorMessage(err), 'error');
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

      {/* Header */}
      <div className="w-full px-8 py-6 flex justify-between items-center animate-slide-down">
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
            <button className="bg-[#ffd700] hover:bg-[#ffed4e] px-6 py-2.5 rounded-full text-black font-semibold transition-colors text-sm border-2 border-black">
              Log in, loser
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md animate-scale-in">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#2d5016] mb-2">Commitment Issues?</h1>
            <p className="text-sm text-[#8b7355]">Just sign up. We promise not to sell your data to a chaotic AI.</p>
          </div>

          {/* Avatar Selection - Horizontal Scrollable */}
          <div className="mb-6 -mx-6 relative">
            <h2 className="text-sm font-semibold text-[#2d5016] mb-4 px-6">Choose your profile picture (or upload your own face):</h2>

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

          {/* Sign-up Form */}
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

            {/* Email Address */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
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
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
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
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
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

          {/* Submit Button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] border border-black text-black font-bold text-base transition-colors flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Let me in →'}
          </button>

          {/* OR Divider */}
          <div className="text-center text-[#c0c0c0] text-sm my-3">OR</div>

          {/* Google Signup Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full py-3 rounded-full bg-white hover:bg-gray-50 border border-black text-black font-normal text-sm transition-colors flex items-center justify-center gap-3 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Signing up...' : 'Continue with Google'}
          </button>

          {/* Disclaimer */}
          <p className="text-center text-xs text-[#8b7355] mb-4">
            By clicking this, you agree that you are indeed the main character.
          </p>

          {/* Footer */}
          <div className="text-center text-xs text-[#8b7355] pb-6">
            © 2025 Mayank Bhatgare. We're judging you quietly.
          </div>
        </div>
      </div>
    </div>
  );
}
