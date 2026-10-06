// Cálculos das análises complementares do painel (lógica pura, sem Supabase nem React).
// Nenhum limiar clínico é decidido aqui: as listas são ordenadas (mais antigo primeiro)
// e quem lê decide o que é "tempo demais".

const MS_DIA = 86_400_000;
const MS_HORA = 3_600_000;

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

export const dataLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 'YYYY-MM-DD' -> 'DD/MM'
export const diaMes = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

// Dias de calendário desde a data (o dia da inserção conta como dia 0)
export function diasDesde(iso: string | null | undefined, agora: Date = new Date()): number | null {
  if (!iso) return null;
  const inicio = new Date(iso.slice(0, 10) + 'T00:00:00');
  if (isNaN(inicio.getTime())) return null;
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.max(0, Math.round((hoje.getTime() - inicio.getTime()) / MS_DIA));
}

export function mediana(valores: number[]): number | null {
  if (valores.length === 0) return null;
  const v = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
}

// ── Dispositivos invasivos ───────────────────────────────────────────────────
// Ficam de fora os suportes não invasivos, o curativo e o VPM (o ventilador em si:
// a via aérea já é contada pelo TOT ou pela TQT).
const NAO_INVASIVO = /cnaf|\bvni\b|ventur|masc|cateter nasal|curativo|\bvpm\b/;
export const isDispositivoInvasivo = (tipo: string) => !NAO_INVASIVO.test(norm(tipo));

// "CVC 1" e "CVC 2" -> "CVC"; "DRENO TORÁXICO D" -> "DRENO TORÁXICO"
export const grupoDispositivo = (tipo: string) =>
  tipo.trim().toUpperCase().replace(/\s*\d+$/, '').replace(/\s+[DE]$/, '').trim();

export interface ItemDias { pacienteId: string; nome: string; detalhe?: string; dias: number }
export interface ResumoDias { grupo: string; total: number; mediana: number; maximo: number; itens: ItemDias[] }

// Agrupa itens com dias de uso e ordena: grupos pelo maior tempo, itens do mais antigo ao mais novo
export function resumirPorGrupo(itens: Array<ItemDias & { grupo: string }>): ResumoDias[] {
  const grupos = new Map<string, ItemDias[]>();
  itens.forEach(({ grupo, ...item }) => grupos.set(grupo, [...(grupos.get(grupo) || []), item]));
  return Array.from(grupos.entries())
    .map(([grupo, lista]) => {
      const dias = lista.map(i => i.dias);
      return {
        grupo,
        total: lista.length,
        mediana: mediana(dias) ?? 0,
        maximo: Math.max(...dias),
        itens: lista.sort((a, b) => b.dias - a.dias),
      };
    })
    .sort((a, b) => b.maximo - a.maximo);
}

// ── Antimicrobianos ──────────────────────────────────────────────────────────
// Mesmos nomes dos grupos "Antibióticos" e "Antifúngicos" de MEDICATION_LIST (constants.ts).
// Medicação digitada fora da lista só entra se a categoria dela disser que é antimicrobiano.
const ANTIMICROBIANOS = [
  'tazocin', 'oxacilina', 'cefepime', 'linezolida', 'ampicilina', 'cefalotina', 'sulfametoxazol',
  'ciprofloxacino', 'levofloxacino', 'anfotericina', 'meropenem', 'polimixina', 'amicacina',
  'ceftriaxone', 'teicoplanina', 'vancomicina', 'cefazolina', 'metronidazol', 'gentamicina',
  'tigeciclina', 'torgena', 'aztreonam', 'fluconazol', 'micafungina',
];
export function isAntimicrobiano(nome: string, categoria?: string | null): boolean {
  if (categoria && /antibi|antifung|antimicrob|antivir/.test(norm(categoria))) return true;
  const n = norm(nome);
  return ANTIMICROBIANOS.some(a => n.includes(a));
}

// ── Perfil dos internados ────────────────────────────────────────────────────
export const FAIXAS_ETARIAS = ['Menos de 1 mês', '1 a 11 meses', '1 a 4 anos', '5 a 9 anos', '10 anos ou mais', 'Sem data de nascimento'] as const;
export type FaixaEtaria = typeof FAIXAS_ETARIAS[number];

export function faixaEtaria(dob: string | null | undefined, agora: Date = new Date()): FaixaEtaria {
  if (!dob) return 'Sem data de nascimento';
  const nasc = new Date(dob.slice(0, 10) + 'T00:00:00');
  if (isNaN(nasc.getTime())) return 'Sem data de nascimento';
  let meses = (agora.getFullYear() - nasc.getFullYear()) * 12 + (agora.getMonth() - nasc.getMonth());
  if (agora.getDate() < nasc.getDate()) meses--;
  if (meses < 1) return 'Menos de 1 mês';
  if (meses < 12) return '1 a 11 meses';
  if (meses < 60) return '1 a 4 anos';
  if (meses < 120) return '5 a 9 anos';
  return '10 anos ou mais';
}

