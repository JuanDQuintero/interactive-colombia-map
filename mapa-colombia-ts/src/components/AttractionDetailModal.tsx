import React from 'react';
import type { User } from 'firebase/auth';
import type { Attraction } from '../interfaces/attraction';
import { useAttractionReviews } from '../hooks/useAttractionReviews';
import StarRating from './StarRating';
import ReviewSection from './ReviewSection';
import MapPicker from './UI/MapPicker';

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

    const mapsSearchQuery = attraction.latitude != null && attraction.longitude != null
        ? `${attraction.latitude},${attraction.longitude}`
        : `${attraction.name} ${attraction.regionName} Colombia`;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 flex justify-between items-start p-6 pb-0">
                    <div className="flex-grow pr-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {attraction.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                {attraction.category}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {attraction.regionName}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-3xl leading-none cursor-pointer flex-shrink-0"
                    >
                        &times;
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-grow overflow-y-auto px-6 py-4">
                    {/* Image */}
                    <div className="mb-4 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
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
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Promedio:</span>
                            <StarRating rating={averageRating} size="md" showValue />
                            {reviews.length > 0 && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    ({reviews.length})
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => onToggleVisited(attraction.id)}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto ${isVisited
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
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
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                            Descripción
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {attraction.description}
                        </p>
                    </div>

                    {/* Ubicación */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                            Ubicación
                        </h3>
                        {attraction.latitude != null && attraction.longitude != null && (
                            <div className="mb-4">
                                <MapPicker
                                    latitude={attraction.latitude}
                                    longitude={attraction.longitude}
                                    onChange={() => {}}
                                    height="250px"
                                    readOnly
                                />
                            </div>
                        )}
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsSearchQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Ver ubicación en Google Maps
                        </a>
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
                <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttractionDetailModal;
