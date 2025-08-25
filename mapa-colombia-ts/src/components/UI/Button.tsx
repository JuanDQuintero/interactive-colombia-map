// components/UI/Button.tsx
import React, { type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'approved';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    fullWidth = false,
    className = '',
    ...props
}) => {
    // Clases base
    const baseClasses = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer';

    // Variantes - ahora con disabled para anular hover
    const variantClasses = {
        primary: 'bg-blue-600 text-white focus:ring-blue-500 hover:bg-blue-700 disabled:hover:bg-blue-600',
        secondary: 'bg-gray-600 text-white focus:ring-gray-500 hover:bg-gray-700 disabled:hover:bg-gray-600',
        danger: 'bg-red-600 text-white focus:ring-red-500 hover:bg-red-700 disabled:hover:bg-red-600',
        outline: 'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-200 focus:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent',
        ghost: 'bg-transparent text-gray-800 dark:text-gray-200 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent',
        approved: 'bg-green-600 text-white focus:ring-green-500 hover:bg-green-700 disabled:hover:bg-green-600',
        warning: 'bg-yellow-100 text-yellow-600 focus:ring-yellow-500 hover:bg-yellow-700 disabled:hover:bg-yellow-600',
    };

    // Tamaños
    const sizeClasses = {
        sm: 'py-1 px-3 text-sm',
        md: 'py-2 px-4 text-base',
        lg: 'py-3 px-6 text-lg'
    };

    // Clases adicionales
    const additionalClasses = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className
    ].join(' ');

    return (
        <button
            className={additionalClasses}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                </span>
            ) : (
                <>
                    {icon && <span className="mr-2">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;