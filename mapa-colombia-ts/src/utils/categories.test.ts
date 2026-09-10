import { describe, expect, it } from 'vitest';
import {
    CATEGORIES_WITHOUT_TODOS,
    CATEGORY_OPTIONS,
    getCategoryGroup,
    getCategoryLabel,
} from './categories';

describe('getCategoryGroup', () => {
    it('clasifica palabras clave en su grupo canónico', () => {
        expect(getCategoryGroup('Pueblo patrimonio')).toBe('pueblos_cultura');
        expect(getCategoryGroup('Pueblo patrimonio')).toBe('pueblos_cultura');
        expect(getCategoryGroup('Senderismo en la montaña')).toBe('aventura');
        expect(getCategoryGroup('Parque natural')).toBe('naturaleza');
        expect(getCategoryGroup('Plan familiar')).toBe('familiar');
    });

    it('hace match case-insensitive', () => {
        expect(getCategoryGroup('MUSEO')).toBe('pueblos_cultura');
        expect(getCategoryGroup('Montaña')).toBe('aventura');
    });

    it('devuelve "otros" para categorías desconocidas', () => {
        expect(getCategoryGroup('Gastronomía gourmet')).toBe('otros');
        expect(getCategoryGroup('')).toBe('otros');
        expect(getCategoryGroup(undefined as unknown as string)).toBe('otros');
        expect(getCategoryGroup(null as unknown as string)).toBe('otros');
    });

    it('no devuelve nunca "todos"', () => {
        expect(getCategoryGroup('todos')).not.toBe('todos');
    });

    it('detecta variantes de acentuación', () => {
        expect(getCategoryGroup('Río Caquetá')).toBe('naturaleza');
        expect(getCategoryGroup('Rio Cauca')).toBe('naturaleza');
    });
});

describe('getCategoryLabel', () => {
    it('retorna la etiqueta correcta para cada id', () => {
        expect(getCategoryLabel('todos')).toBe('Todos');
        expect(getCategoryLabel('pueblos_cultura')).toBe('Pueblos y Cultura');
        expect(getCategoryLabel('aventura')).toBe('Aventura');
        expect(getCategoryLabel('naturaleza')).toBe('Naturaleza y Ecoturismo');
        expect(getCategoryLabel('familiar')).toBe('Familiar');
        expect(getCategoryLabel('otros')).toBe('Otros');
    });

    it('retorna "Otros" para un id inválido', () => {
        expect(getCategoryLabel('bogus' as never)).toBe('Otros');
    });
});

describe('Constantes', () => {
    it('CATEGORY_OPTIONS incluye todos los ids canónicos', () => {
        const ids = CATEGORY_OPTIONS.map(opt => opt.id);
        expect(ids).toEqual(['todos', 'pueblos_cultura', 'aventura', 'naturaleza', 'familiar', 'otros']);
    });

    it('CATEGORIES_WITHOUT_TODOS excluye "todos"', () => {
        expect(CATEGORIES_WITHOUT_TODOS.some(opt => opt.id === 'todos')).toBe(false);
        expect(CATEGORIES_WITHOUT_TODOS).toHaveLength(CATEGORY_OPTIONS.length - 1);
    });

    it('cada grupo canónico tiene una etiqueta no vacía', () => {
        for (const opt of CATEGORIES_WITHOUT_TODOS) {
            expect(opt.label.trim().length).toBeGreaterThan(0);
        }
    });
});