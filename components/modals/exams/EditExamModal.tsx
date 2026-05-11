import React, { useState, useContext } from 'react';
import { PatientsContext, NotificationContext } from '../../../contexts';
import { Exam } from '../../../types';
import { CloseIcon, ChevronDownIcon } from '../../icons';
import { ALERT_SYSTEMS } from '../../../constants';

export const EditExamModal: React.FC<{ exam: Exam; patientId: number | string; onClose: () => void; }> = ({ exam, patientId, onClose }) => {
    const { updateExamInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;

    const [name, setName] = useState(exam.name);
    const [date, setDate] = useState(exam.date);
    const [observation, setObservation] = useState(exam.observation || '');
    const [sistema, setSistema] = useState(
        exam.sistema && !ALERT_SYSTEMS.includes(exam.sistema) ? 'Outros' : (exam.sistema || '')
    );
    const [sistemaOutros, setSistemaOutros] = useState(
        exam.sistema && !ALERT_SYSTEMS.includes(exam.sistema) ? exam.sistema : ''
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) return;
        updateExamInPatient(patientId, { ...exam, name, date, observation, sistema: (sistema === 'Outros' ? sistemaOutros.trim() : sistema) || undefined });
        showNotification({ message: 'Exame atualizado com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Exame</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Exame</label>
                        <input type="text" placeholder="Ex: Hemograma" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Sistema <span className="text-slate-400 font-normal">(opcional)</span></label>
                        <div className="relative mt-1">
                            <select value={sistema} onChange={e => setSistema(e.target.value)} className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200 appearance-none">
                                <option value="">Selecione...</option>
                                {ALERT_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-3 text-gray-400 pointer-events-none w-4 h-4" />
                        </div>
                        {sistema === 'Outros' && (
                            <input type="text" value={sistemaOutros} onChange={e => setSistemaOutros(e.target.value)} placeholder="Especifique o sistema..." className="mt-2 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observação (Opcional)</label>
                        <textarea value={observation} onChange={e => setObservation(e.target.value)} placeholder="Digite aqui..." className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" rows={3}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};
