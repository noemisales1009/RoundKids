import React, { useState } from 'react';
import { Alerta, isAlertaAtivo, isConcluidoVisivel, getShiftDoAlerta } from '../../services/alertasService';
import { ShiftType } from '../../services/shiftFilterService';
import { AlertasTurno } from './AlertasTurno';
import { AlertaCard } from './AlertaCard';

const ORDEM_TURNOS: ShiftType[] = ['morning', 'afternoon', 'night'];

// Abertos primeiro; concluídos ficam no fim da aba até o mesmo turno do dia seguinte.
const agruparPorTurno = (lista: Alerta[]): Record<ShiftType, Alerta[]> => {
    const grupos: Record<ShiftType, Alerta[]> = { morning: [], afternoon: [], night: [] };
    const ativos = lista.filter(isAlertaAtivo);
    const concluidos = lista.filter(a => isConcluidoVisivel(a));
    for (const a of [...ativos, ...concluidos]) {
        grupos[getShiftDoAlerta(a)].push(a);
    }
    return grupos;
};

const turnoAtual = (): ShiftType => {
    const hora = new Date().getHours();
    if (hora >= 7 && hora < 13) return 'morning';
    if (hora >= 13 && hora < 19) return 'afternoon';
    return 'night';
};

interface AlertasDisplayProps {
    alertas: Alerta[];
    onJustificar: (a: Alerta) => void;
    onConcluir: (a: Alerta) => void;
    onArquivar: (a: Alerta) => void;
    onToggleEvolucao?: (a: Alerta, value: boolean) => void;
    savingId?: string | null;
}

export const AlertasDisplay: React.FC<AlertasDisplayProps> = ({ alertas, onJustificar, onConcluir, onArquivar, onToggleEvolucao, savingId }) => {
    const [tab, setTab] = useState<ShiftType>(turnoAtual());
    const alertasPorTurno = agruparPorTurno(alertas);
    const total = alertasPorTurno.morning.length + alertasPorTurno.afternoon.length + alertasPorTurno.night.length;

    return (
        <div>
            <div className="flex gap-2 mb-3">
                {ORDEM_TURNOS.map(shift => (
                    <AlertasTurno
                        key={shift}
                        shift={shift}
                        count={alertasPorTurno[shift].filter(isAlertaAtivo).length}
                        active={tab === shift}
                        onClick={() => setTab(shift)}
                    />
                ))}
            </div>

            {total === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum alerta</p>
            ) : alertasPorTurno[tab].length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum alerta neste turno</p>
            ) : (
                <div className="space-y-3">
                    {alertasPorTurno[tab].map(alerta => (
                        <AlertaCard
                            key={`${alerta.source}-${alerta.id}`}
                            alerta={alerta}
                            onJustificar={onJustificar}
                            onConcluir={onConcluir}
                            onArquivar={onArquivar}
                            onToggleEvolucao={onToggleEvolucao}
                            saving={savingId === alerta.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
