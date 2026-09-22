import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { UserContext } from '../contexts';
import { num } from '../lib/gasometria';
import { normalizarFio2 } from '../lib/pards';
import { DISPOSITIVOS, duracao, type Dispositivo, type Situacao } from '../lib/suporteRespiratorio';
import {
  LIMIAR,
  calcularTudo,
  fmt,
  gerarSintese,
  mapEfetiva,
  memoriaDeCalculo,
  tendencia24h,
  type Aviso,
  type EntradaCalc,
  type IndicadorKey,
  type Resultado,
} from '../lib/calcRespiratoria';
import {
  ESVAZIAMENTO,
  FAIXAS_TAU,
  calcCiclo,
  faixaEtariaPorIdade,
  idadeEmMeses,
  type CicloEstimado,
} from '../lib/tempoRespiratorio';
import {
  CATEGORIAS_IR,
  LABEL_NIVEL,
  REFERENCIA_CATEGORIA,
  avaliarAlarmes,
  peepReferencia,
  resumoAlarmes,
  type Alarme,
  type CategoriaIR,
  type NivelAlarme,
} from '../lib/alarmesRespiratorios';

// Calculadora respiratória automática do Round (especificação funcional).
// Importa os dados do último registro do bloco de suporte e da última gasometria,
// diferencia visualmente dado importado, digitado e calculado, e só grava depois
// da confirmação do profissional. Nenhum alerta gera conduta ou ajuste de ventilador.

interface Props {
  patientId: string;
  pesoKg?: number | null;
  dob?: string | null;   // para a referência etária da constante de tempo
}

type CampoId =
  | 'pesoKg' | 'pesoIdealKg' | 'spo2' | 'fio2Pct' | 'pao2' | 'map'
  | 'paco2' | 'ph' | 'etco2' | 'peco2'
  | 'pip' | 'pplat' | 'peepProg' | 'peepTotal' | 'vteMl' | 'vtiMl' | 'fr' | 'tiSeg' | 'fluxoInspLmin';

type Origem = 'importado' | 'digitado';

const GRUPOS: { titulo: string; campos: { id: CampoId; label: string; unidade: string }[] }[] = [
  { titulo: 'Paciente', campos: [
    { id: 'pesoKg', label: 'Peso atual', unidade: 'kg' },
    { id: 'pesoIdealKg', label: 'Peso ideal ou predito', unidade: 'kg' },
  ] },
  { titulo: 'Oxigenação', campos: [
    { id: 'spo2', label: 'SpO₂', unidade: '%' },
    { id: 'fio2Pct', label: 'FiO₂', unidade: '%' },
    { id: 'pao2', label: 'PaO₂', unidade: 'mmHg' },
    { id: 'map', label: 'MAP', unidade: 'cmH₂O' },
  ] },
  { titulo: 'Gasometria e capnografia', campos: [
    { id: 'paco2', label: 'PaCO₂', unidade: 'mmHg' },
    { id: 'ph', label: 'pH', unidade: '' },
    { id: 'etco2', label: 'EtCO₂', unidade: 'mmHg' },
    { id: 'peco2', label: 'PECO₂ (CO₂ expirado misto)', unidade: 'mmHg' },
  ] },
  { titulo: 'Ventilador', campos: [
    { id: 'pip', label: 'PIP', unidade: 'cmH₂O' },
    { id: 'pplat', label: 'Pplat', unidade: 'cmH₂O' },
    { id: 'peepProg', label: 'PEEP programada', unidade: 'cmH₂O' },
    { id: 'peepTotal', label: 'PEEP total', unidade: 'cmH₂O' },
    { id: 'vteMl', label: 'VTe (volume corrente expirado)', unidade: 'mL' },
    { id: 'vtiMl', label: 'VTi (volume corrente inspirado)', unidade: 'mL' },
    { id: 'fr', label: 'Frequência respiratória', unidade: 'irpm' },
    { id: 'tiSeg', label: 'Tempo inspiratório (Ti)', unidade: 's' },
    { id: 'fluxoInspLmin', label: 'Fluxo inspiratório', unidade: 'L/min' },
  ] },
];

const TODOS: CampoId[] = GRUPOS.flatMap(g => g.campos.map(c => c.id));
const VAZIO = Object.fromEntries(TODOS.map(k => [k, ''])) as Record<CampoId, string>;

const CONDICOES: { id: 'sinalSpo2Ok' | 'contemporaneos' | 'pausaInspOk' | 'pausaExpOk' | 'vteConfiavel'; texto: string }[] = [
  { id: 'sinalSpo2Ok', texto: 'Curva pletismográfica e qualidade do sinal da oximetria conferidas.' },
  { id: 'contemporaneos', texto: 'PaO₂, FiO₂ e MAP são do mesmo momento (gasometria e parâmetros contemporâneos).' },
  { id: 'pausaInspOk', texto: 'Pplat medida com pausa inspiratória adequada, sem esforço respiratório significativo.' },
  { id: 'pausaExpOk', texto: 'PEEP total medida com pausa expiratória válida.' },
  { id: 'vteConfiavel', texto: 'VTe confiável, com vazamento não relevante.' },
];

