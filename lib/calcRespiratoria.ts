// ============================================================================
// Calculadora respiratória automática para o Round — UTI Pediátrica
// Fonte: "Calculadora respiratória automática para o Round: oxigenação, ventilação
// e mecânica respiratória na UTI Pediátrica" (especificação funcional).
// Referências da spec: PALICC-2 (Emeriaud G, et al. Pediatr Crit Care Med. 2023;24(2):143-168)
// e Sundaram M, et al. Indian J Pediatr. 2021;88:64-72.
//
// Lógica pura, sem React nem Supabase (mesmo padrão de lib/pards.ts). A interface
// fica em components/CalculadoraRespiratoria.tsx.
//
// Regras de segurança da spec aplicadas aqui:
//   - cálculo BLOQUEADO quando falta variável obrigatória ou condição de validade (8.4);
//   - cada resultado guarda fórmula e valores usados (8.5);
//   - alertas são apoio à decisão: nunca geram conduta nem ajuste de ventilador (7 e 8.8).
// ============================================================================

import { calcIO, calcISO, calcPF, calcSF, normalizarFio2, spo2Utilizavel } from './pards';

export interface EntradaCalc {
  pesoKg?: number | null;        // peso atual
  pesoIdealKg?: number | null;   // peso ideal ou predito (preferido quando informado)
  spo2?: number | null;          // %
  fio2Pct?: number | null;       // % na interface; o cálculo usa fração decimal
  pao2?: number | null;          // mmHg
  paco2?: number | null;         // mmHg
  ph?: number | null;
  etco2?: number | null;         // mmHg
  peco2?: number | null;         // mmHg (CO₂ expirado misto) — cálculo avançado
  pip?: number | null;           // cmH₂O
  pplat?: number | null;         // cmH₂O
  peepProg?: number | null;      // cmH₂O (PEEP programada)
  peepTotal?: number | null;     // cmH₂O (medida com pausa expiratória)
  map?: number | null;           // cmH₂O
  vteMl?: number | null;         // mL (volume corrente expirado)
  vazamentoPct?: number | null;  // %
  fr?: number | null;            // irpm
  tiSeg?: number | null;         // s
  fluxoInspLmin?: number | null; // L/min (convertido para L/s no cálculo)
  modo?: string | null;
  emVmi: boolean;                // paciente em ventilação mecânica invasiva
  // Condições de validade confirmadas pelo profissional
  sinalSpo2Ok: boolean;          // curva pletismográfica e sinal da oximetria conferidos
  contemporaneos: boolean;       // PaO₂, FiO₂ e MAP são do mesmo momento
  pausaInspOk: boolean;          // pausa inspiratória adequada, sem esforço significativo
  pausaExpOk: boolean;           // pausa expiratória válida
  vteConfiavel: boolean;         // VTe confiável, vazamento não relevante
}

export type IndicadorKey =
  | 'pf' | 'sf' | 'io' | 'is_osi'
  | 'vte_kg' | 'vmin' | 'gradiente_co2' | 'te' | 'ie' | 'vd_vt'
  | 'dp' | 'cstat' | 'cdyn' | 'raw' | 'tau' | 'auto_peep';

export type Nivel = 'info' | 'atencao' | 'alerta';

export interface Aviso { nivel: Nivel; texto: string }

export interface Resultado {
  key: IndicadorKey;
  label: string;
  formula: string;          // fórmula geral (8.5)
  valor: number | null;     // null = não calculado
  exibicao: string;         // valor formatado com unidade, ou "—"
  valoresUsados: string;    // conta com os números usados (8.5)
  bloqueio: string | null;  // motivo de não ter calculado (8.4)
  avisos: Aviso[];
  extra?: Record<string, number | null>; // valores derivados (ex.: mL/kg/cmH₂O)
}

export type ClasseOxigenacao = 'sem_criterio' | 'leve_moderada' | 'grave';

// ── Formatação ──────────────────────────────────────────────────────────────
const arred = (n: number, casas: number) => Math.round(n * 10 ** casas) / 10 ** casas;
export const fmt = (n: number, casas = 1): string => String(arred(n, casas)).replace('.', ',');
const tem = (v: number | null | undefined): v is number => v != null && Number.isFinite(v);

