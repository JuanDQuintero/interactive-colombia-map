import type { User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import type { FirestoreAttraction } from '../../../interfaces/attraction';
import ConfirmationModal from '../../UI/ConfirmationModal';
import Pagination from '../../UI/Pagination';
import AttractionCard from './AttractionCard';
import AttractionDetailModal from './AttractionDetailModal';
import AttractionEditModal from './AttractionEditMotal';
import DepartmentFilter from './DepartmentFilter';

interface AttractionsManagerProps {
    user: User;
    onUpdateAttraction: () => void;
}

const AttractionsManager: React.FC<AttractionsManagerProps> = ({ user, onUpdateAttraction }) => {
    const [attractions, setAttractions] = useState<FirestoreAttraction[]>([]);
    const [allAttractions, setAllAttractions] = useState<FirestoreAttraction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedAttraction, setSelectedAttraction] = useState<FirestoreAttraction | null>(null);
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [attractionToDelete, setAttractionToDelete] = useState<{ firestoreId: string; name: string } | null>(null);

    // Fetch all attractions
    const fetchAllAttractions = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'attractions'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const attractionsData: FirestoreAttraction[] = querySnapshot.docs.map(doc => ({
                firestoreId: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            } as FirestoreAttraction));

            setAllAttractions(attractionsData);

        } catch (error) {
            console.error("Error fetching attractions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAttractions();
        setCurrentPage(1);
    }, []);

    // Filtrar atracciones por departamento
    useEffect(() => {
        if (selectedDepartment === 'all') {
            setAttractions(allAttractions);
        } else {
            const filtered = allAttractions.filter(attr => attr.regionId === selectedDepartment);
            setAttractions(filtered);
        }
        setCurrentPage(1);
    }, [selectedDepartment, allAttractions]);

    // Calcular atracciones paginadas
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAttractions = attractions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(attractions.length / itemsPerPage);

    const handleDeleteClick = (firestoreId: string, name: string) => {
        setAttractionToDelete({ firestoreId, name });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!attractionToDelete) return;

        try {
            const updatedAllAttractions = allAttractions.filter(attr => attr.firestoreId !== attractionToDelete.firestoreId);
            const updatedFilteredAttractions = attractions.filter(attr => attr.firestoreId !== attractionToDelete.firestoreId);

            setAllAttractions(updatedAllAttractions);
            setAttractions(updatedFilteredAttractions);
            setLoading(true);

            await deleteDoc(doc(db, 'attractions', attractionToDelete.firestoreId));

            await addDoc(collection(db, 'notifications'), {
                userId: 'admin',
                type: 'attraction_deleted',
                attractionId: attractionToDelete.firestoreId,
                attractionName: attractionToDelete.name,
                message: `${user.displayName || 'Un administrador'} eliminó la atracción "${attractionToDelete.name}"`,
                read: false,
                createdAt: new Date()
            });
        } catch (error) {
            console.error("Error deleting attraction:", error);
            alert("Error al eliminar la atracción. Por favor intenta nuevamente.");

            fetchAllAttractions();
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setAttractionToDelete(null);
        }
    };

    const handleViewDetails = (attraction: FirestoreAttraction) => {
        setSelectedAttraction(attraction);
        setViewMode('view');
    };

    const handleUpdateAttraction = (updatedAttraction: FirestoreAttraction) => {
        const updatedAttractions = allAttractions.map(attr =>
            attr.firestoreId === updatedAttraction.firestoreId ? updatedAttraction : attr
        );
        setAllAttractions(updatedAttractions);
        onUpdateAttraction();
    };

    const handleRefresh = () => {
        fetchAllAttractions();
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
            <div className="flex justify-between items-center mb-4">
                <DepartmentFilter
                    selectedDepartment={selectedDepartment}
                    onDepartmentChange={setSelectedDepartment}
                />
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    Actualizar
                </button>
            </div>

            {attractions.length === 0 ? (
                <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md text-center mt-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        {selectedDepartment === 'all'
                            ? 'No hay atractivos turísticos en el sistema.'
                            : `No hay atractivos turísticos en ${selectedDepartment}.`
                        }
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {currentAttractions.map((attraction) => (
                            <AttractionCard
                                key={attraction.firestoreId}
                                attraction={attraction}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={attractions.length}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </>
            )}

            {selectedAttraction && viewMode === 'view' && (
                <AttractionDetailModal
                    attraction={selectedAttraction}
                    onClose={() => setSelectedAttraction(null)}
                    onEdit={() => setViewMode('edit')}
                    onDelete={() => handleDeleteClick(selectedAttraction.firestoreId, selectedAttraction.name)}
                />
            )}

            {selectedAttraction && viewMode === 'edit' && (
                <AttractionEditModal
                    attraction={selectedAttraction}
                    user={user}
                    onClose={() => setSelectedAttraction(null)}
                    onUpdate={handleUpdateAttraction}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setAttractionToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Atractivo"
                message={`¿Estás seguro de que deseas eliminar el atractivo "${attractionToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                variant="danger"
            />
        </>
    );
};

export default AttractionsManager;
