import React from 'react';
import { MOTIVOS_ALERTA } from '../../lib/motivosAlerta';

interface Props {
    motivo: string;
    descricao: string;
    onMotivo: (v: string) => void;
    onDescricao: (v: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
}

export const JustificativaMotivoFields: React.FC<Props> = ({ motivo, descricao, onMotivo, onDescricao, disabled, autoFocus }) => {
    const atual = MOTIVOS_ALERTA.find(m => m.label === motivo);
    return (
        <div className="space-y-2">
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Motivo <span className="text-red-500">*</span>
                </label>
                <select
                    value={motivo}
                    onChange={e => onMotivo(e.target.value)}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="">Selecione o motivo...</option>
                    {MOTIVOS_ALERTA.map((m, i) => (
                        <option key={m.label} value={m.label}>{i + 1}. {m.label}</option>
                    ))}
                </select>
                {atual && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{atual.orientacao}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Descrição <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <textarea
                    value={descricao}
                    onChange={e => onDescricao(e.target.value)}
                    disabled={disabled}
                    rows={3}
                    placeholder="Descrição (opcional)"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
        </div>
    );
};