const base = (key: IndicadorKey, label: string, formula: string): Resultado =>
  ({ key, label, formula, valor: null, exibicao: '—', valoresUsados: '', bloqueio: null, avisos: [] });

const bloqueado = (r: Resultado, motivo: string): Resultado => ({ ...r, bloqueio: motivo });

const faltam = (nomes: string[]) => `Falta informar: ${nomes.join(', ')}.`;

// ── Limiares ────────────────────────────────────────────────────────────────
// PALICC-2, criança em VMI com PEEP ≥ 5 cmH₂O. Mesmos valores de lib/pards.ts.
// ATENÇÃO: a especificação impressa arredonda o corte do IS para 12; o PALICC-2
// publicado e a calculadora de PARDS do app usam 12,3. Mantido 12,3 para as duas
// calculadoras não classificarem o mesmo paciente de formas diferentes.
export const LIMIAR = {
  io: { preenche: 4, grave: 16 },
  is: { preenche: 5, grave: 12.3 },
  peepMinimaPalicc: 5,
  spo2MaxIndice: 97,
  pplatAtencao: 28,   // > 28 até 32: sinalizar parede torácica e contexto
  pplatAlerta: 32,    // > 32: pressão elevada
  dpAlerta: 15,       // > 15: revisão da estratégia ventilatória
};

export const TEXTO_CLASSE: Record<ClasseOxigenacao, string> = {
  sem_criterio: 'Índice sem critério de PARDS.',
  leve_moderada: 'Índice compatível com comprometimento leve a moderado da oxigenação, desde que atendidos os demais critérios diagnósticos de PARDS.',
  grave: 'Índice compatível com comprometimento grave da oxigenação, desde que atendidos os demais critérios diagnósticos de PARDS.',
};

export function classificarIndice(tipo: 'io' | 'is', valor: number): ClasseOxigenacao {
  const l = LIMIAR[tipo];
  return valor >= l.grave ? 'grave' : valor >= l.preenche ? 'leve_moderada' : 'sem_criterio';
}

/** A classificação PALICC-2 por índice só vale em VMI com PEEP ≥ 5 cmH₂O. */
export function podeClassificar(e: EntradaCalc): string | null {
  if (!e.emVmi) return 'Classificação PALICC-2 por IO/IS vale apenas em ventilação mecânica invasiva.';
  if (!tem(e.peepProg)) return 'Informe a PEEP para classificar pelo PALICC-2.';
  if (e.peepProg < LIMIAR.peepMinimaPalicc) return 'Classificação PALICC-2 exige PEEP igual ou superior a 5 cmH₂O.';
  return null;
}

/** Peso usado nos cálculos por kg: ideal ou predito quando informado; senão o atual. */
export function pesoDeCalculo(e: EntradaCalc): { kg: number; origem: 'ideal' | 'atual' } | null {
  if (tem(e.pesoIdealKg) && e.pesoIdealKg > 0) return { kg: e.pesoIdealKg, origem: 'ideal' };
  if (tem(e.pesoKg) && e.pesoKg > 0) return { kg: e.pesoKg, origem: 'atual' };
  return null;
}

/** PEEP total para ΔP e complacências. Sem medida, usa a programada e avisa. */
function peepParaMecanica(e: EntradaCalc): { valor: number; medida: boolean } | null {
  if (tem(e.peepTotal)) return { valor: e.peepTotal, medida: true };
  if (tem(e.peepProg)) return { valor: e.peepProg, medida: false };
  return null;
}
const AVISO_PEEP_PROG: Aviso = { nivel: 'info', texto: 'PEEP total não informada: usada a PEEP programada, sem considerar auto-PEEP.' };

// ── 3. Oxigenação ───────────────────────────────────────────────────────────
function avisosSpo2(e: EntradaCalc): Aviso[] {
  const a: Aviso[] = [];
  if (tem(e.spo2) && !spo2Utilizavel(e.spo2)) a.push({ nivel: 'atencao', texto: `SpO₂ acima de ${LIMIAR.spo2MaxIndice}% discrimina mal a gravidade. Prefira o índice com SpO₂ igual ou inferior a ${LIMIAR.spo2MaxIndice}%.` });
  if (!e.sinalSpo2Ok) a.push({ nivel: 'atencao', texto: 'Confirme a curva pletismográfica e a qualidade do sinal da oximetria.' });
  return a;
}

