'use client';

import { ReactNode } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    icon?: ReactNode;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    icon,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case 'danger':
                return {
                    iconBg: 'bg-red-50',
                    iconColor: 'text-red-600',
                    confirmBg: 'bg-red-500 hover:bg-red-600',
                    confirmText: 'text-white',
                };
            case 'warning':
                return {
                    iconBg: 'bg-[#fff9e6]',
                    iconColor: 'text-[#d4a017]',
                    confirmBg: 'bg-[#ffd700] hover:bg-[#ffed4e]',
                    confirmText: 'text-black',
                };
            case 'info':
            default:
                return {
                    iconBg: 'bg-blue-50',
                    iconColor: 'text-blue-600',
                    confirmBg: 'bg-[#ffd700] hover:bg-[#ffed4e]',
                    confirmText: 'text-black',
                };
        }
    };

    const colors = getColors();

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-[400px] animate-scale-in">
                <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-lg">
                    {/* Icon */}
                    {icon && (
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-full ${colors.iconBg} flex items-center justify-center`}>
                            <div className={colors.iconColor}>
                                {icon}
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-bold text-black text-center mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-[#666] text-center mb-6 leading-relaxed">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-full bg-white border border-black/10 text-black font-medium text-sm hover:bg-[#f5f4e8] transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-2.5 rounded-full font-medium text-sm transition-colors ${colors.confirmBg} ${colors.confirmText}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
