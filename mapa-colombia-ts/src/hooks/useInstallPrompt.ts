import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * - 'prompt': el navegador expuso beforeinstallprompt (prompt nativo).
 * - 'manual': sin API; se muestran instrucciones según plataforma.
 * - 'standalone': ya está instalada (no se muestra el botón).
 */
export type InstallAvailability = 'prompt' | 'manual' | 'standalone';

export type InstallPlatform = 'ios' | 'android' | 'desktop';

const getPlatform = (): InstallPlatform => {
    const ua = navigator.userAgent;
    const isIOSDevice =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOSDevice) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'desktop';
};

export const isStandalone = (): boolean =>
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;

export const useInstallPrompt = () => {
    const [availability, setAvailability] = useState<InstallAvailability>('manual');
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [platform] = useState<InstallPlatform>(getPlatform);

    useEffect(() => {
        if (isStandalone()) {
            setAvailability('standalone');
            return;
        }

        const onBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
            setAvailability('prompt');
        };

        const onAppInstalled = () => {
            setDeferredPrompt(null);
            setAvailability('standalone');
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.addEventListener('appinstalled', onAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
            window.removeEventListener('appinstalled', onAppInstalled);
        };
    }, []);

    const promptInstall = useCallback(async (): Promise<boolean> => {
        if (!deferredPrompt) return false;
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            return outcome === 'accepted';
        } catch {
            return false;
        }
    }, [deferredPrompt]);

    return { availability, platform, hasNativePrompt: deferredPrompt !== null, promptInstall };
};