export function calcOxigenacao(e: EntradaCalc): Resultado[] {
  const f = tem(e.fio2Pct) ? normalizarFio2(e.fio2Pct) : null;
  const semFio2 = tem(e.fio2Pct) && f == null ? 'FiO₂ fora da faixa de 21 a 100%.' : null;

  let pf = base('pf', 'Relação P/F', 'PaO₂ ÷ FiO₂');
  if (semFio2) pf = bloqueado(pf, semFio2);
  else if (!tem(e.pao2) || f == null) pf = bloqueado(pf, faltam([!tem(e.pao2) && 'PaO₂', f == null && 'FiO₂'].filter(Boolean) as string[]));
  else if (e.pao2 <= 0) pf = bloqueado(pf, 'PaO₂ deve ser maior que zero.');
  else { const i = calcPF(f, e.pao2); pf = { ...pf, valor: arred(i.valor, 0), exibicao: fmt(i.valor, 0), valoresUsados: `${fmt(e.pao2)} ÷ ${fmt(f, 2)}` }; }

  let sf = base('sf', 'Relação S/F', 'SpO₂ ÷ FiO₂');
  if (semFio2) sf = bloqueado(sf, semFio2);
  else if (!tem(e.spo2) || f == null) sf = bloqueado(sf, faltam([!tem(e.spo2) && 'SpO₂', f == null && 'FiO₂'].filter(Boolean) as string[]));
  else if (e.spo2 <= 0 || e.spo2 > 100) sf = bloqueado(sf, 'SpO₂ deve estar entre 1 e 100%.');
  else { const i = calcSF(f, e.spo2); sf = { ...sf, valor: arred(i.valor, 0), exibicao: fmt(i.valor, 0), valoresUsados: `${fmt(e.spo2)} ÷ ${fmt(f, 2)}`, avisos: avisosSpo2(e) }; }

  const travaClasse = podeClassificar(e);

  let io = base('io', 'Índice de oxigenação (IO)', 'FiO₂ × MAP × 100 ÷ PaO₂');
  if (semFio2) io = bloqueado(io, semFio2);
  else if (!tem(e.pao2) || !tem(e.map) || f == null) io = bloqueado(io, faltam([f == null && 'FiO₂', !tem(e.map) && 'MAP', !tem(e.pao2) && 'PaO₂'].filter(Boolean) as string[]));
  else if (e.pao2 <= 0) io = bloqueado(io, 'PaO₂ deve ser maior que zero.');
  else if (!e.contemporaneos) io = bloqueado(io, 'Confirme que PaO₂, FiO₂ e MAP são do mesmo momento. Não misture gasometria antiga com parâmetros atuais.');
  else {
    const i = calcIO(f, e.map, e.pao2);
    const avisos: Aviso[] = travaClasse ? [{ nivel: 'info', texto: travaClasse }] : [{ nivel: classificarIndice('io', i.valor) === 'sem_criterio' ? 'info' : 'atencao', texto: TEXTO_CLASSE[classificarIndice('io', i.valor)] }];
    io = { ...io, valor: arred(i.valor, 1), exibicao: fmt(i.valor, 1), valoresUsados: `${fmt(f, 2)} × ${fmt(e.map)} × 100 ÷ ${fmt(e.pao2)}`, avisos };
  }

  let is = base('is_osi', 'Índice de saturação (IS ou OSI)', 'FiO₂ × MAP × 100 ÷ SpO₂');
  if (semFio2) is = bloqueado(is, semFio2);
  else if (!tem(e.spo2) || !tem(e.map) || f == null) is = bloqueado(is, faltam([f == null && 'FiO₂', !tem(e.map) && 'MAP', !tem(e.spo2) && 'SpO₂'].filter(Boolean) as string[]));
  else if (e.spo2 <= 0 || e.spo2 > 100) is = bloqueado(is, 'SpO₂ deve estar entre 1 e 100%.');
  else {
    const i = calcISO(f, e.map, e.spo2);
    const avisos = avisosSpo2(e);
    if (travaClasse) avisos.push({ nivel: 'info', texto: travaClasse });
    else if (spo2Utilizavel(e.spo2)) { const c = classificarIndice('is', i.valor); avisos.push({ nivel: c === 'sem_criterio' ? 'info' : 'atencao', texto: TEXTO_CLASSE[c] }); }
    is = { ...is, valor: arred(i.valor, 1), exibicao: fmt(i.valor, 1), valoresUsados: `${fmt(f, 2)} × ${fmt(e.map)} × 100 ÷ ${fmt(e.spo2)}`, avisos };
  }

  return [pf, sf, io, is];
}

/** Classe PALICC-2 usada na síntese: IO quando disponível; senão IS com SpO₂ ≤ 97%. */
export function classeOxigenacao(e: EntradaCalc, rs: Resultado[]): ClasseOxigenacao | null {
  if (podeClassificar(e)) return null;
  const io = rs.find(r => r.key === 'io');
  if (io?.valor != null) return classificarIndice('io', io.valor);
  const is = rs.find(r => r.key === 'is_osi');
  if (is?.valor != null && tem(e.spo2) && spo2Utilizavel(e.spo2)) return classificarIndice('is', is.valor);
  return null;
}

// ── 4 e 5. Ventilação ───────────────────────────────────────────────────────
export function calcVentilacao(e: EntradaCalc): Resultado[] {
  const peso = pesoDeCalculo(e);
  const avisoVte: Aviso[] = e.vteConfiavel ? [] : [{ nivel: 'atencao', texto: 'VTe não confirmado como confiável. Com vazamento relevante ou tubo sem cuff, o VTe pode estar falsamente reduzido.' }];

  let vteKg = base('vte_kg', 'Volume corrente por peso (VTe/kg)', 'VTe ÷ peso ideal ou predito');
  if (!tem(e.vteMl) || !peso) vteKg = bloqueado(vteKg, faltam([!tem(e.vteMl) && 'VTe', !peso && 'peso'].filter(Boolean) as string[]));
  else {
    const v = e.vteMl / peso.kg;
    const avisos = [...avisoVte];
    if (peso.origem === 'atual') avisos.push({ nivel: 'info', texto: 'Calculado com o peso atual. Com obesidade ou edema importante, informe o peso ideal ou predito.' });
    vteKg = { ...vteKg, valor: arred(v, 1), exibicao: `${fmt(v, 1)} mL/kg`, valoresUsados: `${fmt(e.vteMl)} mL ÷ ${fmt(peso.kg, 2)} kg (peso ${peso.origem === 'ideal' ? 'ideal ou predito' : 'atual'})`, avisos };
  }

  let vmin = base('vmin', 'Ventilação minuto', 'VTe × FR');
  if (!tem(e.vteMl) || !tem(e.fr)) vmin = bloqueado(vmin, faltam([!tem(e.vteMl) && 'VTe', !tem(e.fr) && 'FR'].filter(Boolean) as string[]));
  else { const ml = e.vteMl * e.fr; vmin = { ...vmin, valor: arred(ml / 1000, 2), exibicao: `${fmt(ml / 1000, 2)} L/min (${fmt(ml, 0)} mL/min)`, valoresUsados: `${fmt(e.vteMl)} mL × ${fmt(e.fr)} irpm`, avisos: avisoVte }; }

  let grad = base('gradiente_co2', 'Gradiente PaCO₂–EtCO₂', 'PaCO₂ − EtCO₂');
  if (!tem(e.paco2) || !tem(e.etco2)) grad = bloqueado(grad, faltam([!tem(e.paco2) && 'PaCO₂', !tem(e.etco2) && 'EtCO₂'].filter(Boolean) as string[]));
  else { const g = e.paco2 - e.etco2; grad = { ...grad, valor: arred(g, 1), exibicao: `${fmt(g, 1)} mmHg`, valoresUsados: `${fmt(e.paco2)} − ${fmt(e.etco2)}` }; }

  let te = base('te', 'Tempo expiratório', '60 ÷ FR − Ti');
  let ie = base('ie', 'Relação I:E', 'Ti : tempo expiratório');
  if (!tem(e.fr) || !tem(e.tiSeg) || e.fr <= 0) {
    const m = faltam([!tem(e.fr) && 'FR', !tem(e.tiSeg) && 'Ti'].filter(Boolean) as string[]);
    te = bloqueado(te, tem(e.fr) && e.fr <= 0 ? 'FR deve ser maior que zero.' : m);
    ie = bloqueado(ie, tem(e.fr) && e.fr <= 0 ? 'FR deve ser maior que zero.' : m);
  } else {
    const t = 60 / e.fr - e.tiSeg;
    if (t <= 0 || e.tiSeg <= 0) {
      te = bloqueado(te, 'Ti incompatível com a FR informada: o ciclo não comporta esse tempo inspiratório.');
      ie = bloqueado(ie, 'Ti incompatível com a FR informada.');
    } else {
      te = { ...te, valor: arred(t, 2), exibicao: `${fmt(t, 2)} s`, valoresUsados: `60 ÷ ${fmt(e.fr)} − ${fmt(e.tiSeg, 2)}` };
      const razao = t / e.tiSeg;
      const texto = razao >= 1 ? `1:${fmt(razao, 1)}` : `${fmt(1 / razao, 1)}:1`;
      ie = { ...ie, valor: arred(razao, 2), exibicao: texto, valoresUsados: `${fmt(e.tiSeg, 2)} s : ${fmt(t, 2)} s`, avisos: razao < 1 ? [{ nivel: 'atencao', texto: 'Relação invertida: o tempo inspiratório é maior que o expiratório.' }] : [] };
    }
  }

  // Avançado: só com CO₂ expirado misto. EtCO₂ nunca substitui PECO₂ nesta fórmula.
  let vdvt = base('vd_vt', 'Espaço morto fisiológico (VD/VT)', '(PaCO₂ − PECO₂) ÷ PaCO₂');
  if (!tem(e.peco2)) vdvt = bloqueado(vdvt, 'Disponível apenas com CO₂ expirado misto (PECO₂). O EtCO₂ não substitui a PECO₂.');
  else if (!tem(e.paco2) || e.paco2 <= 0) vdvt = bloqueado(vdvt, faltam(['PaCO₂']));
  else { const v = (e.paco2 - e.peco2) / e.paco2; vdvt = { ...vdvt, valor: arred(v, 2), exibicao: fmt(v, 2), valoresUsados: `(${fmt(e.paco2)} − ${fmt(e.peco2)}) ÷ ${fmt(e.paco2)}` }; }

  return [vteKg, vmin, grad, te, ie, vdvt];
}

