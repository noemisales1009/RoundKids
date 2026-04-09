import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BackArrowIcon, MenuIcon, ClipboardIcon, LogOutIcon } from './icons';
import { UserContext, HeaderContext } from '../contexts';
import { supabase } from '../supabaseClient';

export const useHeader = (title: string) => {
    const context = useContext(HeaderContext);
    useEffect(() => {
        if (context) {
            context.setTitle(title);
        }
        return () => {
            if (context) {
                // Optional: clear title on unmount
            }
        };
    }, [title, context]);
};

export const Header: React.FC<{ title: string; onMenuClick: () => void }> = ({ title, onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext)!;

    const getBackPath = (): string | number => {
        const pathParts = location.pathname.split('/').filter(Boolean);

        if (location.pathname.includes('/create-alert')) {
            return -1;
        }

        if (pathParts.length > 1) {
            const patientId = pathParts[1];
            if (pathParts[0] === 'status') {
                return '/dashboard';
            }
            if (pathParts[2] === 'history') {
                return `/patient/${patientId}`;
            }
            if (pathParts.includes('category')) { // Catches /.../category/:id/question/:id
                return `/patient/${patientId}/round/categories`;
            }
            if (pathParts.includes('categories')) {
                return `/patient/${patientId}`;
            }
            if (pathParts.length === 2 && pathParts[0] === 'patient') {
                return '/patients';
            }
        }
        if (location.pathname === '/patients' || location.pathname === '/settings' || location.pathname === '/dashboard') {
            return '/dashboard';
        }
        return -1;
    };

    const backPath = getBackPath();
    const showBackButton = backPath !== -1 && location.pathname !== '/dashboard';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <header className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4 sticky top-0 z-10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <button
                    onClick={showBackButton ? () => (typeof backPath === 'string' ? navigate(backPath) : navigate(-1)) : onMenuClick}
                    className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 transition lg:hidden"
                >
                    {showBackButton ? <BackArrowIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
                <div className="hidden lg:flex lg:mr-4">
                    {showBackButton && (
                        <button onClick={() => typeof backPath === 'string' ? navigate(backPath) : navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 transition">
                            <BackArrowIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    )}
                </div>
                {/* Logo "Round Kids" */}
                <div className="flex items-center gap-2">
                    <ClipboardIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-slate-900 dark:text-slate-100 hidden sm:inline text-lg">Round Kids</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate sm:hidden">{title}</h1>
            </div>

            {/* Right side: Avatar and Logout */}
            <div className="flex items-center gap-3">
                {user?.avatarUrl && (
                    <img
                        src={user.avatarUrl}
                        alt="User avatar"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover bg-slate-200 dark:bg-slate-700"
                    />
                )}
                <button
                    onClick={handleLogout}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                    title="Sair"
                >
                    <LogOutIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            </div>
        </header>
    );
};
