
import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientsContext, TasksContext, NotificationContext } from '../contexts';
import { useHeader } from '../hooks';
import { RESPONSIBLES, ALERT_DEADLINES } from '../constants';
import { CloseIcon, PencilIcon } from '../components/icons';

export const CreateAlertScreen: React.FC = () => {
    const { patientId, categoryId } = useParams<{ patientId: string, categoryId?: string }>();
    const { patients, categories } = useContext(PatientsContext)!;
    const { addPatientAlert } = useContext(TasksContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const navigate = useNavigate();

    const patient = patients.find(p => p.id.toString() === patientId);
    const category = categoryId ? categories.find(c => c.id.toString() === categoryId) : null;

    const [description, setDescription] = useState('');
    const [responsible, setResponsible] = useState('');
    const [deadline, setDeadline] = useState('');

    useHeader(category ? `Alerta: ${category.name}` : 'Criar Alerta');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId || !description || !responsible || !deadline) return;

        addPatientAlert({
            patientId: patientId,
            description,
            responsible,
            timeLabel: deadline,
        });

        showNotification({ message: 'Alerta criado com sucesso!', type: 'success' });

        navigate(-1);
    };

    if (!patient) {
        return <p>Paciente não encontrado</p>;
    }


    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl overflow-hidden max-w-md mx-auto shadow-lg relative">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition z-10"
                aria-label="Fechar"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
            <div className="p-6 bg-blue-500 dark:bg-blue-600 text-white text-center">
                <h2 className="text-xl font-bold">{patient.name}</h2>
                {category && <p className="text-blue-100">{category.name}</p>}
            </div>
            <div className="p-6 bg-white dark:bg-slate-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alerta</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Digite o alerta identificado..."
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
                        <select value={responsible} onChange={e => setResponsible(e.target.value)} required className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Selecione...</option>
                            {RESPONSIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione a hora</label>
                        <select value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Selecione...</option>
                            {ALERT_DEADLINES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition text-lg flex items-center justify-center gap-2"
                    >
                        <PencilIcon className="w-5 h-5" />
                        Criar alerta
                    </button>
                </form>
            </div>
        </div>
    );
};
