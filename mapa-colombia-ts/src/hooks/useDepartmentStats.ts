import { useEffect, useMemo, useState } from 'react';
import { useAttractionsData } from '../context/AttractionsContext';
import type { MunicipalityModule, MunicipalityPath } from '../data/municipalityPathTypes';
import { loadMunicipalityModule } from '../utils/municipalityLoader';

export interface DepartmentStats {
    completed: number;
    partial: number;
    unvisited: number;
    totalMunicipalities: number;
    visitedMunicipalities: number;
    totalProgress: number;
    loaded: boolean;
}

type MatchedMunicipality = MunicipalityPath & { id: string };

export const useDepartmentStats = (
    visitedAttractions: Record<string, string[]>,
    departmentId: string | null
): DepartmentStats | null => {
    const { data: attractionsByDept } = useAttractionsData();
    const [module, setModule] = useState<MunicipalityModule | null>(null);

    useEffect(() => {
        let cancelled = false;
        setModule(null);
        if (!departmentId) return;
        loadMunicipalityModule(departmentId)
            .then((loaded) => {
                if (!cancelled) setModule(loaded);
            })
            .catch(() => {
                if (!cancelled) setModule(null);
            });
        return () => {
            cancelled = true;
        };
    }, [departmentId]);

    return useMemo(() => {
        if (!departmentId) return null;
        const matched = (module?.municipalities ?? []).filter(
            (municipality): municipality is MatchedMunicipality => municipality.id !== null
        );
        const visitedSet = new Set<string>(visitedAttractions[departmentId] || []);
        const idsByMunicipality = new Map<string, string[]>();
        (attractionsByDept[departmentId] || []).forEach(attraction => {
            if (!attraction.municipalityId) return;
            const ids = idsByMunicipality.get(attraction.municipalityId) || [];
            ids.push(attraction.id);
            idsByMunicipality.set(attraction.municipalityId, ids);
        });

        let completed = 0;
        let partial = 0;
        let unvisited = 0;
        let visited = 0;
        matched.forEach(municipality => {
            const total = idsByMunicipality.get(municipality.id) || [];
            const visitedCount = total.filter(id => visitedSet.has(id)).length;
            if (visitedCount > 0) {
                visited += 1;
                if (total.length > 0 && visitedCount === total.length) {
                    completed += 1;
                } else {
                    partial += 1;
                }
            } else {
                unvisited += 1;
            }
        });

        const totalMunicipalities = matched.length;
        const totalProgress = totalMunicipalities > 0
            ? Math.round(((completed + partial * 0.5) / totalMunicipalities) * 100)
            : 0;

        return {
            completed,
            partial,
            unvisited,
            totalMunicipalities,
            visitedMunicipalities: visited,
            totalProgress,
            loaded: module !== null,
        };
    }, [module, departmentId, visitedAttractions, attractionsByDept]);
};