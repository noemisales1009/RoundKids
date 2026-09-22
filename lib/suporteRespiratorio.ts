// ============================================================================
// Suporte de Oxigenação e Ventilação — Round eletrônico da UTI Pediátrica
// Fonte: "Especificação do bloco de suporte de oxigenação e ventilação".
//
// Lógica pura, sem React nem Supabase (mesmo padrão de lib/pards.ts e
// lib/gasometria.ts). A interface fica em components/SuporteRespiratorioTab.tsx.
//
// Regra de ouro da spec (item 10): este módulo valida preenchimento e monta texto,
// mas NÃO gera conduta clínica automática.
// ============================================================================

import { normalizarFio2 } from './pards';

export type Situacao = 'ar_ambiente' | 'o2_convencional' | 'alto_fluxo' | 'vni' | 'vmi';

export type Dispositivo =
  | 'cateter_nasal' | 'mascara_simples' | 'mascara_parcial' | 'mascara_nao_reinalante'
  | 'venturi' | 'cnaf'
  | 'bipap' | 'cpap';

export type CampoKey =
  | 'fluxo_lmin' | 'fio2' | 'temperatura_c'
  | 'ipap' | 'epap' | 'peep' | 'pip'
  | 'fr' | 'ti_seg' | 'map' | 'vc_ml' | 'pressao_suporte';

// Valores como aparecem no formulário. FiO₂ fica em PERCENTUAL aqui (como o
// profissional digita); a conversão para fração decimal acontece em paraBanco().
export type Valores = Partial<Record<CampoKey, number | null>>;

// ── Item 1: situação atual (seleção única, obrigatória) ─────────────────────
export const SITUACOES: { key: Situacao; label: string; curto: string }[] = [
  { key: 'ar_ambiente', label: 'Ar ambiente', curto: 'Ar ambiente' },
  { key: 'o2_convencional', label: 'Oxigenoterapia convencional', curto: 'O₂ convencional' },
  { key: 'alto_fluxo', label: 'Oxigenoterapia de alto fluxo', curto: 'Alto fluxo' },
  { key: 'vni', label: 'Ventilação não invasiva', curto: 'VNI' },
  { key: 'vmi', label: 'Ventilação pulmonar mecânica invasiva', curto: 'VPM invasiva' },
];

// ── Itens 2, 3 e 4: dispositivos/modalidades de cada situação ───────────────
export const DISPOSITIVOS: Record<Situacao, { key: Dispositivo; label: string; texto: string }[]> = {
  ar_ambiente: [],
  o2_convencional: [
    { key: 'cateter_nasal', label: 'Cateter nasal de oxigênio', texto: 'cateter nasal de oxigênio' },
    { key: 'mascara_simples', label: 'Máscara facial simples', texto: 'máscara facial simples' },
    { key: 'mascara_parcial', label: 'Máscara parcialmente reinalante com reservatório', texto: 'máscara parcialmente reinalante com reservatório' },
    { key: 'mascara_nao_reinalante', label: 'Máscara não reinalante com reservatório', texto: 'máscara não reinalante com reservatório' },
  ],
  alto_fluxo: [
    { key: 'venturi', label: 'Máscara de Venturi', texto: 'máscara de Venturi' },
    { key: 'cnaf', label: 'Cânula nasal de alto fluxo (CNAF)', texto: 'CNAF' },
  ],
  vni: [
    { key: 'bipap', label: 'BIPAP', texto: 'VNI em BIPAP' },
    { key: 'cpap', label: 'CPAP', texto: 'VNI em CPAP' },
  ],
  vmi: [],
};

// ── Definição dos campos numéricos: rótulo, unidade fixa ao lado e faixa aceita ─
// As faixas são só checagem de digitação (pegar vírgula no lugar errado, zero a mais).
// Não são limites clínicos e não geram conduta.
export const CAMPOS: Record<CampoKey, { label: string; unidade: string; min: number; max: number; casas: number }> = {
  fluxo_lmin: { label: 'Fluxo', unidade: 'L/min', min: 0.1, max: 80, casas: 1 },
  fio2: { label: 'FiO₂', unidade: '%', min: 21, max: 100, casas: 0 },
  temperatura_c: { label: 'Temperatura do gás', unidade: '°C', min: 30, max: 40, casas: 1 },
  ipap: { label: 'IPAP', unidade: 'cmH₂O', min: 1, max: 60, casas: 1 },
  epap: { label: 'EPAP', unidade: 'cmH₂O', min: 1, max: 40, casas: 1 },
  peep: { label: 'PEEP', unidade: 'cmH₂O', min: 0, max: 40, casas: 1 },
  pip: { label: 'PIP', unidade: 'cmH₂O', min: 1, max: 80, casas: 1 },
  fr: { label: 'Frequência respiratória', unidade: 'irpm', min: 1, max: 150, casas: 0 },
  ti_seg: { label: 'Tempo inspiratório (Ti)', unidade: 'segundos', min: 0.1, max: 3, casas: 2 },
  map: { label: 'MAP (pressão média das vias aéreas)', unidade: 'cmH₂O', min: 1, max: 60, casas: 1 },
  vc_ml: { label: 'Volume corrente', unidade: 'mL', min: 1, max: 2000, casas: 0 },
  pressao_suporte: { label: 'Pressão de suporte', unidade: 'cmH₂O', min: 0, max: 60, casas: 1 },
};

