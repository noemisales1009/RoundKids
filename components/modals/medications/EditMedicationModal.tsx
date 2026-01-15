import React, { useState, useContext, useMemo } from 'react';
import { PatientsContext, NotificationContext } from '../../../contexts';
import { Medication } from '../../../types';
import { CloseIcon } from '../../icons';
import { MEDICATION_LIST, MEDICATION_DOSAGE_UNITS } from '../../../constants';

export const EditMedicationModal: React.FC<{ medication: Medication; patientId: number | string; onClose: () => void; }> = ({ medication, patientId, onClose }) => {
    const { updateMedicationInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    
    // Check if medication is in the list or is custom
    const isInList = MEDICATION_LIST.includes(medication.name);
    const [selectedMedication, setSelectedMedication] = useState(isInList ? medication.name : 'Outro');
    const [customMedication, setCustomMedication] = useState(isInList ? '' : medication.name);
    const [startDate, setStartDate] = useState(medication.startDate);
    const [endDate, setEndDate] = useState(medication.endDate || '');

    const [initialValue, initialUnit] = useMemo(() => {
        const dosageString = medication.dosage || '';
        const foundUnit = MEDICATION_DOSAGE_UNITS.find(u => dosageString.endsWith(u));
        if (foundUnit) {
            const value = dosageString.substring(0, dosageString.length - foundUnit.length).trim();
            return [value, foundUnit];
        }
        return [dosageString, '']; // Fallback for old format
    }, [medication.dosage]);

    const [dosageValue, setDosageValue] = useState(initialValue);
    const [dosageUnit, setDosageUnit] = useState(initialUnit);

    const isOther = selectedMedication === 'Outro';
    const finalMedicationName = isOther ? customMedication : selectedMedication;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!finalMedicationName || !dosageValue || !dosageUnit || !startDate) return;
        const dosage = `${dosageValue} ${dosageUnit}`;
        updateMedicationInPatient(patientId, { ...medication, name: finalMedicationName, dosage, startDate, endDate: endDate || undefined });
        showNotification({ message: 'Medicação atualizada com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Medicação</h2>
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
                                <option value="" disabled>Selecione unidade...</option>
                                {MEDICATION_DOSAGE_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Fim <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};