// ── Alertas atrasados ────────────────────────────────────────────────────────
export function horasDeAtraso(deadline: string | null | undefined, agora: Date = new Date()): number | null {
  if (!deadline) return null;
  const prazo = new Date(deadline);
  if (isNaN(prazo.getTime())) return null;
  return Math.max(0, (agora.getTime() - prazo.getTime()) / MS_HORA);
}

export function formatarAtraso(horas: number): string {
  if (horas < 1) return 'menos de 1 h';
  if (horas < 48) return `${Math.round(horas)} h`;
  return `${Math.round(horas / 24)} dias`;
}

// ── Evolução no tempo ────────────────────────────────────────────────────────
// Reconstrói o passado pelas datas já gravadas (internação, arquivamento, criação),
// em blocos de 7 dias terminando hoje — assim a última semana nunca fica "pela metade".
export interface PacienteHistorico { id: string; dt_internacao: string | null; archived_at: string | null }
export interface PrecaucaoHistorico { patient_id: string; data_inicio: string | null; archived_at: string | null }
export interface AlertaHistorico { created_at: string | null; deadline: string | null; concluded_at: string | null; archived_at: string | null }

export interface SemanaHistorico {
  inicio: string;            // 'YYYY-MM-DD'
  fim: string;
  ocupacaoMedia: number;     // pacientes internados por dia, média da semana
  isolamentosMedia: number;  // precauções ativas por dia, média da semana
  alertasCriados: number;
  alertasNoPrazoPct: number | null; // dos criados na semana e já vencidos ou concluídos, % concluídos até o prazo
}

const diaLocal = (ts: string | null) => {
  if (!ts) return null;
  // data pura fica como está; timestamp vira a data local
  if (ts.length <= 10) return ts;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : dataLocal(d);
};

export function historicoSemanal(e: {
  pacientes: PacienteHistorico[];
  precaucoes: PrecaucaoHistorico[];
  alertas: AlertaHistorico[];
  semanas?: number;
  agora?: Date;
}): SemanaHistorico[] {
  const agora = e.agora ?? new Date();
  const semanas = e.semanas ?? 8;
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const diaMenos = (n: number) => dataLocal(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - n));

  const pacientes = e.pacientes
    .filter(p => p.dt_internacao)
    .map(p => ({ id: p.id, entrada: p.dt_internacao!.slice(0, 10), saida: diaLocal(p.archived_at) }));
  const saidaDoPaciente = new Map(pacientes.map(p => [p.id, p.saida]));

  // A precaução termina quando é arquivada ou quando o paciente sai, o que vier primeiro
  const precaucoes = e.precaucoes
    .filter(p => p.data_inicio && saidaDoPaciente.has(p.patient_id))
    .map(p => {
      const fimPrec = diaLocal(p.archived_at);
      const fimPac = saidaDoPaciente.get(p.patient_id) ?? null;
      const fim = fimPrec && fimPac ? (fimPrec < fimPac ? fimPrec : fimPac) : (fimPrec ?? fimPac);
      return { inicio: p.data_inicio!.slice(0, 10), fim };
    });

  const alertas = e.alertas.filter(a => a.created_at).map(a => ({ ...a, dia: diaLocal(a.created_at)! }));

  const resultado: SemanaHistorico[] = [];
  for (let s = semanas - 1; s >= 0; s--) {
    const dias = Array.from({ length: 7 }, (_, i) => diaMenos(s * 7 + (6 - i)));
    const inicio = dias[0];
    const fim = dias[6];

    // no dia da saída o paciente já não ocupa o leito
    const ocupacao = dias.map(d => pacientes.filter(p => p.entrada <= d && (!p.saida || p.saida > d)).length);
    const isolamentos = dias.map(d => precaucoes.filter(p => p.inicio <= d && (!p.fim || p.fim > d)).length);

    const daSemana = alertas.filter(a => a.dia >= inicio && a.dia <= fim);
    const avaliaveis = daSemana.filter(a => a.deadline && (a.concluded_at || new Date(a.deadline) < agora));
    const noPrazo = avaliaveis.filter(a => a.concluded_at && new Date(a.concluded_at) <= new Date(a.deadline!));

    resultado.push({
      inicio,
      fim,
      ocupacaoMedia: ocupacao.reduce((a, b) => a + b, 0) / 7,
      isolamentosMedia: isolamentos.reduce((a, b) => a + b, 0) / 7,
      alertasCriados: daSemana.length,
      alertasNoPrazoPct: avaliaveis.length > 0 ? Math.round((noPrazo.length / avaliaveis.length) * 100) : null,
    });
  }
  return resultado;
}

