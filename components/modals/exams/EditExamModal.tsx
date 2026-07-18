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
    const [sistema, setSistema] = useState(
        exam.sistema && !ALERT_SYSTEMS.includes(exam.sistema) ? 'Outros' : (exam.sistema || '')
    );
    const [sistemaOutros, setSistemaOutros] = useState(
        exam.sistema && !ALERT_SYSTEMS.includes(exam.sistema) ? exam.sistema : ''
    );
    // mesma regra da lista (isExamNaEvolucao): true = fixado, NULL = só dentro das 48h
    const _cutoff48h = new Date(Date.now() - 3 * 60 * 60 * 1000 - 48 * 60 * 60 * 1000).toISOString().split('T')[0];
    const exibidoInicial = exam.mostrar_evolucao === true || (exam.mostrar_evolucao !== false && exam.date >= _cutoff48h);
    const [exibir, setExibir] = useState(exibidoInicial);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) return;
        updateExamInPatient(patientId, {
            ...exam,
            name,
            date,
            sistema: (sistema === 'Outros' ? sistemaOutros.trim() : sistema) || undefined,
            // só sobrescreve se o usuário mexeu no checkbox; senão preserva o valor do banco (NULL continua NULL)
            mostrar_evolucao: exibir !== exibidoInicial ? exibir : exam.mostrar_evolucao,
        });
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
                        <input type="text" placeholder="Ex: Hemograma" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Sistema <span className="text-slate-400 font-normal">(opcional)</span></label>
                        <div className="relative mt-1">
                            <select value={sistema} onChange={e => setSistema(e.target.value)} className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-slate-200 appearance-none">
                                <option value="">Selecione...</option>
                                {ALERT_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-3 text-slate-400 pointer-events-none w-4 h-4" />
                        </div>
                        {sistema === 'Outros' && (
                            <input type="text" value={sistemaOutros} onChange={e => setSistemaOutros(e.target.value)} placeholder="Especifique o sistema..." className="mt-2 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-slate-200" />
                        )}
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none w-fit">
                            <input type="checkbox" checked={exibir} onChange={e => setExibir(e.target.checked)} className="w-3.5 h-3.5 accent-primary-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Deixar este exame fixo permanentemente na Evolução Diária</span>
                        </label>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Marcado: o exame fica sempre visível na evolução. Desmarcado: ele é removido da evolução.</p>
                    </div>
                    <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};
