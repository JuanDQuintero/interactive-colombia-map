import { type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import { useAttractionsData } from './useAttractionsData';

interface UserData {
    visitedAttractions: Record<string, string[]>;
}

export const useUserData = (user: User | null) => {
    const [userData, setUserData] = useState<UserData>({ visitedAttractions: {} });
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carga los atractivos actuales
    const { data: attractionsByDept } = useAttractionsData();

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

    const cleanedVisitedAttractions = useMemo(() => {
        if (isLoadingData) return {};
        const cleaned: Record<string, string[]> = {};

        Object.entries(userData?.visitedAttractions || {}).forEach(([deptId, ids]) => {
            // Get all valid attraction IDs for this department
            const validAttractions = attractionsByDept[deptId] || [];

            // Obtener todos los IDs válidos (tanto el id del documento como cualquier ID alternativo)
            const validIds = validAttractions.map(a => a.id).filter(id => id);

            // Filtrar IDs inválidos
            cleaned[deptId] = ids.filter(id =>
                validIds.includes(id)
            ).filter((id, index, array) => array.indexOf(id) === index); // Remove duplicates
        });

        return cleaned;
    }, [userData.visitedAttractions, attractionsByDept, isLoadingData]);

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
        visitedAttractions: cleanedVisitedAttractions,
        saveDepartmentAttractions,
        isLoadingData,
        error
    };
};