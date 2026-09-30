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
        danger: 'bg-clay/10 border border-clay/30 text-clay',
        warning: 'bg-gold-soft border border-gold/40 text-gold',
        success: 'bg-forest-soft border border-forest/30 text-forest'
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
                <DialogPanel className="modal-card w-full max-w-md p-6">
                    <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 p-2 rounded-full ${variantStyles[variant]}`}>
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                        <DialogTitle className="font-display text-lg font-semibold text-ink">
                            {title}
                        </DialogTitle>
                    </div>

                    <div className="mt-4">
                        <p className="text-sm text-ink-soft">
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