// ── Item 5: modos ventilatórios e quais campos cada um exibe ────────────────
// A spec manda abrir os campos "conforme o modo", sem exigir o que é incompatível.
// Obrigatórios em qualquer modo (spec): modo, PEEP e FiO₂. Os demais são exibidos
// quando aplicáveis e ficam opcionais.
// ATENÇÃO: esta matriz é uma proposta técnica e precisa de validação clínica.
// O modo "Outro" exibe todos os campos, para nunca esconder algo que a equipe precise.
export type ModoVM = 'PCV' | 'VCV' | 'PRVC' | 'SIMV-PC' | 'SIMV-VC' | 'PSV' | 'Outro';

export const MODOS_VM: { key: ModoVM; label: string; campos: CampoKey[] }[] = [
  { key: 'PCV', label: 'PCV (pressão controlada)', campos: ['pip', 'fr', 'ti_seg', 'map', 'vc_ml'] },
  { key: 'VCV', label: 'VCV (volume controlado)', campos: ['vc_ml', 'fr', 'ti_seg', 'map', 'pip'] },
  { key: 'PRVC', label: 'PRVC (volume garantido com pressão regulada)', campos: ['vc_ml', 'fr', 'ti_seg', 'map', 'pip'] },
  { key: 'SIMV-PC', label: 'SIMV-PC + PS', campos: ['pip', 'fr', 'ti_seg', 'pressao_suporte', 'map', 'vc_ml'] },
  { key: 'SIMV-VC', label: 'SIMV-VC + PS', campos: ['vc_ml', 'fr', 'ti_seg', 'pressao_suporte', 'map', 'pip'] },
  { key: 'PSV', label: 'PSV / CPAP + PS (espontâneo)', campos: ['pressao_suporte', 'map', 'vc_ml'] },
  { key: 'Outro', label: 'Outro modo', campos: ['pip', 'fr', 'ti_seg', 'map', 'vc_ml', 'pressao_suporte'] },
];

export interface CampoExibido { key: CampoKey; obrigatorio: boolean; calculado?: boolean }

// Quais campos aparecem para a combinação escolhida, na ordem da spec.
export function camposPara(situacao: Situacao | null, dispositivo: Dispositivo | null, modo: string | null): CampoExibido[] {
  const ob = (...keys: CampoKey[]): CampoExibido[] => keys.map(key => ({ key, obrigatorio: true }));
  switch (situacao) {
    case 'o2_convencional':
      return dispositivo ? ob('fluxo_lmin') : [];
    case 'alto_fluxo':
      if (dispositivo === 'venturi') return ob('fluxo_lmin', 'fio2');
      if (dispositivo === 'cnaf') return ob('fluxo_lmin', 'temperatura_c', 'fio2');
      return [];
    case 'vni':
      if (dispositivo === 'bipap') {
        return [...ob('ipap', 'epap', 'fio2', 'fr', 'ti_seg'), { key: 'pressao_suporte', obrigatorio: false, calculado: true }];
      }
      if (dispositivo === 'cpap') return ob('peep', 'fio2');
      return [];
    case 'vmi': {
      const def = MODOS_VM.find(m => m.key === modo);
      if (!def) return [];
      // Ordem da tabela da spec: PIP, PEEP, FR, Ti, MAP, FiO₂, volume corrente, PS
      const ordem: CampoKey[] = ['pip', 'peep', 'fr', 'ti_seg', 'map', 'fio2', 'vc_ml', 'pressao_suporte'];
      const obrig: CampoKey[] = ['peep', 'fio2'];
      return ordem
        .filter(k => obrig.includes(k) || def.campos.includes(k))
        .map(key => ({ key, obrigatorio: obrig.includes(key) }));
    }
    default:
      return [];
  }
}

