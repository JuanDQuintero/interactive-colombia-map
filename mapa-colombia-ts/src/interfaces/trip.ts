export type TripTransport = 'flota' | 'moto' | 'carro' | 'campero' | 'bicicleta' | 'a_pie';

export interface TripTransportInfo {
    id: TripTransport;
    label: string;
}

export const TRIP_TRANSPORTS: TripTransportInfo[] = [
    { id: 'flota', label: 'En flota o bus' },
    { id: 'moto', label: 'En moto' },
    { id: 'carro', label: 'Carro particular' },
    { id: 'campero', label: 'Campero 4x4' },
    { id: 'bicicleta', label: 'Bicicleta' },
    { id: 'a_pie', label: 'A pie' },
];

export type TripDuration = 'pasadia' | 'fin_de_semana' | 'tres_dias_mas';

export interface TripDurationInfo {
    id: TripDuration;
    label: string;
}

export const TRIP_DURATIONS: TripDurationInfo[] = [
    { id: 'pasadia', label: 'Pasadía' },
    { id: 'fin_de_semana', label: 'Fin de semana' },
    { id: 'tres_dias_mas', label: '3 días o más' },
];

export type TripStatus = 'pendiente' | 'aprobado' | 'rechazado';

export interface Trip {
    id: string;
    municipalityId: string;
    municipalityName: string;
    departmentId: string;
    title: string;
    transport: TripTransport;
    duration: TripDuration;
    budgetMin: number;
    budgetMax: number | null;
    tips: string[];
    photos: string[];
    status: TripStatus;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
}

export const TRIP_MIN_PHOTOS = 2;
export const TRIP_MAX_PHOTOS = 5;
export const TRIP_MAX_PHOTO_BYTES = 1_500_000;
export const TRIP_TITLE_MAX = 70;
export const TRIP_TIP_MAX = 90;
export const TRIP_MAX_TIPS = 3;
export const TRIP_QUERY_LIMIT = 30;
