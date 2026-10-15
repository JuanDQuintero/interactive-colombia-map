import type { CategoryId } from './categories';

export type BadgeCategory = Exclude<CategoryId, 'todos'>;

export interface UserStats {
    visitedMunicipalityCount: number;
    totalMunicipalityCount: number;
    municipalitiesByCategory: Partial<Record<BadgeCategory, number>>;
    completedDepartments: number;
}

export type BadgeIcon = 'star' | 'compass' | 'mountain' | 'bolt' | 'heart' | 'flag' | 'shield';

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: BadgeIcon;
    target: number;
    progress: (stats: UserStats) => number;
}

export interface BadgeStatus extends BadgeDefinition {
    current: number;
    earned: boolean;
}

export const BADGES: BadgeDefinition[] = [
    {
        id: 'primer-paso',
        name: 'Primer paso',
        description: 'Registra tu primera visita',
        icon: 'star',
        target: 1,
        progress: stats => stats.visitedMunicipalityCount,
    },
    {
        id: 'explorador-de-pueblos',
        name: 'Explorador de pueblos',
        description: 'Municipios con al menos una visita de pueblos y cultura',
        icon: 'compass',
        target: 8,
        progress: stats => stats.municipalitiesByCategory.pueblos_cultura ?? 0,
    },
    {
        id: 'caminante-de-paramos',
        name: 'Caminante de páramos',
        description: 'Municipios con al menos una visita de naturaleza y ecoturismo',
        icon: 'mountain',
        target: 5,
        progress: stats => stats.municipalitiesByCategory.naturaleza ?? 0,
    },
    {
        id: 'buscador-de-aventura',
        name: 'Buscador de aventura',
        description: 'Municipios con al menos una visita de aventura',
        icon: 'bolt',
        target: 5,
        progress: stats => stats.municipalitiesByCategory.aventura ?? 0,
    },
    {
        id: 'viaje-en-familia',
        name: 'Viaje en familia',
        description: 'Municipios con al menos una visita de categoría familiar',
        icon: 'heart',
        target: 5,
        progress: stats => stats.municipalitiesByCategory.familiar ?? 0,
    },
    {
        id: 'veinticinco-municipios',
        name: '25 municipios',
        description: 'Registra visitas en 25 municipios de Colombia',
        icon: 'flag',
        target: 25,
        progress: stats => stats.visitedMunicipalityCount,
    },
    {
        id: 'setentaicinco-municipios',
        name: '75 municipios',
        description: 'Registra visitas en 75 municipios de Colombia',
        icon: 'flag',
        target: 75,
        progress: stats => stats.visitedMunicipalityCount,
    },
    {
        id: 'territorio-completo',
        name: 'Territorio completo',
        description: 'Completa todas las atracciones de un departamento',
        icon: 'shield',
        target: 1,
        progress: stats => stats.completedDepartments,
    },
];

export const evaluateBadges = (stats: UserStats): BadgeStatus[] =>
    BADGES.map(badge => {
        const reached = badge.progress(stats);
        return {
            ...badge,
            current: Math.min(reached, badge.target),
            earned: reached >= badge.target,
        };
    });

export const getNextBadge = (badges: BadgeStatus[]): BadgeStatus | null => {
    const locked = badges.filter(badge => !badge.earned);
    if (locked.length === 0) return null;
    return locked.reduce((best, badge) => {
        const ratio = badge.current / badge.target;
        const bestRatio = best.current / best.target;
        if (ratio > bestRatio) return badge;
        if (ratio < bestRatio) return best;
        return badge.target < best.target ? badge : best;
    });
};
