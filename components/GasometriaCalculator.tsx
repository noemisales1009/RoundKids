import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  AG_NORMAL,
  PRIMARIO_LABEL,
  REFERENCIAS,
  calcularAG,
  calcularCompensacao,
  calcularDeltaGap,
  classificarDisturbio,
  faixa,
  fmt,
  num,
  validarConsistencia,
  type AnionGap,
  type Compensacao,
  type Consistencia,
  type DeltaGap,
  type Disturbio,
  type ModoResp,
  type Primario,
  type TagTone,
} from '../lib/gasometria';

/* ────────────────────────────────────────────────────────────
   Componente
   ──────────────────────────────────────────────────────────── */

const TAG_COLORS: Record<TagTone, string> = {
  acid: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  alc: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  meta: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  resp: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  norm: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  misto: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
};

/** Cor do selo do histórico conforme o distúrbio primário gravado. */
const PRIMARIO_BADGE: Record<string, string> = {
  acidose_metabolica: TAG_COLORS.acid,
  acidose_respiratoria: TAG_COLORS.acid,
  acidose_mista: TAG_COLORS.acid,
  alcalose_metabolica: TAG_COLORS.alc,
  alcalose_respiratoria: TAG_COLORS.alc,
  alcalose_mista: TAG_COLORS.alc,
  misto_oposto: TAG_COLORS.misto,
  normal: TAG_COLORS.norm,
  indefinido: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

interface GasoRegistro {
  id: string;
  criado_em: string;
  ph: number;
  paco2: number;
  hco3: number;
  disturbio_primario: string | null;
  anion_gap: number | null;
  conclusao: string | null;
}

const formatDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

interface Props {
  patientId: string;
}

const CAMPOS_OBRIGATORIOS = [
  { key: 'ph', label: 'pH', placeholder: 'ex: 7.35', step: '0.01', min: '6.8', max: '7.8' },
  { key: 'paco2', label: 'PaCO₂ (mmHg)', placeholder: 'ex: 40', step: '0.1' },
  { key: 'hco3', label: 'HCO₃⁻ (mEq/L)', placeholder: 'ex: 24', step: '0.1' },
] as const;

const CAMPOS_COMPLEMENTARES = [
  { key: 'be', label: 'BE (mEq/L)', placeholder: 'ex: 0', step: '0.1' },
  { key: 'hco3std', label: 'HCO₃⁻ std (mEq/L)', placeholder: 'ex: 24', step: '0.1' },
  { key: 'lactato', label: 'Lactato (mmol/L)', placeholder: 'ex: 1.0', step: '0.1' },
  { key: 'na', label: 'Na⁺ (mEq/L)', placeholder: 'ex: 140', step: '0.1' },
  { key: 'cl', label: 'Cl⁻ (mEq/L)', placeholder: 'ex: 102', step: '0.1' },
  { key: 'albumina', label: 'Albumina (g/dL)', placeholder: 'ex: 4.0', step: '0.1' },
] as const;

type CampoKey = (typeof CAMPOS_OBRIGATORIOS)[number]['key'] | (typeof CAMPOS_COMPLEMENTARES)[number]['key'];

const VALORES_INICIAIS: Record<CampoKey, string> = {
  ph: '', paco2: '', hco3: '', be: '', hco3std: '', lactato: '', na: '', cl: '', albumina: '',
};

const StepHeader: React.FC<{ n: number; title: string; ativo: boolean; hint?: string }> = ({ n, title, ativo, hint }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
    <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${ativo ? 'bg-primary-600' : 'bg-slate-400 dark:bg-slate-600'}`}>{n}</span>
    <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{title}</span>
    {hint && <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500">{hint}</span>}
  </div>
);

export const GasometriaCalculator: React.FC<Props> = ({ patientId }) => {
  const [valores, setValores] = useState<Record<CampoKey, string>>(VALORES_INICIAIS);
  const [validation, setValidation] = useState<Consistencia | null>(null);
  const [validError, setValidError] = useState('');
  const [modoResp, setModoResp] = useState<ModoResp>('aguda');
  const [etapa, setEtapa] = useState(1);
  const [mostrarRef, setMostrarRef] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copiado, setCopiado] = useState(false);

  const [aba, setAba] = useState<'calc' | 'historico'>('calc');
  const [historico, setHistorico] = useState<GasoRegistro[]>([]);
  const [historicoLoading, setHistoricoLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  const carregarHistorico = async () => {
    setHistoricoLoading(true);
    const { data } = await supabase
      .from('gasometrias')
      .select('id, criado_em, ph, paco2, hco3, disturbio_primario, anion_gap, conclusao')
      .eq('paciente_id', patientId)
      .order('criado_em', { ascending: false })
      .limit(20);
    setHistorico((data as GasoRegistro[]) ?? []);
    setHistoricoLoading(false);
  };
  useEffect(() => { carregarHistorico(); }, [patientId]);

  const v = useMemo(() => ({
    ph: num(valores.ph),
    paco2: num(valores.paco2),
    hco3: num(valores.hco3),
    be: num(valores.be),
    hco3std: num(valores.hco3std),
    lactato: num(valores.lactato),
    na: num(valores.na),
    cl: num(valores.cl),
    albumina: num(valores.albumina),
  }), [valores]);

  const disturbio = useMemo<Disturbio | null>(() => {
    if (!validation?.valid || v.ph === null || v.paco2 === null || v.hco3 === null) return null;
    return classificarDisturbio(v.ph, v.paco2, v.hco3, v.be, v.lactato);
  }, [validation, v]);

  const ehRespiratorio = disturbio?.primario === 'acidose_respiratoria' || disturbio?.primario === 'alcalose_respiratoria';

  // Sugestão automática de agudo x crônico: HCO₃⁻ std e BE normais indicam que a compensação renal ainda não ocorreu.
  const sugestaoTempo = useMemo<'aguda' | 'cronica' | null>(() => {
    if (!ehRespiratorio || (v.hco3std === null && v.be === null)) return null;
    const stdNormal = v.hco3std === null ? null : v.hco3std >= 22 && v.hco3std <= 26;
    const beNormal = v.be === null ? null : v.be >= -2 && v.be <= 2;
    const sinais = [stdNormal, beNormal].filter(s => s !== null) as boolean[];
    return sinais.every(Boolean) ? 'aguda' : 'cronica';
  }, [ehRespiratorio, v.hco3std, v.be]);

  const compensacao = useMemo<Compensacao | null>(() => {
    if (!disturbio || v.paco2 === null || v.hco3 === null) return null;
    return calcularCompensacao(disturbio.primario, v.paco2, v.hco3, modoResp);
  }, [disturbio, v.paco2, v.hco3, modoResp]);

  const temAcidoseMetabolica = disturbio
    ? disturbio.metabolico === 'acidose_metabolica' ||
      disturbio.primario === 'acidose_metabolica' ||
      disturbio.primario === 'acidose_mista' ||
      compensacao?.associado === 'acidose metabólica associada'
    : false;

  const anionGap = useMemo<AnionGap | null>(() => {
    if (!disturbio || v.na === null || v.cl === null || v.hco3 === null) return null;
    return calcularAG(v.na, v.cl, v.hco3, v.albumina);
  }, [disturbio, v.na, v.cl, v.hco3, v.albumina]);

  const deltaGap = useMemo<DeltaGap | null>(() => {
    if (!anionGap || anionGap.classificacao !== 'aumentado' || v.hco3 === null) return null;
    return calcularDeltaGap(anionGap.agUsado, v.hco3);
  }, [anionGap, v.hco3]);

  const conclusao = useMemo<string[]>(() => {
    if (!disturbio || v.ph === null || v.paco2 === null || v.hco3 === null) return [];
    const linhas: string[] = [];
    linhas.push(`Gasometria: pH ${fmt(v.ph, 2)} | PaCO₂ ${fmt(v.paco2)} mmHg | HCO₃⁻ ${fmt(v.hco3)} mEq/L${v.be !== null ? ` | BE ${fmt(v.be)} mEq/L` : ''}${v.lactato !== null ? ` | Lactato ${fmt(v.lactato)} mmol/L` : ''}.`);
    if (validation) {
      linhas.push(`Consistência (Henderson-Hasselbalch): [H⁺] calculado ${fmt(validation.hCalc)} nEq/L vs esperado ${validation.hTabela} nEq/L — gasometria ${validation.valid ? 'consistente' : 'inconsistente'}.`);
    }
    linhas.push(`Distúrbio primário: ${disturbio.primarioLabel}. ${disturbio.descricao}`);
    if (compensacao) {
      const tempo = ehRespiratorio
        ? modoResp === 'aguda' ? ' (avaliado como agudo)' : modoResp === 'cronica_merck' ? ' (avaliado como crônico – Merck)' : ' (avaliado como crônico – ATS)'
        : '';
      linhas.push(`Compensação${tempo}: esperado ${compensacao.variavel} ${faixa(compensacao.min, compensacao.max)} — medido ${fmt(compensacao.medido)}. ${compensacao.conclusao}`);
    }
    if (anionGap) {
      linhas.push(`Ânion gap: ${fmt(anionGap.ag)} mEq/L${anionGap.agCorrigido !== null ? ` (corrigido pela albumina: ${fmt(anionGap.agCorrigido)} mEq/L)` : ''}. ${anionGap.textoClassificacao}`);
    }
    if (deltaGap) {
      linhas.push(`Delta AG ${fmt(deltaGap.deltaAG)} mEq/L — ${deltaGap.deltaAGTexto} HCO₃⁻ corrigido ${fmt(deltaGap.hco3Corrigido)} mEq/L — ${deltaGap.hco3CorrigidoTexto}`);
      if (deltaGap.razao !== null) {
        linhas.push(`Razão Delta AG / Delta HCO₃⁻: ${fmt(deltaGap.razao, 2)}. ${deltaGap.razaoSignificado}`);
      }
    }
    if (disturbio.critico) {
      linhas.push(disturbio.critico === 'acidose_grave'
        ? 'ALERTA: pH ≤ 7,10 — acidose grave, risco elevado de morte, exige resposta imediata.'
        : 'ALERTA: pH ≥ 7,60 — alcalose grave, risco elevado de morte, exige resposta imediata.');
    }
    linhas.push('Correlacionar sempre com quadro clínico, eletrólitos, lactato, função renal, ventilação e perfusão.');
    return linhas;
  }, [disturbio, validation, compensacao, anionGap, deltaGap, v, ehRespiratorio, modoResp]);

  function setCampo(key: CampoKey, valor: string) {
    setValores(prev => ({ ...prev, [key]: valor }));
    setValidation(null);
    setEtapa(1);
    setSaved(false);
    setSaveError('');
    setCopiado(false);
  }

  function validar() {
    const ph = num(valores.ph);
    const paco2 = num(valores.paco2);
    const hco3 = num(valores.hco3);

    if (ph === null || paco2 === null || hco3 === null) {
      setValidError('Preencha pH, PaCO₂ e HCO₃⁻.');
      setValidation(null);
      return;
    }
    if (hco3 <= 0 || paco2 <= 0) {
      setValidError('PaCO₂ e HCO₃⁻ devem ser maiores que zero.');
      setValidation(null);
      return;
    }

    const result = validarConsistencia(ph, paco2, hco3);
    if (!result) {
      setValidError('pH fora do intervalo da tabela (6,80 – 7,80).');
      setValidation(null);
      return;
    }

    setValidError('');
    setValidation(result);
    setSaved(false);
    setEtapa(result.valid ? 2 : 1);
  }

  async function salvar() {
    if (!validation?.valid || !disturbio || v.ph === null || v.paco2 === null || v.hco3 === null) return;
    setSaving(true);
    setSaveError('');

    const { data: { user } } = await supabase.auth.getUser();

    const registro = {
      paciente_id: patientId,
      criado_por: user?.id ?? null,
      ph: v.ph,
      paco2: v.paco2,
      hco3: v.hco3,
      h_calculado: validation.hCalc,
      h_tabela: validation.hTabela,
      gasometria_valida: true,
      tendencia_ph: disturbio.faixaPh === 'acidemia' ? 'acidose' : disturbio.faixaPh === 'alcalemia' ? 'alcalose' : 'normal',
      disturbio_metabolico: disturbio.metabolico,
      disturbio_respiratorio: disturbio.respiratorio,
      tipo_respiratorio: ehRespiratorio ? (modoResp === 'aguda' ? 'agudo' : 'cronico') : 'nao_aplicavel',
      be: v.be,
      hco3_standard: v.hco3std,
      lactato: v.lactato,
      sodio: v.na,
      cloro: v.cl,
      albumina: v.albumina,
      disturbio_primario: disturbio.primario,
      compensacao_variavel: compensacao?.variavel ?? null,
      compensacao_esperado_min: compensacao ? parseFloat(compensacao.min.toFixed(1)) : null,
      compensacao_esperado_max: compensacao ? parseFloat(compensacao.max.toFixed(1)) : null,
      compensacao_status: compensacao?.status ?? null,
      anion_gap: anionGap ? parseFloat(anionGap.ag.toFixed(1)) : null,
      anion_gap_corrigido: anionGap?.agCorrigido !== null && anionGap !== null ? parseFloat(anionGap.agCorrigido.toFixed(1)) : null,
      delta_ag: deltaGap ? parseFloat(deltaGap.deltaAG.toFixed(1)) : null,
      hco3_corrigido: deltaGap ? parseFloat(deltaGap.hco3Corrigido.toFixed(1)) : null,
      razao_delta: deltaGap?.razao != null ? parseFloat(deltaGap.razao.toFixed(2)) : null,
      conclusao: conclusao.join('\n'),
    };

    const { error } = await supabase.from('gasometrias').insert(registro);

    if (error) setSaveError(`Não foi possível gravar: ${error.message}`);
    else { setSaved(true); carregarHistorico(); }
    setSaving(false);
  }

  async function copiarConclusao() {
    try {
      await navigator.clipboard.writeText(conclusao.join('\n'));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setSaveError('Não foi possível copiar. Selecione o texto manualmente.');
    }
  }

  function resetar() {
    setValores(VALORES_INICIAIS);
    setValidation(null);
    setValidError('');
    setModoResp('aguda');
    setEtapa(1);
    setSaved(false);
    setSaveError('');
    setCopiado(false);
  }

  const cardBase = 'bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden';
  const botao = 'w-full py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400';

  const tabBtn = (ativa: boolean) =>
    `px-4 py-2 font-semibold text-sm transition-colors ${ativa
      ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`;

  return (
    <div className="pb-6">
      {/* Sub-abas: Calculadora / Histórico (mesmo padrão do NPT) */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => setAba('calc')} className={tabBtn(aba === 'calc')}>
          🧮 Calculadora
        </button>
        <button onClick={() => setAba('historico')} className={tabBtn(aba === 'historico')}>
          📋 Histórico de Gasometrias
        </button>
      </div>

      {aba === 'calc' && (
      <div className="space-y-4">

      {/* Alerta de pH crítico */}
      {disturbio?.critico && (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-900/40 px-4 py-3">
          <p className="text-red-700 dark:text-red-300 font-bold text-sm">
            {disturbio.critico === 'acidose_grave' ? 'pH ≤ 7,10 — acidose grave' : 'pH ≥ 7,60 — alcalose grave'}
          </p>
          <p className="text-red-700 dark:text-red-300 text-xs mt-0.5">
            Risco elevado de morte. Exige resposta imediata à beira do leito.
          </p>
        </div>
      )}

      {/* Etapa 1 – Valores */}
      <div className={cardBase}>
        <StepHeader n={1} title="Inserir valores da gasometria" ativo />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {CAMPOS_OBRIGATORIOS.map(c => (
              <div key={c.key}>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.label}</label>
                <input
                  type="number"
                  value={valores[c.key]}
                  onChange={e => setCampo(c.key, e.target.value)}
                  placeholder={c.placeholder}
                  step={c.step}
                  min={'min' in c ? c.min : undefined}
                  max={'max' in c ? c.max : undefined}
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
              Complementares — necessários para ânion gap e classificação agudo/crônico
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CAMPOS_COMPLEMENTARES.map(c => (
                <div key={c.key}>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{c.label}</label>
                  <input
                    type="number"
                    value={valores[c.key]}
                    onChange={e => setCampo(c.key, e.target.value)}
                    placeholder={c.placeholder}
                    step={c.step}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          <button onClick={validar} className={botao}>Validar gasometria →</button>

          {validError && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm">
              {validError}
            </div>
          )}

          {validation && v.ph !== null && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${validation.valid
              ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'}`}>
              <p className={`font-semibold mb-1 ${validation.valid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {validation.valid ? '✓ Gasometria válida' : '✗ Gasometria não válida'}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                [H⁺] calculado: <strong>{fmt(validation.hCalc)}</strong> nEq/L &nbsp;|&nbsp;
                [H⁺] esperado (pH {fmt(v.ph, 2)}): <strong>{validation.hTabela}</strong> nEq/L &nbsp;|&nbsp;
                Diferença: <strong>{fmt(validation.diff)}</strong> nEq/L
                {!validation.valid && ' – valores inconsistentes, revisar coleta.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Etapa 2 – Distúrbio primário */}
      <div className={`${cardBase} transition-opacity ${!validation?.valid ? 'opacity-40 pointer-events-none' : ''}`}>
        <StepHeader n={2} title="Definir distúrbio primário" ativo={etapa >= 2} />
        <div className="p-4 space-y-3">
          <button onClick={() => setEtapa(3)} disabled={!validation?.valid} className={botao}>
            Identificar distúrbio →
          </button>

          {etapa >= 3 && disturbio && v.ph !== null && v.paco2 !== null && v.hco3 !== null && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                pH: <strong>{fmt(v.ph, 2)}</strong> &nbsp;|&nbsp;
                HCO₃⁻: <strong>{fmt(v.hco3)}</strong> mEq/L &nbsp;|&nbsp;
                PaCO₂: <strong>{fmt(v.paco2)}</strong> mmHg
                &nbsp;|&nbsp; tendência do pH: <strong>{disturbio.tendencia === 'acidemica' ? 'acidêmica' : disturbio.tendencia === 'alcalemica' ? 'alcalêmica' : 'neutra (7,40)'}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {disturbio.tags.map((t, i) => (
                  <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TAG_COLORS[t.tone]}`}>{t.label}</span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{disturbio.primarioLabel}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{disturbio.descricao}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Etapa 3 – Compensação */}
      <div className={`${cardBase} transition-opacity ${etapa < 3 ? 'opacity-40 pointer-events-none' : ''}`}>
        <StepHeader n={3} title="Regra da compensação" ativo={etapa >= 3} hint="esperado × medido" />
        <div className="p-4 space-y-3">
          {ehRespiratorio && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Distúrbio respiratório — escolha o tempo de instalação (a compensação renal costuma aparecer após 3–5 dias):
                {sugestaoTempo && (
                  <span className="ml-1 text-slate-600 dark:text-slate-300">
                    HCO₃⁻ std/BE sugerem quadro <strong>{sugestaoTempo === 'aguda' ? 'agudo' : 'crônico'}</strong>.
                  </span>
                )}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'aguda', label: 'Agudo' },
                  { id: 'cronica_merck', label: 'Crônico – Merck' },
                  { id: 'cronica_ats', label: 'Crônico – ATS' },
                ] as const).map(op => (
                  <button
                    key={op.id}
                    onClick={() => setModoResp(op.id)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-colors ${modoResp === op.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                AGUDO: HCO₃⁻ std e BE normais (compensação renal ainda não ocorreu). CRÔNICO: HCO₃⁻ std e BE alterados (compensação renal já presente).
              </p>
            </div>
          )}

          <button onClick={() => setEtapa(Math.max(etapa, 4))} disabled={etapa < 3} className={botao}>
            Calcular compensação esperada →
          </button>

          {etapa >= 4 && (
            compensacao ? (
              <div className={`rounded-lg border px-4 py-3 space-y-2 ${compensacao.status === 'dentro'
                ? 'bg-green-50 dark:bg-green-900/25 border-green-300 dark:border-green-700'
                : 'bg-pink-50 dark:bg-pink-900/25 border-pink-300 dark:border-pink-700'}`}>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono leading-relaxed">{compensacao.formula}</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  {compensacao.variavel} esperado: <strong>{faixa(compensacao.min, compensacao.max)}</strong>
                  &nbsp;|&nbsp; medido: <strong>{fmt(compensacao.medido)}</strong>
                </p>
                <p className={`text-sm font-semibold ${compensacao.status === 'dentro'
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-pink-700 dark:text-pink-300'}`}>
                  {compensacao.status === 'dentro' ? '✓ Compensação dentro do esperado' : `⚠ Distúrbio misto provável — ${compensacao.associado}`}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{compensacao.conclusao}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {disturbio?.primario === 'normal'
                  ? 'Sem distúrbio primário definido — não há compensação a calcular. Lembre que pH normal não exclui distúrbio ácido-básico.'
                  : 'Distúrbio misto ou indefinido: os dois componentes alteram o pH na mesma direção, então não existe compensação esperada a calcular. Correlacione com o quadro clínico.'}
              </div>
            )
          )}
        </div>
      </div>

      {/* Etapa 4 – Ânion gap */}
      <div className={`${cardBase} transition-opacity ${etapa < 4 ? 'opacity-40 pointer-events-none' : ''}`}>
        <StepHeader n={4} title="Ânion gap (se acidose metabólica)" ativo={etapa >= 4} />
        <div className="p-4 space-y-3">
          <button onClick={() => setEtapa(Math.max(etapa, 5))} disabled={etapa < 4} className={botao}>
            Calcular ânion gap →
          </button>

          {etapa >= 5 && (
            !temAcidoseMetabolica ? (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Sem componente metabólico ácido nesta gasometria — o ânion gap não é necessário para a classificação. Se quiser calcular mesmo assim, preencha Na⁺ e Cl⁻ na etapa 1.
                {anionGap && (
                  <span className="block mt-1 text-slate-700 dark:text-slate-300">
                    AG calculado: <strong>{fmt(anionGap.ag)}</strong> mEq/L
                    {anionGap.agCorrigido !== null && <> | corrigido: <strong>{fmt(anionGap.agCorrigido)}</strong> mEq/L</>}
                  </span>
                )}
              </div>
            ) : !anionGap ? (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                Componente metabólico ácido nesta gasometria: preencha <strong>Na⁺</strong> e <strong>Cl⁻</strong> na etapa 1 para calcular o ânion gap. A albumina é opcional, mas sem ela o AG não é corrigido e pode ser subestimado na hipoalbuminemia.
              </div>
            ) : (
              <div className={`rounded-lg border px-4 py-3 space-y-2 ${anionGap.classificacao === 'aumentado'
                ? 'bg-amber-50 dark:bg-amber-900/25 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  AG = Na⁺ − (Cl⁻ + HCO₃⁻) = {fmt(v.na!)} − ({fmt(v.cl!)} + {fmt(v.hco3!)}) = <strong>{fmt(anionGap.ag)}</strong> mEq/L
                </p>
                {anionGap.agCorrigido !== null ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    AG corrigido = AG + 2,5 × (4 − albumina) = {fmt(anionGap.ag)} + 2,5 × (4 − {fmt(v.albumina!)}) = <strong>{fmt(anionGap.agCorrigido)}</strong> mEq/L
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Albumina não informada — AG sem correção. Em hipoalbuminemia o AG real é maior que o medido.
                  </p>
                )}
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {anionGap.classificacao === 'aumentado' ? 'AG aumentado' : anionGap.classificacao === 'normal' ? 'AG normal' : anionGap.classificacao === 'reduzido' ? 'AG reduzido' : 'AG abaixo da faixa habitual'}
                  {anionGap.usouAlbumina && ' (valor corrigido)'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{anionGap.textoClassificacao}</p>
                {v.lactato !== null && v.lactato > 2 && (
                  <p className="text-xs text-red-700 dark:text-red-300">Lactato {fmt(v.lactato)} mmol/L — acidose láctica é causa provável do AG aumentado.</p>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Etapa 5 – Delta AG / HCO₃⁻ corrigido */}
      <div className={`${cardBase} transition-opacity ${etapa < 5 ? 'opacity-40 pointer-events-none' : ''}`}>
        <StepHeader n={5} title="Se AG aumentado: distúrbios associados" ativo={etapa >= 5} />
        <div className="p-4 space-y-3">
          <button onClick={() => setEtapa(Math.max(etapa, 6))} disabled={etapa < 5} className={botao}>
            Avaliar Delta AG e HCO₃⁻ corrigido →
          </button>

          {etapa >= 6 && (
            !deltaGap ? (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Etapa aplicável apenas quando o ânion gap está aumentado (&gt; 12 mEq/L).
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Delta AG</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    Delta AG = AG − {AG_NORMAL} = <strong>{fmt(deltaGap.deltaAG)}</strong> mEq/L
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{deltaGap.deltaAGTexto}</p>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">HCO₃⁻ corrigido</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    HCO₃⁻ corrigido = {fmt(v.hco3!)} + {fmt(deltaGap.deltaAG)} = <strong>{fmt(deltaGap.hco3Corrigido)}</strong> mEq/L
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{deltaGap.hco3CorrigidoTexto}</p>
                </div>

                <div className="sm:col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Razão Delta AG / Delta HCO₃⁻</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    Delta HCO₃⁻ = 24 − {fmt(v.hco3!)} = {fmt(deltaGap.deltaHco3)} mEq/L
                    {deltaGap.razao !== null && <> &nbsp;→&nbsp; razão = <strong>{fmt(deltaGap.razao, 2)}</strong></>}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold">{deltaGap.razaoTexto}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{deltaGap.razaoSignificado}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Etapa 6 – Conclusão */}
      <div className={`${cardBase} transition-opacity ${etapa < 6 ? 'opacity-40 pointer-events-none' : ''}`}>
        <StepHeader n={6} title="Conclusão e registro" ativo={etapa >= 6} />
        <div className="p-4 space-y-3">
          {etapa >= 6 && conclusao.length > 0 && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-1.5">
              {conclusao.map((linha, i) => (
                <p key={i} className={`text-xs leading-relaxed ${linha.startsWith('ALERTA')
                  ? 'text-red-700 dark:text-red-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300'}`}>
                  {linha}
                </p>
              ))}
            </div>
          )}

          {etapa >= 6 && (
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-3">
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Checklist de interpretação</p>
              <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 leading-relaxed">
                <li>• pH normal não exclui distúrbio ácido-básico.</li>
                <li>• Use as regras de compensação para procurar distúrbio misto.</li>
                <li>• Correlacione com quadro clínico, eletrólitos, lactato, função renal, ventilação e perfusão.</li>
                <li>• pH ≤ 7,10 ou pH ≥ 7,60 indica risco elevado de morte e exige resposta imediata.</li>
              </ul>
            </div>
          )}

          {saveError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 px-4 py-3 text-red-700 dark:text-red-300 text-xs">
              {saveError}
            </div>
          )}

          {validation?.valid && disturbio && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={salvar}
                disabled={saving || saved}
                className={`flex-1 min-w-[180px] py-2.5 rounded-xl text-sm font-semibold transition-colors ${saved
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 cursor-default'
                  : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60'}`}
              >
                {saved ? '✓ Gravado no prontuário' : saving ? 'Gravando...' : 'Gravar no prontuário'}
              </button>
              <button
                onClick={copiarConclusao}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {copiado ? '✓ Copiado' : 'Copiar conclusão'}
              </button>
              <button
                onClick={resetar}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Nova gasometria
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Referências */}
      <div className={cardBase}>
        <button
          onClick={() => setMostrarRef(m => !m)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Referências e fórmulas</span>
          <span className="text-xs text-slate-400">{mostrarRef ? '▲' : '▼'}</span>
        </button>
        {mostrarRef && (
          <div className="px-4 pb-4 grid gap-4 lg:grid-cols-2">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-1.5 font-semibold">Parâmetro</th>
                    <th className="text-left py-1.5 font-semibold">Referência</th>
                    <th className="text-left py-1.5 font-semibold">Valor p/ cálculo</th>
                  </tr>
                </thead>
                <tbody>
                  {REFERENCIAS.map(r => (
                    <tr key={r.param} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-slate-700 dark:text-slate-200">{r.param}</td>
                      <td className="py-1.5 text-slate-500 dark:text-slate-400">{r.ref}</td>
                      <td className="py-1.5 text-slate-500 dark:text-slate-400">{r.calc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Henderson-Hasselbalch</p>
                <p className="font-mono">pH = 6,1 + log [ HCO₃⁻ / (0,03 × PaCO₂) ]</p>
                <p className="font-mono">[H⁺] = 24 × PaCO₂ / HCO₃⁻ (nEq/L)</p>
                <p className="mt-1">pH / [H⁺]: 7,60=25 · 7,50=32 · 7,40=40 · 7,30=50 · 7,20=63 · 7,10=79 · 7,00=100 · 6,90=126</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Compensação esperada</p>
                <p>Acidose resp. aguda: HCO₃⁻ = 24 + (0,1–0,2) × (PaCO₂ − 40)</p>
                <p>Acidose resp. crônica: 24 + 0,35 × ΔPaCO₂ (Merck) · 24 + (0,3–0,4) × ΔPaCO₂ (ATS)</p>
                <p>Alcalose resp. aguda: HCO₃⁻ = 24 − (0,1–0,2) × (40 − PaCO₂)</p>
                <p>Alcalose resp. crônica: 24 − (0,5–0,7) × Δ (Merck) · 24 − (0,4–0,5) × Δ (ATS)</p>
                <p>Acidose metabólica (Winter): PaCO₂ = (1,3–1,5) × HCO₃⁻ + 8 ± 2</p>
                <p>Alcalose metabólica: PaCO₂ = (0,6–0,7) × (HCO₃⁻ − 24) + 40 ± 5</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Ânion gap</p>
                <p>AG = Na⁺ − (Cl⁻ + HCO₃⁻) · referência 8–12 mEq/L (albumina 4 g/dL)</p>
                <p>AG corrigido = AG + 2,5 × (4 − albumina)</p>
                <p>Delta AG = AG medido − AG normal (10–12) · HCO₃⁻ corrigido = HCO₃⁻ medido + Delta AG</p>
                <p>Delta HCO₃⁻ = 24 − HCO₃⁻ medido</p>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Fonte: Análise sistemática da gasometria arterial — Hospital Infantil Dr. Juvêncio Mattos.
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
      )}

      {aba === 'historico' && (
        <div className={cardBase}>
          <div className="p-4">
            {historicoLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">Carregando...</p>
            ) : historico.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">Nenhuma gasometria registrada para este paciente.</p>
            ) : (
              <div className="space-y-2">
                {historico.map(g => (
                  <div key={g.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                    <button
                      onClick={() => setExpandido(expandido === g.id ? null : g.id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDataHora(g.criado_em)}</span>
                        {g.disturbio_primario && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIMARIO_BADGE[g.disturbio_primario] ?? PRIMARIO_BADGE.indefinido}`}>
                            {PRIMARIO_LABEL[g.disturbio_primario as Primario] ?? g.disturbio_primario}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{expandido === g.id ? '▲' : '▼'}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        pH <strong>{fmt(g.ph, 2)}</strong> &nbsp;|&nbsp; PaCO₂ <strong>{fmt(g.paco2)}</strong> &nbsp;|&nbsp; HCO₃⁻ <strong>{fmt(g.hco3)}</strong>
                        {g.anion_gap != null && <> &nbsp;|&nbsp; AG <strong>{fmt(g.anion_gap)}</strong></>}
                      </p>
                    </button>
                    {expandido === g.id && g.conclusao && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                        {g.conclusao.split('\n').map((linha, i) => (
                          <p key={i} className={`text-xs leading-relaxed ${linha.startsWith('ALERTA')
                            ? 'text-red-700 dark:text-red-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-400'}`}>
                            {linha}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GasometriaCalculator;
