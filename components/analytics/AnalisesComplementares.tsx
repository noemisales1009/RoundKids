import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { DIAGNOSTICO_CATEGORIAS } from '../../constants';
import type { Modalidade } from '../../lib/cenarioVentilatorio';
import {
  FAIXAS_ETARIAS, JANELA_CALC_HORAS, JANELA_PARDS_HORAS,
  alarmesCriticos, dataLocal, diaMes, diasDesde, faixaEtaria, formatarAtraso, grupoDispositivo,
  historicoSemanal, horasDeAtraso, isAntimicrobiano, isDispositivoInvasivo, mediana, resumirPorGrupo, tendenciaSuporte,
  type DiaSuporte, type FaixaEtaria, type ResumoDias, type SemanaHistorico,
} from '../../lib/analisesClinicas';

export interface PacienteAnalise {
  id: string;
  name: string;
  bed_number: number | string | null;
  dob: string | null;
  dt_internacao: string | null;
}

export type AbaAnalises = 'agora' | 'infeccao' | 'respiratorio' | 'perfil';

interface Props {
  pacientes: PacienteAnalise[];
  modalidadePorPaciente: Record<string, Modalidade>;
  // Aba aberta na tela: o bloco fica sempre montado (busca os dados uma vez só) e mostra só os cards dela
  aba: AbaAnalises;
  // Cards da própria tela que entram na aba Perfil, antes da evolução no tempo
  antesDaEvolucao?: React.ReactNode;
}

const SEMANAS = 8;
// Modalidades em que se espera uma avaliação recente na Calculadora Respiratória
const EM_SUPORTE: Modalidade[] = ['CNAF', 'VNI', 'TQT em VM', 'TOT em VM'];

interface AlertaAtrasado { paciente: string; descricao: string; horas: number }
interface Dados {
  risco: {
    disponivel: boolean;
    emRisco: Array<{ id: string; nome: string; motivos: string[] }>;
    semAvaliacao: Array<{ id: string; nome: string; modalidade: Modalidade }>;
    avaliados: number;
  };
  dispositivos: ResumoDias[];
  antimicrobianos: ResumoDias[];
  alertasPorSistema: Array<{ sistema: string; total: number; maiorAtraso: number; itens: AlertaAtrasado[] }>;
  totalAtrasados: number;
  diagnosticosPorSistema: Array<{ categoria: string; pacientes: string[]; pct: number }>;
  faixas: Array<{ faixa: FaixaEtaria; total: number }>;
  internacao: { mediana: number | null; semData: number; maisLongas: Array<{ id: string; nome: string; dias: number }> };
  historico: SemanaHistorico[];
  historicoSemInternacao: number;
  suporte7d: DiaSuporte[];
}

// O Supabase devolve no máximo 1000 linhas por consulta: busca página a página para não contar a menos
async function buscarTudo(montar: () => any): Promise<{ data: any[]; error: unknown }> {
  const PAGINA = 1000;
  const todos: any[] = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await montar().range(de, de + PAGINA - 1);
    if (error) return { data: todos, error };
    todos.push(...(data || []));
    if (!data || data.length < PAGINA) return { data: todos, error: null };
  }
}

