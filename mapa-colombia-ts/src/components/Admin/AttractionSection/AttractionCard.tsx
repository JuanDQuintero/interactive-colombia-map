import { useState } from 'react';
import type { FirestoreAttraction } from '../../../interfaces/attraction';
import { getDepartmentDisplayName } from '../../../utils/getDepartmentName';
import Button from '../../UI/Button';

interface AttractionCardProps {
    attraction: FirestoreAttraction;
    onViewDetails: (attraction: FirestoreAttraction) => void;
}

const AttractionCard: React.FC<AttractionCardProps> = ({ attraction, onViewDetails }) => {
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
        <div onClick={() => onViewDetails(attraction)} className="panel overflow-hidden border-l-4 border-clay cursor-pointer hover:shadow-md transition-shadow">
            <div className="relative h-48 overflow-hidden">
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-paper-deep">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                    </div>
                )}

                {imageError ? (
                    <div className="w-full h-full bg-paper-deep flex items-center justify-center">
                        <span className="text-ink-faint text-sm">Imagen no disponible</span>
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
                    <span className="absolute top-2 right-2 badge badge-gold">
                        Propuesta de usuario
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-display text-[15px] font-semibold text-ink mb-1">
                    {attraction.name}
                </h3>
                <p className="text-sm text-ink-soft mb-2">
                    <span className="font-semibold">Región:</span> {getDepartmentDisplayName(attraction.regionId)}
                    {attraction.municipalityName && ` — ${attraction.municipalityName}`}
                </p>
                <p className="text-sm text-ink-soft mb-2">
                    <span className="font-semibold">Categoría:</span> {attraction.category}
                </p>
                <p className="text-sm text-ink-soft line-clamp-2 mb-4">
                    {attraction.description}
                </p>
                <div className="flex justify-end items-center">
                    <Button
                        variant='ghost'
                        onClick={() => onViewDetails(attraction)}
                        className="text-clay hover:underline text-sm"
                    >
                        Ver detalles
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AttractionCard;