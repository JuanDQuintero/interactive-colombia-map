import React from 'react';
import type { Trip } from '../../interfaces/trip';
import { formatBudget, durationLabel, transportLabel } from '../../utils/trips';
import { formatRelativeDate } from '../../utils/routeReports';
import { IMAGE_FALLBACK } from '../../utils/imageFallback';

const TripCard: React.FC<{ trip: Trip }> = ({ trip }) => (
    <li className="overflow-hidden rounded-md border border-rule bg-panel">
        <div className="flex">
            <img
                src={trip.photos[0] ?? IMAGE_FALLBACK}
                alt={trip.title}
                className="h-28 w-28 flex-shrink-0 object-cover"
                loading="lazy"
                onError={event => { event.currentTarget.src = IMAGE_FALLBACK; }}
            />
            <div className="min-w-0 flex-1 p-3">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-[15px] font-semibold text-ink">{trip.title}</p>
                    {trip.status === 'pendiente' && (
                        <span className="shrink-0 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gold">
                            Por revisar
                        </span>
                    )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-soft">
                    <span>{transportLabel(trip.transport)}</span>
                    <span className="text-ink-faint">·</span>
                    <span>{durationLabel(trip.duration)}</span>
                    <span className="font-semibold tabular-nums text-forest">{formatBudget(trip.budgetMin, trip.budgetMax)}</span>
                </div>

                {trip.tips.length > 0 && (
                    <ul className="mt-2 space-y-1">
                        {trip.tips.map(tip => (
                            <li key={tip} className="flex gap-1.5 text-[11px] leading-snug text-ink-soft">
                                <span aria-hidden="true" className="text-clay">→</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <p className="mt-2 text-[11px] text-ink-faint">
                    {trip.createdByName} · {formatRelativeDate(trip.createdAt)}
                </p>
            </div>
        </div>

        {trip.photos.length > 1 && (
            <div className="flex gap-1.5 border-t border-rule-soft p-2">
                {trip.photos.slice(1).map(photo => (
                    <img
                        key={photo}
                        src={photo}
                        alt=""
                        className="h-12 w-16 rounded-[3px] object-cover"
                        loading="lazy"
                        onError={event => { event.currentTarget.src = IMAGE_FALLBACK; }}
                    />
                ))}
            </div>
        )}
    </li>
);

export default TripCard;
