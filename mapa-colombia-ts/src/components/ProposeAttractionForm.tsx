import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import { db } from '../firebase';
import Button from './UI/Button';
import Loader from './UI/Loader';

interface ProposeAttractionFormProps {
    departmentId: string;
    onClose: () => void;
}

// Tipos para las opciones de imagen
type ImageSource = 'url' | 'upload';

// Definir tipos para React Select
interface CategoryOption {
    value: string;
    label: string;
}

const categories: CategoryOption[] = [
    { value: 'pueblos_cultura', label: 'Pueblos y Cultura' },
    { value: 'aventura', label: 'Aventura' },
    { value: 'naturaleza_ecoturismo', label: 'Naturaleza y Ecoturismo' },
    { value: 'familiar', label: 'Familiar' },
    { value: 'otros', label: 'Otros' }
];

// Estilos para React Select (modo claro)
const customStyles = {
    menu: (provided: any) => ({
        ...provided,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #eaeaea',
        padding: '10px 0',
        background: 'white',
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        color: state.isSelected ? 'white' : state.data.color || '#333',
        padding: '12px 20px',
        background: state.isSelected
            ? state.data.color || '#0065FF'
            : state.isFocused
                ? (state.data.color ? `${state.data.color}20` : '#f0f7ff')
                : 'white',
        '&:active': {
            background: state.data.color || '#0065FF',
            color: 'white'
        }
    }),
    control: (provided: any, state: any) => ({
        ...provided,
        borderRadius: '8px',
        borderColor: state.isFocused ? '#0065FF' : '#eaeaea',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 101, 255, 0.2)' : 'none',
        padding: '4px',
        '&:hover': {
            borderColor: state.isFocused ? '#0065FF' : '#ccc'
        }
    }),
    singleValue: (provided: any, state: any) => ({
        ...provided,
        color: state.data.color || '#333',
        fontWeight: '500'
    })
};

// Estilos para el tema oscuro
const darkStyles = {
    menu: (provided: any) => ({
        ...provided,
        borderRadius: '8px',
        background: '#2D3748',
        color: 'white',
        border: '1px solid #4A5568',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        padding: '10px 0',
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        color: state.isSelected ? 'white' : 'white',
        padding: '12px 20px',
        background: state.isSelected
            ? state.data.color || '#0065FF'
            : state.isFocused
                ? (state.data.color ? `${state.data.color}40` : '#4A5568')
                : '#2D3748',
        '&:active': {
            background: state.data.color || '#0065FF'
        }
    }),
    control: (provided: any, state: any) => ({
        ...provided,
        borderRadius: '8px',
        background: '#2D3748',
        border: '2px solid #4A5568',
        color: 'white',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(66, 153, 225, 0.5)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#0065FF' : '#4A5568'
        }
    }),
    singleValue: (provided: any, state: any) => ({
        ...provided,
        color: state.data.color || 'white',
        fontWeight: '500'
    }),
    input: (provided: any) => ({
        ...provided,
        color: 'white'
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: '#A0AEC0'
    }),
    indicatorSeparator: (provided: any) => ({
        ...provided,
        backgroundColor: '#4A5568'
    }),
    dropdownIndicator: (provided: any) => ({
        ...provided,
        color: '#A0AEC0',
        '&:hover': {
            color: 'white'
        }
    })
};

