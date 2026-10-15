import type { User } from 'firebase/auth';
import React, { useRef, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import type { NewTripInput, PublishTripResult } from '../../hooks/useTrips';
import {
    TRIP_DURATIONS,
    TRIP_MAX_PHOTOS,
    TRIP_MAX_PHOTO_BYTES,
    TRIP_MIN_PHOTOS,
    TRIP_TRANSPORTS,
    type TripDuration,
    type TripTransport,
} from '../../interfaces/trip';
import {
    canAddPhoto,
    canAddTip,
    isValidBudget,
    isValidPhotoFile,
    isValidTitle,
    titleMaxLength,
} from '../../utils/trips';
import { formatCop } from '../../utils/trips';
import Button from '../UI/Button';
import { useToast } from '../UI/Toast';

interface TripFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (input: NewTripInput) => Promise<PublishTripResult>;
    publishing: boolean;
    user: User;
    municipalityId: string;
    municipalityName: string;
    departmentId: string;
}

const STEP_TITLES = ['Datos clave', 'Presupuesto y tips', 'Galería'];

const TripFormModal: React.FC<TripFormModalProps> = ({
    isOpen,
    onClose,
    onPublish,
    publishing,
    user,
    municipalityId,
    municipalityName,
    departmentId,
}) => {
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(0);
    const [title, setTitle] = useState('');
    const [transport, setTransport] = useState<TripTransport>('flota');
    const [duration, setDuration] = useState<TripDuration>('pasadia');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [tips, setTips] = useState<string[]>(['']);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [warning, setWarning] = useState<{ step: number; message: string } | null>(null);

    const stepThreeValid = photos.length >= TRIP_MIN_PHOTOS;

    const stepWarning = (): string | null => {
        if (step === 0) {
            return isValidTitle(title)
                ? null
                : 'Ponle un nombre al viaje (mínimo 5 caracteres) para que otros viajeros entiendan a dónde vas.';
        }
        if (step === 1) {
            const minValue = Number(budgetMin);
            if (!minValue || minValue <= 0) {
                return 'Escribe cuánto se gasta por persona (mínimo) en pesos.';
            }
            if (!isValidBudget(budgetMin, budgetMax)) {
                return 'El valor máximo debe ser mayor que el mínimo.';
            }
            if (!tips.some(tip => tip.trim().length > 0)) {
                return 'Escribe al menos un tip para quien vaya después.';
            }
            return null;
        }
        return stepThreeValid
            ? null
            : `Sube al menos ${TRIP_MIN_PHOTOS} fotos del lugar para poder publicar el viaje.`;
    };

    const reset = () => {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setStep(0);
        setTitle('');
        setTransport('flota');
        setDuration('pasadia');
        setBudgetMin('');
        setBudgetMax('');
        setTips(['']);
        setPhotos([]);
        setPreviewUrls([]);
        setPhotoError(null);
    };

    const handleClose = () => {
        if (publishing) return;
        reset();
        onClose();
    };

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const incoming = Array.from(files);
        if (photos.length + incoming.length > TRIP_MAX_PHOTOS) {
            setPhotoError(`Puedes subir hasta ${TRIP_MAX_PHOTOS} fotos`);
            return;
        }
        const invalid = incoming.find(file => !isValidPhotoFile(file));
        if (invalid) {
            setPhotoError(
                invalid.size > TRIP_MAX_PHOTO_BYTES
                    ? `“${invalid.name}” supera 1.5 MB`
                    : `“${invalid.name}” no es una imagen`
            );
            return;
        }
        setPhotoError(null);
        setPhotos(current => [...current, ...incoming]);
        setPreviewUrls(current => [...current, ...incoming.map(file => URL.createObjectURL(file))]);
    };

    const removePhoto = (index: number) => {
        setPhotos(current => current.filter((_, i) => i !== index));
        setPreviewUrls(current => {
            URL.revokeObjectURL(current[index]);
            return current.filter((_, i) => i !== index);
        });
    };

    const handlePublish = async () => {
        const publishWarning = stepWarning();
        if (publishWarning) {
            setWarning({ step, message: publishWarning });
            return;
        }
        const result = await onPublish({
            municipalityId,
            municipalityName,
            departmentId,
            title,
            transport,
            duration,
            budgetMin: Number(budgetMin),
            budgetMax: budgetMax ? Number(budgetMax) : null,
            tips: tips.filter(tip => tip.trim().length > 0),
            photos,
            userId: user.uid,
            userName: user.displayName ?? 'Viajero',
        });
        if (result.ok) {
            showToast('Viaje publicado. Aparecerá en la lista del municipio.', 'success');
            reset();
            onClose();
        } else {
            setWarning({ step, message: result.message ?? 'No pudimos publicar tu viaje.' });
            showToast('No pudimos publicar tu viaje', 'error');
        }
    };

    const handleContinue = () => {
        const stepProblem = stepWarning();
        if (stepProblem) {
            setWarning({ step, message: stepProblem });
            return;
        }
        setWarning(null);
        setStep(current => current + 1);
    };

    const activeWarning = warning && warning.step === step && stepWarning() !== null ? warning.message : null;

    return (
        <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/60 transition-opacity" />

            <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
                <DialogPanel className="modal-card flex max-h-[92vh] w-full max-w-lg flex-col rounded-b-none sm:rounded-md">
                    <div className="shrink-0 border-b border-rule px-6 py-4">
                        <p className="micro">Publica tu viaje a {municipalityName}</p>
                        <DialogTitle className="mt-1 font-display text-lg font-semibold text-ink">
                            Comparte cómo es ir a {municipalityName}
                        </DialogTitle>
                        <div className="mt-3 flex items-center gap-2">
                            {STEP_TITLES.map((label, index) => (
                                <div key={label} className="flex flex-1 items-center gap-2">
                                    <span
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums ${
                                            index <= step
                                                ? 'border-forest bg-forest text-paper'
                                                : 'border-rule text-ink-faint'
                                        }`}
                                    >
                                        {index + 1}
                                    </span>
                                    <span className={`text-[11px] ${index === step ? 'font-semibold text-ink' : 'text-ink-faint'}`}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                        {step === 0 && (
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="trip-title" className="field-label">
                                        Nombre del viaje
                                    </label>
                                    <input
                                        id="trip-title"
                                        value={title}
                                        onChange={event => setTitle(event.target.value.slice(0, titleMaxLength))}
                                        placeholder="Ej: Ruta del fin de semana a Salento"
                                        className="field mt-1 w-full"
                                    />
                                </div>

                                <div>
                                    <span className="field-label">Cómo llegas</span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {TRIP_TRANSPORTS.map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setTransport(option.id)}
                                                className={`cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                                                    transport === option.id
                                                        ? 'border-ink bg-ink text-paper'
                                                        : 'border-rule bg-panel text-ink-soft hover:bg-paper-deep hover:text-ink'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="field-label">Cuánto dura el plan</span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {TRIP_DURATIONS.map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setDuration(option.id)}
                                                className={`cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                                                    duration === option.id
                                                        ? 'border-ink bg-ink text-paper'
                                                        : 'border-rule bg-panel text-ink-soft hover:bg-paper-deep hover:text-ink'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <span className="field-label">Presupuesto por persona (COP)</span>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div>
                                            <input
                                                type="number"
                                                min={0}
                                                step={5000}
                                                value={budgetMin}
                                                onChange={event => setBudgetMin(event.target.value)}
                                                placeholder="30000"
                                                className="field w-full"
                                            />
                                            {budgetMin && Number(budgetMin) > 0 && (
                                                <p className="mt-1 text-[11px] tabular-nums text-ink-faint">
                                                    {formatCop(Number(budgetMin))}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-ink-faint">hasta</span>
                                        <div>
                                            <input
                                                type="number"
                                                min={0}
                                                step={5000}
                                                value={budgetMax}
                                                onChange={event => setBudgetMax(event.target.value)}
                                                placeholder="opcional"
                                                className="field w-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className="field-label">Tips para quien vaya después</span>
                                    <div className="mt-2 space-y-2">
                                        {tips.map((tip, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    value={tip}
                                                    onChange={event =>
                                                        setTips(current =>
                                                            current.map((value, i) => (i === index ? event.target.value : value))
                                                        )
                                                    }
                                                    maxLength={90}
                                                    placeholder="Ej: lleva efectivo, no hay cajeros"
                                                    className="field w-full"
                                                />
                                                {tips.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setTips(current => current.filter((_, i) => i !== index))}
                                                        className="cursor-pointer px-1 text-ink-faint hover:text-clay"
                                                        aria-label="Quitar tip"
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {canAddTip(tips) && (
                                        <button
                                            type="button"
                                            onClick={() => setTips(current => [...current, ''])}
                                            className="mt-2 cursor-pointer text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint hover:text-ink"
                                        >
                                            + Agregar otro tip
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <span className="field-label">
                                    Fotos ({photos.length}/{TRIP_MIN_PHOTOS}–{TRIP_MAX_PHOTOS})
                                </span>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {previewUrls.map((url, index) => (
                                        <div key={url} className="relative">
                                            <img src={url} alt="" className="h-24 w-full rounded-md object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute right-1 top-1 cursor-pointer rounded-full bg-ink/80 px-1.5 text-xs text-paper"
                                                aria-label="Quitar foto"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {canAddPhoto(photos) && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-rule text-[11px] text-ink-faint transition-colors hover:bg-paper-deep hover:text-ink"
                                        >
                                            <span className="text-lg leading-none">+</span>
                                            Añadir
                                        </button>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={event => {
                                        handleFiles(event.target.files);
                                        event.target.value = '';
                                    }}
                                />
                                {photoError && <p className="mt-2 text-xs text-clay">{photoError}</p>}
                                <p className="mt-3 text-[11px] text-ink-faint">
                                    Sube entre {TRIP_MIN_PHOTOS} y {TRIP_MAX_PHOTOS} fotos reales del lugar (máx. 1.5 MB
                                    cada una).
                                </p>
                            </div>
                        )}
                    </div>

                    {activeWarning && (
                        <p
                            role="alert"
                            className="shrink-0 border-t border-clay/30 bg-clay/10 px-6 py-2.5 text-xs text-clay"
                        >
                            {activeWarning}
                        </p>
                    )}

                    <div className="flex shrink-0 items-center gap-3 border-t border-rule px-6 py-4">
                        {step > 0 && (
                            <Button variant="outline" size="sm" onClick={() => setStep(current => current - 1)} disabled={publishing}>
                                Atrás
                            </Button>
                        )}
                        <div className="ml-auto flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint hover:text-ink"
                            >
                                Cancelar
                            </button>
                            {step < 2 ? (
                                <Button variant="primary" size="sm" disabled={publishing} onClick={handleContinue}>
                                    Continuar
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={publishing}
                                    loading={publishing}
                                    onClick={handlePublish}
                                >
                                    Publicar viaje
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default TripFormModal;
