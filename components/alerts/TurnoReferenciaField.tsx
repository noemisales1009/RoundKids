import React from 'react';
import { Turno, LABEL_TURNO, turnoAtualSP, turnosParaRegistro } from '../../lib/turno';

interface Props {
    value: Turno;
    onChange: (t: Turno) => void;
    disabled?: boolean;
    // Cor do anel de foco, para casar com o formulário que usa o campo
    ringClass?: string;
}

// Registro tardio: permite lançar agora um alerta que pertence a um turno anterior do
// mesmo dia (quem está na tarde e esqueceu de registrar de manhã). A hora do registro
// não muda e o prazo continua contando dela; muda apenas o turno em que o alerta aparece.
// Na manhã não existe turno anterior no dia, então o campo não é exibido.
export const TurnoReferenciaField: React.FC<Props> = ({ value, onChange, disabled, ringClass = 'focus:ring-primary-500' }) => {
    const opcoes = turnosParaRegistro();
    if (opcoes.length < 2) return null;
    const atual = turnoAtualSP();

    return (
        <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Turno de referência
            </label>
            <select
                value={value}
                onChange={e => onChange(e.target.value as Turno)}
                disabled={disabled}
                className={`w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 ${ringClass} transition text-sm sm:text-base text-slate-800 dark:text-slate-200`}
            >
                {opcoes.map(t => (
                    <option key={t} value={t}>{LABEL_TURNO[t]}{t === atual ? ' (atual)' : ''}</option>
                ))}
            </select>
            {value !== atual && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Registro tardio: o alerta vai para a aba {LABEL_TURNO[value]}. A hora do registro
                    continua sendo a de agora, e o prazo conta a partir dela.
                </p>
            )}
        </div>
    );
};
