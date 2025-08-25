import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

export const useAdmin = (user: User | null) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            setLoading(true);
            try {
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        // Verifica tanto isAdmin como roles (por si acaso)
                        const userData = userDoc.data();
                        setIsAdmin(userData?.isAdmin === true || userData?.roles?.admin === true);
                    } else {
                        // Si no existe el documento, créalo con isAdmin false
                        await setDoc(doc(db, 'users', user.uid), {
                            isAdmin: false,
                            email: user.email,
                            displayName: user.displayName
                        });
                        setIsAdmin(false);
                    }
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [user]);

    return { isAdmin, loading };
};