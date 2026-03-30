import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/lib/firebase/firebaseService';
import { auth } from '../../src/lib/firebase/authService';


export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const docRef = doc(db, 'usuarios_admin', firebaseUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUser(firebaseUser);
                    setUserData(docSnap.data());
                } else {
                    // Usuário autenticado mas não é admin
                    await signOut(auth);
                    setUser(null);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = () => signOut(auth);

    const temPermissao = (permissao: string) => {
        return userData?.permissoes?.includes(permissao) || userData?.role === 'admin';
    };

    return { user, userData, loading, logout, temPermissao };
};