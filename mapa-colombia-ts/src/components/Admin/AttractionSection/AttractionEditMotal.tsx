import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import type { User } from 'firebase/auth';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../../../firebase';
import type { FirestoreAttraction } from '../../../interfaces/attraction';
import Button from '../../UI/Button';
import CategorySelect, { type CategoryOption } from '../../UI/CategorySelect';
import { useAttractionsData } from '../../../context/AttractionsContext';
import { departmentsData } from '../../../data/colombiaMapData';
import { DEPARTMENT_CENTERS } from '../../../data/departmentCenters';
import MapPicker from '../../UI/MapPicker';

const CATEGORY_OPTIONS: CategoryOption[] = [
    { value: 'Pueblos y Cultura', label: 'Pueblos y Cultura' },
    { value: 'Aventura', label: 'Aventura' },
    { value: 'Naturaleza y Ecoturismo', label: 'Naturaleza y Ecoturismo' },
    { value: 'Familiar', label: 'Familiar' },
    { value: 'Otros', label: 'Otros' },
];

const DEPARTMENT_OPTIONS: CategoryOption[] = Object.entries(departmentsData).map(([value, dept]) => ({
    value,
    label: dept.name,
}));

interface AttractionEditModalProps {
    attraction: FirestoreAttraction;
    user: User;
    onClose: () => void;
    onUpdate: (updatedAttraction: FirestoreAttraction) => void;
}

const AttractionEditModal: React.FC<AttractionEditModalProps> = ({ attraction, user, onClose, onUpdate }) => {
    const { refetch } = useAttractionsData();
    const [formData, setFormData] = useState({
        name: attraction.name,
        description: attraction.description,
        image: attraction.image,
        category: attraction.category,
        regionId: attraction.regionId,
        regionName: attraction.regionName,
        latitude: attraction.latitude,
        longitude: attraction.longitude
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateDoc(doc(db, 'attractions', attraction.id), {
                ...formData,
                updatedBy: user.uid,
                updatedAt: new Date()
            });

            // Crear notificación
            await addDoc(collection(db, 'notifications'), {
                userId: 'admin',
                type: 'attraction_updated',
                attractionId: attraction.id,
                attractionName: formData.name,
                message: `${user.displayName || 'Administrador'} actualizó la atracción "${attraction.name}"`,
                read: false,
                createdAt: new Date()
            });

            // Crear objeto actualizado para pasar al callback
            const updatedAttraction: FirestoreAttraction = {
                ...attraction,
                name: formData.name,
                description: formData.description,
                image: formData.image,
                category: formData.category,
                regionId: formData.regionId,
                regionName: formData.regionName,
                latitude: formData.latitude,
                longitude: formData.longitude
            };

            onUpdate(updatedAttraction);
            await refetch();
            onClose();
        } catch (error) {
            console.error("Error updating attraction:", error);
            alert("Error al actualizar la atracción. Por favor intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={true} onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/60 transition-opacity" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                Editar Atractivo
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    URL de la imagen
                                </label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Categoría
                                </label>
                                <CategorySelect
                                    options={CATEGORY_OPTIONS}
                                    value={CATEGORY_OPTIONS.find(opt => opt.value === formData.category) || null}
                                    onChange={(option) => setFormData(prev => ({ ...prev, category: option?.value || '' }))}
                                    placeholder="Selecciona una categoría"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Ubicación (Departamento)
                                </label>
                                <CategorySelect
                                    options={DEPARTMENT_OPTIONS}
                                    value={DEPARTMENT_OPTIONS.find(opt => opt.value === formData.regionId) || null}
                                    onChange={(option) => {
                                        const departmentName = option ? departmentsData[option.value]?.name : '';
                                        setFormData(prev => ({
                                            ...prev,
                                            regionId: option?.value || '',
                                            regionName: departmentName || '',
                                            latitude: undefined,
                                            longitude: undefined
                                        }));
                                    }}
                                    placeholder="Selecciona el departamento"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Ubicación en el mapa
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Haz clic en el mapa o arrastra el marcador para fijar la ubicación exacta.
                                </p>
                                <MapPicker
                                    latitude={formData.latitude}
                                    longitude={formData.longitude}
                                    fallbackCenter={DEPARTMENT_CENTERS[formData.regionId]}
                                    onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                                />
                                {formData.latitude != null && formData.longitude != null && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Coordenadas: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default AttractionEditModal;