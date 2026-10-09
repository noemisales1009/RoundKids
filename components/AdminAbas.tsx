import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldIcon, CpuIcon, HeartPulseIcon, ClockIcon, ClipboardIcon } from './icons';

// Área de Administração: as telas que só o administrador vê ficam em um lugar
// só, com abas no topo. O menu aponta para /admin, que abre a primeira aba.
const ABAS_ADMIN = [
    { path: '/admin/usuarios', label: 'Usuários', icon: ShieldIcon },
    { path: '/admin/acessos', label: 'Acessos', icon: ClockIcon },
    { path: '/admin/ia', label: 'Acertos da IA', icon: CpuIcon },
    { path: '/admin/saude', label: 'Saúde do sistema', icon: HeartPulseIcon },
    { path: '/admin/arquivados', label: 'Pacientes arquivados', icon: ClipboardIcon },
];

export const AdminAbas: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div>
        <nav aria-label="Administração" className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700 mb-4">
            {ABAS_ADMIN.map(aba => (
                <NavLink
                    key={aba.path}
                    to={aba.path}
                    className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition ${isActive
                            ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`
                    }
                >
                    <aba.icon className="w-4 h-4" />
                    <span>{aba.label}</span>
                </NavLink>
            ))}
        </nav>
        {children}
    </div>
);
