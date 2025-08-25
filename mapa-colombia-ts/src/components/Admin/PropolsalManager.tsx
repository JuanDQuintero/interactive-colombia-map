import type { User } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import type { AttractionProposal } from '../../interfaces/attraction';
import ConfirmationModal from '../UI/ConfirmationModal';
import Pagination from '../UI/Pagination';
import ProposalCard from './ProposalCard';
import ProposalModal from './ProposalModal';

interface ProposalsManagerProps {
    user: User;
    filter: string;
    onUpdateProposal: () => void;
}

const ProposalsManager: React.FC<ProposalsManagerProps> = ({ user, filter, onUpdateProposal }) => {
    const [proposals, setProposals] = useState<AttractionProposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<AttractionProposal | null>(null);

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // Estados para confirmación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);

    const fetchProposals = async () => {
        setLoading(true);
        try {
            let q;
            if (filter === 'all') {
                q = query(collection(db, 'attractionProposals'), orderBy('createdAt', 'desc'));
            } else {
                q = query(
                    collection(db, 'attractionProposals'),
                    where('status', '==', filter),
                    orderBy('createdAt', 'desc')
                );
            }

            const querySnapshot = await getDocs(q);
            const proposalsData: AttractionProposal[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate()
            } as AttractionProposal));

            setProposals(proposalsData);
        } catch (error) {
            console.error("Error fetching proposals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
        setCurrentPage(1); // Reset to first page when filter changes
    }, [filter]);

    // Calcular propuestas paginadas
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProposals = proposals.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(proposals.length / itemsPerPage);

    const handleDeleteClick = (id: string) => {
        setProposalToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!proposalToDelete) return;

        try {
            await deleteDoc(doc(db, 'attractionProposals', proposalToDelete));
            fetchProposals();
            onUpdateProposal();
        } catch (error) {
            console.error("Error deleting proposal:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            {proposals.length === 0 ? (
                <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                        No hay propuestas {filter !== 'all' ? `en estado ${filter}` : ''}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentProposals.map((proposal) => (
                            <ProposalCard
                                key={proposal.id}
                                proposal={proposal}
                                onSelect={setSelectedProposal}
                            />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={proposals.length}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </>
            )}
            {selectedProposal && (
                <ProposalModal
                    proposal={selectedProposal}
                    user={user}
                    onClose={() => setSelectedProposal(null)}
                    onUpdate={fetchProposals}
                    onDelete={handleDeleteClick}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Propuesta"
                message="¿Estás seguro de que deseas eliminar esta propuesta? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                variant="danger"
            />
        </>
    );
};

export default ProposalsManager;