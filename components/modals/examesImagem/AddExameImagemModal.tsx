import React, { useState, useContext } from 'react';
import { supabase } from '../../../supabaseClient';
import { NotificationContext, UserContext } from '../../../contexts';
import { CloseIcon, ChevronDownIcon } from '../../icons';
import { ALERT_SYSTEMS } from '../../../constants';

const EXAMES_POR_CATEGORIA: Record<string, string[]> = {
    'Radiografia (Raio-X)': [
        'Radiografia de tórax',
        'Radiografia de abdome',
        'Radiografia de ossos longos',
        'Radiografia de crânio',
        'Radiografia de coluna',
        'Radiografia de face/seios da face',
        'Radiografia de pelve',
        'Esofagograma',
        'Seriografia gastrointestinal',
        'Enema opaco',
    ],
    'Ultrassonografia (USG)': [
        'USG abdominal total',
        'USG pélvica',
        'USG renal e vias urinárias',
        'USG transfontanela',
        'USG de partes moles',
        'USG musculoesquelética',
        'USG pulmonar',
        'USG cardíaca (ecocardiograma)',
        'USG com Doppler arterial',
        'USG com Doppler venoso',
        'USG com Doppler portal',
        'USG FAST (trauma)',
    ],
    'Tomografia Computadorizada (TC)': [
        'TC de crânio',
        'TC de tórax',
        'TC de abdome e pelve',
        'TC de seios da face',
        'TC de coluna',
        'TC de ossos',
        'Angiotomografia arterial',
        'Angiotomografia venosa',
    ],
    'Ressonância Magnética (RM)': [
        'RM de encéfalo',
        'RM de coluna',
        'RM de abdome',
        'RM de pelve',
        'RM musculoesquelética',
        'Angio-RM',
        'Colangio-RM',
        'RM cardíaca',
    ],
    'Medicina Nuclear': [
        'Cintilografia renal DMSA',
        'Cintilografia renal DTPA',
        'Cintilografia óssea',
        'Cintilografia pulmonar ventilação/perfusão',
        'Cintilografia hepática',
        'Cintilografia tireoidiana',
        'PET-CT',
    ],
    'Fluoroscopia': [
        'Deglutição videofluoroscópica',
        'Esofagograma',
        'Seriografia esôfago-estômago-duodeno',
        'Enema opaco',
        'Uretrocistografia miccional (UCM)',
        'Trânsito intestinal',
    ],
    'Angiografia': [
        'Arteriografia',
        'Venografia',
        'Angiografia cerebral',
        'Angiografia pulmonar',
        'Cateterismo cardíaco',
    ],
    'Ecocardiografia': [
        'Ecocardiograma transtorácico',
        'Ecocardiograma transesofágico',
        'Ecocardiograma com Doppler',
        'Ecocardiograma funcional',
    ],
    'Outros Exames': [
        'EEG',
        'Holter',
        'Eletroneuromiografia',
    ],
};

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const AddExameImagemModal: React.FC<{
    patientId: number | string;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ patientId, onClose, onSuccess }) => {
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;

    const [categoria, setCategoria] = useState('');
    const [exame, setExame] = useState('');
    const [dataExame, setDataExame] = useState(getTodayDateString());
    const [resultado, setResultado] = useState('');
    const [sistema, setSistema] = useState('');
    const [observacao, setObservacao] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCategoriaChange = (cat: string) => {
        setCategoria(cat);
        setExame('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!exame) {
            showNotification({ message: 'Por favor, selecione o exame', type: 'error' });
            return;
        }

        if (!user?.id) {
            showNotification({ message: 'Erro: Usuário não autenticado', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('exames_imagem_pacientes')
                .insert([{
                    paciente_id: patientId,
                    categoria,
                    exame,
                    data_exame: dataExame,
                    resultado: resultado.trim() || null,
                    sistema: sistema || null,
                    observacao: observacao.trim() || null,
                    created_by: user.id,
                }]);

            if (error) throw error;

            showNotification({ message: 'Exame de imagem cadastrado com sucesso!', type: 'success' });
            onSuccess();
            onClose();
        } catch (error: any) {
            showNotification({ message: error?.message || 'Erro ao cadastrar exame de imagem', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Novo Exame de Imagem</h2>
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
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-slate-800 dark:text-slate-200"
                        >
                            <option value="">Selecione a categoria...</option>
                            {Object.keys(EXAMES_POR_CATEGORIA).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {categoria && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Exame <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={exame}
                                onChange={(e) => setExame(e.target.value)}
                                required
                                className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-slate-800 dark:text-slate-200"
                            >
                                <option value="">Selecione o exame...</option>
                                {EXAMES_POR_CATEGORIA[categoria].map(ex => (
                                    <option key={ex} value={ex}>{ex}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Data do Exame
                        </label>
                        <input
                            type="date"
                            value={dataExame}
                            onChange={(e) => setDataExame(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-slate-800 dark:text-slate-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Sistema <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <div className="relative mt-1">
                            <select
                                value={sistema}
                                onChange={(e) => setSistema(e.target.value)}
                                className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-slate-800 dark:text-slate-200 appearance-none"
                            >
                                <option value="">Selecione...</option>
                                {ALERT_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-3 text-gray-400 pointer-events-none w-4 h-4" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Resultado / Laudo <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={resultado}
                            onChange={(e) => setResultado(e.target.value)}
                            rows={3}
                            placeholder="Descreva o resultado ou laudo do exame..."
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-slate-800 dark:text-slate-200 resize-none"
                        />
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
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-slate-800 dark:text-slate-200 resize-none"
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
                            className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
