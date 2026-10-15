import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import React, { useState } from 'react';
import type { BadgeIcon, BadgeStatus } from '../../utils/badges';
import Button from '../UI/Button';

interface UserProgressPanelProps {
    visitedCount: number;
    totalCount: number;
    badges: BadgeStatus[];
    nextBadge: BadgeStatus | null;
}

const BadgeGlyph: React.FC<{ icon: BadgeIcon; className?: string }> = ({ icon, className = 'h-4 w-4' }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        {icon === 'star' && (
            <path d="M12 3.6l2.5 5.1 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8L12 3.6z" />
        )}
        {icon === 'compass' && (
            <>
                <circle cx="12" cy="12" r="8.6" />
                <path d="M15.4 8.6l-2 4.8-4.8 2 2-4.8 4.8-2z" />
            </>
        )}
        {icon === 'mountain' && (
            <>
                <path d="M3 19.2l5.4-9.4 3 5 2-3.2 7.6 7.6H3z" />
                <path d="M8.4 9.8l1.3 2.1" />
            </>
        )}
        {icon === 'bolt' && <path d="M13.2 3L5.6 13.2h4.8L10 21l8-10.6h-5L13.2 3z" />}
        {icon === 'heart' && (
            <path d="M12 20.2s-7.4-4.4-7.4-9.6A3.9 3.9 0 0 1 12 8.1a3.9 3.9 0 0 1 7.4 2.5c0 5.2-7.4 9.6-7.4 9.6z" />
        )}
        {icon === 'flag' && (
            <>
                <path d="M6 21V4" />
                <path d="M6 4.6h11.4l-2.2 3.8 2.2 3.8H6" />
            </>
        )}
        {icon === 'shield' && (
            <path d="M12 3.2l7 2.8v5.4c0 4.1-2.8 7.5-7 9.4-4.2-1.9-7-5.3-7-9.4V6l7-2.8z" />
        )}
    </svg>
);

const BadgeTile: React.FC<{
    badge: BadgeStatus;
    onSelect: (badge: BadgeStatus) => void;
}> = ({ badge, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(badge)}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-md p-2 transition-colors hover:bg-paper-deep focus:outline-none focus:ring-2 focus:ring-forest"
    >
        <span
            className={`flex h-11 w-11 items-center justify-center rounded-full border ${badge.earned
                    ? 'border-gold bg-gold-soft text-gold'
                    : 'border-rule bg-paper-deep text-ink-faint opacity-60'
                }`}
        >
            <BadgeGlyph icon={badge.icon} className="h-5 w-5" />
        </span>
        <span className="text-center">
            <span
                className={`block text-xs leading-tight ${badge.earned ? 'font-semibold text-ink' : 'text-ink-faint'
                    }`}
            >
                {badge.name}
            </span>
            <span className="mt-0.5 block text-[11px] tabular-nums text-ink-faint">
                {badge.earned ? 'Conseguida' : `${badge.current}/${badge.target}`}
            </span>
        </span>
    </button>
);

const UserProgressPanel: React.FC<UserProgressPanelProps> = ({ visitedCount, totalCount, badges, nextBadge }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<BadgeStatus | null>(null);
    const earnedCount = badges.filter(badge => badge.earned).length;

    const closeModal = () => {
        setIsOpen(false);
        setSelectedBadge(null);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label={`Ver insignias: ${earnedCount} de ${badges.length} conseguidas`}
                className="panel w-full cursor-pointer p-4 text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-forest"
            >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-2xl font-semibold tabular-nums leading-none text-clay">
                        {visitedCount}
                    </span>
                    <span className="text-sm text-ink-soft">de {totalCount} municipios</span>
                    <span className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                        {earnedCount}/{badges.length} insignias
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-3 w-3 text-ink-faint"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.22 4.22a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06-1.06L11.69 10 7.22 5.28a.75.75 0 0 1 0-1.06z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                </div>

                {nextBadge ? (
                    <>
                        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-paper-deep">
                            <div
                                className="h-full rounded-full bg-gold transition-all duration-500"
                                style={{ width: `${(nextBadge.current / nextBadge.target) * 100}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-ink-soft">
                            Te faltan {nextBadge.target - nextBadge.current} para «{nextBadge.name}»
                        </p>
                    </>
                ) : (
                    <p className="mt-2 text-xs text-ink-soft">Completaste todas las insignias de la ruta.</p>
                )}
            </button>

            {isOpen && (
                <Dialog open onClose={closeModal} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/60 transition-opacity" />

                    <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
                        <DialogPanel className="modal-card max-h-[85vh] w-full max-w-lg overflow-y-auto p-6">
                            {selectedBadge ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedBadge(null)}
                                        className="mb-4 flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint hover:text-ink"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-3 w-3"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.79 4.22a.75.75 0 0 1 0 1.06L8.31 9.75l4.48 4.47a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Todas las insignias
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${selectedBadge.earned
                                                    ? 'border-gold bg-gold-soft text-gold'
                                                    : 'border-rule bg-paper-deep text-ink-soft'
                                                }`}
                                        >
                                            <BadgeGlyph icon={selectedBadge.icon} className="h-5 w-5" />
                                        </span>
                                        <DialogTitle className="font-display text-lg font-semibold text-ink">
                                            {selectedBadge.name}
                                        </DialogTitle>
                                    </div>

                                    <p className="mt-4 text-sm text-ink-soft">{selectedBadge.description}</p>

                                    <div className="mt-5">
                                        <div className="flex items-baseline justify-between">
                                            <span className="micro">Tu avance</span>
                                            <span className="text-[11px] tabular-nums text-ink-faint">
                                                {selectedBadge.current}/{selectedBadge.target}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-deep">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${selectedBadge.earned ? 'bg-forest' : 'bg-gold'
                                                    }`}
                                                style={{
                                                    width: `${(selectedBadge.current / selectedBadge.target) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-ink-soft">
                                            {selectedBadge.earned
                                                ? 'Insignia conseguida: ya cuenta para tu ruta.'
                                                : `Te faltan ${selectedBadge.target - selectedBadge.current} para conseguirla. Marca las visitas en los municipios correspondientes.`}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <Button variant="outline" onClick={closeModal}>
                                            Cerrar
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <DialogTitle className="font-display text-lg font-semibold text-ink">
                                            Tus insignias
                                        </DialogTitle>
                                        <span className="rule-fill" />
                                        <span className="text-[11px] tabular-nums text-ink-faint">
                                            {earnedCount}/{badges.length}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-ink-soft">
                                        {visitedCount} de {totalCount} municipios de Colombia registrados como visitados.
                                    </p>

                                    <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                        {badges.map(badge => (
                                            <BadgeTile key={badge.id} badge={badge} onSelect={setSelectedBadge} />
                                        ))}
                                    </div>

                                    <p className="mt-5 text-[11px] text-ink-faint">
                                        Las insignias se ganan marcando visitas: un municipio cuenta cuando visitas al menos
                                        una de sus atracciones.
                                    </p>

                                    <div className="mt-4 flex justify-end">
                                        <Button variant="outline" onClick={closeModal}>
                                            Cerrar
                                        </Button>
                                    </div>
                                </>
                            )}
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </>
    );
};

export default UserProgressPanel;