type Aba = 'alarmes' | 'oxigenacao' | 'ventilacao' | 'mecanica' | 'protecao' | 'historico';

const COR_NIVEL: Record<NivelAlarme, string> = {
  critico: 'border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-900/25',
  atencao: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20',
  info: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
};
const BADGE_NIVEL: Record<NivelAlarme, string> = {
  critico: 'bg-red-600 text-white',
  atencao: 'bg-amber-500 text-white',
  info: 'bg-slate-400 text-white',
};

const formatDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

const textoNum = (v: unknown, casas = 2): string => {
  const n = Number(v);
  return v == null || v === '' || !Number.isFinite(n) ? '' : fmt(n, casas);
};

const COR_AVISO: Record<Aviso['nivel'], string> = {
  info: 'text-slate-600 dark:text-slate-400',
  atencao: 'text-amber-700 dark:text-amber-400',
  alerta: 'text-red-700 dark:text-red-400 font-semibold',
};

export const CalculadoraRespiratoria: React.FC<Props> = ({ patientId, pesoKg, dob }) => {
  const { user } = useContext(UserContext)!;

  const [loading, setLoading] = useState(true);
  const [campos, setCampos] = useState<Record<CampoId, string>>(VAZIO);
  const [origem, setOrigem] = useState<Partial<Record<CampoId, Origem>>>({});
  const [cond, setCond] = useState({ sinalSpo2Ok: false, contemporaneos: false, pausaInspOk: false, pausaExpOk: false, vteConfiavel: false });
  const [fonte, setFonte] = useState<{ episodioId: string | null; suporte: string; emVmi: boolean; modo: string | null; ventiladorEm: string | null; gasometriaEm: string | null }>(
    { episodioId: null, suporte: '', emVmi: false, modo: null, ventiladorEm: null, gasometriaEm: null });
  const [registros, setRegistros] = useState<Record<string, unknown>[]>([]);
  const [erroHistorico, setErroHistorico] = useState('');
  const [aba, setAba] = useState<Aba>('alarmes');
  // Contexto clínico: muda a leitura dos alarmes, mas nunca o cálculo
  const [categoria, setCategoria] = useState<CategoriaIR | null>(null);
  const [fluxoZero, setFluxoZero] = useState<'sim' | 'nao' | ''>('');
  const [estrategiaDeliberada, setEstrategiaDeliberada] = useState(false);
  const [instabilidade, setInstabilidade] = useState(false);
  const [prematuroSdr, setPrematuroSdr] = useState(false);
  const [sinteseManual, setSinteseManual] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [msgOk, setMsgOk] = useState('');

  // Item 2 e 8.1: importa do último registro do bloco de suporte e da última gasometria
  const importar = useCallback(async () => {
    setLoading(true);
    setErro('');
    const novos: Record<CampoId, string> = { ...VAZIO };
    const orig: Partial<Record<CampoId, Origem>> = {};
    const por = (id: CampoId, v: unknown, casas = 2) => { const t = textoNum(v, casas); if (t) { novos[id] = t; orig[id] = 'importado'; } };
    por('pesoKg', pesoKg, 2);

    const f = { episodioId: null as string | null, suporte: '', emVmi: false, modo: null as string | null, ventiladorEm: null as string | null, gasometriaEm: null as string | null };

    const { data: ep } = await supabase.from('suporte_resp_episodios')
      .select('id, situacao, dispositivo').eq('paciente_id', patientId).is('fim', null).maybeSingle();
    if (ep) {
      const situacao = ep.situacao as Situacao;
      const disp = DISPOSITIVOS[situacao]?.find(d => d.key === (ep.dispositivo as Dispositivo | null));
      f.episodioId = ep.id;
      f.emVmi = situacao === 'vmi';
      f.suporte = situacao === 'vmi' ? 'VPM invasiva' : situacao === 'ar_ambiente' ? 'ar ambiente' : disp?.texto ?? '';
      const { data: p } = await supabase.from('suporte_resp_parametros')
        .select('registrado_em, modo, spo2, fio2, map, pip, peep, fr, ti_seg, vc_ml')
        .eq('episodio_id', ep.id).order('registrado_em', { ascending: false }).limit(1).maybeSingle();
      if (p) {
        f.ventiladorEm = p.registrado_em;
        f.modo = p.modo;
        por('spo2', p.spo2, 0);
        por('fio2Pct', p.fio2 != null ? Number(p.fio2) * 100 : null, 0);
        por('map', p.map, 1); por('pip', p.pip, 1); por('peepProg', p.peep, 1);
        por('fr', p.fr, 0); por('tiSeg', p.ti_seg, 2); por('vteMl', p.vc_ml, 0);
      }
    }

    const { data: g } = await supabase.from('gasometrias')
      .select('criado_em, ph, paco2').eq('paciente_id', patientId).order('criado_em', { ascending: false }).limit(1).maybeSingle();
    if (g) { f.gasometriaEm = g.criado_em; por('ph', g.ph, 2); por('paco2', g.paco2, 1); }

    setCampos(novos);
    setOrigem(orig);
    setFonte(f);
    setCond({ sinalSpo2Ok: false, contemporaneos: false, pausaInspOk: false, pausaExpOk: false, vteConfiavel: false });
    setSinteseManual(null);
    setValidado(false);
    setLoading(false);
  }, [patientId, pesoKg]);

  const carregarHistorico = useCallback(async () => {
    const { data, error } = await supabase.from('calc_resp_avaliacoes')
      .select('*').eq('paciente_id', patientId).order('criado_em', { ascending: false }).limit(50);
    if (error) {
      console.error('CalculadoraRespiratoria.carregarHistorico:', error);
      setErroHistorico('Histórico indisponível. Confira se o script CREATE_CALC_RESPIRATORIA.sql já foi aplicado no banco.');
      setRegistros([]);
    } else { setErroHistorico(''); setRegistros((data ?? []) as Record<string, unknown>[]); }
  }, [patientId]);

  useEffect(() => { importar(); carregarHistorico(); }, [importar, carregarHistorico]);

  const entrada: EntradaCalc = useMemo(() => ({
    pesoKg: num(campos.pesoKg), pesoIdealKg: num(campos.pesoIdealKg), spo2: num(campos.spo2), fio2Pct: num(campos.fio2Pct),
    pao2: num(campos.pao2), paco2: num(campos.paco2), ph: num(campos.ph), etco2: num(campos.etco2), peco2: num(campos.peco2),
    pip: num(campos.pip), pplat: num(campos.pplat), peepProg: num(campos.peepProg), peepTotal: num(campos.peepTotal),
    map: num(campos.map), vteMl: num(campos.vteMl), vtiMl: num(campos.vtiMl), fr: num(campos.fr),
    tiSeg: num(campos.tiSeg), fluxoInspLmin: num(campos.fluxoInspLmin), modo: fonte.modo, emVmi: fonte.emVmi, ...cond,
  }), [campos, cond, fonte]);

  const calc = useMemo(() => calcularTudo(entrada), [entrada]);
  const todos = useMemo(() => [...calc.oxigenacao, ...calc.ventilacao, ...calc.mecanica], [calc]);
  const mapUsada = useMemo(() => mapEfetiva(entrada), [entrada]);

  // Constante de tempo e ciclo, a partir da mecânica medida (a idade é só referência)
  const ciclo: CicloEstimado = useMemo(() => {
    const achaValor = (k: IndicadorKey) => [...calc.mecanica].find(r => r.key === k)?.valor ?? null;
    return calcCiclo(achaValor('raw'), achaValor('cstat'), entrada.fr, { ovai: categoria === 'ovai' });
  }, [calc, entrada.fr, categoria]);

  const faixaEtaria = useMemo(() => faixaEtariaPorIdade(idadeEmMeses(dob), prematuroSdr), [dob, prematuroSdr]);
  const refEtaria = useMemo(() => FAIXAS_TAU.find(f => f.key === faixaEtaria) ?? null, [faixaEtaria]);

  // Último cálculo validado, para as regras de tendência
  const anterior = useMemo(() => {
    const r = registros[0];
    if (!r) return null;
    const n = (k: string) => (typeof r[k] === 'number' ? (r[k] as number) : null);
    return { vte_kg: n('vte_kg'), cstat: n('cstat'), raw: n('raw'), io: n('io'), is_osi: n('is_osi'), spo2: n('spo2'), etco2: n('etco2') };
  }, [registros]);

  const difFontesMin = useMemo(() => {
    if (!fonte.ventiladorEm || !fonte.gasometriaEm) return null;
    return Math.abs(new Date(fonte.ventiladorEm).getTime() - new Date(fonte.gasometriaEm).getTime()) / 60000;
  }, [fonte]);

  const alarmes: Alarme[] = useMemo(() => avaliarAlarmes(entrada, calc, ciclo, {
    categoria,
    fluxoExpRetornaZero: fluxoZero === '' ? null : fluxoZero === 'sim',
    estrategiaDeliberada,
    instabilidadeHemodinamica: instabilidade,
    difFontesMin,
    anterior,
  }), [entrada, calc, ciclo, categoria, fluxoZero, estrategiaDeliberada, instabilidade, difFontesMin, anterior]);
  const contagem = useMemo(() => resumoAlarmes(alarmes), [alarmes]);
  const refPeep = useMemo(() => peepReferencia(entrada.fio2Pct), [entrada.fio2Pct]);
  const achar = (k: IndicadorKey) => todos.find(r => r.key === k);
  const algumCalculado = todos.some(r => r.valor != null);
  const sinteseGerada = useMemo(() => gerarSintese(entrada, calc, fonte.suporte || 'suporte respiratório não registrado'), [entrada, calc, fonte.suporte]);
  const sintese = sinteseManual ?? sinteseGerada;
  const tendencia = useMemo(() => tendencia24h(registros), [registros]);

  // Item 4: sinalizar aumento PROGRESSIVO do gradiente (atual > último > penúltimo gravados)
  const gradienteProgressivo = useMemo(() => {
    const atual = achar('gradiente_co2')?.valor;
    const ant = registros.map(r => r.gradiente_co2).filter((v): v is number => typeof v === 'number').slice(0, 2);
    return atual != null && ant.length === 2 && atual > ant[0] && ant[0] > ant[1];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos, registros]);

  const difFontes = fonte.ventiladorEm && fonte.gasometriaEm
    ? duracao(
      fonte.ventiladorEm < fonte.gasometriaEm ? fonte.ventiladorEm : fonte.gasometriaEm,
      fonte.ventiladorEm < fonte.gasometriaEm ? fonte.gasometriaEm : fonte.ventiladorEm)
    : null;

  function editar(id: CampoId, v: string) {
    setCampos(prev => ({ ...prev, [id]: v }));
    setOrigem(prev => ({ ...prev, [id]: 'digitado' }));
    setValidado(false);
    setMsgOk('');
  }

  async function salvar() {
    setErro(''); setMsgOk('');
    if (!algumCalculado) { setErro('Nenhum indicador calculado ainda. Preencha os dados necessários.'); return; }
    if (!validado) { setErro('Confirme os dados e valide o resultado antes de gravar.'); return; }
    setSaving(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const v = (k: IndicadorKey) => achar(k)?.valor ?? null;
    const fio2 = entrada.fio2Pct != null ? normalizarFio2(entrada.fio2Pct) : null;
    const { error } = await supabase.from('calc_resp_avaliacoes').insert({
      paciente_id: patientId,
      episodio_id: fonte.episodioId,
      validado_por: authUser?.id ?? null,
      validado_por_nome: user?.name ?? null,
      gasometria_em: fonte.gasometriaEm,
      ventilador_em: fonte.ventiladorEm,
      suporte: fonte.suporte || null,
      modo: fonte.modo,
      peso_kg: entrada.pesoKg ?? null, peso_ideal_kg: entrada.pesoIdealKg ?? null,
      spo2: entrada.spo2 ?? null, fio2, pao2: entrada.pao2 ?? null, paco2: entrada.paco2 ?? null, ph: entrada.ph ?? null,
      etco2: entrada.etco2 ?? null, peco2: entrada.peco2 ?? null, pip: entrada.pip ?? null, pplat: entrada.pplat ?? null,
      peep_programada: entrada.peepProg ?? null, peep_total: entrada.peepTotal ?? null, map: mapUsada?.valor ?? null,
      // Colunas de ALTER_CALC_RESP_ADD_VTI_MAP.sql: só vão quando têm valor, para o insert não quebrar antes do script
      ...(mapUsada?.estimada ? { map_estimada: true } : {}),
      ...(entrada.vtiMl != null ? { vti_ml: entrada.vtiMl, vazamento_ml: v('vazamento_ml') } : {}),
      vte_ml: entrada.vteMl ?? null, vazamento_pct: v('vazamento_pct'), fr: entrada.fr ?? null,
      ti_seg: entrada.tiSeg ?? null, fluxo_insp_lmin: entrada.fluxoInspLmin ?? null,
      sinal_spo2_ok: cond.sinalSpo2Ok, contemporaneos: cond.contemporaneos, pausa_insp_ok: cond.pausaInspOk,
      pausa_exp_ok: cond.pausaExpOk, vte_confiavel: cond.vteConfiavel,
      pf: v('pf'), sf: v('sf'), io: v('io'), is_osi: v('is_osi'), classe_oxigenacao: calc.classe,
      vte_kg: v('vte_kg'), vmin_l: v('vmin'), gradiente_co2: v('gradiente_co2'), te_seg: v('te'),
      ie: achar('ie')?.valor != null ? achar('ie')!.exibicao : null, vd_vt: v('vd_vt'),
      dp: v('dp'), cstat: v('cstat'), cstat_kg: achar('cstat')?.extra?.cstat_kg ?? null, cdyn: v('cdyn'),
      raw: v('raw'), tau_seg: v('tau'), auto_peep: v('auto_peep'),
      origem_dados: origem,
      memoria_calculo: memoriaDeCalculo(calc),
      // Alarmes avaliados no momento da validação, com valor e referência (itens 8.5 e 13 das specs)
      alertas: [
        ...alarmes.map(a => ({ id: a.id, nivel: a.nivel, titulo: a.titulo, valor: a.valor, meta: a.meta })),
        ...todos.flatMap(r => r.avisos.filter(a => a.nivel !== 'info')).map(a => ({ nivel: a.nivel, titulo: a.texto })),
      ],
      // Colunas de ALTER_CALC_RESP_ADD_CONTEXTO.sql: só vão quando têm valor
      ...(categoria ? { categoria_ir: categoria } : {}),
      ...(ciclo.tiEstimado != null ? { ti_estimado_seg: ciclo.tiEstimado } : {}),
      ...(fluxoZero ? { fluxo_exp_retorna_zero: fluxoZero === 'sim' } : {}),
      sintese: sintese.trim() || null,
    });
    setSaving(false);
    if (error) { console.error('CalculadoraRespiratoria.salvar:', error); setErro(`Não foi possível gravar: ${error.message}`); return; }
    setMsgOk('Cálculo validado e gravado no histórico.');
    setValidado(false);
    carregarHistorico();
  }

  const cardBase = 'bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden';
  const cardTitulo = 'px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-slate-100';
  const inputCls = 'w-full min-w-0 px-3 py-2 border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400';
  const unidadeCls = 'px-2 flex items-center shrink-0 rounded-r-lg border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap';
  const tabBtn = (ativa: boolean) =>
    `px-3 py-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${ativa
      ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`;
  const badge = (o?: Origem) => o === 'importado'
    ? <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">importado</span>
    : o === 'digitado'
      ? <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">digitado</span>
      : null;

  const linhaResultado = (r: Resultado) => (
    <div key={r.key} className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.label}</p>
        <p className={`text-base font-bold ${r.valor != null ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>{r.exibicao}</p>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.formula}{r.valoresUsados ? ` = ${r.valoresUsados}` : ''}</p>
      {r.bloqueio && <p className="text-xs italic text-slate-600 dark:text-slate-400 mt-1">Não calculado. {r.bloqueio}</p>}
      {r.avisos.map(a => <p key={a.texto} className={`text-xs mt-1 ${COR_AVISO[a.nivel]}`}>{a.texto}</p>)}
    </div>
  );

  if (loading) return <p className="text-center text-slate-500 dark:text-slate-400 py-6">Importando dados...</p>;

  const vteKg = achar('vte_kg');
  const painel: [string, string][] = [
    ['VTe (volume corrente expirado)', entrada.vteMl != null ? `${fmt(entrada.vteMl, 0)} mL` : '—'],
    ['VTe/kg', vteKg?.valor != null ? vteKg.exibicao : '—'],
    ['Vazamento', achar('vazamento_pct')?.valor != null ? `${achar('vazamento_ml')!.exibicao} (${achar('vazamento_pct')!.exibicao})` : '—'],
    ['PIP', entrada.pip != null ? `${fmt(entrada.pip)} cmH₂O` : '—'],
    ['Pplat', entrada.pplat != null ? `${fmt(entrada.pplat)} cmH₂O` : '—'],
    ['PEEP programada', entrada.peepProg != null ? `${fmt(entrada.peepProg)} cmH₂O` : '—'],
    ['PEEP total', entrada.peepTotal != null ? `${fmt(entrada.peepTotal)} cmH₂O` : '—'],
    ['Auto-PEEP', achar('auto_peep')?.exibicao ?? '—'],
    ['Driving pressure', achar('dp')?.exibicao ?? '—'],
    ['MAP', mapUsada ? `${fmt(mapUsada.valor)} cmH₂O${mapUsada.estimada ? ' (estimada)' : ''}` : '—'],
    ['FiO₂', entrada.fio2Pct != null ? `${fmt(entrada.fio2Pct, 0)}%` : '—'],
    ['SpO₂', entrada.spo2 != null ? `${fmt(entrada.spo2, 0)}%` : '—'],
    ['Modo', fonte.modo ?? '—'],
  ];

  return (
    <div className="space-y-4">
      {/* Fontes dos dados importados (itens 2 e 8.1) */}
      <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-900/20 text-xs text-sky-900 dark:text-sky-100 space-y-1">
        <p><strong>Suporte atual:</strong> {fonte.suporte || 'nenhum episódio em curso no bloco de suporte'}{fonte.modo ? ` · modo ${fonte.modo}` : ''}</p>
        <p><strong>Parâmetros e oximetria:</strong> {fonte.ventiladorEm ? `registro de ${formatDataHora(fonte.ventiladorEm)}` : 'nada para importar'}</p>
        <p><strong>Gasometria (pH e PaCO₂):</strong> {fonte.gasometriaEm ? `registro de ${formatDataHora(fonte.gasometriaEm)}` : 'nada para importar'}. A PaO₂ não fica gravada na gasometria do app e precisa ser digitada.</p>
        {difFontes && <p>Diferença entre as duas fontes: <strong>{difFontes}</strong>. Não misture gasometria antiga com parâmetros atuais.</p>}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="button" onClick={importar} className="font-semibold text-primary-700 dark:text-primary-300 hover:underline">Importar de novo</button>
          <span className="opacity-80">Legenda:{badge('importado')}{badge('digitado')}<span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">calculado</span></span>
        </div>
      </div>

      {/* Dados de entrada */}
      {GRUPOS.map(g => (
        <div key={g.titulo} className={cardBase}>
          <div className={cardTitulo}>{g.titulo}</div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {g.campos.map(c => (
              <div key={c.id}>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{c.label}{campos[c.id] ? badge(origem[c.id]) : null}</label>
                <div className="flex items-stretch">
                  <input
                    type="text" inputMode="decimal" value={campos[c.id]} disabled={saving}
                    onChange={e => editar(c.id, e.target.value)}
                    className={`${inputCls} ${c.unidade ? 'rounded-l-lg' : 'rounded-lg'} ${origem[c.id] === 'importado' && campos[c.id] ? 'border-sky-300 dark:border-sky-700' : 'border-slate-300 dark:border-slate-600'}`}
                  />
                  {c.unidade && <span className={unidadeCls}>{c.unidade}</span>}
                </div>
                {c.id === 'fio2Pct' && entrada.fio2Pct != null && normalizarFio2(entrada.fio2Pct) != null && (
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">No cálculo: {fmt(normalizarFio2(entrada.fio2Pct) as number, 2)} (fração decimal)</p>
                )}
                {c.id === 'map' && !campos.map && mapUsada?.estimada && (
                  <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">Em branco: usada a MAP estimada de {fmt(mapUsada.valor)} cmH₂O. Prefira a medida no ventilador.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Contexto clínico: muda a leitura dos alarmes, nunca o cálculo */}
      <div className={cardBase}>
        <div className={cardTitulo}>Contexto clínico</div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria da insuficiência respiratória</label>
            <select value={categoria ?? ''} onChange={e => setCategoria((e.target.value || null) as CategoriaIR | null)} disabled={saving}
              className={`${inputCls} rounded-lg border-slate-300 dark:border-slate-600`}>
              <option value="">Não classificada</option>
              {CATEGORIAS_IR.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            {categoria && (
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                <p>{CATEGORIAS_IR.find(c => c.key === categoria)?.descricao}</p>
                <p><strong>I:E de referência:</strong> {REFERENCIA_CATEGORIA[categoria].ie}</p>
                <p><strong>PEEP:</strong> {REFERENCIA_CATEGORIA[categoria].peep}</p>
                <p><strong>Ti:</strong> {REFERENCIA_CATEGORIA[categoria].ti}</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fluxo expiratório retorna a zero antes do próximo ciclo?</label>
            <select value={fluxoZero} onChange={e => setFluxoZero(e.target.value as 'sim' | 'nao' | '')} disabled={saving}
              className={`${inputCls} rounded-lg border-slate-300 dark:border-slate-600 sm:max-w-xs`}>
              <option value="">Não observado</option>
              <option value="sim">Sim, retorna a zero</option>
              <option value="nao">Não retorna a zero</option>
            </select>
          </div>
          <div className="space-y-2">
            {[
              { on: estrategiaDeliberada, set: setEstrategiaDeliberada, texto: 'Estratégia deliberada, monitorada e registrada (volume fora da faixa ou relação I:E invertida intencional).' },
              { on: instabilidade, set: setInstabilidade, texto: 'Instabilidade hemodinâmica no momento da avaliação.' },
              { on: prematuroSdr, set: setPrematuroSdr, texto: 'Prematuro com síndrome do desconforto respiratório e baixa complacência.' },
            ].map(c => (
              <label key={c.texto} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-primary-600" checked={c.on} disabled={saving}
                  onChange={ev => { c.set(ev.target.checked); setValidado(false); setMsgOk(''); }} />
                {c.texto}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Condições de validade: sem confirmação, o cálculo correspondente fica bloqueado */}
      <div className={cardBase}>
        <div className={cardTitulo}>Condições de validade</div>
        <div className="p-4 space-y-2">
          {CONDICOES.map(c => (
            <label key={c.id} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-primary-600" checked={cond[c.id]} disabled={saving}
                onChange={e => { setCond(prev => ({ ...prev, [c.id]: e.target.checked })); setValidado(false); setMsgOk(''); }} />
              {c.texto}
            </label>
          ))}
          <p className="text-xs text-slate-500 dark:text-slate-400">Sem a confirmação, o cálculo que depende dela fica bloqueado e o motivo aparece no resultado.</p>
        </div>
      </div>

      {/* Item 1: as quatro abas da calculadora */}
      <div className={cardBase}>
        <div className="flex gap-1 px-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button className={tabBtn(aba === 'alarmes')} onClick={() => setAba('alarmes')}>
            Alarmes
            {contagem.critico > 0 && <span className="ml-1 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold">{contagem.critico}</span>}
            {contagem.atencao > 0 && <span className="ml-1 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">{contagem.atencao}</span>}
          </button>
          <button className={tabBtn(aba === 'oxigenacao')} onClick={() => setAba('oxigenacao')}>Oxigenação</button>
          <button className={tabBtn(aba === 'ventilacao')} onClick={() => setAba('ventilacao')}>Ventilação</button>
          <button className={tabBtn(aba === 'mecanica')} onClick={() => setAba('mecanica')}>Mecânica respiratória</button>
          <button className={tabBtn(aba === 'protecao')} onClick={() => setAba('protecao')}>Proteção pulmonar</button>
          <button className={tabBtn(aba === 'historico')} onClick={() => setAba('historico')}>Histórico{registros.length ? ` (${registros.length})` : ''}</button>
        </div>
        <div className="p-4 space-y-2">
          {aba === 'alarmes' && (
            <>
              {alarmes.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-2">Nenhum alarme ativo com os dados informados. Preencha os parâmetros e o contexto clínico para a avaliação ficar completa.</p>
              ) : alarmes.map(a => (
                <div key={a.id} className={`p-3 rounded-lg border ${COR_NIVEL[a.nivel]}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_NIVEL[a.nivel]}`}>{LABEL_NIVEL[a.nivel]}</span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.titulo}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300"><strong>Valor:</strong> {a.valor} · <strong>Referência:</strong> {a.meta}</p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{a.verificar}</p>
                </div>
              ))}
              {refPeep && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Referência PEEP–FiO₂ (ARDSNet) para FiO₂ {refPeep.fio2}%: PEEP {refPeep.min === refPeep.max ? fmt(refPeep.min) : `${fmt(refPeep.min)} a ${fmt(refPeep.max)}`} cmH₂O. A tabela é referência inicial e não comanda ajuste.
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">Os alarmes apoiam a avaliação profissional. O sistema nunca altera nem sugere alteração dos parâmetros do ventilador.</p>
            </>
          )}

          {aba === 'oxigenacao' && (
            <>
              {calc.oxigenacao.map(linhaResultado)}
              <div className="overflow-x-auto pt-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Classificação pelo PALICC-2 (criança em VMI com PEEP ≥ {LIMIAR.peepMinimaPalicc} cmH₂O)</p>
                <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
                  <thead><tr className="border-b border-slate-200 dark:border-slate-700">{['Classificação pelo índice', 'IO', 'IS ou OSI'].map(h => <th key={h} className="py-1 pr-3 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-1 pr-3">Sem critério de PARDS pelo índice</td><td className="py-1 pr-3">&lt; {LIMIAR.io.preenche}</td><td className="py-1 pr-3">&lt; {LIMIAR.is.preenche}</td></tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-1 pr-3">PARDS leve a moderada</td><td className="py-1 pr-3">{LIMIAR.io.preenche} a &lt; {LIMIAR.io.grave}</td><td className="py-1 pr-3">{LIMIAR.is.preenche} a &lt; {fmt(LIMIAR.is.grave)}</td></tr>
                    <tr><td className="py-1 pr-3">PARDS grave</td><td className="py-1 pr-3">≥ {LIMIAR.io.grave}</td><td className="py-1 pr-3">≥ {fmt(LIMIAR.is.grave)}</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">A classificação pelo PALICC-2 é apoio à avaliação e não diagnóstico isolado.</p>
            </>
          )}

          {aba === 'ventilacao' && (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                VTe (volume corrente expirado) <strong>{entrada.vteMl != null ? fmt(entrada.vteMl, 0) : '___'} mL</strong> | VTe/peso <strong>{vteKg?.valor != null ? fmt(vteKg.valor, 1) : '___'} mL/kg</strong> | Vazamento <strong>{achar('vazamento_pct')?.valor != null ? fmt(achar('vazamento_pct')!.valor as number, 1) : '___'}%</strong>
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                PaCO₂ <strong>{entrada.paco2 != null ? fmt(entrada.paco2) : '—'}</strong> mmHg · EtCO₂ <strong>{entrada.etco2 != null ? fmt(entrada.etco2) : '—'}</strong> mmHg · pH <strong>{entrada.ph != null ? fmt(entrada.ph, 2) : '—'}</strong>
              </p>
              {gradienteProgressivo && (
                <p className="text-xs text-amber-700 dark:text-amber-400">Gradiente PaCO₂–EtCO₂ em aumento progressivo nos últimos registros: avaliar espaço morto, relação V/Q e perfusão pulmonar.</p>
              )}
              {calc.ventilacao.map(linhaResultado)}
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-bold mb-1">Legenda</p>
                <p>VTi = volume corrente inspirado · VTe = volume corrente expirado · Vazamento = VTi − VTe · PaCO₂ = CO₂ arterial (gasometria) · EtCO₂ = CO₂ ao fim da expiração (capnografia) · PECO₂ = CO₂ expirado misto · VD/VT = espaço morto fisiológico</p>
              </div>
            </>
          )}

          {aba === 'mecanica' && (
            <>
              {calc.mecanica.map(linhaResultado)}

              {/* Constante de tempo e cálculo do Ti */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Constante de tempo e tempo inspiratório</p>
                {ciclo.tau == null ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Não calculada. Depende da resistência e da complacência estática.
                    {refEtaria && ` Referência aproximada para ${refEtaria.label.toLowerCase()}: τ de ${fmt(refEtaria.tauMin, 2)} a ${fmt(refEtaria.tauMax, 2)} s, com Ti de ${fmt(refEtaria.tauMin * 3, 2)} a ${fmt(refEtaria.tauMax * 3, 2)} s.`}
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        ['τ (constante de tempo)', `${fmt(ciclo.tau, 2)} s`],
                        ['Ti estimado (3 τ)', ciclo.tiEstimado != null ? `${fmt(ciclo.tiEstimado, 2)} s` : '—'],
                        ['Tempo total do ciclo', ciclo.tempoTotal != null ? `${fmt(ciclo.tempoTotal, 2)} s` : '—'],
                        [`Te mínimo (${categoria === 'ovai' ? '4' : '3'} τ)`, ciclo.teMinimo != null ? `${fmt(ciclo.teMinimo, 2)} s` : '—'],
                      ].map(([r, v]) => (
                        <div key={r} className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{r}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{v}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      τ = Raw × Cstat, com a complacência convertida para L/cmH₂O. Esvaziamento aproximado: {ESVAZIAMENTO.map(x => `${x.constantes} τ = ${x.pct}%`).join(' · ')}.
                    </p>
                    {entrada.tiSeg != null && ciclo.tau > 0 && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">Ti informado de {fmt(entrada.tiSeg, 2)} s equivale a {fmt(entrada.tiSeg / ciclo.tau, 1)} constantes de tempo.</p>
                    )}
                    {ciclo.cabeNoCiclo === false && (
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400">O Ti estimado não cabe no tempo total do ciclo com a FR atual.</p>
                    )}
                    {refEtaria && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Referência aproximada para {refEtaria.label.toLowerCase()}: τ de {fmt(refEtaria.tauMin, 2)} a {fmt(refEtaria.tauMax, 2)} s. A faixa etária é sugestão inicial; vale a constante calculada do paciente.
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">O Ti estimado é referência fisiológica. Confirmar com VTe, fluxo inspiratório, sincronia, pressão, tempo expiratório disponível e resposta clínica.</p>
                  </>
                )}
              </div>
            </>
          )}

          {aba === 'protecao' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {painel.map(([rotulo, valor]) => (
                  <div key={rotulo} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{rotulo}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{valor}</p>
                  </div>
                ))}
              </div>
              {calc.protecao.length === 0
                ? <p className="text-xs text-slate-500 dark:text-slate-400">Sem alerta específico de proteção pulmonar com os dados informados.</p>
                : calc.protecao.map(a => <p key={a.texto} className={`text-sm ${COR_AVISO[a.nivel]}`}>{a.texto}</p>)}
              <p className="text-xs text-slate-500 dark:text-slate-400">Os limites servem de alerta para avaliação profissional. O sistema nunca ajusta nem sugere ajuste do ventilador.</p>
              {tendencia.length > 0 && (
                <div className="overflow-x-auto pt-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tendência nas últimas 24 horas (cálculos validados)</p>
                  <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
                    <thead><tr className="border-b border-slate-200 dark:border-slate-700">{['Indicador', 'Atual', 'Anterior', 'Melhor', 'Pior'].map(h => <th key={h} className="py-1 pr-3 font-semibold">{h}</th>)}</tr></thead>
                    <tbody>{tendencia.map(l => (
                      <tr key={l.label} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-1 pr-3 font-semibold">{l.label}</td><td className="py-1 pr-3">{l.atual}</td><td className="py-1 pr-3">{l.anterior}</td><td className="py-1 pr-3">{l.melhor}</td><td className="py-1 pr-3">{l.pior}</td>
                      </tr>))}</tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {aba === 'historico' && (
            <>
              {erroHistorico && <p className="text-sm text-red-700 dark:text-red-400">{erroHistorico}</p>}
              {!erroHistorico && registros.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-4 text-sm">Nenhum cálculo validado ainda.</p>}
              {registros.map(r => (
                <div key={String(r.id)} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-semibold">{formatDataHora(String(r.criado_em))}{r.validado_por_nome ? ` · validado por ${String(r.validado_por_nome)}` : ''}{r.modo ? ` · modo ${String(r.modo)}` : ''}</p>
                  <p className="mt-1">{String(r.sintese ?? '')}</p>
                  {Array.isArray(r.memoria_calculo) && (
                    <details className="mt-1">
                      <summary className="font-semibold text-primary-600 dark:text-primary-400 cursor-pointer select-none">Memória de cálculo</summary>
                      <ul className="mt-1 space-y-0.5">
                        {(r.memoria_calculo as { indicador: string; formula: string; valores: string; resultado: string }[]).map(m => (
                          <li key={m.indicador}>{m.formula} = {m.valores} = <strong>{m.resultado}</strong></li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Item 9 e 8.3: síntese como rascunho, gravada só após a validação */}
      <div className={cardBase}>
        <div className={cardTitulo}>Síntese automática (rascunho)</div>
        <div className="p-4 space-y-3">
          <textarea value={sintese} onChange={e => { setSinteseManual(e.target.value); setValidado(false); }} rows={4} disabled={saving}
            className={`${inputCls} rounded-lg border-slate-300 dark:border-slate-600 resize-y`} />
          {sinteseManual !== null && (
            <button type="button" onClick={() => setSinteseManual(null)} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">Gerar de novo</button>
          )}
          <label className="flex items-start gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer">
            <input type="checkbox" className="mt-0.5 accent-primary-600" checked={validado} disabled={saving} onChange={e => { setValidado(e.target.checked); setErro(''); }} />
            Conferi os dados de entrada e valido este resultado.
          </label>
          {erro && <p className="text-sm text-red-700 dark:text-red-400">{erro}</p>}
          {msgOk && <p className="text-sm font-semibold text-green-700 dark:text-green-400">{msgOk}</p>}
          <button type="button" onClick={salvar} disabled={saving || !algumCalculado}
            className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition">
            {saving ? 'Gravando...' : 'Validar e gravar'}
          </button>
        </div>
      </div>
    </div>
  );
};
