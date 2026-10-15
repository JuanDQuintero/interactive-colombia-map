import { FirebaseError } from 'firebase/app';
import { useCallback, useEffect, useState } from 'react';
import {
    addDoc,
    collection,
    limit,
    onSnapshot,
    query,
    serverTimestamp,
    where,
    type DocumentData,
    type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import {
    TRIP_QUERY_LIMIT,
    type Trip,
    type TripDuration,
    type TripTransport,
} from '../interfaces/trip';

export interface NewTripInput {
    municipalityId: string;
    municipalityName: string;
    departmentId: string;
    title: string;
    transport: TripTransport;
    duration: TripDuration;
    budgetMin: number;
    budgetMax: number | null;
    tips: string[];
    photos: File[];
    userId: string;
    userName: string;
}

export interface PublishTripResult {
    ok: boolean;
    message?: string;
}

export interface UseTripsResult {
    trips: Trip[];
    loading: boolean;
    error: string | null;
    publishing: boolean;
    publishTrip: (input: NewTripInput) => Promise<PublishTripResult>;
}

const describePublishError = (error: unknown): string => {
    const code = error instanceof FirebaseError ? error.code : '';
    if (code === 'storage/unauthorized') {
        return 'Firebase Storage bloqueó la subida. Ojo: son las reglas de Storage (pestaña Storage → Rules), no las de Firestore.';
    }
    if (code === 'storage/retry-limit-exceeded' || code === 'storage/canceled') {
        return 'Se canceló la subida de las fotos. Revisa tu conexión e intenta de nuevo.';
    }
    if (code.startsWith('storage/')) {
        return 'No pudimos subir tus fotos al almacenamiento.';
    }
    if (code === 'permission-denied') {
        return 'No pudimos guardar el viaje: Firestore denegó la escritura.';
    }
    return 'No pudimos publicar tu viaje. Revisa tu conexión e intenta de nuevo.';
};

const toTrip = (snapshot: QueryDocumentSnapshot<DocumentData>): Trip => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        municipalityId: data.municipalityId,
        municipalityName: data.municipalityName,
        departmentId: data.departmentId,
        title: data.title,
        transport: data.transport as TripTransport,
        duration: data.duration as TripDuration,
        budgetMin: data.budgetMin ?? 0,
        budgetMax: data.budgetMax ?? null,
        tips: Array.isArray(data.tips) ? data.tips : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        status: data.status ?? 'pendiente',
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    };
};

const uploadPhoto = async (file: File, userId: string, index: number): Promise<string> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileRef = ref(storage, `trips/${userId}/${Date.now()}-${index}-${safeName}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
};

export const useTrips = (municipalityId: string): UseTripsResult => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        if (!municipalityId) {
            setTrips([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const tripsQuery = query(
            collection(db, 'trips'),
            where('municipalityId', '==', municipalityId),
            limit(TRIP_QUERY_LIMIT)
        );

        const unsubscribe = onSnapshot(
            tripsQuery,
            snapshot => {
                setTrips(
                    snapshot.docs
                        .map(toTrip)
                        .filter(trip => trip.status !== 'rechazado')
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                );
                setLoading(false);
            },
            () => {
                setError('No pudimos cargar los viajes de la comunidad');
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [municipalityId]);

    const publishTrip = useCallback(async (input: NewTripInput): Promise<PublishTripResult> => {
        try {
            setPublishing(true);
            setError(null);
            const photos = await Promise.all(
                input.photos.map((photo, index) => uploadPhoto(photo, input.userId, index))
            );
            await addDoc(collection(db, 'trips'), {
                municipalityId: input.municipalityId,
                municipalityName: input.municipalityName,
                departmentId: input.departmentId,
                title: input.title.trim(),
                transport: input.transport,
                duration: input.duration,
                budgetMin: input.budgetMin,
                budgetMax: input.budgetMax,
                tips: input.tips.map(tip => tip.trim()).filter(Boolean),
                photos,
                status: 'pendiente',
                createdBy: input.userId,
                createdByName: input.userName,
                createdAt: serverTimestamp(),
            });
            return { ok: true };
        } catch (caught) {
            const message = describePublishError(caught);
            setError(message);
            return { ok: false, message };
        } finally {
            setPublishing(false);
        }
    }, []);

    return { trips, loading, error, publishing, publishTrip };
};
