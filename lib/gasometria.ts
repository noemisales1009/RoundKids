/**
 * Análise sistemática da gasometria arterial.
 * Protocolo do Hospital Infantil Dr. Juvêncio Mattos — seções 1 a 7.
 *
 * Lógica pura, sem React nem Supabase, para poder ser conferida isoladamente.
 * A interface fica em components/GasometriaCalculator.tsx.
 */

/* ────────────────────────────────────────────────────────────
   Seção 1 — Referências e tabela pH → [H⁺]
   ──────────────────────────────────────────────────────────── */

const H_TABLE: Record<number, number> = {
  6.80:158,6.81:155,6.82:151,6.83:148,6.84:145,6.85:141,6.86:138,6.87:135,6.88:132,6.89:129,
  6.90:126,6.91:123,6.92:120,6.93:117,6.94:115,6.95:112,6.96:110,6.97:107,6.98:105,6.99:102,
  7.00:100,7.01:98,7.02:95,7.03:93,7.04:91,7.05:89,7.06:87,7.07:85,7.08:83,7.09:81,
  7.10:79,7.11:78,7.12:76,7.13:74,7.14:72,7.15:71,7.16:69,7.17:68,7.18:66,7.19:65,
  7.20:63,7.21:62,7.22:60,7.23:59,7.24:58,7.25:56,7.26:55,7.27:54,7.28:52,7.29:51,
  7.30:50,7.31:49,7.32:48,7.33:47,7.34:46,7.35:45,7.36:44,7.37:43,7.38:42,7.39:41,
  7.40:40,7.41:39,7.42:38,7.43:37,7.44:36,7.45:35,7.46:35,7.47:34,7.48:33,7.49:32,
  7.50:32,7.51:31,7.52:30,7.53:30,7.54:29,7.55:28,7.56:28,7.57:27,7.58:26,7.59:26,
  7.60:25,7.61:25,7.62:24,7.63:23,7.64:23,7.65:22,7.66:22,7.67:21,7.68:21,7.69:20,
  7.70:20,7.71:19,7.72:19,7.73:19,7.74:18,7.75:18,7.76:17,7.77:17,7.78:17,7.79:16,7.80:16,
};

export const REFERENCIAS: { param: string; ref: string; calc: string }[] = [
  { param: 'pH', ref: '7,35 – 7,45', calc: '7,40' },
  { param: 'PaCO₂ (mmHg)', ref: '35 – 45', calc: '40' },
  { param: 'HCO₃⁻ real (mEq/L)', ref: '22 – 26', calc: '24' },
  { param: 'HCO₃⁻ std (mEq/L)', ref: '22 – 26', calc: '24' },
  { param: 'BE (mEq/L)', ref: '−2 a +2', calc: '0' },
  { param: 'Na⁺ (mEq/L)', ref: '135 – 145', calc: '140' },
  { param: 'Cl⁻ (mEq/L)', ref: '98 – 106', calc: '102' },
  { param: 'Albumina (g/dL)', ref: '3,5 – 5,0', calc: '4,0' },
  { param: 'Lactato (mmol/L)', ref: '0,5 – 2,0', calc: '1,0' },
];

/** Referência usada para o Delta AG (protocolo: AG normal 10–12 mEq/L). */
export const AG_NORMAL = 12;

/** Tolerância entre o [H⁺] calculado e o esperado para a gasometria ser consistente. */
export const TOLERANCIA_H = 5;

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

