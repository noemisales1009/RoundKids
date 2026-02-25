import React, { createContext, useState, useEffect } from 'react';

interface NetworkContextType {
    isOnline: boolean;
}

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            console.log('✅ Conexão restaurada');
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log('❌ Conexão perdida');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <NetworkContext.Provider value={{ isOnline }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => {
    const context = React.useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork deve ser usado dentro de NetworkProvider');
    }
    return context;
};
