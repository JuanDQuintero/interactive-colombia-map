import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DEPARTMENT_CENTERS } from '../../data/departmentCenters';
import { getMunicipalitiesForDepartment } from '../../data/municipalitiesData';
import { db } from '../../firebase';
import type { AttractionProposalInput } from '../../interfaces/attraction';
import { CATEGORY_SELECT_OPTIONS } from '../../utils/categories';
import Button from '../UI/Button';
import CategorySelect, { type CategoryOption } from '../UI/CategorySelect';
import Loader from '../UI/Loader';
import MapPicker from '../UI/MapPicker';
import { useToast } from '../UI/Toast';

interface ProposeAttractionFormProps {
    departmentId: string;
    onClose: () => void;
}

// Tipos para las opciones de imagen
type ImageSource = AttractionProposalInput['imageSource'];

const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const SectionTitle: React.FC<{ number: string; title: string }> = ({ number, title }) => (
    <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ink text-paper text-xs font-bold shrink-0">
            {number}
        </span>
        <h3 className="micro m-0">
            {title}
        </h3>
        <span className="rule-fill" />
    </div>
);

const ProposeAttractionForm: React.FC<ProposeAttractionFormProps> = ({ departmentId, onClose }) => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(CATEGORY_SELECT_OPTIONS[0]);
    const [selectedMunicipality, setSelectedMunicipality] = useState<CategoryOption | null>(null);
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [showMap, setShowMap] = useState(false);
    const [imageSource, setImageSource] = useState<ImageSource>('upload');
    const [imageUrl, setImageUrl] = useState('');
    const [imageBase64, setImageBase64] = useState<string>('');
    const [urlWarning, setUrlWarning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const objectUrlRef = useRef<string>('');

    const revokeObjectUrl = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = '';
        }
    };

    const auth = getAuth();
    const currentUser = auth.currentUser;

    const municipalityOptions = useMemo(
        () => getMunicipalitiesForDepartment(departmentId).map((m) => ({ value: m.id, label: m.name })),
        [departmentId]
    );

    useEffect(() => {
        setSelectedMunicipality(null);
    }, [departmentId]);

    // Revocar blob URL al desmontar el componente
    useEffect(() => () => {
        revokeObjectUrl();
    }, []);

    // Validación con debounce de la URL de imagen
    useEffect(() => {
        if (imageSource !== 'url' || !imageUrl) {
            setUrlWarning(false);
            return;
        }
        const timer = setTimeout(() => {
            setUrlWarning(!isValidUrl(imageUrl));
        }, 600);
        return () => clearTimeout(timer);
    }, [imageUrl, imageSource]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Verificar autenticación
        if (!currentUser) {
            showToast("Debes iniciar sesión para proponer un atractivo", 'error');
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

            // Validar que tengamos un municipio seleccionado
            if (!selectedMunicipality) {
                showToast("Por favor selecciona el municipio", 'error');
                setLoading(false);
                return;
            }

            // Preparar datos para Firestore
            const imageToSave = imageSource === 'url' ? imageUrl : imageBase64;

            const proposalData: AttractionProposalInput = {
                name: name.trim(),
                description: description.trim(),
                image: imageToSave,
                imageSource: imageSource,
                category: selectedCategory.label,
                categoryValue: selectedCategory.value,
                departmentId: departmentId,
                municipalityId: selectedMunicipality.value,
                municipalityName: selectedMunicipality.label,
                status: 'pending',
                createdAt: new Date(),
                userId: currentUser.uid,
                userName: currentUser.displayName || "Usuario anónimo",
                userEmail: currentUser.email
            };

            if (latitude != null && longitude != null) {
                proposalData.latitude = latitude;
                proposalData.longitude = longitude;
            }

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
                showToast("Ocurrió un error al enviar la propuesta. Por favor intenta nuevamente.", 'error');
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

    const handleMunicipalityChange = (selectedOption: CategoryOption | null) => {
        setSelectedMunicipality(selectedOption);
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrl(url);
        setImageError(null);
        setUrlWarning(false);
    };

    const handleFile = (file: File) => {
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

        // Crear URL local para vista previa (liberar la anterior si existía)
        revokeObjectUrl();
        const objectUrl = URL.createObjectURL(file);
        objectUrlRef.current = objectUrl;
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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
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
        revokeObjectUrl();
        setImageUrl('');
        setImageBase64('');
        setImageError(null);
        setUrlWarning(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const switchImageSource = (source: ImageSource) => {
        clearImage();
        setImageSource(source);
    };

    const clearLocation = () => {
        setLatitude(undefined);
        setLongitude(undefined);
        setShowMap(false);
    };

    const hasImage = imageUrl !== '' && imageError === null;
    const hasCoords = latitude != null && longitude != null;

    const disabledSubmit = useMemo(() => {
        return !name.trim() ||
            !description.trim() ||
            !isValidImage() ||
            !selectedCategory ||
            !selectedMunicipality;
    }, [name, description, imageUrl, imageBase64, imageSource, selectedCategory, selectedMunicipality]);

    const inputClass = "block w-full field transition-colors";
    const labelClass = "field-label";

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div
                className="modal-card w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="shrink-0 flex justify-between items-center px-6 py-4 border-b border-rule">
                    <h2 className="font-display text-xl font-semibold text-ink">
                        <span className="text-clay">Proponer</span> Nuevo Atractivo
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-ink-faint hover:text-ink text-2xl transition-colors"
                        aria-label="Cerrar"
                    >
                        &times;
                    </button>
                </div>

                {/* Loader */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader />
                        <p className="mt-4 text-ink-soft text-sm">Enviando propuesta...</p>
                    </div>
                )}

                {/* Mensaje de éxito */}
                {success && !loading && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="p-4 bg-forest-soft border border-forest/30 text-forest rounded-md">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-forest" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="font-display text-lg font-semibold text-forest">
                                        ¡Propuesta enviada con éxito!
                                    </h3>
                                    <div className="mt-2 text-sm text-forest">
                                        <p>
                                            Tu propuesta será revisada por nuestro equipo. Te notificaremos cuando sea aprobada.
                                        </p>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            type="button"
                                            className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-paper hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-forest transition-colors"
                                            onClick={onClose}
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                {!success && !loading && (
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-8">
                            {/* Bloque 1: ¿Qué es? */}
                            <div>
                                <SectionTitle number="1" title="¿Qué es?" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className={labelClass}>
                                            Nombre del atractivo*
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            className={inputClass}
                                            placeholder="Ej: Cascada La Chorrera"
                                            value={name}
                                            onChange={handleNameChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="category" className={labelClass}>
                                            Categoría*
                                        </label>
                                        <CategorySelect
                                            options={CATEGORY_SELECT_OPTIONS}
                                            value={selectedCategory}
                                            onChange={handleCategoryChange}
                                            placeholder="Selecciona una categoría"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bloque 2: ¿Dónde está? */}
                            <div>
                                <SectionTitle number="2" title="¿Dónde está?" />
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="municipality" className={labelClass}>
                                            Municipio*
                                        </label>
                                        <CategorySelect
                                            options={municipalityOptions}
                                            value={selectedMunicipality}
                                            onChange={handleMunicipalityChange}
                                            placeholder="Selecciona el municipio"
                                            isSearchable
                                        />
                                    </div>

                                    <div>
                                        <p className={labelClass}>
                                            Ubicación en el mapa <span className="text-ink-faint font-normal normal-case tracking-normal">(opcional)</span>
                                        </p>

                                        {!showMap && !hasCoords && (
                                            <button
                                                type="button"
                                                onClick={() => setShowMap(true)}
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-rule bg-panel px-4 py-2 text-sm font-medium text-ink hover:bg-paper-deep transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                + Añadir ubicación exacta en el mapa
                                            </button>
                                        )}

                                        {!showMap && hasCoords && (
                                            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border border-rule bg-paper-deep">
                                                <p className="text-sm text-ink-soft tabular-nums m-0">
                                                    Ubicación fijada: {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowMap(true)}
                                                        className="text-xs font-medium text-clay hover:underline"
                                                    >
                                                        Cambiar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={clearLocation}
                                                        className="text-xs font-medium text-clay hover:underline"
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {showMap && (
                                            <div>
                                                <MapPicker
                                                    latitude={latitude}
                                                    longitude={longitude}
                                                    fallbackCenter={DEPARTMENT_CENTERS[departmentId]}
                                                    height="260px"
                                                    onChange={(lat, lng) => {
                                                        setLatitude(lat);
                                                        setLongitude(lng);
                                                    }}
                                                />
                                                <p className="text-xs text-ink-faint mt-2">
                                                    Haz clic en el mapa para fijar la ubicación. El zoom con la rueda se activa al hacer clic en el mapa.
                                                </p>
                                                {hasCoords && (
                                                    <p className="text-xs text-ink-faint tabular-nums mt-1">
                                                        Coordenadas: {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
                                                    </p>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMap(false)}
                                                    className="mt-2 text-xs font-medium text-ink-faint hover:text-ink"
                                                >
                                                    Ocultar mapa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bloque 3: Detalles */}
                            <div>
                                <SectionTitle number="3" title="Detalles" />
                                <div className="space-y-4">
                                    <div>
                                        <span className={labelClass}>
                                            Imagen del atractivo*
                                        </span>

                                        {imageSource === 'url' ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="url"
                                                    className={inputClass}
                                                    placeholder="https://ejemplo.com/imagen.jpg"
                                                    value={imageUrl}
                                                    onChange={handleImageUrlChange}
                                                    required
                                                />
                                                {(urlWarning || imageError) && (
                                                    <p className="text-sm text-clay">
                                                        {urlWarning ? 'Por favor ingresa una URL válida' : imageError}
                                                    </p>
                                                )}
                                                <p className="text-xs text-ink-faint">
                                                    ¿Prefieres subir un archivo?{" "}
                                                    <button
                                                        type="button"
                                                        className="underline text-clay"
                                                        onClick={() => switchImageSource('upload')}
                                                    >
                                                        Arrastra o sube una imagen
                                                    </button>
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    role={hasImage ? undefined : 'button'}
                                                    tabIndex={hasImage ? undefined : 0}
                                                    onClick={hasImage ? undefined : openFilePicker}
                                                    onKeyDown={hasImage ? undefined : (e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            openFilePicker();
                                                        }
                                                    }}
                                                    onDragOver={(e) => {
                                                        if (!hasImage) {
                                                            e.preventDefault();
                                                            setIsDragging(true);
                                                        }
                                                    }}
                                                    onDragLeave={() => setIsDragging(false)}
                                                    onDrop={hasImage ? undefined : handleDrop}
                                                    className={`relative rounded-md border-2 overflow-hidden transition-colors ${
                                                        hasImage
                                                            ? 'border-solid border-rule'
                                                            : `border-dashed text-center cursor-pointer ${isDragging
                                                                ? 'border-forest bg-forest-soft'
                                                                : 'border-rule hover:border-forest/70 hover:bg-forest-soft/60'
                                                            }`
                                                    }`}
                                                >
                                                    {hasImage ? (
                                                        <div className="relative h-52">
                                                            <img
                                                                src={imageUrl}
                                                                alt="Vista previa"
                                                                className="w-full h-full object-cover"
                                                                onError={handleImageError}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    clearImage();
                                                                }}
                                                                className="absolute top-2 right-2 bg-clay text-paper p-1 rounded-full hover:opacity-90 transition-colors"
                                                                aria-label="Eliminar imagen"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="py-10 px-4 flex flex-col items-center gap-2">
                                                            <svg className="h-10 w-10 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M21 21V19.5M3 21V19.5M21 3v1.5M9 3v1.5M15 3v1.5M9 21v-1.5M15 21v-1.5" />
                                                            </svg>
                                                            <p className="text-sm font-medium text-ink-soft m-0">
                                                                Arrastra una imagen aquí, o haz clic para subir
                                                            </p>
                                                            <p className="text-xs text-ink-faint m-0">
                                                                Formatos aceptados: JPG, PNG, WEBP · Máximo 1MB
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                />

                                                {imageError && (
                                                    <p className="text-sm text-clay mt-2">
                                                        {imageError}
                                                    </p>
                                                )}

                                                {hasImage && imageSource === 'upload' && imageBase64 && (
                                                    <p className="text-xs text-forest mt-1">
                                                        Imagen lista para enviar ({Math.round(imageBase64.length / 1024)}KB)
                                                    </p>
                                                )}

                                                <p className="text-xs text-ink-faint mt-2">
                                                    ¿No tienes el archivo?{" "}
                                                    <button
                                                        type="button"
                                                        className="underline text-clay"
                                                        onClick={() => switchImageSource('url')}
                                                    >
                                                        Pegar URL de la imagen
                                                    </button>
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className={labelClass}>
                                            Descripción*
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={4}
                                            className={inputClass}
                                            placeholder="Describe el atractivo turístico..."
                                            value={description}
                                            onChange={handleDescriptionChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer fijo */}
                        <div className="shrink-0 border-t border-rule px-6 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs text-ink-faint hidden sm:block">
                                    * Campos obligatorios
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <Button type="button" variant="outline" onClick={onClose}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant={disabledSubmit ? 'outline' : 'primary'}
                                        disabled={disabledSubmit}
                                    >
                                        Enviar propuesta
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProposeAttractionForm;