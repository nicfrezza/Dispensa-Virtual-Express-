import { fakeApi } from './api';

export interface User {
    id: number;
    email: string;
    username: string;
    name: {
        firstname: string;
        lastname: string;
    };
    phone: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    name: {
        firstname: string;
        lastname: string;
    };
    phone: string;
}

export const authService = {
    // Login (Fake Store API)
    login: async (credentials: LoginCredentials): Promise<string> => {
        const { data } = await fakeApi.post<{ token: string }>(
            '/auth/login',
            credentials
        );
        localStorage.setItem('token', data.token);
        return data.token;
    },

    // Buscar usuário atual (simulado - Fake Store não tem /me)
    getCurrentUser: async (): Promise<User | null> => {

        const token = localStorage.getItem('token');
        if (!token) return null;

        // Retornar mock ou buscar de users/1
        try {
            const { data } = await fakeApi.get<User>('/users/1');
            return data;
        } catch {
            return null;
        }
    },

    // Cadastro (Fake Store API)
    register: async (data: RegisterData): Promise<User> => {
        const { data: user } = await fakeApi.post<User>('/users', data);
        return user;
    },

    // Logout
    logout: (): void => {
        localStorage.removeItem('token');
    },

    // Verificar se está logado
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    },
};