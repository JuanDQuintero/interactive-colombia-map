export type CategoryId = 'todos' | 'pueblos_cultura' | 'aventura' | 'naturaleza' | 'familiar' | 'otros';

export interface CategoryInfo {
    id: CategoryId;
    label: string;
}

export const CATEGORY_OPTIONS: CategoryInfo[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'pueblos_cultura', label: 'Pueblos y Cultura' },
    { id: 'aventura', label: 'Aventura' },
    { id: 'naturaleza', label: 'Naturaleza y Ecoturismo' },
    { id: 'familiar', label: 'Familiar' },
    { id: 'otros', label: 'Otros' },
];

interface CategoryGroup {
    id: Exclude<CategoryId, 'todos'>;
    label: string;
    keywords: string[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
    {
        id: 'pueblos_cultura',
        label: 'Pueblos y Cultura',
        keywords: ['puebl', 'cultura', 'historia', 'históric', 'archit', 'arquitect', 'festival', 'arqueolog', 'museo', 'iglesia', 'mirador'],
    },
    {
        id: 'aventura',
        label: 'Aventura',
        keywords: ['aventura', 'montañ', 'montan', 'senderism', 'deporte'],
    },
    {
        id: 'naturaleza',
        label: 'Naturaleza y Ecoturismo',
        keywords: ['naturaleza', 'ecoturism', 'playa', 'safari', 'bienestar', 'snorkel', 'parque', 'laguna', 'río', 'rio', 'cascada', 'reserva', 'bosque'],
    },
    {
        id: 'familiar',
        label: 'Familiar',
        keywords: ['familiar'],
    },
];

export const getCategoryGroup = (category: string): Exclude<CategoryId, 'todos'> => {
    const normalized = (category || '').toLowerCase();
    for (const group of CATEGORY_GROUPS) {
        if (group.keywords.some((keyword) => normalized.includes(keyword))) {
            return group.id;
        }
    }
    return 'otros';
};

export const getCategoryLabel = (id: CategoryId): string =>
    CATEGORY_OPTIONS.find((option) => option.id === id)?.label ?? 'Otros';

export const CATEGORIES_WITHOUT_TODOS = CATEGORY_OPTIONS.filter(
    (option) => option.id !== 'todos'
);