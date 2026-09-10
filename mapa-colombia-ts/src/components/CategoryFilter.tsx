import React from 'react';
import { CATEGORY_OPTIONS, type CategoryId } from '../utils/categories';

interface CategoryFilterProps {
    selected: CategoryId;
    onChange: (category: CategoryId) => void;
    counts?: Partial<Record<CategoryId, number>>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onChange, counts }) => {
    const options = CATEGORY_OPTIONS.filter(option => {
        if (option.id === 'todos') return true;
        if (!counts) return true;
        return (counts[option.id] || 0) > 0;
    });

    return (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
            {options.map((option) => {
                const isActive = selected === option.id;
                const count = counts?.[option.id] || 0;
                return (
                    <button
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border inline-flex items-center gap-1.5 ${
                            isActive
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                        }`}
                    >
                        {option.label}
                        {counts && option.id !== 'todos' && (
                            <span
                                className={`px-1.5 rounded-full text-[10px] font-bold leading-4 ${
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-emerald-600 text-white'
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