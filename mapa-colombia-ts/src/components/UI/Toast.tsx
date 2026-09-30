import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextToastId = 0;

const TOAST_TYPE_STYLES: Record<ToastType, string> = {
    success: 'border-l-4 border-l-forest',
    error: 'border-l-4 border-l-clay',
    info: 'border-l-4 border-l-gold',
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info') => {
            const id = ++nextToastId;
            setToasts((prev) => [...prev, { id, type, message }]);
            window.setTimeout(() => dismissToast(id), 4000);
        },
        [dismissToast],
    );

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-[99999] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role="status"
                        className={`flex items-start justify-between gap-2 rounded-md border border-rule bg-panel px-4 py-3 text-sm font-medium text-ink shadow-lg ${TOAST_TYPE_STYLES[toast.type]}`}
                    >
                        <span>{toast.message}</span>
                        <button
                            type="button"
                            onClick={() => dismissToast(toast.id)}
                            className="ml-2 shrink-0 text-ink-faint hover:text-ink"
                            aria-label="Cerrar notificación"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};