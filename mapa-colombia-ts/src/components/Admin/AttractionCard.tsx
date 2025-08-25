import { useState } from 'react';
import type { FirestoreAttraction } from '../../interfaces/attraction';
import { getDepartmentDisplayName } from '../../utils/getDepartmentName';
import Button from '../UI/Button';

interface AttractionCardProps {
    attraction: FirestoreAttraction;
    onViewDetails: (attraction: FirestoreAttraction) => void;
    onEdit: (attraction: FirestoreAttraction) => void;
    onDelete: (firestoreId: string, name: string) => void;
}

const AttractionCard: React.FC<AttractionCardProps> = ({ attraction, onViewDetails, onEdit, onDelete }) => {
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
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500">
            <div className="relative h-48 overflow-hidden">
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {imageError ? (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Imagen no disponible</span>
                    </div>
                ) : (
                    <img
                        src={attraction.image}
                        alt={attraction.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        loading="lazy"
                    />
                )}

                {attraction.isUserProposal && (
                    <span className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Propuesta de usuario
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                    {attraction.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Región:</span> {getDepartmentDisplayName(attraction.regionId)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Categoría:</span> {attraction.category}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {attraction.description}
                </p>
                <div className="flex justify-between items-center">
                    <Button
                        variant='ghost'
                        onClick={() => onViewDetails(attraction)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                        Ver detalles
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant='ghost'
                            onClick={() => onEdit(attraction)}
                            className="text-green-600 dark:text-green-400 hover:underline text-sm"
                        >
                            Editar
                        </Button>
                        <Button
                            variant='danger'
                            onClick={() => onDelete(attraction.firestoreId, attraction.name)}
                            className="text-sm"
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttractionCard;