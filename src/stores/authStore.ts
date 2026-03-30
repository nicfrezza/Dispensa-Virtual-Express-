import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { User } from '../services/authService';


interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (username: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (username, password) => {
                set({ isLoading: true, error: null });
                try {
                    await authService.login({ username, password });
                    const user = await authService.getCurrentUser();
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.response?.data || 'Erro ao fazer login',
                        isLoading: false
                    });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const user = await authService.register(data);
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error: any) {
                    set({
                        error: error.response?.data || 'Erro ao cadastrar',
                        isLoading: false
                    });
                    throw error;
                }
            },

            logout: () => {
                authService.logout();
                set({ user: null, isAuthenticated: false, error: null });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'dispensa-auth',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);