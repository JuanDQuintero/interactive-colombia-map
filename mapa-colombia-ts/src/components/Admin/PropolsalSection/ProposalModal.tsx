import type { AttractionProposal } from '../../../interfaces/attraction';
import { getDepartmentDisplayName } from '../../../utils/getDepartmentName';
import { IMAGE_FALLBACK } from '../../../utils/imageFallback';
import Button from '../../UI/Button';
import MapPicker from '../../UI/MapPicker';

interface ProposalModalProps {
    proposal: AttractionProposal;
    loading: boolean;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
    onDelete: (id: string) => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ proposal, loading, onClose, onApprove, onReject, onDelete }) => {
    return (
        <div className="fixed inset-0 bg-black bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="modal-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="font-display text-xl font-semibold text-ink">
                            {proposal.name}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-ink-faint hover:text-ink text-2xl"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="mb-6">
                        <img
                            src={proposal.image}
                            alt={proposal.name}
                            className="w-full h-64 object-cover rounded-md"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = IMAGE_FALLBACK;
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="font-display text-[15px] font-semibold text-ink mb-2">
                                Información Básica
                            </h3>
                            <ul className="space-y-2 text-ink-soft text-sm">
                                <li>
                                    <span className="font-medium text-ink">Departamento:</span>{' '}
                                    {getDepartmentDisplayName(proposal.departmentId)}
                                </li>
                                {proposal.municipalityName && (
                                    <li>
                                        <span className="font-medium text-ink">Municipio:</span>{' '}
                                        {proposal.municipalityName}
                                    </li>
                                )}
                                <li>
                                    <span className="font-medium text-ink">Categoría:</span>{' '}
                                    {proposal.category}
                                </li>
                                <li>
                                    <span className="font-medium text-ink">Estado:</span>{' '}
                                    <span
                                        className={`badge ${proposal.status === 'approved'
                                            ? 'badge-forest'
                                            : proposal.status === 'rejected'
                                                ? 'badge-clay'
                                                : 'badge-gold'
                                            }`}
                                    >
                                        {proposal.status === 'approved'
                                            ? 'Aprobado'
                                            : proposal.status === 'rejected'
                                                ? 'Rechazado'
                                                : 'Pendiente'}
                                    </span>
                                </li>
                                {proposal.status === 'rejected' && proposal.rejectionReason && (
                                    <li>
                                        <span className="font-medium text-ink">Motivo de rechazo:</span>{' '}
                                        <span className="text-clay">{proposal.rejectionReason}</span>
                                    </li>
                                )}
                                <li>
                                    <span className="font-medium text-ink">Fecha de creación:</span>{' '}
                                    {proposal.createdAt.toLocaleDateString()}
                                </li>
                                {proposal.userName && (
                                    <li>
                                        <span className="font-medium text-ink">Propuesto por:</span>{' '}
                                        {proposal.userName}
                                    </li>
                                )}
                                {proposal.userEmail && (
                                    <li>
                                        <span className="font-medium text-ink">Email:</span>{' '}
                                        <a href={`mailto:${proposal.userEmail}`} className="text-clay hover:underline">
                                            {proposal.userEmail}
                                        </a>
                                    </li>
                                )}

                            </ul>
                        </div>

                        <div>
                            <h3 className="font-display text-[15px] font-semibold text-ink mb-2">
                                Descripción
                            </h3>
                            <p className="text-ink-soft text-sm leading-relaxed">
                                {proposal.description}
                            </p>
                        </div>
                    </div>

                    {proposal.latitude != null && proposal.longitude != null && (
                        <div className="mb-6">
                            <h3 className="font-display text-[15px] font-semibold text-ink mb-2">
                                Ubicación propuesta
                            </h3>
                            <MapPicker
                                latitude={proposal.latitude}
                                longitude={proposal.longitude}
                                height="250px"
                                readOnly
                                onChange={() => {}}
                            />
                            <p className="text-xs text-ink-faint mt-2">
                                Coordenadas: {proposal.latitude.toFixed(5)}, {proposal.longitude.toFixed(5)}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        {proposal.status === 'pending' && (
                            <>
                                <Button
                                    variant="approved"
                                    loading={loading}
                                    disabled={loading}
                                    onClick={onApprove}
                                >
                                    Aprobar
                                </Button>
                                <Button
                                    variant="danger"
                                    loading={loading}
                                    disabled={loading}
                                    onClick={onReject}
                                >
                                    Rechazar
                                </Button>
                            </>
                        )}
                        <Button
                            variant="secondary"
                            disabled={loading}
                            onClick={() => onDelete(proposal.id)}
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalModal;