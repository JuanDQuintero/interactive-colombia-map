import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAttractionsData } from '../../context/AttractionsContext';
import type { MunicipalityModule, MunicipalityPath } from '../../data/municipalityPathTypes';
import { loadMunicipalityModule } from '../../utils/municipalityLoader';
import MapPanZoom from './MapPanZoom';

interface DepartmentMapProps {
    departmentId: string;
    departmentName: string;
    visitedAttractions: Record<string, string[]>;
    onMunicipalityClick: (municipalityId: string) => void;
    onBack: () => void;
    onShowAttractions: () => void;
    onHover: (content: string | null, event?: MouseEvent) => void;
}

type MunicipalityVisit = {
    municipality: MunicipalityPath;
    total: number;
    visited: number;
};

const DepartmentMap: React.FC<DepartmentMapProps> = ({
    departmentId,
    departmentName,
    visitedAttractions,
    onMunicipalityClick,
    onBack,
    onShowAttractions,
    onHover,
}) => {
    const { data: attractionsByDept } = useAttractionsData();
    const [module, setModule] = useState<MunicipalityModule | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setModule(null);
        loadMunicipalityModule(departmentId)
            .then((loaded) => {
                if (!cancelled) {
                    setModule(loaded);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [departmentId]);

    // Visit counts per municipality to drive all / partial / none coloring.
    const visitsByMunicipality = useMemo(() => {
        const visitedSet = new Set<string>(visitedAttractions[departmentId] || []);
        const count = new Map<string, { total: number; visited: number }>();
        (attractionsByDept[departmentId] || []).forEach(attraction => {
            if (!attraction.municipalityId) return;
            const entry = count.get(attraction.municipalityId) || { total: 0, visited: 0 };
            entry.total += 1;
            if (visitedSet.has(attraction.id)) entry.visited += 1;
            count.set(attraction.municipalityId, entry);
        });
        return count;
    }, [attractionsByDept, departmentId, visitedAttractions]);

    const matchedCount = useMemo(
        () => module?.municipalities.filter(m => m.id !== null).length ?? 0,
        [module]
    );

    const municipalityVisits: MunicipalityVisit[] = useMemo(() => {
        if (!module) return [];
        return module.municipalities.map(municipality => {
            const counts = municipality.id ? visitsByMunicipality.get(municipality.id) : undefined;
            return {
                municipality,
                total: counts?.total ?? 0,
                visited: counts?.visited ?? 0,
            };
        });
    }, [module, visitsByMunicipality]);

    const classNameFor = (visit: MunicipalityVisit): string => {
        const { municipality, total, visited } = visit;
        if (municipality.id === null) return 'municipality unmatched';
        if (total > 0 && visited === total) return 'municipality visited';
        if (visited > 0) return 'municipality partial';
        return 'municipality';
    };

    const statusLabel = (visit: MunicipalityVisit): string => {
        const { municipality, total, visited } = visit;
        if (municipality.id === null) return '';
        if (total > 0 && visited === total) return ' (completado)';
        if (visited > 0) return ' (parcial)';
        return ' (sin visitar)';
    };

    const handleMouseMove = (visit: MunicipalityVisit, event: MouseEvent) => {
        onHover(`${visit.municipality.name}${statusLabel(visit)}`, event);
    };

    if (loading) {
        return <div className="flex justify-center items-center py-24"><LoaderInline /></div>;
    }

    if (!module) {
        return (
            <div className="flex flex-col justify-center items-center py-24 gap-4">
                <p className="text-ink-soft">No hay datos municipales para este departamento.</p>
                <button
                    onClick={onShowAttractions}
                    className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-paper hover:brightness-110"
                >
                    Ver lista de atractivos
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4 gap-2">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink hover:text-clay transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mapa nacional
                </button>
                <div className="text-center">
                    <p className="font-display text-xl font-semibold text-ink">{departmentName}</p>
                    <p className="micro mt-1">
                        {matchedCount} municipios registrados
                    </p>
                </div>
                <button
                    onClick={onShowAttractions}
                    className="inline-flex items-center gap-1 rounded-md border border-rule bg-panel px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink hover:bg-paper-deep transition-colors"
                >
                    Ver lista
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Map */}
            <MapPanZoom viewBox={module.viewBox}>
                <g id="municipalities">
                        {municipalityVisits.map((visit, index) => {
                            const clickable = visit.municipality.id !== null;
                            const mId = visit.municipality.id;
                            return (
                                <path
                                    key={`${departmentId}-${visit.municipality.name}-${index}`}
                                    name={visit.municipality.name}
                                    className={classNameFor(visit)}
                                    d={visit.municipality.d}
                                    onClick={clickable && mId !== null
                                        ? () => onMunicipalityClick(mId)
                                        : undefined}
                                    onMouseMove={(event) => handleMouseMove(visit, event)}
                                    onMouseLeave={() => onHover(null)}
                                    role={clickable ? 'button' : undefined}
                                    tabIndex={clickable ? 0 : undefined}
                                    onKeyDown={clickable && mId !== null
                                        ? (event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                onMunicipalityClick(mId);
                                            }
                                        }
                                        : undefined}
                                />
                            );
                        })}
                    </g>
            </MapPanZoom>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-rule-soft pt-3 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-[2px] ring-1 ring-inset ring-black/10 bg-[var(--map-visit)]"></span> Completado
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-[2px] ring-1 ring-inset ring-black/10 bg-[var(--map-part)]"></span> Parcial
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-[2px] ring-1 ring-inset ring-black/10 bg-[var(--map-base)]"></span> Sin visitar
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-[2px] ring-1 ring-inset ring-black/10 bg-[var(--map-unmatched)]"></span> Sin datos
                </span>
            </div>
        </div>
    );
};

const LoaderInline: React.FC = () => (
    <div className="text-ink-soft flex items-center gap-2">
        <span className="inline-block w-4 h-4 border-2 border-forest border-t-transparent rounded-full animate-spin"></span>
        Cargando municipios…
    </div>
);

export default DepartmentMap;