
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PatientsContext } from '../contexts';
import { useHeader } from '../hooks/useHeader';
import { ChevronRightIcon } from '../components/icons';
import { LoadingIndicator } from '../components/LoadingIndicator';

const PatientListScreen: React.FC = () => {
    useHeader('Leitos');
    const { patients, questions, checklistAnswers } = useContext(PatientsContext)!;
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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

    const calculateProgress = (patientId: number | string) => {
        if (!questions || questions.length === 0) return 0;

        // Get all unique categories from questions
        const categoryIds = Array.from(new Set(questions.map(q => q.categoryId)));
        if (categoryIds.length === 0) return 0;

        const patientAnswers = checklistAnswers[patientId?.toString()] || {};

        let completedCategories = 0;
        categoryIds.forEach(catId => {
            const questionsForCat = questions.filter(q => q.categoryId === catId);
            if (questionsForCat.length === 0) return;

            const allAnswered = questionsForCat.every(q => patientAnswers[q.id] !== undefined);
            if (allAnswered) completedCategories++;
        });

        return (completedCategories / categoryIds.length) * 100;
    };

    return (
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Buscar por nome ou leito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
            />

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
                    const progress = calculateProgress(patient.id);
                    const statusColors = {
                        'estavel': { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
                        'instavel': { border: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' },
                        'em_risco': { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' }
                    };
                    const colors = statusColors[patient.status as keyof typeof statusColors] || { border: 'border-slate-300', bg: 'bg-white dark:bg-slate-900', text: 'text-slate-700 dark:text-slate-300' };
                    const statusLabel = patient.status === 'estavel' ? 'Estável' : patient.status === 'instavel' ? 'Instável' : patient.status === 'em_risco' ? 'Em Risco' : 'Sem Status';

                    return (
                        <Link to={`/patient/${patient.id}`} key={patient.id} className={`block bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition border-2 ${colors.border} ${colors.bg}`}>
                            <div className="flex items-center space-x-4">
                                <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/80 text-blue-600 dark:text-blue-300 rounded-full font-bold text-lg">
                                    {patient.bedNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 wrap-break-word">{patient.name}</p>
                                        {patient.status && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.text} ${colors.bg}`}>
                                                {statusLabel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Nasc: {new Date(patient.dob).toLocaleDateString('pt-BR')}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{Math.round(progress)}%</span>
                                    </div>
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
