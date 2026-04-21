import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

// ─── Auth ──────────────────────────────────────────────────
export const registerUser = (email, password) =>
    api.post('/auth/register', { email, password });

export const loginUser = (email, password) =>
    api.post('/auth/login', { email, password });

// ─── URLs ──────────────────────────────────────────────────
export const shortenUrl = (originalUrl, customAlias, expiresAt) =>
    api.post('/urls/shorten', { originalUrl, customAlias, expiresAt });

export const getUserUrls = () =>
    api.get('/urls');

export const deleteUrl = (code) =>
    api.delete(`/urls/${code}`);

// ─── Analytics ─────────────────────────────────────────────
export const getAnalytics = (code) =>
    api.get(`/analytics/${code}`);

export const getDeviceAnalytics = (code) =>
    api.get(`/analytics/${code}/devices`);

export const getCountryAnalytics = (code) =>
    api.get(`/analytics/${code}/countries`);

export default api;
