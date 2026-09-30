import React from 'react';
import { CATEGORY_OPTIONS, type CategoryId } from '../../utils/categories';

interface CategoryFilterProps {
    selected: CategoryId;
    onChange: (category: CategoryId) => void;
    counts?: Partial<Record<CategoryId, number>>;
    nowrap?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onChange, counts, nowrap = false }) => {
    const options = CATEGORY_OPTIONS.filter(option => {
        if (option.id === 'todos') return true;
        if (!counts) return true;
        return (counts[option.id] || 0) > 0;
    });

    return (
        <div className={`flex gap-2 ${nowrap ? 'flex-nowrap overflow-x-auto pb-1 -mb-1' : 'flex-wrap'}`} role="group" aria-label="Filtrar por categoría">
            {options.map((option) => {
                const isActive = selected === option.id;
                const count = counts?.[option.id] || 0;
                return (
                    <button
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border inline-flex items-center gap-1.5 ${isActive
                                ? 'border-ink bg-ink text-paper shadow-sm'
                                : 'border-rule bg-panel text-ink-soft hover:bg-paper-deep'
                            }`}
                    >
                        {option.label}
                        {counts && option.id !== 'todos' && (
                            <span
                                className={`px-1.5 rounded-full text-[10px] font-bold leading-4 ${isActive
                                        ? 'bg-paper/20 text-paper'
                                        : 'bg-forest-soft text-forest'
                                    }`}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryFilter;