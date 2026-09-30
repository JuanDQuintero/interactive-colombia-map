import type { User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAttractionsData } from '../../../context/AttractionsContext';
import { departmentsData } from '../../../data/colombiaMapData';
import { db } from '../../../firebase';
import type { AttractionProposal } from '../../../interfaces/attraction';
import { generateAttractionId } from '../../../utils/generateAttractionId';
import { getDepartmentDisplayName } from '../../../utils/getDepartmentName';
import ConfirmationModal from '../../UI/ConfirmationModal';
import Pagination from '../../UI/Pagination';
import { useToast } from '../../UI/Toast';
import PropolsalFilter from './PropolsalFilter';
import ProposalCard from './ProposalCard';
import ProposalModal from './ProposalModal';
import RejectReasonModal from './RejectReasonModal';

interface ProposalsManagerProps {
    user: User;
    onUpdateProposal: () => void;
    searchQuery: string;
    selectedDepartment: string;
    selectedMunicipality: string;
    onCountsChange: (pending: number, approved: number, rejected: number) => void;
    refreshSignal: number;
}

const ProposalsManager: React.FC<ProposalsManagerProps> = ({
    user,
    onUpdateProposal,
    searchQuery,
    selectedDepartment,
    selectedMunicipality,
    onCountsChange,
    refreshSignal,
}) => {
    const { refetch } = useAttractionsData();
    const { showToast } = useToast();
    const [proposals, setProposals] = useState<AttractionProposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterPropolsals, setFilterPropolsas] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [moderationLoading, setModerationLoading] = useState(false);

    const [selectedProposal, setSelectedProposal] = useState<AttractionProposal | null>(null);
    const [rejectTarget, setRejectTarget] = useState<AttractionProposal | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchProposals = useCallback(async () => {
        setLoading(true);
        try {
            let q;
            if (filterPropolsals === 'all') {
                q = query(collection(db, 'attractionProposals'), orderBy('createdAt', 'desc'));
            } else {
                q = query(
                    collection(db, 'attractionProposals'),
                    where('status', '==', filterPropolsals),
                    orderBy('createdAt', 'desc')
                );
            }

            const querySnapshot = await getDocs(q);

            if (!isMountedRef.current) return;

            const proposalsData: AttractionProposal[] = querySnapshot.docs.map(doc => {
                return ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate()
                } as AttractionProposal)
            });
            setProposals(proposalsData);
        } catch (error) {
            console.error("Error fetching proposals:", error);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [filterPropolsals]);

    useEffect(() => {
        fetchProposals();
        setCurrentPage(1);
    }, [fetchProposals]);

    useEffect(() => {
        if (refreshSignal > 0) fetchProposals();
    }, [refreshSignal, fetchProposals]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedDepartment, selectedMunicipality, filterPropolsals]);

    useEffect(() => {
        const pending = proposals.filter(p => p.status === 'pending').length;
        const approved = proposals.filter(p => p.status === 'approved').length;
        const rejected = proposals.filter(p => p.status === 'rejected').length;
        onCountsChange(pending, approved, rejected);
    }, [proposals, onCountsChange]);

    // Filtrar propuestas por estado, búsqueda, departamento y municipio
    const filteredProposals = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return proposals.filter(p => {
            const matchesStatus = filterPropolsals === 'all' || p.status === filterPropolsals;
            const matchesDepartment = selectedDepartment === 'all' || p.departmentId === selectedDepartment;
            const matchesMunicipality = selectedMunicipality === 'all' || p.municipalityId === selectedMunicipality;
            const matchesSearch = !q
                || p.name.toLowerCase().includes(q)
                || p.category.toLowerCase().includes(q)
                || (p.municipalityName?.toLowerCase().includes(q) ?? false);
            return matchesStatus && matchesDepartment && matchesMunicipality && matchesSearch;
        });
    }, [proposals, filterPropolsals, searchQuery, selectedDepartment, selectedMunicipality]);

    // Calcular propuestas paginadas
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProposals = filteredProposals.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

    const addToAttractions = async (proposalData: AttractionProposal) => {
        const department = departmentsData[proposalData.departmentId];
        const regionInfo = {
            regionId: proposalData.departmentId,
            regionName: department?.name || getDepartmentDisplayName(proposalData.departmentId) || proposalData.departmentId
        };

        const attraction = {
            id: generateAttractionId(proposalData.name),
            name: proposalData.name,
            description: proposalData.description,
            image: proposalData.image,
            category: proposalData.category,
            regionId: regionInfo.regionId,
            regionName: regionInfo.regionName,
            createdAt: new Date(),
            createdBy: proposalData.userId,
            isUserProposal: true
        } as Record<string, unknown>;

        if (proposalData.latitude != null && proposalData.longitude != null) {
            attraction.latitude = proposalData.latitude;
            attraction.longitude = proposalData.longitude;
        }

        if (proposalData.municipalityId && proposalData.municipalityName) {
            attraction.municipalityId = proposalData.municipalityId;
            attraction.municipalityName = proposalData.municipalityName;
        }

        await addDoc(collection(db, 'attractions'), attraction);
    };

    const setProposalStatus = async (
        proposal: AttractionProposal,
        status: 'approved' | 'rejected',
        reason?: string
    ) => {
        await updateDoc(doc(db, 'attractionProposals', proposal.id), {
            status,
            reviewedBy: user.uid,
            reviewedAt: new Date(),
            ...(status === 'rejected' && reason ? { rejectionReason: reason } : {})
        });

        if (status === 'approved') {
            await addToAttractions(proposal);
            await refetch();
        }

        if (proposal.userId) {
            const message = status === 'approved'
                ? `¡Felicidades! Tu propuesta "${proposal.name}" ha sido aprobada y agregada al mapa.`
                : reason
                    ? `Lamentamos informarte que tu propuesta "${proposal.name}" fue rechazada. Razón: ${reason}`
                    : `Lamentamos informarte que tu propuesta "${proposal.name}" no cumple con nuestros requisitos.`;

            await addDoc(collection(db, 'notifications'), {
                userId: proposal.userId,
                type: `proposal_${status}`,
                proposalId: proposal.id,
                proposalName: proposal.name,
                message,
                read: false,
                createdAt: new Date()
            });
        }

        await addDoc(collection(db, 'notifications'), {
            userId: 'admin',
            type: `proposal_${status}_alert`,
            proposalId: proposal.id,
            proposalName: proposal.name,
            message: `${user.displayName || 'Un administrador'} ${status === 'approved' ? 'aprobó' : 'rechazó'} la propuesta "${proposal.name}"`,
            read: false,
            createdAt: new Date()
        });
    };

    const handleApprove = async (proposal: AttractionProposal) => {
        setModerationLoading(true);
        try {
            await setProposalStatus(proposal, 'approved');
            showToast('Propuesta aprobada y agregada al mapa', 'success');
            setSelectedProposal(null);
            fetchProposals();
            onUpdateProposal();
        } catch (error) {
            console.error("Error approving proposal:", error);
            showToast("Ocurrió un error al aprobar la propuesta. Por favor intenta nuevamente.", 'error');
        } finally {
            setModerationLoading(false);
        }
    };

    const handleReject = async (proposal: AttractionProposal, reason: string) => {
        setModerationLoading(true);
        try {
            await setProposalStatus(proposal, 'rejected', reason);
            showToast('Propuesta rechazada', 'success');
            setSelectedProposal(null);
            setRejectTarget(null);
            fetchProposals();
            onUpdateProposal();
        } catch (error) {
            console.error("Error rejecting proposal:", error);
            showToast("Ocurrió un error al rechazar la propuesta. Por favor intenta nuevamente.", 'error');
        } finally {
            setModerationLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setProposalToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!proposalToDelete) return;

        try {
            await deleteDoc(doc(db, 'attractionProposals', proposalToDelete));
            setSelectedProposal(null);
            fetchProposals();
            onUpdateProposal();
        } catch (error) {
            console.error("Error deleting proposal:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
            </div>
        );
    }

    return (
        <>
            <div className='mb-4'>
                <PropolsalFilter
                    selectedStatePropolsal={filterPropolsals}
                    onStatePropolsalChange={setFilterPropolsas}
                />
            </div>

            {filteredProposals.length === 0 ? (
                <div className="panel p-8 text-center">
                    <p className="text-ink-soft text-sm">
                        {proposals.length === 0
                            ? 'No hay propuestas.'
                            : 'No hay propuestas que coincidan con la búsqueda o los filtros seleccionados.'
                        }
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentProposals.map((proposal) => (
                            <ProposalCard
                                key={proposal.id}
                                proposal={proposal}
                                loading={moderationLoading}
                                onSelect={setSelectedProposal}
                                onApprove={() => handleApprove(proposal)}
                                onReject={() => setRejectTarget(proposal)}
                            />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredProposals.length}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </>
            )}

            {selectedProposal && (
                <ProposalModal
                    proposal={selectedProposal}
                    loading={moderationLoading}
                    onClose={() => setSelectedProposal(null)}
                    onApprove={() => handleApprove(selectedProposal)}
                    onReject={() => setRejectTarget(selectedProposal)}
                    onDelete={handleDeleteClick}
                />
            )}

            {rejectTarget && (
                <RejectReasonModal
                    proposalName={rejectTarget.name}
                    loading={moderationLoading}
                    onClose={() => setRejectTarget(null)}
                    onConfirm={(reason) => handleReject(rejectTarget, reason)}
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