// ── 6. Mecânica respiratória ────────────────────────────────────────────────
export function calcMecanica(e: EntradaCalc): Resultado[] {
  const peep = peepParaMecanica(e);
  const peso = pesoDeCalculo(e);
  const avisoPeep = peep && !peep.medida ? [AVISO_PEEP_PROG] : [];

  let dp = base('dp', 'Driving pressure (ΔP)', 'Pplat − PEEP total');
  if (!tem(e.pplat) || !peep) dp = bloqueado(dp, faltam([!tem(e.pplat) && 'Pplat', !peep && 'PEEP'].filter(Boolean) as string[]));
  else if (e.pplat <= peep.valor) dp = bloqueado(dp, 'Pplat deve ser maior que a PEEP.');
  else {
    const v = e.pplat - peep.valor;
    const avisos = [...avisoPeep];
    if (v > LIMIAR.dpAlerta) avisos.push({ nivel: 'alerta', texto: `Driving pressure acima de ${LIMIAR.dpAlerta} cmH₂O: revisar a estratégia ventilatória.` });
    dp = { ...dp, valor: arred(v, 1), exibicao: `${fmt(v, 1)} cmH₂O`, valoresUsados: `${fmt(e.pplat)} − ${fmt(peep.valor)}`, avisos };
  }

  let cstat = base('cstat', 'Complacência estática (Cstat)', 'VTe ÷ (Pplat − PEEP total)');
  if (!tem(e.vteMl) || !tem(e.pplat) || !peep) cstat = bloqueado(cstat, faltam([!tem(e.vteMl) && 'VTe', !tem(e.pplat) && 'Pplat', !peep && 'PEEP'].filter(Boolean) as string[]));
  else if (e.pplat <= peep.valor) cstat = bloqueado(cstat, 'Pplat deve ser maior que a PEEP.');
  else if (!e.pausaInspOk) cstat = bloqueado(cstat, 'Confirme pausa inspiratória adequada e ausência de esforço significativo.');
  else if (!e.vteConfiavel) cstat = bloqueado(cstat, 'Confirme que o VTe é confiável e o vazamento não é relevante.');
  else {
    const v = e.vteMl / (e.pplat - peep.valor);
    const porKg = peso ? arred(v / peso.kg, 2) : null;
    cstat = { ...cstat, valor: arred(v, 1), exibicao: `${fmt(v, 1)} mL/cmH₂O${porKg != null ? ` (${fmt(porKg, 2)} mL/kg/cmH₂O)` : ''}`, valoresUsados: `${fmt(e.vteMl)} ÷ (${fmt(e.pplat)} − ${fmt(peep.valor)})`, avisos: avisoPeep, extra: { cstat_kg: porKg } };
  }

  let cdyn = base('cdyn', 'Complacência dinâmica (Cdyn)', 'VTe ÷ (PIP − PEEP total)');
  if (!tem(e.vteMl) || !tem(e.pip) || !peep) cdyn = bloqueado(cdyn, faltam([!tem(e.vteMl) && 'VTe', !tem(e.pip) && 'PIP', !peep && 'PEEP'].filter(Boolean) as string[]));
  else if (e.pip <= peep.valor) cdyn = bloqueado(cdyn, 'PIP deve ser maior que a PEEP.');
  else if (!e.vteConfiavel) cdyn = bloqueado(cdyn, 'Confirme que o VTe é confiável e o vazamento não é relevante.');
  else {
    const v = e.vteMl / (e.pip - peep.valor);
    cdyn = { ...cdyn, valor: arred(v, 1), exibicao: `${fmt(v, 1)} mL/cmH₂O`, valoresUsados: `${fmt(e.vteMl)} ÷ (${fmt(e.pip)} − ${fmt(peep.valor)})`, avisos: [...avisoPeep, { nivel: 'info', texto: 'Sofre influência da resistência das vias aéreas. Não equivale à complacência estática.' }] };
  }

  let raw = base('raw', 'Resistência das vias aéreas (Raw)', '(PIP − Pplat) ÷ fluxo inspiratório em L/s');
  if (!tem(e.pip) || !tem(e.pplat) || !tem(e.fluxoInspLmin)) raw = bloqueado(raw, faltam([!tem(e.pip) && 'PIP', !tem(e.pplat) && 'Pplat', !tem(e.fluxoInspLmin) && 'fluxo inspiratório'].filter(Boolean) as string[]));
  else if (e.fluxoInspLmin <= 0) raw = bloqueado(raw, 'Fluxo inspiratório deve ser maior que zero.');
  else if (e.pip < e.pplat) raw = bloqueado(raw, 'PIP não pode ser menor que a Pplat.');
  else if (!e.pausaInspOk) raw = bloqueado(raw, 'Confirme Pplat válida e ausência de interferência respiratória significativa.');
  else {
    const ls = e.fluxoInspLmin / 60;
    const v = (e.pip - e.pplat) / ls;
    raw = { ...raw, valor: arred(v, 1), exibicao: `${fmt(v, 1)} cmH₂O/L/s`, valoresUsados: `(${fmt(e.pip)} − ${fmt(e.pplat)}) ÷ ${fmt(ls, 3)} L/s (${fmt(e.fluxoInspLmin)} L/min)` };
  }

  let tau = base('tau', 'Constante de tempo (τ)', 'Raw × Cstat, com Cstat em L/cmH₂O');
  if (raw.valor == null || cstat.valor == null) tau = bloqueado(tau, 'Depende de Raw e de Cstat calculadas.');
  else {
    const v = raw.valor * (cstat.valor / 1000);
    tau = { ...tau, valor: arred(v, 2), exibicao: `${fmt(v, 2)} s`, valoresUsados: `${fmt(raw.valor)} × ${fmt(cstat.valor / 1000, 4)}`, avisos: [{ nivel: 'info', texto: `1 constante ≈ 63% do esvaziamento; 3 constantes (${fmt(v * 3, 2)} s) ≈ 95%; 5 constantes (${fmt(v * 5, 2)} s) ≈ 99%.` }] };
  }

  let auto = base('auto_peep', 'Auto-PEEP', 'PEEP total − PEEP programada');
  if (!tem(e.peepTotal) || !tem(e.peepProg)) auto = bloqueado(auto, faltam([!tem(e.peepTotal) && 'PEEP total', !tem(e.peepProg) && 'PEEP programada'].filter(Boolean) as string[]));
  else if (!e.pausaExpOk) auto = bloqueado(auto, 'Confirme pausa expiratória válida.');
  else if (e.peepTotal < e.peepProg) auto = bloqueado(auto, 'PEEP total não pode ser menor que a PEEP programada.');
  else {
    const v = e.peepTotal - e.peepProg;
    auto = { ...auto, valor: arred(v, 1), exibicao: `${fmt(v, 1)} cmH₂O`, valoresUsados: `${fmt(e.peepTotal)} − ${fmt(e.peepProg)}`, avisos: v > 0 ? [{ nivel: 'atencao', texto: 'Auto-PEEP presente. Verificar: retorno do fluxo expiratório a zero, tempo expiratório, obstrução ou broncoespasmo, frequência respiratória, volume corrente e sincronia.' }] : [] };
  }

  return [dp, cstat, cdyn, raw, tau, auto];
}

