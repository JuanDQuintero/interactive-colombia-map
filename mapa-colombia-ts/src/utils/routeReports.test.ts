import { describe, expect, it } from 'vitest';
import { ROUTE_REPORT_COOLDOWN_DAYS, ROUTE_REPORT_TTL_DAYS, type RouteReport } from '../interfaces/routeReport';
import {
    canUserReport,
    formatCopPrice,
    formatRelativeDate,
    isReportActive,
    isReportExpired,
} from './routeReports';

const DAY_MS = 86_400_000;
const NOW = new Date('2026-03-15T12:00:00Z').getTime();

const buildReport = (overrides: Partial<RouteReport> = {}): RouteReport => ({
    id: 'r1',
    municipalityId: 'CO-QUI-001',
    departmentId: 'CO-QUI',
    type: 'via',
    text: 'La vía paved está destapada',
    price: null,
    status: 'vigente',
    createdBy: 'user-a',
    createdByName: 'Ana',
    createdAt: new Date(NOW - DAY_MS),
    resolvedAt: null,
    ...overrides,
});

describe('isReportExpired', () => {
    it('no expira un reporte reciente', () => {
        expect(isReportExpired(buildReport(), NOW)).toBe(false);
    });

    it('expira al cumplir el TTL', () => {
        const old = buildReport({ createdAt: new Date(NOW - ROUTE_REPORT_TTL_DAYS * DAY_MS) });
        expect(isReportExpired(old, NOW)).toBe(true);
    });
});

describe('isReportActive', () => {
    it('exige estado vigente', () => {
        expect(isReportActive(buildReport({ status: 'resuelto' }), NOW)).toBe(false);
    });

    it('descarta reportes vencidos aunque sigan marcados como vigentes', () => {
        const old = buildReport({ createdAt: new Date(NOW - (ROUTE_REPORT_TTL_DAYS + 1) * DAY_MS) });
        expect(isReportActive(old, NOW)).toBe(false);
    });

    it('acepta un reporte vigente dentro del TTL', () => {
        expect(isReportActive(buildReport(), NOW)).toBe(true);
    });
});

describe('canUserReport', () => {
    it('permite reportar si el usuario no ha publicado ese tipo', () => {
        expect(canUserReport([buildReport()], 'user-b', 'via', NOW)).toBe(true);
    });

    it('bloquea durante la ventana de espera', () => {
        const reports = [buildReport()];
        expect(canUserReport(reports, 'user-a', 'via', NOW)).toBe(false);
    });

    it('permite de nuevo cuando pasa la ventana de espera', () => {
        const reports = [
            buildReport({ createdAt: new Date(NOW - (ROUTE_REPORT_COOLDOWN_DAYS + 1) * DAY_MS) }),
        ];
        expect(canUserReport(reports, 'user-a', 'via', NOW)).toBe(true);
    });

    it('no bloquea otros tipos del mismo usuario', () => {
        expect(canUserReport([buildReport()], 'user-a', 'precio', NOW)).toBe(true);
    });
});

describe('formatRelativeDate', () => {
    it('usa palabras cortas para hoy y ayer', () => {
        expect(formatRelativeDate(new Date(NOW), NOW)).toBe('hoy');
        expect(formatRelativeDate(new Date(NOW - DAY_MS), NOW)).toBe('ayer');
    });

    it('usa días hasta el mes', () => {
        expect(formatRelativeDate(new Date(NOW - 5 * DAY_MS), NOW)).toBe('hace 5 días');
    });

    it('usa meses a partir de 30 días', () => {
        expect(formatRelativeDate(new Date(NOW - 31 * DAY_MS), NOW)).toBe('hace 1 mes');
        expect(formatRelativeDate(new Date(NOW - 70 * DAY_MS), NOW)).toBe('hace 2 meses');
    });
});

describe('formatCopPrice', () => {
    it('formatea pesos colombianos sin decimales', () => {
        expect(formatCopPrice(15000)).toContain('15.000');
        expect(formatCopPrice(15000)).not.toContain(',');
    });
});
