import React, { useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';
import { FileTextIcon, CloseIcon, ChevronDownIcon } from './components/icons';
import { RESPONSIBLES } from './constants';

import { NotificationContext } from './contexts';

interface AlertsHistoryScreenProps {
    useHeader: (title: string) => void;
}

export const AlertsHistoryScreen: React.FC<AlertsHistoryScreenProps> = ({ useHeader }) => {
    useHeader('Histórico Geral');
    const { showNotification } = useContext(NotificationContext)!;

    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('todos');
    const [selectedProfessional, setSelectedProfessional] = useState('todos');
    const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
    const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
    const patientDropdownRef = React.useRef<HTMLDivElement>(null);

    // Buscar todos os alertas
    const fetchAllAlerts = async () => {
        setLoading(true);
        try {
            // Buscar alertas ativos (não arquivados, não concluídos)
            const [tasksResult, alertsResult, patientsResult] = await Promise.all([
                supabase
                    .from('tasks_view_horario_br')
                    .select('*')
                    .not('live_status', 'in', '("concluído","arquivado")'),
                supabase
                    .from('alertas_paciente_view_completa')
                    .select('*')
                    .not('live_status', 'in', '("concluído","arquivado")'),
                supabase.from('patients').select('id, name, bed_number')
            ]);

            const patientsMap = new Map();
            (patientsResult.data || []).forEach(p => {
                patientsMap.set(p.id, { name: p.name, bed_number: p.bed_number });
            });

            const tasksFiltered = tasksResult.data || [];
            const alertsFiltered = alertsResult.data || [];

            const allAlerts = [
                ...tasksFiltered.map(t => {
                    const patientInfo = t.patient_id ? patientsMap.get(t.patient_id) : null;
                    return {
                        ...t,
                        source: 'tasks',
                        patient_name: patientInfo?.name || t.patient_name,
                        bed_number: patientInfo?.bed_number || null
                    };
                }),
                ...alertsFiltered.map(a => {
                    const patientInfo = a.patient_id ? patientsMap.get(a.patient_id) : null;
                    return {
                        ...a,
                        source: 'alertas',
                        patient_name: patientInfo?.name || a.patient_name,
                        bed_number: patientInfo?.bed_number || null
                    };
                })
            ];

            // Ordenar por data de criação (mais recentes primeiro)
            allAlerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setAlerts(allAlerts);
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
            showNotification({ message: 'Erro ao carregar histórico', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAlerts();
    }, []);

    // Gerar lista de profissionais: usa a lista completa de RESPONSIBLES + quaisquer outros que existam nos alertas
    const professionals = useMemo(() => {
        const fromAlerts = alerts.map(a => a.responsavel).filter(Boolean);
        const combined = new Set<string>([...RESPONSIBLES, ...fromAlerts]);
        return Array.from(combined).sort();
    }, [alerts]);

    // Gerar lista de pacientes únicos (nome + leito)
    const uniquePatients = useMemo(() => {
        const patientMap = new Map<string, { name: string; bed_number: string | null }>();
        alerts.forEach(a => {
            if (a.patient_name && !patientMap.has(a.patient_name)) {
                patientMap.set(a.patient_name, { name: a.patient_name, bed_number: a.bed_number });
            }
        });
        return [...patientMap.values()].sort((a, b) => {
            const bedA = Number(a.bed_number) || 999;
            const bedB = Number(b.bed_number) || 999;
            return bedA - bedB;
        });
    }, [alerts]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
                setPatientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const togglePatient = (name: string) => {
        setSelectedPatients(prev =>
            prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
        );
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedDate('');
        setSelectedStatus('todos');
        setSelectedProfessional('todos');
        setSelectedPatients([]);
    };

    const applyDateShortcut = (days: number) => {
        const today = new Date();
        setSelectedDate(today.toISOString().split('T')[0]);
        if (days === 0) return;
        const start = new Date(today);
        start.setDate(today.getDate() - days);
        setSelectedDate(start.toISOString().split('T')[0]);
    };

    const activeFilterCount = [
        searchTerm !== '',
        selectedDate !== '',
        selectedStatus !== 'todos',
        selectedProfessional !== 'todos',
        selectedPatients.length > 0,
    ].filter(Boolean).length;

    // Filtrar alertas
    const filteredAlerts = useMemo(() => {
        const result = alerts.filter(alert => {
            // Filtro por busca (nome ou leito)
            const matchesSearch = searchTerm === '' ||
                alert.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.bed_number?.toString().includes(searchTerm);

            // Filtro por data - converter para YYYY-MM-DD format
            let matchesDate = selectedDate === '';
            if (selectedDate && alert.created_at) {
                const alertDate = alert.created_at.split('T')[0]; // Pega só YYYY-MM-DD
                matchesDate = alertDate === selectedDate;
            }

            // Filtro por status
            const matchesStatus = selectedStatus === 'todos' ||
                alert.live_status === selectedStatus;

            // Filtro por profissional
            const matchesProfessional = selectedProfessional === 'todos' ||
                alert.responsavel === selectedProfessional;

            // Filtro por pacientes selecionados
            const matchesPatients = selectedPatients.length === 0 ||
                selectedPatients.includes(alert.patient_name);

            return matchesSearch && matchesDate && matchesStatus && matchesProfessional && matchesPatients;
        });

        // Log de debug
        if (searchTerm || selectedDate || selectedStatus !== 'todos' || selectedProfessional !== 'todos' || selectedPatients.length > 0) {
            console.log('🔍 Filtros aplicados:', {
                searchTerm,
                selectedDate,
                selectedStatus,
                selectedProfessional,
                totalAlerts: alerts.length,
                filteredCount: result.length,
                sample: result[0]
            });
        }

        // Ordenar por leito (menor para maior) e depois por data de criação
        result.sort((a, b) => {
            const bednumA = Number(a.bed_number) || 999;
            const bednumB = Number(b.bed_number) || 999;
            
            if (bednumA !== bednumB) {
                return bednumA - bednumB;
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return result;
    }, [alerts, searchTerm, selectedDate, selectedStatus, selectedProfessional, selectedPatients]);

    // Gerar PDF
    const handleGeneratePDF = () => {
        const htmlContent = `
            <html>
            <head>
                <title>Histórico de Alertas</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
                    .info { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #3b82f6; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                    .status-no_prazo { background: #dbeafe; color: #1e40af; }
                    .status-fora_do_prazo { background: #fee2e2; color: #991b1b; }
                    .status-concluido { background: #d1fae5; color: #065f46; }
                    .status-alerta { background: #fef3c7; color: #92400e; }
                </style>
            </head>
            <body>
                <h1>Histórico de Alertas</h1>
                <div class="info">
                    <p><strong>Data de Geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    <p><strong>Total de Alertas:</strong> ${filteredAlerts.length}</p>
                    ${selectedDate ? `<p><strong>Filtrado por Data:</strong> ${selectedDate.split('-').reverse().join('/')}</p>` : ''}
                    ${selectedStatus !== 'todos' ? `<p><strong>Filtrado por Status:</strong> ${selectedStatus.replace('_', ' ')}</p>` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Leito</th>
                            <th>Alerta</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredAlerts.map(alert => `
                            <tr>
                                <td>${alert.patient_name || 'N/A'}</td>
                                <td>${alert.bed_number || 'N/A'}</td>
                                <td>${alert.alertaclinico || 'N/A'}</td>
                                <td><span class="status-badge status-${alert.live_status}">${alert.live_status?.replace('_', ' ') || 'N/A'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 500);
        } else {
            showNotification({ message: 'Por favor, habilite pop-ups para gerar o PDF.', type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Carregando histórico...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Filtros</h3>
                        {activeFilterCount > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                {activeFilterCount} ativo{activeFilterCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {activeFilterCount > 0 && (
                            <button onClick={clearAllFilters} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition">
                                Limpar tudo
                            </button>
                        )}
                        <button
                            onClick={handleGeneratePDF}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg transition text-sm"
                        >
                            <FileTextIcon className="w-4 h-4" />
                            Gerar PDF
                        </button>
                    </div>
                </div>

                {/* Atalhos de data */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Atalho:</span>
                    {[{ label: 'Hoje', days: 0 }, { label: 'Últimos 7 dias', days: 7 }, { label: 'Últimos 30 dias', days: 30 }].map(({ label, days }) => (
                        <button
                            key={label}
                            onClick={() => applyDateShortcut(days)}
                            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 rounded-full transition"
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Linha 1: Busca + Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Buscar</label>
                        <input
                            type="text"
                            placeholder="Nome ou leito..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Data</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-800 dark:text-slate-200"
                        />
                    </div>
                </div>

                {/* Linha 2: Status + Profissional */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-800 dark:text-slate-200"
                        >
                            <option value="todos">Todos os Status</option>
                            <option value="no_prazo">No Prazo</option>
                            <option value="fora_do_prazo">Fora do Prazo</option>
                            <option value="concluido">Concluídos</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Profissional</label>
                        <select
                            value={selectedProfessional}
                            onChange={(e) => setSelectedProfessional(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-800 dark:text-slate-200"
                        >
                            <option value="todos">Todos os Profissionais</option>
                            {professionals.map(prof => (
                                <option key={prof} value={prof}>{prof}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filtro multi-paciente */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Pacientes</label>
                    <div className="relative" ref={patientDropdownRef}>
                        <div
                            onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer flex items-center justify-between text-sm text-slate-800 dark:text-slate-200 hover:border-blue-400 transition"
                        >
                            <span className={selectedPatients.length === 0 ? 'text-slate-400' : ''}>
                                {selectedPatients.length === 0
                                    ? 'Filtrar por pacientes...'
                                    : `${selectedPatients.length} paciente${selectedPatients.length > 1 ? 's' : ''} selecionado${selectedPatients.length > 1 ? 's' : ''}`}
                            </span>
                            <div className="flex items-center gap-2">
                                {selectedPatients.length > 0 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedPatients([]); }}
                                        className="text-slate-400 hover:text-red-500 transition"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${patientDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {patientDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg">
                                {uniquePatients.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-slate-400">Nenhum paciente encontrado</div>
                                ) : (
                                    uniquePatients.map(patient => (
                                        <label
                                            key={patient.name}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedPatients.includes(patient.name)}
                                                onChange={() => togglePatient(patient.name)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-200">
                                                {patient.bed_number ? `Leito ${patient.bed_number} — ` : ''}{patient.name}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}

                        {selectedPatients.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedPatients.map(name => (
                                    <span key={name} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                        {name}
                                        <button onClick={() => togglePatient(name)} className="hover:text-red-500 transition">
                                            <CloseIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contador */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Mostrando <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredAlerts.length}</span> de <span className="font-semibold text-slate-700 dark:text-slate-300">{alerts.length}</span> alertas
                    </p>
                    {activeFilterCount > 0 && (
                        <button onClick={clearAllFilters} className="text-xs text-slate-400 hover:text-red-500 transition">
                            Limpar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de Alertas */}
            <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm text-center">
                        <p className="text-slate-500 dark:text-slate-400">Nenhum alerta encontrado com os filtros aplicados.</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => {
                        const statusBorderColor: Record<string, string> = {
                            no_prazo: 'border-blue-500',
                            fora_do_prazo: 'border-red-500',
                            concluido: 'border-green-500',
                            alerta: 'border-yellow-500',
                        };
                        const statusBadgeStyle: Record<string, string> = {
                            no_prazo: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
                            fora_do_prazo: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
                            concluido: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
                            alerta: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
                        };
                        const statusLabel: Record<string, string> = {
                            no_prazo: 'No Prazo',
                            fora_do_prazo: 'Fora do Prazo',
                            concluido: 'Concluído',
                            alerta: 'Alerta',
                        };
                        const border = statusBorderColor[alert.live_status] || 'border-slate-400';
                        const badge = statusBadgeStyle[alert.live_status] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                        const label = statusLabel[alert.live_status] || alert.live_status;
                        const isConcluded = ['concluido', 'Concluído', 'resolvido', 'Resolvido'].includes(alert.status);

                        return (
                            <div key={`${alert.source}-${alert.id_alerta}`} className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border-l-4 overflow-hidden ${border}`}>
                                {/* Header do card */}
                                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {alert.patient_name && (
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <Link to={`/patient/${alert.patient_id}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-base leading-tight">
                                                    {alert.patient_name}
                                                </Link>
                                                {alert.bed_number && (
                                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-full font-medium">
                                                        Leito {alert.bed_number}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{alert.alertaclinico}</p>
                                    </div>
                                    <span className={`shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${badge}`}>
                                        {label}
                                    </span>
                                </div>

                                {/* Rodapé do card */}
                                {(isConcluded && alert.tempo_visibilidade) || alert.responsavel ? (
                                    <div className="px-4 pb-3 flex items-center justify-between gap-2 flex-wrap border-t border-slate-100 dark:border-slate-800 pt-2">
                                        {isConcluded && alert.tempo_visibilidade && (
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                alert.tempo_visibilidade === 'Expirado'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                            }`}>
                                                ⏱ {alert.tempo_visibilidade === 'Expirado' ? 'Visibilidade expirada' : `Visível por: ${alert.tempo_visibilidade}`}
                                            </span>
                                        )}
                                        {alert.responsavel && (
                                            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{alert.responsavel}</span>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