// ── 7. Painel de proteção pulmonar ──────────────────────────────────────────
export function avisosProtecao(e: EntradaCalc, mecanica: Resultado[]): Aviso[] {
  const a: Aviso[] = [];
  if (tem(e.pplat)) {
    if (e.pplat > LIMIAR.pplatAlerta) a.push({ nivel: 'alerta', texto: `Pplat acima de ${LIMIAR.pplatAlerta} cmH₂O: pressão elevada.` });
    else if (e.pplat > LIMIAR.pplatAtencao) a.push({ nivel: 'atencao', texto: 'Pplat de 29 a 32 cmH₂O: avaliar a parede torácica e o contexto clínico.' });
  }
  const dp = mecanica.find(r => r.key === 'dp');
  dp?.avisos.filter(x => x.nivel === 'alerta').forEach(x => a.push(x));
  return a;
}

// ── Conjunto completo ───────────────────────────────────────────────────────
export interface CalculoCompleto {
  oxigenacao: Resultado[];
  ventilacao: Resultado[];
  mecanica: Resultado[];
  protecao: Aviso[];
  classe: ClasseOxigenacao | null;
}

export function calcularTudo(e: EntradaCalc): CalculoCompleto {
  const oxigenacao = calcOxigenacao(e);
  const ventilacao = calcVentilacao(e);
  const mecanica = calcMecanica(e);
  return { oxigenacao, ventilacao, mecanica, protecao: avisosProtecao(e, mecanica), classe: classeOxigenacao(e, oxigenacao) };
}

