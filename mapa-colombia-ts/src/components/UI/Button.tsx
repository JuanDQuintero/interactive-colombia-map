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
    const baseClasses = 'rounded-md font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer';

    // Variantes - ahora con disabled para anular hover
    const variantClasses = {
        primary: 'bg-ink text-paper focus:ring-forest hover:opacity-90 disabled:hover:opacity-100',
        secondary: 'bg-rule text-ink focus:ring-forest hover:brightness-95 disabled:hover:brightness-100',
        danger: 'bg-clay text-paper focus:ring-clay hover:brightness-110 disabled:hover:brightness-100',
        outline: 'border border-rule bg-transparent text-ink focus:ring-forest hover:bg-paper-deep disabled:hover:bg-transparent',
        ghost: 'bg-transparent text-ink-soft focus:ring-forest hover:bg-paper-deep hover:text-ink disabled:hover:bg-transparent disabled:hover:text-ink-soft',
        approved: 'bg-forest text-paper focus:ring-forest hover:brightness-110 disabled:hover:brightness-100',
        warning: 'bg-gold text-[#141210] focus:ring-gold hover:brightness-105 disabled:hover:brightness-100',
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