const um = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`;
const dec = (n: number) => n.toFixed(1).replace('.', ',');

const Card: React.FC<{ titulo: string; subtitulo?: string; children: React.ReactNode }> = ({ titulo, subtitulo, children }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{titulo}</h2>
    {subtitulo && <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{subtitulo}</p>}
    {children}
  </div>
);

const Vazio: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-slate-500 dark:text-slate-400">{children}</p>
);

// Linha com barra que abre a lista de itens ao clicar
const LinhaGrupo: React.FC<{ rotulo: string; valor: string; detalhe?: string; pct: number; children?: React.ReactNode }> = ({ rotulo, valor, detalhe, pct, children }) => (
  <details className="group rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
    <summary className="flex items-center gap-3 p-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{rotulo}</p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
          <div className="animate-bar bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}></div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{valor}</p>
        {detalhe && <p className="text-xs text-slate-500 dark:text-slate-400">{detalhe}</p>}
      </div>
      {children && <span className="text-slate-400 text-xs transition-transform group-open:rotate-90" aria-hidden="true">▶</span>}
    </summary>
    {children && <div className="px-2 pb-3">{children}</div>}
  </details>
);

const ListaDias: React.FC<{ itens: Array<{ nome: string; detalhe?: string; dias: number }> }> = ({ itens }) => (
  <ul className="divide-y divide-slate-200 dark:divide-slate-700">
    {itens.map((i, idx) => (
      <li key={idx} className="py-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-slate-700 dark:text-slate-300">
          {i.nome}{i.detalhe && <span className="text-xs text-slate-500 dark:text-slate-400"> • {i.detalhe}</span>}
        </span>
        <span className="flex-shrink-0 font-semibold text-slate-900 dark:text-slate-100">{um(i.dias, 'dia', 'dias')}</span>
      </li>
    ))}
  </ul>
);

// Gráfico de linha de uma série só (cada medida tem o seu: escalas diferentes não dividem eixo)
const GraficoSemanal: React.FC<{
  titulo: string;
  unidade: string;
  semanas: SemanaHistorico[];
  valor: (s: SemanaHistorico) => number;
  formatar: (n: number) => string;
}> = ({ titulo, unidade, semanas, valor, formatar }) => {
  const [ativo, setAtivo] = useState(semanas.length - 1);
  const W = 300, H = 130, ESQ = 30, DIR = 12, TOPO = 10, BASE = 22;
  const valores = semanas.map(valor);
  const teto = Math.max(1, Math.ceil(Math.max(...valores)));
  const x = (i: number) => ESQ + (semanas.length > 1 ? (i * (W - ESQ - DIR)) / (semanas.length - 1) : 0);
  const y = (v: number) => TOPO + (1 - v / teto) * (H - TOPO - BASE);
  const passo = semanas.length > 1 ? (W - ESQ - DIR) / (semanas.length - 1) : W;
  const atual = semanas[ativo];

  return (
    <div>
      <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{titulo}</p>
      <p className="mt-1">
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatar(valores[ativo])}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400"> {unidade}</span>
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{diaMes(atual.inicio)} a {diaMes(atual.fim)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${titulo}, últimas ${semanas.length} semanas`} onMouseLeave={() => setAtivo(semanas.length - 1)}>
        {[0, teto / 2, teto].map(t => (
          <g key={t}>
            <line x1={ESQ} x2={W - DIR} y1={y(t)} y2={y(t)} strokeWidth="1" className="stroke-slate-200 dark:stroke-slate-700" />
            <text x={ESQ - 5} y={y(t) + 3} textAnchor="end" fontSize="9" className="fill-slate-500 dark:fill-slate-400">{Number.isInteger(t) ? t : dec(t)}</text>
          </g>
        ))}
        <line x1={x(ativo)} x2={x(ativo)} y1={TOPO} y2={H - BASE} strokeWidth="1" className="stroke-slate-300 dark:stroke-slate-600" />
        <polyline
          fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          className="stroke-primary-500 dark:stroke-primary-400"
          points={valores.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
        />
        {valores.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === ativo ? 4.5 : 3.5} strokeWidth="2" className="fill-primary-500 dark:fill-primary-400 stroke-white dark:stroke-slate-800" />
        ))}
        {semanas.map((s, i) => (i % 2 === (semanas.length - 1) % 2) && (
          <text key={s.inicio} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" className="fill-slate-500 dark:fill-slate-400">{diaMes(s.inicio)}</text>
        ))}
        {semanas.map((s, i) => (
          <rect
            key={s.inicio} x={x(i) - passo / 2} y={0} width={passo} height={H} fill="transparent"
            onMouseEnter={() => setAtivo(i)} onClick={() => setAtivo(i)}
          >
            <title>{`${diaMes(s.inicio)} a ${diaMes(s.fim)}: ${formatar(valores[i])} ${unidade}`}</title>
          </rect>
        ))}
      </svg>
    </div>
  );
};

// Séries do gráfico de suporte: ordem e cor fixas por modalidade (paleta validada para
// daltonismo nos fundos claro e escuro; o verde tem contraste baixo no claro, por isso
// os valores aparecem sempre na legenda e na tabela)
const SERIES_SUPORTE = [
  { key: 'vm', label: 'VM', linha: 'stroke-[#2a78d6] dark:stroke-[#3987e5]', ponto: 'fill-[#2a78d6] dark:fill-[#3987e5]', chip: 'bg-[#2a78d6] dark:bg-[#3987e5]' },
  { key: 'vni', label: 'VNI', linha: 'stroke-[#eb6834] dark:stroke-[#d95926]', ponto: 'fill-[#eb6834] dark:fill-[#d95926]', chip: 'bg-[#eb6834] dark:bg-[#d95926]' },
  { key: 'cnaf', label: 'CNAF', linha: 'stroke-[#1baf7a] dark:stroke-[#199e70]', ponto: 'fill-[#1baf7a] dark:fill-[#199e70]', chip: 'bg-[#1baf7a] dark:bg-[#199e70]' },
] as const;

