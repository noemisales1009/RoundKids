import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { NotificationContext, UserContext } from '../contexts';

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

const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

interface CompletedAlert {
    id: string;
    description: string;
    priority: string | null;
    status: string;
    created_at: string;
    categoria_id?: number | null;
    category?: string;
    responsible?: string;
    deadline?: string;
    source?: 'tasks' | 'alertas';
    justificativa?: string | null;
    completed_at?: string;
    completed_by?: string;
    tempo_visibilidade?: string; // Tempo restante de visibilidade (ex: "18h 45min")
    status_conclusao?: string; // Hora de conclusão
}

export const CompletedAlertsSection: React.FC<{ patientId: string }> = ({ patientId }) => {
    const [alertas, setAlertas] = useState<CompletedAlert[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;

    useEffect(() => {
        const fetchAlertas = async () => {
            if (!patientId) return;

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('alertas_paciente_visibilidade_24h')
                    .select('*')
                    .eq('patient_id', patientId)
                    .order('tempo_visibilidade', { ascending: true }); // Mostra os que vão expirar primeiro

                const allAlertas: CompletedAlert[] = [];

                if (data && Array.isArray(data)) {
                    data.forEach((item: any) => {
                        allAlertas.push({
                            id: item.id_alerta?.toString() || item.id,
                            description: item.alertaclinico || item.description,
                            priority: item.priority || 'média',
                            status: item.status,
                            created_at: item.created_at,
                            source: item.tipo_origem || 'alertas',
                            completed_by: item.created_by_name || 'Sistema',
                            tempo_visibilidade: item.tempo_visibilidade
                        });
                    });
                }

                if (error) {
                    console.error('Erro ao buscar alertas:', error);
                }

                setAlertas(allAlertas);
            } catch (err) {
                console.error('Erro ao buscar alertas concluídos:', err);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchAlertas();
        }
    }, [patientId]);

    const getPriorityColor = (priority: string | null) => {
        if (!priority) return 'bg-slate-50 dark:bg-slate-800 border-l-4 border-slate-400';
        const p = priority.toLowerCase();
        if (p.includes('alta') || p.includes('high')) return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
        if (p.includes('m\u00e9dia') || p.includes('medium')) return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeleteAlert = async (alertId: string) => {
        if (!confirm('Tem certeza que deseja deletar este alerta?')) return;

        try {
            // Tentar deletar de alertas_paciente
            const { error } = await supabase
                .from('alertas_paciente')
                .delete()
                .eq('id', alertId);

            if (!error) {
                setAlertas(alertas.filter(a => a.id !== alertId));
                showNotification('Alerta deletado com sucesso', 'success');
            } else {
                console.error('Erro ao deletar:', error);
                showNotification('Erro ao deletar alerta', 'error');
            }
        } catch (err) {
            console.error('Erro ao deletar alerta:', err);
            showNotification('Erro ao deletar alerta', 'error');
        }
    };

    return (
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header expansível */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition border-b border-green-200 dark:border-green-800"
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Alertas Concluídos</h3>
                    {!loading && alertas.length > 0 && (
                        <span className="bg-green-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                            {alertas.length}
                        </span>
                    )}
                </div>
                <div className="text-green-600 dark:text-green-400">
                    {isExpanded ? (
                        <ChevronUpIcon className="w-6 h-6" />
                    ) : (
                        <ChevronDownIcon className="w-6 h-6" />
                    )}
                </div>
            </button>

            {/* Conteúdo expansível */}
            {isExpanded && (
                <div className="border-t border-green-200 dark:border-green-800 bg-white dark:bg-slate-800 p-4">
                    {loading ? (
                        <p className="text-center text-slate-600 dark:text-slate-300 py-6 text-base font-medium">Carregando alertas concluídos...</p>
                    ) : alertas.length === 0 ? (
                        <p className="text-center text-slate-600 dark:text-slate-300 py-6 text-base">Nenhum alerta concluído</p>
                    ) : (
                        <div className="space-y-3">
                            {alertas.map((alerta) => (
                                <div
                                    key={alerta.id}
                                    className={`p-4 rounded-lg ${getPriorityColor(alerta.priority)}`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="font-bold text-base text-slate-900 dark:text-slate-100">{alerta.description}</p>
                                                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-semibold">
                                                    {alerta.source === 'alertas' ? '🏥 Clínico' : '📋 Task'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
                                                <p className="font-medium">📊 Status: <span className="text-slate-600 dark:text-slate-400">{alerta.status}</span></p>
                                                {alerta.responsible && (
                                                    <p className="font-medium">👤 Responsável: <span className="text-slate-600 dark:text-slate-400">{alerta.responsible}</span></p>
                                                )}
                                                <p className="font-medium">📅 Criado: <span className="text-slate-600 dark:text-slate-400">{formatDate(alerta.created_at)}</span></p>
                                                {alerta.completed_by && (
                                                    <p className="font-medium text-green-700 dark:text-green-300">✓ Concluído por: <span className="text-green-600 dark:text-green-400">{alerta.completed_by}</span></p>
                                                )}
                                                
                                                {/* Mostrar tempo de visibilidade se disponível */}
                                                {alerta.tempo_visibilidade && (
                                                    <div className={`flex items-center gap-2 mt-2 p-2 rounded font-semibold ${
                                                        alerta.tempo_visibilidade === 'Expirado'
                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                    }`}>
                                                        <span>⏱️</span>
                                                        <span>
                                                            {alerta.tempo_visibilidade === 'Expirado' 
                                                                ? 'Visibilidade expirada' 
                                                                : `Visível por: ${alerta.tempo_visibilidade}`
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
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
