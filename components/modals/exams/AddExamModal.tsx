import React, { useState, useContext } from 'react';
import { PatientsContext, NotificationContext, UserContext } from '../../../contexts';
import { CloseIcon } from '../../icons';

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const AddExamModal: React.FC<{ patientId: number | string; onClose: () => void; }> = ({ patientId, onClose }) => {
    const { addExamToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;
    const [name, setName] = useState('');
    const [date, setDate] = useState(getTodayDateString());
    const [observation, setObservation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) return;
        
        if (!user?.id) {
            console.error('⚠️ User não está autenticado!');
            showNotification({ message: 'Erro: Usuário não autenticado', type: 'error' });
            return;
        }
        
        console.log('👤 User ID no AddExamModal:', user.id);
        addExamToPatient(patientId, { name, date, result: 'Pendente', observation }, user.id);
        showNotification({ message: 'Exame cadastrado com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cadastrar Exame</h2>
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observação (Opcional)</label>
                        <textarea value={observation} onChange={e => setObservation(e.target.value)} placeholder="Digite aqui..." className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" rows={3}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Cadastrar</button>
                </form>
            </div>
        </div>
    );
};
