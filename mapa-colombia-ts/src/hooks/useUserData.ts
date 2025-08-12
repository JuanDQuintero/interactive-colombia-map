import { type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

interface UserData {
    visitedAttractions: Record<string, string[]>;
}

export const useUserData = (user: User | null) => {
    const [userData, setUserData] = useState<UserData>({ visitedAttractions: {} });
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setUserData({ visitedAttractions: {} });
                setIsLoadingData(false);
                return;
            }

            try {
                setIsLoadingData(true);
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data() as UserData;
                    setUserData(data || { visitedAttractions: {} });
                } else {
                    // Initialize new user document
                    await setDoc(userDocRef, { visitedAttractions: {} });
                    setUserData({ visitedAttractions: {} });
                }
            } catch (err) {
                console.error("Error loading user data:", err);
                setError("Failed to load user data");
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [user]);

    // Update Firebase when local data changes
    const updateFirebase = async (newData: Partial<UserData>) => {
        if (!user) return;

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, newData, { merge: true });
        } catch (err) {
            console.error("Error updating user data:", err);
            setError("Failed to save changes");
        }
    };

    const saveDepartmentAttractions = async (departmentId: string, selectedAttractions: string[]) => {
        if (!user) return;

        const newAttractions = { ...userData.visitedAttractions };

        if (selectedAttractions.length > 0) {
            newAttractions[departmentId] = selectedAttractions;
        } else {
            delete newAttractions[departmentId];
        }

        setUserData(prev => ({ ...prev, visitedAttractions: newAttractions }));
        await updateFirebase({ visitedAttractions: newAttractions });
    };

    return {
        visitedAttractions: userData.visitedAttractions,
        saveDepartmentAttractions,
        isLoadingData,
        error
    };
};