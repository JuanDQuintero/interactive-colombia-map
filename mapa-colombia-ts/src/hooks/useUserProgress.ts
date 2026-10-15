import { useMemo } from 'react';
import { useAttractionsData } from '../context/AttractionsContext';
import { municipalitiesByDepartment } from '../data/municipalitiesData';
import { getCategoryGroup } from '../utils/categories';
import {
    evaluateBadges,
    getNextBadge,
    type BadgeCategory,
    type BadgeStatus,
    type UserStats,
} from '../utils/badges';

const TOTAL_MUNICIPALITIES = Object.values(municipalitiesByDepartment).reduce(
    (total, list) => total + list.length,
    0
);

const municipalityNameIndex = new Map<string, string>();
Object.entries(municipalitiesByDepartment).forEach(([departmentId, list]) => {
    list.forEach(municipality => {
        municipalityNameIndex.set(`${departmentId}:${municipality.name}`, municipality.id);
    });
});

export interface UserProgress {
    visitedMunicipalityCount: number;
    totalMunicipalityCount: number;
    badges: BadgeStatus[];
    nextBadge: BadgeStatus | null;
}

export const useUserProgress = (visitedAttractions: Record<string, string[]>): UserProgress => {
    const { data: attractionsByDept } = useAttractionsData();

    const stats = useMemo<UserStats>(() => {
        const visitedIds = new Set<string>();
        Object.values(visitedAttractions || {}).forEach(ids => {
            (ids || []).forEach(id => visitedIds.add(id));
        });

        let completedDepartments = 0;
        const categoriesByMunicipality = new Map<string, Set<BadgeCategory>>();

        Object.entries(attractionsByDept || {}).forEach(([departmentId, attractions]) => {
            let visitedInDepartment = 0;
            (attractions || []).forEach(attraction => {
                if (!visitedIds.has(attraction.id)) return;
                visitedInDepartment += 1;
                const municipalityId = attraction.municipalityId
                    ?? municipalityNameIndex.get(`${departmentId}:${attraction.municipalityName ?? ''}`)
                    ?? null;
                if (!municipalityId) return;
                const category: BadgeCategory = getCategoryGroup(attraction.category);
                const categories = categoriesByMunicipality.get(municipalityId) ?? new Set<BadgeCategory>();
                categories.add(category);
                categoriesByMunicipality.set(municipalityId, categories);
            });
            if (attractions.length > 0 && visitedInDepartment === attractions.length) {
                completedDepartments += 1;
            }
        });

        const municipalitiesByCategory: Partial<Record<BadgeCategory, number>> = {};
        categoriesByMunicipality.forEach(categories => {
            categories.forEach(category => {
                municipalitiesByCategory[category] = (municipalitiesByCategory[category] ?? 0) + 1;
            });
        });

        return {
            visitedMunicipalityCount: categoriesByMunicipality.size,
            totalMunicipalityCount: TOTAL_MUNICIPALITIES,
            municipalitiesByCategory,
            completedDepartments,
        };
    }, [attractionsByDept, visitedAttractions]);

    return useMemo(() => {
        const badges = evaluateBadges(stats);
        return {
            visitedMunicipalityCount: stats.visitedMunicipalityCount,
            totalMunicipalityCount: stats.totalMunicipalityCount,
            badges,
            nextBadge: getNextBadge(badges),
        };
    }, [stats]);
};
