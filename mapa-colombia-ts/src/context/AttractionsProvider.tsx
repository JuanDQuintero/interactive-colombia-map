import React, { useCallback, useEffect, useState } from 'react';
import type { Attraction } from '../interfaces/attraction';
import {
    AttractionsContext,
    fetchAttractionsOnce,
    invalidateAttractionsCache,
} from './AttractionsContext';

export const AttractionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<Record<string, Attraction[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        fetchAttractionsOnce()
            .then(result => { if (isMounted) setData(result); })
            .catch(err => { if (isMounted) setError(err as Error); })
            .finally(() => { if (isMounted) setLoading(false); });

        return () => { isMounted = false; };
    }, [version]);

    const refetch = useCallback(async () => {
        invalidateAttractionsCache();
        setVersion(v => v + 1);
    }, []);

    // Refrescar al volver a la pestaña para ver ediciones de otros usuarios/admin
    useEffect(() => {
        const handleVisible = () => {
            if (document.visibilityState === 'visible') {
                invalidateAttractionsCache();
                setVersion(v => v + 1);
            }
        };
        document.addEventListener('visibilitychange', handleVisible);
        return () => {
            document.removeEventListener('visibilitychange', handleVisible);
        };
    }, []);

    return (
        <AttractionsContext.Provider value={{ data, loading, error, refetch }}>
            {children}
        </AttractionsContext.Provider>
    );
};