import { type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../firebase';
import { useAttractionsData } from '../context/AttractionsContext';

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
        let cancelled = false;

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

                if (cancelled) return;

                if (userDoc.exists()) {
                    const data = userDoc.data() as UserData;
                    setUserData(data || { visitedAttractions: {} });
                } else {
                    await setDoc(userDocRef, { visitedAttractions: {} });
                    if (cancelled) return;
                    setUserData({ visitedAttractions: {} });
                }
            } catch (err) {
                console.error("Error loading user data:", err);
                if (!cancelled) setError("Failed to load user data");
            } finally {
                if (!cancelled) setIsLoadingData(false);
            }
        };

        fetchData();
        return () => { cancelled = true; };
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

    // Debounce: referencias para batchear escrituras a Firestore
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingDataRef = useRef<Record<string, string[]> | null>(null);

    // Flush pendiente al desmontar o cambiar usuario
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (pendingDataRef.current && user) {
                const userDocRef = doc(db, 'users', user.uid);
                setDoc(userDocRef, { visitedAttractions: pendingDataRef.current }, { merge: true })
                    .catch(err => console.error("Error flushing pending data:", err));
            }
        };
    }, [user]);

    // Update Firebase when local data changes (con debounce)
    const updateFirebase = (newAttractions: Record<string, string[]>) => {
        if (!user) return;

        pendingDataRef.current = newAttractions;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            const dataToSave = pendingDataRef.current;
            pendingDataRef.current = null;
            if (!dataToSave) return;

            try {
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, { visitedAttractions: dataToSave }, { merge: true });
            } catch (err) {
                console.error("Error updating user data:", err);
                setError("Failed to save changes");
            }
        }, 500);
    };

    const saveDepartmentAttractions = (departmentId: string, selectedAttractions: string[]) => {
        if (!user) return;

        const newAttractions = { ...userData.visitedAttractions };

        if (selectedAttractions.length > 0) {
            newAttractions[departmentId] = selectedAttractions;
        } else {
            delete newAttractions[departmentId];
        }

        setUserData(prev => ({ ...prev, visitedAttractions: newAttractions }));
        updateFirebase(newAttractions);
    };

    return {
        visitedAttractions: cleanedVisitedAttractions,
        saveDepartmentAttractions,
        isLoadingData,
        error
    };
};