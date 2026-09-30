export interface MunicipalityPath {
    id: string | null;
    name: string;
    d: string;
}

export interface MunicipalityModule {
    departmentName: string;
    viewBox: string;
    municipalities: MunicipalityPath[];
}