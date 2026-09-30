import type { User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAttractionsData } from '../../../context/AttractionsContext';
import { departmentsData } from '../../../data/colombiaMapData';
import { db } from '../../../firebase';
import type { FirestoreAttraction } from '../../../interfaces/attraction';
import Button from '../../UI/Button';
import ConfirmationModal from '../../UI/ConfirmationModal';
import Pagination from '../../UI/Pagination';
import { useToast } from '../../UI/Toast';
import AttractionDetailModal from './AttractionDetailModal';
import AttractionEditModal from './AttractionEditMotal';
import AttractionTable, { type AttractionSortKey } from './AttractionTable';

interface AttractionsManagerProps {
    user: User;
    onUpdateAttraction: () => void;
    searchQuery: string;
    selectedDepartment: string;
    selectedMunicipality: string;
    onCountsChange: (total: number) => void;
    refreshSignal: number;
    createSignal: number;
}

const AttractionsManager: React.FC<AttractionsManagerProps> = ({
    user,
    onUpdateAttraction,
    searchQuery,
    selectedDepartment,
    selectedMunicipality,
    onCountsChange,
    refreshSignal,
    createSignal,
}) => {
    const { refetch } = useAttractionsData();
    const { showToast } = useToast();
    const [allAttractions, setAllAttractions] = useState<FirestoreAttraction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttraction, setSelectedAttraction] = useState<FirestoreAttraction | null>(null);
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    const [sortKey, setSortKey] = useState<AttractionSortKey | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [attractionToDelete, setAttractionToDelete] = useState<{ firestoreId: string; name: string } | null>(null);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

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

    useEffect(() => {
        if (refreshSignal > 0) fetchAllAttractions();
    }, [refreshSignal, fetchAllAttractions]);

    const prevCreateRef = useRef(createSignal);

    useEffect(() => {
        if (createSignal > prevCreateRef.current) {
            setIsCreateModalOpen(true);
        }
        prevCreateRef.current = createSignal;
    }, [createSignal]);

    useEffect(() => {
        onCountsChange(allAttractions.length);
    }, [allAttractions.length, onCountsChange]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedDepartment, selectedMunicipality]);

    // Filtrar atracciones por búsqueda, departamento y municipio
    const filteredAttractions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return allAttractions.filter(attr => {
            const matchesDepartment = selectedDepartment === 'all' || attr.regionId === selectedDepartment;
            const matchesMunicipality = selectedMunicipality === 'all' || attr.municipalityId === selectedMunicipality;
            const matchesSearch = !q
                || attr.name.toLowerCase().includes(q)
                || attr.category.toLowerCase().includes(q)
                || (attr.municipalityName?.toLowerCase().includes(q) ?? false);
            return matchesDepartment && matchesMunicipality && matchesSearch;
        });
    }, [allAttractions, selectedDepartment, selectedMunicipality, searchQuery]);

    // Ordenar
    const sortedAttractions = useMemo(() => {
        if (!sortKey) return filteredAttractions;
        const dir = sortDirection === 'asc' ? 1 : -1;
        return [...filteredAttractions].sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case 'name':
                    cmp = a.name.localeCompare(b.name);
                    break;
                case 'category':
                    cmp = a.category.localeCompare(b.category);
                    break;
                case 'region': {
                    const loc = (attr: FirestoreAttraction) =>
                        `${departmentsData[attr.regionId]?.name || attr.regionId} · ${attr.municipalityName || ''}`;
                    cmp = loc(a).localeCompare(loc(b));
                    break;
                }
                case 'origin':
                    cmp = (Number(a.isUserProposal) - Number(b.isUserProposal)) || a.name.localeCompare(b.name);
                    break;
            }
            return cmp * dir;
        });
    }, [filteredAttractions, sortKey, sortDirection]);

    // Calcular atracciones paginadas
    const totalPages = Math.ceil(sortedAttractions.length / itemsPerPage);
    const currentAttractions = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedAttractions.slice(indexOfFirstItem, indexOfLastItem);
    }, [sortedAttractions, currentPage, itemsPerPage]);

    const handleSortChange = (key: AttractionSortKey) => {
        setSortDirection(prev => (sortKey === key && prev === 'asc' ? 'desc' : 'asc'));
        setSortKey(key);
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleToggleSelectAll = () => {
        const ids = currentAttractions.map(a => a.firestoreId);
        const allSelected = ids.length > 0 && ids.every(id => selectedIds.includes(id));
        setSelectedIds(prev => allSelected
            ? prev.filter(id => !ids.includes(id))
            : Array.from(new Set([...prev, ...ids]))
        );
    };

    const clearSelection = () => setSelectedIds([]);

    // Eliminar un atractivo (optimista, con rollback)
    const deleteAttraction = async (firestoreId: string, name: string) => {
        const previousAttractions = [...allAttractions];
        setAllAttractions(prev => prev.filter(attr => attr.firestoreId !== firestoreId));
        setSelectedAttraction(prev => prev?.firestoreId === firestoreId ? null : prev);
        setSelectedIds(prev => prev.filter(id => id !== firestoreId));
        setAttractionToDelete(null);
        setIsDeleteModalOpen(false);

        try {
            await deleteDoc(doc(db, 'attractions', firestoreId));
            await refetch();

            await addDoc(collection(db, 'notifications'), {
                userId: 'admin',
                type: 'attraction_deleted',
                attractionId: firestoreId,
                attractionName: name,
                message: `${user.displayName || 'Un administrador'} eliminó la atracción "${name}"`,
                read: false,
                createdAt: new Date()
            });
        } catch (error) {
            console.error("Error deleting attraction:", error);
            showToast("Error al eliminar la atracción. Se revertirá el cambio.", 'error');
            setAllAttractions(previousAttractions);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!attractionToDelete) return;
        await deleteAttraction(attractionToDelete.firestoreId, attractionToDelete.name);
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedIds.length === 0) return;

        const previousAttractions = [...allAttractions];
        const deletedNames = allAttractions
            .filter(attr => selectedIds.includes(attr.firestoreId))
            .map(attr => attr.name);

        setAllAttractions(prev => prev.filter(attr => !selectedIds.includes(attr.firestoreId)));
        setSelectedAttraction(prev => prev && selectedIds.includes(prev.firestoreId) ? null : prev);
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);

        try {
            await Promise.all(selectedIds.map(id => deleteDoc(doc(db, 'attractions', id))));
            await refetch();

            await addDoc(collection(db, 'notifications'), {
                userId: 'admin',
                type: 'attraction_deleted',
                attractionName: deletedNames[0] || '',
                message: `${user.displayName || 'Un administrador'} eliminó ${selectedIds.length} atractivos${deletedNames.length ? `: ${deletedNames.slice(0, 5).join(', ')}${deletedNames.length > 5 ? '...' : ''}` : ''}`,
                read: false,
                createdAt: new Date()
            });

            showToast(`${selectedIds.length} atractivo(s) eliminado(s) correctamente`, 'success');
        } catch (error) {
            console.error("Error deleting attractions:", error);
            showToast("Error al eliminar los atractivos. Se revertirá el cambio.", 'error');
            setAllAttractions(previousAttractions);
        }
    };

    const handleViewDetails = (attraction: FirestoreAttraction) => {
        setSelectedAttraction(attraction);
        setViewMode('view');
    };

    const handleUpdateAttraction = (updatedAttraction: FirestoreAttraction) => {
        setAllAttractions(prev =>
            prev.some(attr => attr.firestoreId === updatedAttraction.firestoreId)
                ? prev.map(attr => attr.firestoreId === updatedAttraction.firestoreId ? updatedAttraction : attr)
                : [updatedAttraction, ...prev]
        );
        onUpdateAttraction();
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
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 bg-gold-soft border border-gold/40 rounded-md">
                    <p className="text-sm font-medium text-ink">
                        {selectedIds.length} atractivo(s) seleccionado(s)
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={clearSelection}>
                            Cancelar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setIsBulkDeleteOpen(true)}>
                            Eliminar seleccionados
                        </Button>
                    </div>
                </div>
            )}

            {sortedAttractions.length === 0 ? (
                <div className="panel p-8 text-center mt-6">
                    <p className="text-sm text-ink-soft">
                        {allAttractions.length === 0
                            ? 'No hay atractivos turísticos en el sistema.'
                            : 'No hay atractivos que coincidan con la búsqueda o los filtros seleccionados.'
                        }
                    </p>
                </div>
            ) : (
                <>
                    <div className="mt-4">
                        <AttractionTable
                            attractions={currentAttractions}
                            selectedIds={selectedIds}
                            sortKey={sortKey}
                            sortDirection={sortDirection}
                            onSortChange={handleSortChange}
                            onToggleSelect={handleToggleSelect}
                            onToggleSelectAll={handleToggleSelectAll}
                            onView={handleViewDetails}
                            onEdit={(attr) => {
                                setSelectedAttraction(attr);
                                setViewMode('edit');
                            }}
                            onDelete={(attr) => {
                                setAttractionToDelete({ firestoreId: attr.firestoreId, name: attr.name });
                                setIsDeleteModalOpen(true);
                            }}
                        />
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={sortedAttractions.length}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </>
            )}

            {selectedAttraction && viewMode === 'view' && (
                <AttractionDetailModal
                    attraction={selectedAttraction}
                    onClose={() => setSelectedAttraction(null)}
                    onEdit={() => setViewMode('edit')}
                    onDelete={(firestoreId, name) => deleteAttraction(firestoreId, name)}
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

            {isCreateModalOpen && (
                <AttractionEditModal
                    user={user}
                    onClose={() => setIsCreateModalOpen(false)}
                    onUpdate={handleUpdateAttraction}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setAttractionToDelete(null);
                }}
                onConfirm={() => handleDeleteConfirm()}
                title="Eliminar Atractivo"
                message={`¿Estás seguro de que deseas eliminar el atractivo "${attractionToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                variant="danger"
            />

            <ConfirmationModal
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={() => handleBulkDeleteConfirm()}
                title="Eliminar Atractivos"
                message={`¿Estás seguro de que deseas eliminar ${selectedIds.length} atractivo(s) seleccionado(s)? Esta acción no se puede deshacer.`}
                confirmText="Eliminar todos"
                variant="danger"
            />
        </>
    );
};

export default AttractionsManager;