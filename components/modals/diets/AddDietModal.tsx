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

export const AddDietModal: React.FC<{ patientId: number | string; onClose: () => void }> = ({ patientId, onClose }) => {
    const { addDietToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;  // 🟢 Capturar usuário autenticado
    const [type, setType] = useState('');
    const [dataInicio, setDataInicio] = useState(getTodayDateString());
    const [volume, setVolume] = useState('');
    const [vet, setVet] = useState('');
    const [vetPleno, setVetPleno] = useState('');
    const [pt, setPt] = useState('');
    const [ptGDia, setPtGDia] = useState('');
    const [th, setTh] = useState('');
    const [observacao, setObservacao] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !dataInicio) return;
        
        // vet_at e pt_at são calculados automaticamente pelo banco (GENERATED ALWAYS AS)
        addDietToPatient(patientId, {
            type,
            data_inicio: dataInicio,
            volume: volume || undefined,
            vet: vet || undefined,
            vet_pleno: vetPleno || undefined,
            pt: pt || undefined,
            pt_g_dia: ptGDia || undefined,
            th: th || undefined,
            observacao: observacao || undefined
        }, user?.id);  // 🟢 Passar o ID do usuário autenticado
        showNotification({ message: 'Dieta cadastrada com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900">
                    <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200">Cadastrar Dieta</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
                <div className="p-4 sm:p-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Informações Básicas */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Dieta</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                                required
                            >
                                <option value="">Selecione o tipo...</option>
                                <option value="Oral">Oral</option>
                                <option value="Enteral">Enteral</option>
                                <option value="Parenteral">Parenteral</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
                            <input
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                                required
                            />
                        </div>

                        {/* Divisor Visual */}
                        <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                        {/* Parâmetros Nutricionais */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Volume (ml) <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                            <input
                                type="text"
                                value={volume}
                                onChange={(e) => setVolume(e.target.value)}
                                placeholder="Ex: 1000"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">VET [kcal/dia] <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                            <input
                                type="text"
                                value={vet}
                                onChange={(e) => setVet(e.target.value)}
                                placeholder="Ex: 1800"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">VET Pleno [kcal/dia] <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                            <input
                                type="text"
                                value={vetPleno}
                                onChange={(e) => setVetPleno(e.target.value)}
                                placeholder="Ex: 2000"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PT [g/dia] <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                            <input
                                type="text"
                                value={pt}
                                onChange={(e) => setPt(e.target.value)}
                                placeholder="Ex: 60"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PT Plena (g/dia) <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                            <input
                                type="text"
                                value={ptGDia}
                                onChange={(e) => setPtGDia(e.target.value)}
                                placeholder="Ex: 65"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">TH [ml/m²/dia] <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                            <input
                                type="text"
                                value={th}
                                onChange={(e) => setTh(e.target.value)}
                                placeholder="Ex: 220"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            />
                        </div>

                        {/* Divisor Visual */}
                        <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                        {/* Observações */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observação <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                            <textarea
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                placeholder="Adicione observações sobre a dieta..."
                                rows={2}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        {/* Card de Cálculo */}
                        {((vet && vetPleno) || (pt && ptGDia)) && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <h4 className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">📊 Cálculos Automáticos</h4>
                                <div className="space-y-2">
                                    {vet && vetPleno && (
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">VET AT:</span>
                                                <span className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-200">
                                                    {((parseFloat(vet) * 100) / parseFloat(vetPleno)).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400 text-right">
                                                {vet} kcal/dia de {vetPleno} kcal/dia
                                            </div>
                                        </div>
                                    )}
                                    {pt && ptGDia && (
                                        <div className="space-y-0.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">PT AT:</span>
                                                <span className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-200">
                                                    {((parseFloat(pt) * 100) / parseFloat(ptGDia)).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400 text-right">
                                                {pt} g/dia de {ptGDia} g/dia
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 rounded-lg transition mt-2 text-sm sm:text-base"
                        >
                            Cadastrar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
