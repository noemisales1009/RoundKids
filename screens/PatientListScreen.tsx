
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PatientsContext } from '../contexts';
import { useHeader } from '../hooks/useHeader';
import { ChevronRightIcon, MapPinIcon } from '../components/icons';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { AddPatientModal } from '../components/modals/AddPatientModal';

const PatientListScreen: React.FC = () => {
    useHeader('Leitos');
    const { patients } = useContext(PatientsContext)!;
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Detectar quando os pacientes terminaram de carregar
    useEffect(() => {
        if (patients.length > 0) {
            setIsLoading(false);
        }
    }, [patients]);

    const filteredPatients = useMemo(() => {
        return patients
            .filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.bedNumber.toString().includes(searchTerm)
            )
            .sort((a, b) => a.bedNumber - b.bedNumber);
    }, [patients, searchTerm]);

    return (
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Buscar paciente por nome ou leito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-slate-800 dark:text-slate-200"
            />

            <div className="flex justify-end">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Cadastrar Paciente
                </button>
            </div>

            {showAddModal && <AddPatientModal onClose={() => setShowAddModal(false)} />}

            {/* Indicador de carregamento */}
            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <LoadingIndicator
                        type="spinner"
                        message="Carregando leitos..."
                        size="md"
                    />
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-slate-600 dark:text-slate-400">Nenhum paciente encontrado</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredPatients.map(patient => {
                    const statusColors = {
                        'estavel': { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
                        'instavel': { border: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' },
                        'em_risco': { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' }
                    };
                    const colors = statusColors[patient.status as keyof typeof statusColors] || { border: 'border-slate-300', bg: 'bg-white dark:bg-slate-900', text: 'text-slate-700 dark:text-slate-300' };
                    const statusLabel = patient.status === 'estavel' ? 'Estável' : patient.status === 'instavel' ? 'Instável' : patient.status === 'em_risco' ? 'Em Risco' : 'Sem Status';

                    const precaucoesAtivas = (patient.precautions ?? []).filter(p => !p.isArchived && !p.data_fim);
                    const transferLabels: Record<string, string> = {
                        'Alta': 'Alta',
                        'Transferência Interna': 'Transf. Interna',
                        'Transferência Externa': 'Transf. Externa',
                        'Óbito': 'Óbito',
                    };
                    const transferInfo = patient.localTransferencia ? { label: transferLabels[patient.localTransferencia] ?? patient.localTransferencia } : null;
                    const tipoBadgeConfig: Record<string, { label: string; cls: string }> = {
                        padrao:                     { label: 'Padrão',               cls: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' },
                        contato:                    { label: 'Contato',              cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
                        goticula:                   { label: 'Gotículas',            cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
                        aerossois:                  { label: 'Aerossóis',            cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
                        contato_goticula:           { label: 'Contato + Gotículas',  cls: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
                        contato_aerossois:          { label: 'Contato + Aerossóis',  cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
                        contato_goticula_aerossois: { label: 'C + G + A',            cls: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200' },
                    };

                    return (
                        <Link to={`/patient/${patient.id}`} key={patient.id} className={`block bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition border-2 ${colors.border} ${colors.bg}`}>
                            <div className="flex items-center space-x-4">
                                <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-primary-100 dark:bg-primary-900/80 text-primary-600 dark:text-primary-300 rounded-full font-bold text-lg">
                                    {patient.bedNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 wrap-break-word">{patient.name}</p>
                                        {patient.status && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.text} ${colors.bg}`}>
                                                {statusLabel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Nasc: {new Date(patient.dob).toLocaleDateString('pt-BR')}</p>
                                    {(precaucoesAtivas.length > 0 || transferInfo) && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {precaucoesAtivas.map(p => {
                                                const cfg = tipoBadgeConfig[p.tipo_precaucao];
                                                return (
                                                    <span key={p.id} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg?.cls ?? 'bg-slate-100 text-slate-800'}`}>
                                                        {cfg?.label ?? p.tipo_precaucao}
                                                    </span>
                                                );
                                            })}
                                            {transferInfo && (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
                                                    <MapPinIcon className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                                                    {transferInfo.label}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <ChevronRightIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                            </div>
                        </Link>
                    );
                })}
                </div>
            )}
        </div>
    );
};

export { PatientListScreen };
