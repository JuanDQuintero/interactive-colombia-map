import { useMemo } from 'react';
import { attractionsData } from '../data/attractionsData';
import { departmentsData } from '../data/colombiaMapData';

export const useMapStats = (visitedAttractions: Record<string, string[]>) => {
    return useMemo(() => {
        let completed = 0;
        let partial = 0;

        Object.keys(departmentsData).forEach(depId => {
            const visitedInDeptCount = visitedAttractions[depId]?.length || 0;
            const totalInDeptCount = attractionsData[depId]?.length || 0;
            const isDepartmentInVisitedList = depId in visitedAttractions;

            if (isDepartmentInVisitedList) {
                if (totalInDeptCount > 0) {
                    if (visitedInDeptCount === totalInDeptCount) {
                        completed++;
                    } else {
                        partial++;
                    }
                } else {
                    completed++;
                }
            }
        });

        const totalDepartments = Object.keys(departmentsData).length;
        const unvisited = totalDepartments - (completed + partial);
        const progress = totalDepartments > 0 ? Math.round(((completed + partial * 0.5) / totalDepartments) * 100) : 0;

        return {
            completedCount: completed,
            partialCount: partial,
            unvisitedCount: unvisited,
            totalProgress: progress,
        };
    }, [visitedAttractions]);
};
