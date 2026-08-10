/**
 * Critérios de PARDS — PALICC-2 (2023).
 * Guia clínico do Hospital Infantil Dr. Juvêncio Mattos, baseado em
 * Emeriaud G, et al. Pediatric Critical Care Medicine. 2023;24(2):143-168.
 *
 * Lógica pura, sem React nem Supabase (mesmo padrão de lib/gasometria.ts).
 * A interface fica em components/PARDSCalculator.tsx.
 */

/* ────────────────────────────────────────────────────────────
   1. Critérios gerais obrigatórios
   ──────────────────────────────────────────────────────────── */

export const CRITERIOS_GERAIS = [
  { key: 'temporalidade', label: 'Início em até 7 dias após insulto clínico conhecido' },
  { key: 'imagem', label: 'Nova opacidade uni ou bilateral, não explicada apenas por derrame, atelectasia, massa ou nódulo' },
  { key: 'edema', label: 'Insuficiência respiratória não explicada completamente por falência cardíaca ou sobrecarga hídrica' },
  { key: 'nao_perinatal', label: 'Não é doença pulmonar exclusivamente perinatal' },
  { key: 'nao_vias_aereas', label: 'Não decorre exclusivamente de doença de vias aéreas (asma/bronquiolite sem acometimento parenquimatoso)' },
] as const;

export type CriterioKey = (typeof CRITERIOS_GERAIS)[number]['key'];

/* ────────────────────────────────────────────────────────────
   2. Suporte respiratório
   ──────────────────────────────────────────────────────────── */

export type Suporte = 'vmi' | 'vni_facial' | 'cnaf_nasal' | 'o2';

export const SUPORTES: { id: Suporte; label: string; detalhe: string }[] = [
  { id: 'vmi', label: 'VM invasiva', detalhe: 'Gravidade classificada ≥ 4 h após o diagnóstico inicial' },
  { id: 'vni_facial', label: 'VNI facial total', detalhe: 'CPAP ou BiPAP com CPAP/PEEP ≥ 5 cmH₂O — permite diagnóstico formal' },
  { id: 'cnaf_nasal', label: 'CNAF ou VNI nasal', detalhe: 'CNAF ≥ 1,5 L/kg/min ou ≥ 30 L/min — classifica como possível PARDS' },
  { id: 'o2', label: 'O₂ suplementar (baixo fluxo)', detalhe: 'Para manter SpO₂ ≥ 88% — avalia risco de PARDS' },
];

/* ────────────────────────────────────────────────────────────
   Índices de oxigenação
   ──────────────────────────────────────────────────────────── */

export type IndiceTipo = 'IO' | 'ISO' | 'PF' | 'SF';

export const INDICE_LABEL: Record<IndiceTipo, string> = {
  IO: 'Índice de oxigenação (IO)',
  ISO: 'Índice de saturação de oxigênio (ISO)',
  PF: 'PaO₂/FiO₂',
  SF: 'SpO₂/FiO₂',
};

/** Normaliza FiO₂ para fração decimal: aceita 40 (%) ou 0,40. */
export function normalizarFio2(fio2: number): number | null {
  const f = fio2 > 1 ? fio2 / 100 : fio2;
  return f >= 0.21 && f <= 1 ? f : null;
}

/** SpO₂ só entra em índice de saturação quando ≤ 97% (seção 6 do guia). */
export const spo2Utilizavel = (spo2: number): boolean => spo2 <= 97;

export interface Indice {
  tipo: IndiceTipo;
  valor: number;
  formula: string;
}

export function calcIO(fio2: number, pam: number, pao2: number): Indice {
  const valor = (fio2 * pam * 100) / pao2;
  return { tipo: 'IO', valor, formula: `IO = (${fio2.toFixed(2)} × ${pam} × 100) ÷ ${pao2} = ${valor.toFixed(1)}` };
}

export function calcISO(fio2: number, pam: number, spo2: number): Indice {
  const valor = (fio2 * pam * 100) / spo2;
  return { tipo: 'ISO', valor, formula: `ISO = (${fio2.toFixed(2)} × ${pam} × 100) ÷ ${spo2} = ${valor.toFixed(1)}` };
}

export function calcPF(fio2: number, pao2: number): Indice {
  const valor = pao2 / fio2;
  return { tipo: 'PF', valor, formula: `P/F = ${pao2} ÷ ${fio2.toFixed(2)} = ${valor.toFixed(0)}` };
}

