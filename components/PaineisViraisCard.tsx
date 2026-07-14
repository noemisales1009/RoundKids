import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PencilIcon, CloseIcon, VirusIcon } from './icons';
import { AddPainelViralModal, EditPainelViralModal, ArchivePainelViralModal } from './modals/paineisVirais';
import type { PainelViralRow } from './modals/paineisVirais';

const RESULTADO_COLORS: Record<string, string> = {
    'Reagente': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    'Positivo': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    'Detectado': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    'Não Reagente': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    'Negativo': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    'Não Detectado': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    'Indeterminado': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    'Em andamento': 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
};

interface PaineisViraisCardProps {
    patientId: number | string;
    addTrigger?: number;
}

export const PaineisViraisCard: React.FC<PaineisViraisCardProps> = ({ patientId, addTrigger }) => {
    const [paineis, setPaineis] = useState<PainelViralRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPainel, setEditingPainel] = useState<PainelViralRow | null>(null);
    const [archivingPainel, setArchivingPainel] = useState<PainelViralRow | null>(null);

    const toggleMostrarEvolucao = async (id: string, value: boolean) => {
        await supabase.from('paineis_virais_pacientes').update({ mostrar_evolucao: value }).eq('id', id);
        setPaineis(prev => prev.map(p => p.id === id ? { ...p, mostrar_evolucao: value } : p));
    };

    const loadPaineis = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('paineis_virais_pacientes')
                .select('*')
                .eq('paciente_id', patientId)
                .is('archived_at', null)
                .order('data_coleta', { ascending: false });

            if (error) throw error;
            setPaineis(data || []);
            window.dispatchEvent(new CustomEvent('extra-counts-changed'));
        } catch (error) {
            console.error('Erro ao carregar painéis virais:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPaineis();
    }, [patientId]);

    useEffect(() => {
        if (addTrigger) setShowAddModal(true);
    }, [addTrigger]);

    if (loading) {
        return <div className="text-center text-slate-500">Carregando painéis virais...</div>;
    }

    return (
        <>
            {paineis.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                    Nenhum painel viral / sorologia registrado
                </div>
            ) : (
                <div className="space-y-3">
                    {(() => {
                        const allChecked = paineis.every(p => p.mostrar_evolucao !== false);
                        return (
                            <div className="flex justify-end mb-1">
                                <button
                                    onClick={() => paineis.forEach(p => toggleMostrarEvolucao(p.id, !allChecked))}
                                    className="text-xs text-primary-500 dark:text-primary-400 hover:underline"
                                >
                                    {allChecked ? 'Desmarcar todos' : 'Marcar todos'}
                                </button>
                            </div>
                        );
                    })()}
                    {paineis.map(p => (
                        <div key={p.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <VirusIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{p.painel}</p>
                                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">{p.categoria}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                            {new Date(p.data_coleta).toLocaleDateString('pt-BR')}
                                        </p>
                                        {p.diagnostico_label && (
                                            <span className="block mt-1 w-fit text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                Diagnóstico: {p.diagnostico_label}
                                            </span>
                                        )}
                                        {p.sistema && (
                                            <span className="block mt-1 w-fit text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                                                {p.sistema}
                                            </span>
                                        )}
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${RESULTADO_COLORS[p.resultado] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                                                {p.resultado}
                                            </span>
                                            {p.valor && (
                                                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                    {p.valor}
                                                </span>
                                            )}
                                        </div>
                                        {p.observacao && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                                                💬 {p.observacao}
                                            </p>
                                        )}
                                        <label className="flex items-center gap-1.5 mt-2 cursor-pointer select-none w-fit">
                                            <input type="checkbox" checked={p.mostrar_evolucao !== false} onChange={e => toggleMostrarEvolucao(p.id, e.target.checked)} className="w-3.5 h-3.5 accent-primary-500" />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Exibir na Evolução Diária</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <button
                                        onClick={() => setEditingPainel(p)}
                                        className="p-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-full transition"
                                        aria-label="Editar painel"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setArchivingPainel(p)}
                                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"
                                        aria-label="Arquivar painel"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <AddPainelViralModal
                    patientId={patientId}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => loadPaineis()}
                />
            )}

            {editingPainel && (
                <EditPainelViralModal
                    painel={editingPainel}
                    onClose={() => setEditingPainel(null)}
                    onSuccess={() => loadPaineis()}
                />
            )}

            {archivingPainel && (
                <ArchivePainelViralModal
                    painelId={archivingPainel.id}
                    painelNome={archivingPainel.painel}
                    dataColeta={archivingPainel.data_coleta}
                    onClose={() => setArchivingPainel(null)}
                    onSuccess={() => loadPaineis()}
                />
            )}
        </>
    );
};
