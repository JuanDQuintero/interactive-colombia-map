import React, { useState } from 'react';

interface StarRatingProps {
    rating: number;
    onRate?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, size = 'md', showValue = false }) => {
    const [hovered, setHovered] = useState(0);
    const isInteractive = !!onRate;

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-7 h-7',
    };

    return (
        <div className="flex items-center gap-1" role={isInteractive ? undefined : 'img'} aria-label={`Calificación ${rating.toFixed(1)} de 5`}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = isInteractive ? star <= (hovered || rating) : star <= Math.round(rating);
                const Tag = isInteractive ? 'button' : 'span';
                return (
                    <Tag
                        key={star}
                        {...(isInteractive ? { type: 'button', onMouseEnter: () => setHovered(star), onMouseLeave: () => setHovered(0), onClick: () => onRate(star) } : {})}
                        className={`${isInteractive ? 'cursor-pointer hover:scale-110' : 'inline-flex'} transition-transform duration-150`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={filled ? '#facc15' : 'none'}
                            stroke={filled ? '#facc15' : '#9ca3af'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={sizeClasses[size]}
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </Tag>
                );
            })}
            {showValue && rating > 0 && (
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
