import React from 'react';
import { useNetwork } from '../contexts/NetworkContext';

export const NetworkBanner: React.FC = () => {
    const { isOnline } = useNetwork();

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col" style={{ backgroundColor: '#3aa8d8' }}>

            {/* Header */}
            <div className="flex items-center justify-center px-6 pt-10 pb-2 relative">
                <span className="text-white font-bold tracking-[0.3em] text-sm">STATUS DA REDE</span>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 -mt-8">

                {/* 404 com ícone wifi */}
                <div className="flex items-center justify-center" style={{ lineHeight: 1 }}>
                    <span className="text-white font-black" style={{ fontSize: '7rem' }}>4</span>
                    <div className="mx-1 flex items-center justify-center" style={{ width: '7rem', height: '7rem' }}>
                        <svg viewBox="0 0 100 100" width="100" height="100" fill="none">
                            {/* Círculo externo */}
                            <circle cx="50" cy="50" r="46" stroke="white" strokeWidth="6" />
                            {/* Linha diagonal */}
                            <line x1="18" y1="18" x2="82" y2="82" stroke="white" strokeWidth="6" strokeLinecap="round" />
                            {/* Arcos wifi */}
                            <path d="M20 42 Q50 18 80 42" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M30 54 Q50 36 70 54" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M40 66 Q50 56 60 66" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <circle cx="50" cy="76" r="5" fill="white" />
                        </svg>
                    </div>
                    <span className="text-white font-black" style={{ fontSize: '7rem' }}>4</span>
                </div>

                <h1 className="text-white font-black tracking-[0.2em] text-center" style={{ fontSize: '2rem' }}>
                    SEM CONEXÃO
                </h1>
                <p className="text-white text-center" style={{ fontSize: '1.1rem' }}>
                    Desculpe, você está offline.
                </p>

                {/* Ilustração cabo desconectado */}
                <div className="flex items-end justify-center gap-8 mt-4" style={{ height: '80px' }}>
                    {/* Plugue esquerdo */}
                    <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                        <rect x="20" y="10" width="30" height="40" rx="6" fill="#1a3a4a" />
                        <rect x="27" y="2" width="6" height="12" rx="2" fill="#c4a020" />
                        <rect x="37" y="2" width="6" height="12" rx="2" fill="#c4a020" />
                        <line x1="35" y1="50" x2="35" y2="70" stroke="#333" strokeWidth="8" strokeLinecap="round" />
                        <line x1="35" y1="65" x2="5" y2="65" stroke="#333" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                    {/* Fio direito cortado */}
                    <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                        <line x1="65" y1="65" x2="35" y2="65" stroke="#333" strokeWidth="8" strokeLinecap="round" />
                        <line x1="35" y1="65" x2="35" y2="45" stroke="#333" strokeWidth="8" strokeLinecap="round" />
                        <line x1="28" y1="42" x2="35" y2="45" stroke="#e05" strokeWidth="4" strokeLinecap="round" />
                        <line x1="42" y1="42" x2="35" y2="45" stroke="#0a5" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            {/* Botão */}
            <div className="px-10 pb-16">
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-4 rounded-2xl font-semibold text-base transition-colors"
                    style={{
                        border: '2px solid white',
                        color: 'white',
                        background: 'transparent',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                    Tentar Novamente
                </button>
            </div>
        </div>
    );
};
