/**
 * Meta energética da NPT — GER por Schofield × faixas por idade e fase clínica.
 * Protocolo de Nutrição Parenteral do Complexo Hospitalar Materno Infantil do
 * Maranhão (tabelas ESPGHAN 2018 + posicionamento neonatal para o prematuro).
 *
 * Fluxo: GER (Schofield) → faixa da idade × fase → meta recomendada.
 * Regra do teto: NA FASE AGUDA a meta não deve ultrapassar o GER de Schofield
 * (evitar sobrealimentação). Nas fases estável e recuperação a meta pode — e
 * costuma — ultrapassar o GER (anabolismo, crescimento e reparação de déficits),
 * então o Schofield aparece apenas como referência.
 *
 * Lógica pura, sem React (mesmo padrão de lib/gasometria.ts), para poder ser
 * conferida isoladamente.
 */

export type Sexo = 'M' | 'F';
export type FaseEnergetica = 'aguda' | 'estavel' | 'recuperacao';

/* ────────────────────────────────────────────────────────────
   GER pela equação de Schofield (kcal/dia)
   ──────────────────────────────────────────────────────────── */

const SCHOFIELD: { maxYears: number; label: string; M: (p: number) => number; F: (p: number) => number }[] = [
  { maxYears: 3, label: '0–3 anos', M: p => 59.5 * p - 30, F: p => 58.3 * p - 31 },
  { maxYears: 10, label: '3–10 anos', M: p => 22.7 * p + 504, F: p => 20.3 * p + 486 },
  { maxYears: Infinity, label: '10–18 anos', M: p => 17.7 * p + 658, F: p => 13.4 * p + 692 },
];

/** GER em kcal/dia. Retorna null sem sexo, idade ou peso válidos. */
export function schofieldGER(sexo: Sexo | null, ageYears: number | null, weightKg: number): { kcalDia: number; bandLabel: string } | null {
  if (!sexo || ageYears === null || ageYears < 0 || weightKg <= 0) return null;
  const band = SCHOFIELD.find(b => ageYears < b.maxYears) ?? SCHOFIELD[SCHOFIELD.length - 1];
  const kcalDia = band[sexo](weightKg);
  return kcalDia > 0 ? { kcalDia, bandLabel: band.label } : null;
}

/* ────────────────────────────────────────────────────────────
   Faixas energéticas por idade e fase (kcal/kg/dia)
   ──────────────────────────────────────────────────────────── */

export interface FaixaEnergia { min: number; max: number }

const FAIXAS_IDADE: { maxYears: number; label: string; ranges: Record<FaseEnergetica, FaixaEnergia> }[] = [
  { maxYears: 1, label: '0–1 ano', ranges: { aguda: { min: 45, max: 50 }, estavel: { min: 60, max: 65 }, recuperacao: { min: 75, max: 85 } } },
  { maxYears: 7, label: '1–7 anos', ranges: { aguda: { min: 40, max: 45 }, estavel: { min: 55, max: 60 }, recuperacao: { min: 65, max: 75 } } },
  { maxYears: 12, label: '7–12 anos', ranges: { aguda: { min: 30, max: 40 }, estavel: { min: 40, max: 55 }, recuperacao: { min: 55, max: 65 } } },
  { maxYears: Infinity, label: '12–18 anos', ranges: { aguda: { min: 20, max: 30 }, estavel: { min: 25, max: 40 }, recuperacao: { min: 30, max: 55 } } },
];

// Prematuro: energia parenteral pela fase (ESPGHAN 2018 + posicionamento neonatal).
// Mapeada nas 3 fases metabólicas do protocolo: aguda → aguda precoce,
// estável → aguda tardia/estabilização, recuperação → recuperação/crescimento.
const FAIXAS_PREMATURO: Record<FaseEnergetica, FaixaEnergia & { label: string }> = {
  aguda: { min: 40, max: 55, label: 'aguda precoce' },
  estavel: { min: 60, max: 80, label: 'aguda tardia / estabilização' },
  recuperacao: { min: 90, max: 120, label: 'recuperação / crescimento' },
};

/* ────────────────────────────────────────────────────────────
   Meta recomendada
   ──────────────────────────────────────────────────────────── */

