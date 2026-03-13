import axios from 'axios';

// API Fake Store
export const fakeApi = axios.create({
    baseURL: 'https://fakestoreapi.com',
    timeout: 10000,
});

// Nossa API local (quando tiver backend)
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Interceptor para erro
fakeApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);