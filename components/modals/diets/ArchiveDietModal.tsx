import React, { useState, useContext } from 'react';
import { NotificationContext, UserContext } from '../../../contexts';
import { Diet } from '../../../types';
import { CloseIcon } from '../../icons';
import { supabase } from '../../../supabaseClient';

interface ArchiveDietModalProps {
    diet: Diet;
    patientId: number | string;
    onClose: () => void;
    onSuccess: () => void;
}

export const ArchiveDietModal: React.FC<ArchiveDietModalProps> = ({ diet, patientId, onClose, onSuccess }) => {
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;
    const [archiveReason, setArchiveReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!archiveReason.trim()) {
            showNotification({ message: 'Por favor, informe o motivo do arquivamento', type: 'error' });
            return;
        }

        if (!user?.id) {
            showNotification({ message: 'Usuário não autenticado', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('dietas_pacientes')
                .update({
                    is_archived: true,
                    arquivado_por_id: user.id,
                    motivo_arquivamento: archiveReason.trim()
                })
                .eq('id', diet.id);

            if (error) {
                console.error('Erro ao arquivar dieta:', error);
                showNotification({ message: 'Erro ao arquivar dieta', type: 'error' });
                return;
            }

            showNotification({ message: 'Dieta arquivada com sucesso!', type: 'success' });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao arquivar dieta:', error);
            showNotification({ message: 'Erro ao arquivar dieta', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Arquivar Dieta</h2>
                    <button 
                        onClick={onClose} 
                        disabled={isSubmitting}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        {diet.tipo}
                    </p>
                    {diet.data_inicio && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Início: {new Date(diet.data_inicio).toLocaleDateString('pt-BR')}
                        </p>
                    )}
                    {diet.volume && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Volume: {diet.volume} ml
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Motivo do arquivamento <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={archiveReason}
                            onChange={(e) => setArchiveReason(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-h-25"
                            placeholder="Descreva o motivo do arquivamento..."
                            disabled={isSubmitting}
                            required
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Exemplo: Dieta suspensa, mudança de prescrição, etc.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !archiveReason.trim()}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Arquivando...' : 'Arquivar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
