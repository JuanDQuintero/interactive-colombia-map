import { useMemo } from 'react';
import type { Attraction } from '../interfaces/attraction';

/**
 * Filters attractions by municipality while remaining backward-compatible with
 * existing attractions that do not yet have municipalityId assigned.
 */
export const useAttractionsByMunicipality = (
    attractions: Attraction[],
    selectedMunicipality: string
) => {
    return useMemo(() => {
        if (!selectedMunicipality || selectedMunicipality === 'all') {
            return attractions;
        }

        const hasMunicipalityData = attractions.some(attraction => Boolean(attraction.municipalityId));
        if (!hasMunicipalityData) {
            return attractions;
        }

        return attractions.filter(
            attraction => attraction.municipalityId === selectedMunicipality
        );
    }, [attractions, selectedMunicipality]);
};
