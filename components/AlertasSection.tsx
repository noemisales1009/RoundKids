import React, { useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { NotificationContext, UserContext } from '../contexts';
import { alertasService, Alerta, isAlertaAtivo, isConcluidoVisivel } from '../services/alertasService';
import { AlertasDisplay } from './alerts/AlertasDisplay';

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
);

export const AlertasSection: React.FC<{ patientId: string }> = ({ patientId }) => {
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showJustificationModal, setShowJustificationModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<Alerta | null>(null);
    const [justificationText, setJustificationText] = useState('');
    const [archiveReason, setArchiveReason] = useState('');
    const [savingId, setSavingId] = useState<string | null>(null);
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;

    const fetchAlertas = useCallback(async () => {
        try {
            setLoading(true);
            const data = await alertasService.getAlertas(patientId);
            const enriquecidos = await alertasService.enriquecerJustificativas(data);
            setAlertas(enriquecidos);
        } catch (err) {
            console.error('Erro ao buscar alertas:', err);
            setAlertas([]);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        if (!patientId) return;

        fetchAlertas();

        const unsubscribeTasks = supabase
            .channel(`public:tasks:patient_id=eq.${patientId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
                fetchAlertas();
            })
            .subscribe();

        const unsubscribeAlertas = supabase
            .channel(`public:alertas_paciente:patient_id=eq.${patientId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas_paciente' }, () => {
                fetchAlertas();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(unsubscribeTasks);
            supabase.removeChannel(unsubscribeAlertas);
        };
    }, [patientId, fetchAlertas]);

    const handleToggleEvolucao = async (alerta: Alerta, value: boolean) => {
        const ok = await alertasService.toggleMostrarEvolucao(alerta.id, value);
        if (ok) {
            setAlertas(prev => prev.map(a => a.id === alerta.id ? { ...a, mostrar_evolucao: value } : a));
        }
    };

    const handleConcluir = async (alerta: Alerta) => {
        if (!user?.id) {
            showNotification({ message: 'Usuário não identificado. Faça login novamente.', type: 'error' });
            return;
        }
        setSavingId(alerta.id);
        const ok = await alertasService.marcarComoConcluido(alerta.id, alerta.source, user.id);
        setSavingId(null);
        if (ok) {
            showNotification({ message: 'Alerta marcado como concluído!', type: 'success' });
            fetchAlertas();
        } else {
            showNotification({ message: 'Erro ao atualizar alerta', type: 'error' });
        }
    };

    const handleOpenArchiveModal = (alerta: Alerta) => {
        setSelectedAlert(alerta);
        setArchiveReason('');
        setShowArchiveModal(true);
    };

    const handleArquivar = async () => {
        if (!selectedAlert || !archiveReason.trim()) {
            showNotification({ message: 'Por favor, informe o motivo do arquivamento', type: 'error' });
            return;
        }
        if (!user?.id) {
            showNotification({ message: 'Usuário não identificado. Faça login novamente.', type: 'error' });
            return;
        }

        const ok = await alertasService.arquivarAlerta(selectedAlert.id, archiveReason, selectedAlert.source, user.id);
        if (ok) {
            setShowArchiveModal(false);
            setSelectedAlert(null);
            setArchiveReason('');
            showNotification({ message: 'Alerta arquivado com sucesso!', type: 'success' });
            fetchAlertas();
        } else {
            showNotification({ message: 'Erro ao arquivar alerta', type: 'error' });
        }
    };

    const handleOpenJustificationModal = (alerta: Alerta) => {
        setSelectedAlert(alerta);
        setJustificationText(alerta.justificativa || alerta.justification || '');
        setShowJustificationModal(true);
    };

    const handleSaveJustification = async () => {
        if (!selectedAlert) return;
        if (!user?.id) {
            showNotification({ message: 'Usuário não identificado. Faça login novamente.', type: 'error' });
            return;
        }

        const ok = await alertasService.updateJustificativa(selectedAlert.id, justificationText, selectedAlert.source, user.id);
        if (ok) {
            showNotification({ message: 'Justificativa salva com sucesso!', type: 'success' });
            setShowJustificationModal(false);
            setSelectedAlert(null);
            setJustificationText('');
            fetchAlertas();
        } else {
            showNotification({ message: 'Erro ao salvar justificativa', type: 'error' });
        }
    };

    const alertasAtivos = alertas.filter(isAlertaAtivo).length;
    const alertasVisiveis = alertas.filter(a => isAlertaAtivo(a) || isConcluidoVisivel(a)).length;

    return (
        <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
            {/* Header expansível */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">🚨</span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Alertas do Paciente</h3>
                    {!loading && alertasVisiveis > 0 && (
                        <span className={`text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${alertasAtivos > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}>
                            {alertasVisiveis}
                        </span>
                    )}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                    {isExpanded ? (
                        <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                    )}
                </div>
            </button>

            {/* Conteúdo expansível */}
            {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                    {loading ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Carregando alertas...</p>
                    ) : (
                        <AlertasDisplay
                            alertas={alertas}
                            onJustificar={handleOpenJustificationModal}
                            onConcluir={handleConcluir}
                            onArquivar={handleOpenArchiveModal}
                            onToggleEvolucao={handleToggleEvolucao}
                            savingId={savingId}
                        />
                    )}
                </div>
            )}

            {/* Modal de Justificativa */}
            {showJustificationModal && selectedAlert && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                            {(selectedAlert.justificativa || selectedAlert.justification) ? 'Editar Justificativa' : 'Adicionar Justificativa'}
                        </h3>

                        <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Alerta:</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{selectedAlert.alertaclinico}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Justificativa:
                            </label>
                            <textarea
                                value={justificationText}
                                onChange={(e) => setJustificationText(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                rows={4}
                                placeholder="Digite a justificativa para este alerta..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleSaveJustification}
                                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
                            >
                                Salvar
                            </button>
                            <button
                                onClick={() => {
                                    setShowJustificationModal(false);
                                    setSelectedAlert(null);
                                    setJustificationText('');
                                }}
                                className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-semibold rounded-lg transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Arquivamento */}
            {showArchiveModal && selectedAlert && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6">
                        <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-4">
                            ⚠️ Arquivar Alerta
                        </h3>

                        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Alerta:</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{selectedAlert.alertaclinico}</p>
                        </div>

                        <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded">
                            <p className="text-sm text-primary-800 dark:text-primary-300">
                                ℹ️ O alerta será arquivado e não aparecerá mais na lista ativa, mas ficará registrado no histórico do paciente com o motivo do arquivamento.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Motivo do Arquivamento: <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={archiveReason}
                                onChange={(e) => setArchiveReason(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                rows={4}
                                placeholder="Por favor, informe o motivo do arquivamento deste alerta..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleArquivar}
                                disabled={!archiveReason.trim()}
                                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                            >
                                Arquivar
                            </button>
                            <button
                                onClick={() => {
                                    setShowArchiveModal(false);
                                    setSelectedAlert(null);
                                    setArchiveReason('');
                                }}
                                className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-semibold rounded-lg transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
