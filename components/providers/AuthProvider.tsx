'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        // Initialize from local storage first
        useAuthStore.getState().initialize();

        // Then verify with server to get latest data (permissions, etc)
        useAuthStore.getState().verifyToken();

        // Re-check on window focus to ensure permissions are up to date
        const handleFocus = () => {
            if (document.visibilityState === 'visible') {
                useAuthStore.getState().verifyToken();
            }
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('visibilitychange', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('visibilitychange', handleFocus);
        };
    }, []);

    return <>{children}</>;
}
