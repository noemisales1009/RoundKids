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
   Banda da meta energética por fase (fluxo top-down do protocolo)

   Regras validadas com a equipe em 2026-08-19:
   - AGUDA: faixa da idade CORTADA no GER (meta igual ou abaixo do GER)
   - ESTÁVEL: alvo = GER exato (a faixa da tabela vira só referência)
   - RECUPERAÇÃO: faixa da idade, PODE ultrapassar o GER (anabolismo)
   - PREMATURO: tabela própria, sem Schofield
   ──────────────────────────────────────────────────────────── */

export type MetaModo = 'faixa_capada_ger' | 'ger_fixo' | 'faixa_livre' | 'prematuro' | 'indisponivel';

export interface MetaBanda {
  hasData: boolean;
  modo: MetaModo;
  /** Banda selecionável do alvo (kcal/kg/d); em ger_fixo min = max = GER */
  band: FaixaEnergia | null;
  gerKcalDia: number | null;
  gerKcalKgDia: number | null;
  gerBandLabel: string | null;
  /** Faixa bruta da tabela idade × fase, para referência visual */
  faixa: FaixaEnergia | null;
  faixaLabel: string;
  capadaPeloGER: boolean;
  isPreterm: boolean;
  avisos: string[];
}

export function metaBanda(params: {
  sexo: Sexo | null;
  ageDays: number | null;
  weight: number;
  fase: FaseEnergetica;
  isPreterm: boolean;
}): MetaBanda {
  const { sexo, ageDays, weight, fase, isPreterm } = params;
  const avisos: string[] = [];

  const vazio: MetaBanda = {
    hasData: false, modo: 'indisponivel', band: null,
    gerKcalDia: null, gerKcalKgDia: null, gerBandLabel: null,
    faixa: null, faixaLabel: '', capadaPeloGER: false, isPreterm, avisos,
  };

  if (weight <= 0) {
    avisos.push('Informe o peso para calcular a meta energética.');
    return vazio;
  }

  if (isPreterm) {
    const f = FAIXAS_PREMATURO[fase];
    avisos.push('Prematuro: meta pela tabela de energia parenteral do prematuro — a equação de Schofield não se aplica.');
    return {
      hasData: true, modo: 'prematuro', band: { min: f.min, max: f.max },
      gerKcalDia: null, gerKcalKgDia: null, gerBandLabel: null,
      faixa: { min: f.min, max: f.max }, faixaLabel: `prematuro · fase ${f.label}`,
      capadaPeloGER: false, isPreterm: true, avisos,
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
  const gerKcalKgDia = ger ? ger.kcalDia / weight : null;

  const base: Omit<MetaBanda, 'modo' | 'band' | 'capadaPeloGER'> = {
    hasData: true,
    gerKcalDia: ger?.kcalDia ?? null,
    gerKcalKgDia,
    gerBandLabel: ger?.bandLabel ?? null,
    faixa, faixaLabel: banda.label,
    isPreterm: false, avisos,
  };

  if (fase === 'estavel') {
    // Alvo = GER exato; sem sexo não há GER — cai na faixa da tabela com aviso forte
    if (gerKcalKgDia !== null) {
      return { ...base, modo: 'ger_fixo', band: { min: gerKcalKgDia, max: gerKcalKgDia }, capadaPeloGER: false };
    }
    avisos.push('Fase estável: o alvo é o GER de Schofield — informe o sexo. Usando a faixa da tabela provisoriamente.');
    return { ...base, modo: 'faixa_livre', band: { ...faixa }, capadaPeloGER: false };
  }

  if (fase === 'aguda') {
    if (gerKcalKgDia !== null && gerKcalKgDia < faixa.max) {
      avisos.push(`Fase aguda: meta igual ou abaixo do GER de Schofield (${gerKcalKgDia.toFixed(0)} kcal/kg/d) — teto aplicado.`);
      return {
        ...base, modo: 'faixa_capada_ger',
        band: { min: Math.min(faixa.min, gerKcalKgDia), max: gerKcalKgDia },
        capadaPeloGER: true,
      };
    }
    if (gerKcalKgDia === null) avisos.push('Informe o sexo para aplicar o teto do GER na fase aguda.');
    return { ...base, modo: 'faixa_capada_ger', band: { ...faixa }, capadaPeloGER: false };
  }

  // Recuperação: faixa da idade, pode ultrapassar o GER (anabolismo/crescimento)
  return { ...base, modo: 'faixa_livre', band: { ...faixa }, capadaPeloGER: false };
}

/* ────────────────────────────────────────────────────────────
   Relação CNP/gN derivada (indicador de qualidade, não alavanca)

   ratio = CNP/N, com CNP = M − 4g e N = g/6,25  →  ratio = 6,25·M/g − 25
   Invertendo: g = 6,25·M/(ratio + 25) — usada para sugerir a dose de
   proteína que leva a relação para dentro da faixa do perfil clínico.
   ──────────────────────────────────────────────────────────── */

/** Gramas de aminoácido que produzem a relação alvo, dada a meta total (kcal/dia). */
export function gramasParaRelacao(metaKcalDia: number, relacaoAlvo: number): number | null {
  if (metaKcalDia <= 0 || relacaoAlvo <= -25) return null;
  const g = (6.25 * metaKcalDia) / (relacaoAlvo + 25);
  return g > 0 ? g : null;
}
