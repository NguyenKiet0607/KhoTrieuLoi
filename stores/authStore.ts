import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string;
    pagePermissions: any;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    initialize: () => void;
    verifyToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (token, user) => {
                localStorage.setItem('token', token);
                set({ token, user, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ token: null, user: null, isAuthenticated: false });
                // Redirect to login if needed, but usually handled by protected routes
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            },

            updateUser: (user) => {
                set({ user });
            },

            initialize: () => {
                const token = localStorage.getItem('token');
                if (token) {
                    set({ token, isAuthenticated: true });
                }
            },

            verifyToken: async () => {
                const token = get().token || localStorage.getItem('token');
                if (!token) return;

                try {
                    const response = await apiClient.get('/auth/verify');
                    set({ user: response.data.user, isAuthenticated: true });
                } catch (error) {
                    console.error('Token verification failed:', error);
                    get().logout();
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);

export const useUser = () => useAuthStore((state) => state.user);
