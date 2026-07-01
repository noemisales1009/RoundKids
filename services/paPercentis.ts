import { supabase } from '../supabaseClient';

export type Sexo = 'masculino' | 'feminino';

export type ClassificacaoPA = 'hipotensao' | 'normal' | 'aceitavel' | 'pre_hipertensao' | 'hipertensao';

export interface PercentisPA {
  idade_label: string;
  sist_p5: number;
  sist_p10: number;
  sist_p50: number;
  sist_p90: number;
  sist_p95: number;
  diast_p5: number;
  diast_p10: number;
  diast_p50: number;
  diast_p90: number;
  diast_p95: number;
  media_p5: number;
  media_p10: number;
  media_p50: number;
  media_p90: number;
  media_p95: number;
}

export interface ClassificacaoPAResult {
  sist_p5: number;  sist_p50: number;  sist_p90: number;  sist_p95: number;
  diast_p5: number; diast_p50: number; diast_p90: number; diast_p95: number;
  media_p5: number; media_p50: number; media_p90: number; media_p95: number;
  media_medida: number;
  class_sistolica: ClassificacaoPA;
  class_diastolica: ClassificacaoPA;
  class_media: ClassificacaoPA;
  alerta: boolean;
}

export function idadeParaLabel(anos: number, meses = 0, dias = 0): string {
  if (anos === 0 && meses === 0) {
    if (dias <= 1) return '1 DIA';
    if (dias <= 5) return '3 DIAS';
    return '7 DIAS';
  }
  if (anos === 0) {
    if (meses === 1) return '1 MES';
    if (meses <= 11) return `${meses} MESES`;
    return '1 ANO';
  }
  if (anos === 1) return '1 ANO';
  return `${anos} ANOS`;
}

export async function buscarPercentisPA(
  sexo: Sexo,
  idadeLabel: string
): Promise<PercentisPA | null> {
  const { data, error } = await supabase.rpc('buscar_percentis_pa', {
    p_sexo: sexo,
    p_idade_label: idadeLabel.toUpperCase(),
  });
  if (error) {
    console.error('[buscarPercentisPA] Erro:', error.message);
    return null;
  }
  return data?.[0] ?? null;
}

// Classifica um valor de PA em uma das 5 faixas clínicas por percentil:
//   < P5        → Hipotensão
//   P5  a < P50 → Normal
//   P50 a < P90 → Aceitável
//   P90 a < P95 → Pré-hipertensão
//   ≥ P95       → Hipertensão
export function classificarFaixa(
  valor: number, p5: number, p50: number, p90: number, p95: number
): ClassificacaoPA {
  if (valor < p5) return 'hipotensao';
  if (valor < p50) return 'normal';
  if (valor < p90) return 'aceitavel';
  if (valor < p95) return 'pre_hipertensao';
  return 'hipertensao';
}

// Classificação feita no próprio app (sem depender da função classificar_pa do
// Supabase), usando os percentis de referência — inclusive o P90, necessário
// para as faixas "Aceitável" e "Pré-hipertensão".
export async function classificarPA(
  sexo: Sexo,
  idadeLabel: string,
  sistolica: number,
  diastolica: number
): Promise<ClassificacaoPAResult> {
  const p = await buscarPercentisPA(sexo, idadeLabel);
  if (!p) throw new Error(`Sem dados de percentis para ${sexo} / ${idadeLabel}`);

  const media_medida = calcularPAMedia(sistolica, diastolica);
  const class_sistolica  = classificarFaixa(sistolica,    p.sist_p5,  p.sist_p50,  p.sist_p90,  p.sist_p95);
  const class_diastolica = classificarFaixa(diastolica,   p.diast_p5, p.diast_p50, p.diast_p90, p.diast_p95);
  const class_media      = classificarFaixa(media_medida, p.media_p5, p.media_p50, p.media_p90, p.media_p95);

  const ehAlerta = (c: ClassificacaoPA) => c === 'hipotensao' || c === 'hipertensao';
  const alerta = ehAlerta(class_sistolica) || ehAlerta(class_diastolica) || ehAlerta(class_media);

  return {
    sist_p5: p.sist_p5,   sist_p50: p.sist_p50,   sist_p90: p.sist_p90,   sist_p95: p.sist_p95,
    diast_p5: p.diast_p5, diast_p50: p.diast_p50, diast_p90: p.diast_p90, diast_p95: p.diast_p95,
    media_p5: p.media_p5, media_p50: p.media_p50, media_p90: p.media_p90, media_p95: p.media_p95,
    media_medida,
    class_sistolica, class_diastolica, class_media,
    alerta,
  };
}

export function calcularPAMedia(sistolica: number, diastolica: number): number {
  return Math.round(((sistolica + 2 * diastolica) / 3) * 10) / 10;
}

export const IDADES_DISPONIVEIS = [
  '1 DIA', '3 DIAS', '7 DIAS',
  '1 MES',
  '2 MESES', '3 MESES', '4 MESES', '5 MESES', '6 MESES',
  '7 MESES', '8 MESES', '9 MESES', '10 MESES', '11 MESES',
  '1 ANO',
  '2 ANOS', '3 ANOS', '4 ANOS', '5 ANOS', '6 ANOS',
  '7 ANOS', '8 ANOS', '9 ANOS', '10 ANOS', '11 ANOS',
  '12 ANOS', '13 ANOS', '14 ANOS', '15 ANOS', '16 ANOS',
  '17 ANOS', '18 ANOS',
] as const;

export type IdadeLabel = typeof IDADES_DISPONIVEIS[number];
