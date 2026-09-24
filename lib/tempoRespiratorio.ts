// ============================================================================
// Constante de tempo e cálculo do Ti — Round eletrônico da UTI Pediátrica
// Fonte: "Constante de tempo e cálculo do Ti: referência pediátrica para o Round".
// Referências: Kneyber MCJ, et al. Intensive Care Med. 2017;43:1764-1780;
// Chakkarapani AA, et al. Int J Pediatr Adolesc Med. 2020;7:13-18;
// Park JD. Korean J Pediatr. 2005;48(12):1310-1316; Depta F, et al. Crit Care. 2025.
//
// Lógica pura, sem React nem Supabase. A interface fica em components/.
//
// Princípio da spec: a constante de tempo deve vir da resistência e da complacência
// do paciente. A faixa etária é só uma sugestão inicial, usada enquanto não houver
// mecânica medida, e nunca um limite diagnóstico.
// ============================================================================

const arred = (n: number, casas: number) => Math.round(n * 10 ** casas) / 10 ** casas;
const tem = (v: number | null | undefined): v is number => v != null && Number.isFinite(v);

export type FaixaEtaria = 'prematuro_sdr' | 'rn_termo' | 'lactente' | 'crianca' | 'adolescente';

// Tabela de referência aproximada (item 2). Ti = 3 τ.
export const FAIXAS_TAU: { key: FaixaEtaria; label: string; tauMin: number; tauMax: number }[] = [
  { key: 'prematuro_sdr', label: 'Prematuro com SDR e baixa complacência', tauMin: 0.05, tauMax: 0.10 },
  { key: 'rn_termo', label: 'Recém-nascido de termo com mecânica preservada', tauMin: 0.12, tauMax: 0.20 },
  { key: 'lactente', label: 'Lactente', tauMin: 0.15, tauMax: 0.25 },
  { key: 'crianca', label: 'Criança após o primeiro ano', tauMin: 0.15, tauMax: 0.20 },
  { key: 'adolescente', label: 'Adolescente', tauMin: 0.15, tauMax: 0.20 },
];

/** Faixa etária pela idade em meses. Prematuro com SDR é marcação manual, não vem da idade. */
export function faixaEtariaPorIdade(idadeMeses: number | null | undefined, prematuroSdr = false): FaixaEtaria | null {
  if (prematuroSdr) return 'prematuro_sdr';
  if (!tem(idadeMeses) || idadeMeses < 0) return null;
  if (idadeMeses < 1) return 'rn_termo';
  if (idadeMeses < 12) return 'lactente';
  if (idadeMeses < 144) return 'crianca';   // 1 a 12 anos
  return 'adolescente';
}

/** Idade em meses a partir da data de nascimento (ISO). */
export function idadeEmMeses(dob: string | null | undefined, agora: Date = new Date()): number | null {
  if (!dob) return null;
  const n = new Date(dob.includes('T') ? dob : `${dob}T00:00:00`);
  if (!Number.isFinite(n.getTime())) return null;
  const meses = (agora.getFullYear() - n.getFullYear()) * 12 + (agora.getMonth() - n.getMonth())
    - (agora.getDate() < n.getDate() ? 1 : 0);
  return meses >= 0 ? meses : null;
}

// ── Item 1: constante de tempo ──────────────────────────────────────────────
/** τ = R × C. R em cmH₂O/L/s e C em mL/cmH₂O (convertida para L/cmH₂O dividindo por 1000). */
export function calcTau(rawCmH2OLs: number | null | undefined, cstatMlCmH2O: number | null | undefined): number | null {
  if (!tem(rawCmH2OLs) || !tem(cstatMlCmH2O) || rawCmH2OLs <= 0 || cstatMlCmH2O <= 0) return null;
  return arred(rawCmH2OLs * (cstatMlCmH2O / 1000), 3);
}

// ── Item 3: relação entre constante de tempo e volume ───────────────────────
export const ESVAZIAMENTO: { constantes: number; pct: number }[] = [
  { constantes: 1, pct: 63 }, { constantes: 2, pct: 86 }, { constantes: 3, pct: 95 },
  { constantes: 4, pct: 98 }, { constantes: 5, pct: 99 },
];

