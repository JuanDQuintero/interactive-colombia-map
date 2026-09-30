import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { MapPinIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { FirestoreAttraction } from '../../../interfaces/attraction';
import { departmentsData } from '../../../data/colombiaMapData';
import { getDepartmentDisplayName } from '../../../utils/getDepartmentName';
import Button from '../../UI/Button';
import MapPicker from '../../UI/MapPicker';

interface AttractionDetailModalProps {
    attraction: FirestoreAttraction;
    onClose: () => void;
    onEdit: () => void;
    onDelete: (firestoreId: string, name: string) => void;
}

const AttractionDetailModal: React.FC<AttractionDetailModalProps> = ({
    attraction,
    onClose,
    onEdit,
    onDelete
}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const hasCoords = attraction.latitude != null && attraction.longitude != null;
    const departmentName = departmentsData[attraction.regionId]?.name || getDepartmentDisplayName(attraction.regionId);

    return (
        <Dialog open={true} onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/60 transition-opacity" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="modal-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="font-display text-xl font-semibold text-ink">
                                {attraction.name}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-ink-faint hover:text-ink text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="mb-6 relative">
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-paper-deep rounded-md">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
                                </div>
                            )}

                            {imageError ? (
                                <div className="w-full h-64 bg-paper-deep rounded-md flex items-center justify-center">
                                    <span className="text-ink-faint">Imagen no disponible</span>
                                </div>
                            ) : (
                                <img
                                    src={attraction.image}
                                    alt={attraction.name}
                                    className="w-full h-64 object-cover rounded-md"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="font-display text-[15px] font-semibold text-ink mb-2">
                                    Información Básica
                                </h3>
                                <ul className="space-y-2 text-sm text-ink-soft">
                                    <li>
                                        <span className="font-medium text-ink">Nombre:</span>{' '}
                                        {attraction.name}
                                    </li>
                                    <li>
                                        <span className="font-medium text-ink">Departamento:</span>{' '}
                                        {departmentName}
                                    </li>
                                    {attraction.municipalityName && (
                                        <li>
                                            <span className="font-medium text-ink">Municipio:</span>{' '}
                                            {attraction.municipalityName}
                                        </li>
                                    )}
                                    <li>
                                        <span className="font-medium text-ink">Categoría:</span>{' '}
                                        {attraction.category}
                                    </li>
                                    <li>
                                        <span className="font-medium text-ink">Fecha de creación:</span>{' '}
                                        {attraction.createdAt.toLocaleDateString()}
                                    </li>
                                    <li>
                                        <span className="font-medium text-ink">Origen:</span>{' '}
                                        <span className={`badge ${attraction.isUserProposal
                                            ? 'badge-gold'
                                            : 'badge-muted'
                                            }`}
                                        >
                                            {attraction.isUserProposal ? 'Sugerido por usuario' : 'Oficial'}
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-display text-[15px] font-semibold text-ink mb-2">
                                    Descripción
                                </h3>
                                <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                                    {attraction.description}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-display text-[15px] font-semibold text-ink mb-2">
                                Ubicación
                            </h3>
                            {hasCoords ? (
                                <div>
                                    <MapPicker
                                        latitude={attraction.latitude}
                                        longitude={attraction.longitude}
                                        height="200px"
                                        readOnly
                                        onChange={() => {}}
                                    />
                                    <p className="text-xs text-ink-faint mt-2">
                                        Coordenadas: {attraction.latitude!.toFixed(5)}, {attraction.longitude!.toFixed(5)}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-3 rounded-md bg-paper-deep border border-rule">
                                    <MapPinIcon className="w-4 h-4 text-ink-faint shrink-0" />
                                    <p className="text-sm text-ink-soft m-0">
                                        {departmentName}
                                        {attraction.municipalityName ? ` · ${attraction.municipalityName}` : ''}
                                        {' — '}
                                        <span className="text-ink-faint">Sin ubicación exacta fijada</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {confirmDelete ? (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-md bg-clay/10 border border-clay/30">
                                <p className="text-sm font-medium text-clay m-0">
                                    ¿Estás seguro de eliminar este atractivo? Esta acción no se puede deshacer.
                                </p>
                                <div className="flex gap-2 shrink-0">
                                    <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => onDelete(attraction.firestoreId, attraction.name)}
                                        className="flex items-center gap-2"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Sí, eliminar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={onClose}>
                                    Cerrar
                                </Button>
                                <Button
                                    onClick={onEdit}
                                    className="flex items-center gap-2"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Editar
                                </Button>
                                <Button
                                    onClick={() => setConfirmDelete(true)}
                                    variant="danger"
                                    className="flex items-center gap-2"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Eliminar
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default AttractionDetailModal;