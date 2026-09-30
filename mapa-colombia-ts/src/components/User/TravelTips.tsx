import React from 'react';

const TIPS = [
    'Planifica tu ruta considerando las épocas del año y el clima.',
    'Investiga la cultura local y los platos típicos de cada región.',
    'Documenta tus experiencias y compártelas con otros viajeros.',
];

const TravelTips: React.FC = () => {
    return (
        <div className="panel p-5">
            <div className="flex items-center gap-3">
                <h3 className="micro">Consejos de viaje</h3>
                <span className="rule-fill" />
            </div>
            <ol className="mt-4 space-y-3">
                {TIPS.map((tip, index) => (
                    <li key={tip} className="flex gap-3 text-[13px] leading-relaxed text-ink-soft">
                        <span className="font-display text-sm font-semibold tabular-nums text-clay">
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <span>{tip}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default TravelTips;
