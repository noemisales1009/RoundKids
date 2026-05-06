import React, { useEffect, useState, useMemo, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { classificarPA, type ClassificacaoPAResult, type Sexo, idadeParaLabel } from '../services/paPercentis';
import { HeartPulseIcon, CloseIcon } from './icons';
import { UserContext } from '../contexts';

interface PAPercentisCardProps {
  patientId: number | string;
  sexo: string;
  dob: string;
  showForm: boolean;
  onFormClose: () => void;
}

type PAMedicaoRow = {
  id: string;
  data_medicao: string;
  sistolica: number;
  diastolica: number;
  media_medida: number;
  sist_p5: number; sist_p50: number; sist_p95: number;
  diast_p5: number; diast_p50: number; diast_p95: number;
  media_p5: number; media_p50: number; media_p95: number;
  class_sistolica: string;
  class_diastolica: string;
  class_media: string;
  alerta: boolean;
};

function computeIdadeLabel(dob: string): string {
  const birth = new Date(dob);
  const today = new Date();
  let anos = today.getFullYear() - birth.getFullYear();
  let meses = today.getMonth() - birth.getMonth();
  let dias = today.getDate() - birth.getDate();
  if (dias < 0) { meses--; dias += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
  if (meses < 0) { anos--; meses += 12; }
  return idadeParaLabel(anos, meses, dias);
}

function classBadge(classe: string) {
  if (classe === 'abaixo_p5') return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
  if (classe === 'acima_p95') return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
  return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
}

function classeTexto(classe: string) {
  if (classe === 'abaixo_p5') return 'Abaixo do P5 ↓';
  if (classe === 'acima_p95') return 'Acima do P95 ↑';
  return 'Normal ✓';
}

export const PAPercentisCard: React.FC<PAPercentisCardProps> = ({ patientId, sexo, dob, showForm, onFormClose }) => {
  const { user } = useContext(UserContext)!;
  const idadeLabel = useMemo(() => computeIdadeLabel(dob), [dob]);

  const [medicoes, setMedicoes] = useState<PAMedicaoRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [resultado, setResultado] = useState<ClassificacaoPAResult | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const semSexo = !sexo || sexo === 'Não informado';

  const loadMedicoes = async () => {
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('pa_medicoes_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .is('archived_at', null)
        .order('data_medicao', { ascending: false });
      if (error) throw error;
      setMedicoes(data || []);
    } catch (e: any) {
      console.error('Erro ao carregar medições de PA:', e.message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { loadMedicoes(); }, [patientId]);

  const handleClassificar = async () => {
    const sist = parseInt(sistolica);
    const diast = parseInt(diastolica);
    if (isNaN(sist) || sist <= 0 || isNaN(diast) || diast <= 0) {
      setErro('Preencha valores válidos para sistólica e diastólica.');
      return;
    }
    setClassifying(true);
    setErro(null);
    setResultado(null);
    try {
      const res = await classificarPA(sexo.toLowerCase() as Sexo, idadeLabel, sist, diast);
      setResultado(res);
    } catch (e: any) {
      setErro(e.message || 'Erro ao classificar PA.');
    } finally {
      setClassifying(false);
    }
  };

  const handleSalvar = async () => {
    if (!resultado) return;
    setSaving(true);
    setErro(null);
    try {
      const { error } = await supabase.from('pa_medicoes_pacientes').insert({
        paciente_id: patientId,
        sistolica: parseInt(sistolica),
        diastolica: parseInt(diastolica),
        media_medida: resultado.media_medida,
        sist_p5: resultado.sist_p5, sist_p50: resultado.sist_p50, sist_p95: resultado.sist_p95,
        diast_p5: resultado.diast_p5, diast_p50: resultado.diast_p50, diast_p95: resultado.diast_p95,
        media_p5: resultado.media_p5, media_p50: resultado.media_p50, media_p95: resultado.media_p95,
        class_sistolica: resultado.class_sistolica,
        class_diastolica: resultado.class_diastolica,
        class_media: resultado.class_media,
        alerta: resultado.alerta,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      setSistolica('');
      setDiastolica('');
      setResultado(null);
      onFormClose();
      await loadMedicoes();
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar medição.');
    } finally {
      setSaving(false);
    }
  };

  const handleArquivar = async (id: string) => {
    const { error } = await supabase
      .from('pa_medicoes_pacientes')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) loadMedicoes();
  };

  const handleClose = () => {
    setSistolica('');
    setDiastolica('');
    setResultado(null);
    setErro(null);
    onFormClose();
  };

  return (
    <>
      {/* Modal de nova medição */}
      {showForm && (
        <div className="fixed inset-0 z-[50] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-700 px-4 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <HeartPulseIcon className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-lg font-bold text-white">Nova Medição de PA</h2>
                  <p className="text-xs text-white/80">{sexo} · {idadeLabel}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white/80 hover:text-white transition p-1">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {semSexo && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Informe o sexo do paciente (editar dados) para classificar a PA por percentis.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">PA Sistólica (mmHg)</label>
                  <input
                    type="number" min="0"
                    value={sistolica}
                    onChange={e => { setSistolica(e.target.value); setResultado(null); }}
                    placeholder="ex: 110"
                    disabled={semSexo}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">PA Diastólica (mmHg)</label>
                  <input
                    type="number" min="0"
                    value={diastolica}
                    onChange={e => { setDiastolica(e.target.value); setResultado(null); }}
                    placeholder="ex: 65"
                    disabled={semSexo}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{erro}</p>
                </div>
              )}

              <button
                onClick={handleClassificar}
                disabled={classifying || semSexo}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-3 rounded-lg transition active:scale-[0.98] disabled:opacity-50"
              >
                {classifying ? 'Classificando...' : 'Classificar PA'}
              </button>

              {resultado && (
                <div className={`rounded-xl overflow-hidden border-2 ${resultado.alerta ? 'border-red-500' : 'border-emerald-500'}`}>
                  {resultado.alerta && (
                    <div className="bg-red-500 px-4 py-2.5 flex items-center gap-2">
                      <HeartPulseIcon className="w-5 h-5 text-white shrink-0" />
                      <p className="text-white font-bold text-sm">ALERTA: PA fora do intervalo P5–P95</p>
                    </div>
                  )}
                  <div className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    <PASection titulo="PA Sistólica" medido={`${sistolica} mmHg`} classe={resultado.class_sistolica}
                      percentis={[['P5', resultado.sist_p5], ['P50', resultado.sist_p50], ['P95', resultado.sist_p95]]} />
                    <PASection titulo="PA Diastólica" medido={`${diastolica} mmHg`} classe={resultado.class_diastolica}
                      percentis={[['P5', resultado.diast_p5], ['P50', resultado.diast_p50], ['P95', resultado.diast_p95]]} />
                    <PASection titulo="PA Média" medido={`${resultado.media_medida} mmHg`} classe={resultado.class_media}
                      percentis={[['P5', resultado.media_p5], ['P50', resultado.media_p50], ['P95', resultado.media_p95]]} />
                  </div>
                  <div className="bg-white dark:bg-slate-800 px-4 pb-4 pt-2">
                    <button
                      onClick={handleSalvar}
                      disabled={saving}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition active:scale-[0.98] disabled:opacity-50"
                    >
                      {saving ? 'Salvando...' : '💾 Salvar Medição'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Histórico de medições */}
      {loadingList ? (
        <div className="text-center text-slate-400 py-4 text-sm">Carregando histórico...</div>
      ) : medicoes.length === 0 ? (
        <div className="text-center text-slate-400 dark:text-slate-500 py-4 text-sm">
          Nenhuma medição salva
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            Histórico
          </p>
          {medicoes.map(m => (
            <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="flex items-stretch">
                <div className={`w-1 shrink-0 ${m.alerta ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <HeartPulseIcon className={`w-4 h-4 shrink-0 ${m.alerta ? 'text-red-500' : 'text-emerald-500'}`} />
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {m.sistolica}/{m.diastolica} mmHg
                      </p>
                      <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        média {m.media_medida}
                      </span>
                      {m.alerta && (
                        <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                          ⚠ Alerta
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleArquivar(m.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition shrink-0"
                      aria-label="Arquivar medição"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(m.data_medicao).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                        timeZone: 'America/Sao_Paulo'
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${classBadge(m.class_sistolica)}`}>
                      Sist: {classeTexto(m.class_sistolica)}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${classBadge(m.class_diastolica)}`}>
                      Diast: {classeTexto(m.class_diastolica)}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${classBadge(m.class_media)}`}>
                      Média: {classeTexto(m.class_media)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

type PARow = [string, number | string];

interface PASectionProps {
  titulo: string;
  medido: string;
  classe: string;
  percentis: PARow[];
}

const PASection: React.FC<PASectionProps> = ({ titulo, medido, classe, percentis }) => (
  <div className="p-4">
    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{titulo}</p>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{medido}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${classBadge(classe)}`}>
          {classeTexto(classe)}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {percentis.map(([label, val]) => (
        <div key={label} className="bg-slate-100 dark:bg-slate-700 rounded-lg py-2 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{val}</p>
        </div>
      ))}
    </div>
  </div>
);
