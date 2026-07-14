import React, { useEffect } from 'react';
import { CheckCircleIcon, WarningIcon, InfoIcon, CloseIcon } from './icons';

export const Notification: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        // Erros NÃO somem sozinhos: uma falha ao salvar (ex.: dose) precisa ser
        // vista e fechada manualmente pelo clínico. Sucesso/info somem em 4s.
        if (type === 'error') return;
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose, type]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-primary-500',
    }[type];

    const icon = {
        success: <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
        error: <WarningIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
        info: <InfoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
    }[type];

    return (
        <div
            role="alert"
            className={`fixed top-2 right-2 sm:top-5 sm:right-5 z-50 flex items-center p-3 sm:p-4 rounded-lg shadow-lg text-white max-w-xs sm:max-w-sm ${bgColor} animate-notification-in`}
        >
            {icon}
            <span className="ml-2 sm:ml-3 font-semibold text-sm sm:text-base">{message}</span>
            <button
                onClick={onClose}
                aria-label="Fechar aviso"
                className="ml-3 shrink-0 text-white/80 hover:text-white transition"
            >
                <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </div>
    );
};
