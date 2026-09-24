// ============================================================================
// Alarmes respiratórios do Round — UTI Pediátrica
// Fontes: "Alarmes respiratórios para o Round" e "Alarmes de relação IE Ti e PEEP:
// categorias de insuficiência respiratória pediátrica".
// Referências: PALICC-2 (Emeriaud G, et al. Pediatr Crit Care Med. 2023;24(2):143-168);
// Khemani RG, et al. Am J Respir Crit Care Med. 2018;198(1):77-89;
// Kneyber MCJ, et al. Intensive Care Med. 2017;43:1764-1780.
//
// Lógica pura, sem React nem Supabase.
//
// PRINCÍPIO DE SEGURANÇA (repetido nas três specs): os alarmes apoiam a decisão
// profissional, são referências operacionais iniciais e NUNCA ajustam nem sugerem
// ajuste automático do ventilador. Nenhuma mensagem deste arquivo prescreve conduta.
// ============================================================================

import { fmt, type CalculoCompleto, type EntradaCalc, type IndicadorKey } from './calcRespiratoria';
import type { CicloEstimado } from './tempoRespiratorio';

const tem = (v: number | null | undefined): v is number => v != null && Number.isFinite(v);
const arred = (n: number, casas: number) => Math.round(n * 10 ** casas) / 10 ** casas;

export type NivelAlarme = 'critico' | 'atencao' | 'info';

export const LABEL_NIVEL: Record<NivelAlarme, string> = {
  critico: 'Crítico', atencao: 'Atenção', info: 'Informativo',
};

export interface Alarme {
  id: string;
  nivel: NivelAlarme;
  titulo: string;
  valor: string;      // valor que ativou o alerta
  meta: string;       // meta ou referência
  verificar: string;  // o que avaliar
}

// ── Item 1 da spec de categorias ────────────────────────────────────────────
export type CategoriaIR = 'ovai' | 'ovas' | 'tecido' | 'bomba' | 'misto';

export const CATEGORIAS_IR: { key: CategoriaIR; label: string; descricao: string }[] = [
  { key: 'ovai', label: 'OVAI — obstrução de vias aéreas inferiores', descricao: 'Asma, bronquiolite e broncoespasmo. Resistência elevada, constante de tempo prolongada e risco de aprisionamento aéreo.' },
  { key: 'ovas', label: 'OVAS — obstrução de vias aéreas superiores', descricao: 'Edema, estenose, laringotraqueomalácia e outras obstruções fixas ou dinâmicas.' },
  { key: 'tecido', label: 'Doença do tecido pulmonar', descricao: 'Pneumonia, PARDS, edema e atelectasia. Complacência reduzida e constante de tempo geralmente curta.' },
  { key: 'bomba', label: 'Descontrole da respiração ou falha da bomba', descricao: 'Depressão do comando central, apneia, doença neuromuscular e fadiga.' },
  { key: 'misto', label: 'Fenótipo misto', descricao: 'Combina mais de uma categoria. Aplicam-se também os alarmes de doença do tecido.' },
];

// Referências operacionais iniciais por categoria (itens 3 a 6 da spec de categorias)
export const REFERENCIA_CATEGORIA: Record<CategoriaIR, { ie: string; peep: string; ti: string }> = {
  ovai: { ie: 'Expiração prolongada, frequentemente entre 1:3 e 1:5', peep: 'Iniciar em 3 a 5 cmH₂O, titulando por auto-PEEP, disparo, VTe, curvas e hemodinâmica', ti: 'Curto e suficiente para entregar o VTe' },
  ovas: { ie: 'Em geral próxima de 1:2', peep: 'Na malácia, titular para estabilizar a via aérea; na obstrução fixa, a PEEP não substitui a avaliação da via aérea', ti: 'Ajustado para entrega adequada do VTe, sem ciclagem precoce ou tardia' },
  tecido: { ie: 'Frequentemente entre 1:1,5 e 1:2', peep: 'Titular por gravidade, recrutabilidade, complacência, hemodinâmica, oxigenação e tabela PEEP–FiO₂', ti: 'Curto a moderado, preservando tempo expiratório adequado' },
  bomba: { ie: 'Próxima de 1:2 quando a mecânica estiver preservada', peep: 'Em geral 3 a 5 cmH₂O quando não houver doença pulmonar', ti: 'Ajustado à idade, ao VTe e à sincronia' },
  misto: { ie: 'Individualizar; aplicar também as referências de doença do tecido', peep: 'Individualizar; aplicar também as referências de doença do tecido', ti: 'Individualizar conforme a mecânica predominante' },
};

// ── Item 2 da spec de alarmes: tabela PEEP–FiO₂ (ARDSNet, menor PEEP / maior FiO₂) ──
export const TABELA_PEEP_FIO2: { fio2: number; min: number; max: number }[] = [
  { fio2: 30, min: 5, max: 5 },
  { fio2: 40, min: 5, max: 8 },
  { fio2: 50, min: 8, max: 10 },
  { fio2: 60, min: 10, max: 10 },
  { fio2: 70, min: 10, max: 14 },
  { fio2: 80, min: 14, max: 14 },
  { fio2: 90, min: 14, max: 18 },
  { fio2: 100, min: 18, max: 24 },
];

/** Degrau da tabela para a FiO₂ atual: o maior degrau cuja FiO₂ não passa da informada. */
export function peepReferencia(fio2Pct: number | null | undefined): { fio2: number; min: number; max: number } | null {
  if (!tem(fio2Pct)) return null;
  let ref = TABELA_PEEP_FIO2[0];
  for (const l of TABELA_PEEP_FIO2) if (fio2Pct >= l.fio2) ref = l;
  return ref;
}

// ── Item 4: volume corrente expirado por peso ───────────────────────────────
export type ClasseVte = 'muito_baixo' | 'baixo' | 'protetor' | 'elevado' | 'excessivo';

export const FAIXAS_VTE: { classe: ClasseVte; label: string; mensagem: string }[] = [
  { classe: 'muito_baixo', label: 'Volume muito baixo (< 4 mL/kg)', mensagem: 'Alerta, salvo estratégia deliberada e monitorada.' },
  { classe: 'baixo', label: 'Baixo volume (4 a < 6 mL/kg)', mensagem: 'Confirmar estratégia e avaliar ventilação e pH.' },
  { classe: 'protetor', label: 'Faixa protetora geral (6 a 8 mL/kg)', mensagem: 'Apresentar sem alerta específico.' },
  { classe: 'elevado', label: 'Volume elevado (> 8 mL/kg)', mensagem: 'Avaliar esforço, modo e risco de volutrauma.' },
  { classe: 'excessivo', label: 'Volume excessivo (> 10 mL/kg)', mensagem: 'Alerta crítico.' },
];

export function classificarVte(vteKg: number | null | undefined): ClasseVte | null {
  if (!tem(vteKg)) return null;
  if (vteKg > 10) return 'excessivo';
  if (vteKg > 8) return 'elevado';
  if (vteKg >= 6) return 'protetor';
  if (vteKg >= 4) return 'baixo';
  return 'muito_baixo';
}

// ── Item 10: assincronia paciente–ventilador ────────────────────────────────
// Observações de curva e de beira-leito. A spec pede uma única mensagem de revisão.
export type Assincronia =
  | 'duplo_disparo' | 'empilhamento' | 'esforco_ineficaz' | 'autoacionamento'
  | 'ciclagem_precoce' | 'ciclagem_tardia' | 'esforco_expiratorio'
  | 'vte_espontaneo_alto' | 'esforco_clinico';

