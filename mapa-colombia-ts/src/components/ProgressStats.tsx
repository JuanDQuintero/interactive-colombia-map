import React from 'react';

interface ProgressStatsProps {
    completed: number;
    partial: number;
    unvisited: number;
    totalProgress: number;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ completed, partial, unvisited, totalProgress }) => {
    return (
        <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-700 mb-3">Progreso de Viajes</h3>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Progreso Total</span>
                    <span className="text-sm font-bold text-emerald-600">{totalProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${totalProgress}%` }}
                    ></div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-3 text-center">
                <div>
                    <p className="text-2xl font-bold text-emerald-600">{completed}</p>
                    <p className="text-xs text-gray-500">Completados</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-emerald-300">{partial}</p>
                    <p className="text-xs text-gray-500">Parciales</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-400">{unvisited}</p>
                    <p className="text-xs text-gray-500">Sin Visitar</p>
                </div>
            </div>
        </div>
    );
};

export default ProgressStats;
