import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import type { User } from 'firebase/auth';
import { addDoc, collection, deleteField, doc, updateDoc } from 'firebase/firestore';
import { useRef, useState } from 'react';
import { departmentsData } from '../../../data/colombiaMapData';
import { DEPARTMENT_CENTERS } from '../../../data/departmentCenters';
import { getDefaultMunicipalityForDepartment, getMunicipalitiesForDepartment, getMunicipalityById } from '../../../data/municipalitiesData';
import { db } from '../../../firebase';
import type { FirestoreAttraction } from '../../../interfaces/attraction';
import { CATEGORIES_WITHOUT_TODOS } from '../../../utils/categories';
import { generateAttractionId } from '../../../utils/generateAttractionId';
import { IMAGE_FALLBACK } from '../../../utils/imageFallback';
import Button from '../../UI/Button';
import CategorySelect, { type CategoryOption } from '../../UI/CategorySelect';
import { useAttractionsData } from '../../../context/AttractionsContext';
import MapPicker from '../../UI/MapPicker';
import { useToast } from '../../UI/Toast';

const CATEGORY_OPTIONS: CategoryOption[] = CATEGORIES_WITHOUT_TODOS.map(({ label }) => ({
    value: label,
    label,
}));

const DEPARTMENT_OPTIONS: CategoryOption[] = Object.entries(departmentsData).map(([value, dept]) => ({
    value,
    label: dept.name,
}));

interface AttractionEditModalProps {
    attraction?: FirestoreAttraction;
    user: User;
    onClose: () => void;
    onUpdate: (updatedAttraction: FirestoreAttraction) => void;
}

type ImageMode = 'url' | 'upload';

