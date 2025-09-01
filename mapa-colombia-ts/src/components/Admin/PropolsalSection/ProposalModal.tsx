import type { User } from 'firebase/auth';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { departmentsData } from '../../../data/colombiaMapData';
import { db } from '../../../firebase';
import type { AttractionProposal } from '../../../interfaces/attraction';
import { getDepartmentDisplayName } from '../../../utils/getDepartmentName';

interface ProposalModalProps {
    proposal: AttractionProposal;
    user: User;
    onClose: () => void;
    onUpdate: () => void;
    onDelete: (id: string) => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ proposal, user, onClose, onUpdate, onDelete }) => {
    const [loading, setLoading] = useState(false);

    const generateAttractionId = (name: string): string => {
        return name
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    const addToAttractions = async (proposalData: AttractionProposal) => {
        try {
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
            };

            await addDoc(collection(db, 'attractions'), attraction);
        } catch (error) {
            console.error("Error al agregar la atracción:", error);
            throw error;
        }
    };

    const updateProposalStatus = async (status: 'approved' | 'rejected') => {
        setLoading(true);
        try {
            // Actualizar el estado de la propuesta
            await updateDoc(doc(db, 'attractionProposals', proposal.id), {
                status,
                reviewedBy: user.uid,
                reviewedAt: new Date()
            });

            // Si la propuesta es aprobada, agregarla a la colección de attractions
            if (status === 'approved') {
                await addToAttractions(proposal);
            }

            // Enviar notificación al usuario que hizo la propuesta
            if (proposal.userId) {
                const message = status === 'approved'
                    ? `¡Felicidades! Tu propuesta "${proposal.name}" ha sido aprobada y agregada al mapa.`
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

            // Notificar a los administradores sobre la acción
            await addDoc(collection(db, 'notifications'), {
                userId: 'admin',
                type: `proposal_${status}_alert`,
                proposalId: proposal.id,
                proposalName: proposal.name,
                message: `${user.displayName || 'Un administrador'} ${status === 'approved' ? 'aprobó' : 'rechazó'} la propuesta "${proposal.name}"`,
                read: false,
                createdAt: new Date()
            });

            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error updating proposal:", error);
            alert("Ocurrió un error al procesar la propuesta. Por favor intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            {proposal.name}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="mb-6">
                        <img
                            src={proposal.image}
                            alt={proposal.name}
                            className="w-full h-64 object-cover rounded-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Información Básica
                            </h3>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                <li>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Departamento:</span>{' '}
                                    {getDepartmentDisplayName(proposal.departmentId)}
                                </li>
                                <li>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Categoría:</span>{' '}
                                    {proposal.category}
                                </li>
                                <li>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Estado:</span>{' '}
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${proposal.status === 'approved'
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
                                </li>
                                <li>
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Fecha de creación:</span>{' '}
                                    {proposal.createdAt.toLocaleDateString()}
                                </li>
                                {proposal.userName && (
                                    <li>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">Propuesto por:</span>{' '}
                                        {proposal.userName}
                                    </li>
                                )}
                                {proposal.userEmail && (
                                    <li>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">Email:</span>{' '}
                                        <a href={`mailto:${proposal.userEmail}`} className="text-blue-600 hover:underline dark:text-blue-400">
                                            {proposal.userEmail}
                                        </a>
                                    </li>
                                )}

                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Descripción
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {proposal.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        {proposal.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => updateProposalStatus('approved')}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                >
                                    {loading ? 'Procesando...' : 'Aprobar'}
                                </button>
                                <button
                                    onClick={() => updateProposalStatus('rejected')}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                >
                                    {loading ? 'Procesando...' : 'Rechazar'}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => onDelete(proposal.id)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalModal;