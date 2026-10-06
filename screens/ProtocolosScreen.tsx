import React from 'react';
import { useHeader } from '../hooks';
import { ProtocolosConsulta } from '../components/ProtocolosConsulta';

// Consulta dos protocolos institucionais pelo menu, fora do round.
export const ProtocolosScreen: React.FC = () => {
    useHeader('Protocolos');

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6">
            <ProtocolosConsulta />
        </div>
    );
};