const AttractionEditModal: React.FC<AttractionEditModalProps> = ({ attraction, user, onClose, onUpdate }) => {
    const { refetch } = useAttractionsData();
    const { showToast } = useToast();
    const isCreating = !attraction;
    const [formData, setFormData] = useState({
        name: attraction?.name || '',
        description: attraction?.description || '',
        image: attraction?.image || '',
        category: attraction?.category || '',
        regionId: attraction?.regionId || '',
        regionName: attraction?.regionName || '',
        latitude: attraction?.latitude,
        longitude: attraction?.longitude,
        municipalityId: attraction?.municipalityId || '',
        municipalityName: attraction?.municipalityName || ''
    });
    const [imageMode, setImageMode] = useState<ImageMode>(attraction?.image?.startsWith('data:') ? 'upload' : 'url');
    const [imageUrl, setImageUrl] = useState(attraction?.image?.startsWith('data:') ? '' : attraction?.image || '');
    const [imageError, setImageError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.municipalityId) {
                showToast("Debes seleccionar el municipio", 'error');
                setLoading(false);
                return;
            }

            if (!formData.image) {
                showToast("Debes agregar una imagen del atractivo", 'error');
                setLoading(false);
                return;
            }

            if (isCreating) {
                const attractionData = {
                    id: generateAttractionId(formData.name),
                    name: formData.name,
                    description: formData.description,
                    image: formData.image,
                    category: formData.category,
                    regionId: formData.regionId,
                    regionName: formData.regionName,
                    municipalityId: formData.municipalityId,
                    municipalityName: formData.municipalityName,
                    isUserProposal: false,
                    createdBy: user.uid,
                    createdAt: new Date(),
                    ...(formData.latitude != null && formData.longitude != null
                        ? { latitude: formData.latitude, longitude: formData.longitude }
                        : {})
                };

                const docRef = await addDoc(collection(db, 'attractions'), attractionData);

                await addDoc(collection(db, 'notifications'), {
                    userId: 'admin',
                    type: 'attraction_created',
                    attractionId: docRef.id,
                    attractionName: formData.name,
                    message: `${user.displayName || 'Administrador'} agregó la atracción "${formData.name}"`,
                    read: false,
                    createdAt: new Date()
                });

                const createdAttraction: FirestoreAttraction = {
                    firestoreId: docRef.id,
                    ...attractionData
                };

                showToast('Atractivo agregado correctamente', 'success');
                onUpdate(createdAttraction);
            } else {
                await updateDoc(doc(db, 'attractions', attraction.firestoreId), {
                    name: formData.name,
                    description: formData.description,
                    image: formData.image,
                    category: formData.category,
                    regionId: formData.regionId,
                    regionName: formData.regionName,
                    municipalityId: formData.municipalityId,
                    municipalityName: formData.municipalityName,
                    updatedBy: user.uid,
                    updatedAt: new Date(),
                    ...(formData.latitude != null && formData.longitude != null
                        ? { latitude: formData.latitude, longitude: formData.longitude }
                        : { latitude: deleteField(), longitude: deleteField() })
                });

                // Crear notificación
                await addDoc(collection(db, 'notifications'), {
                    userId: 'admin',
                    type: 'attraction_updated',
                    attractionId: attraction.firestoreId,
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
                    longitude: formData.longitude,
                    municipalityId: formData.municipalityId,
                    municipalityName: formData.municipalityName
                };

                showToast('Atractivo actualizado correctamente', 'success');
                onUpdate(updatedAttraction);
            }

            await refetch();
            onClose();
        } catch (error) {
            console.error("Error updating attraction:", error);
            showToast("Error al actualizar la atracción. Por favor intenta nuevamente.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFile = (file: File) => {
        setImageError(null);

        if (!file.type.startsWith('image/')) {
            setImageError("Por favor selecciona un archivo de imagen válido");
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            setImageError("La imagen no debe superar los 1MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                setFormData(prev => ({ ...prev, image: result }));
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
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const MUNICIPALITY_OPTIONS: CategoryOption[] = getMunicipalitiesForDepartment(formData.regionId).map((m) => ({
        value: m.id,
        label: m.name,
    }));

    const hasCoords = formData.latitude != null && formData.longitude != null;
    const inputClass = "field block";
    const labelClass = "field-label";

    return (
        <Dialog open={true} onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/60 transition-opacity" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="modal-card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="font-display text-xl font-semibold text-ink">
                                {isCreating ? 'Agregar Atractivo' : 'Editar Atractivo'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-ink-faint hover:text-ink text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Columna izquierda: datos básicos */}
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={inputClass}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
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
                                        <label className={labelClass}>
                                            Ubicación (Departamento)
                                        </label>
                                        <CategorySelect
                                            options={DEPARTMENT_OPTIONS}
                                            value={DEPARTMENT_OPTIONS.find(opt => opt.value === formData.regionId) || null}
                                            onChange={(option) => {
                                                const departmentName = option ? departmentsData[option.value]?.name : '';
                                                const defaultMuniId = getDefaultMunicipalityForDepartment(option?.value || '');
                                                const defaultMuni = getMunicipalityById(defaultMuniId);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    regionId: option?.value || '',
                                                    regionName: departmentName || '',
                                                    latitude: undefined,
                                                    longitude: undefined,
                                                    municipalityId: defaultMuni?.id || '',
                                                    municipalityName: defaultMuni?.name || ''
                                                }));
                                            }}
                                            placeholder="Selecciona el departamento"
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Municipio
                                        </label>
                                        <CategorySelect
                                            options={MUNICIPALITY_OPTIONS}
                                            value={MUNICIPALITY_OPTIONS.find(opt => opt.value === formData.municipalityId) || null}
                                            onChange={(option) => setFormData(prev => ({
                                                ...prev,
                                                municipalityId: option?.value || '',
                                                municipalityName: option?.label || ''
                                            }))}
                                            placeholder="Selecciona el municipio"
                                            isSearchable
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Descripción
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Columna derecha: imagen y ubicación */}
                                <div className="space-y-6">
                                    <div>
                                        <span className={labelClass}>
                                            Imagen del atractivo
                                        </span>

                                        <div className="relative mb-3">
                                            {formData.image ? (
                                                <img
                                                    src={formData.image}
                                                    alt="Vista previa"
                                                    className="w-full h-40 object-cover rounded-md bg-paper-deep"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = IMAGE_FALLBACK;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-40 rounded-md bg-paper-deep flex items-center justify-center">
                                                    <span className="text-sm text-ink-faint">Sin imagen</span>
                                                </div>
                                            )}
                                        </div>

                                        {imageMode === 'url' ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="url"
                                                    value={imageUrl}
                                                    onChange={(e) => {
                                                        setImageUrl(e.target.value);
                                                        setFormData(prev => ({ ...prev, image: e.target.value }));
                                                        setImageError(null);
                                                    }}
                                                    placeholder="https://ejemplo.com/imagen.jpg"
                                                    className={inputClass}
                                                    required
                                                />
                                                {imageError && (
                                                    <p className="text-sm text-clay">{imageError}</p>
                                                )}
                                                <p className="text-xs text-ink-faint">
                                                    ¿Prefieres subir un archivo?{" "}
                                                    <button
                                                        type="button"
                                                        className="underline text-clay"
                                                        onClick={() => setImageMode('upload')}
                                                    >
                                                        Subir imagen
                                                    </button>
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        setIsDragging(true);
                                                    }}
                                                    onDragLeave={() => setIsDragging(false)}
                                                    onDrop={handleDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`rounded-md border-2 border-dashed py-6 px-4 text-center cursor-pointer transition-colors ${isDragging
                                                        ? 'border-forest bg-forest-soft'
                                                        : 'border-rule hover:border-forest hover:bg-forest-soft'
                                                        }`}
                                                >
                                                    <p className="text-sm font-medium text-ink-soft m-0">
                                                        Arrastra una imagen aquí, o haz clic para subir
                                                    </p>
                                                    <p className="text-xs text-ink-faint mt-1 m-0">
                                                        Formatos aceptados: JPG, PNG, WEBP · Máximo 1MB
                                                    </p>
                                                </div>

                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                />

                                                {imageError && (
                                                    <p className="text-sm text-clay mt-2">{imageError}</p>
                                                )}

                                                <p className="text-xs text-ink-faint mt-2">
                                                    ¿No tienes el archivo?{" "}
                                                    <button
                                                        type="button"
                                                        className="underline text-clay"
                                                        onClick={() => {
                                                            setImageMode('url');
                                                            setFormData(prev => ({ ...prev, image: imageUrl }));
                                                        }}
                                                    >
                                                        Pegar URL de la imagen
                                                    </button>
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <span className={labelClass}>
                                            Ubicación en el mapa
                                        </span>

                                        {!showMap && !hasCoords && (
                                            <button
                                                type="button"
                                                onClick={() => setShowMap(true)}
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-rule bg-panel text-sm font-medium text-ink hover:bg-paper-deep transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                + Añadir ubicación exacta en el mapa
                                            </button>
                                        )}

                                        {!showMap && hasCoords && (
                                            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border border-rule bg-paper-deep">
                                                <p className="text-sm text-ink-soft m-0">
                                                    Ubicación fijada: {formData.latitude!.toFixed(5)}, {formData.longitude!.toFixed(5)}
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
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
                                                            setShowMap(false);
                                                        }}
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
                                                    latitude={formData.latitude}
                                                    longitude={formData.longitude}
                                                    fallbackCenter={DEPARTMENT_CENTERS[formData.regionId]}
                                                    height="240px"
                                                    onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                                                />
                                                <p className="text-xs text-ink-faint mt-2">
                                                    Haz clic en el mapa para fijar la ubicación. El zoom con la rueda se activa al hacer clic en el mapa.
                                                </p>
                                                {hasCoords && (
                                                    <p className="text-xs text-ink-faint mt-1">
                                                        Coordenadas: {formData.latitude!.toFixed(5)}, {formData.longitude!.toFixed(5)}
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

                                        {!hasCoords && !showMap && (
                                            <p className="text-xs text-ink-faint mt-2">
                                                El atractivo no tiene ubicación guardada. Si no fijas una, se guardará sin ubicación en el mapa.
                                            </p>
                                        )}
                                    </div>
                                </div>
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
                                    {loading ? 'Guardando...' : isCreating ? 'Agregar' : 'Guardar Cambios'}
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