export const precisaDispositivo = (s: Situacao | null): boolean =>
  s === 'o2_convencional' || s === 'alto_fluxo' || s === 'vni';

// ── Cálculos (item 7.5 e tabela do item 5) ──────────────────────────────────
const arred = (n: number, casas: number) => Math.round(n * 10 ** casas) / 10 ** casas;

/** Pressão de suporte no BIPAP = IPAP − EPAP. Só quando IPAP > EPAP. */
export function calcPressaoSuporte(ipap?: number | null, epap?: number | null): number | null {
  if (ipap == null || epap == null || ipap <= epap) return null;
  return arred(ipap - epap, 1);
}

/** Volume corrente em mL/kg. */
export function calcVcMlKg(vcMl?: number | null, pesoKg?: number | null): number | null {
  if (vcMl == null || pesoKg == null || pesoKg <= 0) return null;
  return arred(vcMl / pesoKg, 1);
}

// ── Item 10: validação ──────────────────────────────────────────────────────
export interface EntradaValidacao {
  situacao: Situacao | null;
  dispositivo: Dispositivo | null;
  modo: string | null;
  valores: Valores;
  spo2?: number | null;
  spo2MetaMin?: number | null;
  spo2MetaMax?: number | null;
}

export function validar(e: EntradaValidacao): string[] {
  const erros: string[] = [];
  if (!e.situacao) return ['Selecione a situação atual do suporte respiratório.'];
  if (precisaDispositivo(e.situacao) && !e.dispositivo) erros.push('Selecione o dispositivo ou a modalidade.');
  if (e.situacao === 'vmi' && !e.modo) erros.push('Selecione o modo ventilatório.');

  for (const c of camposPara(e.situacao, e.dispositivo, e.modo)) {
    if (c.calculado) continue;
    const def = CAMPOS[c.key];
    const v = e.valores[c.key];
    if (v == null) {
      if (c.obrigatorio) erros.push(`${def.label}: campo obrigatório.`);
      continue;
    }
    if (v < def.min || v > def.max) {
      erros.push(`${def.label}: valor fora da faixa aceita (${fmtNum(def.min)} a ${fmtNum(def.max)} ${def.unidade}). Confira a digitação.`);
    }
  }

  if (e.situacao === 'vni' && e.dispositivo === 'bipap' && e.valores.ipap != null && e.valores.epap != null && e.valores.ipap <= e.valores.epap) {
    erros.push('IPAP deve ser maior que EPAP.');
  }
  if (e.situacao === 'vmi' && e.valores.pip != null && e.valores.peep != null && e.valores.pip <= e.valores.peep) {
    erros.push('PIP deve ser maior que PEEP.');
  }

  const pct = (v: number | null | undefined, nome: string) => {
    if (v != null && (v < 0 || v > 100)) erros.push(`${nome}: informe um valor entre 0 e 100%.`);
  };
  pct(e.spo2, 'SpO₂ atual');
  pct(e.spo2MetaMin, 'Meta de SpO₂ (mínima)');
  pct(e.spo2MetaMax, 'Meta de SpO₂ (máxima)');
  if (e.spo2MetaMin != null && e.spo2MetaMax != null && e.spo2MetaMin > e.spo2MetaMax) {
    erros.push('Meta de SpO₂: a mínima não pode ser maior que a máxima.');
  }
  return erros;
}

/** Campos opcionais exibidos e deixados em branco: apenas sinalizados, sem bloquear (item 10). */
export function camposAusentes(situacao: Situacao | null, dispositivo: Dispositivo | null, modo: string | null, valores: Valores): string[] {
  return camposPara(situacao, dispositivo, modo)
    .filter(c => !c.obrigatorio && !c.calculado && valores[c.key] == null)
    .map(c => CAMPOS[c.key].label);
}

/** Início do novo episódio não pode ser futuro nem anterior ao início do episódio que ele encerra. */
export function validarInicio(inicioIso: string, inicioAnteriorIso?: string | null, agora: Date = new Date()): string | null {
  const t = new Date(inicioIso).getTime();
  if (!Number.isFinite(t)) return 'Informe a data e a hora de início.';
  if (t > agora.getTime() + 60_000) return 'A data de início não pode estar no futuro.';
  if (inicioAnteriorIso && t < new Date(inicioAnteriorIso).getTime()) {
    return 'A retirada do suporte anterior não pode ser anterior ao início dele.';
  }
  return null;
}

