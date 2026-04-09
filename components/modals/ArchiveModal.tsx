import React, { useState, useContext } from 'react';
import { NotificationContext, UserContext } from '../../contexts';
import { CloseIcon } from '../icons';
import { supabase } from '../../supabaseClient';

interface ArchiveModalProps {
    title: string;
    tableName: string;
    itemId: number | string;
    itemDescription: string;
    itemDate?: string;
    itemDateLabel?: string;
    extraInfo?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
    title,
    tableName,
    itemId,
    itemDescription,
    itemDate,
    itemDateLabel = 'Data',
    extraInfo,
    onClose,
    onSuccess,
}) => {
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
                .from(tableName)
                .update({
                    is_archived: true,
                    arquivado_por_id: user.id,
                    motivo_arquivamento: archiveReason.trim()
                })
                .eq('id', itemId);

            if (error) {
                showNotification({ message: `Erro ao arquivar: ${error.message}`, type: 'error' });
                return;
            }

            showNotification({ message: `${title.replace('Arquivar ', '')} arquivado(a) com sucesso!`, type: 'success' });
            onSuccess();
            onClose();
        } catch (error) {
            showNotification({ message: 'Erro ao arquivar. Tente novamente.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30" role="dialog" aria-modal="true" aria-label={title}>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50"
                        aria-label="Fechar modal"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        {itemDescription}
                    </p>
                    {itemDate && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            {itemDateLabel}: {new Date(itemDate).toLocaleDateString('pt-BR')}
                        </p>
                    )}
                    {extraInfo && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            {extraInfo}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Motivo do arquivamento <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={archiveReason}
                            onChange={(e) => setArchiveReason(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            disabled={isSubmitting}
                            required
                            aria-label="Motivo do arquivamento"
                        >
                            <option value="">Selecione o motivo...</option>
                            <option value="Erro">Erro</option>
                            <option value="Concluído">Concluído</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
