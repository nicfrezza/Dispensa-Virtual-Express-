import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
    apiKey: "AIzaSyDNHVI2KIbCK4zXVrmwON2kTXZqBXM5jKc",
    authDomain: "dispensa-84b12.firebaseapp.com",
    projectId: "dispensa-84b12",
    storageBucket: "dispensa-84b12.firebasestorage.app",
    messagingSenderId: "70782757720",
    appId: "1:70782757720:web:90074247c6b6ddbf87532d",
};

// Evita inicializar múltiplas vezes
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

