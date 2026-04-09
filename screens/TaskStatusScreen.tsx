import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NotificationContext, UserContext } from '../contexts';
import { useHeader } from '../hooks/useHeader';
import { supabase } from '../supabaseClient';
import { WarningIcon, ClockIcon, AlertIcon, CheckCircleIcon } from '../components/icons';
import { TaskStatus } from '../types';
import { JustificationModal } from '../components/modals';

const TaskStatusScreen: React.FC = () => {
    const { status } = useParams<{ status: TaskStatus }>();
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;

    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [justificationModal, setJustificationModal] = useState<any | null>(null);

    const statusConfig = {
        alerta: { title: 'Alertas', icon: WarningIcon, color: 'yellow' },
        no_prazo: { title: 'No Prazo', icon: ClockIcon, color: 'blue' },
        fora_do_prazo: { title: 'Fora do Prazo', icon: AlertIcon, color: 'red' },
        concluido: { title: 'Concluídos', icon: CheckCircleIcon, color: 'green' },
    };

    const config = statusConfig[status as TaskStatus];
    useHeader(config ? config.title : 'Tarefas');

    // Buscar dados do Supabase
    const fetchAlerts = async () => {
        setLoading(true);
        try {
            // Buscar de ambas as views e também os pacientes
            const [tasksResult, alertsResult, patientsResult] = await Promise.all([
                supabase.from('tasks_view_horario_br').select('*'),
                supabase.from('alertas_paciente_view_completa').select('*'),
                supabase.from('patients').select('id, name, bed_number').is('archived_at', null)
            ]);

            // Criar mapa de pacientes para lookup rápido
            const patientsMap = new Map();
            (patientsResult.data || []).forEach(p => {
                patientsMap.set(p.id, { name: p.name, bed_number: p.bed_number });
            });

            // Combinar resultados e adicionar dados do paciente
            let allAlerts = [
                ...(tasksResult.data || []).map(t => {
                    const patientInfo = t.patient_id ? patientsMap.get(t.patient_id) : null;
                    return {
                        ...t,
                        source: 'tasks',
                        patient_name: patientInfo?.name || t.patient_name,
                        bed_number: patientInfo?.bed_number || null
                    };
                }),
                ...(alertsResult.data || []).map(a => {
                    const patientInfo = a.patient_id ? patientsMap.get(a.patient_id) : null;
                    return {
                        ...a,
                        source: 'alertas',
                        patient_name: patientInfo?.name || a.patient_name,
                        bed_number: patientInfo?.bed_number || null
                    };
                })
            ];

            // Filtrar para remover status resolvido/arquivado/concluído
            allAlerts = allAlerts.filter(alert => {
                const status = alert.status?.toLowerCase() || '';
                return !status.includes('resolvido') && !status.includes('arquivado') && !status.includes('concluído');
            });

            // Filtrar por live_status baseado no status da rota
            let filtered = allAlerts;
            if (status === 'alerta') {
                // Mostrar apenas alertas ativos (status original = 'alerta' ou 'aberto')
                filtered = allAlerts.filter(alert =>
                    (alert.status === 'alerta' || alert.status === 'aberto' || alert.status === 'Pendente') &&
                    alert.live_status !== 'concluido'
                );
            } else if (status === 'no_prazo') {
                filtered = allAlerts.filter(alert => alert.live_status === 'no_prazo');
            } else if (status === 'fora_do_prazo') {
                filtered = allAlerts.filter(alert => alert.live_status === 'fora_do_prazo');
            } else if (status === 'concluido') {
                filtered = allAlerts.filter(alert => alert.live_status === 'concluido');
            }

            setAlerts(filtered);

            // Debug: Log para verificar se justificativa está presente
            if (filtered.length > 0) {
            }
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
            showNotification({ message: 'Erro ao carregar alertas', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [status]);

    // Marcar como concluído
    const handleCompleteAlert = async (alert: any) => {
        if (!window.confirm('Tem certeza que deseja marcar como concluído?')) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;
            const table = alert.source === 'tasks' ? 'tasks' : 'alertas_paciente';
            const { error } = await supabase
                .from(table)
                .update({
                    status: 'concluido',
                    updated_at: new Date().toISOString(),
                    concluded_at: new Date().toISOString(),
                    concluded_by: userId
                })
                .eq('id', alert.id_alerta);

            if (error) throw error;

            showNotification({ message: 'Alerta marcado como concluído', type: 'success' });
            fetchAlerts();
        } catch (error) {
            console.error('Erro ao atualizar alerta:', error);
            showNotification({ message: 'Erro ao atualizar alerta', type: 'error' });
        }
    };

    // Justificar atraso
    const handleJustifyAlert = async (alert: any, justification: string) => {
        try {
            const table = alert.source === 'tasks' ? 'tasks' : 'alertas_paciente';
            const justificationField = alert.source === 'tasks' ? 'justification' : 'justificativa';
            const justificationByField = alert.source === 'tasks' ? 'justification_by' : 'justificativa_by';
            const justificationAtField = alert.source === 'tasks' ? 'justification_at' : 'justificativa_at';

            const { error } = await supabase
                .from(table)
                .update({
                    [justificationField]: justification,
                    [justificationByField]: user?.id || null,
                    [justificationAtField]: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', alert.id_alerta);

            if (error) throw error;

            showNotification({ message: 'Justificativa salva com sucesso', type: 'success' });
            setJustificationModal(null);
            fetchAlerts();
        } catch (error) {
            console.error('Erro ao salvar justificativa:', error);
            showNotification({ message: 'Erro ao salvar justificativa', type: 'error' });
        }
    };

    // Ocultar alerta concluído
    const handleHideAlert = async (alert: any) => {
        if (!window.confirm('Tem certeza que deseja ocultar este alerta?')) return;

        try {
            const table = alert.source === 'tasks' ? 'tasks' : 'alertas_paciente';

            // Soft delete - marcar como oculto
            const { error } = await supabase
                .from(table)
                .update({
                    status: 'oculto',
                    updated_at: new Date().toISOString()
                })
                .eq('id', alert.id_alerta);

            if (error) throw error;

            showNotification({ message: 'Alerta ocultado com sucesso', type: 'success' });
            fetchAlerts();
        } catch (error) {
            console.error('Erro ao ocultar alerta:', error);
            showNotification({ message: 'Erro ao ocultar alerta', type: 'error' });
        }
    };

    if (!config) return <p>Status inválido.</p>;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Carregando alertas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {alerts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm text-center">
                    <p className="text-slate-500 dark:text-slate-400">Nenhum alerta encontrado nesta categoria.</p>
                </div>
            ) : (
                alerts.map((alert: any) => {
                    const formattedDeadline = alert.prazo_limite_formatado || 'Sem prazo';
                    const prazoFormatado = alert.prazo_formatado || '';

                    return (
                        <div key={`${alert.source}-${alert.id_alerta}`} className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border-l-4 border-${config.color}-500`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {/* Nome do Paciente e Leito */}
                                    {alert.patient_name && (
                                        <div className="mb-2">
                                            <Link to={`/patient/${alert.patient_id}`} className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                                {alert.patient_name}
                                            </Link>
                                            <span className="ml-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                                Leito: <strong>{alert.bed_number || 'N/A'}</strong>
                                            </span>
                                        </div>
                                    )}

                                    {/* Descrição do Alerta */}
                                    <p className="font-bold text-slate-800 dark:text-slate-200 whitespace-pre-wrap">🔔 {alert.alertaclinico}</p>

                                    {/* Responsável */}
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        👤 Responsável: {alert.responsavel}
                                    </p>

                                    {/* Criado por */}
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        👨‍⚕️ Criado por: {alert.created_by_name}
                                    </p>

                                    {/* Prazo */}
                                    {prazoFormatado && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            ⏱️ Tempo: {prazoFormatado}
                                        </p>
                                    )}

                                    {/* Justificativa */}
                                    {alert.justificativa && (
                                        <p className="text-xs italic text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                            <strong>Justificativa:</strong> {alert.justificativa}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Prazo Limite:</p>
                                    <p className={`text-sm font-bold text-${config.color}-600 dark:text-${config.color}-400`}>
                                        {formattedDeadline}
                                    </p>
                                </div>
                            </div>

                            {/* Botões de ação baseados no status */}
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                                {status === 'fora_do_prazo' && (
                                    <>
                                        <button
                                            onClick={() => setJustificationModal(alert)}
                                            className="text-xs bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1.5 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900 transition"
                                        >
                                            {alert.justificativa ? 'Editar Justificativa' : 'Justificar Atraso'}
                                        </button>
                                        <button
                                            onClick={() => handleCompleteAlert(alert)}
                                            className="text-xs bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300 font-semibold px-3 py-1.5 rounded-md hover:bg-green-200 dark:hover:bg-green-900 transition"
                                        >
                                            Marcar como Concluído
                                        </button>
                                    </>
                                )}

                                {(status === 'alerta' || status === 'no_prazo') && (
                                    <button
                                        onClick={() => handleCompleteAlert(alert)}
                                        className="text-xs bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300 font-semibold px-3 py-1.5 rounded-md hover:bg-green-200 dark:hover:bg-green-900 transition"
                                    >
                                        Marcar como Concluído
                                    </button>
                                )}

                                {status === 'concluido' && (
                                    <button
                                        onClick={() => handleHideAlert(alert)}
                                        className="text-xs bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-300 font-semibold px-3 py-1.5 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition"
                                    >
                                        Ocultar
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
            {justificationModal && (
                <JustificationModal
                    alert={justificationModal}
                    onClose={() => setJustificationModal(null)}
                    onSave={handleJustifyAlert}
                />
            )}
        </div>
    );
};

export { TaskStatusScreen };
