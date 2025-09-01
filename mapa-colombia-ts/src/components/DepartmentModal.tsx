import React, { useMemo, useState } from 'react';
import { useAttractionsData } from '../hooks/useAttractionsData';
import type { Attraction } from '../interfaces/attraction';
import ProposeAttractionForm from './ProposeAttractionForm';
import Button from './UI/Button';
import Loader from './UI/Loader';

interface DepartmentModalProps {
    departmentId: string;
    departmentName: string;
    visitedInDept: string[];
    onClose: () => void;
    saveDepartmentAttractions: (departmentId: string, selectedAttractions: string[]) => Promise<void>;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
    departmentId,
    departmentName,
    visitedInDept,
    onClose,
    saveDepartmentAttractions,
}) => {
    const [selectedAttractions, setSelectedAttractions] = useState<string[]>(visitedInDept);
    const [loadingData, setLoadingData] = useState(false);
    const [showProposalForm, setShowProposalForm] = useState(false);
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
        setLoadingData(true);
        await saveDepartmentAttractions(departmentId, selectedAttractions);
        setLoadingData(false);
        onClose();
    };

    // Añade este bloque dentro de tu componente, después de los useState
    const hasChanges = useMemo(() => {
        // Para comparar los arrays, los ordenamos y convertimos a string.
        // Es la forma más sencilla de ver si tienen los mismos elementos sin importar el orden.
        const sortedCurrent = [...selectedAttractions].sort();
        const sortedOriginal = [...visitedInDept].sort();

        // Si los strings son diferentes, significa que hubo un cambio.
        return sortedCurrent.toString() !== sortedOriginal.toString();
    }, [selectedAttractions, visitedInDept]);

    if (loading || loadingData) {
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
                    <div className="flex justify-between items-center mt-4">
                        <p className='text-gray-800 dark:text-gray-100'>Selecciona los lugares que visitaste y confirma para guardar.</p>
                        <Button
                            onClick={() => setShowProposalForm(true)}
                            variant='secondary'
                        >
                            Proponer lugar
                        </Button>
                    </div>
                </div>

                {/* 2. Contenido Scrollable: Nuevo 'div' con 'flex-grow' y 'overflow-y-auto' */}
                <div className="flex-grow overflow-y-auto px-6 py-4">
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
                </div>

                <div className="flex-shrink-0 mt-auto p-6 pt-4 bg-white dark:bg-gray-700 dark:border-gray-600 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={!hasChanges}
                        className={`px-4 py-2 bg-emerald-600 text-white rounded-lg transition-colors ${hasChanges
                            ? 'hover:bg-emerald-700 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                            }`}
                    >
                        Guardar selección
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
        </div>
    );
};

export default DepartmentModal;