const ProposeAttractionForm: React.FC<ProposeAttractionFormProps> = ({ departmentId, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(categories[0]);
    const [imageSource, setImageSource] = useState<ImageSource>('url');
    const [imageUrl, setImageUrl] = useState('');
    const [imageBase64, setImageBase64] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Detectar modo oscuro
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        // Verificar inicialmente
        checkDarkMode();

        // Observar cambios en el tema
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    checkDarkMode();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Verificar autenticación
        if (!currentUser) {
            alert("Debes iniciar sesión para proponer un atractivo");
            return;
        }

        setLoading(true);
        setImageError(null);

        try {
            // Validar que tengamos una imagen válida
            if (!isValidImage()) {
                setImageError("Por favor proporciona una imagen válida");
                setLoading(false);
                return;
            }

            // Preparar datos para Firestore
            const imageToSave = imageSource === 'url' ? imageUrl : imageBase64;

            const proposalData = {
                name: name.trim(),
                description: description.trim(),
                image: imageToSave,
                imageSource: imageSource,
                category: selectedCategory.label,
                categoryValue: selectedCategory.value,
                departmentId: departmentId,
                status: 'pending',
                createdAt: new Date(),
                userId: currentUser.uid,
                userName: currentUser.displayName || "Usuario anónimo",
                userEmail: currentUser.email
            };

            // Guardar propuesta en Firestore
            const proposalRef = await addDoc(collection(db, 'attractionProposals'), proposalData);

            // Crear notificación para administradores
            await addDoc(collection(db, 'notifications'), {
                type: 'new_proposal',
                message: `Nueva propuesta: ${name} por ${currentUser.displayName || "Usuario anónimo"}`,
                proposalId: proposalRef.id,
                proposalName: name,
                userId: 'admin',
                read: false,
                createdAt: new Date()
            });

            setSuccess(true);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error al enviar la propuesta:", error);

            if (error.code === 'invalid-argument') {
                setImageError("Los datos de la imagen no son válidos");
            } else if (error.message.includes('size') || error.message.includes('large')) {
                setImageError("La imagen es demasiado grande. Intenta con una más pequeña");
            } else {
                alert("Ocurrió un error al enviar la propuesta. Por favor intenta nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleCategoryChange = (selectedOption: CategoryOption | null) => {
        if (selectedOption) {
            setSelectedCategory(selectedOption);
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrl(url);
        setImageError(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError(null);

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            setImageError("Por favor selecciona un archivo de imagen válido");
            return;
        }

        // Validar tamaño (máximo 1MB para Base64)
        if (file.size > 1 * 1024 * 1024) {
            setImageError("La imagen no debe superar los 1MB");
            return;
        }

        // Crear URL local para vista previa
        const objectUrl = URL.createObjectURL(file);
        setImageUrl(objectUrl);

        // Convertir a Base64 para enviar a Firestore
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result && typeof event.target.result === 'string') {
                setImageBase64(event.target.result);
            }
        };
        reader.onerror = () => {
            setImageError("Error al procesar la imagen");
        };
        reader.readAsDataURL(file);
    };

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const isValidImage = (): boolean => {
        if (imageSource === 'url') {
            return imageUrl !== '' && isValidUrl(imageUrl);
        } else {
            return imageBase64 !== '' && imageUrl !== '';
        }
    };

    const handleImageError = () => {
        setImageError("No se pudo cargar la imagen. Verifica que la URL sea correcta");
    };

    const clearImage = () => {
        setImageUrl('');
        setImageBase64('');
        setImageError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const switchImageSource = (source: ImageSource) => {
        setImageSource(source);
        setImageUrl('');
        setImageBase64('');
        setImageError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const disabledSubmit = useMemo(() => {
        return !name.trim() ||
            !description.trim() ||
            !isValidImage() ||
            !selectedCategory;
    }, [name, description, imageUrl, imageBase64, imageSource, selectedCategory]);

    // Seleccionar estilos según el modo
    const selectStyles = isDarkMode ? darkStyles : customStyles;

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
                                <div className="flex justify-end mt-4">
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
                                type="text"
                                className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                                placeholder="Ej: Cascada La Chorrera"
                                value={name}
                                onChange={handleNameChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descripción*
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                                placeholder="Describe el atractivo turístico..."
                                value={description}
                                onChange={handleDescriptionChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Imagen del atractivo*
                            </label>
                            <div className="flex space-x-2 mb-3">
                                <button
                                    type="button"
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${imageSource === 'url' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    onClick={() => switchImageSource('url')}
                                >
                                    Usar URL
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${imageSource === 'upload' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    onClick={() => switchImageSource('upload')}
                                >
                                    Subir imagen
                                </button>
                            </div>

                            {imageSource === 'url' ? (
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        value={imageUrl}
                                        onChange={handleImageUrlChange}
                                        required
                                    />
                                    {imageUrl && !isValidUrl(imageUrl) && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            Por favor ingresa una URL válida
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/40 transition-colors"
                                        onChange={handleFileUpload}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Formatos aceptados: JPG, PNG, WEBP. Tamaño máximo: 1MB
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Vista previa de imagen */}
                        {imageUrl && !imageError && (
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Vista previa
                                </label>
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img
                                        src={imageUrl}
                                        alt="Vista previa"
                                        className="w-full h-full object-cover"
                                        onError={handleImageError}
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
                                {imageSource === 'upload' && imageBase64 && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Imagen lista para enviar ({Math.round(imageBase64.length / 1024)}KB)
                                    </p>
                                )}
                            </div>
                        )}

                        {imageError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {imageError}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Categoría*
                            </label>
                            <Select
                                options={categories}
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                styles={selectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Selecciona una categoría"
                                isSearchable={false}
                            />
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
                                type="submit"
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