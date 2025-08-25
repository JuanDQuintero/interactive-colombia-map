import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import type { Attraction } from '../interfaces/attraction';

export const useAttractionsData = () => {
    const [data, setData] = useState<Record<string, Attraction[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
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

                if (isMounted) setData(result);

            } catch (err) {
                if (isMounted) setError(err as Error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();
        return () => { isMounted = false; };
    }, []);

    return { data, loading, error };
};