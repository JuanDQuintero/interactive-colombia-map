import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { FirestoreAttraction } from '../../interfaces/attraction';
import { getDepartmentDisplayName } from '../../utils/getDepartmentName';
import Button from '../UI/Button';

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

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    return (
        <Dialog open={true} onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/60 transition-opacity" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                {attraction.name}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="mb-6 relative">
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-lg">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            )}

                            {imageError ? (
                                <div className="w-full h-64 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-500 dark:text-gray-400">Imagen no disponible</span>
                                </div>
                            ) : (
                                <img
                                    src={attraction.image}
                                    alt={attraction.name}
                                    className="w-full h-64 object-cover rounded-lg"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Información Básica
                                </h3>
                                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                    <li>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">Nombre:</span>{' '}
                                        {attraction.name}
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">Región:</span>{' '}
                                        {getDepartmentDisplayName(attraction.regionId)}
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">Categoría:</span>{' '}
                                        {attraction.category}
                                    </li>
                                    <li>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">Fecha de creación:</span>{' '}
                                        {attraction.createdAt.toLocaleDateString()}
                                    </li>
                                    {attraction.isUserProposal && (
                                        <li>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Tipo:</span>{' '}
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                Propuesta de usuario
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {attraction.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                            >
                                Cerrar
                            </Button>
                            <Button
                                onClick={() => onDelete(attraction.firestoreId, attraction.name)}
                                variant="danger"
                                className="flex items-center gap-2"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Eliminar
                            </Button>
                            <Button
                                onClick={onEdit}
                                className="flex items-center gap-2"
                            >
                                <PencilIcon className="w-4 h-4" />
                                Editar
                            </Button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default AttractionDetailModal;