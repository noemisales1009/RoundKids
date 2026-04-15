import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, BedIcon, FileTextIcon, ClipboardIcon, SettingsIcon } from './icons';
import { UserContext } from '../contexts';

export const BottomNav: React.FC = () => {
    const { user } = useContext(UserContext)!;
    const isAdmin = user?.access_level === 'adm';
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { path: '/patients', label: 'Leitos', icon: BedIcon },
        { path: '/history', label: 'Histórico Geral', icon: FileTextIcon },
        ...(isAdmin ? [{ path: '/archived', label: 'Arquivados', icon: ClipboardIcon }] : []),
        { path: '/settings', label: 'Ajustes', icon: SettingsIcon },
    ];

    const activeLinkClass = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30";
    const inactiveLinkClass = "text-slate-600 dark:text-slate-300";

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-2 py-2 flex items-center justify-between lg:hidden">
            <div className="flex flex-1 gap-1">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition text-xs font-semibold ${isActive ? activeLinkClass : inactiveLinkClass}`
                        }
                    >
                        <item.icon className="w-5 h-5 mb-1" />
                        <span className="truncate">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
