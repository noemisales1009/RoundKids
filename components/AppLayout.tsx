import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { Notification } from './Notification';
import { NotificationContext, HeaderContext } from '../contexts';

export const AppLayout: React.FC = () => {
    const [title, setTitle] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const contextValue = useMemo(() => ({ setTitle }), []);
    const { notification, hideNotification } = useContext(NotificationContext)!;

    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    return (
        <HeaderContext.Provider value={contextValue}>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex-row">
                {/* Mobile Sidebar */}
                <div className={`fixed inset-0 z-30 transition-opacity bg-black bg-opacity-50 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
                <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar />
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden lg:flex lg:shrink-0">
                    <Sidebar />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8 pb-32 md:pb-32 lg:pb-8">
                        <div className="max-w-4xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
            <BottomNav />
            {notification && (
                <Notification message={notification.message} type={notification.type} onClose={hideNotification} />
            )}
        </HeaderContext.Provider>
    );
};
