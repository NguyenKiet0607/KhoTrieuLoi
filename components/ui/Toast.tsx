'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
    };

    return createPortal(
        <div className={`fixed top-4 right-4 z-50 flex items-center ${bgColors[type]} text-white px-4 py-3 rounded shadow-lg animate-fade-in`}>
            <div className="mr-2">{icons[type]}</div>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 hover:text-gray-200">
                <X size={18} />
            </button>
        </div>,
        document.body
    );
};

// Global toast manager
let toastHandler: ((message: string, type: ToastType, duration?: number) => void) | null = null;

export const ToastContainer = () => {
    const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType; duration?: number }>>([]);

    useEffect(() => {
        toastHandler = (message, type, duration) => {
            const id = Date.now();
            setToasts((prev) => [...prev, { id, message, type, duration }]);
        };

        return () => {
            toastHandler = null;
        };
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </>
    );
};

export const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    if (toastHandler) {
        toastHandler(message, type, duration);
    } else {
        console.log(`[Toast]: ${message}`);
    }
};
