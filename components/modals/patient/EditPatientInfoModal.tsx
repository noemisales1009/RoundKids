import React, { useState, useContext } from 'react';
import { PatientsContext } from '../../../contexts';
import { CloseIcon } from '../../icons';

interface EditPatientInfoModalProps {
    patientId: number | string;
    currentMotherName: string;
    currentDiagnosis: string;
    currentWeight?: number;
    onClose: () => void;
}

export const EditPatientInfoModal: React.FC<EditPatientInfoModalProps> = ({ 
    patientId, 
    currentMotherName, 
    currentDiagnosis, 
    currentWeight, 
    onClose 
}) => {
    const { updatePatientDetails } = useContext(PatientsContext)!;
    const [motherName, setMotherName] = useState(currentMotherName);
    const [diagnosis, setDiagnosis] = useState(currentDiagnosis);
    const [weight, setWeight] = useState(currentWeight?.toString() || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updatePatientDetails(patientId, { motherName, ctd: diagnosis, peso: weight ? parseFloat(weight) : undefined });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Editar Informações</h2>
                    <button onClick={onClose}><CloseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Mãe</label>
                        <input
                            type="text"
                            value={motherName}
                            onChange={e => setMotherName(e.target.value)}
                            className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Diagnóstico</label>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Peso (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
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
