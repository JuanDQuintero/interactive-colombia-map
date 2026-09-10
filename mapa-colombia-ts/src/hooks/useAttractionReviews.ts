import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import type { AttractionReview } from '../interfaces/review';

export const useAttractionReviews = (attractionId: string | null) => {
    const [reviews, setReviews] = useState<AttractionReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!attractionId) {
            setReviews([]);
            return;
        }

        setLoading(true);
        setError(null);

        const q = query(
            collection(db, 'reviews'),
            where('attractionId', '==', attractionId)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() ?? new Date(),
                })) as AttractionReview[];

                data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                setReviews(data);
                setLoading(false);
            },
            (err) => {
                console.error('Error listening to reviews:', err);
                setError('Error al cargar reseñas');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [attractionId]);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / reviews.length;
    }, [reviews]);

    const addReview = async (review: Omit<AttractionReview, 'id' | 'createdAt'>) => {
        try {
            await addDoc(collection(db, 'reviews'), {
                ...review,
                createdAt: serverTimestamp(),
            });
        } catch (err) {
            console.error('Error saving review:', err);
            setError('Error al guardar reseña');
        }
    };

    const removeReview = async (reviewId: string) => {
        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
        } catch (err) {
            console.error('Error deleting review:', err);
            setError('Error al eliminar la reseña');
        }
    };

    return { reviews, averageRating, loading, error, addReview, removeReview };
};
