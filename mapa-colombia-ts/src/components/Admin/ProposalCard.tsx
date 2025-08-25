import type { AttractionProposal } from '../../interfaces/attraction';
import { getDepartmentDisplayName } from '../../utils/getDepartmentName';
import Button from '../UI/Button';

interface ProposalCardProps {
    proposal: AttractionProposal;
    onSelect: (proposal: AttractionProposal) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onSelect }) => {
    return (
        <div className={`bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden border-l-4 ${proposal.status === 'approved'
            ? 'border-green-500'
            : proposal.status === 'rejected'
                ? 'border-red-500'
                : 'border-yellow-500'
            }`}
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={proposal.image}
                    alt={proposal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                />
                <span
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${proposal.status === 'approved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : proposal.status === 'rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                    {proposal.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Departamento:</span>{' '}
                    {getDepartmentDisplayName(proposal.departmentId)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Categoría:</span> {proposal.category}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {proposal.description}
                </p>
                <div className="flex justify-between items-center">
                    <Button
                        variant='ghost'
                        onClick={() => onSelect(proposal)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                        Ver detalles
                    </Button>
                    {proposal.status === 'pending' && (
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    // Esta función se manejará en el modal
                                    onSelect(proposal);
                                }}
                                className="text-sm"
                                variant='approved'
                            >
                                Aprobar
                            </Button>
                            <Button
                                onClick={() => {
                                    // Esta función se manejará en el modal
                                    onSelect(proposal);
                                }}
                                variant='danger'
                                className="text-sm"
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