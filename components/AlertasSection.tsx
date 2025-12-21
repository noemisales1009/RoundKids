import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { NotificationContext } from '../contexts';

// Ícones simples usando símbolos
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

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

interface Alert {
    id: string;
    description: string;
    priority: string | null;
    status: string;
    created_at: string;
    categoria_id?: number | null;
    category?: string;
    time_label?: string;
    responsible?: string;
    deadline?: string;
    source?: 'tasks' | 'alertas'; // Para diferenciar a origem
}

export const AlertasSection: React.FC<{ patientId: string }> = ({ patientId }) => {
    const [alertas, setAlertas] = useState<Alert[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useContext(NotificationContext)!;

    // Buscar alertas do paciente (de ambas as views)
    useEffect(() => {
        const fetchAlertas = async () => {
            try {
                setLoading(true);
                console.log('Buscando alertas para paciente:', patientId);
                
                // Buscar de ambas as views (igual ao PatientHistoryScreen)
                const [tasksResult, alertasResult] = await Promise.all([
                    supabase
                        .from('tasks_view_horario_br')
                        .select('*')
                        .eq('patient_id', patientId),
                    supabase
                        .from('alertas_paciente_view_completa')
                        .select('*')
                        .eq('patient_id', patientId)
                ]);

                console.log('tasksResult:', tasksResult);
                console.log('alertasResult:', alertasResult);

                const allAlertas: Alert[] = [];

                // Adicionar tasks como alertas
                if (tasksResult.data && Array.isArray(tasksResult.data)) {
                    console.log(`Encontrados ${tasksResult.data.length} tasks`);
                    tasksResult.data.forEach((task: any) => {
                        if (task && task.id_alerta) {
                            allAlertas.push({
                                id: task.id_alerta.toString(),
                                description: task.alertaclinico || task.description || task.descricao_limpa,
                                priority: task.priority || 'média',
                                status: task.status,
                                created_at: task.created_at,
                                categoria_id: task.category_id,
                                category: task.category,
                                time_label: task.prazo_formatado,
                                responsible: task.responsavel || task.responsible,
                                deadline: task.deadline,
                                source: 'tasks'
                            });
                        }
                    });
                }

                // Adicionar alertas clínicos
                if (alertasResult.data && Array.isArray(alertasResult.data)) {
                    console.log(`Encontrados ${alertasResult.data.length} alertas clínicos`);
                    alertasResult.data.forEach((alert: any) => {
                        if (alert && alert.id_alerta) {
                            allAlertas.push({
                                id: alert.id_alerta.toString(),
                                description: alert.alertaclinico,
                                priority: alert.prioridade || 'média',
                                status: alert.status,
                                created_at: alert.created_at,
                                categoria_id: alert.categoria_id,
                                category: alert.categoria,
                                time_label: alert.prazo_formatado,
                                responsible: alert.responsavel,
                                deadline: alert.deadline,
                                source: 'alertas'
                            });
                        }
                    });
                }

                // Filtrar apenas os não concluídos/resolvidos/arquivados
                const activeAlertas = allAlertas.filter(a => {
                    const status = (a.status || '').toLowerCase();
                    const isInactive = status.includes('concluído') || 
                                      status.includes('arquivado') ||
                                      status.includes('resolvido') ||
                                      status.includes('concluido');
                    console.log(`Alerta ${a.id} - status: "${a.status}" - incluído: ${!isInactive}`);
                    return !isInactive;
                });

                console.log('Todos os alertas encontrados:', allAlertas);
                console.log('Total de alertas ATIVOS:', activeAlertas.length, activeAlertas);
                setAlertas(activeAlertas);
            } catch (err) {
                console.error('Erro ao buscar alertas:', err);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchAlertas();

            // Subscribe a mudanças em tempo real
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
        }
    }, [patientId]);

    const handleConcluir = async (alertId: string, source?: 'tasks' | 'alertas') => {
        try {
            // Obter o user_id atual
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            if (source === 'alertas') {
                // Para alertas clínicos, atualiza status para 'resolvido'
                const { error } = await supabase
                    .from('alertas_paciente')
                    .update({ status: 'resolvido' })
                    .eq('id', alertId);

                if (error) {
                    showNotification({ message: 'Erro ao marcar alerta como resolvido', type: 'error' });
                    return;
                }
            } else {
                // Para tasks, atualiza status para 'concluído'
                const { error } = await supabase
                    .from('tasks')
                    .update({ status: 'concluído' })
                    .eq('id', alertId);

                if (error) {
                    showNotification({ message: 'Erro ao marcar como concluído', type: 'error' });
                    return;
                }
            }

            // Salvar em alert_completions (rastrear quem completou e quando)
            const { error: completionError } = await supabase
                .from('alert_completions')
                .upsert({
                    alert_id: parseInt(alertId),
                    source: source || 'tasks',
                    completed_by: userId,
                    completed_at: new Date().toISOString()
                }, {
                    onConflict: 'alert_id,source'
                });

            if (completionError) {
                console.error('Erro ao registrar conclusão:', completionError);
                // Não falhar o fluxo principal se o registro de conclusão falhar
            }

            // Remove do estado local
            setAlertas(alertas.filter(a => a.id !== alertId));
            showNotification({ message: 'Alerta marcado como concluído!', type: 'success' });
        } catch (err) {
            console.error('Erro ao atualizar alerta:', err);
            showNotification({ message: 'Erro ao atualizar alerta', type: 'error' });
        }
    };

    const handleDeletar = async (alertId: string, source?: 'tasks' | 'alertas') => {
        if (!window.confirm('Tem certeza que deseja DELETAR este alerta?')) return;

        try {
            if (source === 'alertas') {
                // Deletar de alertas_paciente
                const { error } = await supabase
                    .from('alertas_paciente')
                    .delete()
                    .eq('id', alertId);

                if (error) {
                    showNotification({ message: 'Erro ao deletar alerta clínico', type: 'error' });
                    return;
                }
            } else {
                // Deletar de tasks
                const { error } = await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', alertId);

                if (error) {
                    showNotification({ message: 'Erro ao deletar task', type: 'error' });
                    return;
                }
            }

            // Remove do estado local
            setAlertas(alertas.filter(a => a.id !== alertId));
            showNotification({ message: 'Alerta deletado com sucesso!', type: 'success' });
        } catch (err) {
            console.error('Erro ao deletar alerta:', err);
            showNotification({ message: 'Erro ao deletar alerta', type: 'error' });
        }
    };



    const getPriorityColor = (priority: string | null) => {
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
                return 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                    {!loading && alertas.length > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {alertas.length}
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
                    ) : alertas.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum alerta aberto</p>
                    ) : (
                        <div className="space-y-3">
                            {alertas.map((alerta) => (
                                <div
                                    key={alerta.id}
                                    className={`p-4 rounded-lg ${getPriorityColor(alerta.priority)}`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold">{alerta.description}</p>
                                                <span className="text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded font-semibold opacity-70">
                                                    {alerta.source === 'alertas' ? '🏥 Clínico' : '📋 Task'}
                                                </span>
                                            </div>
                                            <div className="text-xs opacity-75 space-y-1">
                                                {alerta.category && (
                                                    <p>📋 Categoria: {alerta.category}</p>
                                                )}
                                                {alerta.responsible && (
                                                    <p>👤 Responsável: {alerta.responsible}</p>
                                                )}
                                                {alerta.priority && (
                                                    <p>📊 Prioridade: {alerta.priority}</p>
                                                )}
                                                <p>📅 Criado: {formatDate(alerta.created_at)}</p>
                                                {alerta.deadline && (
                                                    <p>⏰ Prazo: {formatDate(alerta.deadline)}</p>
                                                )}
                                                {alerta.time_label && (
                                                    <p>⏱️ {alerta.time_label}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleConcluir(alerta.id, alerta.source)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition"
                                                title="Marcar como concluído"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                                Concluir
                                            </button>
                                            <button
                                                onClick={() => handleDeletar(alerta.id, alerta.source)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition"
                                                title="Deletar alerta"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Deletar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
