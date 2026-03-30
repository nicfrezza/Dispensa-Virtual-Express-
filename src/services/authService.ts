import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../lib/firebase/authService';
import { db } from '../lib/firebase/firebaseService';

export type UserRole = 'admin' | 'gerente' | 'analista' | 'vendedor';

export interface User {
    id: string;
    email: string;
    username: string;
    name: string;
    phone: string;
    role?: UserRole;
    permissoes: Permissao[];
}

export type Permissao =
    | 'solicitacoes_visualizar'
    | 'solicitacoes_aprovar'
    | 'solicitacoes_rejeitar'
    | 'reclamacoes_responder'
    | 'usuarios_gerenciar'
    | 'relatorios_visualizar';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone: string;
    username?: string;
}

const buildUserFromFirebase = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();

        if (!userData) {
            const newUser: Omit<User, 'id'> = {
                email: firebaseUser.email || '',
                username: firebaseUser.email?.split('@')[0] || '',
                name: firebaseUser.displayName || '',
                phone: '',
                role: 'vendedor',
                permissoes: ['solicitacoes_visualizar'],
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), {
                ...newUser,
                createdAt: serverTimestamp(),
            });

            return {
                id: firebaseUser.uid,
                ...newUser,
            };
        }

        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || userData.email,
            username: userData.username || firebaseUser.email?.split('@')[0] || '',
            name: userData.name || firebaseUser.displayName || '',
            phone: userData.phone || '',
            role: userData.role || 'vendedor',
            permissoes: userData.permissoes || ['solicitacoes_visualizar'],
        };
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
    }
};

export const authService = {
    login: async (credentials: LoginCredentials): Promise<string> => {
        const { email, password } = credentials;

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();

        localStorage.setItem('token', token);

        return token;
    },

    getCurrentUser: async (): Promise<User | null> => {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                unsubscribe();

                if (!firebaseUser) {
                    resolve(null);
                    return;
                }

                const user = await buildUserFromFirebase(firebaseUser);
                resolve(user);
            });
        });
    },

    register: async (data: RegisterData): Promise<User> => {
        const { email, password, name, phone, username } = data;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        await updateProfile(firebaseUser, { displayName: name });

        const userData: Omit<User, 'id'> = {
            email: email,
            username: username || email.split('@')[0],
            name: name,
            phone: phone.replace(/\D/g, ''),
            role: 'vendedor',
            permissoes: [
                'solicitacoes_visualizar',
                'reclamacoes_responder',
            ],
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return {
            id: firebaseUser.uid,
            ...userData,
        };
    },

    logout: async (): Promise<void> => {
        await signOut(auth);
        localStorage.removeItem('token');
    },

    isAuthenticated: (): boolean => {
        return !!auth.currentUser || !!localStorage.getItem('token');
    },

    onAuthStateChanged: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const user = await buildUserFromFirebase(firebaseUser);
                callback(user);
            } else {
                callback(null);
            }
        });
    },
};