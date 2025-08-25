import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import type { User } from 'firebase/auth';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../../firebase';
import type { FirestoreAttraction } from '../../interfaces/attraction';
import Button from '../UI/Button';

interface AttractionEditModalProps {
    attraction: FirestoreAttraction;
    user: User;
    onClose: () => void;
    onUpdate: (updatedAttraction: FirestoreAttraction) => void;
}

const AttractionEditModal: React.FC<AttractionEditModalProps> = ({ attraction, user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: attraction.name,
        description: attraction.description,
        image: attraction.image,
        category: attraction.category
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
                category: formData.category
            };

            onUpdate(updatedAttraction);
            onClose();
        } catch (error) {
            console.error("Error updating attraction:", error);
            alert("Error al actualizar la atracción. Por favor intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                >
                                    <option value="Pueblos y Cultura">Pueblos y Cultura</option>
                                    <option value="Aventura">Aventura</option>
                                    <option value="Naturaleza y Ecoturismo">Naturaleza y Ecoturismo</option>
                                    <option value="Familiar">Familiar</option>
                                    <option value="Otros">Otros</option>
                                </select>
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