import React, { useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PatientsContext, NotificationContext, UserContext } from '../contexts';
import { VirusIcon, PlusIcon, CloseIcon, SaveIcon } from './icons';

interface TriagemMRCardProps {
  patientId: number | string;
}

interface TriagemMR {
  id: string;
  data_triagem: string;
  criterios: string[];
  precaucao_contato: boolean;
  swab_nasal: boolean;
  swab_retal: boolean;
  resultado_swab: string;      // pendente | negativo | positivo
  germe_isolado: string | null;
  conduta: string | null;      // manter | suspender
  observacao: string | null;
}

// Critério 9 tem swabs "conforme protocolo" (não é um "Sim" firme como os 1–8).
const CRITERIO9_KEY = 'historico_mr_contactante_neuro';

const CRITERIOS_MR: { key: string; label: string }[] = [
  { key: 'transferido_hospital_72h',        label: 'Transferido de outro hospital com internação > 72h' },
  { key: 'atb_amplo_espectro',              label: 'Uso prévio de antimicrobiano de amplo espectro' },
  { key: 'internacao_48h_procedimento',     label: 'Internação > 48h + procedimento invasivo (cirurgia, CVC, PICC, cateter umbilical, CVD, TOT, TQT)' },
  { key: 'home_care_ilpi',                  label: 'Proveniente de home care ou instituição de longa permanência' },
  { key: 'hemodialise',                     label: 'Hemodiálise / terapia renal substitutiva' },
  { key: 'uti_90dias',                      label: 'Passagem por UTI nos últimos 90 dias (permanência mínima de 72h)' },
  { key: 'internacao_previa_90dias',        label: 'Internação prévia nos últimos 90 dias (permanência mínima de 30 dias)' },
  { key: 'onco_hemato_transplante',         label: 'Paciente onco-hematológico ou transplantado' },
  { key: 'historico_mr_contactante_neuro',  label: 'Histórico conhecido de MR, contactante de caso MR ou neurocirurgia em internado > 48h' },
];

const GERMES_MR = ['MRSA', 'VRE', 'KPC/CRE', 'Acinetobacter MDR', 'Pseudomonas MDR', 'Enterobactéria ESBL+'];

const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

// Recomendação a partir dos critérios marcados (tabela SCIRAS/CCIRAS):
//  qualquer critério → precaução de contato; critérios 1–8 → swabs "Sim";
//  apenas o critério 9 → swabs "conforme protocolo".
function computeRecomendacao(selected: string[]) {
  const has = selected.length > 0;
  const temOutros = selected.some(k => k !== CRITERIO9_KEY);
  const soCriterio9 = has && !temOutros;
  return {
    precaucaoContato: has,
    swabNasal: temOutros,
    swabRetal: temOutros,
    swabTexto: temOutros ? 'Sim' : soCriterio9 ? 'Conforme protocolo' : '—',
    soCriterio9,
  };
}

