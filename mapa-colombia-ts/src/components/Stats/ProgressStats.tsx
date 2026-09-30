import React from 'react';

interface ProgressStatsProps {
    completed: number;
    partial: number;
    unvisited: number;
    totalProgress: number;
    title?: string;
    progressLabel?: string;
    completedLabel?: string;
    partialLabel?: string;
    unvisitedLabel?: string;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({
    completed,
    partial,
    unvisited,
    totalProgress,
    title = 'Progreso de viajes',
    progressLabel = 'Progreso total',
    completedLabel = 'Completados',
    partialLabel = 'Parciales',
    unvisitedLabel = 'Sin visitar',
}) => {
    return (
        <div className="panel p-5">
            <div className="flex items-center gap-3">
                <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
                <span className="rule-fill" />
            </div>

            <div className="mt-4">
                <div className="flex items-baseline justify-between">
                    <span className="micro">{progressLabel}</span>
                    <span className="font-display text-3xl font-semibold tabular-nums leading-none text-forest">
                        {totalProgress}%
                    </span>
                </div>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-paper-deep">
                    <div
                        className="h-full rounded-full bg-forest transition-all duration-500"
                        style={{ width: `${totalProgress}%` }}
                    ></div>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-dashed border-rule pt-4 text-center">
                <div>
                    <p className="font-display text-2xl font-semibold tabular-nums leading-none text-forest">{completed}</p>
                    <p className="micro mt-1.5">{completedLabel}</p>
                </div>
                <div>
                    <p className="font-display text-2xl font-semibold tabular-nums leading-none text-gold">{partial}</p>
                    <p className="micro mt-1.5">{partialLabel}</p>
                </div>
                <div>
                    <p className="font-display text-2xl font-semibold tabular-nums leading-none text-ink-faint">{unvisited}</p>
                    <p className="micro mt-1.5">{unvisitedLabel}</p>
                </div>
            </div>
        </div>
    );
};

export default ProgressStats;