// ── Itens 4 e 5: Ti, Te e I:E ───────────────────────────────────────────────
/** Ti estimado = 3 × τ inspiratória. É referência fisiológica, não prescrição. */
export const tiEstimado = (tau: number | null | undefined): number | null =>
  tem(tau) && tau > 0 ? arred(3 * tau, 2) : null;

/** Tempo total do ciclo = 60 ÷ FR. */
export const tempoTotalCiclo = (fr: number | null | undefined): number | null =>
  tem(fr) && fr > 0 ? arred(60 / fr, 3) : null;

/** Te = tempo total do ciclo − Ti. */
export function calcTe(fr: number | null | undefined, ti: number | null | undefined): number | null {
  const ttotal = tempoTotalCiclo(fr);
  if (ttotal == null || !tem(ti) || ti <= 0) return null;
  return arred(ttotal - ti, 3);
}

/** I:E como razão Te ÷ Ti. Texto "1:2,3" quando Te ≥ Ti; "1,5:1" quando invertida. */
export function calcIE(ti: number | null | undefined, te: number | null | undefined): { razao: number; texto: string } | null {
  if (!tem(ti) || !tem(te) || ti <= 0 || te <= 0) return null;
  const razao = arred(te / ti, 2);
  const f = (n: number) => String(arred(n, 1)).replace('.', ',');
  return { razao, texto: razao >= 1 ? `1:${f(razao)}` : `${f(1 / razao)}:1` };
}

// ── Item 7: regra para o tempo expiratório ──────────────────────────────────
/** Te mínimo: 3 τ expiratórias; na OVAI, 4 τ (piso da faixa de 4 a 5 τ da spec). */
export function teMinimo(tauExp: number | null | undefined, ovai = false): number | null {
  if (!tem(tauExp) || tauExp <= 0) return null;
  return arred((ovai ? 4 : 3) * tauExp, 2);
}

/** Teto da faixa recomendada na OVAI (5 τ). Fora da OVAI a spec não define teto. */
export function teMinimoMax(tauExp: number | null | undefined, ovai = false): number | null {
  if (!ovai || !tem(tauExp) || tauExp <= 0) return null;
  return arred(5 * tauExp, 2);
}

export interface CicloEstimado {
  tau: number | null;
  tauExp: number | null;         // τ expiratória: própria quando há resistência expiratória, senão = τ
  tauExpPropria: boolean;        // true = calculada com resistência expiratória medida
  tiEstimado: number | null;
  tempoTotal: number | null;
  te: number | null;
  ie: { razao: number; texto: string } | null;
  teMinimo: number | null;
  teMinimoMax: number | null;    // só na OVAI (5 τ)
  cabeNoCiclo: boolean | null;   // false = Ti estimado não cabe no ciclo da FR atual
}

/**
 * Cálculo completo do item 5, a partir da mecânica medida.
 * `tauExp` separa a constante expiratória quando houver resistência expiratória própria.
 */
export function calcCiclo(
  raw: number | null | undefined,
  cstatMl: number | null | undefined,
  fr: number | null | undefined,
  opts: { ovai?: boolean; rawExp?: number | null } = {},
): CicloEstimado {
  const tau = calcTau(raw, cstatMl);
  const tauExpPropria = calcTau(opts.rawExp, cstatMl);
  const tauExp = tauExpPropria ?? tau;
  const ti = tiEstimado(tau);
  const tempoTotal = tempoTotalCiclo(fr);
  const te = calcTe(fr, ti);
  return {
    tau, tauExp, tauExpPropria: tauExpPropria != null,
    tiEstimado: ti, tempoTotal, te,
    ie: calcIE(ti, te),
    teMinimo: teMinimo(tauExp, opts.ovai),
    teMinimoMax: teMinimoMax(tauExp, opts.ovai),
    cabeNoCiclo: ti != null && tempoTotal != null ? ti < tempoTotal : null,
  };
}
