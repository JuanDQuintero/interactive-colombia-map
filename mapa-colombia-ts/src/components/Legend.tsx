import React from 'react';

const LegendItem: React.FC<{ colorClass: string; label: string; count: number }> = ({ colorClass, label, count }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{count}</span>
    </div>
);

interface LegendProps {
    completed: number;
    partial: number;
    unvisited: number;
}

const Legend: React.FC<LegendProps> = ({ completed, partial, unvisited }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Leyenda</h3>
            <div className="space-y-2">
                <LegendItem colorClass="bg-emerald-600 dark:bg-emerald-500" label="Completados" count={completed} />
                <LegendItem colorClass="bg-yellow-300 dark:bg-yellow-500" label="Parcialmente Visitados" count={partial} />
                <LegendItem colorClass="bg-gray-300 dark:bg-gray-600" label="Sin Visitar" count={unvisited} />
            </div>
        </div>
    );
};

export default Legend;
