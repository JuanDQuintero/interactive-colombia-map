import type { AttractionProposal } from '../../../interfaces/attraction';
import { getDepartmentDisplayName } from '../../../utils/getDepartmentName';
import { IMAGE_FALLBACK } from '../../../utils/imageFallback';
import Button from '../../UI/Button';

interface ProposalCardProps {
    proposal: AttractionProposal;
    loading: boolean;
    onSelect: (proposal: AttractionProposal) => void;
    onApprove: () => void;
    onReject: () => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, loading, onSelect, onApprove, onReject }) => {
    return (
        <div onClick={() => onSelect(proposal)} className={`panel border-l-4 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${proposal.status === 'approved'
            ? 'border-l-forest'
            : proposal.status === 'rejected'
                ? 'border-l-clay'
                : 'border-l-gold'
            }`}
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={proposal.image}
                    alt={proposal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = IMAGE_FALLBACK;
                    }}
                />
                <span
                    className={`badge absolute top-2 right-2 ${proposal.status === 'approved'
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
            </div>
            <div className="p-4">
                <h3 className="font-display text-[15px] font-semibold text-ink mb-1">
                    {proposal.name}
                </h3>
                <p className="text-sm text-ink-soft mb-2">
                    <span className="font-medium text-ink">Departamento:</span>{' '}
                    {getDepartmentDisplayName(proposal.departmentId)}
                </p>
                <p className="text-sm text-ink-soft mb-2">
                    <span className="font-medium text-ink">Categoría:</span> {proposal.category}
                </p>
                <p className="text-sm text-ink-soft line-clamp-2 mb-4">
                    {proposal.description}
                </p>
                <div className="flex justify-between items-center gap-2">
                    <Button
                        variant='ghost'
                        onClick={() => onSelect(proposal)}
                        className="text-clay hover:underline text-sm"
                    >
                        Ver detalles
                    </Button>
                    {proposal.status === 'pending' && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="approved"
                                size="sm"
                                disabled={loading}
                                onClick={onApprove}
                            >
                                Aprobar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={loading}
                                onClick={onReject}
                                className="text-clay hover:text-ink"
                            >
                                Rechazar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProposalCard;