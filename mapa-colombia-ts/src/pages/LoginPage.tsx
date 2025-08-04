// src/pages/LoginPage.tsx
import React from 'react';
import ColombiaMapLogin from '../components/ColombiaMapLogin';

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
                <button
                    onClick={login}
                    className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow border font-semibold text-gray-700"
                >
                    <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google logo" className="h-6" />
                    Iniciar Sesión con Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
