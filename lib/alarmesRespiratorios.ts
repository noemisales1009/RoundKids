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
};

/** Valores do último cálculo validado, para as regras de tendência. */
export interface RegistroAnterior {
  vte_kg?: number | null;
  cstat?: number | null;
  raw?: number | null;
  io?: number | null;
  is_osi?: number | null;
  spo2?: number | null;
  etco2?: number | null;
}

/** Observações de beira-leito que não são números, mas mudam a leitura dos alarmes. */
export interface ContextoAlarmes {
  categoria?: CategoriaIR | null;
  fluxoExpRetornaZero?: boolean | null;   // null = não observado
  estrategiaDeliberada?: boolean;         // I:E invertida ou VTe fora da faixa, documentado
  instabilidadeHemodinamica?: boolean;
  difFontesMin?: number | null;           // minutos entre gasometria e parâmetros
  anterior?: RegistroAnterior | null;
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
  const ehOvai = cat === 'ovai';
  const ehTecido = cat === 'tecido' || cat === 'misto';

  // ── SpO₂ e FiO₂ (item 3) ──────────────────────────────────────────────────
  const spo2 = e.spo2;
  const fio2 = e.fio2Pct;
  const foraMeta = tem(spo2) && (spo2 < LIMIARES.spo2.metaMin || spo2 > LIMIARES.spo2.metaMax);
  if (tem(spo2) && spo2 < LIMIARES.spo2.criticoAbaixo) {
    add({ id: 'spo2_critica', nivel: 'critico', titulo: 'SpO₂ abaixo de 88%', valor: `${fmt(spo2, 0)}%`, meta: `${LIMIARES.spo2.metaMin} a ${LIMIARES.spo2.metaMax}%`, verificar: 'Evitar períodos prolongados abaixo de 88%. Avaliar suporte, curvas e perfusão.' });
  } else if (tem(spo2) && spo2 < LIMIARES.spo2.metaMin) {
    add({ id: 'spo2_baixa', nivel: 'atencao', titulo: 'SpO₂ abaixo da meta', valor: `${fmt(spo2, 0)}%`, meta: `${LIMIARES.spo2.metaMin} a ${LIMIARES.spo2.metaMax}%`, verificar: 'Em PARDS grave, pode-se aceitar SpO₂ abaixo de 92% após otimizar a PEEP. Conferir a meta individual.' });
  }
  if (tem(spo2) && spo2 > LIMIARES.spo2.metaMax && tem(fio2) && fio2 > LIMIARES.fio2.arAmbiente) {
    add({ id: 'spo2_hiperoxia', nivel: 'atencao', titulo: 'SpO₂ acima de 97% com oxigênio suplementar', valor: `SpO₂ ${fmt(spo2, 0)}% com FiO₂ ${fmt(fio2, 0)}%`, meta: `SpO₂ ${LIMIARES.spo2.metaMin} a ${LIMIARES.spo2.metaMax}%`, verificar: 'Possível hiperóxia. Reavaliar a FiO₂.' });
  }
  if (tem(fio2) && fio2 >= LIMIARES.fio2.critico && foraMeta) {
    add({ id: 'fio2_critica', nivel: 'critico', titulo: 'FiO₂ igual ou acima de 80% com SpO₂ fora da meta', valor: `FiO₂ ${fmt(fio2, 0)}% · SpO₂ ${tem(spo2) ? `${fmt(spo2, 0)}%` : '—'}`, meta: `SpO₂ ${LIMIARES.spo2.metaMin} a ${LIMIARES.spo2.metaMax}%`, verificar: 'Revisar recrutamento, estratégia ventilatória e hemodinâmica.' });
  } else if (tem(fio2) && fio2 >= LIMIARES.fio2.atencao) {
    add({ id: 'fio2_alta', nivel: 'atencao', titulo: 'FiO₂ igual ou acima de 60%', valor: `${fmt(fio2, 0)}%`, meta: 'Manter com justificativa e plano de redução', verificar: 'Registrar justificativa ou plano de redução da FiO₂.' });
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
    add({ id: 'te_curto', nivel: grave ? 'critico' : 'atencao', titulo: `Tempo expiratório abaixo de ${ehOvai ? '4' : '3'} constantes de tempo`, valor: `Te ${fmt(te, 2)} s`, meta: `Mínimo de ${fmt(ciclo.teMinimo, 2)} s`, verificar: grave ? 'Na OVAI, com fluxo expiratório sem retorno a zero: avaliar aprisionamento aéreo.' : 'Avaliar expiração incompleta e auto-PEEP.' });
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
  const ant = ctx.anterior;
  if (ant) {
    const cstat = valor('cstat');
    if (tem(cstat) && tem(ant.cstat)) {
      const v = pct(cstat, ant.cstat);
      if (v != null && v <= -LIMIARES.tendenciaPct) {
        add({ id: 'cstat_queda', nivel: 'atencao', titulo: 'Queda da complacência estática', valor: `${fmt(cstat)} mL/cmH₂O (${fmt(v, 0)}%)`, meta: `Variação até ${LIMIARES.tendenciaPct}% do último cálculo validado`, verificar: 'Avaliar atelectasia, edema, derrame, distensão abdominal e efeito da PEEP.' });
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

  // ── Falha da VNI (item 11): só quando o suporte não é invasivo ────────────
  if (!e.emVmi && tem(fio2) && fio2 >= LIMIARES.fio2.atencao) {
    add({ id: 'vni_fio2', nivel: 'atencao', titulo: 'FiO₂ alta em suporte não invasivo', valor: `${fmt(fio2, 0)}%`, meta: `Abaixo de ${LIMIARES.fio2.atencao}%`, verificar: 'Sinal de possível falha da VNI. Avaliar esforço, FR, S/F e necessidade de escalonamento.' });
  }

  return out.sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel]);
}

/** Contagem por nível, para o resumo da aba. */
export function resumoAlarmes(lista: Alarme[]): Record<NivelAlarme, number> {
  return lista.reduce((acc, a) => ({ ...acc, [a.nivel]: acc[a.nivel] + 1 }), { critico: 0, atencao: 0, info: 0 });
}