// Pacientes por modalidade nos últimos 7 dias: as três séries dividem o eixo porque a unidade é a mesma
const GraficoModalidades: React.FC<{ dias: DiaSuporte[] }> = ({ dias }) => {
  const [ativo, setAtivo] = useState(dias.length - 1);
  const W = 560, H = 200, ESQ = 28, DIR = 14, TOPO = 12, BASE = 26;
  const teto = Math.max(1, ...dias.flatMap(d => [d.vm, d.vni, d.cnaf]));
  const passoY = Math.ceil(teto / 4);
  const marcas = Array.from({ length: Math.floor(teto / passoY) + 1 }, (_, i) => i * passoY);
  const x = (i: number) => ESQ + (dias.length > 1 ? (i * (W - ESQ - DIR)) / (dias.length - 1) : 0);
  const y = (v: number) => TOPO + (1 - v / teto) * (H - TOPO - BASE);
  const passoX = dias.length > 1 ? (W - ESQ - DIR) / (dias.length - 1) : W;
  const atual = dias[ativo];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{atual.rotulo}, {diaMes(atual.dia)}</p>
        {SERIES_SUPORTE.map(s => (
          <p key={s.key} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <span className={`inline-block w-3 h-3 rounded-full ${s.chip}`} aria-hidden="true"></span>
            {s.label} <span className="font-bold text-slate-900 dark:text-slate-100">{atual[s.key]}</span>
          </p>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Pacientes em VM, VNI e CNAF nos últimos 7 dias" onMouseLeave={() => setAtivo(dias.length - 1)}>
        {marcas.map(t => (
          <g key={t}>
            <line x1={ESQ} x2={W - DIR} y1={y(t)} y2={y(t)} strokeWidth="1" className="stroke-slate-200 dark:stroke-slate-700" />
            <text x={ESQ - 6} y={y(t) + 3} textAnchor="end" fontSize="10" className="fill-slate-500 dark:fill-slate-400">{t}</text>
          </g>
        ))}
        <line x1={x(ativo)} x2={x(ativo)} y1={TOPO} y2={H - BASE} strokeWidth="1" className="stroke-slate-300 dark:stroke-slate-600" />
        {SERIES_SUPORTE.map(s => (
          <g key={s.key}>
            <polyline fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className={s.linha} points={dias.map((d, i) => `${x(i)},${y(d[s.key])}`).join(' ')} />
            {dias.map((d, i) => (
              <circle key={d.dia} cx={x(i)} cy={y(d[s.key])} r={i === ativo ? 5 : 4} strokeWidth="2" className={`${s.ponto} stroke-white dark:stroke-slate-800`} />
            ))}
          </g>
        ))}
        {dias.map((d, i) => (
          <text key={d.dia} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" className="fill-slate-500 dark:fill-slate-400">{d.rotulo}</text>
        ))}
        {dias.map((d, i) => (
          <rect key={d.dia} x={x(i) - passoX / 2} y={0} width={passoX} height={H} fill="transparent" onMouseEnter={() => setAtivo(i)} onClick={() => setAtivo(i)}>
            <title>{`${d.rotulo}, ${diaMes(d.dia)}: VM ${d.vm}, VNI ${d.vni}, CNAF ${d.cnaf}`}</title>
          </rect>
        ))}
      </svg>
      <details className="mt-3">
        <summary className="text-xs font-semibold text-primary-600 dark:text-primary-400 cursor-pointer">Ver tabela</summary>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr><th className="py-1 pr-3">Dia</th><th className="py-1 pr-3 text-right">VM</th><th className="py-1 pr-3 text-right">VNI</th><th className="py-1 text-right">CNAF</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
              {dias.map(d => (
                <tr key={d.dia}>
                  <td className="py-1 pr-3 whitespace-nowrap">{d.rotulo}, {diaMes(d.dia)}</td>
                  <td className="py-1 pr-3 text-right">{d.vm}</td>
                  <td className="py-1 pr-3 text-right">{d.vni}</td>
                  <td className="py-1 text-right">{d.cnaf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

export const AnalisesComplementares: React.FC<Props> = ({ pacientes, modalidadePorPaciente, aba, antesDaEvolucao }) => {
  const [dados, setDados] = useState<Dados | null>(null);
  const [falhas, setFalhas] = useState<string[]>([]);

  useEffect(() => {
    let cancelado = false;

    const carregar = async () => {
      const agora = new Date();
      const ids = pacientes.map(p => p.id);
      const porId = new Map(pacientes.map(p => [p.id, p]));
      const rotulo = (id: string) => {
        const p = porId.get(id);
        if (!p) return 'Sem nome';
        return p.bed_number != null && p.bed_number !== '' ? `L${p.bed_number} · ${p.name}` : p.name;
      };

      const inicioHistorico = dataLocal(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - (SEMANAS * 7 - 1)));
      const desdeCalc = new Date(agora.getTime() - JANELA_CALC_HORAS * 3_600_000).toISOString();
      const desdePards = new Date(agora.getTime() - JANELA_PARDS_HORAS * 3_600_000).toISOString();
      const ATRASADOS = ['fora_do_prazo', 'fora_do_prazo_com_justificativa'];
      const naJanela = `archived_at.is.null,archived_at.gte.${inicioHistorico}`;
      const inicio7d = dataLocal(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 6));

      const [
        dispRes, medRes,
        alertasAtrasRes, tasksAtrasRes, sistemasRes, categoriasRes,
        diagRes, opcoesRes,
        calcRes, pardsRes,
        pacHistRes, precHistRes, alertasHistRes, tasksHistRes,
        epHistRes, dispHistRes,
      ] = await Promise.all([
        supabase.from('dispositivos_pacientes').select('paciente_id, tipo_dispositivo, localizacao, data_insercao')
          .in('paciente_id', ids).or('is_archived.is.null,is_archived.eq.false').is('data_remocao', null),
        supabase.from('medicacoes_pacientes').select('paciente_id, nome_medicacao, data_inicio, categoria')
          .in('paciente_id', ids).or('is_archived.is.null,is_archived.eq.false'),
        supabase.from('alertas_paciente_view_completa').select('*').in('live_status', ATRASADOS),
        supabase.from('tasks_view_horario_br').select('*').in('live_status', ATRASADOS),
        supabase.from('alertas_paciente').select('id, sistemas').is('concluded_at', null).is('archived_at', null),
        supabase.from('tasks').select('id, category').is('concluded_at', null).is('archived_at', null),
        supabase.from('paciente_diagnosticos').select('patient_id, opcao_id, status').eq('arquivado', false).in('patient_id', ids),
        supabase.from('pergunta_opcoes_diagnostico').select('id, categoria'),
        supabase.from('calc_resp_avaliacoes').select('paciente_id, criado_em, alertas, classe_oxigenacao')
          .in('paciente_id', ids).gte('criado_em', desdeCalc).order('criado_em', { ascending: false }),
        supabase.from('pards_avaliacoes').select('paciente_id, criado_em, classificacao')
          .in('paciente_id', ids).gte('criado_em', desdePards).order('criado_em', { ascending: false }),
        buscarTudo(() => supabase.from('patients').select('id, dt_internacao, archived_at').or(naJanela).order('id')),
        buscarTudo(() => supabase.from('precautions').select('id, patient_id, data_inicio, archived_at').or(naJanela).order('id')),
        buscarTudo(() => supabase.from('alertas_paciente_view_completa').select('id, created_at, deadline, concluded_at, archived_at').gte('created_at', inicioHistorico).order('created_at')),
        buscarTudo(() => supabase.from('tasks_view_horario_br').select('id, created_at, deadline, concluded_at, archived_at').gte('created_at', inicioHistorico).order('created_at')),
        buscarTudo(() => supabase.from('suporte_resp_episodios').select('id, paciente_id, situacao, dispositivo, inicio, fim').or(`fim.is.null,fim.gte.${inicio7d}`).order('id')),
        buscarTudo(() => supabase.from('dispositivos_pacientes').select('id, paciente_id, tipo_dispositivo, data_insercao, data_remocao, is_archived')
          .or(`data_remocao.is.null,data_remocao.gte.${inicio7d}`)
          .or('tipo_dispositivo.ilike.*TOT*,tipo_dispositivo.ilike.*TQT*,tipo_dispositivo.ilike.*VPM*,tipo_dispositivo.ilike.*VNI*,tipo_dispositivo.ilike.*CNAF*')
          .order('id')),
      ]);
      if (cancelado) return;

      const fontes: Array<[string, { error: unknown }]> = [
        ['Dias de dispositivo', dispRes],
        ['Dias de antimicrobiano', medRes],
        ['Alertas atrasados', alertasAtrasRes], ['Alertas atrasados (checklist)', tasksAtrasRes],
        ['Sistemas dos alertas', sistemasRes], ['Categorias do checklist', categoriasRes],
        ['Diagnósticos por sistema', diagRes],
        ['Evolução: pacientes', pacHistRes], ['Evolução: isolamentos', precHistRes],
        ['Evolução: alertas', alertasHistRes], ['Evolução: checklist', tasksHistRes],
        ['Tendência de suporte: episódios', epHistRes], ['Tendência de suporte: dispositivos', dispHistRes],
      ];
      const comErro = fontes.filter(([, r]) => r.error);
      comErro.forEach(([nome, r]) => console.error(`Análises: falha em ${nome}`, r.error));
      // Calculadora e PARDS podem não existir neste banco: o card avisa, sem tratar como erro
      if (calcRes.error) console.warn('Análises: calc_resp_avaliacoes indisponível', calcRes.error);
      if (pardsRes.error) console.warn('Análises: pards_avaliacoes indisponível', pardsRes.error);
      if (opcoesRes.error) console.warn('Análises: categorias de diagnóstico indisponíveis', opcoesRes.error);

      // Dias de dispositivo invasivo
      const dispositivos = resumirPorGrupo((dispRes.data || []).flatMap(d => {
        const dias = diasDesde(d.data_insercao, agora);
        if (!d.tipo_dispositivo || dias === null || !isDispositivoInvasivo(d.tipo_dispositivo)) return [];
        return [{ grupo: grupoDispositivo(d.tipo_dispositivo), pacienteId: d.paciente_id, nome: rotulo(d.paciente_id), detalhe: d.localizacao || undefined, dias }];
      }));

      // Dias de antimicrobiano
      const antimicrobianos = resumirPorGrupo((medRes.data || []).flatMap(m => {
        const dias = diasDesde(m.data_inicio, agora);
        if (!m.nome_medicacao || dias === null || !isAntimicrobiano(m.nome_medicacao, m.categoria)) return [];
        return [{ grupo: m.nome_medicacao.trim(), pacienteId: m.paciente_id, nome: rotulo(m.paciente_id), dias }];
      }));

      // Alertas atrasados por sistema (um alerta com dois sistemas conta nos dois)
      const sistemasPorId = new Map((sistemasRes.data || []).map(a => [String(a.id), Array.isArray(a.sistemas) ? a.sistemas as string[] : []]));
      const categoriaPorId = new Map((categoriasRes.data || []).map(t => [String(t.id), t.category as string | null]));
      const porSistema = new Map<string, AlertaAtrasado[]>();
      const registrar = (sistema: string, item: AlertaAtrasado) => porSistema.set(sistema, [...(porSistema.get(sistema) || []), item]);
      const itemDe = (a: any): AlertaAtrasado => ({
        paciente: a.bed_number != null ? `L${a.bed_number} · ${a.patient_name || 'Sem nome'}` : (a.patient_name || 'Sem nome'),
        descricao: a.alertaclinico || '',
        horas: horasDeAtraso(a.deadline, agora) ?? 0,
      });
      (alertasAtrasRes.data || []).forEach(a => {
        const sistemas = (sistemasPorId.get(String(a.id)) || []).filter(Boolean);
        (sistemas.length > 0 ? sistemas : ['Sem sistema informado']).forEach(s => registrar(s, itemDe(a)));
      });
      (tasksAtrasRes.data || []).forEach(t => registrar(`Checklist: ${categoriaPorId.get(String(t.id)) || 'sem categoria'}`, itemDe(t)));
      const alertasPorSistema = Array.from(porSistema.entries())
        .map(([sistema, itens]) => ({ sistema, total: itens.length, maiorAtraso: Math.max(...itens.map(i => i.horas)), itens: itens.sort((a, b) => b.horas - a.horas) }))
        .sort((a, b) => b.total - a.total);
      const totalAtrasados = (alertasAtrasRes.data || []).length + (tasksAtrasRes.data || []).length;

      // Diagnósticos por sistema (ativos, pacientes distintos)
      const categoriaDaOpcao = new Map((opcoesRes.data || []).map(o => [o.id, o.categoria as string | null]));
      const porCategoria = new Map<string, Set<string>>();
      (diagRes.data || []).filter(d => d.status !== 'resolvido').forEach(d => {
        const categoria = categoriaDaOpcao.get(d.opcao_id) || DIAGNOSTICO_CATEGORIAS[d.opcao_id] || 'Outros';
        porCategoria.set(categoria, (porCategoria.get(categoria) || new Set<string>()).add(d.patient_id));
      });
      const diagnosticosPorSistema = Array.from(porCategoria.entries())
        .map(([categoria, set]) => ({ categoria, pacientes: Array.from(set).map(rotulo), pct: pacientes.length > 0 ? Math.round((set.size / pacientes.length) * 100) : 0 }))
        .sort((a, b) => b.pacientes.length - a.pacientes.length);

      // Perfil dos internados
      const contagemFaixa = new Map<FaixaEtaria, number>();
      pacientes.forEach(p => { const f = faixaEtaria(p.dob, agora); contagemFaixa.set(f, (contagemFaixa.get(f) || 0) + 1); });
      const faixas = FAIXAS_ETARIAS.map(faixa => ({ faixa, total: contagemFaixa.get(faixa) || 0 })).filter(f => f.total > 0 || f.faixa !== 'Sem data de nascimento');
      const comInternacao = pacientes.flatMap(p => {
        const dias = diasDesde(p.dt_internacao, agora);
        return dias === null ? [] : [{ id: p.id, nome: rotulo(p.id), dias }];
      }).sort((a, b) => b.dias - a.dias);
      const internacao = {
        mediana: mediana(comInternacao.map(p => p.dias)),
        semData: pacientes.length - comInternacao.length,
        maisLongas: comInternacao.slice(0, 5),
      };

      // Risco ventilatório
      const ultimoCalc = new Map<string, any>();
      (calcRes.data || []).forEach(c => { if (!ultimoCalc.has(c.paciente_id)) ultimoCalc.set(c.paciente_id, c); });
      const ultimoPards = new Map<string, any>();
      (pardsRes.data || []).forEach(p => { if (!ultimoPards.has(p.paciente_id)) ultimoPards.set(p.paciente_id, p); });
      const emRisco: Dados['risco']['emRisco'] = [];
      const semAvaliacao: Dados['risco']['semAvaliacao'] = [];
      pacientes.forEach(p => {
        const calc = ultimoCalc.get(p.id);
        const pards = ultimoPards.get(p.id);
        const motivos = alarmesCriticos(calc?.alertas).map(a => a.titulo || 'Alarme crítico');
        if (calc?.classe_oxigenacao === 'grave') motivos.push('Oxigenação classificada como grave');
        if (pards?.classificacao === 'pards_grave') motivos.push('PARDS grave');
        if (motivos.length > 0) emRisco.push({ id: p.id, nome: rotulo(p.id), motivos: Array.from(new Set(motivos)) });
        const modalidade = modalidadePorPaciente[p.id];
        if (!calc && modalidade && EM_SUPORTE.includes(modalidade)) semAvaliacao.push({ id: p.id, nome: rotulo(p.id), modalidade });
      });

      // Evolução no tempo
      const pacHist = pacHistRes.data;
      const historico = historicoSemanal({
        pacientes: pacHist,
        precaucoes: precHistRes.data,
        alertas: [...alertasHistRes.data, ...tasksHistRes.data],
        semanas: SEMANAS,
        agora,
      });

      setFalhas(comErro.map(([nome]) => nome));
      setDados({
        risco: { disponivel: !calcRes.error, emRisco, semAvaliacao, avaliados: ultimoCalc.size },
        dispositivos, antimicrobianos, alertasPorSistema, totalAtrasados,
        diagnosticosPorSistema, faixas, internacao,
        historico, historicoSemInternacao: pacHist.filter(p => !p.dt_internacao).length,
        suporte7d: tendenciaSuporte({ pacientes: pacHist, episodios: epHistRes.data, dispositivos: dispHistRes.data, agora }),
      });
    };

    carregar().catch(err => {
      console.error('Análises complementares:', err);
      if (!cancelado) setFalhas(['Análises complementares']);
    });
    return () => { cancelado = true; };
  }, [pacientes, modalidadePorPaciente]);

  if (!dados) {
    return (
      <>
      {aba === 'perfil' && antesDaEvolucao}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8 text-sm text-slate-500 dark:text-slate-400">
        {falhas.length > 0 ? 'Não foi possível carregar as análises complementares. Tente atualizar.' : 'Carregando análises complementares...'}
      </div>
      </>
    );
  }

  const maxDisp = Math.max(1, ...dados.dispositivos.map(d => d.maximo));
  const maxAtm = Math.max(1, ...dados.antimicrobianos.map(d => d.maximo));
  const maxAlertas = Math.max(1, ...dados.alertasPorSistema.map(a => a.total));
  const maxFaixa = Math.max(1, ...dados.faixas.map(f => f.total));

  return (
    <>
      {falhas.length > 0 && (
        <div role="alert" className="mb-6 rounded-lg border border-warning-300 dark:border-warning-700 bg-warning-50 dark:bg-warning-900/40 px-4 py-3 text-sm text-warning-800 dark:text-warning-200">
          <span className="font-bold">Dados incompletos.</span> Não foi possível carregar: {falhas.join(', ')}. Os blocos correspondentes podem aparecer vazios.
        </div>
      )}

      {aba === 'respiratorio' && (
        <Card titulo="📉 Suporte Ventilatório nos Últimos 7 Dias" subtitulo="Pacientes internados em VM, VNI e CNAF em cada dia. Passe o mouse (ou toque) em um dia para ver os valores.">
          <GraficoModalidades dias={dados.suporte7d} />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Reconstruído pelos episódios do bloco Oxigenação e Ventilação e pelas datas de inserção e remoção dos dispositivos. Cada paciente conta uma vez por dia, na modalidade de maior suporte. O suporte marcado só no Fisio não tem histórico e não entra aqui.
          </p>
        </Card>
      )}

      {aba === 'agora' && (<>
      {/* Risco ventilatório */}
      <Card titulo="⚠️ Risco Ventilatório" subtitulo={`Alarmes críticos da Calculadora Respiratória nas últimas ${JANELA_CALC_HORAS} h e PARDS grave nas últimas ${JANELA_PARDS_HORAS} h`}>
        {!dados.risco.disponivel ? (
          <Vazio>A Calculadora Respiratória ainda não está disponível neste banco, então não há como avaliar o risco ventilatório por aqui.</Vazio>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-lg border p-4 ${dados.risco.emRisco.length > 0 ? 'border-danger-200 dark:border-danger-700 bg-danger-50 dark:bg-danger-900/40' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40'}`}>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                {dados.risco.emRisco.length > 0 ? `${um(dados.risco.emRisco.length, 'paciente', 'pacientes')} com alarme crítico` : 'Nenhum alarme crítico registrado'}
              </p>
              {dados.risco.emRisco.length > 0 ? (
                <ul className="space-y-2">
                  {dados.risco.emRisco.map(p => (
                    <li key={p.id} className="text-sm">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{p.nome}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{p.motivos.join(' • ')}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {um(dados.risco.avaliados, 'paciente avaliado', 'pacientes avaliados')} na calculadora nas últimas {JANELA_CALC_HORAS} h. Sem avaliação não há alarme: isto não é o mesmo que ausência de risco.
                </p>
              )}
            </div>
            <div className={`rounded-lg border p-4 ${dados.risco.semAvaliacao.length > 0 ? 'border-warning-200 dark:border-warning-700 bg-warning-50 dark:bg-warning-900/40' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40'}`}>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                {dados.risco.semAvaliacao.length > 0 ? `${um(dados.risco.semAvaliacao.length, 'paciente', 'pacientes')} em suporte sem avaliação recente` : 'Todos em suporte têm avaliação recente'}
              </p>
              {dados.risco.semAvaliacao.length > 0 ? (
                <ul className="space-y-1">
                  {dados.risco.semAvaliacao.map(p => (
                    <li key={p.id} className="text-sm flex justify-between gap-3">
                      <span className="min-w-0 truncate text-slate-800 dark:text-slate-200">{p.nome}</span>
                      <span className="flex-shrink-0 text-xs text-slate-600 dark:text-slate-400">{p.modalidade}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Pacientes em CNAF, VNI ou VM com cálculo validado nas últimas {JANELA_CALC_HORAS} h.</p>
              )}
            </div>
          </div>
        )}
      </Card>

      </>)}

      {aba === 'infeccao' && (
      /* Dias de dispositivo invasivo e de antimicrobiano */
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
        <Card titulo="🩺 Dias de Dispositivo Invasivo" subtitulo="Dispositivos em uso, do mais antigo ao mais recente. Clique no tipo para ver os pacientes.">
          {dados.dispositivos.length === 0 ? <Vazio>Nenhum dispositivo invasivo ativo.</Vazio> : (
            <div className="space-y-1">
              {dados.dispositivos.map(d => (
                <LinhaGrupo key={d.grupo} rotulo={`${d.grupo} (${d.total})`} valor={`até ${um(d.maximo, 'dia', 'dias')}`} detalhe={`mediana ${dec(d.mediana)} d`} pct={(d.maximo / maxDisp) * 100}>
                  <ListaDias itens={d.itens} />
                </LinhaGrupo>
              ))}
            </div>
          )}
        </Card>

        <Card titulo="💊 Dias de Antimicrobiano" subtitulo="Antibióticos e antifúngicos prescritos, pelo tempo desde o início. Clique para ver os pacientes.">
          {dados.antimicrobianos.length === 0 ? <Vazio>Nenhum antimicrobiano ativo.</Vazio> : (
            <div className="space-y-1">
              {dados.antimicrobianos.map(d => (
                <LinhaGrupo key={d.grupo} rotulo={`${d.grupo} (${d.total})`} valor={`até ${um(d.maximo, 'dia', 'dias')}`} detalhe={`mediana ${dec(d.mediana)} d`} pct={(d.maximo / maxAtm) * 100}>
                  <ListaDias itens={d.itens} />
                </LinhaGrupo>
              ))}
            </div>
          )}
        </Card>
      </div>

      )}

      {aba === 'agora' && (
      /* Alertas atrasados por sistema */
      <Card titulo="⏰ Alertas Atrasados por Sistema" subtitulo={`${um(dados.totalAtrasados, 'alerta fora do prazo', 'alertas fora do prazo')}. Um alerta marcado em dois sistemas aparece nos dois.`}>
        {dados.alertasPorSistema.length === 0 ? <Vazio>Nenhum alerta fora do prazo.</Vazio> : (
          <div className="space-y-1">
            {dados.alertasPorSistema.map(a => (
              <LinhaGrupo key={a.sistema} rotulo={a.sistema} valor={String(a.total)} detalhe={`maior atraso: ${formatarAtraso(a.maiorAtraso)}`} pct={(a.total / maxAlertas) * 100}>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {a.itens.map((i, idx) => (
                    <li key={idx} className="py-1.5 flex items-start justify-between gap-3 text-sm">
                      <span className="min-w-0 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">{i.paciente}</span>
                        {i.descricao && <span className="block text-xs text-slate-500 dark:text-slate-400 break-words">{i.descricao}</span>}
                      </span>
                      <span className="flex-shrink-0 text-xs font-semibold text-slate-900 dark:text-slate-100">{formatarAtraso(i.horas)}</span>
                    </li>
                  ))}
                </ul>
              </LinhaGrupo>
            ))}
          </div>
        )}
      </Card>

      )}

      {aba === 'perfil' && (<>
      {/* Diagnósticos por sistema */}
      <Card titulo="🏥 Diagnósticos por Sistema" subtitulo="Pacientes internados com pelo menos um diagnóstico ativo em cada categoria (% dos internados)">
        {dados.diagnosticosPorSistema.length === 0 ? <Vazio>Nenhum diagnóstico ativo.</Vazio> : (
          <div className="space-y-1">
            {dados.diagnosticosPorSistema.map(d => (
              <LinhaGrupo key={d.categoria} rotulo={d.categoria} valor={um(d.pacientes.length, 'paciente', 'pacientes')} detalhe={`${d.pct}%`} pct={d.pct}>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  {d.pacientes.map(nome => <li key={nome}>• {nome}</li>)}
                </ul>
              </LinhaGrupo>
            ))}
          </div>
        )}
      </Card>

      {/* Perfil dos internados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
        <Card titulo="👶 Faixa Etária" subtitulo="Pacientes internados por idade">
          <div className="space-y-3">
            {dados.faixas.map(f => (
              <div key={f.faixa} className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-36 shrink-0">{f.faixa}</p>
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="animate-bar bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full" style={{ width: `${(f.total / maxFaixa) * 100}%` }}></div>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 min-w-6 text-right">{f.total}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card titulo="🛏️ Tempo de Internação" subtitulo="Dias desde a data de internação registrada">
          {dados.internacao.mediana === null ? <Vazio>Nenhum paciente com data de internação registrada.</Vazio> : (
            <>
              <p className="mb-4">
                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{dec(dados.internacao.mediana)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400"> dias (mediana)</span>
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Internações mais longas</p>
              <ListaDias itens={dados.internacao.maisLongas} />
            </>
          )}
          {dados.internacao.semData > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">{um(dados.internacao.semData, 'paciente sem', 'pacientes sem')} data de internação não {dados.internacao.semData === 1 ? 'entra' : 'entram'} na conta.</p>
          )}
        </Card>
      </div>

      {antesDaEvolucao}

      {/* Evolução no tempo */}
      <Card titulo="📈 Evolução nas Últimas 8 Semanas" subtitulo="Blocos de 7 dias terminando hoje. Passe o mouse (ou toque) em uma semana para ver o valor.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GraficoSemanal titulo="Ocupação" unidade="pacientes por dia, em média" semanas={dados.historico} valor={s => s.ocupacaoMedia} formatar={dec} />
          <GraficoSemanal titulo="Alertas criados" unidade="na semana" semanas={dados.historico} valor={s => s.alertasCriados} formatar={n => String(n)} />
          <GraficoSemanal titulo="Isolamentos" unidade="precauções ativas por dia, em média" semanas={dados.historico} valor={s => s.isolamentosMedia} formatar={dec} />
        </div>
        <details className="mt-4">
          <summary className="text-xs font-semibold text-primary-600 dark:text-primary-400 cursor-pointer">Ver tabela</summary>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-1 pr-3">Semana</th>
                  <th className="py-1 pr-3 text-right">Ocupação média</th>
                  <th className="py-1 pr-3 text-right">Alertas criados</th>
                  <th className="py-1 pr-3 text-right">Concluídos no prazo</th>
                  <th className="py-1 text-right">Isolamentos (média)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {dados.historico.map(s => (
                  <tr key={s.inicio}>
                    <td className="py-1 pr-3 whitespace-nowrap">{diaMes(s.inicio)} a {diaMes(s.fim)}</td>
                    <td className="py-1 pr-3 text-right">{dec(s.ocupacaoMedia)}</td>
                    <td className="py-1 pr-3 text-right">{s.alertasCriados}</td>
                    <td className="py-1 pr-3 text-right">{s.alertasNoPrazoPct === null ? '—' : `${s.alertasNoPrazoPct}%`}</td>
                    <td className="py-1 text-right">{dec(s.isolamentosMedia)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
          Reconstruído pelas datas de internação, arquivamento e criação já gravadas.
          {dados.historicoSemInternacao > 0 && ` ${um(dados.historicoSemInternacao, 'paciente sem', 'pacientes sem')} data de internação ${dados.historicoSemInternacao === 1 ? 'ficou' : 'ficaram'} fora da ocupação.`}
        </p>
      </Card>
      </>)}
    </>
  );
};
