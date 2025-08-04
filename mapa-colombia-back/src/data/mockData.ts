interface Department {
    id: string;
    name: string;
}
interface Attraction {
    id: number;
    departmentId: string;
    name: string;
    description: string;
    type: string;
}
export const departments: Department[] = [{ id: 'ANT', name: 'Antioquia' }, { id: 'BOY', name: 'Boyacá' }];
export const attractions: Attraction[] = [
    { id: 1, departmentId: 'ANT', name: 'Piedra del Peñol', description: 'Monolito con vistas espectaculares.', type: 'Naturaleza' },
    { id: 2, departmentId: 'ANT', name: 'Comuna 13', description: 'Tour de grafitis y cultura.', type: 'Cultural' },
    { id: 5, departmentId: 'BOY', name: 'Plaza Mayor de Villa de Leyva', description: 'Plaza empedrada y colonial.', type: 'Histórico' }
];