export function calcSF(fio2: number, spo2: number): Indice {
  const valor = spo2 / fio2;
  return { tipo: 'SF', valor, formula: `S/F = ${spo2} ÷ ${fio2.toFixed(2)} = ${valor.toFixed(0)}` };
}

/* ────────────────────────────────────────────────────────────
   Classificação PALICC-2
   ──────────────────────────────────────────────────────────── */

export type Classificacao =
  | 'pards_grave'
  | 'pards_leve_moderada'
  | 'pards_vni'            // PARDS em VNI facial (gravidade conforme tabela do guia)
  | 'possivel_pards'
  | 'em_risco'
  | 'sem_criterios'
  | 'nao_classificavel';

export const CLASSIFICACAO_LABEL: Record<Classificacao, string> = {
  pards_grave: 'PARDS grave',
  pards_leve_moderada: 'PARDS leve/moderada',
  pards_vni: 'PARDS (em VNI facial)',
  possivel_pards: 'Possível PARDS',
  em_risco: 'Em risco de PARDS',
  sem_criterios: 'Critérios de oxigenação não preenchidos',
  nao_classificavel: 'Não classificável',
};

export interface Entrada {
  suporte: Suporte;
  fio2: number;          // fração decimal já normalizada
  pam?: number | null;   // pressão média das vias aéreas (VMI)
  peep?: number | null;  // CPAP/PEEP (VNI facial)
  pao2?: number | null;
  spo2?: number | null;
  o2ParaSpo288?: boolean; // suporte 'o2': precisa de O₂ para manter SpO₂ ≥ 88%
}

export interface Resultado {
  classificacao: Classificacao;
  label: string;
  indice: Indice | null;
  avisos: string[];
  descricao: string;
}

/**
 * Classifica pela tabela do resumo operacional do guia.
 * Pressupõe critérios gerais preenchidos (a UI valida antes).
 */
