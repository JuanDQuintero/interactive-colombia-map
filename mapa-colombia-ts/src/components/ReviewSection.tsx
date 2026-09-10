import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import type { AttractionReview } from '../interfaces/review';
import StarRating from './StarRating';
import ConfirmationModal from './UI/ConfirmationModal';

interface ReviewSectionProps {
    reviews: AttractionReview[];
    loading: boolean;
    onAddReview: (review: Omit<AttractionReview, 'id' | 'createdAt'>) => Promise<void>;
    onDeleteReview?: (reviewId: string) => Promise<void>;
    user: User | null;
    isAdmin?: boolean;
}

const REVIEWS_PER_PAGE = 5;

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, loading, onAddReview, onDeleteReview, user, isAdmin }) => {
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
    const [loadingMore, setLoadingMore] = useState(false);
    const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

    useEffect(() => {
        if (reviews.length <= visibleCount - REVIEWS_PER_PAGE) {
            setVisibleCount(Math.max(REVIEWS_PER_PAGE, reviews.length));
        }
    }, [reviews.length, visibleCount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (myRating === 0 || !user) return;

        setSubmitting(true);
        await onAddReview({
            attractionId: '',
            userId: user.uid,
            userName: user.displayName ?? 'Anónimo',
            userPhotoURL: user.photoURL ?? '',
            rating: myRating,
            comment: myComment.trim(),
        });
        setMyRating(0);
        setMyComment('');
        setSubmitting(false);
    };

    const handleDelete = (reviewId: string) => {
        setDeleteReviewId(reviewId);
    };

    const confirmDelete = () => {
        if (deleteReviewId && onDeleteReview) {
            onDeleteReview(deleteReviewId);
        }
        setDeleteReviewId(null);
    };

    const handleLoadMore = () => {
        setLoadingMore(true);
        setTimeout(() => {
            setVisibleCount((prev) => prev + REVIEWS_PER_PAGE);
            setLoadingMore(false);
        }, 600);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    const shownReviews = reviews.slice(0, visibleCount);

    return (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Reseñas y Comentarios
                    {reviews.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                            ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
                        </span>
                    )}
                </h4>
            </div>

            {user ? (
                <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 dark:bg-gray-600/50 p-4 rounded-lg">
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Tu calificación
                        </label>
                        <StarRating rating={myRating} onRate={setMyRating} size="lg" />
                    </div>
                    <div className="mb-3">
                        <textarea
                            value={myComment}
                            onChange={(e) => setMyComment(e.target.value)}
                            placeholder="Escribe tu comentario (opcional)..."
                            className="w-full p-3 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            rows={3}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={myRating === 0 || submitting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${myRating > 0 && !submitting
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {submitting ? 'Enviando...' : 'Enviar reseña'}
                    </button>
                </form>
            ) : (
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 italic">
                    Inicia sesión para dejar tu reseña y comentario.
                </p>
            )}

            {loading ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando reseñas...</p>
            ) : reviews.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {shownReviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-gray-50 dark:bg-gray-600/50 p-4 rounded-lg"
                            >
                                <div className="flex items-start gap-3">
                                    <img
                                        src={review.userPhotoURL || 'https://placehold.co/40x40/cccccc/ffffff?text=U'}
                                        alt={review.userName}
                                        className="w-10 h-10 rounded-full flex-shrink-0"
                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/cccccc/ffffff?text=U'; }}
                                    />
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                                                {review.userName}
                                            </p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                                {(user?.uid === review.userId || isAdmin) && onDeleteReview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(review.id)}
                                                        className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                                                        aria-label={`Eliminar reseña de ${review.userName}`}
                                                        title={isAdmin && user?.uid !== review.userId ? "Eliminar reseña (admin)" : "Eliminar mi reseña"}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} size="sm" />
                                        {review.comment && (
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {visibleCount < reviews.length && (
                        <div className="flex justify-center mt-4">
                            <button
                                type="button"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Cargando más reseñas...
                                    </span>
                                ) : (
                                    `Ver más reseñas (${reviews.length - visibleCount} más)`
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                    No hay reseñas aún. Sé el primero en opinar.
                </p>
            )}
            <ConfirmationModal
                isOpen={deleteReviewId !== null}
                onClose={() => setDeleteReviewId(null)}
                onConfirm={confirmDelete}
                title="Eliminar reseña"
                message={
                    deleteReviewId && user && reviews.find(r => r.id === deleteReviewId)?.userId === user.uid
                        ? '¿Seguro que deseas eliminar tu reseña? Esta acción no se puede deshacer.'
                        : '¿Seguro que deseas eliminar esta reseña? Esta acción no se puede deshacer.'
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default ReviewSection;
