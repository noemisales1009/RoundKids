import React from 'react';
import { Turno } from '../lib/turno';

const TURNOS: { id: Turno; label: string; icon: string }[] = [
  { id: 'manha', label: 'Manhã', icon: '🌅' },
  { id: 'tarde', label: 'Tarde', icon: '☀️' },
  { id: 'noite', label: 'Noite', icon: '🌙' },
];

interface TurnoSelectorProps {
  value: Turno;
  onChange: (t: Turno) => void;
  label?: string;
}

export const TurnoSelector: React.FC<TurnoSelectorProps> = ({ value, onChange, label = 'Turno deste registro' }) => (
  <div>
    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{label}</p>
    <div className="flex gap-1.5">
      {TURNOS.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
            value === t.id
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  </div>
);
