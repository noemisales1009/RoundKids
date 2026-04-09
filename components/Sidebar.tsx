import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { DashboardIcon, BedIcon, FileTextIcon, ClipboardIcon, SettingsIcon, LogOutIcon } from './icons';
import { LoadingIndicator } from './LoadingIndicator';
import { UserContext } from '../contexts';
import { supabase } from '../supabaseClient';

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user, isLoading } = useContext(UserContext)!;
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { path: '/patients', label: 'Leitos', icon: BedIcon },
        { path: '/history', label: 'Histórico Geral', icon: FileTextIcon },
        { path: '/archived', label: 'Pacientes Arquivados', icon: ClipboardIcon },
        { path: '/settings', label: 'Ajustes', icon: SettingsIcon },
    ];

    const activeLinkClass = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
    const inactiveLinkClass = "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
                <ClipboardIcon className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Round Juju</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold transition ${isActive ? activeLinkClass : inactiveLinkClass
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                {isLoading ? (
                    <LoadingIndicator
                        type="spinner"
                        message="Carregando seu perfil..."
                        size="md"
                    />
                ) : user.name ? (
                    <>
                        <div className="flex items-center space-x-3 mb-4">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="User avatar" className="w-12 h-12 rounded-full object-cover bg-slate-200" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.title || 'Usuário'}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
                        Nenhum usuário encontrado
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg font-semibold transition ${
                        isLoading
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300'
                    }`}
                >
                    <LogOutIcon className="w-5 h-5" />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};
