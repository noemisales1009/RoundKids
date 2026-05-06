import { supabase } from '../supabaseClient';

export type Sexo = 'masculino' | 'feminino';

export type ClassificacaoPA = 'abaixo_p5' | 'normal' | 'acima_p95';

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
  sist_p5: number;  sist_p50: number;  sist_p95: number;
  diast_p5: number; diast_p50: number; diast_p95: number;
  media_p5: number; media_p50: number; media_p95: number;
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

export async function classificarPA(
  sexo: Sexo,
  idadeLabel: string,
  sistolica: number,
  diastolica: number
): Promise<ClassificacaoPAResult | null> {
  const { data, error } = await supabase.rpc('classificar_pa', {
    p_sexo: sexo,
    p_idade_label: idadeLabel.toUpperCase(),
    p_sistolica: sistolica,
    p_diastolica: diastolica,
  });
  if (error) {
    console.error('[classificarPA] Erro:', error.message);
    return null;
  }
  return data?.[0] ?? null;
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