/** Memória de cálculo gravada junto do registro (8.5): fórmula, valores e resultado. */
export function memoriaDeCalculo(c: CalculoCompleto) {
  return [...c.oxigenacao, ...c.ventilacao, ...c.mecanica]
    .filter(r => r.valor != null)
    .map(r => ({ indicador: r.key, formula: r.formula, valores: r.valoresUsados, resultado: r.exibicao }));
}

// ── 9. Síntese automática (rascunho sujeito à validação) ────────────────────
const juntar = (itens: string[]): string =>
  itens.length <= 1 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;

export function gerarSintese(e: EntradaCalc, c: CalculoCompleto, suporte: string): string {
  const achar = (k: IndicadorKey) => [...c.oxigenacao, ...c.ventilacao, ...c.mecanica].find(r => r.key === k);
  const frases: string[] = [`Paciente em ${suporte}.`];

  const oxi: string[] = [];
  const pf = achar('pf'); if (pf?.valor != null) oxi.push(`P/F ${pf.exibicao}`);
  const sf = achar('sf'); if (sf?.valor != null && pf?.valor == null) oxi.push(`S/F ${sf.exibicao}`);
  const io = achar('io'); if (io?.valor != null) oxi.push(`IO ${io.exibicao}`);
  const is = achar('is_osi'); if (is?.valor != null) oxi.push(`IS ${is.exibicao}`);
  if (oxi.length) {
    const compl = c.classe === 'leve_moderada' ? ', compatíveis com comprometimento leve a moderado da oxigenação, desde que atendidos os demais critérios de PARDS'
      : c.classe === 'grave' ? ', compatíveis com comprometimento grave da oxigenação, desde que atendidos os demais critérios de PARDS'
        : c.classe === 'sem_criterio' ? ', sem critério de PARDS pelo índice' : '';
    frases.push(`${juntar(oxi)}${compl}.`);
  }

  const mec: string[] = [];
  const vte = achar('vte_kg'); if (vte?.valor != null) mec.push(`VTe ${vte.exibicao}`);
  if (tem(e.pplat)) mec.push(`Pplat ${fmt(e.pplat)} cmH₂O`);
  const dp = achar('dp'); if (dp?.valor != null) mec.push(`driving pressure ${dp.exibicao}`);
  const cs = achar('cstat');
  if (cs?.valor != null) mec.push(cs.extra?.cstat_kg != null ? `complacência estática ${fmt(cs.extra.cstat_kg, 2)} mL/kg/cmH₂O` : `complacência estática ${fmt(cs.valor)} mL/cmH₂O`);
  const au = achar('auto_peep');
  if (au?.valor != null) mec.push(au.valor > 0 ? `auto-PEEP de ${au.exibicao}` : 'ausência de auto-PEEP mensurável');
  if (mec.length) { const s = juntar(mec); frases.push(`${s.charAt(0).toUpperCase()}${s.slice(1)}.`); }

  frases.push('Resultado sujeito à validação médica.');
  return frases.join(' ');
}

