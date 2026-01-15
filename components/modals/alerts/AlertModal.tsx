import React, { useState, useContext } from 'react';
import { TasksContext, NotificationContext, PatientsContext } from '../../../contexts';
import { Question } from '../../../types';
import { AlertIcon, CloseIcon, SaveIcon, ChevronDownIcon, CheckSquareIcon, SquareIcon } from '../../icons';
import { RESPONSIBLES, ALERT_DEADLINES } from '../../../constants';

export const AlertModal: React.FC<{ question: Question, onClose: () => void, patientId: string }> = ({ question, onClose, patientId }) => {
    const { addTask } = useContext(TasksContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const { patients, categories } = useContext(PatientsContext)!;

    const patient = patients.find(p => p.id.toString() === patientId);
    const category = categories.find(c => c.id === question.categoryId);

    const [formData, setFormData] = useState<Record<string, { selected: boolean, value: string }>>({});
    const [responsible, setResponsible] = useState('');
    const [time, setTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Lógica do Checkbox
    const handleCheckbox = (id: string, checked: boolean) => {
        setFormData(prev => {
            const copy = { ...prev };
            if (checked) copy[id] = { selected: true, value: '' };
            else delete copy[id];
            return copy;
        });
    };

    // Lógica do Texto dentro do Checkbox
    const handleInput = (id: string, text: string) => {
        setFormData(prev => ({ ...prev, [id]: { ...prev[id], value: text } }));
    };

    const handleSave = async () => {
        if (!responsible || !time) return alert('Por favor, selecione Responsável e Hora!');

        setIsLoading(true);

        // Montar o texto descritivo
        let descriptionText = `ALERTA: ${question.text}\n`;
        // descriptionText += `HORÁRIO: ${time}\n`; // Now stored in timeLabel
        // descriptionText += `RESPONSÁVEL: ${responsible}\n--------------------------\n`; // Stored in separate fields

        let hasData = false;
        question.alertOptions?.forEach(opt => {
            const data = formData[opt.id];
            if (data && data.selected) {
                const detail = opt.hasInput && data.value ? `: ${data.value}` : '';
                descriptionText += `- ${opt.label}${detail}\n`;
                hasData = true;
            }
        });

        if (!hasData) {
            setIsLoading(false);
            return alert('Selecione pelo menos uma opção.');
        }

        // Calculate deadline
        const deadlineHours = parseInt(time.split(' ')[0]);
        const deadlineDate = new Date(Date.now() + deadlineHours * 60 * 60 * 1000).toISOString();

        addTask({
            patientId: patientId,
            categoryId: question.categoryId,
            description: descriptionText,
            responsible: responsible,
            deadline: deadlineDate,
            patientName: patient?.name,
            categoryName: category?.name,
            timeLabel: time,
            options: formData
        });

        showNotification({ message: 'Alerta criado com sucesso!', type: 'success' });

        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-800 dark:bg-slate-900 rounded-xl w-full max-w-md shadow-2xl border border-blue-500/30 flex flex-col max-h-[95vh]">

                {/* Cabeçalho */}
                <div className="bg-blue-600 p-4 rounded-t-xl flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <AlertIcon className="text-white w-6 h-6" />
                        <h2 className="text-white font-bold text-lg">Alerta / Intervenção</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white bg-blue-700/50 p-1.5 rounded-full hover:bg-blue-700 transition">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Conteúdo com Scroll */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                    <div className="border-b border-gray-700 pb-2">
                        <h3 className="text-blue-300 font-bold text-sm uppercase tracking-wide">
                            {question.text}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">Selecione as intercorrências:</p>
                    </div>

                    <div className="space-y-3">
                        {question.alertOptions?.map(opt => {
                            const isChecked = !!formData[opt.id];
                            return (
                                <div key={opt.id} className="flex flex-col gap-2">
                                    <div
                                        onClick={() => handleCheckbox(opt.id, !isChecked)}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${isChecked ? 'bg-blue-900/20 border-blue-500/30' : 'bg-slate-900 border-gray-700 hover:border-gray-500'}`}
                                    >
                                        <div className={isChecked ? 'text-blue-400' : 'text-gray-500'}>
                                            {isChecked ? <CheckSquareIcon className="w-5 h-5" /> : <SquareIcon className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-sm ${isChecked ? 'text-white font-medium' : 'text-gray-300'}`}>{opt.label}</span>
                                    </div>
                                    {isChecked && opt.hasInput && (
                                        <div className="ml-9 animate-in slide-in-from-top-2 duration-200">
                                            <input
                                                type="text"
                                                placeholder={opt.inputPlaceholder}
                                                value={formData[opt.id]?.value || ''}
                                                onChange={(e) => handleInput(opt.id, e.target.value)}
                                                className="w-full bg-slate-900 border border-blue-500/50 rounded p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-4 border-t border-gray-700 space-y-4 bg-slate-800 dark:bg-slate-900">
                        {/* Responsável */}
                        <div>
                            <label className="text-white font-semibold text-sm mb-1 block">Responsável</label>
                            <div className="relative">
                                <select value={responsible} onChange={(e) => setResponsible(e.target.value)} className="w-full bg-slate-700 border border-gray-600 text-white text-sm rounded-lg p-3 appearance-none focus:outline-none">
                                    <option value="">Selecione...</option>
                                    {RESPONSIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-3.5 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>
                        {/* Hora */}
                        <div>
                            <label className="text-white font-semibold text-sm mb-1 block">Selecione a hora</label>
                            <div className="relative">
                                <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-700 border border-gray-600 text-white text-sm rounded-lg p-3 appearance-none focus:outline-none">
                                    <option value="">Selecione...</option>
                                    {ALERT_DEADLINES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-3.5 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>

                        <button onClick={handleSave} disabled={isLoading} className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg transition">
                            {isLoading ? 'Salvando...' : <><SaveIcon className="w-5 h-5" /> Criar Alerta</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
