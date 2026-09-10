import React, { useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { useAttractionsData } from '../context/AttractionsContext';
import { useDepartmentRatings } from '../hooks/useDepartmentRatings';
import type { Attraction } from '../interfaces/attraction';
import { CATEGORIES_WITHOUT_TODOS, getCategoryGroup, getCategoryLabel, type CategoryId } from '../utils/categories';
import AttractionDetailModal from './AttractionDetailModal';
import CategoryFilter from './CategoryFilter';
import ProposeAttractionForm from './ProposeAttractionForm';
import StarRating from './StarRating';
import Button from './UI/Button';
import Loader from './UI/Loader';

interface DepartmentModalProps {
    departmentId: string;
    departmentName: string;
    visitedInDept: string[];
    onClose: () => void;
    saveDepartmentAttractions: (departmentId: string, selectedAttractions: string[]) => void;
    user: User | null;
    isAdmin?: boolean;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
    departmentId,
    departmentName,
    visitedInDept,
    onClose,
    saveDepartmentAttractions,
    user,
    isAdmin,
}) => {
    const [selectedAttractions, setSelectedAttractions] = useState<string[]>(visitedInDept);
    const [showProposalForm, setShowProposalForm] = useState(false);
    const [selectedAttractionDetail, setSelectedAttractionDetail] = useState<Attraction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterCategory, setSelectedFilterCategory] = useState<CategoryId>('todos');
    const { data: attractionsByDept, loading } = useAttractionsData();

    // Solo los atractivos del departamento actual
    const attractions = useMemo(
        () => attractionsByDept[departmentId] || [],
        [attractionsByDept, departmentId]
    );

    // IDs de los atractivos para obtener ratings
    const attractionIds = useMemo(() => attractions.map(a => a.id), [attractions]);
    const ratingsMap = useDepartmentRatings(attractionIds);

    // Filtrar atractivos por tipo de categoría y búsqueda
    const filteredAttractions = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return attractions.filter(attraction => {
            const matchesSearch = !query ||
                attraction.name.toLowerCase().includes(query) ||
                attraction.description.toLowerCase().includes(query);
            const matchesCategory = selectedFilterCategory === 'todos' ||
                getCategoryGroup(attraction.category) === selectedFilterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [attractions, searchTerm, selectedFilterCategory]);

    // Agrupar por grupos canónicos de categoría
    const groupedAttractions = useMemo(() => {
        return filteredAttractions.reduce((acc, attraction) => {
            const category = getCategoryGroup(attraction.category);
            if (!acc[category]) acc[category] = [];
            acc[category].push(attraction);
            return acc;
        }, {} as Record<CategoryId, Attraction[]>);
    }, [filteredAttractions]);

    // Conteo total por categoría
    const categoryCounts = useMemo(() => {
        const counts: Partial<Record<CategoryId, number>> = {};
        attractions.forEach(attraction => {
            const category = getCategoryGroup(attraction.category);
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }, [attractions]);

    // Categorías en orden canónico que tienen al menos un atractivo visible
    const visibleCategories = useMemo(
        () => CATEGORIES_WITHOUT_TODOS.filter(category => (groupedAttractions[category.id]?.length || 0) > 0),
        [groupedAttractions]
    );

    const handleItemClick = (attraction: Attraction) => {
        setSelectedAttractionDetail(attraction);
    };

    const handleToggleVisitedFromDetail = (attractionId: string) => {
        setSelectedAttractions((prev) => {
            const next = prev.includes(attractionId)
                ? prev.filter((id) => id !== attractionId)
                : [...prev, attractionId];
            saveDepartmentAttractions(departmentId, next);
            return next;
        });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                <Loader />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            {/* 1. Contenedor principal: Añade 'flex flex-col' y quita 'overflow-y-auto' */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

                {/* --- HEADER (No cambia) --- */}
                <div className="flex-shrink-0 p-6 pb-2">
                    <div className="flex justify-between items-center dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{departmentName}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-3xl leading-none cursor-pointer">&times;</button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
                        <p className='text-gray-800 dark:text-gray-100 sm:mr-4'>Selecciona los lugares que visitaste y confirma para guardar.</p>
                        <Button
                            onClick={() => setShowProposalForm(true)}
                            variant='secondary'
                            size="sm"
                            className="self-start sm:self-auto"
                        >
                            Proponer lugar
                        </Button>
                    </div>
                    {attractions.length > 0 && (
                        <div className="mt-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar atractivo..."
                                    className="w-full p-2.5 pl-9 pr-9 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                        aria-label="Limpiar búsqueda"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <CategoryFilter
                                    selected={selectedFilterCategory}
                                    onChange={setSelectedFilterCategory}
                                    counts={categoryCounts}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Contenido Scrollable: Nuevo 'div' con 'flex-grow' y 'overflow-y-auto' */}
                <div className="flex-grow overflow-y-auto px-6 py-4">
                    {visibleCategories.length > 0 ? (
                        visibleCategories.map(category => {
                            const attractionsInCategory = groupedAttractions[category.id] || [];
                            return (
                                <div key={category.id} className="mb-8">
                                    <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 pb-2">
                                        {getCategoryLabel(category.id)}
                                        <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs font-bold">
                                            {attractionsInCategory.length}
                                        </span>
                                    </h3>
                                    <ul className="space-y-4">
                                        {attractionsInCategory.map(attraction => {
                                            const isVisited = selectedAttractions.includes(attraction.id);
                                            return (
                                                <li
                                                    key={attraction.id}
                                                    className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer border hover:shadow-md ${isVisited ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/50 dark:border-emerald-700' : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'}`}
                                                    onClick={() => handleItemClick(attraction)}
                                                >
                                                    <img
                                                        src={attraction.image}
                                                        alt={attraction.name}
                                                        className="w-32 h-32 object-cover rounded-md flex-shrink-0 bg-gray-200 dark:bg-gray-600"
                                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/128x128/cccccc/ffffff?text=Error'; }}
                                                    />
                                                    <div className="flex-grow pt-1">
                                                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                                            {attraction.name}
                                                        </p>
                                                        {ratingsMap[attraction.id] && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <StarRating rating={ratingsMap[attraction.id].average} size="sm" />
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {ratingsMap[attraction.id].average.toFixed(1)} ({ratingsMap[attraction.id].count})
                                                                </span>
                                                            </div>
                                                        )}
                                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                            {attraction.description}
                                                        </p>
                                                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                                            Ver detalles
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            {searchTerm.trim()
                                ? `No se encontraron atractivos que coincidan con "${searchTerm.trim()}".`
                                : 'No hay atractivos registrados para este departamento.'}
                        </p>
                    )}
                </div>

                <div className="flex-shrink-0 mt-auto p-6 pt-4 bg-white dark:bg-gray-700 dark:border-gray-600 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>

                {/* --- MODAL DE PROPUESTA (No cambia) --- */}
                {showProposalForm && (
                    <ProposeAttractionForm
                        departmentId={departmentId}
                        onClose={() => setShowProposalForm(false)}
                    />
                )}
            </div>

            {/* --- MODAL DE DETALLE DEL ATRACTIVO --- */}
            {selectedAttractionDetail && (
                <AttractionDetailModal
                    attraction={selectedAttractionDetail}
                    isVisited={selectedAttractions.includes(selectedAttractionDetail.id)}
                    onToggleVisited={handleToggleVisitedFromDetail}
                    onClose={() => setSelectedAttractionDetail(null)}
                    user={user}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
};

export default DepartmentModal;