// ── Conversão formulário ⇄ banco ────────────────────────────────────────────
/** Só os campos aplicáveis vão para o banco; FiO₂ vira fração decimal (padrão de pards_avaliacoes). */
export function paraBanco(situacao: Situacao, dispositivo: Dispositivo | null, modo: string | null, valores: Valores, pesoKg?: number | null) {
  const aplicaveis = new Set(camposPara(situacao, dispositivo, modo).map(c => c.key));
  const v = (k: CampoKey) => (aplicaveis.has(k) ? valores[k] ?? null : null);
  const ps = situacao === 'vni' && dispositivo === 'bipap' ? calcPressaoSuporte(valores.ipap, valores.epap) : v('pressao_suporte');
  const vcMl = v('vc_ml');
  const vcKg = calcVcMlKg(vcMl, pesoKg);
  const fio2Pct = v('fio2');
  return {
    modo: situacao === 'vmi' ? modo : null,
    fluxo_lmin: v('fluxo_lmin'),
    fio2: fio2Pct != null ? normalizarFio2(fio2Pct) : null,
    temperatura_c: v('temperatura_c'),
    ipap: v('ipap'),
    epap: v('epap'),
    peep: v('peep'),
    pip: v('pip'),
    fr: v('fr'),
    ti_seg: v('ti_seg'),
    map: v('map'),
    vc_ml: vcMl,
    vc_ml_kg: vcKg,
    peso_kg: vcKg != null ? pesoKg ?? null : null,
    pressao_suporte: ps,
  };
}

/** Linha do banco → valores do formulário (FiO₂ de volta para percentual). */
export function doBanco(row: Partial<Record<CampoKey, number | string | null>>): Valores {
  const out: Valores = {};
  (Object.keys(CAMPOS) as CampoKey[]).forEach(k => {
    const bruto = row[k];
    if (bruto == null || bruto === '') return;
    const n = Number(bruto);
    if (!Number.isFinite(n)) return;
    out[k] = k === 'fio2' ? arred(n <= 1 ? n * 100 : n, 0) : n;
  });
  return out;
}

// ── Formatação ──────────────────────────────────────────────────────────────
/** Número no padrão brasileiro, sem zeros sobrando: 0.8 → "0,8"; 20 → "20". */
export function fmtNum(n: number): string {
  return String(arred(n, 2)).replace('.', ',');
}

/** "21/09/2026 às 14h" ou "21/09/2026 às 14h30", em horário de Brasília. */
export function fmtDesde(iso: string): string {
  const d = new Date(iso);
  const data = d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });
  const [h, m] = d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).split(':');
  return `${data} às ${Number(h)}h${m === '00' ? '' : m}`;
}

