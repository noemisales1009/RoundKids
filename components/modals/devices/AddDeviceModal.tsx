import React, { useState, useContext } from 'react';
import { PatientsContext, NotificationContext } from '../../../contexts';
import { CloseIcon } from '../../icons';
import { DEVICE_TYPES, DEVICE_LOCATIONS } from '../../../constants';

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const AddDeviceModal: React.FC<{ patientId: number | string; onClose: () => void; }> = ({ patientId, onClose }) => {
    const { addDeviceToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [type, setType] = useState('');
    const [customType, setCustomType] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(getTodayDateString());
    const [observacao, setObservacao] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalType = type === 'Outros' ? customType : type;
        
        console.log('🔍 DEBUG AddDeviceModal:', { patientId, finalType, location, startDate, observacao });
        
        // ✅ VALIDAÇÃO COM FEEDBACK
        if (!finalType) {
            showNotification({ message: 'Selecione ou digite um tipo de dispositivo', type: 'error' });
            return;
        }
        if (!location) {
            showNotification({ message: 'Selecione um local', type: 'error' });
            return;
        }
        if (!startDate) {
            showNotification({ message: 'Selecione a data de inserção', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            console.log('📤 Enviando para addDeviceToPatient...');
            const result = await addDeviceToPatient(patientId, { name: finalType, location, startDate, observacao });
            console.log('✅ Resposta:', result);
            showNotification({ message: 'Dispositivo cadastrado com sucesso!', type: 'success' });
            onClose();
        } catch (error) {
            console.error('❌ Erro completo:', error);
            showNotification({ message: `Erro ao cadastrar: ${error instanceof Error ? error.message : 'Desconhecido'}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cadastrar Dispositivo</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Select...</option>
                            {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            <option value="Outros">Outros</option>
                        </select>
                        {type === 'Outros' && (
                            <input
                                type="text"
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                placeholder="Digite o tipo do dispositivo..."
                                className="mt-2 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                                required
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Local</label>
                        <select value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Select...</option>
                            {DEVICE_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia da inserção</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observação <span className="text-slate-400 font-normal">(opcional)</span></label>
                        <textarea 
                            value={observacao} 
                            onChange={e => setObservacao(e.target.value)} 
                            placeholder="Digite observações sobre o dispositivo..."
                            rows={3}
                            className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-none"
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg transition">
                        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
