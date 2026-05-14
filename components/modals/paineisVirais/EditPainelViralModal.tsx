import React, { useState, useContext } from 'react';
import { supabase } from '../../../supabaseClient';
import { NotificationContext, UserContext } from '../../../contexts';
import { CloseIcon } from '../../icons';

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

const SISTEMAS = ['Sist. respiratório', 'Avaliação motora', 'Avaliação neurológica', 'Outras infecções'];

const RESULTADOS = ['Reagente', 'Não Reagente', 'Positivo', 'Negativo', 'Indeterminado', 'Em andamento', 'Detectado', 'Não Detectado'];

export type PainelViralRow = {
    id: string;
    categoria: string;
    painel: string;
    data_coleta: string;
    resultado: string;
    valor: string | null;
    sistema: string | null;
    observacao: string | null;
    mostrar_evolucao?: boolean;
    created_by: string;
    created_at: string;
};

export const EditPainelViralModal: React.FC<{
    painel: PainelViralRow;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ painel: painelData, onClose, onSuccess }) => {
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;

    const [categoria, setCategoria] = useState(painelData.categoria);
    const [painel, setPainel] = useState(painelData.painel);
    const [dataColeta, setDataColeta] = useState(painelData.data_coleta);
    const [resultado, setResultado] = useState(painelData.resultado);
    const [valor, setValor] = useState(painelData.valor ?? '');
    const [sistema, setSistema] = useState(painelData.sistema ?? '');
    const [observacao, setObservacao] = useState(painelData.observacao ?? '');
    const [loading, setLoading] = useState(false);

    const handleCategoriaChange = (cat: string) => {
        setCategoria(cat);
        setPainel('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!painel) {
            showNotification({ message: 'Por favor, selecione o painel/exame', type: 'error' });
            return;
        }
        if (!resultado) {
            showNotification({ message: 'Por favor, selecione o resultado', type: 'error' });
            return;
        }
        if (!user?.id) {
            showNotification({ message: 'Erro: Usuário não autenticado', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('paineis_virais_pacientes')
                .update({
                    categoria,
                    painel,
                    data_coleta: dataColeta,
                    resultado,
                    valor: valor.trim() || null,
                    sistema: sistema || null,
                    observacao: observacao.trim() || null,
                    updated_by: user.id,
                })
                .eq('id', painelData.id);

            if (error) throw error;

            showNotification({ message: 'Painel atualizado com sucesso!', type: 'success' });
            onSuccess();
            onClose();
        } catch (error: any) {
            showNotification({ message: error?.message || 'Erro ao atualizar painel', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Painel Viral / Sorologia</h2>
                    <button onClick={onClose} disabled={loading}>
                        <CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Categoria <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={categoria}
                            onChange={(e) => handleCategoriaChange(e.target.value)}
                            required
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200"
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
                                Painel / Exame <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={painel}
                                onChange={(e) => setPainel(e.target.value)}
                                required
                                className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200"
                            >
                                <option value="">Selecione o painel...</option>
                                {PAINEIS_POR_CATEGORIA[categoria]?.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                                {!PAINEIS_POR_CATEGORIA[categoria]?.includes(painel) && painel && (
                                    <option value={painel}>{painel}</option>
                                )}
                            </select>
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
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Resultado <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={resultado}
                            onChange={(e) => setResultado(e.target.value)}
                            required
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Selecione o resultado...</option>
                            {RESULTADOS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Valor / Titulação <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            placeholder="Ex: 1:16, 250 UI/mL, indetectável..."
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Sistema <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <select
                            value={sistema}
                            onChange={(e) => setSistema(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Selecione...</option>
                            {SISTEMAS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
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
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200 resize-none"
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
                            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
