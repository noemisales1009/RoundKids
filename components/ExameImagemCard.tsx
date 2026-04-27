import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PencilIcon, CloseIcon, CameraIcon } from './icons';
import { AddExameImagemModal, EditExameImagemModal, ArchiveExameImagemModal } from './modals/examesImagem';
import type { ExameImagemRow } from './modals/examesImagem';

interface ExameImagemCardProps {
    patientId: number | string;
}

export const ExameImagemCard: React.FC<ExameImagemCardProps> = ({ patientId }) => {
    const [exames, setExames] = useState<ExameImagemRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExame, setEditingExame] = useState<ExameImagemRow | null>(null);
    const [archivingExame, setArchivingExame] = useState<ExameImagemRow | null>(null);

    const loadExames = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('exames_imagem_pacientes')
                .select('*')
                .eq('paciente_id', patientId)
                .is('archived_at', null)
                .order('data_exame', { ascending: false });

            if (error) throw error;
            setExames(data || []);
        } catch (error) {
            console.error('Erro ao carregar exames de imagem:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExames();
    }, [patientId]);

    if (loading) {
        return <div className="text-center text-slate-500">Carregando exames de imagem...</div>;
    }

    return (
        <>
            {exames.length === 0 ? (
                <div className="space-y-2">
                    <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                        Nenhum exame de imagem registrado
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full text-center bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                        Cadastrar Exame de Imagem
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {exames.map(ex => (
                        <div key={ex.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <CameraIcon className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-1 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{ex.exame}</p>
                                        <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-0.5">{ex.categoria}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                            {new Date(ex.data_exame).toLocaleDateString('pt-BR')}
                                        </p>
                                        {ex.sistema && (
                                            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                                                {ex.sistema}
                                            </span>
                                        )}
                                        {ex.resultado && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 whitespace-pre-wrap">
                                                {ex.resultado}
                                            </p>
                                        )}
                                        {ex.observacao && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                                                💬 {ex.observacao}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <button
                                        onClick={() => setEditingExame(ex)}
                                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"
                                        aria-label="Editar exame"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setArchivingExame(ex)}
                                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"
                                        aria-label="Arquivar exame"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full mt-2 text-center bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                        Cadastrar Exame de Imagem
                    </button>
                </div>
            )}

            {showAddModal && (
                <AddExameImagemModal
                    patientId={patientId}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => loadExames()}
                />
            )}

            {editingExame && (
                <EditExameImagemModal
                    exame={editingExame}
                    onClose={() => setEditingExame(null)}
                    onSuccess={() => loadExames()}
                />
            )}

            {archivingExame && (
                <ArchiveExameImagemModal
                    exameId={archivingExame.id}
                    exameNome={archivingExame.exame}
                    dataExame={archivingExame.data_exame}
                    onClose={() => setArchivingExame(null)}
                    onSuccess={() => loadExames()}
                />
            )}
        </>
    );
};