// ── Risco ventilatório ───────────────────────────────────────────────────────
// Janelas de validade das avaliações: fora delas a avaliação é considerada antiga
// e o paciente entra em "sem avaliação recente", não em "sem risco".
export const JANELA_CALC_HORAS = 24;
export const JANELA_PARDS_HORAS = 48;

export interface AlarmeGravado { id?: string; nivel?: string; titulo?: string; valor?: string }

// A coluna "alertas" de calc_resp_avaliacoes já guardou texto puro em versões antigas
export function alarmesCriticos(alertas: unknown): AlarmeGravado[] {
  if (!Array.isArray(alertas)) return [];
  return alertas.filter((a): a is AlarmeGravado => !!a && typeof a === 'object' && (a as AlarmeGravado).nivel === 'critico');
}

// ── Tendência de suporte ventilatório (últimos 7 dias) ───────────────────────
// Quantos pacientes internados estavam em VM, VNI e CNAF em cada dia, pelo histórico
// de episódios do bloco de suporte e pelas datas de inserção/remoção dos dispositivos.
// Cada paciente conta uma vez por dia, na modalidade de maior suporte que teve naquele dia.
export interface EpisodioHistorico { paciente_id: string; situacao: string; dispositivo: string | null; inicio: string; fim: string | null }
export interface DispositivoHistorico { paciente_id: string; tipo_dispositivo: string | null; data_insercao: string | null; data_remocao: string | null; is_archived?: boolean | null }
export interface DiaSuporte { dia: string; rotulo: string; vm: number; vni: number; cnaf: number }

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
type Suporte = 'vm' | 'vni' | 'cnaf';

function suporteDoDispositivo(tipo: string): Suporte | null {
  const t = norm(tipo);
  // TQT sem outro registro conta como VM, mesma regra do cenário ventilatório
  if (/\btot\b|\bvpm\b|\btqt\b|traqueost/.test(t)) return 'vm';
  if (/\bvni\b|cpap|bipap/.test(t)) return 'vni';
  if (/cnaf/.test(t)) return 'cnaf';
  return null;
}

function suporteDoEpisodio(ep: EpisodioHistorico): Suporte | null {
  if (ep.situacao === 'vmi') return 'vm';
  if (ep.situacao === 'vni') return 'vni';
  if (ep.situacao === 'alto_fluxo' && ep.dispositivo === 'cnaf') return 'cnaf';
  return null;
}

export function tendenciaSuporte(e: {
  pacientes: PacienteHistorico[];
  episodios: EpisodioHistorico[];
  dispositivos: DispositivoHistorico[];
  dias?: number;
  agora?: Date;
}): DiaSuporte[] {
  const agora = e.agora ?? new Date();
  const total = e.dias ?? 7;
  const internacao = new Map(e.pacientes.map(p => [p.id, { entrada: p.dt_internacao ? p.dt_internacao.slice(0, 10) : null, saida: diaLocal(p.archived_at) }]));

  // Períodos de suporte por paciente: [início, fim] em datas locais (fim nulo = em curso)
  const periodos: Array<{ pacienteId: string; suporte: Suporte; inicio: string; fim: string | null }> = [];
  e.episodios.forEach(ep => {
    const suporte = suporteDoEpisodio(ep);
    const inicio = diaLocal(ep.inicio);
    if (suporte && inicio) periodos.push({ pacienteId: ep.paciente_id, suporte, inicio, fim: diaLocal(ep.fim) });
  });
  e.dispositivos.forEach(d => {
    const suporte = d.tipo_dispositivo ? suporteDoDispositivo(d.tipo_dispositivo) : null;
    const inicio = d.data_insercao ? d.data_insercao.slice(0, 10) : null;
    const fim = d.data_remocao ? d.data_remocao.slice(0, 10) : null;
    // arquivado sem data de remoção: não dá para saber até quando ficou, então não entra
    if (!suporte || !inicio || (d.is_archived && !fim)) return;
    periodos.push({ pacienteId: d.paciente_id, suporte, inicio, fim });
  });

  const resultado: DiaSuporte[] = [];
  for (let n = total - 1; n >= 0; n--) {
    const data = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - n);
    const dia = dataLocal(data);
    const porPaciente = new Map<string, Suporte>();
    periodos.forEach(p => {
      const int = internacao.get(p.pacienteId);
      if (!int || (int.entrada && int.entrada > dia) || (int.saida && int.saida < dia)) return;
      if (p.inicio > dia || (p.fim && p.fim < dia)) return;
      const atual = porPaciente.get(p.pacienteId);
      if (!atual || p.suporte === 'vm' || (p.suporte === 'vni' && atual === 'cnaf')) porPaciente.set(p.pacienteId, p.suporte);
    });
    const conta = (s: Suporte) => Array.from(porPaciente.values()).filter(v => v === s).length;
    resultado.push({ dia, rotulo: DIAS_SEMANA[data.getDay()], vm: conta('vm'), vni: conta('vni'), cnaf: conta('cnaf') });
  }
  return resultado;
}
