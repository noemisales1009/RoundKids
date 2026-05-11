import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PencilIcon, CloseIcon, ClipboardIcon } from './icons';
import { AddParecerModal, EditParecerModal, ArchiveParecerModal } from './modals/pareceres';
import type { ParecerRow } from './modals/pareceres';

interface ParecerCardProps {
    patientId: number | string;
}

export const ParecerCard: React.FC<ParecerCardProps> = ({ patientId }) => {
    const [pareceres, setPareceres] = useState<ParecerRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingParecer, setEditingParecer] = useState<ParecerRow | null>(null);
    const [archivingParecer, setArchivingParecer] = useState<ParecerRow | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const loadPareceres = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const { data, error } = await supabase
                .from('pareceres_pacientes')
                .select('*')
                .eq('paciente_id', patientId)
                .is('archived_at', null)
                .order('data_parecer', { ascending: false });

            if (error) throw error;
            setPareceres(data || []);
        } catch (error: any) {
            console.error('Erro ao carregar pareceres:', error);
            setErrorMsg(error?.message || 'Erro ao carregar pareceres');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPareceres();
    }, [patientId]);

    if (loading) {
        return <div className="text-center text-slate-500">Carregando pareceres...</div>;
    }

    if (errorMsg) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Erro ao carregar pareceres</p>
                <p className="text-xs text-red-600 dark:text-red-300">{errorMsg}</p>
            </div>
        );
    }

    return (
        <>
            {pareceres.length === 0 ? (
                <div className="space-y-2">
                    <div className="text-center text-slate-500 dark:text-slate-400 py-4">
                        Nenhum parecer registrado
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full text-center bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                        Cadastrar Parecer
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {pareceres.map(p => (
                        <div key={p.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <ClipboardIcon className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-1 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{p.especialista}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(p.data_parecer).toLocaleDateString('pt-BR')}
                                        </p>
                                        {p.parecer && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 whitespace-pre-wrap">
                                                {p.parecer}
                                            </p>
                                        )}
                                        {p.sistema && <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">{p.sistema}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <button
                                        onClick={() => setEditingParecer(p)}
                                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"
                                        aria-label="Editar parecer"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setArchivingParecer(p)}
                                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"
                                        aria-label="Arquivar parecer"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full mt-2 text-center bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 rounded-lg transition"
                    >
                        Cadastrar Parecer
                    </button>
                </div>
            )}

            {showAddModal && (
                <AddParecerModal
                    patientId={patientId}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => loadPareceres()}
                />
            )}

            {editingParecer && (
                <EditParecerModal
                    parecer={editingParecer}
                    onClose={() => setEditingParecer(null)}
                    onSuccess={() => loadPareceres()}
                />
            )}

            {archivingParecer && (
                <ArchiveParecerModal
                    parecerId={archivingParecer.id}
                    especialista={archivingParecer.especialista}
                    dataParecer={archivingParecer.data_parecer}
                    onClose={() => setArchivingParecer(null)}
                    onSuccess={() => loadPareceres()}
                />
            )}
        </>
    );
};
