import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';
import Button from '../../UI/Button';

const DEFAULT_REASONS = [
    'Información incorrecta',
    'Foto de mala calidad',
    'Información falsa',
    'Lugar inexistente',
    'Propuesta duplicada',
];

interface RejectReasonModalProps {
    proposalName: string;
    loading: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({ proposalName, loading, onClose, onConfirm }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [custom, setCustom] = useState('');

    const reason = selected === 'Otro' ? custom.trim() : selected || '';

    const chipClass = (active: boolean) =>
        `w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${active
            ? 'border-ink bg-ink text-paper'
            : 'border-rule bg-panel text-ink-soft hover:bg-paper-deep'
        }`;

    return (
        <Dialog open={true} onClose={loading ? () => undefined : onClose} className="relative z-[60]">
            <DialogBackdrop className="fixed inset-0 bg-black/60" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="modal-card w-full max-w-md p-6">
                    <DialogTitle className="font-display text-lg font-semibold text-ink">
                        Rechazar propuesta
                    </DialogTitle>
                    <p className="mt-2 text-sm text-ink-soft">
                        Indica la razón para rechazar{" "}
                        <span className="font-medium text-ink">"{proposalName}"</span>. El
                        usuario será notificado.
                    </p>

                    <div className="mt-4 space-y-2">
                        {DEFAULT_REASONS.map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setSelected(r)}
                                className={chipClass(selected === r)}
                            >
                                {r}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setSelected('Otro')}
                            className={chipClass(selected === 'Otro')}
                        >
                            Otro
                        </button>
                    </div>

                    {selected === 'Otro' && (
                        <textarea
                            value={custom}
                            onChange={(e) => setCustom(e.target.value)}
                            rows={3}
                            placeholder="Escribe la razón..."
                            className="field mt-3"
                        />
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            loading={loading}
                            disabled={!reason || loading}
                            onClick={() => onConfirm(reason)}
                        >
                            Confirmar rechazo
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default RejectReasonModal;