import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    addDoc,
    collection,
    doc,
    limit,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
    type DocumentData,
    type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
    ROUTE_REPORT_QUERY_LIMIT,
    type RouteReport,
    type RouteReportType,
} from '../interfaces/routeReport';
import { canUserReport, isReportActive } from '../utils/routeReports';

export interface NewRouteReportInput {
    municipalityId: string;
    departmentId: string;
    type: RouteReportType;
    text: string;
    price?: number | null;
    userId: string;
    userName: string;
}

export interface UseRouteReportsResult {
    reports: RouteReport[];
    loading: boolean;
    error: string | null;
    submitting: boolean;
    submitReport: (input: NewRouteReportInput) => Promise<boolean>;
    resolveReport: (reportId: string) => Promise<void>;
    canReportType: (type: RouteReportType, userId: string) => boolean;
}

const toRouteReport = (snapshot: QueryDocumentSnapshot<DocumentData>): RouteReport => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        municipalityId: data.municipalityId,
        departmentId: data.departmentId,
        type: data.type as RouteReportType,
        text: data.text,
        price: data.price ?? null,
        status: data.status,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        resolvedAt: data.resolvedAt?.toDate ? data.resolvedAt.toDate() : null,
    };
};

export const useRouteReports = (municipalityId: string): UseRouteReportsResult => {
    const [allReports, setAllReports] = useState<RouteReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!municipalityId) {
            setAllReports([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const reportsQuery = query(
            collection(db, 'routeReports'),
            where('municipalityId', '==', municipalityId),
            limit(ROUTE_REPORT_QUERY_LIMIT)
        );

        const unsubscribe = onSnapshot(
            reportsQuery,
            (snapshot) => {
                const mapped = snapshot.docs
                    .map(toRouteReport)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                setAllReports(mapped);
                setLoading(false);
            },
            () => {
                setError('No pudimos cargar los reportes de la ruta');
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [municipalityId]);

    const reports = useMemo(() => allReports.filter(report => isReportActive(report)), [allReports]);

    const submitReport = useCallback(
        async (input: NewRouteReportInput): Promise<boolean> => {
            try {
                setSubmitting(true);
                await addDoc(collection(db, 'routeReports'), {
                    municipalityId: input.municipalityId,
                    departmentId: input.departmentId,
                    type: input.type,
                    text: input.text.trim(),
                    price: input.type === 'precio' ? input.price ?? null : null,
                    status: 'vigente',
                    createdBy: input.userId,
                    createdByName: input.userName,
                    createdAt: serverTimestamp(),
                });
                return true;
            } catch {
                setError('No pudimos guardar tu reporte');
                return false;
            } finally {
                setSubmitting(false);
            }
        },
        []
    );

    const resolveReport = useCallback(async (reportId: string) => {
        try {
            await updateDoc(doc(db, 'routeReports', reportId), {
                status: 'resuelto',
                resolvedAt: serverTimestamp(),
            });
        } catch {
            setError('No pudimos actualizar el reporte');
        }
    }, []);

    const canReportType = useCallback(
        (type: RouteReportType, userId: string) => canUserReport(reports, userId, type),
        [reports]
    );

    return { reports, loading, error, submitting, submitReport, resolveReport, canReportType };
};
