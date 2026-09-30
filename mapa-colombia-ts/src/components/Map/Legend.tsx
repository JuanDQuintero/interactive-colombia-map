import React from 'react';

const LegendItem: React.FC<{ colorClass: string; label: string; count: number }> = ({ colorClass, label, count }) => (
    <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center">
            <span className={`inline-block h-3.5 w-3.5 shrink-0 rounded-[2px] ring-1 ring-inset ring-black/10 ${colorClass}`}></span>
            <span className="ml-2.5 truncate text-[13px] text-ink-soft">{label}</span>
        </div>
        <span className="font-display text-sm font-semibold tabular-nums text-ink">{count}</span>
    </div>
);

interface LegendProps {
    completed: number;
    partial: number;
    unvisited: number;
    completedLabel?: string;
    partialLabel?: string;
    unvisitedLabel?: string;
    tone?: 'dept' | 'muni';
}

const Legend: React.FC<LegendProps> = ({
    completed,
    partial,
    unvisited,
    completedLabel = 'Completados',
    partialLabel = 'Parcialmente visitados',
    unvisitedLabel = 'Sin visitar',
    tone = 'dept',
}) => {
    const completedColor = tone === 'muni' ? 'bg-[var(--map-visit)]' : 'bg-[var(--map-done)]';

    return (
        <div className="panel p-5">
            <div className="flex items-center gap-3">
                <h3 className="micro">Leyenda</h3>
                <span className="rule-fill" />
            </div>
            <div className="mt-4 space-y-2.5">
                <LegendItem colorClass={completedColor} label={completedLabel} count={completed} />
                <LegendItem colorClass="bg-[var(--map-part)]" label={partialLabel} count={partial} />
                <LegendItem colorClass="bg-[var(--map-base)]" label={unvisitedLabel} count={unvisited} />
            </div>
        </div>
    );
};

export default Legend;
