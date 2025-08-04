import React from 'react';

const LegendItem: React.FC<{ colorClass: string; label: string; count: number }> = ({ colorClass, label, count }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
            <span className="ml-2 text-sm text-gray-600">{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-700">{count}</span>
    </div>
);

interface LegendProps {
    completed: number;
    partial: number;
    unvisited: number;
}

const Legend: React.FC<LegendProps> = ({ completed, partial, unvisited }) => {
    return (
        <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-700 mb-3">Leyenda</h3>
            <div className="space-y-2">
                <LegendItem colorClass="bg-emerald-600" label="Atractivos Completados" count={completed} />
                <LegendItem colorClass="bg-emerald-300" label="Atractivos Parcialmente Visitados" count={partial} />
                <LegendItem colorClass="bg-gray-300" label="Atractivos Sin Visitar" count={unvisited} />
            </div>
        </div>
    );
};

export default Legend;
