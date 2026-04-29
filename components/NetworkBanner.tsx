import React from 'react';
import { useNetwork } from '../contexts/NetworkContext';

export const NetworkBanner: React.FC = () => {
    const { isOnline } = useNetwork();

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-[#3a9fd1] flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
                <img
                    src="./sem-conexao.png"
                    alt="Sem conexão com a internet"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <button
                    onClick={() => window.location.reload()}
                    className="absolute bottom-[12%] left-1/2 -translate-x-1/2 px-10 py-3 rounded-2xl border-2 border-white text-white font-semibold text-base bg-transparent hover:bg-white/20 transition-colors whitespace-nowrap"
                >
                    Tentar Novamente
                </button>
            </div>
        </div>
    );
};
