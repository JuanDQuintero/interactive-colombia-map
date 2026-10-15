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
import CommunityTrips from '../Trips/CommunityTrips';
import RouteReportsPanel from '../User/RouteReportsPanel';
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
    const [activeTab, setActiveTab] = useState<'lugares' | 'comunidad'>('lugares');
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

    const municipalityName =
        selectedMunicipality !== 'all'
            ? municipalities.find(m => m.id === selectedMunicipality)?.name ?? 'el municipio'
            : '';

    const handleItemClick = (attraction: Attraction) => {
        setSelectedAttractionDetail(attraction);
    };

    const toggleVisited = (attractionId: string) => {
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

    const handleToggleVisitedFromDetail = (attractionId: string) => {
        toggleVisited(attractionId);
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
                <div className="flex-shrink-0 px-6 pt-6">
                    <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                            <h2 className="font-display text-xl font-semibold text-ink">{departmentName}</h2>
                            <p className="mt-1 text-sm text-ink-soft">
                                Selecciona los lugares que has visitado
                                {selectedAttractions.length > 0 && (
                                    <span className="tabular-nums text-ink">
                                        {' '}
                                        · {selectedAttractions.length} seleccionados
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="text-ink-faint hover:text-ink transition-colors text-3xl leading-none cursor-pointer"
                        >
                            &times;
                        </button>
                    </div>

                    <nav className="mt-4 flex gap-6 border-b border-rule">
                        <button
                            onClick={() => setActiveTab('lugares')}
                            className={`-mb-px cursor-pointer border-b-2 pb-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                activeTab === 'lugares' ? 'border-ink text-ink' : 'border-transparent text-ink-faint hover:text-ink-soft'
                            }`}
                        >
                            Lugares
                        </button>
                        <button
                            onClick={() => setActiveTab('comunidad')}
                            className={`-mb-px cursor-pointer border-b-2 pb-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                activeTab === 'comunidad' ? 'border-ink text-ink' : 'border-transparent text-ink-faint hover:text-ink-soft'
                            }`}
                        >
                            Comunidad y rutas
                        </button>
                    </nav>
                </div>

                {/* --- FILTROS UNIFICADOS --- */}
                {activeTab === 'lugares' && attractions.length > 0 && (
                    <div className="flex-shrink-0 px-6 pb-4 pt-4 space-y-2.5">
                        {/* Línea 1: búsqueda + municipio */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar atractivo..."
                                    className="field h-10 pl-9 pr-9"
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
                                <div className="w-40 flex-shrink-0 sm:w-44">
                                    <CategorySelect
                                        controlHeight={40}
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
                            nowrap
                        />
                    </div>
                )}

                {/* 2. Contenido Scrollable */}
                <div className="flex-grow overflow-y-auto px-6 py-4">
                    {activeTab === 'comunidad' ? (
                        selectedMunicipality === 'all' ? (
                            <p className="py-10 text-center text-sm text-ink-soft">
                                Elige un municipio en la pestaña Lugares para ver los viajes y los reportes de ruta de la comunidad.
                            </p>
                        ) : user ? (
                            <>
                                <CommunityTrips
                                    user={user}
                                    municipalityId={selectedMunicipality}
                                    municipalityName={municipalityName}
                                    departmentId={departmentId}
                                />
                                <RouteReportsPanel
                                    user={user}
                                    municipalityId={selectedMunicipality}
                                    departmentId={departmentId}
                                    municipalityName={municipalityName}
                                />
                            </>
                        ) : (
                            <p className="py-10 text-center text-sm text-ink-soft">
                                Inicia sesión para ver los viajes y reportes de la comunidad.
                            </p>
                        )
                    ) : filteredAttractions.length > 0 ? (
                        <ul className="space-y-3">
                            {filteredAttractions.map(attraction => {
                                const isVisited = selectedAttractions.includes(attraction.id);
                                const rating = ratingsMap[attraction.id];
                                return (
                                    <li
                                        key={attraction.id}
                                        className={`flex cursor-pointer gap-4 rounded-md border p-4 transition-colors ${
                                            isVisited
                                                ? 'border-forest/40 bg-forest-soft'
                                                : 'border-rule bg-panel hover:bg-paper-deep'
                                        }`}
                                        onClick={() => handleItemClick(attraction)}
                                    >
                                        <img
                                            src={attraction.image}
                                            alt={attraction.name}
                                            className="h-24 w-24 flex-shrink-0 rounded-md bg-paper-deep object-cover sm:h-28 sm:w-28"
                                            onError={(e) => { e.currentTarget.src = IMAGE_FALLBACK; }}
                                        />
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="font-display text-[15px] font-semibold text-ink">
                                                    {attraction.name}
                                                </p>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleVisited(attraction.id);
                                                    }}
                                                    aria-pressed={isVisited}
                                                    className={`flex flex-shrink-0 cursor-pointer items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                                                        isVisited
                                                            ? 'border-forest bg-forest text-paper'
                                                            : 'border-rule bg-panel text-ink-soft hover:border-ink hover:text-ink'
                                                    }`}
                                                >
                                                    {isVisited ? (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                            </svg>
                                                            Visitado
                                                        </>
                                                    ) : (
                                                        '+ Marcar'
                                                    )}
                                                </button>
                                            </div>

                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                                {rating && (
                                                    <span className="flex items-center gap-1">
                                                        <StarRating rating={rating.average} size="sm" />
                                                        <span className="text-xs tabular-nums text-ink-faint">
                                                            {rating.average.toFixed(1)} ({rating.count})
                                                        </span>
                                                    </span>
                                                )}
                                                {attraction.municipalityName && (
                                                    <span className="rounded-full bg-forest-soft px-2 py-0.5 text-[11px] font-semibold text-forest">
                                                        {attraction.municipalityName}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                                                {attraction.description}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="py-10 text-center text-sm text-ink-faint">
                            {searchTerm.trim()
                                ? `No se encontraron atractivos que coincidan con "${searchTerm.trim()}".`
                                : 'No hay atractivos registrados para este departamento.'}
                        </p>
                    )}
                </div>

                {/* 3. Footer fijo */}
                <div className="flex-shrink-0 border-t border-rule p-6 pt-4">
                    {activeTab === 'lugares' ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Button variant="ghost" size="sm" onClick={() => setShowProposalForm(true)}>
                                + Proponer un lugar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setActiveTab('comunidad')}>
                                {selectedMunicipality === 'all'
                                    ? 'Ver comunidad y rutas'
                                    : `Ver comunidad de ${municipalityName}`}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => setActiveTab('lugares')}>
                                Volver a lugares
                            </Button>
                        </div>
                    )}
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