export interface MetaEnergetica {
  hasData: boolean;
  /** GER de Schofield em kcal/dia (null p/ prematuro ou sem sexo/idade) */
  gerKcalDia: number | null;
  gerKcalKgDia: number | null;
  gerBandLabel: string | null;
  /** Faixa bruta da tabela idade × fase (kcal/kg/d) */
  faixa: FaixaEnergia | null;
  faixaLabel: string;
  /** Meta final recomendada (kcal/kg/d), já com a regra do teto na fase aguda */
  meta: FaixaEnergia | null;
  capadaPeloGER: boolean;
  isPreterm: boolean;
  avisos: string[];
}

export function calcularMetaEnergetica(params: {
  sexo: Sexo | null;
  ageDays: number | null;
  weight: number;
  fase: FaseEnergetica;
  isPreterm: boolean;
}): MetaEnergetica {
  const { sexo, ageDays, weight, fase, isPreterm } = params;
  const avisos: string[] = [];

  const vazio: MetaEnergetica = {
    hasData: false, gerKcalDia: null, gerKcalKgDia: null, gerBandLabel: null,
    faixa: null, faixaLabel: '', meta: null, capadaPeloGER: false, isPreterm, avisos,
  };

  if (weight <= 0) {
    avisos.push('Informe o peso para calcular a meta energética.');
    return vazio;
  }

  // Prematuro: tabela própria; Schofield não se aplica.
  if (isPreterm) {
    const f = FAIXAS_PREMATURO[fase];
    avisos.push('Prematuro: meta pela tabela de energia parenteral do prematuro — a equação de Schofield não se aplica.');
    return {
      hasData: true, gerKcalDia: null, gerKcalKgDia: null, gerBandLabel: null,
      faixa: { min: f.min, max: f.max }, faixaLabel: `prematuro · fase ${f.label}`,
      meta: { min: f.min, max: f.max }, capadaPeloGER: false, isPreterm: true, avisos,
    };
  }

  if (ageDays === null || ageDays < 0) {
    avisos.push('Informe a data de nascimento para localizar a faixa etária.');
    return vazio;
  }

  const ageYears = ageDays / 365.25;
  const banda = FAIXAS_IDADE.find(b => ageYears < b.maxYears) ?? FAIXAS_IDADE[FAIXAS_IDADE.length - 1];
  const faixa = banda.ranges[fase];

  const ger = schofieldGER(sexo, ageYears, weight);
  if (!ger) avisos.push('Informe o sexo para calcular o GER de Schofield.');
  const gerKcalKgDia = ger ? ger.kcalDia / weight : null;

  // Regra do teto: só na fase aguda a meta é limitada pelo GER.
  let meta: FaixaEnergia = { ...faixa };
  let capadaPeloGER = false;
  if (fase === 'aguda' && gerKcalKgDia !== null && gerKcalKgDia < faixa.max) {
    capadaPeloGER = true;
    meta = { min: Math.min(faixa.min, gerKcalKgDia), max: gerKcalKgDia };
    avisos.push(`Fase aguda: não ultrapassar o GER de Schofield (${gerKcalKgDia.toFixed(0)} kcal/kg/d) — teto aplicado à meta.`);
  }

  return {
    hasData: true,
    gerKcalDia: ger?.kcalDia ?? null,
    gerKcalKgDia,
    gerBandLabel: ger?.bandLabel ?? null,
    faixa, faixaLabel: banda.label,
    meta, capadaPeloGER, isPreterm: false, avisos,
  };
}

/* ────────────────────────────────────────────────────────────
   Avaliação da oferta calculada contra a meta
   ──────────────────────────────────────────────────────────── */

export type OfertaStatus = 'dentro' | 'abaixo' | 'acima';

export interface OfertaAvaliacao {
  hasData: boolean;
  kcalKgDia: number;
  status: OfertaStatus;
}

/** Compara as calorias totais entregues (kcal/dia, incluindo proteína) com a meta. */
export function avaliarOferta(totalCalories: number, weight: number, meta: FaixaEnergia | null): OfertaAvaliacao {
  if (weight <= 0 || totalCalories <= 0 || !meta) {
    return { hasData: false, kcalKgDia: 0, status: 'dentro' };
  }
  const kcalKgDia = totalCalories / weight;
  // Limites inclusivos, avaliados sobre o valor arredondado exibido na tela
  const v = Math.round(kcalKgDia * 10) / 10;
  const status: OfertaStatus = v > Math.round(meta.max * 10) / 10 ? 'acima' : v < Math.round(meta.min * 10) / 10 ? 'abaixo' : 'dentro';
  return { hasData: true, kcalKgDia, status };
}
