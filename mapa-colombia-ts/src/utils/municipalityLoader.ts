import type { MunicipalityModule } from '../data/municipalityPathTypes';

// Lazily loads the municipality geometry module of a department (Vite
// code-splits each file into its own chunk).
const loaders = import.meta.glob<MunicipalityModule>('../data/municipalityPaths/*.ts');

export const loadMunicipalityModule = (departmentId: string): Promise<MunicipalityModule | null> => {
    const key = `../data/municipalityPaths/${departmentId}.ts`;
    const loader = loaders[key];
    return loader ? loader() : Promise.resolve(null);
};