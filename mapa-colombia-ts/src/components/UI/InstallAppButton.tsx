import { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useInstallPrompt, type InstallPlatform } from '../../hooks/useInstallPrompt';
import { useToast } from './Toast';

interface Instructions {
    title: string;
    steps: string[];
}

const getInstructions = (platform: InstallPlatform): Instructions => {
    const ua = navigator.userAgent;
    const isFirefox = /firefox|fxios/i.test(ua);
    const isChromium = /chrome|crios|edg|opr|samsungbrowser/i.test(ua);

    switch (platform) {
        case 'ios':
            return {
                title: 'Instalar en tu iPhone o iPad',
                steps: [
                    'Toca el botón de compartir en la barra del navegador.',
                    'Selecciona "Añadir a pantalla de inicio".',
                    'Confirma con "Añadir" y el icono aparecerá en tu pantalla.',
                ],
            };
        case 'android':
            if (isFirefox) {
                return {
                    title: 'Instalar en Firefox',
                    steps: [
                        'Toca el menú ⋮ (tres puntos).',
                        'Elige "Instalar aplicación" o "Añadir a pantalla de inicio".',
                        'Confirma con "Instalar".',
                    ],
                };
            }
            return {
                title: 'Instalar en tu teléfono',
                steps: [
                    'Toca el menú ⋮ (tres puntos).',
                    'Elige "Instalar aplicación" o "Añadir a pantalla de inicio".',
                    'Confirma con "Instalar" y la app quedará en tu pantalla de inicio.',
                ],
            };
        case 'desktop':
            if (isFirefox) {
                return {
                    title: 'Instalar en Firefox',
                    steps: [
                        'Abre el menú ☰ (tres líneas).',
                        'Elige "Instalar este sitio como aplicación".',
                        'Confirma con "Instalar".',
                    ],
                };
            }
            if (/safari/i.test(ua) && !isChromium) {
                return {
                    title: 'Instalar en Safari',
                    steps: [
                        'Ve a Archivo → Compartir → Añadir a Dock.',
                        'También puedes usar el botón Compartir → "Añadir a pantalla de inicio".',
                    ],
                };
            }
            return {
                title: 'Instalar en tu navegador',
                steps: [
                    'Abre el menú (⋮ o …) de la barra de direcciones.',
                    'Busca "Instalar Colombia Check & Travel" o "Aplicaciones → Instalar esta página como aplicación".',
                    'Confirma con "Instalar".',
                ],
            };
    }
};

const InstallAppButton = () => {
    const { availability, platform, promptInstall } = useInstallPrompt();
    const { showToast } = useToast();
    const [showHelp, setShowHelp] = useState(false);

    if (availability === 'standalone') return null;

    const instructions = getInstructions(platform);

    const handleClick = async () => {
        if (availability === 'prompt') {
            try {
                const installed = await promptInstall();
                if (installed) {
                    showToast('¡App instalada en tu dispositivo!', 'success');
                }
                return;
            } catch {
                setShowHelp(true);
            }
            return;
        }
        setShowHelp(true);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                aria-label="Descargar app"
                title="Descargar app"
                className="flex h-10 w-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper-deep hover:text-ink transition-colors"
            >
                <ArrowDownTrayIcon className="h-5 w-5" />
            </button>

            <Dialog open={showHelp} onClose={() => setShowHelp(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/60 transition-opacity" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="modal-card w-full max-w-sm p-6">
                        <DialogTitle className="font-display text-lg font-semibold text-ink">
                            {instructions.title}
                        </DialogTitle>
                        <p className="mt-3 text-sm text-ink-soft">
                            La app es una PWA: se instala como un acceso directo en tu pantalla de inicio sin pasar por tiendas.
                        </p>
                        <ol className="mt-4 space-y-3 text-sm text-ink-soft">
                            {instructions.steps.map((step, index) => (
                                <li key={step} className="flex gap-3">
                                    <span className="font-display text-sm font-semibold tabular-nums text-clay">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        {platform === 'ios' && index === 0 && (
                                            <ShareIcon className="h-4 w-4 shrink-0 text-ink" />
                                        )}
                                        {step}
                                    </span>
                                </li>
                            ))}
                        </ol>
                        <button
                            type="button"
                            onClick={() => setShowHelp(false)}
                            className="mt-6 w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-forest"
                        >
                            Entendido
                        </button>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
};

export default InstallAppButton;