/** Tempo total de utilização (item 6): "3 d 4 h", "5 h 20 min", "12 min". */
export function duracao(inicioIso: string, fimIso?: string | null, agora: Date = new Date()): string {
  const ms = (fimIso ? new Date(fimIso).getTime() : agora.getTime()) - new Date(inicioIso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const min = Math.floor(ms / 60_000);
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d > 0) return `${d} d ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

export function rotuloSuporte(situacao: Situacao, dispositivo?: Dispositivo | null): string {
  const s = SITUACOES.find(x => x.key === situacao);
  const d = DISPOSITIVOS[situacao].find(x => x.key === dispositivo);
  return d ? d.label : s?.label ?? situacao;
}

// Junta itens em frase: ["a", "b", "c"] → "a, b e c"
const lista = (itens: string[]): string =>
  itens.length <= 1 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;

// ── Item 8: texto clínico gerado automaticamente (rascunho para revisão) ─────
export interface EntradaTexto {
  situacao: Situacao | null;
  dispositivo: Dispositivo | null;
  modo: string | null;
  valores: Valores;
  inicioIso?: string | null;
  pesoKg?: number | null;
  spo2?: number | null;
  spo2MetaMin?: number | null;
  spo2MetaMax?: number | null;
}

export function gerarTexto(e: EntradaTexto): string {
  if (!e.situacao) return '';
  const v = e.valores;
  const tem = (k: CampoKey) => v[k] != null;
  const val = (k: CampoKey) => `${fmtNum(v[k] as number)} ${CAMPOS[k].unidade}`;
  const desde = e.inicioIso ? `, em uso desde ${fmtDesde(e.inicioIso)}` : '';
  let frase: string;

  if (e.situacao === 'ar_ambiente') {
    frase = `Paciente em ar ambiente${e.inicioIso ? ` desde ${fmtDesde(e.inicioIso)}` : ''}.`;
  } else if (e.situacao === 'vmi') {
    const partes: string[] = [];
    if (e.modo) partes.push(`modo ${e.modo}`);
    if (tem('pip')) partes.push(`PIP ${val('pip')}`);
    if (tem('peep')) partes.push(`PEEP ${val('peep')}`);
    if (tem('fr')) partes.push(`FR ${val('fr')}`);
    if (tem('ti_seg')) partes.push(`Ti ${fmtNum(v.ti_seg as number)} s`);
    if (tem('pressao_suporte')) partes.push(`PS ${val('pressao_suporte')}`);
    if (tem('vc_ml')) {
      const kg = calcVcMlKg(v.vc_ml, e.pesoKg);
      partes.push(`VC ${val('vc_ml')}${kg != null ? ` (${fmtNum(kg)} mL/kg)` : ''}`);
    }
    if (tem('map')) partes.push(`MAP ${val('map')}`);
    if (tem('fio2')) partes.push(`FiO₂ de ${fmtNum(v.fio2 as number)}%`);
    frase = `Paciente em VPM invasiva${partes.length ? `, ${lista(partes)}` : ''}${desde}.`;
  } else {
    const disp = DISPOSITIVOS[e.situacao].find(d => d.key === e.dispositivo);
    const nome = disp ? disp.texto : SITUACOES.find(s => s.key === e.situacao)?.label.toLowerCase() ?? '';
    const partes: string[] = [];
    if (e.dispositivo === 'bipap') {
      if (tem('ipap')) partes.push(`IPAP ${val('ipap')}`);
      if (tem('epap')) partes.push(`EPAP ${val('epap')}`);
      const ps = calcPressaoSuporte(v.ipap, v.epap);
      if (ps != null) partes.push(`pressão de suporte ${fmtNum(ps)} cmH₂O`);
      if (tem('fr')) partes.push(`FR programada ${val('fr')}`);
      if (tem('ti_seg')) partes.push(`Ti ${fmtNum(v.ti_seg as number)} s`);
      if (tem('fio2')) partes.push(`FiO₂ de ${fmtNum(v.fio2 as number)}%`);
    } else if (e.dispositivo === 'cpap') {
      if (tem('peep')) partes.push(`PEEP ${val('peep')}`);
      if (tem('fio2')) partes.push(`FiO₂ de ${fmtNum(v.fio2 as number)}%`);
    } else {
      if (tem('fluxo_lmin')) partes.push(`fluxo de ${val('fluxo_lmin')}`);
      if (tem('fio2')) partes.push(`FiO₂ de ${fmtNum(v.fio2 as number)}%`);
      if (tem('temperatura_c')) partes.push(`temperatura do gás de ${val('temperatura_c')}`);
    }
    frase = `Paciente em ${nome}${partes.length ? `, com ${lista(partes)}` : ''}${desde}.`;
  }

  // Item 9: relaciona o suporte à resposta de oxigenação
  const oxi: string[] = [];
  if (e.spo2 != null) oxi.push(`SpO₂ atual de ${fmtNum(e.spo2)}%`);
  if (e.spo2MetaMin != null && e.spo2MetaMax != null) oxi.push(`meta de SpO₂ entre ${fmtNum(e.spo2MetaMin)} e ${fmtNum(e.spo2MetaMax)}%`);
  else if (e.spo2MetaMin != null) oxi.push(`meta de SpO₂ a partir de ${fmtNum(e.spo2MetaMin)}%`);
  else if (e.spo2MetaMax != null) oxi.push(`meta de SpO₂ até ${fmtNum(e.spo2MetaMax)}%`);
  if (oxi.length) {
    const s = lista(oxi);
    frase += ` ${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
  }
  return frase;
}

/** Resumo curto de uma linha de parâmetros, para a lista do histórico. */
export function resumoParametros(situacao: Situacao, modo: string | null, valores: Valores): string {
  const partes: string[] = [];
  if (situacao === 'vmi' && modo) partes.push(modo);
  (Object.keys(CAMPOS) as CampoKey[]).forEach(k => {
    if (valores[k] == null) return;
    const curto = k === 'map' ? 'MAP' : k === 'fr' ? 'FR' : k === 'ti_seg' ? 'Ti' : k === 'vc_ml' ? 'VC' : k === 'pressao_suporte' ? 'PS' : k === 'temperatura_c' ? 'Temp' : CAMPOS[k].label;
    const un = k === 'ti_seg' ? 's' : CAMPOS[k].unidade;
    partes.push(`${curto} ${fmtNum(valores[k] as number)}${un === '%' ? '%' : ` ${un}`}`);
  });
  return partes.join(' · ') || 'Sem parâmetros';
}
