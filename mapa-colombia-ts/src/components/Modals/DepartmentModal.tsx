import type { User } from 'firebase/auth';
import React, { useEffect, useMemo, useState } from 'react';
import { useAttractionsData } from '../../context/AttractionsContext';
import { getMunicipalitiesForDepartment } from '../../data/municipalitiesData';
import { useAttractionsByMunicipality } from '../../hooks/useAttractionsByMunicipality';
import { useDepartmentRatings } from '../../hooks/useDepartmentRatings';
import type { Attraction } from '../../interfaces/attraction';
import { getCategoryGroup, type CategoryId } from '../../utils/categories';
import { IMAGE_FALLBACK } from '../../utils/imageFallback';
import CategoryFilter from '../Filters/CategoryFilter';
import StarRating from '../Reviews/StarRating';
import Button from '../UI/Button';
import CategorySelect from '../UI/CategorySelect';
import Loader from '../UI/Loader';
import AttractionDetailModal from './AttractionDetailModal';
import ProposeAttractionForm from './ProposeAttractionForm';
import { useToast } from '../UI/Toast';

interface DepartmentModalProps {
    departmentId: string;
    departmentName: string;
    visitedInDept: string[];
    onClose: () => void;
    saveDepartmentAttractions: (departmentId: string, selectedAttractions: string[]) => void;
    user: User | null;
    isAdmin?: boolean;
    initialMunicipalityId?: string | null;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
    departmentId,
    departmentName,
    visitedInDept,
    onClose,
    saveDepartmentAttractions,
    user,
    isAdmin,
    initialMunicipalityId,
}) => {
    const [selectedAttractions, setSelectedAttractions] = useState<string[]>(visitedInDept);
    const [showProposalForm, setShowProposalForm] = useState(false);
    const [selectedAttractionDetail, setSelectedAttractionDetail] = useState<Attraction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterCategory, setSelectedFilterCategory] = useState<CategoryId>('todos');
    const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
    const { data: attractionsByDept, loading } = useAttractionsData();
    const { showToast } = useToast();

    // Get municipalities for this department
    const municipalities = useMemo(
        () => getMunicipalitiesForDepartment(departmentId),
        [departmentId]
    );

    // Cuando se abre el modal haciendo clic en un municipio, ese municipio queda fijo.
    const isMunicipalityLocked = Boolean(
        initialMunicipalityId && municipalities.some(m => m.id === initialMunicipalityId)
    );

    useEffect(() => {
        if (initialMunicipalityId && municipalities.some(m => m.id === initialMunicipalityId)) {
            setSelectedMunicipality(initialMunicipalityId);
        } else {
            setSelectedMunicipality('all');
        }
    }, [departmentId, initialMunicipalityId, municipalities]);

    // Solo los atractivos del departamento actual
    const attractions = useMemo(
        () => attractionsByDept[departmentId] || [],
        [attractionsByDept, departmentId]
    );

    // Apply municipality filter to department attractions
    const municipalityFilteredAttractions = useAttractionsByMunicipality(
        attractions,
        selectedMunicipality
    );

    // IDs de los atractivos para obtener ratings
    const attractionIds = useMemo(() => municipalityFilteredAttractions.map(a => a.id), [municipalityFilteredAttractions]);
    const ratingsMap = useDepartmentRatings(attractionIds);

    // Filtrar atractivos por tipo de categoría y búsqueda
    const filteredAttractions = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return municipalityFilteredAttractions.filter(attraction => {
            const matchesSearch = !query ||
                attraction.name.toLowerCase().includes(query) ||
                attraction.description.toLowerCase().includes(query);
            const matchesCategory = selectedFilterCategory === 'todos' ||
                getCategoryGroup(attraction.category) === selectedFilterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [municipalityFilteredAttractions, searchTerm, selectedFilterCategory]);

// Conteo total por categoría
    const categoryCounts = useMemo(() => {
        const counts: Partial<Record<CategoryId, number>> = {};
        municipalityFilteredAttractions.forEach(attraction => {
            const category = getCategoryGroup(attraction.category);
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }, [municipalityFilteredAttractions]);

    const handleItemClick = (attraction: Attraction) => {
        setSelectedAttractionDetail(attraction);
    };

    const handleToggleVisitedFromDetail = (attractionId: string) => {
        const willBeVisited = !selectedAttractions.includes(attractionId);
        const next = willBeVisited
            ? [...selectedAttractions, attractionId]
            : selectedAttractions.filter((id) => id !== attractionId);
        setSelectedAttractions(next);
        saveDepartmentAttractions(departmentId, next);
        showToast(
            willBeVisited ? 'Marcado como visitado' : 'Se quitó de visitados',
            'success'
        );
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
            <div className="modal-card w-full max-w-2xl m-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

                {/* --- HEADER --- */}
                <div className="flex-shrink-0 p-6 pb-4">
                    <div className="flex justify-between items-start">
                        <h2 className="font-display text-xl font-semibold text-ink">{departmentName}</h2>
                        <button onClick={onClose} className="text-ink-faint hover:text-ink transition-colors text-3xl leading-none cursor-pointer">&times;</button>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">Selecciona los lugares que has visitado.</p>
                </div>

                {/* --- FILTROS UNIFICADOS --- */}
                {attractions.length > 0 && (
                    <div className="flex-shrink-0 px-6 pb-4 space-y-2">
                        {/* Línea 1: búsqueda + municipio */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar atractivo..."
                                    className="field pl-9 pr-9"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink cursor-pointer"
                                        aria-label="Limpiar búsqueda"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                            {municipalities.length > 0 && (
                                <div className="w-44 flex-shrink-0">
                                    <CategorySelect
                                        options={
                                            isMunicipalityLocked && initialMunicipalityId
                                                ? municipalities
                                                    .filter(m => m.id === initialMunicipalityId)
                                                    .map(m => ({ value: m.id, label: m.name }))
                                                : [
                                                    { value: 'all', label: 'Todos' },
                                                    ...municipalities.map(m => ({ value: m.id, label: m.name }))
                                                ]
                                        }
                                        value={
                                            selectedMunicipality === 'all'
                                                ? { value: 'all', label: 'Todos' }
                                                : municipalities
                                                    .filter(m => m.id === selectedMunicipality)
                                                    .map(m => ({ value: m.id, label: m.name }))[0] || null
                                        }
                                        onChange={(option) => setSelectedMunicipality(option?.value || 'all')}
                                        placeholder="Municipio"
                                        isSearchable
                                        disabled={isMunicipalityLocked}
                                    />
                                </div>
                            )}
                        </div>
                        {/* Línea 2: chips de categoría con scroll lateral */}
                        <CategoryFilter
                            selected={selectedFilterCategory}
                            onChange={setSelectedFilterCategory}
                            counts={categoryCounts}
                            nowrap
                        />
                    </div>
                )}

                {/* 2. Contenido Scrollable con listado plano de tarjetas */}
                <div className="flex-grow overflow-y-auto px-6 py-4">
                    {filteredAttractions.length > 0 ? (
                        <ul className="space-y-4">
                            {filteredAttractions.map(attraction => {
                                const isVisited = selectedAttractions.includes(attraction.id);
                                return (
                                    <li
                                        key={attraction.id}
                                        className={`flex items-start gap-4 p-4 rounded-md transition-all duration-200 cursor-pointer border hover:shadow-md ${isVisited ? 'bg-forest-soft border-forest/40' : 'bg-panel border-rule hover:bg-paper-deep'}`}
                                        onClick={() => handleItemClick(attraction)}
                                    >
                                        <img
                                            src={attraction.image}
                                            alt={attraction.name}
                                            className="w-28 h-28 rounded-md object-cover flex-shrink-0 bg-paper-deep"
                                            onError={(e) => { e.currentTarget.src = IMAGE_FALLBACK; }}
                                        />
                                        <div className="flex-grow pt-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-display text-[15px] font-semibold text-ink">
                                                    {attraction.name}
                                                </p>
                                                {attraction.municipalityName && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-soft text-forest">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.417.621-.36 1.462-.87 2.388-1.533a8.6 8.6 0 002.066-1.947 3.96 3.96 0 00.9-1.66 2.21 2.21 0 00-.028-1.02 4.35 4.35 0 00-.72-1.22A7.2 7.2 0 0013.573 9.8c.26.4.422.945.422 1.53a3.995 3.995 0 01-4 4c-.088 0-.174-.008-.26-.019a3.06 3.06 0 00-.082-.004l-.006.004c-.09.01-.177.02-.264.02a3.995 3.995 0 01-3.998-4 1.6 1.6 0 00.42-1.528A7.2 7.2 0 005.42 9.8a4.35 4.35 0 00.712 1.002 3.96 3.96 0 002.07 1.948 8.6 8.6 0 007.65 0c.311.081.57.179.757.417a5.7 5.7 0 01.281.14l.018.008.006.003zM10 8a2 2 0 01-2-2c0-.734.397-1.376.992-1.723L9 4a6 6 0 112 0l-.008.277A2 2 0 0110 8zM3.977 9.7l.146.006-.146-.006zm11.047 0l.145.006-.145-.006z" clipRule="evenodd" />
                                                        </svg>
                                                        {attraction.municipalityName}
                                                    </span>
                                                )}
                                            </div>
                                            {ratingsMap[attraction.id] && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <StarRating rating={ratingsMap[attraction.id].average} size="sm" />
                                                    <span className="text-xs text-ink-faint tabular-nums">
                                                        {ratingsMap[attraction.id].average.toFixed(1)} ({ratingsMap[attraction.id].count})
                                                    </span>
                                                </div>
                                            )}
                                            <p className="mt-2 text-sm text-ink-soft line-clamp-2">
                                                {attraction.description}
                                            </p>
                                            <span className="inline-flex items-center gap-1 mt-2 text-xs text-clay">
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
                    ) : (
                        <p className="text-ink-faint text-sm text-center py-8">
                            {searchTerm.trim()
                                ? `No se encontraron atractivos que coincidan con "${searchTerm.trim()}".`
                                : 'No hay atractivos registrados para este departamento.'}
                        </p>
                    )}
                </div>

                {/* 3. Footer fijo */}
                <div className="flex-shrink-0 p-6 pt-4 border-t border-rule flex justify-between items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setShowProposalForm(true)}>
                        + Proponer un lugar
                    </Button>
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