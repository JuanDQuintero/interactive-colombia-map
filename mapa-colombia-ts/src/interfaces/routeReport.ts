export type RouteReportType = 'via' | 'precio' | 'agua' | 'otro';

export interface RouteReportTypeInfo {
    id: RouteReportType;
    label: string;
    hint: string;
}

export const ROUTE_REPORT_TYPES: RouteReportTypeInfo[] = [
    { id: 'via', label: 'Vía', hint: 'Cómo está el camino para llegar' },
    { id: 'precio', label: 'Precios', hint: 'Cuánto cuestan las entradas' },
    { id: 'agua', label: 'Agua y clima', hint: 'Charcos, cascadas y lluvia' },
    { id: 'otro', label: 'Otro', hint: 'Cualquier otra novedad' },
];

export type RouteReportStatus = 'vigente' | 'resuelto';

export interface RouteReport {
    id: string;
    municipalityId: string;
    departmentId: string;
    type: RouteReportType;
    text: string;
    price?: number | null;
    status: RouteReportStatus;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    resolvedAt?: Date | null;
}

export const ROUTE_REPORT_TTL_DAYS = 30;
export const ROUTE_REPORT_COOLDOWN_DAYS = 7;
export const ROUTE_REPORT_MAX_LENGTH = 180;
export const ROUTE_REPORT_QUERY_LIMIT = 60;
