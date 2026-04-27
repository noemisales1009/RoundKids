import React, { useState, useContext } from 'react';
import { TasksContext, NotificationContext } from '../../../contexts';
import { AlertIcon, CloseIcon, SaveIcon, ChevronDownIcon } from '../../icons';
import { RESPONSIBLES, ALERT_DEADLINES, ALERT_SYSTEMS } from '../../../constants';

export const CreateAlertModal: React.FC<{ patientId: number | string; onClose: () => void; }> = ({ patientId, onClose }) => {
    const { addPatientAlert } = useContext(TasksContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [description, setDescription] = useState('');
    const [responsible, setResponsible] = useState('');
    const [deadline, setDeadline] = useState('');
    const [sistema, setSistema] = useState('');
    const [sistemaOutros, setSistemaOutros] = useState('');

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!description || !responsible || !deadline) return;

        addPatientAlert({
            patientId,
            description,
            responsible,
            timeLabel: deadline,
            sistemas: sistema ? [(sistema === 'Outros' ? sistemaOutros.trim() : sistema)] : [],
        });

        showNotification({ message: 'Alerta criado com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="bg-red-600 p-3 sm:p-4 flex justify-between items-center sticky top-0">
                    <div className="flex items-center gap-2 text-white">
                        <AlertIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        <h2 className="text-base sm:text-lg font-bold">Criar Alerta</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white bg-red-700/50 p-1 rounded-full">
                        <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
                <div className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alerta</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Digite o alerta identificado..."
                                required
                                rows={3}
                                className="w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sistema</label>
                            <div className="relative">
                                <select value={sistema} onChange={e => setSistema(e.target.value)} className="w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200 appearance-none">
                                    <option value="">Selecione...</option>
                                    {ALERT_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-3 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                            {sistema === 'Outros' && (
                                <input
                                    type="text"
                                    value={sistemaOutros}
                                    onChange={(e) => setSistemaOutros(e.target.value)}
                                    placeholder="Especifique o sistema..."
                                    className="mt-2 block w-full border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-800 dark:text-slate-200"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
                            <div className="relative">
                                <select value={responsible} onChange={e => setResponsible(e.target.value)} required className="w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200 appearance-none">
                                    <option value="" disabled>Selecione...</option>
                                    {RESPONSIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-3 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione a hora</label>
                            <div className="relative">
                                <select value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200 appearance-none">
                                    <option value="" disabled>Selecione...</option>
                                    {ALERT_DEADLINES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-3 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition text-base sm:text-lg flex items-center justify-center gap-2 mt-2"
                        >
                            <SaveIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            Salvar Alerta
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
