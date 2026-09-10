import { getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from 'firebase/auth';
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
        let unsubscribeUserDoc: (() => void) | undefined;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            // Limpiar el listener anterior del documento de usuario (evita leaks en login/logout)
            unsubscribeUserDoc?.();

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
                unsubscribeUserDoc = onSnapshot(
                    userRef,
                    (doc) => {
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
                    },
                    (err) => {
                        console.error('Error escuchando datos de usuario:', err);
                    }
                );
            } catch (err) {
                setError('Error al cargar datos de usuario');
                console.error("Error en onAuthStateChanged:", err);
            } finally {
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribeUserDoc?.();
            unsubscribeAuth();
        };
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
            setError(null);
            const provider = new GoogleAuthProvider();
            try {
                await signInWithPopup(auth, provider);
            } catch (err) {
                const code = (err as { code?: string })?.code || '';
                // En móviles/navegadores donde se bloquean popups, usar redirect
                if (code === 'auth/popup-blocked' ||
                    code === 'auth/operation-not-supported-in-this-environment' ||
                    code === 'auth/network-request-failed') {
                    await signInWithRedirect(auth, provider);
                } else {
                    throw err;
                }
            }
        } catch (err) {
            setError(getAuthErrorMessage(err));
            console.error("Error en login:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Completar el inicio de sesión por redirect (vuelta desde Google)
    useEffect(() => {
        getRedirectResult(auth)
            .catch((err) => {
                setError(getAuthErrorMessage(err));
                console.error("Error completando redirect:", err);
            });
    }, []);

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

const getAuthErrorMessage = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    switch (code) {
        case 'auth/popup-closed-by-user':
            return 'Se canceló el inicio de sesión. Inténtalo de nuevo.';
        case 'auth/unauthorized-domain':
            return 'El dominio no está autorizado en Firebase. Revisa Console > Authentication > Settings.';
        case 'auth/popup-blocked':
            return 'El navegador bloqueó la ventana emergente. Vuelve a intentarlo.';
        case 'auth/operation-not-supported-in-this-environment':
            return 'Inicio de sesión con ventana emergente no soportado aquí. Redirigiendo...';
        case 'auth/network-request-failed':
            return 'Problema de conexión. Verifica tu internet.';
        case 'auth/user-cancelled':
            return 'Inicio de sesión cancelado.';
        default:
            return 'Error al iniciar sesión. Inténtalo de nuevo.';
    }
};