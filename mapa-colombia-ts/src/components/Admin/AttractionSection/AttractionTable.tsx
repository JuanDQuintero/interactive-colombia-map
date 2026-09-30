import { ArrowDownIcon, ArrowUpIcon, ArrowsUpDownIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { departmentsData } from '../../../data/colombiaMapData';
import type { FirestoreAttraction } from '../../../interfaces/attraction';
import { IMAGE_FALLBACK } from '../../../utils/imageFallback';

export type AttractionSortKey = 'name' | 'region' | 'category' | 'origin';

interface AttractionTableProps {
    attractions: FirestoreAttraction[];
    selectedIds: string[];
    sortKey: AttractionSortKey | null;
    sortDirection: 'asc' | 'desc';
    onSortChange: (key: AttractionSortKey) => void;
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onView: (attraction: FirestoreAttraction) => void;
    onEdit: (attraction: FirestoreAttraction) => void;
    onDelete: (attraction: FirestoreAttraction) => void;
}

const Thumb: React.FC<{ attraction: FirestoreAttraction }> = ({ attraction }) => {
    const [error, setError] = useState(false);

    return error ? (
        <div className="h-10 w-10 rounded-md bg-paper-deep flex items-center justify-center overflow-hidden">
            <img src={IMAGE_FALLBACK} alt={attraction.name} className="h-full w-full object-cover" />
        </div>
    ) : (
        <img
            src={attraction.image}
            alt={attraction.name}
            loading="lazy"
            onError={() => setError(true)}
            className="h-10 w-10 rounded-md object-cover bg-paper-deep"
        />
    );
};

const originLabel = (attraction: FirestoreAttraction): string =>
    attraction.isUserProposal ? 'Sugerido por usuario' : 'Oficial';

const locationLabel = (attraction: FirestoreAttraction): string => {
    const dept = departmentsData[attraction.regionId]?.name || attraction.regionId;
    return attraction.municipalityName ? `${dept} · ${attraction.municipalityName}` : dept;
};

const SortHeader: React.FC<{
    label: string;
    active: boolean;
    direction: 'asc' | 'desc';
    onClick: () => void;
}> = ({ label, active, direction, onClick }) => (
    <th className="px-4 py-3 text-left micro">
        <button
            onClick={onClick}
            className="inline-flex items-center gap-1 hover:text-clay transition-colors"
        >
            {label}
            {active ? (
                direction === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
            ) : (
                <ArrowsUpDownIcon className="w-3 h-3 opacity-40" />
            )}
        </button>
    </th>
);

const AttractionTable: React.FC<AttractionTableProps> = ({
    attractions,
    selectedIds,
    sortKey,
    sortDirection,
    onSortChange,
    onToggleSelect,
    onToggleSelectAll,
    onView,
    onEdit,
    onDelete,
}) => {
    const allSelected = attractions.length > 0 && attractions.every((a) => selectedIds.includes(a.firestoreId));
    const someSelected = selectedIds.filter((id) => attractions.some((a) => a.firestoreId === id)).length > 0;

    return (
        <div className="panel overflow-x-auto">
            <table className="min-w-full divide-y divide-rule-soft">
                <thead className="bg-paper-deep">
                    <tr>
                        <th className="w-10 px-4 py-3">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                ref={(el) => {
                                    if (el) el.indeterminate = someSelected && !allSelected;
                                }}
                                onChange={onToggleSelectAll}
                                aria-label="Seleccionar todos"
                                className="h-4 w-4 rounded border-rule accent-forest focus:ring-forest cursor-pointer"
                            />
                        </th>
                        <th className="px-4 py-3 text-left micro">
                            Imagen
                        </th>
                        <SortHeader
                            label="Nombre"
                            active={sortKey === 'name'}
                            direction={sortDirection}
                            onClick={() => onSortChange('name')}
                        />
                        <SortHeader
                            label="Ubicación"
                            active={sortKey === 'region'}
                            direction={sortDirection}
                            onClick={() => onSortChange('region')}
                        />
                        <SortHeader
                            label="Categoría"
                            active={sortKey === 'category'}
                            direction={sortDirection}
                            onClick={() => onSortChange('category')}
                        />
                        <SortHeader
                            label="Origen"
                            active={sortKey === 'origin'}
                            direction={sortDirection}
                            onClick={() => onSortChange('origin')}
                        />
                        <th className="px-4 py-3 text-right micro">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-rule-soft">
                    {attractions.map((attraction) => (
                        <tr
                            key={attraction.firestoreId}
                            onClick={() => onView(attraction)}
                            className="hover:bg-paper-deep cursor-pointer transition-colors"
                        >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(attraction.firestoreId)}
                                    onChange={() => onToggleSelect(attraction.firestoreId)}
                                    aria-label={`Seleccionar ${attraction.name}`}
                                    className="h-4 w-4 rounded border-rule accent-forest focus:ring-forest cursor-pointer"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <Thumb attraction={attraction} />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-ink">
                                {attraction.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-ink-soft">
                                {locationLabel(attraction)}
                            </td>
                            <td className="px-4 py-3 text-sm text-ink-soft">
                                {attraction.category}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`badge ${attraction.isUserProposal
                                    ? 'badge-gold'
                                    : 'badge-muted'
                                    }`}
                                >
                                    {originLabel(attraction)}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => onView(attraction)}
                                        title="Ver detalles"
                                        aria-label={`Ver ${attraction.name}`}
                                        className="p-2 rounded-md text-ink-faint hover:text-clay hover:bg-paper-deep transition-colors"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onEdit(attraction)}
                                        title="Editar"
                                        aria-label={`Editar ${attraction.name}`}
                                        className="p-2 rounded-md text-ink-faint hover:text-gold hover:bg-paper-deep transition-colors"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(attraction)}
                                        title="Eliminar"
                                        aria-label={`Eliminar ${attraction.name}`}
                                        className="p-2 rounded-md text-ink-faint hover:text-clay hover:bg-paper-deep transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttractionTable;