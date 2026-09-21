import React from 'react';
import { Alerta, isAlertaAtivo } from '../../services/alertasService';
import { textoJustificativa } from '../../lib/motivosAlerta';
import { LABEL_TURNO, Turno, turnoEDiaDe } from '../../lib/turno';

interface AlertaCardProps {
    alerta: Alerta;
    onJustificar: (a: Alerta) => void;
    onConcluir: (a: Alerta) => void;
    onArquivar: (a: Alerta) => void;
    onToggleEvolucao?: (a: Alerta, value: boolean) => void;
    onToggleContinuo?: (a: Alerta) => void;
    saving?: boolean;
}

const getPriorityColor = (priority?: string | null) => {
    switch (priority?.toLowerCase()) {
        case 'alta':
        case 'high':
            return 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-200';
        case 'média':
        case 'medium':
            return 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200';
        case 'baixa':
        case 'low':
            return 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200';
        default:
            return 'bg-primary-100 dark:bg-primary-900/30 border-l-4 border-primary-500 text-primary-800 dark:text-primary-200';
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const AlertaCard: React.FC<AlertaCardProps> = ({ alerta, onJustificar, onConcluir, onArquivar, onToggleEvolucao, onToggleContinuo, saving }) => {
    const concluido = !isAlertaAtivo(alerta);
    const justificativa = textoJustificativa(alerta.justificativa_motivo, alerta.justificativa || alerta.justification);
    const responsavel = alerta.responsavel || alerta.responsible;
    // Registro tardio: o turno escolhido no cadastro difere do turno da hora real de criação.
    // A hora de criação exibida continua sendo a real; esta linha só explica a que turno o alerta se refere.
    const turnoRef: Turno | null = alerta.turno === 'manha' || alerta.turno === 'tarde' || alerta.turno === 'noite' ? alerta.turno : null;
    const tardio = !!turnoRef && !!alerta.created_at && turnoRef !== turnoEDiaDe(alerta.created_at).turno;

    return (
        <div
            className={`p-4 rounded-lg ${
                concluido
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-emerald-900 dark:text-emerald-100'
                    : getPriorityColor(alerta.priority)
            }`}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className={`font-semibold ${concluido ? 'line-through decoration-green-600/60' : ''}`}>
                            {alerta.alertaclinico}
                        </p>
                        <span className="text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded font-semibold opacity-70">
                            {alerta.source === 'alertas' ? '🏥 Clínico' : '📋 Task'}
                        </span>
                        {concluido && (
                            <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                ✓ Concluído
                            </span>
                        )}
                        {!concluido && alerta.continuo && (
                            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                📌 Contínua
                            </span>
                        )}
                    </div>

                    <div className="text-xs opacity-75 space-y-1">
                        {responsavel && <p>👤 Responsável: {responsavel}</p>}
                        <p>📅 Criado: {formatDate(alerta.created_at)}{alerta.created_by_name ? ` · ${alerta.created_by_name}` : ''}</p>
                        {tardio && turnoRef && (
                            <p className="font-semibold">🕗 Registro tardio · referente ao turno da {LABEL_TURNO[turnoRef]}</p>
                        )}
                    </div>

                    {alerta.source === 'alertas' && alerta.sistemas && alerta.sistemas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {alerta.sistemas.map(s => (
                                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/30 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-600">
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}

                    {justificativa && (
                        <div className="mt-3 p-2 bg-white/50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-700 dark:text-slate-300">
                                <strong>Justificativa:</strong> {justificativa}
                            </p>
                        </div>
                    )}

                    {!concluido && alerta.source === 'alertas' && onToggleEvolucao && (
                        <label className="flex items-center gap-1.5 mt-2 cursor-pointer select-none w-fit">
                            <input
                                type="checkbox"
                                checked={alerta.mostrar_evolucao !== false}
                                onChange={e => onToggleEvolucao(alerta, e.target.checked)}
                                className="w-3.5 h-3.5 accent-primary-500"
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-400">Exibir na Evolução Diária</span>
                        </label>
                    )}
                </div>

                {concluido ? (
                    <div className="text-xs text-green-700 dark:text-green-300 shrink-0 text-right">
                        ✓ Concluído
                        {alerta.concluded_by_name && <><br />por <strong>{alerta.concluded_by_name}</strong></>}
                        {alerta.concluded_at && <><br />{formatDate(alerta.concluded_at)}</>}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 shrink-0">
                        <button
                            onClick={() => onJustificar(alerta)}
                            disabled={saving}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition"
                        >
                            {justificativa ? 'Editar' : 'Justificar'}
                        </button>
                        <button
                            onClick={() => onConcluir(alerta)}
                            disabled={saving}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition"
                        >
                            {saving ? 'Salvando...' : 'Concluir'}
                        </button>
                        {onToggleContinuo && (
                            <button
                                onClick={() => onToggleContinuo(alerta)}
                                disabled={saving}
                                title="Alerta contínuo continua na lista e não bloqueia a criação de novos alertas"
                                className={`flex items-center gap-1 px-3 py-1.5 disabled:opacity-50 text-white text-xs font-semibold rounded transition ${alerta.continuo ? 'bg-purple-800 hover:bg-purple-900' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                                {alerta.continuo ? 'Desmarcar contínua' : '📌 Marcar contínua'}
                            </button>
                        )}
                        <button
                            onClick={() => onArquivar(alerta)}
                            disabled={saving}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded transition"
                        >
                            Arquivar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
