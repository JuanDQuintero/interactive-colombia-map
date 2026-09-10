import { collection, getDocs } from 'firebase/firestore';
import { createContext, useContext } from 'react';
import { db } from '../firebase';
import type { Attraction } from '../interfaces/attraction';

export interface AttractionsContextValue {
    data: Record<string, Attraction[]>;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export const AttractionsContext = createContext<AttractionsContextValue>({
    data: {},
    loading: true,
    error: null,
    refetch: async () => {},
});

export const useAttractionsData = () => useContext(AttractionsContext);

// Precarga de atractivos (1 sola llamada por app)
let cachedData: Record<string, Attraction[]> | null = null;
let cachePromise: Promise<Record<string, Attraction[]>> | null = null;

export async function fetchAttractionsOnce(): Promise<Record<string, Attraction[]>> {
    if (cachedData) return cachedData;
    if (cachePromise) return cachePromise;

    cachePromise = (async () => {
        const attractionsSnap = await getDocs(collection(db, 'attractions'));
        const result: Record<string, Attraction[]> = {};

        attractionsSnap.docs.forEach(doc => {
            const attraction = {
                id: doc.id,
                ...doc.data()
            } as Attraction & { regionId: string };

            if (!result[attraction.regionId]) {
                result[attraction.regionId] = [];
            }
            result[attraction.regionId].push(attraction);
        });

        cachedData = result;
        return result;
    })();

    return cachePromise;
}

export function invalidateAttractionsCache(): void {
    cachedData = null;
    cachePromise = null;
}