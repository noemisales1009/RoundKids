import React, { useState, useContext } from 'react';
import { supabase } from '../../../supabaseClient';
import { NotificationContext, UserContext } from '../../../contexts';
import { CloseIcon, ChevronDownIcon } from '../../icons';
import { ALERT_SYSTEMS } from '../../../constants';

const ESPECIALISTAS = [
    'Alergologia Ped',
    'Broncoscopia',
    'Cardioped',
    'CIPE',
    'Dermatologia Ped',
    'Endocrinologia',
    'Endoscopia',
    'Farmácia Clínica',
    'Gastropediatria',
    'Genética',
    'Hematologia Ped',
    'Hepatologista',
    'Imunologia',
    'Infectologia Ped',
    'Nefrologia Ped',
    'Neurocirurgia',
    'Neurologia Pediátrica',
    'Oftalmologista',
    'Oncologia Ped',
    'Ortopedia',
    'Pneumologia',
    'Psicologia',
    'Psiquiatria',
    'Reumatologista',
];

export type ParecerRow = {
    id: string;
    especialista: string;
    data_parecer: string;
    parecer: string | null;
    sistema?: string;
    mostrar_evolucao?: boolean;
    created_by: string;
    created_at: string;
};

export const EditParecerModal: React.FC<{
    parecer: ParecerRow;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ parecer: parecerData, onClose, onSuccess }) => {
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;

    const [especialista, setEspecialista] = useState(parecerData.especialista);
    const [dataParecer, setDataParecer] = useState(parecerData.data_parecer?.split('T')[0] ?? '');
    const [parecer, setParecer] = useState(parecerData.parecer ?? '');
    const [sistema, setSistema] = useState(
        parecerData.sistema && !ALERT_SYSTEMS.includes(parecerData.sistema) ? 'Outros' : (parecerData.sistema || '')
    );
    const [sistemaOutros, setSistemaOutros] = useState(
        parecerData.sistema && !ALERT_SYSTEMS.includes(parecerData.sistema) ? parecerData.sistema : ''
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {

        if (!especialista) {
            showNotification({ message: 'Por favor, selecione o especialista', type: 'error' });
            return;
        }

        if (!user?.id) {
            showNotification({ message: 'Erro: Usuário não autenticado', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('pareceres_pacientes')
                .update({
                    especialista,
                    data_parecer: dataParecer,
                    parecer: parecer.trim() || null,
                    sistema: (sistema === 'Outros' ? sistemaOutros.trim() : sistema) || null,
                    updated_by: user.id,
                })
                .eq('id', parecerData.id);

            if (error) throw error;

            showNotification({ message: 'Parecer atualizado com sucesso!', type: 'success' });
            onSuccess();
            onClose();
        } catch (error: any) {
            showNotification({ message: error?.message || 'Erro ao atualizar parecer', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Parecer</h2>
                    <button onClick={onClose} disabled={loading}>
                        <CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Especialista <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={especialista}
                            onChange={(e) => setEspecialista(e.target.value)}
                            required
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Selecione o especialista...</option>
                            {ESPECIALISTAS.map(e => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Data do Parecer
                        </label>
                        <input
                            type="date"
                            value={dataParecer}
                            onChange={(e) => setDataParecer(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-slate-800 dark:text-slate-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Parecer / Conduta
                        </label>
                        <textarea
                            value={parecer}
                            onChange={(e) => setParecer(e.target.value)}
                            rows={5}
                            placeholder="Descreva o parecer do especialista..."
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-slate-800 dark:text-slate-200 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Sistema <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <div className="relative mt-1">
                            <select value={sistema} onChange={e => setSistema(e.target.value)} className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-slate-800 dark:text-slate-200 appearance-none">
                                <option value="">Selecione...</option>
                                {ALERT_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-3 text-slate-400 pointer-events-none w-4 h-4" />
                        </div>
                        {sistema === 'Outros' && (
                            <input type="text" value={sistemaOutros} onChange={e => setSistemaOutros(e.target.value)} placeholder="Especifique o sistema..." className="mt-2 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-slate-800 dark:text-slate-200" />
                        )}
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
                            className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
