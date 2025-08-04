import React from 'react';

const TravelTips: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-700 mb-3">Consejos de Viaje</h3>
            <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Planifica tu ruta considerando las épocas del año y el clima.</li>
                <li>Investiga la cultura local y los platos típicos de cada región.</li>
                <li>Documenta tus experiencias y compártelas con otros viajeros.</li>
            </ul>
        </div>
    );
};

export default TravelTips;
