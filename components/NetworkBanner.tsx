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
                <svg width="280" height="90" viewBox="0 0 280 90" fill="none" className="mt-2">
                    {/* === PLUGUE ESQUERDO === */}
                    {/* Corpo do plugue */}
                    <rect x="10" y="18" width="52" height="38" rx="10" fill="#1c2e3a" />
                    {/* Pino esquerdo */}
                    <rect x="22" y="6" width="9" height="16" rx="3" fill="#d4a017" />
                    {/* Pino direito */}
                    <rect x="38" y="6" width="9" height="16" rx="3" fill="#d4a017" />
                    {/* Sombra/detalhe no corpo */}
                    <rect x="10" y="40" width="52" height="16" rx="0" fill="#162430" style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }} />
                    <rect x="10" y="44" width="52" height="12" rx="0" fill="#162430" />
                    <rect x="10" y="44" width="52" height="12" rx="10" fill="#162430" />
                    {/* Fio saindo do plugue */}
                    <path d="M36 56 Q36 72 60 72 Q90 72 100 72" stroke="#2a2a2a" strokeWidth="10" strokeLinecap="round" fill="none" />
                    <path d="M36 56 Q36 72 60 72 Q90 72 100 72" stroke="#444" strokeWidth="6" strokeLinecap="round" fill="none" />

                    {/* === FIO CORTADO NO CENTRO === */}
                    {/* Ponta do fio esquerdo - fios expostos */}
                    <line x1="100" y1="72" x2="118" y2="72" stroke="#2a2a2a" strokeWidth="10" strokeLinecap="round" />
                    <line x1="100" y1="72" x2="118" y2="72" stroke="#444" strokeWidth="6" strokeLinecap="round" />
                    {/* Fios internos expostos esquerda */}
                    <line x1="118" y1="72" x2="128" y2="62" stroke="#e8c840" strokeWidth="3" strokeLinecap="round" />
                    <line x1="118" y1="72" x2="130" y2="68" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" />
                    <line x1="118" y1="72" x2="130" y2="76" stroke="#e53935" strokeWidth="3" strokeLinecap="round" />
                    <line x1="118" y1="72" x2="128" y2="82" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />

                    {/* Fios internos expostos direita */}
                    <line x1="162" y1="72" x2="152" y2="62" stroke="#e8c840" strokeWidth="3" strokeLinecap="round" />
                    <line x1="162" y1="72" x2="150" y2="68" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" />
                    <line x1="162" y1="72" x2="150" y2="76" stroke="#e53935" strokeWidth="3" strokeLinecap="round" />
                    <line x1="162" y1="72" x2="152" y2="82" stroke="#1e88e5" strokeWidth="3" strokeLinecap="round" />

                    {/* Ponta do fio direito */}
                    <line x1="162" y1="72" x2="180" y2="72" stroke="#2a2a2a" strokeWidth="10" strokeLinecap="round" />
                    <line x1="162" y1="72" x2="180" y2="72" stroke="#444" strokeWidth="6" strokeLinecap="round" />

                    {/* === FIO DIREITO === */}
                    <path d="M180 72 Q190 72 220 72 Q244 72 244 56" stroke="#2a2a2a" strokeWidth="10" strokeLinecap="round" fill="none" />
                    <path d="M180 72 Q190 72 220 72 Q244 72 244 56" stroke="#444" strokeWidth="6" strokeLinecap="round" fill="none" />

                    {/* === TOMADA FÊMEA DIREITA === */}
                    <rect x="218" y="18" width="52" height="38" rx="10" fill="#1c2e3a" />
                    <rect x="218" y="44" width="52" height="12" rx="10" fill="#162430" />
                    {/* Buraco esquerdo */}
                    <rect x="229" y="28" width="9" height="14" rx="3" fill="#0d1c26" />
                    {/* Buraco direito */}
                    <rect x="246" y="28" width="9" height="14" rx="3" fill="#0d1c26" />
                </svg>
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