// ── Tendência: atual, anterior, melhor e pior nas últimas 24 horas ──────────
// Só indicadores com sentido clínico definido de melhor/pior.
export const TENDENCIA: { coluna: string; label: string; casas: number; maiorEMelhor: boolean }[] = [
  { coluna: 'pf', label: 'P/F', casas: 0, maiorEMelhor: true },
  { coluna: 'sf', label: 'S/F', casas: 0, maiorEMelhor: true },
  { coluna: 'io', label: 'IO', casas: 1, maiorEMelhor: false },
  { coluna: 'is_osi', label: 'IS', casas: 1, maiorEMelhor: false },
  { coluna: 'dp', label: 'Driving pressure', casas: 1, maiorEMelhor: false },
  { coluna: 'cstat_kg', label: 'Cstat por kg', casas: 2, maiorEMelhor: true },
];

export interface LinhaTendencia { label: string; atual: string; anterior: string; melhor: string; pior: string }

/** `registros` do mais recente para o mais antigo, cada um com criado_em e as colunas numéricas. */
export function tendencia24h(registros: Record<string, unknown>[], agora: Date = new Date()): LinhaTendencia[] {
  const limite = agora.getTime() - 24 * 60 * 60 * 1000;
  const janela = registros.filter(r => new Date(String(r.criado_em)).getTime() >= limite);
  return TENDENCIA.map(t => {
    const vals = janela.map(r => r[t.coluna]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    const f = (v: number | undefined) => (v == null ? '—' : fmt(v, t.casas));
    const melhor = vals.length ? (t.maiorEMelhor ? Math.max(...vals) : Math.min(...vals)) : undefined;
    const pior = vals.length ? (t.maiorEMelhor ? Math.min(...vals) : Math.max(...vals)) : undefined;
    return { label: t.label, atual: f(vals[0]), anterior: f(vals[1]), melhor: f(melhor), pior: f(pior) };
  }).filter(l => l.atual !== '—');
}
