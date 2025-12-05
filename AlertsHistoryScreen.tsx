import React, { useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';
import { FileTextIcon, CloseIcon } from './components/icons';

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

    // Buscar todos os alertas
    const fetchAllAlerts = async () => {
        setLoading(true);
        try {
            const [tasksResult, alertsResult, patientsResult] = await Promise.all([
                supabase.from('tasks_view_horario_br').select('*'),
                supabase.from('alertas_paciente_view_completa').select('*'),
                supabase.from('patients').select('id, name, bed_number')
            ]);

            const patientsMap = new Map();
            (patientsResult.data || []).forEach(p => {
                patientsMap.set(p.id, { name: p.name, bed_number: p.bed_number });
            });

            const allAlerts = [
                ...(tasksResult.data || []).map(t => {
                    const patientInfo = t.patient_id ? patientsMap.get(t.patient_id) : null;
                    return {
                        ...t,
                        source: 'tasks',
                        patient_name: patientInfo?.name || t.patient_name || 'Desconhecido',
                        bed_number: patientInfo?.bed_number || t.bed_number || null
                    };
                }).filter(t => patientsMap.has(t.patient_id)), // Filtrar apenas alertas com pacientes válidos
                ...(alertsResult.data || []).map(a => {
                    const patientInfo = a.patient_id ? patientsMap.get(a.patient_id) : null;
                    return {
                        ...a,
                        source: 'alertas',
                        patient_name: patientInfo?.name || a.patient_name || 'Desconhecido',
                        bed_number: patientInfo?.bed_number || a.bed_number || null
                    };
                }).filter(a => patientsMap.has(a.patient_id)) // Filtrar apenas alertas com pacientes válidos
            ];

            // Ordenar por data de criação (mais recentes primeiro)
            allAlerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setAlerts(allAlerts);
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
            showNotification('Erro ao carregar histórico', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAlerts();
    }, []);

    // Filtrar e ordenar alertas
    const filteredAlerts = useMemo(() => {
        // Primeiro, aplicar filtros
        const filtered = alerts.filter(alert => {
            // Filtro por busca (nome ou leito)
            const matchesSearch = searchTerm === '' ||
                alert.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.bed_number?.toString().includes(searchTerm);

            // Filtro por data
            const matchesDate = selectedDate === '' ||
                alert.created_at?.startsWith(selectedDate);

            // Filtro por status
            const matchesStatus = selectedStatus === 'todos' ||
                alert.live_status === selectedStatus;

            return matchesSearch && matchesDate && matchesStatus;
        });

        // Depois, ordenar por leito (crescente) e depois por paciente e data (decrescente)
        return filtered.sort((a, b) => {
            // Primeiro ordenar por leito (crescente)
            const bedA = a.bed_number || Infinity;
            const bedB = b.bed_number || Infinity;
            
            if (bedA !== bedB) {
                return bedA - bedB;
            }

            // Se mesmo leito, ordenar por paciente
            const patientA = a.patient_name || '';
            const patientB = b.patient_name || '';
            
            if (patientA !== patientB) {
                return patientA.localeCompare(patientB);
            }

            // Se mesmo paciente, ordenar por data (mais recentes primeiro)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [alerts, searchTerm, selectedDate, selectedStatus]);

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
                    ${selectedDate ? `<p><strong>Filtrado por Data:</strong> ${new Date(selectedDate).toLocaleDateString('pt-BR')}</p>` : ''}
                    ${selectedStatus !== 'todos' ? `<p><strong>Filtrado por Status:</strong> ${selectedStatus.replace('_', ' ')}</p>` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Leito</th>
                            <th>Alerta</th>
                            <th>Responsável</th>
                            <th>Prazo Limite</th>
                            <th>Status</th>
                            <th>Justificativa</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredAlerts.map(alert => `
                            <tr>
                                <td>${alert.patient_name || 'N/A'}</td>
                                <td>${alert.bed_number || 'N/A'}</td>
                                <td>${alert.alertaclinico || 'N/A'}</td>
                                <td>${alert.responsavel || 'N/A'}</td>
                                <td>${alert.prazo_limite_formatado || 'N/A'}</td>
                                <td><span class="status-badge status-${alert.live_status}">${alert.live_status?.replace('_', ' ') || 'N/A'}</span></td>
                                <td>${alert.justificativa || '-'}</td>
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
            showNotification('Por favor, habilite pop-ups para gerar o PDF.', 'error');
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
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Busca */}
                    <input
                        type="text"
                        placeholder="Buscar por nome ou leito..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                    />

                    {/* Data */}
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                    />

                    {/* Status */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                    >
                        <option value="todos">Todos os Status</option>
                        <option value="no_prazo">No Prazo</option>
                        <option value="fora_do_prazo">Fora do Prazo</option>
                        <option value="concluido">Concluídos</option>
                    </select>

                    {/* Botão Gerar PDF */}
                    <button
                        onClick={handleGeneratePDF}
                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        <FileTextIcon className="w-5 h-5" />
                        Gerar PDF
                    </button>
                </div>

                {/* Contador */}
                <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    Mostrando <strong>{filteredAlerts.length}</strong> de <strong>{alerts.length}</strong> alertas
                </div>
            </div>

            {/* Lista de Alertas */}
            <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm text-center">
                        <p className="text-slate-500 dark:text-slate-400">Nenhum alerta encontrado com os filtros aplicados.</p>
                    </div>
                ) : (
                    (() => {
                        let currentBed: number | null = null;
                        let currentPatient: string | null = null;
                        const elements: JSX.Element[] = [];

                        filteredAlerts.forEach((alert, index) => {
                            // Adicionar separador de leito
                            if (currentBed !== alert.bed_number) {
                                elements.push(
                                    <div key={`bed-separator-${alert.bed_number}`} className="mt-6 mb-4 pt-4 border-t-2 border-slate-300 dark:border-slate-700">
                                        <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                            <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                                                Leito {alert.bed_number || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                );
                                currentBed = alert.bed_number;
                                currentPatient = null;
                            }

                            // Adicionar separador de paciente dentro do leito
                            if (currentPatient !== alert.patient_name) {
                                if (currentPatient !== null) {
                                    elements.push(
                                        <div key={`patient-separator-${alert.patient_id}-${index}`} className="my-3 h-px bg-slate-200 dark:bg-slate-700"></div>
                                    );
                                }
                                currentPatient = alert.patient_name;
                            }

                            // Adicionar alerta
                            const statusColors = {
                                no_prazo: 'border-blue-500',
                                fora_do_prazo: 'border-red-500',
                                concluido: 'border-green-500',
                                alerta: 'border-yellow-500'
                            };

                            elements.push(
                                <div key={`${alert.source}-${alert.id_alerta}`} className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border-l-4 ${statusColors[alert.live_status as keyof typeof statusColors] || 'border-slate-500'}`}>
                                    {/* Nome do Paciente e Leito - Header */}
                                    {alert.patient_name && (
                                        <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                <Link to={`/patient/${alert.patient_id}`} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                                                    {alert.patient_name}
                                                </Link>
                                                <span className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300">
                                                    Leito: {alert.bed_number || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Descrição do Alerta */}
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{alert.alertaclinico}</p>

                                    {/* Informações */}
                                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                        <p>Responsável: {alert.responsavel}</p>
                                        <p>Prazo: {alert.prazo_limite_formatado || 'N/A'}</p>
                                    </div>

                                    {/* Justificativa */}
                                    {alert.justificativa && (
                                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs italic text-blue-600 dark:text-blue-400">
                                            <strong>Justificativa:</strong> {alert.justificativa}
                                        </div>
                                    )}
                                </div>
                            );
                        });

                        return elements;
                    })()
                )}
            </div>
        </div>
    );
};
