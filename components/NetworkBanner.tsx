import React from 'react';
import { useNetwork } from '../contexts/NetworkContext';

export const NetworkBanner: React.FC = () => {
    const { isOnline } = useNetwork();

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-sm mx-auto">
                <img
                    src="/sem-conexao.png"
                    alt="Sem conexão com a internet"
                    className="w-full h-auto object-contain"
                />
                <button
                    onClick={() => window.location.reload()}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 rounded-2xl border-2 border-white text-white font-semibold text-base bg-transparent hover:bg-white/20 transition-colors whitespace-nowrap"
                >
                    Tentar Novamente
                </button>
            </div>
        </div>
    );
};