export const ASSINCRONIAS: { key: Assincronia; label: string }[] = [
  { key: 'duplo_disparo', label: 'Duplo disparo' },
  { key: 'empilhamento', label: 'Empilhamento de ciclos' },
  { key: 'esforco_ineficaz', label: 'Esforço ineficaz' },
  { key: 'autoacionamento', label: 'Autoacionamento por vazamento' },
  { key: 'ciclagem_precoce', label: 'Ciclagem precoce' },
  { key: 'ciclagem_tardia', label: 'Ciclagem tardia' },
  { key: 'esforco_expiratorio', label: 'Esforço inspiratório persistente durante a expiração' },
  { key: 'vte_espontaneo_alto', label: 'VTe espontâneo acima da faixa protetora' },
  { key: 'esforco_clinico', label: 'Aumento da FR, musculatura acessória ou agitação com piora das curvas' },
];

// ── Item 11: sinais de falha da VNI ─────────────────────────────────────────
export type SinalVni =
  | 'sem_melhora_6h' | 'fr_fc_subindo' | 'esforco_pior' | 'sf_caindo'
  | 'fio2_progressiva' | 'ipap_epap_crescente' | 'apneia_rebaixamento' | 'vazamento_impede';

export const SINAIS_VNI: { key: SinalVni; label: string; critico?: boolean }[] = [
  { key: 'sem_melhora_6h', label: 'Ausência de melhora clínica nas primeiras seis horas', critico: true },
  { key: 'fr_fc_subindo', label: 'Aumento da frequência respiratória ou cardíaca' },
  { key: 'esforco_pior', label: 'Piora do esforço respiratório' },
  { key: 'sf_caindo', label: 'Queda da relação S/F' },
  { key: 'fio2_progressiva', label: 'Aumento progressivo da FiO₂' },
  { key: 'ipap_epap_crescente', label: 'Necessidade crescente de IPAP ou EPAP' },
  { key: 'apneia_rebaixamento', label: 'Apneias, rebaixamento da consciência ou instabilidade hemodinâmica', critico: true },
  { key: 'vazamento_impede', label: 'Vazamento excessivo impedindo suporte efetivo' },
];

// ── Item 5: vazamento ───────────────────────────────────────────────────────
export function classificarVazamento(pct: number | null | undefined): { nivel: NivelAlarme; texto: string } | null {
  if (!tem(pct)) return null;
  if (pct >= 30) return { nivel: 'atencao', texto: 'Avaliar cuff, tubo, circuito, fístula ou sensor.' };
  if (pct >= 20) return { nivel: 'atencao', texto: 'Medida potencialmente não confiável.' };
  if (pct >= 10) return { nivel: 'atencao', texto: 'Monitorar tendência e qualidade das medidas.' };
  return { nivel: 'info', texto: 'Discreto.' };
}

// ── Limiares (todos configuráveis em um lugar só) ───────────────────────────
export const LIMIARES = {
  spo2: { criticoAbaixo: 88, metaMin: 92, metaMax: 97 },
  fio2: { atencao: 60, critico: 80, arAmbiente: 21 },
  ph: { atencao: 7.20, critico: 7.10 },
  pplat: { atencao: 28, critico: 32, obstrutiva: 30 },
  drivingPressure: 15,
  autoPeep: 2,
  vazamento: 20,
  tendenciaPct: 20,       // variação relevante de Cstat, Raw e VTe
  quedaAbruptaPct: 25,    // queda de EtCO₂ ou VTe considerada abrupta
  quedaSpo2Pontos: 5,     // queda de SpO₂ em pontos percentuais
  fontesMin: 60,          // diferença aceitável entre gasometria e parâmetros, em minutos
  pipDelta: 5,            // variação de PIP relevante, em cmH₂O (item 6)
  pplatEstavel: 2,        // variação de Pplat considerada estabilidade, em cmH₂O
  pplatDelta: 3,          // variação de Pplat considerada aumento, em cmH₂O
  mapDelta: 2,            // variação de MAP relevante, em cmH₂O
  paco2Delta: 5,          // elevação relevante de PaCO₂ ou do gradiente, em mmHg
  vteProgramadoPct: 80,   // VTe mínimo aceitável em relação ao volume programado
  ieDivergencia: 0.3,     // diferença tolerada entre I:E calculada e informada
  fio2Delta: 5,           // elevação relevante de FiO₂, em pontos percentuais
  peepDelta: 1,           // elevação relevante de PEEP, em cmH₂O
  tendenciaHoras: 12,     // idade máxima do último cálculo validado para comparar tendência
};

/** Meta individual registrada para o paciente; substitui o padrão quando informada. */
export interface MetasIndividuais {
  spo2Min?: number | null;
  spo2Max?: number | null;
  peepMin?: number | null;
  peepMax?: number | null;
  vminLmin?: number | null;   // meta de ventilação minuto
}

/** Valores do último cálculo validado, para as regras de tendência. */
export interface RegistroAnterior {
  vte_kg?: number | null;
  cstat?: number | null;
  raw?: number | null;
  io?: number | null;
  is_osi?: number | null;
  spo2?: number | null;
  etco2?: number | null;
  // Ampliado para as tendências de pressão, CO₂ e parâmetros (specs 2 e 3)
  pip?: number | null;
  pplat?: number | null;
  map?: number | null;
  dp?: number | null;
  auto_peep?: number | null;
  vmin?: number | null;
  paco2?: number | null;
  gradiente_co2?: number | null;
  pf?: number | null;
  fio2?: number | null;         // %
  peep_prog?: number | null;
  fr?: number | null;
  ti?: number | null;
}

/** Observações de beira-leito que não são números, mas mudam a leitura dos alarmes. */
export interface ContextoAlarmes {
  categoria?: CategoriaIR | null;
  fluxoExpRetornaZero?: boolean | null;   // null = não observado
  estrategiaDeliberada?: boolean;         // I:E invertida ou VTe fora da faixa, documentado
  instabilidadeHemodinamica?: boolean;
  difFontesMin?: number | null;           // minutos entre gasometria e parâmetros
  anterior?: RegistroAnterior | null;
  // Idade do último cálculo validado. Acima de LIMIARES.tendenciaHoras as regras
  // de tendência não valem: "queda abrupta" contra um valor de três dias atrás
  // não descreve nada. Sem este dado, a comparação é feita como antes.
  anteriorHorasAtras?: number | null;
  // Metas individuais e dados do ventilador que não entram em fórmula
  metas?: MetasIndividuais;
  vtProgramadoMl?: number | null;         // volume corrente programado
  ieInformada?: number | null;            // Te ÷ Ti mostrado no ventilador
  // Observações de beira-leito das specs 2 e 3
  ovasFixa?: boolean | null;              // true = obstrução fixa; false = dinâmica (malácia)
  obstrucaoPersistente?: boolean;         // estridor importante ou dificuldade de ventilação
  apneia?: boolean;                       // apneia ou ausência de disparo
  backupFrequente?: boolean;              // ativação frequente da ventilação de backup
  interrupcaoFluxoInsp?: boolean;         // fluxo inspiratório interrompido precocemente
  pipNoLimite?: boolean;                  // PIP atinge repetidamente o limite máximo
  tauIncompativel?: boolean;              // constante calculada não corresponde às curvas
  assincronias?: Assincronia[];
  sinaisVni?: SinalVni[];
  reavaliacaoRegistrada?: boolean;        // mudança de parâmetro já justificada nesta avaliação
}

const ORDEM: Record<NivelAlarme, number> = { critico: 0, atencao: 1, info: 2 };
const pct = (atual: number, ant: number) => (ant === 0 ? null : arred(((atual - ant) / Math.abs(ant)) * 100, 1));

/**
 * Avalia todos os alarmes das specs a partir dos dados de entrada, dos resultados
 * calculados, do ciclo estimado e do contexto de beira-leito.
 * Devolve a lista ordenada por prioridade. Nenhuma mensagem sugere conduta.
 */
