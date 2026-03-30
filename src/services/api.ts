import axios from 'axios';

export const fakeApi = axios.create({
    baseURL: 'https://fakestoreapi.com',
    timeout: 10000,
});

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

fakeApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);