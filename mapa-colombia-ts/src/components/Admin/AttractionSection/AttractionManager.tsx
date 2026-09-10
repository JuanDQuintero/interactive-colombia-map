import type { User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    const [allAttractions, setAllAttractions] = useState<FirestoreAttraction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedAttraction, setSelectedAttraction] = useState<FirestoreAttraction | null>(null);
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [attractionToDelete, setAttractionToDelete] = useState<{ firestoreId: string; name: string } | null>(null);

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // Fetch all attractions
    const fetchAllAttractions = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'attractions'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            if (!isMountedRef.current) return;

            const attractionsData: FirestoreAttraction[] = querySnapshot.docs.map(doc => ({
                firestoreId: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            } as FirestoreAttraction));

            setAllAttractions(attractionsData);
        } catch (error) {
            console.error("Error fetching attractions:", error);
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllAttractions();
    }, [fetchAllAttractions]);

    // Filtrar atracciones por departamento
    const filteredAttractions = useMemo(() => {
        if (selectedDepartment === 'all') return allAttractions;
        return allAttractions.filter(attr => attr.regionId === selectedDepartment);
    }, [allAttractions, selectedDepartment]);

    // Calcular atracciones paginadas
    const totalPages = Math.ceil(filteredAttractions.length / itemsPerPage);
    const currentAttractions = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredAttractions.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredAttractions, currentPage, itemsPerPage]);

    const handleDepartmentChange = (dept: string) => {
        setSelectedDepartment(dept);
        setCurrentPage(1);
    };

    const handleDeleteClick = (firestoreId: string, name: string) => {
        setAttractionToDelete({ firestoreId, name });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!attractionToDelete) return;
        const previousAttractions = [...allAttractions];
        const targetId = attractionToDelete.firestoreId;
        const targetName = attractionToDelete.name;

        setAllAttractions(prev => prev.filter(attr => attr.firestoreId !== targetId));
        setIsDeleteModalOpen(false);

        try {
            await deleteDoc(doc(db, 'attractions', targetId));

            await addDoc(collection(db, 'notifications'), {
                userId: 'admin',
                type: 'attraction_deleted',
                attractionId: targetId,
                attractionName: targetName,
                message: `${user.displayName || 'Un administrador'} eliminó la atracción "${targetName}"`,
                read: false,
                createdAt: new Date()
            });
        } catch (error) {
            console.error("Error deleting attraction:", error);
            alert("Error al eliminar la atracción. Se revertirá el cambio.");
            // Rollback en caso de fallo
            setAllAttractions(previousAttractions);
        } finally {
            setAttractionToDelete(null);
        }
    };

    const handleViewDetails = (attraction: FirestoreAttraction) => {
        setSelectedAttraction(attraction);
        setViewMode('view');
    };

    const handleUpdateAttraction = (updatedAttraction: FirestoreAttraction) => {
        setAllAttractions(prev =>
            prev.map(attr => attr.firestoreId === updatedAttraction.firestoreId ? updatedAttraction : attr)
        );
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
                    onDepartmentChange={handleDepartmentChange}
                />
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    Actualizar
                </button>
            </div>

            {filteredAttractions.length === 0 ? (
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
                        totalItems={filteredAttractions.length}
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
