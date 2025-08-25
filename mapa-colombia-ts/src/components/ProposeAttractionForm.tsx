import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { db } from '../firebase';
import Button from './UI/Button';
import Loader from './UI/Loader';

interface ProposeAttractionFormProps {
    departmentId: string;
    onClose: () => void;
}

const categories = [
    "Pueblos y Cultura",
    "Aventura",
    "Naturaleza y Ecoturismo",
    "Familiar",
    "Otros"
];

const ProposeAttractionForm: React.FC<ProposeAttractionFormProps> = ({ departmentId, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        category: categories[0]
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imageError, setImageError] = useState(false);

    const auth = getAuth();
    const currentUser = auth.currentUser;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Verificar autenticación
        if (!currentUser) {
            alert("Debes iniciar sesión para proponer un atractivo");
            return;
        }

        setLoading(true);

        try {
            // Validar que la URL de la imagen sea válida
            if (!isValidUrl(formData.imageUrl) && !imageFile) {
                alert("Por favor ingresa una URL de imagen válida o sube un archivo");
                setLoading(false);
                return;
            }

            // Guardar propuesta en Firestore
            const proposalRef = await addDoc(collection(db, 'attractionProposals'), {
                name: formData.name,
                description: formData.description,
                image: formData.imageUrl,
                category: formData.category,
                departmentId,
                status: 'pending',
                createdAt: new Date(),
                userId: currentUser?.uid || "anonymous",
                userName: currentUser?.displayName || "Usuario anónimo"
            });

            // Crear notificación para administradores
            await addDoc(collection(db, 'notifications'), {
                type: 'new_proposal',
                message: `Nueva propuesta: ${formData.name} por ${currentUser?.displayName || "Usuario anónimo"}`,
                proposalId: proposalRef.id,
                proposalName: formData.name,
                userId: 'admin',
                read: false,
                createdAt: new Date()
            });

            setSuccess(true);
        } catch (error: unknown) {
            console.error("Error al enviar la propuesta:", error);

            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                typeof (error as { code: unknown }).code === 'string'
            ) {
                const code = (error as { code: string }).code;
                if (code === 'storage/unauthorized') {
                    alert("No tienes permisos para subir imágenes. Por favor inicia sesión.");
                } else if (code === 'storage/canceled') {
                    alert("La subida fue cancelada.");
                } else {
                    alert("Ocurrió un error al enviar la propuesta. Por favor intenta nuevamente.");
                }
            } else {
                alert("Ocurrió un error al enviar la propuesta. Por favor intenta nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Resetear error de imagen cuando se cambia la URL
        if (name === 'imageUrl') {
            setImageError(false);
        }
    };

    const handleCategoryChange = (category: string) => {
        setFormData(prev => ({ ...prev, category }));
    };

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const clearImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        setImageFile(null);
        setImageError(false);
    };

    const disabledSubmit = useMemo(() => {
        return !formData.name ||
            !formData.description ||
            (!formData.imageUrl && !imageFile) ||
            (Boolean(formData.imageUrl) && !isValidUrl(formData.imageUrl));
    }, [formData.name, formData.description, formData.imageUrl, imageFile]);

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center pb-3 mb-6 border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        <span className="text-blue-600 dark:text-blue-400">Proponer</span> Nuevo Atractivo
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors"
                        aria-label="Cerrar"
                    >
                        &times;
                    </button>
                </div>

                {/* Loader */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader />
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Enviando propuesta...</p>
                    </div>
                )}

                {/* Mensaje de éxito */}
                {success && !loading && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                                    ¡Propuesta enviada con éxito!
                                </h3>
                                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                    <p>
                                        Tu propuesta será revisada por nuestro equipo. Te notificaremos cuando sea aprobada.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                        onClick={onClose}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                {!success && !loading && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nombre del atractivo*
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                                placeholder="Ej: Cascada La Chorrera"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descripción*
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                                placeholder="Describe el atractivo turístico..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Imagen del atractivo*
                            </label>

                            {/* Selector de fuente de imagen */}
                            <div className="flex space-x-2 mb-3">
                                <p className='text-xs text-gray-400 dark:text-gray-300' >Pega la URL de la imagen</p>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="url"
                                    name="imageUrl"
                                    className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    required
                                />
                                {formData.imageUrl && !isValidUrl(formData.imageUrl) && (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Por favor ingresa una URL válida
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Vista previa de la imagen */}
                        {(formData.imageUrl && !imageError) && (
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Vista previa
                                </label>
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img
                                        src={formData.imageUrl}
                                        alt="Vista previa"
                                        className="w-full h-full object-cover"
                                        onError={handleImageError}
                                        onLoad={() => setImageError(false)}
                                    />
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                        aria-label="Eliminar imagen"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {imageError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    No se pudo cargar la imagen. Por favor verifica la URL o selecciona otra imagen.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Categoría*
                            </label>
                            <Listbox value={formData.category} onChange={handleCategoryChange}>
                                <div className="relative mt-1">
                                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-2 text-left text-gray-900 dark:text-gray-100 outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:focus-visible:outline-blue-400 transition-colors">
                                        <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                                            <span className="block truncate">{formData.category}</span>
                                        </span>
                                        <ChevronUpDownIcon
                                            aria-hidden="true"
                                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 dark:text-gray-400"
                                        />
                                    </ListboxButton>

                                    <ListboxOptions
                                        transition
                                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 py-1 text-base shadow-lg outline outline-1 outline-black/5 dark:outline-gray-600 data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
                                    >
                                        {categories.map((category) => (
                                            <ListboxOption
                                                key={category}
                                                value={category}
                                                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-gray-100 data-[focus]:bg-blue-600 data-[focus]:text-white data-[focus]:outline-none"
                                            >
                                                <div className="flex items-center">
                                                    <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                                                        {category}
                                                    </span>
                                                </div>

                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400 group-[:not([data-selected])]:hidden group-data-[focus]:text-white">
                                                    <CheckIcon aria-hidden="true" className="size-5" />
                                                </span>
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </div>
                            </Listbox>
                        </div>


                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                disabled={disabledSubmit}
                            >
                                Enviar propuesta
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProposeAttractionForm;