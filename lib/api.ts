import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log('📤 [API] Request to:', config.url, 'Token:', token ? `exists (${token.substring(0, 20)}...)` : 'MISSING');

    if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.log('⚠️ [API] No valid token found, request will be unauthorized');
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
