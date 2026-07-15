import React, { useContext, useState } from 'react';
import { PatientsContext, NotificationContext } from '../../contexts';

interface AddPatientModalProps {
    onClose: () => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ onClose }) => {
    const { addPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;

    const [name, setName] = useState('');
    const [bedNumber, setBedNumber] = useState('');
    const [dob, setDob] = useState('');
    const [dtInternacao, setDtInternacao] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saving) return;

        // Validações (mesmos obrigatórios do banco: name, bed_number, dob)
        if (!name.trim()) {
            showNotification({ message: 'Informe o nome do paciente.', type: 'error' });
            return;
        }
        const leito = parseInt(bedNumber, 10);
        if (!Number.isFinite(leito)) {
            showNotification({ message: 'Informe o número do leito.', type: 'error' });
            return;
        }
        if (!dob) {
            showNotification({ message: 'Informe a data de nascimento.', type: 'error' });
            return;
        }

        setSaving(true);
        try {
            await addPatient({
                name: name.trim(),
                bedNumber: leito,
                dob, // input type=date já entrega ISO (yyyy-MM-dd)
                dtInternacao: dtInternacao || undefined,
            });
            showNotification({ message: 'Paciente cadastrado com sucesso!', type: 'success' });
            onClose();
        } catch (err) {
            showNotification({ message: err instanceof Error ? err.message : 'Erro ao cadastrar paciente.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const inputCls = 'w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400';
    const labelCls = 'block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-1.5';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-md">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Cadastro Manual</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Preencha os dados do paciente</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className={labelCls}>Nome do paciente <span className="text-danger-500">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value.toUpperCase())}
                            placeholder="Ex: MARIA CECILIA CONCEICAO FRANCA"
                            className={inputCls}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Número do leito <span className="text-danger-500">*</span></label>
                        <input
                            type="number"
                            min={1}
                            value={bedNumber}
                            onChange={e => setBedNumber(e.target.value)}
                            placeholder="Ex: 1"
                            className={inputCls}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Dt. nascimento <span className="text-danger-500">*</span></label>
                            <input
                                type="date"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Dt. internação</label>
                            <input
                                type="date"
                                value={dtInternacao}
                                onChange={e => setDtInternacao(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                        >
                            {saving ? 'Salvando...' : '✓ Cadastrar Paciente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
