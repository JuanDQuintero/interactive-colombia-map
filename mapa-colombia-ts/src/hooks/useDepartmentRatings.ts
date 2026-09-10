import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';

interface RatingInfo {
    average: number;
    count: number;
}

export const useDepartmentRatings = (attractionIds: string[]) => {
    const [ratingsMap, setRatingsMap] = useState<Record<string, RatingInfo>>({});

    const idsKey = useMemo(() => attractionIds.join(','), [attractionIds]);

    useEffect(() => {
        if (attractionIds.length === 0) {
            setRatingsMap({});
            return;
        }

        const q = query(
            collection(db, 'reviews'),
            where('attractionId', 'in', attractionIds)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const map: Record<string, { sum: number; count: number }> = {};

                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const aid = data.attractionId as string;
                    const rating = data.rating as number;

                    if (!map[aid]) {
                        map[aid] = { sum: 0, count: 0 };
                    }
                    map[aid].sum += rating;
                    map[aid].count += 1;
                });

                const result: Record<string, RatingInfo> = {};
                Object.entries(map).forEach(([aid, { sum, count }]) => {
                    result[aid] = { average: sum / count, count };
                });
                setRatingsMap(result);
            },
            (err) => {
                console.error('Error listening to department ratings:', err);
            }
        );

        return () => unsubscribe();
    }, [idsKey, attractionIds]);

    return ratingsMap;
};
