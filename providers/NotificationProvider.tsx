import React, { useState } from 'react';
import { NotificationContext } from '../contexts';
import { NotificationState } from '../types';
import { registrarErro } from '../lib/registroDeErros';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<NotificationState | null>(null);

    const showNotification = (notification: NotificationState) => {
        // Toda mensagem de erro mostrada ao usuário fica registrada para a tela Saúde do sistema
        if (notification.type === 'error') registrarErro('mensagem', notification.message);
        setNotification(notification);
    };

    const hideNotification = () => {
        setNotification(null);
    };

    return (
        <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
