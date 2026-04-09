import React, { useState, useContext, useEffect } from 'react';
import { PatientsContext, NotificationContext, UserContext } from '../../../contexts';
import { CloseIcon } from '../../icons';
import { supabase } from '../../../supabaseClient';

interface Medicamento {
    id: number;
    categoria: string;
    nome: string;
    unidade_dose_principal: string | null;
}

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
    const { user } = useContext(UserContext)!;
    
    
    // State
    const [categorias, setCategorias] = useState<string[]>([]);
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [selectedMedicamento, setSelectedMedicamento] = useState('');
    const [customMedicamento, setCustomMedicamento] = useState('');
    const [customUnidade, setCustomUnidade] = useState('');
    
    const [dosageValue, setDosageValue] = useState('');
    const [startDate, setStartDate] = useState(getTodayDateString());
    const [observacao, setObservacao] = useState('');
    const [loading, setLoading] = useState(true);

    // Buscar categorias ao montar
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const { data, error } = await supabase
                    .from('medicamentos')
                    .select('categoria, ordem_exibicao', { count: 'exact' })
                    .order('ordem_exibicao', { ascending: true });
                
                if (error) throw error;
                
                // Remover duplicatas mantendo a ordem
                const categoriasUnicas: Array<{categoria: string; ordem: number}> = [];
                const seen = new Set<string>();
                
                (data || []).forEach((d: any) => {
                    if (!seen.has(d.categoria)) {
                        seen.add(d.categoria);
                        categoriasUnicas.push({
                            categoria: d.categoria,
                            ordem: d.ordem_exibicao || 999
                        });
                    }
                });
                
                // Ordenar por ordem_exibicao
                categoriasUnicas.sort((a, b) => a.ordem - b.ordem);
                setCategorias(categoriasUnicas.map(c => c.categoria));
                
            } catch (err) {
                console.error('Erro ao buscar categorias:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCategorias();
    }, []);

    // Buscar medicamentos quando categoria muda
    useEffect(() => {
        const fetchMedicamentos = async () => {
            if (!selectedCategoria) {
                setMedicamentos([]);
                setSelectedMedicamento('');
                return;
            }
            
            try {
                const { data, error } = await supabase
                    .from('medicamentos')
                    .select('*')
                    .eq('categoria', selectedCategoria)
                    .order('nome', { ascending: true });
                
                if (error) throw error;
                setMedicamentos(data || []);
                setSelectedMedicamento('');
            } catch (err) {
                console.error('Erro ao buscar medicamentos:', err);
            }
        };
        
        fetchMedicamentos();
    }, [selectedCategoria]);

    // Obter informações do medicamento selecionado
    const selectedMedData = medicamentos.find(m => m.id.toString() === selectedMedicamento);
    const isOther = selectedMedicamento === 'outro';
    const temUnidadeDose = selectedMedData?.unidade_dose_principal !== null || (isOther && customUnidade);
    const unidadeFinal = isOther ? customUnidade : selectedMedData?.unidade_dose_principal;
    
    // Nome final do medicamento
    const finalMedicationName = isOther ? customMedicamento : selectedMedData?.nome || '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!finalMedicationName) {
            showNotification({ message: 'Selecione ou digite um medicamento', type: 'error' });
            return;
        }

        if (temUnidadeDose && !dosageValue) {
            showNotification({ message: 'Preencha a dosagem', type: 'error' });
            return;
        }

        if (!startDate) {
            showNotification({ message: 'Selecione uma data de início', type: 'error' });
            return;
        }
        
        if (!user?.id) {
            console.error('⚠️ User não está autenticado!');
            showNotification({ message: 'Erro: Usuário não autenticado', type: 'error' });
            return;
        }
        
        // ✅ LÓGICA CORRIGIDA:
        // Se tem unidade: salva valor + unidade
        // Se NÃO tem unidade: salva nome do medicamento em dosageValue, unidade = null
        let dosageValueFinal = dosageValue;
        let unidade = null;
        
        if (temUnidadeDose) {
            // Com unidade: usar o valor digitado
            unidade = unidadeFinal;
        } else {
            // Sem unidade: salvar o nome do medicamento
            dosageValueFinal = finalMedicationName;
        }

        
        addMedicationToPatient(
            patientId, 
            { 
                name: finalMedicationName, 
                dosageValue: dosageValueFinal,
                unidade: unidade,
                startDate, 
                observacao 
            }, 
            user.id
        );
        
        showNotification({ message: 'Medicação cadastrada com sucesso!', type: 'success' });
        onClose();
    };


    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                    <p className="text-slate-600 dark:text-slate-300">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cadastrar Medicação</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campo 1: Categoria */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Categoria <span className="text-red-500">*</span>
                        </label>
                        <select 
                            value={selectedCategoria}
                            onChange={e => setSelectedCategoria(e.target.value)}
                            className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Selecione uma categoria...</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Campo 2: Medicamento */}
                    {selectedCategoria && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Medicamento <span className="text-red-500">*</span>
                            </label>
                            <select 
                                value={selectedMedicamento}
                                onChange={e => setSelectedMedicamento(e.target.value)}
                                className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            >
                                <option value="">Selecione um medicamento...</option>
                                {medicamentos.map(med => (
                                    <option key={med.id} value={med.id.toString()}>
                                        {med.nome}
                                        {med.unidade_dose_principal ? ` (${med.unidade_dose_principal})` : ' (sem unidade)'}
                                    </option>
                                ))}
                                <option value="outro">Outro (digitar medicamento)</option>
                            </select>
                        </div>
                    )}

                    {/* Campo 3: Digitar medicamento customizado */}
                    {isOther && (
                        <>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    ⚡ Medicamento Customizado - Preencha o nome e opcionalmente a unidade
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nome da Medicação <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={customMedicamento}
                                    onChange={e => setCustomMedicamento(e.target.value)}
                                    placeholder="Ex: Epinefrina, Salbutamol spray..."
                                    className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Unidade de Dosagem <span className="text-gray-400 font-normal">(opcional)</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={customUnidade}
                                    onChange={e => setCustomUnidade(e.target.value)}
                                    placeholder="Ex: mg/kg/dia, ug/h, UI/ml..."
                                    className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    💡 Se deixar em branco, a medicação será salva sem unidade padronizada
                                </p>
                            </div>
                        </>
                    )}

                    {/* Campo 4: Dosagem (apenas se medicamento tem unidade) */}
                    {selectedMedicamento && temUnidadeDose && (
                        <div>
                            {isOther && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 mb-3">
                                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                        ⚠️ Você preencheu uma unidade, então precisa digitar a dosagem
                                    </p>
                                </div>
                            )}
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Dosagem <span className="text-red-500">*</span>
                                <span className="text-slate-400 font-normal"> ({unidadeFinal})</span>
                            </label>
                            <input
                                type="text"
                                value={dosageValue}
                                onChange={e => setDosageValue(e.target.value)}
                                placeholder="Ex: 10, 5.5, 0.1"
                                className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                ℹ️ Digite apenas o valor numérico. A unidade será "{unidadeFinal}"
                            </p>
                        </div>
                    )}

                    {/* Mensagem: Medicação sem unidade */}
                    {selectedMedicamento && !temUnidadeDose && !isOther && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                ℹ️ <strong>{selectedMedData?.nome}</strong> não requer dosagem com unidade (ex: spray, solução)
                            </p>
                        </div>
                    )}

                    {/* Campo 5: Data de Início */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Data de Início <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                            className="block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" 
                        />
                    </div>

                    {/* Campo 6: Observação */}
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

                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
};
