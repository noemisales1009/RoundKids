import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { NotificationContext, UserContext } from '../../../contexts';
import { CloseIcon } from '../../icons';
import { ALERT_SYSTEMS } from '../../../constants';
import { RESULTADO_OPTIONS } from './EditPainelViralModal';

interface DiagnosticoAtivo {
  id: number;
  label: string;
  created_at: string;
  data_inicio?: string | null;
  sistema?: string;
}

const PAINEIS_POR_CATEGORIA: Record<string, string[]> = {
    'Painel Multiplex Respiratório': [
        // Agentes Bacterianos
        'Bordetella parapertussis',
        'Bordetella pertussis',
        'Chlamydophila pneumoniae',
        'Haemophilus influenzae',
        'Legionella pneumophila',
        'Mycoplasma pneumoniae',
        'Streptococcus pneumoniae',
        // Agentes Virais
        'Adenovírus',
        'Bocavirus 1/2/3/4',
        'Coronavirus 229E',
        'Coronavirus NL63',
        'Coronavirus OC43',
        'Coronavirus SARS-CoV-2',
        'Enterovirus',
        'Influenza A',
        'Influenza A H1N1',
        'Influenza A H1N1 (pdm09)',
        'Influenza A H3N2',
        'Influenza B',
        'Metapneumovirus',
        'Parainfluenza virus 1',
        'Parainfluenza virus 2',
        'Parainfluenza virus 3',
        'Parainfluenza virus 4',
        'Rhinovirus A/B/C',
        'VSR A (Vírus Sincicial Respiratório A)',
        'VSR B (Vírus Sincicial Respiratório B)',
    ],
    'PMVR (Painel Múltiplos Vírus Respiratórios)': [
        'Influenza A',
        'Influenza B',
        'VSR (Vírus Sincicial Respiratório)',
    ],
    'Meningite/Encefalite/Neuroinfecção (LCR)': [
        // Agentes Bacterianos
        'Neisseria meningitidis',
        'Listeria monocytogenes',
        'Haemophilus influenzae',
        'Streptococcus agalactiae',
        'Streptococcus pneumoniae',
        'Escherichia coli K1',
        // Agentes Virais
        'Herpes simplex vírus 1',
        'Herpes simplex vírus 2',
        'Varicella Zoster vírus',
        'Epstein-Barr vírus',
        'Citomegalovírus',
        'Human herpes vírus 6',
        'Human herpes vírus 7',
        'Human Adenovírus',
        'Human parechovírus',
        'Human enterovírus',
        'Mumps vírus',
        'Parvovírus B19',
    ],
    'Painel Multiplex Gastrointestinal': [
        // Bactérias
        'Aeromonas spp',
        'Campylobacter spp',
        'Clostridium difficile Hypervirulent (Toxina A/B)',
        'Clostridium difficile toxina B',
        'Escherichia coli enteroagregativa (EAEC) aggR',
        'Escherichia coli enteropatogênica (EPEC) eaeA',
        'Escherichia coli enterotoxigênica (ETEC) lt/st',
        'Escherichia coli O157',
        'Escherichia coli produtora de toxina Shiga (STEC) stx1/stx2',
        'Helicobacter pylori',
        'H. pylori - Mutação A2143G (resist. claritromicina)',
        'H. pylori - Mutação A2142G (resist. claritromicina)',
        'H. pylori - Mutação A2142C (resist. claritromicina)',
        'Salmonella spp',
        'Shigella spp./Escherichia coli enteroinvasiva (EIEC)',
        'Vibrio spp.',
        'Yersinia enterocolitica',
        // Fungos (Microsporídios)
        'Encephalitozoon spp/Enterocytozoon spp',
        // Helmintos
        'Ancylostoma sp',
        'Ascaris spp',
        'Enterobius vermicularis spp',
        'Hymenolepis spp',
        'Necator americanus spp',
        'Strongyloides spp',
        'Taenia spp',
        'Trichuris trichiura',
        // Protozoários
        'Giardia lamblia',
        'Entamoeba histolytica',
        'Cryptosporidium spp. (C. hominis e C. parvum)',
        'Blastocystis hominis',
        'Dientamoeba fragilis',
        'Cyclospora cayetanensis',
    ],
};


