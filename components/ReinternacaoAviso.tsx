import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../types';
import { NotificationContext, PatientsContext } from '../contexts';
import { WarningIcon } from './icons';
import { Modal } from './ui/Modal';
import {
    CadastroAnterior,
    InternacaoAnterior,
    Semelhanca,
    buscarCadastrosAnteriores,
    buscarInternacoesAnteriores,
    marcarComoDiferente,
    unirReinternacao,
} from '../lib/reinternacao';

// Aviso de reinternação na ficha do paciente.
// - Cadastro novo parecido com um arquivado: faixa "Possível reinternação" e
//   janela de conferência (nome completo, nascimento e nome da mãe).
// - Paciente já confirmado como reinternado: etiqueta com a internação anterior.
// A decisão é sempre de uma pessoa; os botões só aparecem para administrador.

const dataBR = (iso?: string | null) => {
    if (!iso) return '-';
    // Data pura (aaaa-mm-dd) não passa por fuso; data com hora usa o horário local
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.split('-').reverse().join('/');
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
};

const ETIQUETA: Record<Semelhanca, { texto: string; cor: string }> = {
    igual: { texto: 'Igual', cor: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
    parecido: { texto: 'Parecido', cor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
    diferente: { texto: 'Diferente', cor: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
    sem_dado: { texto: 'Falta preencher', cor: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
};

const Linha: React.FC<{ rotulo: string; novo: string; anterior: string; resultado?: Semelhanca }> = ({ rotulo, novo, anterior, resultado }) => (
    <div className="border-b border-slate-200 dark:border-slate-700 py-3 last:border-b-0">
        <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{rotulo}</p>
            {resultado && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ETIQUETA[resultado].cor}`}>{ETIQUETA[resultado].texto}</span>
            )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <p className="text-sm text-slate-800 dark:text-slate-200 break-words"><span className="text-slate-400 dark:text-slate-500">Agora: </span>{novo || '-'}</p>
            <p className="text-sm text-slate-800 dark:text-slate-200 break-words"><span className="text-slate-400 dark:text-slate-500">Anterior: </span>{anterior || '-'}</p>
        </div>
    </div>
);

export const ReinternacaoAviso: React.FC<{ patient: Patient; isAdmin: boolean }> = ({ patient, isAdmin }) => {
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext)!;
    const { refreshPatients } = useContext(PatientsContext)!;

    const [candidatos, setCandidatos] = useState<CadastroAnterior[]>([]);
    const [anteriores, setAnteriores] = useState<InternacaoAnterior[]>([]);
    const [aberto, setAberto] = useState<CadastroAnterior | null>(null);
    const [conferido, setConferido] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const motherName = patient.motherName && patient.motherName !== '-' ? patient.motherName : '';

    useEffect(() => {
        let ativo = true;
        buscarCadastrosAnteriores({ id: patient.id, name: patient.name, dob: patient.dob, motherName })
            .then(lista => { if (ativo) setCandidatos(lista); });
        buscarInternacoesAnteriores(patient.id)
            .then(lista => { if (ativo) setAnteriores(lista); });
        return () => { ativo = false; };
    }, [patient.id, patient.name, patient.dob, motherName]);

    const fechar = () => { setAberto(null); setConferido(false); };

    const confirmar = async () => {
        if (!aberto) return;
        setSalvando(true);
        const erro = await unirReinternacao(patient.id, aberto.id);
        setSalvando(false);
        if (erro) {
            showNotification({ message: `Não foi possível unir os cadastros: ${erro}`, type: 'error' });
            return;
        }
        const destino = aberto.id;
        fechar();
        await refreshPatients();
        showNotification({ message: 'Reinternação confirmada. O histórico anterior voltou para a ficha.', type: 'success' });
        navigate(`/patient/${destino}`, { replace: true });
    };

    const descartar = async () => {
        if (!aberto) return;
        setSalvando(true);
        const erro = await marcarComoDiferente(patient.id, aberto.id);
        setSalvando(false);
        if (erro) {
            showNotification({ message: `Não foi possível registrar: ${erro}`, type: 'error' });
            return;
        }
        setCandidatos(lista => lista.filter(c => c.id !== aberto.id));
        fechar();
        showNotification({ message: 'Registrado: não é o mesmo paciente.', type: 'info' });
    };

    if (candidatos.length === 0 && anteriores.length === 0) return null;

    return (
        <>
            {anteriores.length > 0 && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-4 py-3 mb-4">
                    <p className="text-sm font-bold text-primary-800 dark:text-primary-200">
                        Reinternação{anteriores.length > 1 ? ` · ${anteriores.length} internações anteriores` : ''}
                    </p>
                    {anteriores.map(i => (
                        <p key={i.id} className="text-sm text-slate-700 dark:text-slate-300">
                            Internação anterior: {dataBR(i.dtInternacao)} a {dataBR(i.dtSaida)}{i.motivoSaida ? ` · ${i.motivoSaida}` : ''}
                        </p>
                    ))}
                </div>
            )}

            {candidatos.map(c => (
                <div key={c.id} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <WarningIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Possível reinternação</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
                            Há um cadastro arquivado com a mesma data de nascimento e nome {c.nome === 'igual' ? 'igual' : 'parecido'}: {c.name}, saída em {dataBR(c.arquivadoEm)}.
                        </p>
                    </div>
                    <button
                        onClick={() => setAberto(c)}
                        className="shrink-0 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
                    >
                        Conferir
                    </button>
                </div>
            ))}

            <Modal isOpen={!!aberto} onClose={fechar} title="Conferir reinternação" size="lg">
                {aberto && (
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                            Compare os três identificadores. Só confirme se for a mesma criança.
                        </p>

                        <Linha rotulo="Nome completo" novo={patient.name} anterior={aberto.name} resultado={aberto.nome} />
                        <Linha rotulo="Data de nascimento" novo={dataBR(patient.dob)} anterior={dataBR(aberto.dob)} resultado="igual" />
                        <Linha rotulo="Nome da mãe" novo={motherName} anterior={aberto.motherName} resultado={aberto.mae} />
                        <Linha
                            rotulo="Prontuário"
                            novo={patient.prontuario || ''}
                            anterior={aberto.prontuario}
                            resultado={!patient.prontuario || !aberto.prontuario
                                ? 'sem_dado'
                                : patient.prontuario.trim() === aberto.prontuario.trim() ? 'igual' : 'diferente'}
                        />
                        <Linha rotulo="Internação" novo={dataBR(patient.admissionDate)} anterior={`${dataBR(aberto.dtInternacao)} a ${dataBR(aberto.arquivadoEm)}`} />

                        {aberto.mae !== 'igual' && (
                            <div className="mt-3 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-2">
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    {aberto.mae === 'sem_dado'
                                        ? 'O nome da mãe não está preenchido nos dois cadastros. Confira no prontuário antes de confirmar.'
                                        : 'O nome da mãe não é igual nos dois cadastros. Confira no prontuário antes de confirmar.'}
                                    {' '}Gêmeos têm a mesma data de nascimento, a mesma mãe e nomes parecidos.
                                </p>
                            </div>
                        )}

                        <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                Ao confirmar, a ficha volta com tudo o que o paciente tinha: diagnósticos, medicações, dispositivos, exames, alertas, escalas e evoluções, no leito atual. O que ficou em aberto na internação anterior volta como ativo e precisa ser revisado.
                            </p>
                        </div>

                        {isAdmin ? (
                            <>
                                <label className="flex items-start gap-2 mt-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={conferido}
                                        onChange={e => setConferido(e.target.checked)}
                                        className="mt-1 w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-800 dark:text-slate-200">
                                        Conferi nome completo, data de nascimento e nome da mãe. É o mesmo paciente.
                                    </span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                    <button
                                        onClick={confirmar}
                                        disabled={!conferido || salvando}
                                        className="flex-1 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {salvando ? 'Salvando...' : 'É o mesmo paciente: trazer o histórico'}
                                    </button>
                                    <button
                                        onClick={descartar}
                                        disabled={salvando}
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        Não é o mesmo paciente
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                Só um administrador pode confirmar a reinternação. Avise a coordenação.
                            </p>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};
