import React, { useMemo, useState } from 'react';
import { type Attraction } from '../data/attractionsData';
import { useAttractionsData } from '../hooks/useAttractionsData';
import Loader from './UI/Loader';

interface DepartmentModalProps {
    departmentId: string;
    departmentName: string;
    visitedInDept: string[];
    onClose: () => void;
    saveDepartmentAttractions: (departmentId: string, selectedAttractions: string[]) => Promise<void>
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
    departmentId,
    departmentName,
    visitedInDept,
    onClose,
    saveDepartmentAttractions
}) => {
    const [selectedAttractions, setSelectedAttractions] = useState<string[]>(visitedInDept);

    const { data: attractionsByDept, loading } = useAttractionsData();

    // Solo los atractivos del departamento actual
    const attractions = useMemo(
        () => attractionsByDept[departmentId] || [],
        [attractionsByDept, departmentId]
    );

    // Agrupar por categoría
    const groupedAttractions = useMemo(() => {
        return attractions.reduce((acc, attraction) => {
            const category = attraction.category || 'Otros';
            if (!acc[category]) acc[category] = [];
            acc[category].push(attraction);
            return acc;
        }, {} as Record<string, Attraction[]>);
    }, [attractions]);

    const handleItemClick = (attractionId: string) => {
        setSelectedAttractions((prev) =>
            prev.includes(attractionId)
                ? prev.filter((id) => id !== attractionId)
                : [...prev, attractionId]
        );
    };

    const handleAccept = async () => {
        await saveDepartmentAttractions(departmentId, selectedAttractions);
        onClose();
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
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center dark:border-gray-700 pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{departmentName}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-3xl leading-none cursor-pointer">&times;</button>
                </div>
                <p className='text-gray-800 dark:text-gray-100 mb-4'>Selecciona los lugares que visitaste y confirma para guardar.</p>
                {Object.keys(groupedAttractions).length > 0 ? (
                    Object.entries(groupedAttractions).map(([category, attractionsInCategory]) => (
                        <div key={category} className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 pb-2">{category}</h3>
                            <ul className="space-y-4">
                                {attractionsInCategory.map(attraction => {
                                    const isVisited = selectedAttractions.includes(attraction.id);
                                    return (
                                        <li
                                            key={attraction.id}
                                            className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer border ${isVisited ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/50 dark:border-emerald-700' : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'}`}
                                            onClick={() => handleItemClick(attraction.id)}
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
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                    {attraction.description}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay atractivos registrados para este departamento.</p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                    >
                        Guardar selección
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepartmentModal;