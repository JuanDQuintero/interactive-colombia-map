// src/components/DepartmentModal.tsx

import React from 'react';
import { attractionsData, type Attraction } from '../data/attractionsData';

interface DepartmentModalProps {
    departmentId: string;
    departmentName: string;
    visitedInDept: string[];
    onClose: () => void;
    onAttractionToggle: (departmentId: string, attractionId: string) => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ departmentId, departmentName, visitedInDept, onClose, onAttractionToggle }) => {
    const attractions = attractionsData[departmentId] || [];

    // --- LÓGICA DE AGRUPACIÓN ---
    // Usamos 'reduce' para crear un objeto donde cada clave es una categoría
    // y su valor es un array de los atractivos de esa categoría.
    const groupedAttractions = attractions.reduce((acc, attraction) => {
        const category = attraction.category || 'Otros'; // Categoría de respaldo
        if (!acc[category]) {
            acc[category] = []; // Si la categoría no existe en el acumulador, la creamos
        }
        acc[category].push(attraction);
        return acc;
    }, {} as Record<string, Attraction[]>); // El tipo del objeto acumulador

    const handleItemClick = (attractionId: string) => {
        onAttractionToggle(departmentId, attractionId);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{departmentName}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>

                {Object.keys(groupedAttractions).length > 0 ? (
                    // --- RENDERIZADO POR GRUPOS ---
                    // Iteramos sobre las categorías del objeto que creamos
                    Object.entries(groupedAttractions).map(([category, attractionsInCategory]) => (
                        <div key={category} className="mb-8">
                            {/* Título de la categoría */}
                            <h3 className="text-xl font-semibold mb-4 text-gray-700 pb-2">{category}</h3>
                            <ul className="space-y-4">
                                {/* Iteramos sobre los atractivos de esa categoría */}
                                {attractionsInCategory.map(attraction => {
                                    const isVisited = visitedInDept.includes(attraction.id);
                                    return (
                                        <li
                                            key={attraction.id}
                                            className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-200 cursor-pointer border  ${isVisited ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                                            onClick={() => handleItemClick(attraction.id)}
                                        >
                                            <img
                                                src={attraction.image}
                                                alt={attraction.name}
                                                className="w-32 h-32 object-cover rounded-md flex-shrink-0 bg-gray-200"
                                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/128x128/cccccc/ffffff?text=Error'; }}
                                            />
                                            <div className="flex-grow pt-1">
                                                <p className={`text-lg font-semibold text-gray-800`}>
                                                    {attraction.name}
                                                </p>
                                                <p className="mt-2 text-sm text-gray-600">
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
                    <p className="text-gray-500 text-center py-8">No hay atractivos registrados para este departamento.</p>
                )}
            </div>
        </div>
    );
};

export default DepartmentModal;