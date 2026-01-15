import React, { useState, useContext } from 'react';
import { PatientsContext, NotificationContext } from '../../../contexts';
import { CloseIcon } from '../../icons';
import { MEDICATION_LIST, MEDICATION_DOSAGE_UNITS } from '../../../constants';

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const AddMedicationModal: React.FC<{ patientId: number | string; onClose: () => void; }> = ({ patientId, onClose }) => {
    const { addMedicationToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [selectedMedication, setSelectedMedication] = useState('');
    const [customMedication, setCustomMedication] = useState('');
    const [dosageValue, setDosageValue] = useState('');
    const [dosageUnit, setDosageUnit] = useState(MEDICATION_DOSAGE_UNITS[0]);
    const [startDate, setStartDate] = useState(getTodayDateString());
    const [observacao, setObservacao] = useState('');

    const isOther = selectedMedication === 'Outro';
    const finalMedicationName = isOther ? customMedication : selectedMedication;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!finalMedicationName || !dosageValue || !dosageUnit || !startDate) return;
        const dosage = `${dosageValue} ${dosageUnit}`;
        addMedicationToPatient(patientId, { name: finalMedicationName, dosage, startDate, observacao });
        showNotification({ message: 'Medicação cadastrada com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cadastrar Medicação</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Medicamento</label>
                        <select 
                            value={selectedMedication} 
                            onChange={e => setSelectedMedication(e.target.value)} 
                            className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Selecione um medicamento...</option>
                            {MEDICATION_LIST.map(med => (
                                <option key={med} value={med}>{med}</option>
                            ))}
                        </select>
                    </div>
                    
                    {isOther && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Digite o medicamento</label>
                            <input 
                                type="text" 
                                value={customMedication} 
                                onChange={e => setCustomMedication(e.target.value)} 
                                placeholder="Digite o nome do medicamento..."
                                className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" 
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dosagem</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={dosageValue}
                                onChange={e => setDosageValue(e.target.value)}
                                placeholder="Valor"
                                className="block w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            />
                            <select
                                value={dosageUnit}
                                onChange={e => setDosageUnit(e.target.value)}
                                className="block w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            >
                                {MEDICATION_DOSAGE_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observação <span className="text-slate-400 font-normal">(opcional)</span></label>
                        <textarea 
                            value={observacao} 
                            onChange={e => setObservacao(e.target.value)} 
                            placeholder="Digite observações sobre a medicação..."
                            rows={3}
                            className="block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Cadastrar</button>
                </form>
            </div>
        </div>
    );
};
