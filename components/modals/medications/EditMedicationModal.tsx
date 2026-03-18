import React, { useState, useContext, useMemo, useEffect } from 'react';
import { PatientsContext, NotificationContext, UserContext } from '../../../contexts';
import { Medication } from '../../../types';
import { CloseIcon } from '../../icons';
import { supabase } from '../../../supabaseClient';

interface Medicamento {
    id: number;
    categoria: string;
    nome: string;
    unidade_dose_principal: string | null;
}

export const EditMedicationModal: React.FC<{ medication: Medication; patientId: number | string; onClose: () => void; }> = ({ medication, patientId, onClose }) => {
    const { updateMedicationInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;
    
    // State para categorias e medicamentos do DB
    const [categorias, setCategorias] = useState<string[]>([]);
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State para o formulário
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [selectedMedicamento, setSelectedMedicamento] = useState('');
    const [dosageValue, setDosageValue] = useState('');
    const [startDate, setStartDate] = useState(medication.startDate);
    const [observacao, setObservacao] = useState(medication.observacao || '');

    // Carregar categorias ao montar
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const { data, error } = await supabase
                    .from('medicamentos')
                    .select('categoria, ordem_exibicao', { count: 'exact' })
                    .order('ordem_exibicao', { ascending: true });
                
                if (error) throw error;
                
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
                
                categoriasUnicas.sort((a, b) => a.ordem - b.ordem);
                setCategorias(categoriasUnicas.map(c => c.categoria));
                setLoading(false);
            } catch (err) {
                console.error('Erro ao buscar categorias:', err);
                setLoading(false);
            }
        };
        
        fetchCategorias();
    }, []);

    // Pré-carregar medicamento atual
    const [currentMedData, setCurrentMedData] = useState<any>(null);
    
    useEffect(() => {
        const loadCurrentMed = async () => {
            try {
                // Encontrar qual medicamento é o atual
                const { data, error } = await supabase
                    .from('medicamentos')
                    .select('*')
                    .ilike('nome', `%${medication.name}%`)
                    .limit(1);
                
                if (data && data.length > 0) {
                    const med = data[0];
                    setCurrentMedData(med);
                    setSelectedCategoria(med.categoria);
                    setSelectedMedicamento(med.id.toString());
                    
                    // Parse dosageValue from medication.dosage
                    if (medication.dosage) {
                        const value = medication.dosage.split(' ')[0];
                        setDosageValue(value);
                    }
                } else {
                    // Medicamento customizado
                    setSelectedMedicamento('outro');
                }
            } catch (err) {
                console.error('Erro ao carregar medicamento atual:', err);
            }
        };
        
        if (categorias.length > 0) {
            loadCurrentMed();
        }
    }, [categorias]);

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
            } catch (err) {
                console.error('Erro ao buscar medicamentos:', err);
            }
        };
        
        fetchMedicamentos();
    }, [selectedCategoria]);

    // Dados do medicamento selecionado
    const selectedMedData = medicamentos.find(m => m.id.toString() === selectedMedicamento);
    const temUnidadeDose = selectedMedData?.unidade_dose_principal !== null;
    const unidadeFinal = selectedMedData?.unidade_dose_principal;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalMedicationName = selectedMedData?.nome || medication.name;
        
        if (!finalMedicationName) {
            showNotification({ message: 'Selecione um medicamento', type: 'error' });
            return;
        }

        if (!startDate) {
            showNotification({ message: 'Selecione uma data de início', type: 'error' });
            return;
        }

        let dosageFormatted = '';
        if (temUnidadeDose) {
            if (!dosageValue) {
                showNotification({ message: 'Preencha a dosagem', type: 'error' });
                return;
            }
            dosageFormatted = `${dosageValue} ${unidadeFinal}`;
        } else {
            dosageFormatted = finalMedicationName;
        }
        
        updateMedicationInPatient(patientId, { 
            ...medication, 
            name: finalMedicationName, 
            dosage: dosageFormatted, 
            startDate, 
            observacao 
        });
        showNotification({ message: 'Medicação atualizada com sucesso!', type: 'success' });
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
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Medicação</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Categoria */}
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

                    {/* Medicamento */}
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
                            </select>
                        </div>
                    )}

                    {/* Dosagem (apenas se medicamento tem unidade) */}
                    {selectedMedicamento && temUnidadeDose && (
                        <div>
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
                    {selectedMedicamento && !temUnidadeDose && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                ℹ️ <strong>{selectedMedData?.nome}</strong> não requer dosagem com unidade (ex: spray, solução)
                            </p>
                        </div>
                    )}

                    {/* Data de Início */}
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

                    {/* Observação */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Observação <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
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
                        Salvar Alterações
                    </button>
                </form>
            </div>
        </div>
    );
};
