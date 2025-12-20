'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Step = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPasswordForm() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleEmailSubmit = () => {
        // TODO: Implement email verification API call
        console.log('Sending OTP to:', email);
        setStep('otp');
    };

    const handleOtpVerify = () => {
        // TODO: Implement OTP verification API call
        console.log('Verifying OTP:', otp);
        setStep('reset');
    };

    const handlePasswordReset = () => {
        // TODO: Implement password reset API call
        console.log('Resetting password');
        setStep('success');
    };

    return (
        <div className="min-h-screen bg-[#fffef0] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Image
                        src="https://z3759y9was.ufs.sh/f/SFmIfV4reUMkMX05ywI8vZdrHiCNquxPUKI94Og1t6VnfcjG"
                        alt="Pookie Notes Logo"
                        width={140}
                        height={140}
                        className="object-contain"
                        unoptimized
                    />
                </div>

                {/* Step 1: Email Input */}
                {step === 'email' && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-black mb-2">Forgot Password?</h1>
                            <p className="text-sm text-[#8b7355]">Of course you did. Let's fix this mess.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 pr-12 rounded-full border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#8b7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>

                            <button
                                onClick={handleEmailSubmit}
                                className="w-full py-4 rounded-[32px] bg-[#ffd700] hover:bg-[#ffed4e] border-[3px] border-black text-black font-bold text-base transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2"
                            >
                                Send OTP →
                            </button>

                            <div className="text-center text-sm text-[#8b7355] mt-6">
                                <Link href="/login" className="text-black font-semibold hover:underline">
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </>
                )}

                {/* Step 2: OTP Verification */}
                {step === 'otp' && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-black mb-2">Enter OTP</h1>
                            <p className="text-sm text-[#8b7355]">We sent a code to {email}. Check your spam folder as usual.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="w-full px-4 py-3.5 rounded-full border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={handleOtpVerify}
                                className="w-full py-4 rounded-[32px] bg-[#ffd700] hover:bg-[#ffed4e] border-[3px] border-black text-black font-bold text-base transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2"
                            >
                                Verify OTP →
                            </button>

                            <div className="text-center text-sm text-[#8b7355] mt-4">
                                <span>Didn't receive the code? </span>
                                <button className="text-black font-semibold hover:underline">Resend (again?)</button>
                            </div>
                        </div>
                    </>
                )}

                {/* Step 3: Reset Password */}
                {step === 'reset' && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-black mb-2">Set New Password</h1>
                            <p className="text-sm text-[#8b7355]">Make it strong this time. Password123 doesn't count.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 pr-12 rounded-full border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#8b7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 pr-12 rounded-full border border-gray-300 bg-white text-[#2d5016] placeholder-[#8b7355] text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-[#8b7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>

                            <button
                                onClick={handlePasswordReset}
                                className="w-full py-4 rounded-[32px] bg-[#ffd700] hover:bg-[#ffed4e] border-[3px] border-black text-black font-bold text-base transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2"
                            >
                                Reset Password →
                            </button>
                        </div>
                    </>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                    <>
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🎉</div>
                            <h1 className="text-2xl font-bold text-black mb-2">All Set!</h1>
                            <p className="text-sm text-[#8b7355]">Try not to forget it this time, yeah?</p>
                        </div>

                        <div className="space-y-4">
                            <Link href="/login">
                                <button className="w-full py-4 rounded-[32px] bg-[#ffd700] hover:bg-[#ffed4e] border-[3px] border-black text-black font-bold text-base transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2">
                                    Go to Login →
                                </button>
                            </Link>
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-[#8b7355] mt-8">
                    © 2025 Crafted by Mayank Bhatgare ❣️ All rights reserved.
                </div>
            </div>
        </div>
    );
}
