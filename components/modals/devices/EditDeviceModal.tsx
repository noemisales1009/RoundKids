import React, { useState, useContext } from 'react';
import { PatientsContext, NotificationContext } from '../../../contexts';
import { Device } from '../../../types';
import { CloseIcon, ChevronDownIcon } from '../../icons';
import { DEVICE_TYPES, DEVICE_LOCATIONS, ALERT_SYSTEMS } from '../../../constants';

export const EditDeviceModal: React.FC<{ device: Device; patientId: number | string; onClose: () => void; }> = ({ device, patientId, onClose }) => {
    const { updateDeviceInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [type, setType] = useState(device.name);
    const [customType, setCustomType] = useState('');
    const [location, setLocation] = useState(device.location);
    const [startDate, setStartDate] = useState(device.startDate);
    const [observacao, setObservacao] = useState((device as any).observacao || '');
    const [sistema, setSistema] = useState(
        device.sistema && !ALERT_SYSTEMS.includes(device.sistema) ? 'Outros' : (device.sistema || '')
    );
    const [sistemaOutros, setSistemaOutros] = useState(
        device.sistema && !ALERT_SYSTEMS.includes(device.sistema) ? device.sistema : ''
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalType = type === 'Outros' ? customType : type;
        
        if (!finalType || !location || !startDate) return;
        updateDeviceInPatient(patientId, { ...device, name: finalType, location, startDate, observacao, sistema: (sistema === 'Outros' ? sistemaOutros.trim() : sistema) || undefined });
        showNotification({ message: 'Dispositivo atualizado com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Dispositivo</h2>
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Sistema <span className="text-slate-400 font-normal">(opcional)</span></label>
                        <div className="relative mt-1">
                            <select value={sistema} onChange={e => setSistema(e.target.value)} className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200 appearance-none">
                                <option value="">Selecione...</option>
                                {ALERT_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-3 text-gray-400 pointer-events-none w-4 h-4" />
                        </div>
                        {sistema === 'Outros' && (
                            <input
                                type="text"
                                value={sistemaOutros}
                                onChange={e => setSistemaOutros(e.target.value)}
                                placeholder="Especifique o sistema..."
                                className="mt-2 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            />
                        )}
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
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};
