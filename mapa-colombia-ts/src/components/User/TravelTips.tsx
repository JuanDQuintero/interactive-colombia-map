import React from 'react';

const TIPS = [
    'Planifica tu ruta considerando las épocas del año y el clima.',
    'Investiga la cultura local y los platos típicos de cada región.',
    'Documenta tus experiencias y compártelas con otros viajeros.',
];

const TravelTips: React.FC = () => {
    return (
        <details className="panel group p-5">
            <summary className="flex cursor-pointer list-none items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest">
                <h3 className="micro">Consejos de viaje</h3>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="ml-auto h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </summary>
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
        </details>
    );
};

export default TravelTips;
