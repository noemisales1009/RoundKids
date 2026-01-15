import React, { useState, useContext } from 'react';
import { PatientsContext, NotificationContext } from '../../../contexts';

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const AddDietRemovalDateModal: React.FC<{ dietId: number | string, patientId: number | string, onClose: () => void }> = ({ dietId, patientId, onClose }) => {
    const { updateDietInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const { patients } = useContext(PatientsContext)!;
    const patient = patients.find(p => p.id === patientId);
    const diet = patient?.diets.find(d => d.id === dietId);
    const [removalDate, setRemovalDate] = useState(getTodayDateString());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!diet) return;
        updateDietInPatient(patientId, {
            ...diet,
            data_remocao: removalDate
        });
        showNotification({ message: 'Data de retirada registrada com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Registrar Data de Retirada da Dieta</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data da Retirada</label>
                        <input type="date" value={removalDate} onChange={e => setRemovalDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