export function avaliarAlarmes(
  e: EntradaCalc,
  calc: CalculoCompleto,
  ciclo: CicloEstimado | null,
  ctx: ContextoAlarmes = {},
): Alarme[] {
  const out: Alarme[] = [];
  const add = (a: Alarme) => out.push(a);
  const valor = (k: IndicadorKey): number | null => {
    const r = [...calc.oxigenacao, ...calc.ventilacao, ...calc.mecanica].find(x => x.key === k);
    return r?.valor ?? null;
  };
  const cat = ctx.categoria ?? null;
  // Tendência só vale contra um cálculo recente. Fora da janela, o registro
  // anterior é ignorado por todas as regras de comparação (a0 fica nulo).
  const horasAnterior = ctx.anteriorHorasAtras;
  const anteriorForaDaJanela = ctx.anterior != null && tem(horasAnterior) && horasAnterior > LIMIARES.tendenciaHoras;
  const a0 = anteriorForaDaJanela ? null : (ctx.anterior ?? null);
  const ehOvai = cat === 'ovai';
  const ehTecido = cat === 'tecido' || cat === 'misto';

  // ── SpO₂ e FiO₂ (item 3) ──────────────────────────────────────────────────
  // A meta individual registrada no bloco de suporte tem precedência sobre o padrão.
  const spo2 = e.spo2;
  const fio2 = e.fio2Pct;
  const metaMin = tem(ctx.metas?.spo2Min) ? ctx.metas!.spo2Min! : LIMIARES.spo2.metaMin;
  const metaMax = tem(ctx.metas?.spo2Max) ? ctx.metas!.spo2Max! : LIMIARES.spo2.metaMax;
  const metaIndividual = tem(ctx.metas?.spo2Min) || tem(ctx.metas?.spo2Max);
  const textoMeta = `${fmt(metaMin, 0)} a ${fmt(metaMax, 0)}%${metaIndividual ? ' (meta individual)' : ''}`;
  const foraMeta = tem(spo2) && (spo2 < metaMin || spo2 > metaMax);
  if (tem(spo2) && spo2 < LIMIARES.spo2.criticoAbaixo) {
    add({ id: 'spo2_critica', nivel: 'critico', titulo: 'SpO₂ abaixo de 88%', valor: `${fmt(spo2, 0)}%`, meta: textoMeta, verificar: 'Evitar períodos prolongados abaixo de 88%. Avaliar suporte, curvas e perfusão.' });
  } else if (tem(spo2) && spo2 < metaMin) {
    add({ id: 'spo2_baixa', nivel: 'atencao', titulo: 'SpO₂ abaixo da meta', valor: `${fmt(spo2, 0)}%`, meta: textoMeta, verificar: metaIndividual ? 'Abaixo da meta registrada para este paciente.' : 'Em PARDS grave, pode-se aceitar SpO₂ abaixo de 92% após otimizar a PEEP. Registre a meta individual no bloco de suporte.' });
  }
  if (tem(spo2) && spo2 > metaMax && tem(fio2) && fio2 > LIMIARES.fio2.arAmbiente) {
    add({ id: 'spo2_hiperoxia', nivel: 'atencao', titulo: `SpO₂ acima de ${fmt(metaMax, 0)}% com oxigênio suplementar`, valor: `SpO₂ ${fmt(spo2, 0)}% com FiO₂ ${fmt(fio2, 0)}%`, meta: `SpO₂ ${textoMeta}`, verificar: 'Possível hiperóxia. Reavaliar a FiO₂.' });
  }
  if (tem(spo2) && !e.sinalSpo2Ok) {
    add({ id: 'sinal_spo2', nivel: 'atencao', titulo: 'Qualidade do sinal da oximetria não conferida', valor: `SpO₂ ${fmt(spo2, 0)}%`, meta: 'Curva pletismográfica e sinal conferidos', verificar: 'Confirmar a curva pletismográfica antes de usar a SpO₂ nos índices e nas metas.' });
  }
  if (tem(fio2) && fio2 >= LIMIARES.fio2.critico && foraMeta) {
    add({ id: 'fio2_critica', nivel: 'critico', titulo: 'FiO₂ igual ou acima de 80% com SpO₂ fora da meta', valor: `FiO₂ ${fmt(fio2, 0)}% · SpO₂ ${tem(spo2) ? `${fmt(spo2, 0)}%` : '—'}`, meta: `SpO₂ ${textoMeta}`, verificar: 'Revisar recrutamento, estratégia ventilatória e hemodinâmica.' });
  } else if (tem(fio2) && fio2 >= LIMIARES.fio2.atencao) {
    add({ id: 'fio2_alta', nivel: 'atencao', titulo: 'FiO₂ igual ou acima de 60%', valor: `${fmt(fio2, 0)}%`, meta: 'Manter com justificativa e plano de redução', verificar: 'Registrar justificativa ou plano de redução da FiO₂.' });
  }
  // FiO₂ subindo para manter a mesma SpO₂ (item 3)
  if (tem(fio2) && tem(a0?.fio2) && fio2 - a0!.fio2! >= LIMIARES.fio2Delta
      && tem(spo2) && tem(a0?.spo2) && spo2 <= a0!.spo2! + 1) {
    add({ id: 'fio2_progressiva', nivel: 'atencao', titulo: 'FiO₂ aumentada sem ganho de saturação', valor: `FiO₂ ${fmt(a0!.fio2!, 0)}% → ${fmt(fio2, 0)}% com SpO₂ ${fmt(spo2, 0)}%`, meta: `SpO₂ ${textoMeta}`, verificar: 'Aumento progressivo da FiO₂ para manter a mesma SpO₂. Avaliar recrutamento, PEEP e evolução da doença.' });
  }

  // ── PEEP × FiO₂ (item 2) ──────────────────────────────────────────────────
  const ref = peepReferencia(fio2);
  if (ref && tem(e.peepProg)) {
    const abaixo = e.peepProg < ref.min;
    if (abaixo && tem(fio2) && fio2 >= LIMIARES.fio2.atencao) {
      add({ id: 'peep_critica', nivel: 'critico', titulo: 'FiO₂ igual ou acima de 60% com PEEP abaixo da referência', valor: `PEEP ${fmt(e.peepProg)} cmH₂O com FiO₂ ${fmt(fio2, 0)}%`, meta: `PEEP ${ref.min === ref.max ? fmt(ref.min) : `${fmt(ref.min)} a ${fmt(ref.max)}`} cmH₂O para FiO₂ ${ref.fio2}%`, verificar: 'Revisar recrutamento, hemodinâmica e estratégia ventilatória. A tabela é referência e não comanda ajuste.' });
    } else if (abaixo) {
      add({ id: 'peep_abaixo', nivel: 'atencao', titulo: 'PEEP abaixo da referência para a FiO₂', valor: `PEEP ${fmt(e.peepProg)} cmH₂O com FiO₂ ${fmt(fio2 as number, 0)}%`, meta: `PEEP ${ref.min === ref.max ? fmt(ref.min) : `${fmt(ref.min)} a ${fmt(ref.max)}`} cmH₂O para FiO₂ ${ref.fio2}%`, verificar: 'Conferir a meta individual. Individualizar em doença obstrutiva, cardiopatia, hipertensão pulmonar e alteração da parede torácica.' });
    }
    const dp = valor('dp');
    if (e.peepProg > ref.max && tem(dp) && dp > LIMIARES.drivingPressure) {
      add({ id: 'peep_acima', nivel: 'atencao', titulo: 'PEEP acima da referência com driving pressure elevada', valor: `PEEP ${fmt(e.peepProg)} cmH₂O · ΔP ${fmt(dp)} cmH₂O`, meta: `PEEP até ${fmt(ref.max)} cmH₂O para FiO₂ ${ref.fio2}%`, verificar: 'Avaliar hiperinsuflação e piora da complacência.' });
    }
  }
  if (ctx.instabilidadeHemodinamica && tem(e.peepProg)) {
    add({ id: 'peep_hemodinamica', nivel: 'critico', titulo: 'Instabilidade hemodinâmica com PEEP em uso', valor: `PEEP ${fmt(e.peepProg)} cmH₂O`, meta: 'Estabilidade hemodinâmica', verificar: 'Avaliar relação entre PEEP, retorno venoso, perfusão e débito cardíaco.' });
  }
  // PEEP fora da faixa individual registrada (spec de categorias, itens 5 e 6)
  const peepMin = ctx.metas?.peepMin;
  const peepMax = ctx.metas?.peepMax;
  if (tem(e.peepProg) && ((tem(peepMin) && e.peepProg < peepMin) || (tem(peepMax) && e.peepProg > peepMax))) {
    add({ id: 'peep_fora_meta', nivel: 'atencao', titulo: 'PEEP fora da faixa individual registrada', valor: `${fmt(e.peepProg)} cmH₂O`, meta: `${tem(peepMin) ? fmt(peepMin) : '—'} a ${tem(peepMax) ? fmt(peepMax) : '—'} cmH₂O`, verificar: 'Registrar a justificativa clínica ou revisar a meta do paciente.' });
  }
  // PEEP aumentada sem ganho de volume corrente (OVAI e OVAS)
  const vteKgAtual = valor('vte_kg');
  if ((ehOvai || cat === 'ovas') && tem(e.peepProg) && tem(a0?.peep_prog)
      && e.peepProg - a0!.peep_prog! >= LIMIARES.peepDelta
      && tem(vteKgAtual) && tem(a0?.vte_kg) && vteKgAtual <= a0!.vte_kg!) {
    add({ id: 'peep_sem_ganho', nivel: 'atencao', titulo: 'PEEP aumentada sem melhora do volume corrente', valor: `PEEP ${fmt(a0!.peep_prog!)} → ${fmt(e.peepProg)} cmH₂O · VTe ${fmt(vteKgAtual, 1)} mL/kg`, meta: 'Melhora objetiva do VTe, do disparo ou da sincronia', verificar: cat === 'ovas' ? 'Na obstrução fixa, a PEEP não substitui a avaliação da via aérea.' : 'Avaliar disparo, sincronia e hiperinsuflação antes de manter a PEEP elevada.' });
  }

  // ── Volume corrente (item 4) ──────────────────────────────────────────────
  const vteKg = valor('vte_kg');
  const classe = classificarVte(vteKg);
  if (classe && classe !== 'protetor' && tem(vteKg)) {
    const f = FAIXAS_VTE.find(x => x.classe === classe)!;
    const critico = classe === 'excessivo';
    if (!(ctx.estrategiaDeliberada && (classe === 'muito_baixo' || classe === 'baixo'))) {
      add({ id: `vte_${classe}`, nivel: critico ? 'critico' : 'atencao', titulo: f.label, valor: `${fmt(vteKg, 1)} mL/kg`, meta: '6 a 8 mL/kg (faixa protetora geral)', verificar: f.mensagem });
    }
  }
  if (!tem(e.pesoIdealKg) && tem(e.vteMl)) {
    add({ id: 'sem_peso_ideal', nivel: 'atencao', titulo: 'Sem peso ideal ou predito', valor: tem(e.pesoKg) ? `Usado o peso atual de ${fmt(e.pesoKg, 2)} kg` : 'Peso não informado', meta: 'VTe/kg pelo peso ideal ou predito', verificar: 'Informar o peso ideal ou predito, sobretudo com obesidade ou edema importante.' });
  }
  // VTe abaixo de 80% do volume programado (item 4)
  if (tem(e.vteMl) && tem(ctx.vtProgramadoMl) && ctx.vtProgramadoMl > 0) {
    const pctProg = arred((e.vteMl / ctx.vtProgramadoMl) * 100, 0);
    if (pctProg < LIMIARES.vteProgramadoPct) {
      add({ id: 'vte_programado', nivel: 'atencao', titulo: 'VTe abaixo de 80% do volume programado', valor: `${fmt(e.vteMl, 0)} mL de ${fmt(ctx.vtProgramadoMl, 0)} mL programados (${fmt(pctProg, 0)}%)`, meta: `Pelo menos ${LIMIARES.vteProgramadoPct}% do volume programado`, verificar: 'Avaliar vazamento, obstrução, complacência e condições do circuito.' });
    }
  }
  // VTe elevado com esforço espontâneo, duplo disparo ou empilhamento (item 4)
  const marcou = (a: Assincronia) => (ctx.assincronias ?? []).includes(a);
  if (tem(vteKg) && vteKg > 8 && (marcou('duplo_disparo') || marcou('empilhamento') || marcou('vte_espontaneo_alto'))) {
    add({ id: 'vte_esforco', nivel: 'atencao', titulo: 'Volume elevado com esforço espontâneo ou empilhamento', valor: `${fmt(vteKg, 1)} mL/kg`, meta: '6 a 8 mL/kg (faixa protetora geral)', verificar: 'Avaliar sedação, trigger, fluxo e ciclagem. Risco de volutrauma por esforço.' });
  }

  // ── Vazamento (item 5) ────────────────────────────────────────────────────
  const vaz = valor('vazamento_pct');
  const cv = classificarVazamento(vaz);
  if (cv && tem(vaz) && cv.nivel !== 'info') {
    add({ id: 'vazamento', nivel: cv.nivel, titulo: 'Vazamento', valor: `${fmt(vaz, 1)}%`, meta: `Abaixo de ${LIMIARES.vazamento}%`, verificar: cv.texto });
  }
  if (tem(e.vtiMl) && tem(e.vteMl) && e.vteMl > e.vtiMl) {
    add({ id: 'vazamento_inconsistente', nivel: 'atencao', titulo: 'Medida inconsistente: VTe maior que VTi', valor: `VTi ${fmt(e.vtiMl, 0)} mL · VTe ${fmt(e.vteMl, 0)} mL`, meta: 'VTe menor ou igual ao VTi', verificar: 'Revisar sensor, volumes e condições do ciclo. Vazamento negativo não é exibido.' });
  }

  // ── Pressões e mecânica (item 6) ──────────────────────────────────────────
  if (tem(e.pplat)) {
    if (e.pplat > LIMIARES.pplat.critico) {
      add({ id: 'pplat_critica', nivel: 'critico', titulo: 'Pressão de platô elevada', valor: `${fmt(e.pplat)} cmH₂O`, meta: `Até ${LIMIARES.pplat.atencao} cmH₂O`, verificar: 'Revisar estratégia protetora.' });
    } else if (e.pplat > LIMIARES.pplat.atencao) {
      add({ id: 'pplat_atencao', nivel: 'atencao', titulo: 'Pplat acima de 28 cmH₂O', valor: `${fmt(e.pplat)} cmH₂O`, meta: `Até ${LIMIARES.pplat.atencao} cmH₂O`, verificar: 'Até 32 cmH₂O pode exigir contextualização da parede torácica.' });
    }
    if (ehOvai && e.pplat > LIMIARES.pplat.obstrutiva) {
      add({ id: 'pplat_obstrutiva', nivel: 'atencao', titulo: 'Pplat acima de 30 cmH₂O em doença obstrutiva', valor: `${fmt(e.pplat)} cmH₂O`, meta: `Até ${LIMIARES.pplat.obstrutiva} cmH₂O na OVAI`, verificar: 'Confirmar que a medida foi válida, com pausa adequada.' });
    }
  }
  const dp = valor('dp');
  if (tem(dp) && dp > LIMIARES.drivingPressure) {
    add({ id: 'dp_alta', nivel: 'critico', titulo: 'Driving pressure elevada', valor: `${fmt(dp)} cmH₂O`, meta: `Até ${LIMIARES.drivingPressure} cmH₂O`, verificar: 'Revisar VTe, PEEP, recrutamento e complacência.' });
  }
  const autoPeep = valor('auto_peep');
  if (tem(autoPeep) && autoPeep >= LIMIARES.autoPeep) {
    add({ id: 'auto_peep', nivel: 'atencao', titulo: 'Auto-PEEP igual ou acima de 2 cmH₂O', valor: `${fmt(autoPeep)} cmH₂O`, meta: `Abaixo de ${LIMIARES.autoPeep} cmH₂O`, verificar: 'Verificar retorno do fluxo expiratório a zero, tempo expiratório, obstrução, FR, volume corrente e sincronia.' });
  }
  if (ctx.fluxoExpRetornaZero === false) {
    const grave = ctx.instabilidadeHemodinamica || (tem(spo2) && spo2 < LIMIARES.spo2.criticoAbaixo);
    add({ id: 'fluxo_exp', nivel: grave ? 'critico' : 'atencao', titulo: 'Fluxo expiratório não retorna a zero', valor: 'Observado à beira do leito', meta: 'Retorno do fluxo expiratório a zero antes do próximo ciclo', verificar: grave ? 'Associado a instabilidade ou dessaturação: avaliar hiperinsuflação dinâmica.' : 'Avaliar expiração incompleta e aprisionamento aéreo.' });
  }

  // ── Tendência de PIP e MAP (item 6) ───────────────────────────────────────
  if (a0) {
    const dPip = tem(e.pip) && tem(a0.pip) ? arred(e.pip - a0.pip, 1) : null;
    const dPplat = tem(e.pplat) && tem(a0.pplat) ? arred(e.pplat - a0.pplat, 1) : null;
    const quedaVte = tem(vteKg) && tem(a0.vte_kg) ? pct(vteKg, a0.vte_kg) : null;
    if (dPip != null && dPip >= LIMIARES.pipDelta && dPplat != null && dPplat >= LIMIARES.pplatDelta) {
      add({ id: 'pip_pplat_sobem', nivel: 'critico', titulo: 'PIP e Pplat aumentaram juntas', valor: `PIP +${fmt(dPip)} · Pplat +${fmt(dPplat)} cmH₂O`, meta: `Variação até ${LIMIARES.pipDelta} cmH₂O do último validado`, verificar: 'Avaliar redução da complacência: atelectasia, edema, pneumotórax, derrame, distensão abdominal ou assincronia.' });
    } else if (dPip != null && dPip >= LIMIARES.pipDelta && dPplat != null && Math.abs(dPplat) <= LIMIARES.pplatEstavel) {
      add({ id: 'pip_resistencia', nivel: 'atencao', titulo: 'PIP aumentou com Pplat estável', valor: `PIP +${fmt(dPip)} cmH₂O · Pplat ${fmt(dPplat, 1)} cmH₂O`, meta: `Variação até ${LIMIARES.pipDelta} cmH₂O`, verificar: 'Avaliar aumento de resistência: secreção, broncoespasmo, tubo dobrado ou água no circuito.' });
    }
    if (dPip != null && dPip <= -LIMIARES.pipDelta && quedaVte != null && quedaVte <= -LIMIARES.tendenciaPct) {
      add({ id: 'pip_queda_vte', nivel: 'critico', titulo: 'PIP caiu com redução do volume corrente', valor: `PIP ${fmt(dPip)} cmH₂O · VTe ${fmt(quedaVte, 0)}%`, meta: 'PIP e VTe estáveis', verificar: 'Considerar desconexão, vazamento ou perda da via aérea.' });
    }
    // MAP elevada sem melhora da oxigenação
    const io = valor('io'); const pf = valor('pf');
    const mapAtual = tem(e.map) ? e.map : null;
    if (tem(mapAtual) && tem(a0.map) && mapAtual - a0.map >= LIMIARES.mapDelta) {
      const ioPiorou = tem(io) && tem(a0.io) && io >= a0.io;
      const pfPiorou = tem(pf) && tem(a0.pf) && pf <= a0.pf;
      if (ioPiorou || pfPiorou) {
        add({ id: 'map_sem_ganho', nivel: 'atencao', titulo: 'MAP elevada sem melhora da oxigenação', valor: `MAP ${fmt(a0.map)} → ${fmt(mapAtual)} cmH₂O · ${ioPiorou ? `IO ${fmt(io as number)}` : `P/F ${fmt(pf as number, 0)}`}`, meta: 'Melhora da oxigenação após elevação da MAP', verificar: 'Avaliar excesso de pressão ou hiperinsuflação.' });
      }
    }
  }
  if (ctx.pipNoLimite) {
    add({ id: 'pip_limite', nivel: 'atencao', titulo: 'PIP atinge repetidamente o limite máximo', valor: tem(e.pip) ? `PIP ${fmt(e.pip)} cmH₂O` : 'Observado à beira do leito', meta: 'PIP abaixo do limite configurado', verificar: 'Possível interrupção precoce da inspiração e entrega insuficiente do VTe.' });
  }

  // ── Ventilação e CO₂ (item 7) ─────────────────────────────────────────────
  if (tem(e.ph)) {
    if (e.ph < LIMIARES.ph.critico) {
      add({ id: 'ph_critico', nivel: 'critico', titulo: 'pH abaixo de 7,10', valor: fmt(e.ph, 2), meta: `Igual ou acima de ${fmt(LIMIARES.ph.atencao, 2)}`, verificar: 'Avaliar ventilação, perfusão e causas metabólicas.' });
    } else if (e.ph < LIMIARES.ph.atencao) {
      add({ id: 'ph_atencao', nivel: 'atencao', titulo: 'pH abaixo de 7,20', valor: fmt(e.ph, 2), meta: `Igual ou acima de ${fmt(LIMIARES.ph.atencao, 2)}`, verificar: 'Na hipercapnia permissiva, contextualizar. Exceções: hipertensão intracraniana, hipertensão pulmonar grave, cardiopatias, instabilidade e disfunção ventricular.' });
    }
  }
  if (tem(e.paco2) && tem(e.etco2) && e.etco2 <= 0) {
    add({ id: 'etco2_ausente', nivel: 'critico', titulo: 'EtCO₂ ausente em paciente intubado', valor: `${fmt(e.etco2)} mmHg`, meta: 'Curva de capnografia presente', verificar: 'Considerar desconexão, obstrução, perda da via aérea ou parada circulatória.' });
  }
  if (tem(ctx.difFontesMin) && ctx.difFontesMin > LIMIARES.fontesMin) {
    add({ id: 'fontes_incompativeis', nivel: 'atencao', titulo: 'Gasometria e parâmetros em horários incompatíveis', valor: `${fmt(ctx.difFontesMin, 0)} min de diferença`, meta: `Até ${LIMIARES.fontesMin} min`, verificar: 'Não misturar gasometria antiga com parâmetros ventilatórios atuais.' });
  }
  // PaCO₂ e gradiente em elevação; ventilação minuto contra a meta individual (item 7)
  const vmin = valor('vmin');
  const grad = valor('gradiente_co2');
  const paco2Subindo = tem(e.paco2) && tem(a0?.paco2) && e.paco2 - a0!.paco2! >= LIMIARES.paco2Delta;
  if (paco2Subindo) {
    add({ id: 'paco2_progressiva', nivel: 'atencao', titulo: 'PaCO₂ em elevação', valor: `${fmt(a0!.paco2!)} → ${fmt(e.paco2 as number)} mmHg`, meta: `Variação até ${LIMIARES.paco2Delta} mmHg do último validado`, verificar: 'Avaliar ventilação minuto, espaço morto, mecânica e sedação.' });
  }
  if (tem(grad) && tem(a0?.gradiente_co2) && grad - a0!.gradiente_co2! >= LIMIARES.paco2Delta) {
    add({ id: 'gradiente_crescente', nivel: 'atencao', titulo: 'Gradiente PaCO₂ − EtCO₂ crescente', valor: `${fmt(a0!.gradiente_co2!)} → ${fmt(grad)} mmHg`, meta: `Variação até ${LIMIARES.paco2Delta} mmHg`, verificar: 'Avaliar aumento do espaço morto, débito cardíaco e perfusão pulmonar.' });
  }
  const metaVmin = ctx.metas?.vminLmin;
  if (tem(vmin) && tem(metaVmin) && vmin < metaVmin) {
    const deterioracao = paco2Subindo || (tem(e.etco2) && tem(a0?.etco2) && e.etco2 - a0!.etco2! >= LIMIARES.paco2Delta);
    add({ id: 'vmin_baixa', nivel: deterioracao ? 'critico' : 'atencao', titulo: 'Ventilação minuto abaixo da meta', valor: `${fmt(vmin, 2)} L/min`, meta: `Meta de ${fmt(metaVmin, 2)} L/min`, verificar: deterioracao ? 'Associada a elevação de PaCO₂ ou EtCO₂. Avaliar comando respiratório, disparo, fadiga e via aérea.' : 'Avaliar FR, volume corrente, sedação e comando respiratório.' });
  }
  if (tem(vmin) && tem(a0?.vmin) && vmin > a0!.vmin! && tem(e.paco2) && tem(a0?.paco2) && e.paco2 >= a0!.paco2!) {
    add({ id: 'vmin_sem_ganho', nivel: 'atencao', titulo: 'Ventilação minuto aumentada sem melhora da PaCO₂', valor: `VM ${fmt(a0!.vmin!, 2)} → ${fmt(vmin, 2)} L/min · PaCO₂ ${fmt(e.paco2, 1)} mmHg`, meta: 'Queda da PaCO₂ após aumento da ventilação minuto', verificar: 'Avaliar espaço morto, vazamento, distribuição da ventilação e débito cardíaco.' });
  }

  // ── Tempo, Ti, Te e I:E (spec de categorias, item 2; spec do Ti, item 8) ──
  const ie = valor('ie');
  const te = valor('te');
  if (tem(e.tiSeg) && ciclo?.tempoTotal != null && e.tiSeg >= ciclo.tempoTotal) {
    add({ id: 'ti_ciclo', nivel: 'critico', titulo: 'Ti igual ou maior que o tempo total do ciclo', valor: `Ti ${fmt(e.tiSeg, 2)} s · ciclo ${fmt(ciclo.tempoTotal, 2)} s`, meta: 'Ti menor que o tempo total do ciclo', verificar: 'Configuração temporal impossível. Revisar FR e Ti.' });
  } else if (tem(te) && te <= 0) {
    add({ id: 'te_zero', nivel: 'critico', titulo: 'Tempo expiratório igual ou menor que zero', valor: `${fmt(te, 2)} s`, meta: 'Maior que zero', verificar: 'Cálculo bloqueado. Revisar FR e Ti.' });
  }
  if (tem(ie) && ie < 1 && !ctx.estrategiaDeliberada) {
    add({ id: 'ie_invertida', nivel: 'atencao', titulo: 'Relação I:E invertida não intencional', valor: `Te ÷ Ti = ${fmt(ie, 2)}`, meta: cat ? REFERENCIA_CATEGORIA[cat].ie : 'Expiração maior que a inspiração', verificar: 'Relação 1:1 ou invertida apenas como estratégia deliberada, monitorada e registrada.' });
  }
  if (ciclo?.teMinimo != null && tem(te) && te < ciclo.teMinimo) {
    const grave = ehOvai && ctx.fluxoExpRetornaZero === false;
    // Na OVAI a spec recomenda de 4 a 5 τ; o alarme dispara no piso da faixa.
    const metaTe = ehOvai && ciclo.teMinimoMax != null
      ? `${fmt(ciclo.teMinimo, 2)} a ${fmt(ciclo.teMinimoMax, 2)} s (4 a 5 τ)`
      : `Mínimo de ${fmt(ciclo.teMinimo, 2)} s`;
    add({ id: 'te_curto', nivel: grave ? 'critico' : 'atencao', titulo: `Tempo expiratório abaixo de ${ehOvai ? '4' : '3'} constantes de tempo`, valor: `Te ${fmt(te, 2)} s`, meta: metaTe, verificar: grave ? 'Na OVAI, com fluxo expiratório sem retorno a zero: avaliar aprisionamento aéreo.' : 'Avaliar expiração incompleta e auto-PEEP.' });
  }
  // I:E do ventilador diferente da calculada (spec de categorias, item 2)
  if (tem(ie) && tem(ctx.ieInformada) && Math.abs(ie - ctx.ieInformada) > LIMIARES.ieDivergencia) {
    add({ id: 'ie_divergente', nivel: 'atencao', titulo: 'I:E informada diferente da calculada', valor: `Informada 1:${fmt(ctx.ieInformada, 1)} · calculada 1:${fmt(ie, 1)}`, meta: 'Mesma relação nas duas fontes', verificar: 'Conferir arredondamento, unidade e origem do dado (FR total × FR programada, Ti medido × programado).' });
  }
  // Auto-PEEP subindo depois de aumento de FR ou de Ti (item 8 e spec de categorias)
  if (tem(autoPeep) && tem(a0?.auto_peep) && autoPeep > a0!.auto_peep!
      && ((tem(e.fr) && tem(a0?.fr) && e.fr > a0!.fr!) || (tem(e.tiSeg) && tem(a0?.ti) && e.tiSeg > a0!.ti!))) {
    const subiu = tem(e.fr) && tem(a0?.fr) && e.fr > a0!.fr! ? 'FR' : 'Ti';
    add({ id: 'auto_peep_aumento', nivel: 'atencao', titulo: `Auto-PEEP aumentou depois da elevação do ${subiu}`, valor: `Auto-PEEP ${fmt(a0!.auto_peep!)} → ${fmt(autoPeep)} cmH₂O`, meta: 'Auto-PEEP estável após mudança de parâmetro', verificar: 'O aumento reduziu o tempo expiratório e elevou a PEEP total. Avaliar hiperinsuflação dinâmica.' });
  }
  if (ctx.tauIncompativel) {
    add({ id: 'tau_incompativel', nivel: 'atencao', titulo: 'Constante de tempo incompatível com as curvas', valor: ciclo?.tau != null ? `τ calculada ${fmt(ciclo.tau, 2)} s` : 'Observado à beira do leito', meta: 'Constante calculada compatível com a mecânica medida', verificar: 'Conferir resistência, complacência, pausa e vazamento antes de usar o Ti e o Te estimados.' });
  }
  // Ti curto com interrupção do fluxo inspiratório (doença do tecido)
  if (ehTecido && ctx.interrupcaoFluxoInsp) {
    const vteBaixo = tem(vteKg) && vteKg < 6;
    add({ id: 'ti_fluxo_interrompido', nivel: 'atencao', titulo: 'Fluxo inspiratório interrompido precocemente', valor: tem(e.tiSeg) ? `Ti ${fmt(e.tiSeg, 2)} s${vteBaixo ? ` · VTe ${fmt(vteKg as number, 1)} mL/kg` : ''}` : 'Observado à beira do leito', meta: cat ? REFERENCIA_CATEGORIA[cat].ti : 'Ti suficiente para a entrega do VTe', verificar: 'Avaliar se o Ti permite completar a entrega do volume corrente.' });
  }
  if (ciclo?.tau != null && tem(e.tiSeg)) {
    const n = e.tiSeg / ciclo.tau;
    if (n < 2) add({ id: 'ti_curto', nivel: 'atencao', titulo: 'Ti menor que 2 constantes de tempo', valor: `Ti ${fmt(e.tiSeg, 2)} s = ${fmt(n, 1)} τ`, meta: `Ti estimado de ${fmt(ciclo.tiEstimado ?? 0, 2)} s (3 τ)`, verificar: 'Avaliar fluxo inspiratório interrompido ou VTe insuficiente.' });
    else if (n > 4) add({ id: 'ti_longo', nivel: 'atencao', titulo: 'Ti maior que 4 constantes de tempo', valor: `Ti ${fmt(e.tiSeg, 2)} s = ${fmt(n, 1)} τ`, meta: `Ti estimado de ${fmt(ciclo.tiEstimado ?? 0, 2)} s (3 τ)`, verificar: 'Avaliar se há benefício no VTe ou na oxigenação.' });
  }
  if (ehOvai && tem(ie) && ie < 3) {
    add({ id: 'ie_ovai', nivel: ctx.fluxoExpRetornaZero === false ? 'critico' : 'atencao', titulo: 'Expiração menor que três vezes o Ti na OVAI', valor: `Te ÷ Ti = ${fmt(ie, 2)}`, meta: REFERENCIA_CATEGORIA.ovai.ie, verificar: 'Na OVAI, combinar a relação com fluxo expiratório, auto-PEEP, PEEP total, VTe e repercussão hemodinâmica.' });
  }
  if (ehTecido && tem(ie) && ie <= 1 && !ctx.estrategiaDeliberada) {
    add({ id: 'ie_tecido', nivel: 'atencao', titulo: 'Relação I:E igual ou acima de 1:1 na doença do tecido', valor: `Te ÷ Ti = ${fmt(ie, 2)}`, meta: REFERENCIA_CATEGORIA.tecido.ie, verificar: 'Documentar a estratégia deliberada quando intencional.' });
  }

  // ── Complacência e resistência: tendência (item 9) ────────────────────────
  const ant = a0;
  if (ant) {
    const cstat = valor('cstat');
    if (tem(cstat) && tem(ant.cstat)) {
      const v = pct(cstat, ant.cstat);
      if (v != null && v <= -LIMIARES.tendenciaPct) {
        add({ id: 'cstat_queda', nivel: 'atencao', titulo: 'Queda da complacência estática', valor: `${fmt(cstat)} mL/cmH₂O (${fmt(v, 0)}%)`, meta: `Variação até ${LIMIARES.tendenciaPct}% do último cálculo validado`, verificar: 'Avaliar atelectasia, edema, derrame, distensão abdominal e efeito da PEEP.' });
      }
      // Queda da complacência logo após aumento da PEEP (item 9)
      if (cstat < ant.cstat && tem(e.peepProg) && tem(ant.peep_prog) && e.peepProg - ant.peep_prog >= LIMIARES.peepDelta) {
        add({ id: 'cstat_pos_peep', nivel: 'atencao', titulo: 'Complacência piorou depois do aumento da PEEP', valor: `PEEP ${fmt(ant.peep_prog)} → ${fmt(e.peepProg)} cmH₂O · Cstat ${fmt(ant.cstat)} → ${fmt(cstat)} mL/cmH₂O`, meta: 'Melhora ou estabilidade da complacência após recrutamento', verificar: 'Avaliar hiperinsuflação e recrutabilidade antes de manter a PEEP.' });
      }
      // Piora simultânea de complacência, Pplat e driving pressure (item 9)
      const dpAgora = valor('dp');
      const pioraTripla = cstat < ant.cstat
        && tem(e.pplat) && tem(ant.pplat) && e.pplat > ant.pplat
        && tem(dpAgora) && tem(ant.dp) && dpAgora > ant.dp;
      if (pioraTripla) {
        add({ id: 'piora_simultanea', nivel: 'critico', titulo: 'Piora simultânea de complacência, Pplat e driving pressure', valor: `Cstat ${fmt(cstat)} mL/cmH₂O · Pplat ${fmt(e.pplat as number)} · ΔP ${fmt(dpAgora as number)} cmH₂O`, meta: 'Estabilidade dos três indicadores', verificar: 'Deterioração da mecânica pulmonar. Avaliar causa aguda e estratégia protetora.' });
      }
    }
    const raw = valor('raw');
    if (tem(raw) && tem(ant.raw)) {
      const v = pct(raw, ant.raw);
      if (v != null && v >= LIMIARES.tendenciaPct) {
        add({ id: 'raw_alta', nivel: 'atencao', titulo: 'Elevação da resistência das vias aéreas', valor: `${fmt(raw)} cmH₂O/L/s (+${fmt(v, 0)}%)`, meta: `Variação até ${LIMIARES.tendenciaPct}% do basal`, verificar: 'Avaliar secreção, broncoespasmo, tubo dobrado ou água no circuito.' });
      }
    }
    if (tem(vteKg) && tem(ant.vte_kg)) {
      const v = pct(vteKg, ant.vte_kg);
      if (v != null && v <= -LIMIARES.quedaAbruptaPct) {
        add({ id: 'vte_queda', nivel: 'critico', titulo: 'Queda abrupta do volume corrente', valor: `${fmt(vteKg, 1)} mL/kg (${fmt(v, 0)}%)`, meta: `Variação até ${LIMIARES.tendenciaPct}% do último validado`, verificar: 'Considerar desconexão, vazamento, obstrução ou perda da via aérea.' });
      } else if (v != null && Math.abs(v) > LIMIARES.tendenciaPct) {
        add({ id: 'vte_variacao', nivel: 'atencao', titulo: 'Variação do volume corrente acima de 20%', valor: `${fmt(vteKg, 1)} mL/kg (${v > 0 ? '+' : ''}${fmt(v, 0)}%)`, meta: `Variação até ${LIMIARES.tendenciaPct}%`, verificar: 'Comparar com o último valor validado e conferir vazamento e esforço.' });
      }
    }
    if (tem(e.etco2) && tem(ant.etco2)) {
      const v = pct(e.etco2, ant.etco2);
      if (v != null && v <= -LIMIARES.quedaAbruptaPct) {
        add({ id: 'etco2_queda', nivel: 'critico', titulo: 'Queda abrupta do EtCO₂', valor: `${fmt(e.etco2)} mmHg (${fmt(v, 0)}%)`, meta: `Variação até ${LIMIARES.quedaAbruptaPct}%`, verificar: 'Considerar desconexão, vazamento, perda da via aérea ou queda do débito cardíaco.' });
      }
    }
    if (tem(spo2) && tem(ant.spo2) && ant.spo2 - spo2 >= LIMIARES.quedaSpo2Pontos) {
      add({ id: 'spo2_queda', nivel: 'critico', titulo: 'Queda abrupta da SpO₂', valor: `${fmt(spo2, 0)}% (antes ${fmt(ant.spo2, 0)}%)`, meta: `Queda menor que ${LIMIARES.quedaSpo2Pontos} pontos`, verificar: 'Avaliar redução do VTe, perda de PEEP e alteração das curvas.' });
    }
    const io = valor('io'); const isOsi = valor('is_osi');
    const piorouIO = tem(io) && tem(ant.io) && io > ant.io;
    const piorouIS = tem(isOsi) && tem(ant.is_osi) && isOsi > ant.is_osi;
    if (piorouIO || piorouIS) {
      const q = piorouIO ? `IO ${fmt(io as number)} (antes ${fmt(ant.io as number)})` : `IS ${fmt(isOsi as number)} (antes ${fmt(ant.is_osi as number)})`;
      add({ id: 'indice_piora', nivel: 'atencao', titulo: 'Piora do índice de oxigenação', valor: q, meta: 'Tendência de queda ou estabilidade', verificar: 'Comparar com PEEP, FiO₂, complacência e hemodinâmica.' });
    }
  }

  // ── OVAS: obstrução de vias aéreas superiores (spec de categorias, item 4) ─
  if (cat === 'ovas') {
    if (ctx.obstrucaoPersistente) {
      add({ id: 'ovas_obstrucao', nivel: 'critico', titulo: 'Obstrução persistente de via aérea superior', valor: 'Estridor importante ou dificuldade de ventilação', meta: 'Via aérea pérvia e ventilação efetiva', verificar: 'Considerar problema anatômico ou da via aérea artificial. A PEEP não corrige obstrução fixa.' });
    }
    const esforcoMarcado = marcou('esforco_ineficaz') || marcou('esforco_clinico');
    if (ctx.ovasFixa === false && (esforcoMarcado || (tem(vteKg) && vteKg < 6))) {
      add({ id: 'ovas_colapso', nivel: 'atencao', titulo: 'Colapso, esforço ou baixo VTe na via aérea colapsável', valor: tem(e.peepProg) ? `PEEP ${fmt(e.peepProg)} cmH₂O${tem(vteKg) ? ` · VTe ${fmt(vteKg, 1)} mL/kg` : ''}` : 'Observado à beira do leito', meta: tem(peepMin) ? `PEEP de sustentação de ${fmt(peepMin)} cmH₂O` : REFERENCIA_CATEGORIA.ovas.peep, verificar: 'Na malácia, titular a PEEP para estabilizar a via aérea e registrar a PEEP de sustentação.' });
    }
    if (ctx.ovasFixa === true && tem(e.peepProg) && tem(a0?.peep_prog) && e.peepProg > a0!.peep_prog!) {
      add({ id: 'ovas_fixa_peep', nivel: 'atencao', titulo: 'PEEP elevada em obstrução fixa', valor: `PEEP ${fmt(a0!.peep_prog!)} → ${fmt(e.peepProg)} cmH₂O`, meta: REFERENCIA_CATEGORIA.ovas.peep, verificar: 'Na obstrução fixa, o aumento progressivo da PEEP não substitui a avaliação da via aérea.' });
    }
    if (marcou('ciclagem_precoce') || marcou('ciclagem_tardia')) {
      add({ id: 'ovas_ciclagem', nivel: 'atencao', titulo: 'Ti inadequado com ciclagem alterada', valor: marcou('ciclagem_precoce') ? 'Ciclagem precoce' : 'Ciclagem tardia', meta: REFERENCIA_CATEGORIA.ovas.ti, verificar: 'Ajustar o Ti para entrega adequada do VTe, sem ciclagem precoce ou tardia.' });
    }
  }

  // ── Descontrole da respiração ou falha da bomba (spec de categorias, item 6) ─
  if (ctx.apneia) {
    add({ id: 'apneia', nivel: 'critico', titulo: 'Apneia ou ausência de disparo', valor: 'Observado à beira do leito', meta: 'Disparo dentro do tempo configurado', verificar: 'Avaliar comando respiratório central, sedação, fadiga e via aérea.' });
  }
  if (ctx.backupFrequente) {
    add({ id: 'backup_frequente', nivel: 'atencao', titulo: 'Ativação frequente da ventilação de backup', valor: 'Observado à beira do leito', meta: 'Disparo espontâneo efetivo', verificar: 'Avaliar comando respiratório, sensibilidade do disparo e sedação.' });
  }

  // ── Assincronia paciente–ventilador (item 10) ─────────────────────────────
  const marcadas = (ctx.assincronias ?? []).filter(k => ASSINCRONIAS.some(a => a.key === k));
  if (marcadas.length) {
    const nomes = marcadas.map(k => ASSINCRONIAS.find(a => a.key === k)!.label);
    add({ id: 'assincronia', nivel: 'atencao', titulo: 'Possível assincronia paciente–ventilador', valor: nomes.join(' · '), meta: 'Ciclos sincrônicos, sem esforço ineficaz', verificar: 'Revisar curvas, esforço respiratório, sedação, trigger, fluxo e ciclagem.' });
  }

  // ── Falha da VNI (item 11): só quando o suporte não é invasivo ────────────
  if (!e.emVmi && tem(fio2) && fio2 >= LIMIARES.fio2.atencao) {
    add({ id: 'vni_fio2', nivel: 'atencao', titulo: 'FiO₂ alta em suporte não invasivo', valor: `${fmt(fio2, 0)}%`, meta: `Abaixo de ${LIMIARES.fio2.atencao}%`, verificar: 'Sinal de possível falha da VNI. Avaliar esforço, FR, S/F e necessidade de escalonamento.' });
  }
  if (!e.emVmi) {
    const sinais = (ctx.sinaisVni ?? []).filter(k => SINAIS_VNI.some(s => s.key === k));
    if (sinais.length) {
      const itens = sinais.map(k => SINAIS_VNI.find(s => s.key === k)!);
      const critico = itens.some(s => s.critico);
      add({ id: 'vni_falha', nivel: critico ? 'critico' : 'atencao', titulo: `Sinais de falha da VNI (${itens.length})`, valor: itens.map(s => s.label).join(' · '), meta: 'Melhora clínica e das trocas gasosas nas primeiras seis horas', verificar: critico ? 'Avaliação imediata da estratégia e da necessidade de escalonamento.' : 'Avaliar estratégia, interface, parâmetros e necessidade de escalonamento.' });
    }
  }

  // ── Mudança de parâmetro sem reavaliação registrada (specs 2 e 3) ─────────
  if (a0 && !ctx.reavaliacaoRegistrada) {
    const mudou: string[] = [];
    const comparar = (rotulo: string, atual: number | null | undefined, antes: number | null | undefined, casas = 1, unidade = '') => {
      if (tem(atual) && tem(antes) && Math.abs(atual - antes) > 0.001) mudou.push(`${rotulo} ${fmt(antes, casas)} → ${fmt(atual, casas)}${unidade}`);
    };
    comparar('FR', e.fr, a0.fr, 0, ' irpm');
    comparar('Ti', e.tiSeg, a0.ti, 2, ' s');
    comparar('PEEP', e.peepProg, a0.peep_prog, 1, ' cmH₂O');
    comparar('FiO₂', fio2, a0.fio2, 0, '%');
    if (mudou.length) {
      add({ id: 'sem_reavaliacao', nivel: 'atencao', titulo: 'Parâmetro alterado desde a última avaliação validada', valor: mudou.join(' · '), meta: 'Reavaliação clínica e ventilatória registrada após a mudança', verificar: 'Registrar a reavaliação, a justificativa e o prazo de nova conferência ao validar este cálculo.' });
    }
  }

  // Transparência: diz que não há comparação e por quê, em vez de simplesmente
  // não mostrar nenhuma tendência.
  if (anteriorForaDaJanela) {
    add({ id: 'tendencia_antiga', nivel: 'info', titulo: 'Tendências não avaliadas nesta avaliação', valor: `Último cálculo validado há ${fmt(horasAnterior as number, 0)} h`, meta: `Até ${LIMIARES.tendenciaHoras} h para comparar`, verificar: 'Variação de VTe, complacência, resistência, pressões, CO₂ e índices só é comparada com um cálculo recente. Os demais alarmes seguem valendo.' });
  }

  return out.sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel]);
}

/** Contagem por nível, para o resumo da aba. */
export function resumoAlarmes(lista: Alarme[]): Record<NivelAlarme, number> {
  return lista.reduce((acc, a) => ({ ...acc, [a.nivel]: acc[a.nivel] + 1 }), { critico: 0, atencao: 0, info: 0 });
}