/** Converte texto de input em número, aceitando vírgula decimal. */
export const num = (v: string): number | null => {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const fmt = (n: number, d = 1) => n.toFixed(d).replace('.', ',');
export const faixa = (a: number, b: number, d = 1) => `${fmt(Math.min(a, b), d)} – ${fmt(Math.max(a, b), d)}`;

export function getHplus(ph: number): number | null {
  const key = Math.round(ph * 100) / 100;
  return H_TABLE[key] ?? null;
}

/* ────────────────────────────────────────────────────────────
   Seção 1 — Consistência por Henderson-Hasselbalch
   ──────────────────────────────────────────────────────────── */

export interface Consistencia {
  valid: boolean;
  hCalc: number;
  hTabela: number;
  diff: number;
}

/** [H⁺] = 24 × PaCO₂ / HCO₃⁻ comparado com a tabela de pH. */
export function validarConsistencia(ph: number, paco2: number, hco3: number): Consistencia | null {
  const hTabela = getHplus(ph);
  if (!hTabela || hco3 <= 0) return null;
  const hCalc = parseFloat((24 * paco2 / hco3).toFixed(1));
  const diff = Math.abs(hCalc - hTabela);
  return { valid: diff <= TOLERANCIA_H, hCalc, hTabela, diff };
}

/* ────────────────────────────────────────────────────────────
   Seção 2 — Distúrbio primário
   ──────────────────────────────────────────────────────────── */

export type Metabolico = 'acidose_metabolica' | 'alcalose_metabolica' | 'normal';
export type Respiratorio = 'acidose_respiratoria' | 'alcalose_respiratoria' | 'normal';
export type Primario =
  | 'acidose_metabolica'
  | 'alcalose_metabolica'
  | 'acidose_respiratoria'
  | 'alcalose_respiratoria'
  | 'acidose_mista'
  | 'alcalose_mista'
  | 'normal'
  | 'indefinido';

export type TagTone = 'acid' | 'alc' | 'meta' | 'resp' | 'norm' | 'misto';
export interface Tag { label: string; tone: TagTone }

export interface Disturbio {
  faixaPh: 'acidemia' | 'normal' | 'alcalemia';
  tendencia: 'acidemica' | 'alcalemica' | 'neutra';
  metabolico: Metabolico;
  respiratorio: Respiratorio;
  primario: Primario;
  primarioLabel: string;
  descricao: string;
  tags: Tag[];
  critico: 'acidose_grave' | 'alcalose_grave' | null;
}

export const PRIMARIO_LABEL: Record<Primario, string> = {
  acidose_metabolica: 'Acidose metabólica',
  alcalose_metabolica: 'Alcalose metabólica',
  acidose_respiratoria: 'Acidose respiratória',
  alcalose_respiratoria: 'Alcalose respiratória',
  acidose_mista: 'Acidose mista (metabólica + respiratória)',
  alcalose_mista: 'Alcalose mista (metabólica + respiratória)',
  normal: 'Equilíbrio ácido-básico',
  indefinido: 'Indefinido – revisar valores',
};

export function classificarDisturbio(
  ph: number,
  paco2: number,
  hco3: number,
  be: number | null = null,
  lactato: number | null = null,
): Disturbio {
  const tags: Tag[] = [];

  const faixaPh: Disturbio['faixaPh'] = ph < 7.35 ? 'acidemia' : ph > 7.45 ? 'alcalemia' : 'normal';
  const tendencia: Disturbio['tendencia'] = ph < 7.4 ? 'acidemica' : ph > 7.4 ? 'alcalemica' : 'neutra';

  if (faixaPh === 'acidemia') tags.push({ label: 'Acidemia', tone: 'acid' });
  else if (faixaPh === 'alcalemia') tags.push({ label: 'Alcalemia', tone: 'alc' });
  else tags.push({ label: 'pH normal', tone: 'norm' });

  const metabolico: Metabolico = hco3 < 22 ? 'acidose_metabolica' : hco3 > 26 ? 'alcalose_metabolica' : 'normal';
  if (metabolico === 'acidose_metabolica') tags.push({ label: 'HCO₃⁻ baixo', tone: 'meta' });
  else if (metabolico === 'alcalose_metabolica') tags.push({ label: 'HCO₃⁻ alto', tone: 'meta' });
  else tags.push({ label: 'HCO₃⁻ normal', tone: 'norm' });

  const respiratorio: Respiratorio = paco2 > 45 ? 'acidose_respiratoria' : paco2 < 35 ? 'alcalose_respiratoria' : 'normal';
  if (respiratorio === 'acidose_respiratoria') tags.push({ label: 'PaCO₂ alta', tone: 'resp' });
  else if (respiratorio === 'alcalose_respiratoria') tags.push({ label: 'PaCO₂ baixa', tone: 'resp' });
  else tags.push({ label: 'PaCO₂ normal', tone: 'norm' });

  if (be !== null) {
    if (be < -2) tags.push({ label: `BE ${fmt(be)} – déficit de base`, tone: 'meta' });
    else if (be > 2) tags.push({ label: `BE +${fmt(be)} – excesso de base`, tone: 'meta' });
    else tags.push({ label: 'BE normal', tone: 'norm' });
  }

  if (lactato !== null && lactato > 2) {
    tags.push({ label: `Lactato ${fmt(lactato)} – hiperlactatemia`, tone: 'acid' });
  }

  let primario: Primario;
  let descricao: string;

  if (faixaPh === 'acidemia') {
    if (metabolico === 'acidose_metabolica' && respiratorio === 'acidose_respiratoria') {
      primario = 'acidose_mista';
      descricao = 'HCO₃⁻ baixo e PaCO₂ alta com pH ácido: os dois componentes empurram o pH na mesma direção — acidose mista, sem compensação.';
    } else if (metabolico === 'acidose_metabolica') {
      primario = 'acidose_metabolica';
      descricao = 'pH ácido com HCO₃⁻ baixo: acidose metabólica como distúrbio primário.';
    } else if (respiratorio === 'acidose_respiratoria') {
      primario = 'acidose_respiratoria';
      descricao = 'pH ácido com PaCO₂ alta: acidose respiratória como distúrbio primário.';
    } else {
      primario = 'indefinido';
      descricao = 'pH ácido sem HCO₃⁻ ou PaCO₂ alterados. Revisar a coleta e conferir a consistência da gasometria.';
    }
  } else if (faixaPh === 'alcalemia') {
    if (metabolico === 'alcalose_metabolica' && respiratorio === 'alcalose_respiratoria') {
      primario = 'alcalose_mista';
      descricao = 'HCO₃⁻ alto e PaCO₂ baixa com pH alcalino: alcalose mista, sem compensação.';
    } else if (metabolico === 'alcalose_metabolica') {
      primario = 'alcalose_metabolica';
      descricao = 'pH alcalino com HCO₃⁻ alto: alcalose metabólica como distúrbio primário.';
    } else if (respiratorio === 'alcalose_respiratoria') {
      primario = 'alcalose_respiratoria';
      descricao = 'pH alcalino com PaCO₂ baixa: alcalose respiratória como distúrbio primário.';
    } else {
      primario = 'indefinido';
      descricao = 'pH alcalino sem HCO₃⁻ ou PaCO₂ alterados. Revisar a coleta e conferir a consistência da gasometria.';
    }
  } else {
    // pH dentro da faixa normal — não exclui distúrbio (seção 2 do protocolo)
    if (metabolico === 'normal' && respiratorio === 'normal') {
      primario = 'normal';
      descricao = 'pH, HCO₃⁻ e PaCO₂ dentro da referência: equilíbrio ácido-básico. Lembre que pH normal não exclui distúrbio.';
    } else if (metabolico === 'acidose_metabolica' && respiratorio === 'alcalose_respiratoria') {
      primario = tendencia === 'alcalemica' ? 'alcalose_respiratoria' : 'acidose_metabolica';
      descricao = `HCO₃⁻ baixo e PaCO₂ baixa com pH normal: distúrbio compensado. Pela tendência do pH (${fmt(ph, 2)}), o primário provável é ${PRIMARIO_LABEL[primario].toLowerCase()}.`;
    } else if (metabolico === 'alcalose_metabolica' && respiratorio === 'acidose_respiratoria') {
      primario = tendencia === 'acidemica' ? 'acidose_respiratoria' : 'alcalose_metabolica';
      descricao = `HCO₃⁻ alto e PaCO₂ alta com pH normal: distúrbio compensado. Pela tendência do pH (${fmt(ph, 2)}), o primário provável é ${PRIMARIO_LABEL[primario].toLowerCase()}.`;
    } else if (metabolico !== 'normal') {
      primario = metabolico;
      descricao = 'pH normal com HCO₃⁻ alterado e PaCO₂ normal: distúrbio metabólico sem resposta respiratória esperada — avaliar distúrbio misto.';
    } else {
      primario = respiratorio;
      descricao = 'pH normal com PaCO₂ alterada e HCO₃⁻ normal: distúrbio respiratório sem compensação renal — avaliar distúrbio misto ou quadro agudo.';
    }
  }

  // Limites inclusivos: o protocolo escreve "< 7,10" e "> 7,60", mas um pH cravado
  // em 7,10 já é acidose grave — num alerta de risco de morte, errar para mais.
  const critico = ph <= 7.1 ? 'acidose_grave' : ph >= 7.6 ? 'alcalose_grave' : null;

  return { faixaPh, tendencia, metabolico, respiratorio, primario, primarioLabel: PRIMARIO_LABEL[primario], descricao, tags, critico };
}

/* ────────────────────────────────────────────────────────────
   Seção 3 — Regra da compensação
   ──────────────────────────────────────────────────────────── */

export type ModoResp = 'aguda' | 'cronica_merck' | 'cronica_ats';

export interface Compensacao {
  variavel: string;
  formula: string;
  min: number;
  max: number;
  medido: number;
  status: 'dentro' | 'abaixo' | 'acima';
  intensidade: 'esperada' | 'menor' | 'maior';
  conclusao: string;
  associado: string | null;
}

export function calcularCompensacao(
  primario: Primario,
  paco2: number,
  hco3: number,
  modo: ModoResp = 'aguda',
): Compensacao | null {
  let variavel: string;
  let formula: string;
  let min: number;
  let max: number;
  let medido: number;
  // 'aumenta' = a compensação eleva a variável; 'diminui' = a compensação reduz a variável
  let sentido: 'aumenta' | 'diminui';

  if (primario === 'acidose_respiratoria') {
    const d = paco2 - 40;
    variavel = 'HCO₃⁻';
    medido = hco3;
    sentido = 'aumenta';
    if (modo === 'aguda') {
      min = 24 + 0.1 * d; max = 24 + 0.2 * d;
      formula = `HCO₃⁻ = 24 + (0,1–0,2) × (PaCO₂ − 40) = 24 + (0,1–0,2) × ${fmt(d)}`;
    } else if (modo === 'cronica_merck') {
      const v = 24 + 0.35 * d;
      min = v - 2; max = v + 2;
      formula = `HCO₃⁻ = 24 + 0,35 × (PaCO₂ − 40) = ${fmt(v)} (tolerância ± 2)`;
    } else {
      min = 24 + 0.3 * d; max = 24 + 0.4 * d;
      formula = `HCO₃⁻ = 24 + (0,3–0,4) × (PaCO₂ − 40) = 24 + (0,3–0,4) × ${fmt(d)}`;
    }
  } else if (primario === 'alcalose_respiratoria') {
    const d = 40 - paco2;
    variavel = 'HCO₃⁻';
    medido = hco3;
    sentido = 'diminui';
    if (modo === 'aguda') {
      min = 24 - 0.2 * d; max = 24 - 0.1 * d;
      formula = `HCO₃⁻ = 24 − (0,1–0,2) × (40 − PaCO₂) = 24 − (0,1–0,2) × ${fmt(d)}`;
    } else if (modo === 'cronica_merck') {
      min = 24 - 0.7 * d; max = 24 - 0.5 * d;
      formula = `HCO₃⁻ = 24 − (0,5–0,7) × (40 − PaCO₂) = 24 − (0,5–0,7) × ${fmt(d)}`;
    } else {
      min = 24 - 0.5 * d; max = 24 - 0.4 * d;
      formula = `HCO₃⁻ = 24 − (0,4–0,5) × (40 − PaCO₂) = 24 − (0,4–0,5) × ${fmt(d)}`;
    }
  } else if (primario === 'acidose_metabolica') {
    variavel = 'PaCO₂';
    medido = paco2;
    sentido = 'diminui';
    min = 1.3 * hco3 + 8 - 2;
    max = 1.5 * hco3 + 8 + 2;
    formula = `Winter: PaCO₂ = (1,3–1,5) × HCO₃⁻ + 8 ± 2 = (1,3–1,5) × ${fmt(hco3)} + 8 ± 2`;
  } else if (primario === 'alcalose_metabolica') {
    variavel = 'PaCO₂';
    medido = paco2;
    sentido = 'aumenta';
    min = 0.6 * (hco3 - 24) + 40 - 5;
    max = 0.7 * (hco3 - 24) + 40 + 5;
    formula = `PaCO₂ = (0,6–0,7) × (HCO₃⁻ − 24) + 40 ± 5 = (0,6–0,7) × ${fmt(hco3 - 24)} + 40 ± 5`;
  } else {
    return null;
  }

  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const status: Compensacao['status'] = medido < lo ? 'abaixo' : medido > hi ? 'acima' : 'dentro';

  let intensidade: Compensacao['intensidade'] = 'esperada';
  if (status !== 'dentro') {
    const acima = status === 'acima';
    intensidade = (sentido === 'aumenta') === acima ? 'maior' : 'menor';
  }

  let associado: string | null = null;
  if (status !== 'dentro') {
    if (variavel === 'HCO₃⁻') {
      associado = status === 'abaixo' ? 'acidose metabólica associada' : 'alcalose metabólica associada';
    } else {
      associado = status === 'abaixo' ? 'alcalose respiratória associada' : 'acidose respiratória associada';
    }
  }

  const conclusao = status === 'dentro'
    ? `${variavel} medido (${fmt(medido)}) está dentro da faixa esperada: compensação adequada para um distúrbio simples.`
    : `${variavel} medido (${fmt(medido)}) está ${status} da faixa esperada — compensação ${intensidade} que a esperada, sugerindo ${associado}.`;

  return { variavel, formula, min: lo, max: hi, medido, status, intensidade, conclusao, associado };
}

/* ────────────────────────────────────────────────────────────
   Seção 4 — Ânion gap
   ──────────────────────────────────────────────────────────── */

export interface AnionGap {
  ag: number;
  agCorrigido: number | null;
  agUsado: number;
  usouAlbumina: boolean;
  classificacao: 'aumentado' | 'normal' | 'reduzido' | 'baixo';
  textoClassificacao: string;
}

export function calcularAG(na: number, cl: number, hco3: number, albumina: number | null = null): AnionGap {
  const ag = na - (cl + hco3);
  const agCorrigido = albumina !== null ? ag + 2.5 * (4 - albumina) : null;
  const agUsado = agCorrigido ?? ag;

  let classificacao: AnionGap['classificacao'];
  let textoClassificacao: string;
  if (agUsado > 12) {
    classificacao = 'aumentado';
    textoClassificacao = 'AG aumentado (> 12 mEq/L): considerar acidose láctica, cetoacidose, uremia e intoxicações (salicilato, metanol, etilenoglicol).';
  } else if (agUsado >= 8) {
    classificacao = 'normal';
    textoClassificacao = 'AG normal (8–12 mEq/L): acidose metabólica hiperclorêmica (perdas digestivas, acidose tubular renal, excesso de cloro infundido).';
  } else if (agUsado < 6) {
    classificacao = 'reduzido';
    textoClassificacao = 'AG reduzido (< 6 mEq/L): achado raro — hipoalbuminemia não corrigida, paraproteinemia ou erro laboratorial.';
  } else {
    classificacao = 'baixo';
    textoClassificacao = 'AG entre 6 e 8 mEq/L: abaixo da faixa habitual, sem aumento de ácidos não medidos.';
  }

  return { ag, agCorrigido, agUsado, usouAlbumina: albumina !== null, classificacao, textoClassificacao };
}

/* ────────────────────────────────────────────────────────────
   Seção 5 — Delta AG, HCO₃⁻ corrigido e razão delta-delta
   ──────────────────────────────────────────────────────────── */

export interface DeltaGap {
  deltaAG: number;
  deltaAGTexto: string;
  hco3Corrigido: number;
  hco3CorrigidoTexto: string;
  deltaHco3: number;
  razao: number | null;
  razaoTexto: string;
  razaoSignificado: string;
}

export function calcularDeltaGap(agUsado: number, hco3: number): DeltaGap {
  const deltaAG = agUsado - AG_NORMAL;
  const hco3Corrigido = hco3 + deltaAG;
  const deltaHco3 = 24 - hco3;
  const razao = deltaHco3 > 0 ? deltaAG / deltaHco3 : null;

  const deltaAGTexto = deltaAG > 6
    ? 'Delta AG > 6 mEq/L: presença de ácidos não medidos.'
    : 'Delta AG ≤ 6 mEq/L: sem aumento significativo de ácidos não medidos.';

  const hco3CorrigidoTexto = hco3Corrigido < 22
    ? 'HCO₃⁻ corrigido < 22 mEq/L: acidose metabólica com AG aumentado + acidose hiperclorêmica.'
    : hco3Corrigido > 26
      ? 'HCO₃⁻ corrigido > 26 mEq/L: acidose metabólica com AG aumentado + alcalose metabólica.'
      : 'HCO₃⁻ corrigido 22–26 mEq/L: acidose metabólica com AG aumentado isolada.';

  let razaoTexto = 'Delta HCO₃⁻ ≤ 0 (HCO₃⁻ ≥ 24): razão não aplicável.';
  let razaoSignificado = 'Sem queda de bicarbonato para comparar — reavaliar o conjunto da gasometria.';
  if (razao !== null) {
    if (razao < 0.8) {
      razaoTexto = 'Razão < 0,8 – menor que o normal.';
      razaoSignificado = 'Coexistência de acidose metabólica com AG normal (hiperclorêmica).';
    } else if (razao <= 1.2) {
      razaoTexto = 'Razão 0,8–1,2 – normal.';
      razaoSignificado = 'Acidose metabólica com AG aumentado isolada.';
    } else if (razao <= 2) {
      razaoTexto = 'Razão > 1,2 e ≤ 2 – maior que o normal.';
      razaoSignificado = 'Coexistência de alcalose metabólica ou acidose respiratória crônica.';
    } else {
      razaoTexto = 'Razão > 2 – muito maior que o normal.';
      razaoSignificado = 'Possível alcalose metabólica importante associada ou erro de medição.';
    }
  }

  return { deltaAG, deltaAGTexto, hco3Corrigido, hco3CorrigidoTexto, deltaHco3, razao, razaoTexto, razaoSignificado };
}
