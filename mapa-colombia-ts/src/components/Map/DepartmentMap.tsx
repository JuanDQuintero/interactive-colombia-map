import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

const LABEL_MIN_ZOOM = 2;

type MunicipalityLabel = {
    key: string;
    name: string;
    cx: number;
    cy: number;
    area: number;
};

type Point = [number, number];

const polygonCentroid = (points: Point[]): { x: number; y: number } | null => {
    let a2 = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < points.length; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[(i + 1) % points.length];
        const cross = x0 * y1 - x1 * y0;
        a2 += cross;
        cx += (x0 + x1) * cross;
        cy += (y0 + y1) * cross;
    }
    if (Math.abs(a2) < 1e-9) return null;
    return { x: cx / (3 * a2), y: cy / (3 * a2) };
};

const pointInPolygon = (x: number, y: number, points: Point[]): boolean => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
};

const distanceToPolygon = (x: number, y: number, points: Point[]): number => {
    let min = Infinity;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [x0, y0] = points[j];
        const [x1, y1] = points[i];
        const dx = x1 - x0;
        const dy = y1 - y0;
        const lenSq = dx * dx + dy * dy;
        let t = lenSq === 0 ? 0 : ((x - x0) * dx + (y - y0) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const px = x0 + t * dx - x;
        const py = y0 + t * dy - y;
        const dist = Math.hypot(px, py);
        if (dist < min) min = dist;
    }
    return min;
};

const labelAnchor = (
    points: Point[],
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
): { x: number; y: number } => {
    const centroid = polygonCentroid(points);
    if (centroid && pointInPolygon(centroid.x, centroid.y, points)) return centroid;

    const STEPS = 10;
    let best: { x: number; y: number } | null = null;
    let bestDist = -1;
    for (let i = 0; i < STEPS; i++) {
        for (let j = 0; j < STEPS; j++) {
            const gx = minX + ((maxX - minX) * (i + 0.5)) / STEPS;
            const gy = minY + ((maxY - minY) * (j + 0.5)) / STEPS;
            if (!pointInPolygon(gx, gy, points)) continue;
            const dist = distanceToPolygon(gx, gy, points);
            if (dist > bestDist) {
                bestDist = dist;
                best = { x: gx, y: gy };
            }
        }
    }
    if (best) return best;
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
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
    const [zoomLevel, setZoomLevel] = useState(1);
    const handleZoomChange = useCallback((k: number) => setZoomLevel(k), []);

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

    const { labels: labelCandidates, fontSize: labelFontSize } = useMemo(() => {
        if (!module) return { labels: [] as MunicipalityLabel[], fontSize: 25 };
        const vbParts = module.viewBox.split(/\s+/).map(Number);
        const fontSize = (vbParts[2] || 1000) / 40;
        const labels: MunicipalityLabel[] = [];
        module.municipalities.forEach((municipality, index) => {
            const points: Point[] = [];
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;
            for (const pair of municipality.d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)) {
                const x = Number(pair[1]);
                const y = Number(pair[2]);
                points.push([x, y]);
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
            if (points.length < 3 || maxX - minX < fontSize) return;
            const anchor = labelAnchor(points, minX, minY, maxX, maxY);
            labels.push({
                key: `${municipality.name}-${index}`,
                name: municipality.name,
                cx: anchor.x,
                cy: anchor.y,
                area: (maxX - minX) * (maxY - minY),
            });
        });
        return { labels, fontSize };
    }, [module]);

    const visibleLabels = useMemo(() => {
        if (zoomLevel < LABEL_MIN_ZOOM) return [];
        const height = labelFontSize * 1.2;
        const pad = labelFontSize * 0.35;
        const placed: { x: number; y: number; w: number }[] = [];
        const result: MunicipalityLabel[] = [];
        const sorted = [...labelCandidates].sort((a, b) => b.area - a.area);
        for (const label of sorted) {
            const x = label.cx * zoomLevel;
            const y = label.cy * zoomLevel;
            const w = label.name.length * labelFontSize * 0.55;
            const collides = placed.some(p =>
                Math.abs(p.x - x) < (p.w + w) / 2 + pad &&
                Math.abs(p.y - y) < height + pad
            );
            if (collides) continue;
            placed.push({ x, y, w });
            result.push(label);
        }
        return result;
    }, [labelCandidates, labelFontSize, zoomLevel]);

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
            <MapPanZoom viewBox={module.viewBox} onZoomChange={handleZoomChange}>
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
                {visibleLabels.length > 0 && (
                    <g aria-hidden="true" pointerEvents="none">
                        {visibleLabels.map(label => (
                            <g key={label.key} transform={`translate(${label.cx} ${label.cy}) scale(${1 / zoomLevel})`}>
                                <text
                                    className="municipality-label"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={labelFontSize}
                                >
                                    {label.name}
                                </text>
                            </g>
                        ))}
                    </g>
                )}
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