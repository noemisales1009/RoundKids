import React, { useEffect } from 'react';
import { CheckCircleIcon, WarningIcon, InfoIcon } from './icons';

export const Notification: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type];

    const icon = {
        success: <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
        error: <WarningIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
        info: <InfoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
    }[type];

    return (
        <div className={`fixed top-2 right-2 sm:top-5 sm:right-5 z-50 flex items-center p-3 sm:p-4 rounded-lg shadow-lg text-white max-w-xs sm:max-w-sm ${bgColor} animate-notification-in`}>
            {icon}
            <span className="ml-2 sm:ml-3 font-semibold text-sm sm:text-base">{message}</span>
        </div>
    );
};
