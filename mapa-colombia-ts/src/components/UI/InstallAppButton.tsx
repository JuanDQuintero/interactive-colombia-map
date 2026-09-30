import { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { useToast } from './Toast';

const InstallAppButton = () => {
    const { availability, promptInstall } = useInstallPrompt();
    const { showToast } = useToast();
    const [showIosHelp, setShowIosHelp] = useState(false);

    if (availability === 'unsupported') return null;

    const handleClick = async () => {
        if (availability === 'prompt') {
            const installed = await promptInstall();
            if (installed) {
                showToast('¡App instalada en tu dispositivo!', 'success');
            }
            return;
        }
        setShowIosHelp(true);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                aria-label="Instalar app"
                title="Instalar app"
                className="flex h-10 w-10 items-center justify-center rounded-md text-ink-soft hover:bg-paper-deep hover:text-ink transition-colors"
            >
                <ArrowDownTrayIcon className="h-5 w-5" />
            </button>

            <Dialog open={showIosHelp} onClose={() => setShowIosHelp(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/60 transition-opacity" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-sm rounded-md border border-rule bg-panel p-6 shadow-lg">
                        <DialogTitle className="font-display text-lg font-semibold text-ink">
                            Instalar en tu iPhone/iPad
                        </DialogTitle>
                        <p className="mt-3 text-sm text-ink-soft">
                            Safari en iOS no muestra un botón de instalación automático, pero puedes
                            añadir la app a tu pantalla de inicio en unos pasos:
                        </p>
                        <ol className="mt-4 space-y-3 text-sm text-ink-soft">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 font-semibold text-clay">1.</span>
                                Toca el botón de compartir{' '}
                                <ShareIcon className="h-4 w-4 self-center flex-shrink-0" /> en la barra inferior de Safari.
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 font-semibold text-clay">2.</span>
                                Selecciona{' '}
                                <span className="font-medium">"Añadir a pantalla de inicio"</span>.
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 font-semibold text-clay">3.</span>
                                Confirma con <span className="font-medium">"Añadir"</span> y listo.
                            </li>
                        </ol>
                        <button
                            type="button"
                            onClick={() => setShowIosHelp(false)}
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