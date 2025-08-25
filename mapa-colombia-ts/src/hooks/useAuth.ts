import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';

interface UserData {
    isAdmin: boolean;
    email: string;
    displayName: string;
    photoURL?: string | null;
    createdAt?: Date;
    lastLogin?: Date;
}

interface AuthData {
    user: User | null;
    userData: UserData | null;
    isLoading: boolean;
    error: string | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuth = (): AuthData => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                setIsLoading(true);
                setError(null);

                if (!firebaseUser) {
                    setUser(null);
                    setUserData(null);
                    return;
                }

                setUser(firebaseUser);

                const userRef = doc(db, 'users', firebaseUser.uid);
                const unsubscribeUser = onSnapshot(userRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        setUserData({
                            isAdmin: data.isAdmin || false,
                            email: data.email || firebaseUser.email || '',
                            displayName: data.displayName || firebaseUser.displayName || '',
                            photoURL: data.photoURL || firebaseUser.photoURL,
                            createdAt: data.createdAt?.toDate(),
                            lastLogin: data.lastLogin?.toDate()
                        });
                    } else {
                        // Crear documento si no existe
                        createUserDocument(firebaseUser);
                    }
                });

                return () => unsubscribeUser();
            } catch (err) {
                setError('Error al cargar datos de usuario');
                console.error("Error en onAuthStateChanged:", err);
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const createUserDocument = async (firebaseUser: User) => {
        try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            await setDoc(userRef, {
                isAdmin: false,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                createdAt: new Date(),
                lastLogin: new Date()
            });
        } catch (err) {
            console.error("Error al crear documento de usuario:", err);
        }
    };

    const login = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err) {
            setError('Error al iniciar sesión');
            console.error("Error en login:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await signOut(auth);
        } finally {
            setIsLoading(false);
        }
    };

    return { user, userData, isLoading, error, login, logout };
};