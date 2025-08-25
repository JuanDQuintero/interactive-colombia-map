import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}) => {
    const variantStyles = {
        danger: 'bg-red-100 text-red-600',
        warning: 'bg-yellow-100 text-yellow-600',
        success: 'bg-green-100 text-green-600'
    };

    const buttonVariant = {
        danger: 'danger',
        warning: 'outline',
        success: 'approved'
    } as const;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/60 transition-opacity" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 p-2 rounded-full ${variantStyles[variant]}`}>
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {title}
                        </DialogTitle>
                    </div>

                    <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {message}
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={buttonVariant[variant]}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ConfirmationModal;