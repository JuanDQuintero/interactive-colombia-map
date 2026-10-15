import {
    TRIP_DURATIONS,
    TRIP_MAX_PHOTOS,
    TRIP_MAX_PHOTO_BYTES,
    TRIP_MAX_TIPS,
    TRIP_TITLE_MAX,
    TRIP_TRANSPORTS,
    type TripDuration,
    type TripTransport,
} from '../interfaces/trip';

export const formatCop = (value: number): string =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value);

export const formatBudget = (min: number, max: number | null): string =>
    max != null && max > min ? `${formatCop(min)} – ${formatCop(max)}` : `Desde ${formatCop(min)}`;

export const transportLabel = (id: TripTransport): string =>
    TRIP_TRANSPORTS.find(option => option.id === id)?.label ?? 'Transporte';

export const durationLabel = (id: TripDuration): string =>
    TRIP_DURATIONS.find(option => option.id === id)?.label ?? 'Duración';

export const isValidPhotoFile = (file: File): boolean =>
    file.type.startsWith('image/') && file.size <= TRIP_MAX_PHOTO_BYTES;

export const isValidTitle = (title: string): boolean => title.trim().length >= 5;

export const isValidBudget = (min: string, max: string): boolean => {
    const minValue = Number(min);
    if (!minValue || minValue <= 0) return false;
    if (!max) return true;
    const maxValue = Number(max);
    return maxValue > minValue;
};

export const isValidTips = (tips: string[]): boolean =>
    tips.length <= TRIP_MAX_TIPS && tips.every(tip => tip.trim().length > 0 && tip.length <= 90);

export const canAddTip = (tips: string[]): boolean => tips.length < TRIP_MAX_TIPS;

export const canAddPhoto = (photos: File[]): boolean => photos.length < TRIP_MAX_PHOTOS;

export const titleMaxLength = TRIP_TITLE_MAX;
