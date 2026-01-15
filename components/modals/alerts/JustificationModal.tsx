import React, { useState } from 'react';
import { CloseIcon } from '../../icons';

export const JustificationModal: React.FC<{ alert: any, onClose: () => void, onSave: (alert: any, justification: string) => void }> = ({ alert, onClose, onSave }) => {
    const [justification, setJustification] = useState(alert.justificativa || '');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Justificar Atraso</h2>
                    <button onClick={onClose}><CloseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Alerta: <strong>{alert.alertaclinico}</strong>
                </p>
                <textarea
                    value={justification}
                    onChange={e => setJustification(e.target.value)}
                    placeholder="Digite a justificativa para o atraso..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200 min-h-24"
                />
                <div className="flex gap-2 mt-4">
                    <button onClick={onClose} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition text-sm sm:text-base">Cancelar</button>
                    <button onClick={() => onSave(alert, justification)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base">Salvar</button>
                </div>
            </div>
        </div>
    );
};
