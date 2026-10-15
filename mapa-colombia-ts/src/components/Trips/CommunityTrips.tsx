import type { User } from 'firebase/auth';
import React, { useState } from 'react';
import { useTrips } from '../../hooks/useTrips';
import Button from '../UI/Button';
import TripCard from './TripCard';
import TripFormModal from './TripFormModal';

interface CommunityTripsProps {
    user: User;
    municipalityId: string;
    municipalityName: string;
    departmentId: string;
}

const CommunityTrips: React.FC<CommunityTripsProps> = ({ user, municipalityId, municipalityName, departmentId }) => {
    const { trips, loading, error, publishing, publishTrip } = useTrips(municipalityId);
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <section className="mb-5 rounded-md border border-rule bg-paper-deep/40 p-4">
            <div className="flex items-center gap-3">
                <h4 className="font-display text-[15px] font-semibold text-ink">Viajes de la comunidad</h4>
                <span className="rule-fill" />
            </div>
            <p className="mt-1.5 text-xs text-ink-faint">
                Rutas contadas por viajeros: cómo llegar, cuánto se gasta y qué llevar.
            </p>

            {error && <p className="mt-3 text-xs text-clay">{error}</p>}

            {loading ? (
                <p className="mt-3 text-xs text-ink-faint">Cargando viajes…</p>
            ) : trips.length === 0 ? (
                <p className="mt-3 text-xs text-ink-soft">
                    Todavía no hay viajes publicados para {municipalityName}. Si fuiste, cuéntanos cómo es llegar.
                </p>
            ) : (
                <ul className="mt-3 space-y-2">
                    {trips.map(trip => (
                        <TripCard key={trip.id} trip={trip} />
                    ))}
                </ul>
            )}

            <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
                    Publicar mi viaje
                </Button>
            </div>

            {isFormOpen && (
                <TripFormModal
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onPublish={publishTrip}
                    publishing={publishing}
                    user={user}
                    municipalityId={municipalityId}
                    municipalityName={municipalityName}
                    departmentId={departmentId}
                />
            )}
        </section>
    );
};

export default CommunityTrips;
