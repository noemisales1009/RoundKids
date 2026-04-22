import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../contexts';
import { useHeader } from '../hooks/useHeader';
import { supabase } from '../supabaseClient';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { WarningIcon, ClockIcon, AlertIcon, CheckCircleIcon, ChevronDownIcon } from '../components/icons';

const DashboardScreen: React.FC = () => {
    useHeader('Dashboard');
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext)!;
    const [expandedProfessionals, setExpandedProfessionals] = useState<Set<string>>(new Set());
    const [allAlerts, setAllAlerts] = useState<any[]>([]);

    // Estado para armazenar dados do Supabase
    const [dashboardData, setDashboardData] = useState({
        totalAlertas: 0,
        totalNoPrazo: 0,
        totalForaDoPrazo: 0,
        totalConcluidos: 0
    });
    const [loading, setLoading] = useState(true);

    const professionalColorMap: Record<string, { border: string; icon: string; bg: string }> = {
        'Enfermeiro': { border: 'border-blue-400', icon: '👩‍⚕️', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        'Farmacêutico': { border: 'border-orange-400', icon: '💊', bg: 'bg-orange-50 dark:bg-orange-900/30' },
        'Fisioterapeuta': { border: 'border-green-400', icon: '🏃', bg: 'bg-green-50 dark:bg-green-900/30' },
        'Médico': { border: 'border-red-400', icon: '👨‍⚕️', bg: 'bg-red-50 dark:bg-red-900/30' },
        'Nutricionista': { border: 'border-amber-400', icon: '🍎', bg: 'bg-amber-50 dark:bg-amber-900/30' },
        'Odontólogo': { border: 'border-cyan-400', icon: '🦷', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
        'Psicólogo': { border: 'border-pink-400', icon: '🧠', bg: 'bg-pink-50 dark:bg-pink-900/30' },
        'Fonoaudiólogo': { border: 'border-fuchsia-400', icon: '🗣️', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30' },
        'Serviço Social': { border: 'border-teal-400', icon: '🤝', bg: 'bg-teal-50 dark:bg-teal-900/30' },
        'Terapeuta Ocupacional': { border: 'border-lime-400', icon: '🖐️', bg: 'bg-lime-50 dark:bg-lime-900/30' },
        // Combinações com 2 profissionais
        'Médico / Enfermeiro': { border: 'border-purple-400', icon: '👥', bg: 'bg-purple-50 dark:bg-purple-900/30' },
        'Médico / Fisioterapeuta': { border: 'border-indigo-400', icon: '👥', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
        'Médico / Nutricionista': { border: 'border-yellow-400', icon: '👥', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
        // Combinações multidisciplinares (3 profissionais)
        'Médico / Enfermeiro / Fisioterapeuta': { border: 'border-violet-400', icon: '👨‍⚕️👩‍⚕️🏃', bg: 'bg-violet-50 dark:bg-violet-900/30' },
        'Médico / Enfermeiro / Nutricionista': { border: 'border-rose-400', icon: '👨‍⚕️👩‍⚕️🍎', bg: 'bg-rose-50 dark:bg-rose-900/30' },
        'Médico / Odontólogo / Enfermeiro': { border: 'border-sky-400', icon: '👨‍⚕️🦷👩‍⚕️', bg: 'bg-sky-50 dark:bg-sky-900/30' },
        'Médico / Serviço Social / Enfermeiro': { border: 'border-emerald-400', icon: '👨‍⚕️🤝👩‍⚕️', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
        'Médico / Psicólogo / Enfermeiro': { border: 'border-pink-500', icon: '👨‍⚕️🧠👩‍⚕️', bg: 'bg-pink-100 dark:bg-pink-900/40' },
    };

    // Buscar dados do Supabase ao montar o componente
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // ✅ Buscar os dados
                const [
                    { data: summaryData, error: summaryError },
                    { data: tasksData },
                    { data: alertasData }
                ] = await Promise.all([
                    supabase.from('dashboard_summary').select('*').single(),
                    supabase.from('tasks_view_horario_br').select('*'),
                    supabase.from('alertas_paciente_view_completa').select('*')
                ]);

                // ✅ FILTRAR: Apenas alertas NÃO-concluídos e NÃO-arquivados para "Alertas por Profissional"
                const allAlertsFiltered = [
                    ...(tasksData || []).filter(t => !['concluído', 'arquivado'].includes(t.live_status)),
                    ...(alertasData || []).filter(a => !['concluído', 'arquivado', 'resolvido'].includes(a.live_status))
                ];
                setAllAlerts(allAlertsFiltered);

                if (summaryError) {
                    // Fallback: calcular manualmente
                    const allAlertsAll = [...(tasksData || []), ...(alertasData || [])];
                    setDashboardData({
                        totalAlertas: allAlertsAll.filter(a => a.live_status && !['concluído', 'arquivado'].includes(a.live_status)).length,
                        totalNoPrazo: allAlertsAll.filter(a => a.live_status === 'no_prazo').length,
                        totalForaDoPrazo: allAlertsAll.filter(a => ['fora_do_prazo', 'fora_do_prazo_com_justificativa'].includes(a.live_status)).length,
                        totalConcluidos: allAlertsAll.filter(a => ['concluído', 'arquivado'].includes(a.live_status)).length
                    });
                } else {
                    // ✅ Usar dados corretos da view
                    setDashboardData({
                        totalAlertas: summaryData?.totalAlertas || 0,
                        totalNoPrazo: summaryData?.totalNoPrazo || 0,
                        totalForaDoPrazo: summaryData?.totalForaDoPrazo || 0,
                        totalConcluidos: summaryData?.totalConcluidos || 0
                    });

                }

            } catch (err) {
                console.error('Erro ao buscar dados:', err);
                showNotification({ message: 'Erro ao carregar dashboard. Verifique sua conexão.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const summaryData = useMemo(() => {
        return [
            { title: 'Alertas', count: dashboardData.totalAlertas, icon: WarningIcon, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50', status: 'alerta' },
            { title: 'No Prazo', count: dashboardData.totalNoPrazo, icon: ClockIcon, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/50', status: 'no_prazo' },
            { title: 'Fora do Prazo', count: dashboardData.totalForaDoPrazo, icon: AlertIcon, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/50', status: 'fora_do_prazo' },
            { title: 'Concluídos', count: dashboardData.totalConcluidos, icon: CheckCircleIcon, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/50', status: 'concluido' },
        ];
    }, [dashboardData]);

    const toggleProfessional = (professional: string) => {
        const newExpanded = new Set(expandedProfessionals);
        if (newExpanded.has(professional)) {
            newExpanded.delete(professional);
        } else {
            newExpanded.add(professional);
        }
        setExpandedProfessionals(newExpanded);
    };

    const alertsByProfessional = useMemo(() => {
        const grouped: Record<string, any[]> = {};

        allAlerts.forEach(alert => {
            // Ambas as views têm coluna 'responsavel'
            const professional = alert.responsavel || 'Não informado';
            if (!grouped[professional]) {
                grouped[professional] = [];
            }
            grouped[professional].push(alert);
        });

        return Object.entries(grouped)
            .map(([professional, alerts]) => ({
                professional,
                count: alerts.length,
                tasks: alerts,
                colors: professionalColorMap[professional] || {
                    border: 'border-gray-400',
                    icon: '👤',
                    bg: 'bg-gray-50 dark:bg-gray-900/30'
                }
            }))
            .sort((a, b) => b.count - a.count);
    }, [allAlerts]);

    return (
        <div className="space-y-8">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingIndicator
                        type="spinner"
                        message="Carregando dados do dashboard..."
                        size="lg"
                    />
                </div>
            ) : (
                <>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Resumo do Dia</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {summaryData.map(item => (
                                <button key={item.title} onClick={() => navigate(`/status/${item.status}`)} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center justify-center space-y-2" aria-label={`Ver ${item.title}: ${item.count}`}>
                                    <div className={`p-3 rounded-full ${item.bgColor}`}>
                                        <item.icon className={`w-8 h-8 ${item.color}`} />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.title}</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">{item.count}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Alertas por Profissional</h2>
                        <div className="space-y-3">
                            {alertsByProfessional.length > 0 ? (
                                alertsByProfessional.map(item => (
                                    <div
                                        key={item.professional}
                                        className={`border-l-4 ${item.colors.border} ${item.colors.bg} hover:brightness-95 dark:hover:brightness-110 p-4 rounded-lg transition`}
                                    >
                                        <div
                                            className="flex justify-between items-center cursor-pointer"
                                            onClick={() => toggleProfessional(item.professional)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{item.colors.icon}</span>
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.professional}</h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.count} {item.count === 1 ? 'alerta' : 'alertas'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white font-bold rounded-full text-sm">
                                                    {item.count}
                                                </div>
                                                <ChevronDownIcon
                                                    className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${
                                                        expandedProfessionals.has(item.professional) ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {expandedProfessionals.has(item.professional) && (
                                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                                {item.tasks.map(alert => (
                                                    <div key={alert.id_alerta || alert.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded border-l-2 border-slate-300 dark:border-slate-600 text-sm space-y-2">
                                                        <p className="text-slate-900 dark:text-slate-200 font-bold">{alert.alertaclinico || alert.description || 'Sem descrição'}</p>
                                                        <div className="space-y-1 text-xs text-slate-700 dark:text-slate-400">
                                                            <p>🏥 Leito {alert.bed_number || '?'} - {alert.patient_name || 'Paciente desconhecido'}</p>
                                                            {alert.hora_criacao_formatado && <p>📅 Criado: {alert.hora_criacao_formatado}</p>}
                                                            {alert.prazo_limite_formatado && <p>⏰ Prazo: {alert.prazo_limite_formatado}</p>}
                                                            {alert.prazo_formatado && <p>⌛ Tempo: {alert.prazo_formatado}</p>}
                                                            {alert.live_status && <p>Status: <span className={alert.live_status === 'no_prazo' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}>{alert.live_status}</span></p>}
                                                        </div>
                                                        {(alert.justificativa || alert.justification) && (
                                                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded border-l-2 border-yellow-400 dark:border-yellow-500">
                                                                <p className="text-yellow-700 dark:text-yellow-300 text-xs font-semibold">💬 Justificativa:</p>
                                                                <p className="text-yellow-800 dark:text-slate-300 text-xs mt-1">{alert.justificativa || alert.justification}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-4">✅ Nenhum alerta em andamento!</p>
                            )}
                        </div>
                    </div>
                </>
            )}
            <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 pb-4">
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Idealizado por Dra. Lélia Braga / Criado por Noemi Sales
                </p>
            </div>
        </div>
    );
};

export { DashboardScreen };
