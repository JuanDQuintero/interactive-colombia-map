import { departmentsData } from "../data/colombiaMapData";

export const getDepartmentDisplayName = (departmentId: string): string => {
    const department = departmentsData[departmentId];
    return department
        ? `${department.name} (${departmentId})`
        : departmentId; // Fallback si no se encuentra el departamento
};