export const TriagemMRCard: React.FC<TriagemMRCardProps> = ({ patientId }) => {
  const { addPrecautionToPatient } = useContext(PatientsContext)!;
  const { showNotification } = useContext(NotificationContext)!;
  const { user } = useContext(UserContext)!;

  const [triagens, setTriagens] = useState<TriagemMR[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('triagem_mr_pacientes')
      .select('id, data_triagem, criterios, precaucao_contato, swab_nasal, swab_retal, resultado_swab, germe_isolado, conduta, observacao')
      .eq('paciente_id', patientId)
      .is('archived_at', null)
      .order('data_triagem', { ascending: false });
    setTriagens((data as TriagemMR[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [patientId]);

  const rec = computeRecomendacao(selected);
  const toggle = (key: string) =>
    setSelected(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));

  const fecharModal = () => { setModalOpen(false); setSelected([]); setObservacao(''); };

  const handleSalvar = async () => {
    if (selected.length === 0) {
      showNotification({ message: 'Marque ao menos um critério.', type: 'error' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('triagem_mr_pacientes').insert({
      paciente_id: patientId,
      criterios: selected,
      precaucao_contato: rec.precaucaoContato,
      swab_nasal: rec.swabNasal,
      swab_retal: rec.swabRetal,
      resultado_swab: 'pendente',
      observacao: observacao.trim() || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) { showNotification({ message: `Erro: ${error.message}`, type: 'error' }); return; }
    showNotification({ message: 'Triagem MR salva.', type: 'success' });
    fecharModal();
    load();
  };

  const atualizar = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await supabase.from('triagem_mr_pacientes').update(patch).eq('id', id);
    if (error) { showNotification({ message: `Erro: ${error.message}`, type: 'error' }); return; }
    load();
  };

  const handleResultado = (t: TriagemMR, resultado: string) => {
    const conduta = resultado === 'negativo' ? 'suspender' : resultado === 'positivo' ? 'manter' : null;
    atualizar(t.id, {
      resultado_swab: resultado,
      conduta,
      germe_isolado: resultado === 'positivo' ? t.germe_isolado : null,
    });
  };

  const criarPrecaucao = (t: TriagemMR) => {
    addPrecautionToPatient(patientId, {
      tipo_precaucao: 'contato',
      data_inicio: hojeISO(),
      doenca_nome_manual: t.germe_isolado ? `Contato — ${t.germe_isolado} (Triagem MR)` : 'Precaução de contato — Triagem MR',
      observacao: 'Gerada pela Triagem MR (protocolo SCIRAS/CCIRAS).',
      isArchived: false,
    });
    showNotification({ message: 'Precaução de contato criada no card de Precauções.', type: 'success' });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <VirusIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Triagem MR</h3>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition text-sm font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Nova Triagem</span>
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Carregando...</p>
      ) : triagens.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          Nenhuma triagem registrada. Use "Nova Triagem" na admissão.
        </p>
      ) : (
        <div className="space-y-3">
          {triagens.map(t => {
            const r = computeRecomendacao(t.criterios ?? []);
            return (
              <div key={t.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDataHora(t.data_triagem)}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {t.precaucao_contato && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200">
                          Precaução de contato
                        </span>
                      )}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                        Swab nasal: {r.swabTexto}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                        Swab retal/anal: {r.swabTexto}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">
                      {(t.criterios?.length ?? 0)} critério(s) marcado(s)
                    </p>
                    {t.observacao && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">{t.observacao}</p>
                    )}
                  </div>
                  <button
                    onClick={() => atualizar(t.id, { archived_at: new Date().toISOString() })}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition shrink-0"
                    title="Arquivar"
                  >
                    <CloseIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>

                {/* Resultado + conduta */}
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 flex flex-wrap items-center gap-2">
                  <label className="text-xs text-slate-600 dark:text-slate-300">Resultado do swab:</label>
                  <select
                    value={t.resultado_swab}
                    onChange={e => handleResultado(t, e.target.value)}
                    className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="negativo">Negativo</option>
                    <option value="positivo">Positivo</option>
                  </select>

                  {t.resultado_swab === 'positivo' && (
                    <select
                      value={t.germe_isolado ?? ''}
                      onChange={e => atualizar(t.id, { germe_isolado: e.target.value || null })}
                      className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Germe isolado...</option>
                      {GERMES_MR.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  )}
                </div>

                {t.resultado_swab === 'negativo' && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1.5">
                    ✓ Conduta: suspender precaução de contato e manter precaução padrão.
                  </p>
                )}
                {t.resultado_swab === 'positivo' && (
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1.5">
                    ⚠ Conduta: manter precaução de contato conforme o agente isolado{t.germe_isolado ? ` (${t.germe_isolado})` : ''}.
                  </p>
                )}

                {t.precaucao_contato && (
                  <button
                    onClick={() => criarPrecaucao(t)}
                    className="mt-2 w-full text-xs font-semibold px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                  >
                    + Criar precaução de contato no card de Precauções
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MODAL NOVA TRIAGEM ===== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Nova Triagem MR</h3>
              <button onClick={fecharModal} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Marque os critérios de risco presentes na admissão. Basta <b>1</b> para indicar precaução de contato + swabs.
            </p>

            <div className="space-y-2">
              {CRITERIOS_MR.map((c, i) => (
                <label
                  key={c.key}
                  className="flex items-start gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(c.key)}
                    onChange={() => toggle(c.key)}
                    className="mt-0.5 w-4 h-4 accent-rose-600 shrink-0"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    <b>{i + 1}.</b> {c.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Recomendação em tempo real */}
            {selected.length > 0 && (
              <div className="mt-3 rounded-lg border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20 p-3">
                <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide mb-1.5">Recomendação</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200">
                    Precaução de contato: Sim
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    Swab nasal: {rec.swabTexto}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    Swab retal/anal: {rec.swabTexto}
                  </span>
                </div>
                {rec.soCriterio9 && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">
                    Somente o critério 9: coleta de swabs <b>conforme protocolo institucional</b>.
                  </p>
                )}
              </div>
            )}

            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Observação <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                onClick={fecharModal}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={saving || selected.length === 0}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center space-x-2"
              >
                <SaveIcon className="w-4 h-4" />
                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
