import { describe, expect, it } from 'vitest';
import { BADGES, evaluateBadges, getNextBadge, type UserStats } from './badges';

const emptyStats: UserStats = {
    visitedMunicipalityCount: 0,
    totalMunicipalityCount: 1128,
    municipalitiesByCategory: {},
    completedDepartments: 0,
};

const statsWith = (overrides: Partial<UserStats>): UserStats => ({ ...emptyStats, ...overrides });

describe('evaluateBadges', () => {
    it('no otorga ninguna insignia sin visitas', () => {
        const badges = evaluateBadges(emptyStats);
        expect(badges.every(badge => !badge.earned)).toBe(true);
        expect(badges.every(badge => badge.current === 0)).toBe(true);
    });

    it('otorga "Primer paso" con el primer municipio', () => {
        const badges = evaluateBadges(statsWith({ visitedMunicipalityCount: 1 }));
        const primerPaso = badges.find(badge => badge.id === 'primer-paso');
        expect(primerPaso?.earned).toBe(true);
    });

    it('cuenta municipios por categoría, no atracciones', () => {
        const badges = evaluateBadges(statsWith({ municipalitiesByCategory: { naturaleza: 5 } }));
        const paramos = badges.find(badge => badge.id === 'caminante-de-paramos');
        expect(paramos?.earned).toBe(true);
        const pueblos = badges.find(badge => badge.id === 'explorador-de-pueblos');
        expect(pueblos?.earned).toBe(false);
    });

    it('limita el progreso al objetivo una vez superado', () => {
        const badges = evaluateBadges(statsWith({ visitedMunicipalityCount: 30 }));
        const veinticinco = badges.find(badge => badge.id === 'veinticinco-municipios');
        expect(veinticinco?.earned).toBe(true);
        expect(veinticinco?.current).toBe(25);
    });

    it('requiere un departamento completo para "Territorio completo"', () => {
        const badges = evaluateBadges(statsWith({ completedDepartments: 1 }));
        expect(badges.find(badge => badge.id === 'territorio-completo')?.earned).toBe(true);
    });

    it('devuelve una insignia por cada definición', () => {
        expect(evaluateBadges(emptyStats)).toHaveLength(BADGES.length);
    });
});

describe('getNextBadge', () => {
    it('propone la insignia más pequeña cuando no hay progreso', () => {
        const next = getNextBadge(evaluateBadges(emptyStats));
        expect(next?.id).toBe('primer-paso');
    });

    it('propone la insignia con mayor avance relativo', () => {
        const badges = evaluateBadges(statsWith({ visitedMunicipalityCount: 3 }));
        const next = getNextBadge(badges);
        expect(next?.id).toBe('veinticinco-municipios');
    });

    it('devuelve null cuando todo está conseguido', () => {
        const badges = evaluateBadges(
            statsWith({
                visitedMunicipalityCount: 80,
                municipalitiesByCategory: {
                    pueblos_cultura: 8,
                    naturaleza: 5,
                    aventura: 5,
                    familiar: 5,
                },
                completedDepartments: 1,
            })
        );
        expect(badges.every(badge => badge.earned)).toBe(true);
        expect(getNextBadge(badges)).toBeNull();
    });
});
