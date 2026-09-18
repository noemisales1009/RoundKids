import React from 'react';
import { ShiftType } from '../../services/shiftFilterService';

const SHIFT_INFO: Record<ShiftType, { label: string; icon: string }> = {
    morning: { label: 'Manhã', icon: '🌅' },
    afternoon: { label: 'Tarde', icon: '☀️' },
    night: { label: 'Noite', icon: '🌙' },
};

interface AlertasTurnoProps {
    shift: ShiftType;
    count: number;
    active: boolean;
    onClick: () => void;
}

export const AlertasTurno: React.FC<AlertasTurnoProps> = ({ shift, count, active, onClick }) => {
    const info = SHIFT_INFO[shift];
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition ${
                active
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            <span>{info.icon}</span>
            <span>{info.label}</span>
            {count > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                    active ? 'bg-white text-primary-700' : 'bg-red-500 text-white'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
};
