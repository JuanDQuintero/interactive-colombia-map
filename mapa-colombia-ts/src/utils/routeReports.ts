import {
    ROUTE_REPORT_COOLDOWN_DAYS,
    ROUTE_REPORT_TTL_DAYS,
    type RouteReport,
    type RouteReportType,
} from '../interfaces/routeReport';

const DAY_MS = 86_400_000;

export const isReportExpired = (report: RouteReport, now: number = Date.now()): boolean =>
    now - report.createdAt.getTime() >= ROUTE_REPORT_TTL_DAYS * DAY_MS;

export const isReportActive = (report: RouteReport, now: number = Date.now()): boolean =>
    report.status === 'vigente' && !isReportExpired(report, now);

export const canUserReport = (
    reports: RouteReport[],
    userId: string,
    type: RouteReportType,
    now: number = Date.now()
): boolean => {
    const cooldownMs = ROUTE_REPORT_COOLDOWN_DAYS * DAY_MS;
    return !reports.some(
        report =>
            report.createdBy === userId &&
            report.type === type &&
            now - report.createdAt.getTime() < cooldownMs
    );
};

export const formatRelativeDate = (date: Date, now: number = Date.now()): string => {
    const days = Math.floor((now - date.getTime()) / DAY_MS);
    if (days <= 0) return 'hoy';
    if (days === 1) return 'ayer';
    if (days < 30) return `hace ${days} días`;
    const months = Math.floor(days / 30);
    return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
};

export const formatCopPrice = (price: number): string =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(price);
