import { describe, expect, it } from 'vitest';
import { TRIP_MAX_PHOTOS, TRIP_MAX_TIPS } from '../interfaces/trip';
import {
    canAddPhoto,
    canAddTip,
    durationLabel,
    formatBudget,
    isValidBudget,
    isValidPhotoFile,
    isValidTitle,
    transportLabel,
} from './trips';

const makeFile = (name: string, type: string, size: number): File =>
    ({ name, type, size }) as File;

describe('formatBudget', () => {
    it('usa "desde" cuando no hay rango', () => {
        expect(formatBudget(30000, null)).toContain('30.000');
        expect(formatBudget(30000, 30000)).toContain('Desde');
    });

    it('muestra el rango cuando el máximo es mayor', () => {
        const formatted = formatBudget(30000, 90000);
        expect(formatted).toContain('30.000');
        expect(formatted).toContain('90.000');
    });
});

describe('labels de opción', () => {
    it('traduce transporte y duración', () => {
        expect(transportLabel('flota')).toBe('En flota o bus');
        expect(durationLabel('fin_de_semana')).toBe('Fin de semana');
    });

    it('decaen a un texto genérico si el id no existe', () => {
        expect(transportLabel('nave' as never)).toBe('Transporte');
        expect(durationLabel('eterno' as never)).toBe('Duración');
    });
});

describe('validación de fotos', () => {
    it('acepta imágenes dentro del límite', () => {
        expect(isValidPhotoFile(makeFile('a.jpg', 'image/jpeg', 500_000))).toBe(true);
    });

    it('rechaza archivos que no son imágenes', () => {
        expect(isValidPhotoFile(makeFile('a.pdf', 'application/pdf', 100_000))).toBe(false);
    });

    it('rechaza imágenes muy pesadas', () => {
        expect(isValidPhotoFile(makeFile('a.jpg', 'image/jpeg', 2_000_000))).toBe(false);
    });

    it('limita el número de fotos', () => {
        expect(canAddPhoto(Array.from({ length: TRIP_MAX_PHOTOS - 1 }, () => makeFile('a.jpg', 'image/jpeg', 1)))).toBe(true);
        expect(canAddPhoto(Array.from({ length: TRIP_MAX_PHOTOS }, () => makeFile('a.jpg', 'image/jpeg', 1)))).toBe(false);
    });
});

describe('validación de presupuesto', () => {
    it('exige un mínimo positivo', () => {
        expect(isValidBudget('', '')).toBe(false);
        expect(isValidBudget('0', '')).toBe(false);
        expect(isValidBudget('30000', '')).toBe(true);
    });

    it('exige que el máximo sea mayor que el mínimo', () => {
        expect(isValidBudget('30000', '20000')).toBe(false);
        expect(isValidBudget('30000', '90000')).toBe(true);
    });
});

describe('validación de texto y tips', () => {
    it('exige un nombre con al menos 5 caracteres', () => {
        expect(isValidTitle('   ')).toBe(false);
        expect(isValidTitle('Sal')).toBe(false);
        expect(isValidTitle('Ruta a Salento')).toBe(true);
    });

    it('limita la cantidad de tips', () => {
        expect(canAddTip(['uno'])).toBe(true);
        expect(canAddTip(Array.from({ length: TRIP_MAX_TIPS }, (_, i) => `tip ${i}`))).toBe(false);
    });
});
