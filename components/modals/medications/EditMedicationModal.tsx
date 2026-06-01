import React, { useState, useContext, useEffect, useRef } from 'react';
import { PatientsContext, NotificationContext } from '../../../contexts';
import { Medication } from '../../../types';
import { CloseIcon, ChevronDownIcon } from '../../icons';
import { supabase } from '../../../supabaseClient';
import { ALERT_SYSTEMS } from '../../../constants';

interface Medicamento {
    id: number;
    categoria: string;
    nome: string;
    unidade_dose_principal: string | null;
}

interface DiagnosticoAtivo {
    id: number;
    label: string;
    created_at: string;
    data_inicio?: string | null;
    sistema?: string;
}

export const EditMedicationModal: React.FC<{ medication: Medication; patientId: number | string; onClose: () => void; }> = ({ medication, patientId, onClose }) => {
    const { updateMedicationInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    // State para categorias e medicamentos do DB
    const [categorias, setCategorias] = useState<string[]>([]);
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [loading, setLoading] = useState(true);
    const didInitMed = useRef(false);

    // State para o formulário
    const [selectedCategoria, setSelectedCategoria] = useState(medication.categoria || '');
    const [selectedMedicamento, setSelectedMedicamento] = useState('');
    const [customMedicamento, setCustomMedicamento] = useState('');
    const [customUnidade, setCustomUnidade] = useState('');
    const [dosageValue, setDosageValue] = useState('');
    const [startDate, setStartDate] = useState(medication.startDate);
    const [sistema, setSistema] = useState(
        medication.sistema && !ALERT_SYSTEMS.includes(medication.sistema) ? 'Outros' : (medication.sistema || '')
    );
    const [sistemaOutros, setSistemaOutros] = useState(
        medication.sistema && !ALERT_SYSTEMS.includes(medication.sistema) ? medication.sistema : ''
    );
    const [diagnosticosAtivos, setDiagnosticosAtivos] = useState<DiagnosticoAtivo[]>([]);
    const [selectedDiagnosticoId, setSelectedDiagnosticoId] = useState<number | ''>(medication.diagnosticoId ?? '');

    // Buscar diagnósticos ativos do paciente
    useEffect(() => {
        const fetchDiagnosticos = async () => {
            const { data: diagData, error } = await supabase
                .from('paciente_diagnosticos')
                .select('id, opcao_id, opcao_label, texto_digitado, created_at, data_inicio, sistema')
                .eq('patient_id', patientId)
                .eq('arquivado', false)
                .eq('status', 'nao_resolvido');

            if (error || !diagData || diagData.length === 0) return;

            const opcaoIds = diagData.map((d: any) => d.opcao_id);
            const { data: optData } = await supabase
                .from('pergunta_opcoes_diagnostico')
                .select('id, parent_id, label')
                .in('id', opcaoIds);

            if (!optData) return;

            const parentIds = optData.filter((o: any) => o.parent_id !== null).map((o: any) => o.parent_id);
            let parentMap = new Map<number, string>();
            if (parentIds.length > 0) {
                const { data: parentData } = await supabase
                    .from('pergunta_opcoes_diagnostico')
                    .select('id, label')
                    .in('id', parentIds);
                (parentData || []).forEach((p: any) => parentMap.set(p.id, p.label));
            }

            const optMap = new Map((optData as any[]).map((o: any) => [o.id, o]));

            const paiComFilho = new Set<number>();
            diagData.forEach((d: any) => {
                const opt = optMap.get(d.opcao_id) as any;
                if (opt?.parent_id !== null && opt?.parent_id !== undefined) {
                    paiComFilho.add(opt.parent_id);
                }
            });

            const byOpcaoId = new Map<number, DiagnosticoAtivo>();

            for (const d of diagData as any[]) {
                const opt = optMap.get(d.opcao_id) as any;

                let label: string;
                if (!opt) {
                    // Fallback: usa labels já salvos no registro
                    label = d.texto_digitado
                        ? (d.opcao_label === 'Outros' ? d.texto_digitado : `${d.opcao_label || ''} ${d.texto_digitado}`.trim())
                        : (d.opcao_label || 'Diagnóstico');
                } else if (opt.parent_id !== null && opt.parent_id !== undefined) {
                    const labelPai = parentMap.get(opt.parent_id) || '';
                    const textoPart = d.texto_digitado ? `: ${d.texto_digitado}` : '';
                    label = `${labelPai} ${opt.label}${textoPart}`.trim();
                } else {
                    if (paiComFilho.has(opt.id)) continue;
                    label = d.texto_digitado
                        ? (d.opcao_label === 'Outros' ? d.texto_digitado : `${d.opcao_label} ${d.texto_digitado}`.trim())
                        : d.opcao_label;
                }

                // Mantém a linha mais recente (maior id) por opcao_id
                const existing = byOpcaoId.get(d.opcao_id);
                if (!existing || d.id > existing.id) {
                    byOpcaoId.set(d.opcao_id, { id: d.id, label, created_at: d.created_at, data_inicio: d.data_inicio || null, sistema: d.sistema || undefined });
                }
            }

            setDiagnosticosAtivos(Array.from(byOpcaoId.values()));
        };
        fetchDiagnosticos();
    }, [patientId]);

    // Quando a lista carregar, sincroniza selectedDiagnosticoId com o id mais recente
    // (a medicação pode ter sido salva com um id antigo do mesmo diagnóstico)
    useEffect(() => {
        if (diagnosticosAtivos.length === 0 || selectedDiagnosticoId === '') return;
        const found = diagnosticosAtivos.find(d => d.id === selectedDiagnosticoId);
        if (!found && medication.diagnosticoLabel) {
            const byLabel = diagnosticosAtivos.find(d => d.label === medication.diagnosticoLabel);
            if (byLabel) setSelectedDiagnosticoId(byLabel.id);
        }
    }, [diagnosticosAtivos]);

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

                // Se não tem categoria salva, já inicializa como customizado
                if (!medication.categoria) {
                    didInitMed.current = true;
                    setSelectedMedicamento('outro');
                    setCustomMedicamento(medication.name);
                    if (medication.dosage && medication.dosage !== medication.name) {
                        setDosageValue(medication.dosage.split(' ')[0]);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Erro ao buscar categorias:', err);
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
                if (didInitMed.current) setSelectedMedicamento('');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('medicamentos')
                    .select('*')
                    .eq('categoria', selectedCategoria)
                    .order('nome', { ascending: true });

                if (error) throw error;
                const lista = data || [];
                setMedicamentos(lista);

                if (!didInitMed.current) {
                    // Primeira carga: pré-selecionar o medicamento atual
                    didInitMed.current = true;
                    const match = lista.find((m: Medicamento) =>
                        m.nome.toLowerCase() === medication.name.toLowerCase()
                    );
                    if (match) {
                        setSelectedMedicamento(match.id.toString());
                        if (medication.dosage && medication.dosage !== medication.name) {
                            setDosageValue(medication.dosage.split(' ')[0]);
                        }
                    } else {
                        setSelectedMedicamento('outro');
                        setCustomMedicamento(medication.name);
                        if (medication.dosage && medication.dosage !== medication.name) {
                            setDosageValue(medication.dosage.split(' ')[0]);
                        }
                    }
                } else {
                    // Usuário mudou de categoria: limpa a seleção anterior
                    setSelectedMedicamento('');
                }
            } catch (err) {
                console.error('Erro ao buscar medicamentos:', err);
            }
        };

        fetchMedicamentos();
    }, [selectedCategoria]);

    // Dados do medicamento selecionado
    const selectedMedData = medicamentos.find(m => m.id.toString() === selectedMedicamento);
    const isOther = selectedMedicamento === 'outro';
    const temUnidadeDose = selectedMedData?.unidade_dose_principal !== null || (isOther && customUnidade);
    const unidadeFinal = isOther ? customUnidade : selectedMedData?.unidade_dose_principal;
    const finalMedicationName = isOther ? customMedicamento : selectedMedData?.nome || medication.name;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!finalMedicationName) {
            showNotification({ message: 'Selecione ou digite um medicamento', type: 'error' });
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

        const diagSelecionado = selectedDiagnosticoId !== ''
            ? diagnosticosAtivos.find(d => d.id === selectedDiagnosticoId)
            : undefined;

        // Se o usuário tinha um diagnóstico selecionado mas ele não está na lista atual
        // (ID de uma linha antiga), preserva o vínculo original em vez de apagar
        const diagId = diagSelecionado?.id ?? (selectedDiagnosticoId !== '' ? medication.diagnosticoId : undefined);
        const diagLabel = diagSelecionado?.label ?? (selectedDiagnosticoId !== '' ? medication.diagnosticoLabel : undefined);
        const diagDataInicio = selectedDiagnosticoId !== ''
          ? (diagSelecionado?.data_inicio || diagSelecionado?.created_at?.split('T')[0] ?? medication.diagnosticoDataInicio)
          : undefined;

        updateMedicationInPatient(patientId, {
            ...medication,
            name: finalMedicationName,
            dosage: dosageFormatted,
            startDate,
            sistema: (sistema === 'Outros' ? sistemaOutros.trim() : sistema) || undefined,
            diagnosticoId: diagId,
            diagnosticoLabel: diagLabel,
            diagnosticoDataInicio: diagDataInicio,
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
                                <option value="outro">Outro (digitar medicamento)</option>
                            </select>
                        </div>
                    )}

                    {/* Campo: Digitar medicamento customizado */}
                    {isOther && (
                        <>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Medicamento Customizado - Preencha o nome e opcionalmente a unidade
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
                            </div>
                        </>
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
                    {selectedMedicamento && !temUnidadeDose && !isOther && (
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

                    {/* Diagnóstico relacionado */}
                    {diagnosticosAtivos.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Diagnóstico relacionado <span className="text-slate-400 font-normal">(opcional)</span>
                            </label>
                            <div className="border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden max-h-48 overflow-y-auto">
                                <div
                                    onClick={() => { setSelectedDiagnosticoId(''); setSistema(''); setSistemaOutros(''); }}
                                    className={`flex items-start gap-2 px-3 py-2 cursor-pointer text-sm ${selectedDiagnosticoId === '' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                >
                                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${selectedDiagnosticoId === '' ? 'border-blue-500 bg-blue-500' : 'border-slate-400'}`} />
                                    Nenhum
                                </div>
                                {diagnosticosAtivos.map(d => (
                                    <div
                                        key={d.id}
                                        onClick={() => { setSelectedDiagnosticoId(d.id); if (d.sistema) { if (ALERT_SYSTEMS.includes(d.sistema)) { setSistema(d.sistema); setSistemaOutros(''); } else { setSistema('Outros'); setSistemaOutros(d.sistema); } } }}
                                        className={`flex items-start gap-2 px-3 py-2 cursor-pointer text-sm border-t border-slate-200 dark:border-slate-700 ${selectedDiagnosticoId === d.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${selectedDiagnosticoId === d.id ? 'border-blue-500 bg-blue-500' : 'border-slate-400'}`} />
                                        <span>
                                            {d.label}
                                            {d.created_at && (
                                                <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                    {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(d.created_at))}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sistema */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Sistema <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <div className="relative">
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
