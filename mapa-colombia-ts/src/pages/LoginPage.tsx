// src/pages/LoginPage.tsx
import React from 'react';
import Button from '../components/UI/Button';

interface LoginPageProps {
    login: () => void;
    error?: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ login, error }) => {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-teal-300/20 blur-3xl" />
            <div className="absolute right-1/4 top-1/4 h-40 w-40 rounded-full bg-emerald-300/30 blur-2xl" />
            <div className="absolute bottom-1/4 left-1/4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 w-full max-w-md px-4 py-8">
                <div className="rounded-2xl border border-white/50 bg-white/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10 dark:border-gray-700 dark:bg-gray-800/95">
                    {/* Icono */}
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg">
                            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-center text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                        Bienvenido
                    </h1>
                    <h2 className="mb-3 text-center text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        Mapa de Viajes por Colombia
                    </h2>
                    <p className="mb-8 text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                        Registra los departamentos que has visitado, califica atractivos turísticos y lleva el control de tus viajes por Colombia.
                    </p>

                    <Button
                        onClick={login}
                        size="lg"
                        fullWidth
                        className="gap-2 !py-3 text-base"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.153-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.496 10-9.999 0-1.003-0.102-1.708-0.227-2.451h-9.773z" />
                        </svg>
                        Continuar con Google
                    </Button>

                    {error && (
                        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
                            {error}
                        </p>
                    )}

                    <p className="mt-7 text-center text-xs text-gray-400 dark:text-gray-500">
                        Colombia Check & Travel
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;