export function classificarPARDS(e: Entrada): Resultado {
  const avisos: string[] = [];
  const temPao2 = e.pao2 != null && e.pao2 > 0;
  const spo2Ok = e.spo2 != null && e.spo2 > 0 && spo2Utilizavel(e.spo2);
  if (e.spo2 != null && e.spo2 > 97) {
    avisos.push('SpO₂ > 97%: índices de saturação não são válidos — reduza a FiO₂, quando seguro, e meça em estado estável.');
  }

  if (e.suporte === 'vmi') {
    // Preferir IO quando houver PaO₂ (índice de referência do PALICC-2)
    if (!e.pam || e.pam <= 0) {
      return { classificacao: 'nao_classificavel', label: CLASSIFICACAO_LABEL.nao_classificavel, indice: null, avisos: [...avisos, 'Informe a pressão média das vias aéreas para calcular IO/ISO.'], descricao: '' };
    }
    let indice: Indice | null = null;
    if (temPao2) indice = calcIO(e.fio2, e.pam, e.pao2!);
    else if (spo2Ok) indice = calcISO(e.fio2, e.pam, e.spo2!);
    if (!indice) {
      return { classificacao: 'nao_classificavel', label: CLASSIFICACAO_LABEL.nao_classificavel, indice: null, avisos: [...avisos, 'Informe PaO₂ (preferencial) ou SpO₂ ≤ 97% para calcular o índice.'], descricao: '' };
    }
    const grave = indice.tipo === 'IO' ? indice.valor >= 16 : indice.valor >= 12.3;
    const preenche = indice.tipo === 'IO' ? indice.valor >= 4 : indice.valor >= 5;
    if (!preenche) {
      return { classificacao: 'sem_criterios', label: CLASSIFICACAO_LABEL.sem_criterios, indice, avisos, descricao: `${INDICE_LABEL[indice.tipo]} abaixo do limiar de PARDS em VM invasiva (IO ≥ 4 / ISO ≥ 5). Reavaliar evolução e considerar risco de PARDS.` };
    }
    const c: Classificacao = grave ? 'pards_grave' : 'pards_leve_moderada';
    return { classificacao: c, label: CLASSIFICACAO_LABEL[c], indice, avisos: [...avisos, 'Classificar a gravidade ≥ 4 horas após o diagnóstico inicial.'], descricao: grave ? `${indice.tipo} ≥ ${indice.tipo === 'IO' ? '16' : '12,3'}: PARDS grave.` : `${indice.tipo} na faixa ${indice.tipo === 'IO' ? '4 a < 16' : '5 a < 12,3'}: PARDS leve/moderada.` };
  }

  if (e.suporte === 'vni_facial') {
    if (e.peep != null && e.peep < 5) {
      avisos.push('CPAP/PEEP < 5 cmH₂O: não permite o diagnóstico formal de PARDS em VNI — avaliar como possível PARDS ou risco.');
      return { classificacao: 'nao_classificavel', label: CLASSIFICACAO_LABEL.nao_classificavel, indice: null, avisos, descricao: 'Ajuste o suporte (CPAP/PEEP ≥ 5) ou classifique pela via de CNAF/VNI nasal.' };
    }
    let indice: Indice | null = null;
    if (temPao2) indice = calcPF(e.fio2, e.pao2!);
    else if (spo2Ok) indice = calcSF(e.fio2, e.spo2!);
    if (!indice) {
      return { classificacao: 'nao_classificavel', label: CLASSIFICACAO_LABEL.nao_classificavel, indice: null, avisos: [...avisos, 'Informe PaO₂ (preferencial) ou SpO₂ ≤ 97%.'], descricao: '' };
    }
    const limite = indice.tipo === 'PF' ? 300 : 250;
    const limiteGrave = indice.tipo === 'PF' ? 100 : 150;
    if (indice.valor > limite) {
      return { classificacao: 'sem_criterios', label: CLASSIFICACAO_LABEL.sem_criterios, indice, avisos, descricao: `${INDICE_LABEL[indice.tipo]} > ${limite}: não preenche critério de oxigenação para PARDS em VNI facial.` };
    }
    const grave = indice.valor <= limiteGrave;
    const c: Classificacao = grave ? 'pards_grave' : 'pards_leve_moderada';
    return { classificacao: c, label: `${CLASSIFICACAO_LABEL[c]} (VNI facial)`, indice, avisos, descricao: grave ? `${indice.tipo} ≤ ${limiteGrave}: PARDS grave em VNI facial.` : `${indice.tipo} entre ${limiteGrave} e ${limite}: PARDS leve/moderada em VNI facial.` };
  }

  if (e.suporte === 'cnaf_nasal') {
    let indice: Indice | null = null;
    if (temPao2) indice = calcPF(e.fio2, e.pao2!);
    else if (spo2Ok) indice = calcSF(e.fio2, e.spo2!);
    if (!indice) {
      return { classificacao: 'nao_classificavel', label: CLASSIFICACAO_LABEL.nao_classificavel, indice: null, avisos: [...avisos, 'Informe PaO₂ (preferencial) ou SpO₂ ≤ 97%.'], descricao: '' };
    }
    const limite = indice.tipo === 'PF' ? 300 : 250;
    if (indice.valor > limite) {
      return { classificacao: 'sem_criterios', label: CLASSIFICACAO_LABEL.sem_criterios, indice, avisos, descricao: `${INDICE_LABEL[indice.tipo]} > ${limite}: não preenche critério de oxigenação. Avaliar risco de PARDS se usa O₂ para manter SpO₂ ≥ 88%.` };
    }
    return { classificacao: 'possivel_pards', label: CLASSIFICACAO_LABEL.possivel_pards, indice, avisos: [...avisos, 'Alto fluxo e VNI nasal não configuram PARDS formal no PALICC-2.'], descricao: `${indice.tipo} ≤ ${limite} em CNAF/VNI nasal: possível PARDS. Reavaliar se houver escalonamento de suporte.` };
  }

  // O₂ suplementar em baixo fluxo
  if (e.o2ParaSpo288) {
    return { classificacao: 'em_risco', label: CLASSIFICACAO_LABEL.em_risco, indice: null, avisos, descricao: 'Necessita O₂ suplementar para manter SpO₂ ≥ 88% sem preencher critérios de PARDS ou possível PARDS: paciente em risco de PARDS — vigiar evolução.' };
  }
  return { classificacao: 'sem_criterios', label: CLASSIFICACAO_LABEL.sem_criterios, indice: null, avisos, descricao: 'Sem necessidade de O₂ para manter SpO₂ ≥ 88%: não preenche critérios de risco de PARDS.' };
}

/* ────────────────────────────────────────────────────────────
   Situações especiais (seção 7)
   ──────────────────────────────────────────────────────────── */

export const SITUACOES_ESPECIAIS = [
  { condicao: 'Cardiopatia congênita cianótica', regra: 'Deterioração aguda da oxigenação não explicada pela cardiopatia de base.' },
  { condicao: 'Doença pulmonar crônica', regra: 'Deterioração aguda em relação ao basal, com nova alteração radiológica.' },
  { condicao: 'Disfunção ventricular esquerda', regra: 'PARDS pode coexistir se a piora respiratória não for totalmente explicada pela disfunção cardíaca.' },
] as const;