const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export const AddPainelViralModal: React.FC<{
    patientId: number | string;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ patientId, onClose, onSuccess }) => {
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;

    const [categoria, setCategoria] = useState('');
    const [paineisSelecionados, setPaineisSelecionados] = useState<{ categoria: string; painel: string }[]>([]);
    const [dataColeta, setDataColeta] = useState(getTodayDateString());
    const [resultado, setResultado] = useState('Em andamento');

    const [sistema, setSistema] = useState('');
    const [sistemaOutros, setSistemaOutros] = useState('');
    const [observacao, setObservacao] = useState('');
    const [loading, setLoading] = useState(false);
    const [diagnosticosAtivos, setDiagnosticosAtivos] = useState<DiagnosticoAtivo[]>([]);
    const [selectedDiagnosticoId, setSelectedDiagnosticoId] = useState<number | ''>('');

    useEffect(() => {
        const fetchDiagnosticos = async () => {
            const { data } = await supabase
                .from('paciente_diagnosticos')
                .select('id, opcao_label, texto_digitado, created_at, data_inicio, sistema')
                .eq('patient_id', patientId)
                .eq('arquivado', false)
                .eq('status', 'nao_resolvido')
                .order('created_at', { ascending: false });

            const unicos: DiagnosticoAtivo[] = [];
            const visto = new Set<string>();
            for (const d of data ?? []) {
                const label = d.texto_digitado
                    ? (d.opcao_label?.startsWith('Outr') ? d.texto_digitado : `${d.opcao_label} ${d.texto_digitado}`.trim())
                    : d.opcao_label;
                if (!label || visto.has(label)) continue;
                visto.add(label);
                unicos.push({ id: d.id, label, created_at: d.created_at, data_inicio: d.data_inicio || null, sistema: d.sistema || undefined });
            }
            setDiagnosticosAtivos(unicos);
        };
        fetchDiagnosticos();
    }, [patientId]);

    const togglePainel = (cat: string, p: string) =>
        setPaineisSelecionados(prev =>
            prev.some(x => x.categoria === cat && x.painel === p)
                ? prev.filter(x => !(x.categoria === cat && x.painel === p))
                : [...prev, { categoria: cat, painel: p }]
        );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (paineisSelecionados.length === 0) {
            showNotification({ message: 'Por favor, selecione ao menos um painel/exame', type: 'error' });
            return;
        }
        if (!user?.id) {
            showNotification({ message: 'Erro: Usuário não autenticado', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const diagSelecionado = diagnosticosAtivos.find(d => d.id === selectedDiagnosticoId);
            const comum = {
                paciente_id: patientId,
                data_coleta: dataColeta,
                resultado: resultado || 'Em andamento',
                sistema: (sistema === 'Outros' ? sistemaOutros.trim() : sistema) || null,
                observacao: observacao.trim() || null,
                created_by: user.id,
                diagnostico_id: diagSelecionado?.id ?? null,
                diagnostico_label: diagSelecionado?.label ?? null,
                diagnostico_data_inicio: diagSelecionado?.data_inicio || diagSelecionado?.created_at?.split('T')[0] || null,
            };
            const { error } = await supabase
                .from('paineis_virais_pacientes')
                .insert(paineisSelecionados.map(sel => ({
                    ...comum,
                    categoria: sel.categoria,
                    painel: sel.painel,
                })));

            if (error) throw error;

            showNotification({
                message: paineisSelecionados.length === 1
                    ? 'Painel viral/sorologia cadastrado com sucesso!'
                    : `${paineisSelecionados.length} painéis cadastrados com sucesso!`,
                type: 'success',
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            showNotification({ message: error?.message || 'Erro ao cadastrar painel viral', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Novo Painel Viral / Sorologia</h2>
                    <button onClick={onClose} disabled={loading}>
                        <CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Categoria
                        </label>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Selecione a categoria...</option>
                            {Object.keys(PAINEIS_POR_CATEGORIA).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {categoria && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Painéis / Exames <span className="text-red-500">*</span>{' '}
                                <span className="text-slate-400 font-normal">(marque um ou mais)</span>
                            </label>
                            <div className="mt-1 border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden divide-y divide-slate-200 dark:divide-slate-700 max-h-48 overflow-y-auto">
                                {PAINEIS_POR_CATEGORIA[categoria].map(p => {
                                    const checked = paineisSelecionados.some(x => x.categoria === categoria && x.painel === p);
                                    return (
                                        <div
                                            key={p}
                                            role="checkbox"
                                            aria-checked={checked}
                                            tabIndex={0}
                                            onClick={() => togglePainel(categoria, p)}
                                            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePainel(categoria, p); } }}
                                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 ${checked ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            <span className={`material-symbols-rounded text-[18px] shrink-0 ${checked ? 'text-primary-500' : 'text-slate-400'}`}>
                                                {checked ? 'check_box' : 'check_box_outline_blank'}
                                            </span>
                                            {p}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {paineisSelecionados.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Selecionados ({paineisSelecionados.length}):
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {paineisSelecionados.map(sel => (
                                    <span
                                        key={`${sel.categoria}|${sel.painel}`}
                                        title={sel.categoria}
                                        className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                                    >
                                        {sel.painel}
                                        <button
                                            type="button"
                                            onClick={() => togglePainel(sel.categoria, sel.painel)}
                                            title="Remover"
                                            className="hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-rounded text-[14px] block">close</span>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Data da Coleta
                        </label>
                        <input
                            type="date"
                            value={dataColeta}
                            onChange={(e) => setDataColeta(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-slate-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Resultado
                        </label>
                        <select
                            value={resultado}
                            onChange={(e) => setResultado(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-slate-200"
                        >
                            {RESULTADO_OPTIONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Vale para todos os painéis selecionados — dá para ajustar individualmente depois, na edição.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Diagnóstico vinculado <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        {diagnosticosAtivos.length === 0 ? (
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 italic">Nenhum diagnóstico ativo para este paciente.</p>
                        ) : (
                            <div className="mt-1 border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden divide-y divide-slate-200 dark:divide-slate-700 max-h-40 overflow-y-auto">
                                <div
                                    onClick={() => { setSelectedDiagnosticoId(''); setSistema(''); setSistemaOutros(''); }}
                                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm ${selectedDiagnosticoId === '' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <span className={`w-3 h-3 rounded-full border-2 shrink-0 ${selectedDiagnosticoId === '' ? 'border-primary-500 bg-primary-500' : 'border-slate-400'}`} />
                                    Nenhum
                                </div>
                                {diagnosticosAtivos.map(d => (
                                    <div
                                        key={d.id}
                                        onClick={() => { setSelectedDiagnosticoId(d.id); if (d.sistema) { if (ALERT_SYSTEMS.includes(d.sistema)) { setSistema(d.sistema); setSistemaOutros(''); } else { setSistema('Outros'); setSistemaOutros(d.sistema); } } }}
                                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm ${selectedDiagnosticoId === d.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                    >
                                        <span className={`w-3 h-3 rounded-full border-2 shrink-0 ${selectedDiagnosticoId === d.id ? 'border-primary-500 bg-primary-500' : 'border-slate-400'}`} />
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
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Sistema <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <select
                            value={sistema}
                            onChange={(e) => setSistema(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Selecione...</option>
                            {ALERT_SYSTEMS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {sistema === 'Outros' && (
                            <input
                                type="text"
                                value={sistemaOutros}
                                onChange={(e) => setSistemaOutros(e.target.value)}
                                placeholder="Especifique o sistema..."
                                className="mt-2 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-slate-200"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Observação <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                            rows={2}
                            placeholder="Digite aqui..."
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-800 dark:text-slate-200 resize-none"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : paineisSelecionados.length > 1 ? `Salvar (${paineisSelecionados.length})` : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
