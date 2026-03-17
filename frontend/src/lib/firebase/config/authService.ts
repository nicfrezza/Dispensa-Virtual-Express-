import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../../config';

export const registerUser = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Usuário registrado:', userCredential.user.uid);
        return userCredential.user;
    } catch (error: any) {
        console.error('Erro ao registrar:', error);
        throw new Error(getErrorMessage(error.code));
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Usuário logado:', userCredential.user.uid);
        return userCredential.user;
    } catch (error: any) {
        console.error('Erro ao fazer login:', error);
        throw new Error(getErrorMessage(error.code));
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
    }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
    return auth.currentUser;
};

const getErrorMessage = (errorCode: string): string => {
    const errorMessages: { [key: string]: string } = {
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/invalid-email': 'Email inválido',
        'auth/operation-not-allowed': 'Operação não permitida',
        'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres',
        'auth/user-disabled': 'Usuário desabilitado',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet'
    };

    return errorMessages[errorCode] || 'Erro ao autenticar. Tente novamente.';
};

export { auth };