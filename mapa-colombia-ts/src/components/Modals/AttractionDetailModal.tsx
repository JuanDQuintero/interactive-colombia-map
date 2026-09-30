import type { User } from 'firebase/auth';
import React from 'react';
import { DEPARTMENT_CENTERS } from '../../data/departmentCenters';
import { useAttractionReviews } from '../../hooks/useAttractionReviews';
import type { Attraction } from '../../interfaces/attraction';
import ReviewSection from '../Reviews/ReviewSection';
import StarRating from '../Reviews/StarRating';
import MapPicker from '../UI/MapPicker';

interface AttractionDetailModalProps {
    attraction: Attraction;
    isVisited: boolean;
    onToggleVisited: (id: string) => void;
    onClose: () => void;
    user: User | null;
    isAdmin?: boolean;
}

const AttractionDetailModal: React.FC<AttractionDetailModalProps> = ({
    attraction,
    isVisited,
    onToggleVisited,
    onClose,
    user,
    isAdmin,
}) => {
    const { reviews, averageRating, loading, addReview, removeReview } = useAttractionReviews(attraction.id);

    const handleAddReview = async (reviewData: Parameters<typeof addReview>[0]) => {
        // Quien califica ya estuvo en el atractivo → marcarlo como visitado automáticamente
        if (!isVisited) {
            onToggleVisited(attraction.id);
        }
        await addReview({ ...reviewData, attractionId: attraction.id });
    };

    const hasCoords = attraction.latitude != null && attraction.longitude != null;
    const mapsSearchQuery = hasCoords
        ? `${attraction.latitude},${attraction.longitude}`
        : `${attraction.name} ${attraction.regionName} ${attraction.municipalityName ?? ''} Colombia`;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div
                className="modal-card w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 flex justify-between items-start p-6 pb-0">
                    <div className="flex-grow pr-4">
                        <h2 className="font-display text-xl font-semibold text-ink">
                            {attraction.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="badge badge-forest">
                                {attraction.category}
                            </span>
                            <span className="text-sm text-ink-faint">
                                {attraction.regionName}
                            </span>
                            {attraction.municipalityName && (
                                <span className="text-sm text-ink-faint">
                                    • {attraction.municipalityName}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-ink-faint hover:text-ink transition-colors text-3xl leading-none cursor-pointer flex-shrink-0"
                    >
                        &times;
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-grow overflow-y-auto px-6 py-4">
                    {/* Image */}
                    <div className="mb-4 rounded-md overflow-hidden bg-paper-deep">
                        <img
                            src={attraction.image}
                            alt={attraction.name}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/800x400/cccccc/ffffff?text=Sin+imagen';
                            }}
                        />
                    </div>

                    {/* Rating + Visitado */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-ink-soft font-medium">Promedio:</span>
                            <StarRating rating={averageRating} size="md" showValue />
                            {reviews.length > 0 && (
                                <span className="text-sm text-ink-faint tabular-nums">
                                    ({reviews.length})
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => onToggleVisited(attraction.id)}
                            className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto ${isVisited
                                ? 'bg-forest text-paper hover:opacity-90'
                                : 'border border-rule bg-panel text-ink hover:bg-paper-deep'
                                }`}
                        >
                            {isVisited ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Visitado
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Marcar como visitado
                                </>
                            )}
                        </button>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="mb-2 flex items-center gap-3 font-display text-[15px] font-semibold text-ink">
                            Descripción
                            <span className="rule-fill" />
                        </h3>
                        <p className="text-ink-soft text-sm leading-relaxed">
                            {attraction.description}
                        </p>
                    </div>

                    {/* Ubicación */}
                    <div className="mb-6">
                        <h3 className="mb-2 flex items-center gap-3 font-display text-[15px] font-semibold text-ink">
                            Ubicación
                            <span className="rule-fill" />
                        </h3>
                        <div className="mb-4">
                            <MapPicker
                                latitude={hasCoords ? attraction.latitude : undefined}
                                longitude={hasCoords ? attraction.longitude : undefined}
                                fallbackCenter={DEPARTMENT_CENTERS[attraction.regionId]}
                                showFallbackMarker={!hasCoords}
                                onChange={() => { }}
                                height="250px"
                                readOnly
                            />
                        </div>
                        {hasCoords ? (
                            <>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsSearchQuery)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold-soft px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-gold"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Ver ubicación exacta en Google Maps
                                </a>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-ink-faint mb-3">
                                    Ubicación aproximada — centrado en {attraction.regionName}. El atractivo aún no tiene coordenadas exactas asignadas.
                                </p>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsSearchQuery)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-md border border-rule bg-panel px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Buscar por nombre en Google Maps
                                </a>
                            </>
                        )}
                    </div>

                    {/* Reviews */}
                    <ReviewSection
                        key={attraction.id}
                        reviews={reviews}
                        loading={loading}
                        onAddReview={handleAddReview}
                        onDeleteReview={removeReview}
                        user={user}
                        isAdmin={isAdmin}
                    />
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-6 pt-4 border-t border-rule">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-rule bg-panel px-4 py-2 text-sm font-medium text-ink hover:bg-paper-deep transition-colors cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttractionDetailModal;
