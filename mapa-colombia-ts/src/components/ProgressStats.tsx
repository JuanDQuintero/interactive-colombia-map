import React from 'react';

interface ProgressStatsProps {
    completed: number;
    partial: number;
    unvisited: number;
    totalProgress: number;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ completed, partial, unvisited, totalProgress }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Progreso de Viajes</h3>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Progreso Total</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{totalProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${totalProgress}%` }}
                    ></div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-3 text-center">
                <div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completed}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completados</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-yellow-300 dark:text-yellow-500">{partial}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Parciales</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">{unvisited}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sin Visitar</p>
                </div>
            </div>
        </div>
    );
};

export default ProgressStats;
