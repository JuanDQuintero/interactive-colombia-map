import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type InstallAvailability = 'prompt' | 'ios' | 'unsupported';

const isIOS = (): boolean => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isStandalone = (): boolean =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;

/**
 * Expone si el navegador permite instalar la app como PWA:
 * - 'prompt': Chrome/Android (beforeinstallprompt disponible).
 * - 'ios': Safari en iOS (sin API, solo instrucciones de "Añadir a pantalla inicio").
 * - 'unsupported': no soporta instalación (o ya está instalada).
 */
export const useInstallPrompt = () => {
    const [availability, setAvailability] = useState<InstallAvailability>('unsupported');
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        if (isStandalone()) return;

        const onBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
            setAvailability('prompt');
        };

        const onAppInstalled = () => {
            setDeferredPrompt(null);
            setAvailability('unsupported');
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.addEventListener('appinstalled', onAppInstalled);

        // iOS no dispara beforeinstallprompt: se muestra instrucciones.
        if (!('onbeforeinstallprompt' in window) && isIOS()) {
            setAvailability('ios');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
            window.removeEventListener('appinstalled', onAppInstalled);
        };
    }, []);

    const promptInstall = async (): Promise<boolean> => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            setAvailability('unsupported');
            return outcome === 'accepted';
        }
        return false;
    };

    return { availability, promptInstall };
};