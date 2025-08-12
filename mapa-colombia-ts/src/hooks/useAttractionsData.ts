import { useEffect, useState } from 'react';
import { loadAttractions, type Attraction } from '../data/attractionsData';

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
                const result = await loadAttractions();
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