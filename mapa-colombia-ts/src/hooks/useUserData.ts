// src/hooks/useUserData.ts
import { type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

export const useUserData = (user: User | null) => {
    const [visitedAttractions, setVisitedAttractions] = useState<Record<string, string[]>>({});
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setIsLoadingData(true);
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().visitedAttractions) {
                    setVisitedAttractions(userDoc.data().visitedAttractions);
                } else {
                    setVisitedAttractions({});
                }
                setIsLoadingData(false);
            } else {
                setVisitedAttractions({});
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [user]);

    const toggleAttraction = async (departmentId: string, attractionId: string | null) => {
        if (!user) return;

        const newVisited = { ...visitedAttractions };

        if (attractionId) { // Lógica para un atractivo específico
            const deptVisited = newVisited[departmentId] || [];
            if (deptVisited.includes(attractionId)) {
                newVisited[departmentId] = deptVisited.filter(id => id !== attractionId);
                if (newVisited[departmentId].length === 0) {
                    delete newVisited[departmentId];
                }
            } else {
                newVisited[departmentId] = [...deptVisited, attractionId];
            }
        } else { // Lógica para un departamento sin atractivos
            if (departmentId in newVisited) {
                delete newVisited[departmentId]; // Desmarcar
            } else {
                newVisited[departmentId] = []; // Marcar como visitado (con lista vacía)
            }
        }

        setVisitedAttractions(newVisited);
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { visitedAttractions: newVisited }, { merge: true });
    };

    return { visitedAttractions, toggleAttraction, isLoadingData };
};
