'use client';

import { useEffect, useState } from 'react';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';

interface ToastProps {
    toast: ToastType;
}

function Toast({ toast }: ToastProps) {
    const { removeToast } = useToast();
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            removeToast(toast.id);
        }, 200);
    };

    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, toast.duration);

            return () => clearTimeout(timer);
        }
    }, [toast.duration]);

    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-[#d4f4dd] text-[#2d5016]';
            case 'error':
                return 'bg-[#ffe8e8] text-[#8b0000]';
            case 'warning':
                return 'bg-[#fff4e6] text-[#8b4513]';
            case 'info':
            default:
                return 'bg-[#e3f2fd] text-[#1565c0]';
        }
    };

    return (
        <div
            className={`
                px-4 py-2.5 rounded-lg
                ${getToastStyles()}
                ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
                text-sm font-medium
                shadow-sm
                max-w-[360px]
                border border-black/5
            `}
        >
            {toast.message}
        </div>
    );
}

export default function ToastContainer() {
    const { toasts } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} />
                </div>
            ))}
        </div>
    );
}
