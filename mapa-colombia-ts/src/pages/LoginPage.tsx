// src/pages/LoginPage.tsx
import React from 'react';
import ColombiaMapLogin from '../components/ColombiaMapLogin';
import Button from '../components/UI/Button';

interface LoginPageProps {
    login: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ login }) => {
    return (
        <div className="relative min-h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
            <ColombiaMapLogin />
            <div className="relative z-10 flex flex-col items-center bg-white/80 backdrop-blur-sm p-10 rounded-xl shadow-2xl border">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Bienvenido a tu</h1>
                <h2 className="text-5xl font-extrabold text-emerald-600 mb-8">Mapa de Viajes</h2>
                <p className="text-gray-600 mb-8 max-w-sm text-center">
                    Registra los departamentos que has visitado y lleva un control de los atractivos turísticos que has explorado en Colombia.
                </p>
                <Button
                    onClick={login}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.153-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.496 10-9.999 0-1.003-0.102-1.708-0.227-2.451h-9.773z" />
                    </svg>
                    Continuar con Google
                </Button>
            </div>
        </div>
    );
};

export default LoginPage;
