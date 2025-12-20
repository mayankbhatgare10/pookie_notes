'use client';

import { useState } from 'react';

interface PasswordPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (password: string) => void;
    itemName: string; // "note" or "collection"
}

export default function PasswordPromptModal({ isOpen, onClose, onSuccess, itemName }: PasswordPromptModalProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!password.trim()) {
            setError('Please enter a password! 🔐');
            return;
        }

        // Call onSuccess with the password for verification
        onSuccess(password);
        setPassword('');
        setError('');
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl relative animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-5 right-5 text-black hover:text-gray-600 transition-colors z-10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fff4e6] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-black text-center mb-2">
                        Locked {itemName}! 🔒
                    </h2>
                    <p className="text-sm text-[#666] text-center mb-6">
                        This {itemName} is password protected. Enter the password to access it.
                    </p>

                    {/* Password Input */}
                    <div className="mb-5">
                        <label className="block text-[9px] font-bold text-[#666] uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                placeholder="Enter password..."
                                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#f8f7f0] border border-[#e0e0e0] text-sm focus:outline-none focus:ring-1 focus:ring-[#999] transition-all"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-black"
                            >
                                {showPassword ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs text-red-500 mt-2">{error}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3 rounded-full bg-white border-2 border-black text-black font-bold text-sm hover:bg-[#f5f4e8] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3 rounded-full bg-[#ffd700] hover:bg-[#ffed4e] text-black font-bold text-sm transition-colors"
                        >
                            Unlock
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-[#999] text-center mt-4">
                        Forgot password? Too bad! 😅
                    </p>
                </div>
            </div>
        </div>
    );
}
