import React from 'react';
import { useNetwork } from '../contexts/NetworkContext';

export const NetworkBanner: React.FC = () => {
    const { isOnline } = useNetwork();

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 px-4 shadow-lg animate-pulse">
            <div className="flex items-center justify-center gap-3 max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <span className="font-semibold text-sm sm:text-base">
                        ⚠️ Sem conexão com a internet
                    </span>
                </div>
                <span className="text-xs sm:text-sm opacity-90">
                    Verificando conexão...
                </span>
            </div>
        </div>
    );
};
