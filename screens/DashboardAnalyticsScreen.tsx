import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loading } from '../components/ui/Loading';
import { MODALIDADES, MODALIDADES_VM, modalidadeDoPaciente, type Modalidade } from '../lib/cenarioVentilatorio';
import { AnalisesComplementares, type AbaAnalises, type PacienteAnalise } from '../components/analytics/AnalisesComplementares';
import { ProblemasEquipamento } from '../components/analytics/ProblemasEquipamento';

// Rosca (donut) reutilizável para os cards KPI — com animação de entrada
const KpiDonut: React.FC<{
  percent: number;
  ringClass: string;
  centerClass: string;
  center: string | number;
  sub?: string;
  decorativo?: boolean;
}> = ({ percent, ringClass, centerClass, center, sub, decorativo }) => {
  const target = decorativo ? 100 : percent;
  const [anim, setAnim] = useState(0);
  const [count, setCount] = useState(typeof center === 'number' ? 0 : center);

  // Anima o anel (0 -> target)
  useEffect(() => {
    const t = setTimeout(() => setAnim(target), 100);
    return () => clearTimeout(t);
  }, [target]);

  // Anima o número (conta de 0 até o valor)
  useEffect(() => {
    if (typeof center !== 'number') {
      setCount(center);
      return;
    }
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setCount(Math.round(center * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [center]);

  return (
    <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-700" />
        <circle
          cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
          className={ringClass}
          strokeDasharray={`${(anim / 100) * 314} 314`}
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl md:text-3xl font-bold leading-none ${centerClass}`}>{count}</span>
        {sub && <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{sub}</span>}
      </div>
    </div>
  );
};

const ABAS: Array<{ key: AbaAnalises; label: string }> = [
  { key: 'agora', label: 'Agora' },
  { key: 'infeccao', label: 'Infecção' },
  { key: 'respiratorio', label: 'Respiratório' },
  { key: 'perfil', label: 'Perfil e evolução' },
];

interface DashboardData {
  totalPacientes: number;
  pacientesCriticos: number;
  pacientesEstavel: number;
  pacientesEmRisco: number;
  totalAlertas: number;
  alertasNoPrazo: number;
  alertasForaDoPrazo: number;
  // total = pacientes internados com a escala; média, mínimo e máximo da ÚLTIMA avaliação de cada um
  escalasAtivas: Array<{ scale_name: string; total: number; media: number; minimo: number; maximo: number }>;
  diagnosticos: Array<{ nome: string; total: number; percentual: number }>;
  diagnosticosComPacientes: Array<{ nome: string; total: number; percentual: number; pacientes: string[] }>;
  medicacoesAtivas: number;
  dispositivosAtivos: number;
  dietasAtivas: number;
  precaucoesAtivas: number;
  pacientesEmIsolamento: number;
  precaucoesPorTipo: Array<{ tipo: string; total: number }>;
  precaucoesPorTipoComPacientes: Array<{ tipo: string; total: number; pacientes: string[] }>;
  // diasRestantes: negativo = prazo vencido, null = sem data de fim
  isolamentosDetalhados: Array<{ id: string; pacienteNome: string; doenca: string; tipo: string; dataInicio: string; dataFim: string | null; diasRestantes: number | null }>;
  isolamentosStatus: { indefinido: number; vencida: number; breve: number; prazo: number };
  diagnosticosPrincipaisTop5: Array<{ nome: string; total: number }>;
  diagnosticosSecundariosTop5: Array<{ nome: string; total: number }>;
  microorganismosPorTipo: Array<{ tipo: string; total: number }>;
  microganismosComPacientes: Array<{ tipo: string; total: number; pacientes: string[] }>;
  cenarioVentilatorio: Array<{ modalidade: Modalidade; total: number; pacientes: string[] }>;
  // Pacientes sem suporte nem dispositivo respiratório registrado (contados como Ar Ambiente)
  ventSemRegistro: number;
  // Pacientes com TQT contados como "TQT em VM" sem ventilador nem suporte registrado
  ventTqtAConfirmar: string[];
  // Base das análises complementares (risco ventilatório, dias de dispositivo, perfil, evolução...)
  pacientes: PacienteAnalise[];
  modalidadePorPaciente: Record<string, Modalidade>;
}

export const DashboardAnalyticsScreen: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [aba, setAba] = useState<AbaAnalises>('agora');
  const [tooltipData, setTooltipData] = useState<{ tipo: string; total: number; percentual: number; pacientes: string[] } | null>(null);
  const [modalData, setModalData] = useState<{ titulo: string; total: number; percentual: number; pacientes: string[] } | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Todas as queries em paralelo (nenhuma depende da outra) — muito mais rápido
      const [
        patientsRes,
        alertsRes,
        scalesRes,
        diagnosRes,
        medicacoesRes,
        dispositivosRes,
        dietasRes,
        culturaRes,
        precautionsRes,
        dispRespRes,
        episodiosRes,
        fisioSuporteRes,
      ] = await Promise.all([
        supabase.from('patients').select('id, status, name, bed_number, dob, dt_internacao').is('archived_at', null),
        supabase.from('dashboard_summary').select('*'),
        supabase.from('scale_scores').select('scale_name, score, patient_id, date').is('archived_at', null),
        supabase.from('paciente_diagnosticos').select('opcao_label, pergunta_id, patient_id, status, patients(name)').eq('arquivado', false),
        supabase.from('medicacoes_pacientes').select('*', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('dispositivos_pacientes').select('*', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('dietas_pacientes').select('*', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('culturas_pacientes').select('microorganismo, paciente_id, patients(name)').eq('is_archived', false),
        supabase.from('precautions_com_calculo').select('id, patient_id, tipo_precaucao, doenca_nome, data_inicio, data_fim_calculada').is('archived_at', null),
        supabase.from('dispositivos_pacientes').select('paciente_id, tipo_dispositivo').or('is_archived.is.null,is_archived.eq.false').is('data_remocao', null),
        supabase.from('suporte_resp_episodios').select('paciente_id, situacao, dispositivo, inicio').is('fim', null),
        supabase.from('fisio_suporte_ventilatorio').select('patient_id, suporte, updated_at'),
      ]);

      // Query que falha não pode virar "0" silencioso: avisa quais blocos ficaram sem dados
      const fontes: Array<[string, { error: unknown }]> = [
        ['Pacientes', patientsRes],
        ['Alertas', alertsRes],
        ['Escalas', scalesRes],
        ['Diagnósticos', diagnosRes],
        ['Medicações', medicacoesRes],
        ['Dispositivos', dispositivosRes],
        ['Dietas', dietasRes],
        ['Culturas', culturaRes],
        ['Isolamentos', precautionsRes],
        ['Dispositivos respiratórios', dispRespRes],
        ['Suporte ventilatório', episodiosRes],
      ];
      // A tabela do Fisio é opcional (só existe onde o Fisio Beira Leito está instalado)
      if (fisioSuporteRes.error) console.warn('Dashboard: suporte do Fisio indisponível', fisioSuporteRes.error);
      const falhas = fontes.filter(([, res]) => res.error);
      falhas.forEach(([nome, res]) => console.error(`Dashboard: falha em ${nome}`, res.error));
      setAvisos(falhas.map(([nome]) => nome));

      const patientsData = patientsRes.data;
      // Mapa de pacientes internados por ID — todas as análises abaixo consideram só eles
      const patientsMap = new Map(patientsData?.map(p => [p.id, p]) || []);
      const totalPacientes = patientsData?.length || 0;
      const pacientesCriticos = patientsData?.filter(p => p.status === 'instavel').length || 0;
      const pacientesEstavel = patientsData?.filter(p => p.status === 'estavel').length || 0;
      const pacientesEmRisco = patientsData?.filter(p => p.status === 'em_risco').length || 0;

      const alertsData = alertsRes.data;

      const totalAlertas = alertsData?.[0]?.totalAlertas || 0;
      const alertasNoPrazo = alertsData?.[0]?.totalNoPrazo || 0;
      const alertasForaDoPrazo = alertsData?.[0]?.totalForaDoPrazo || 0;

      // Escalas: só a última avaliação de cada paciente internado (a média de todo o histórico não diz nada)
      const ultimaPorEscala = new Map<string, Map<string, { score: number; date: string }>>();
      (scalesRes.data || []).forEach(s => {
        if (!s.scale_name || s.score === null || s.score === undefined || !patientsMap.has(s.patient_id)) return;
        const porPaciente = ultimaPorEscala.get(s.scale_name) || new Map<string, { score: number; date: string }>();
        const atual = porPaciente.get(s.patient_id);
        const date = s.date || '';
        if (!atual || date > atual.date) porPaciente.set(s.patient_id, { score: Number(s.score), date });
        ultimaPorEscala.set(s.scale_name, porPaciente);
      });

      const escalasAtivas = Array.from(ultimaPorEscala.entries())
        .map(([name, porPaciente]) => {
          const scores = Array.from(porPaciente.values()).map(v => v.score);
          return {
            scale_name: name,
            total: scores.length,
            media: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
            minimo: Math.min(...scores),
            maximo: Math.max(...scores),
          };
        })
        .sort((a, b) => b.total - a.total);

      // Cenário ventilatório: uma modalidade por paciente internado
      const dispPorPaciente = new Map<string, string[]>();
      (dispRespRes.data || []).forEach(d => {
        if (!d.tipo_dispositivo) return;
        const tipos = dispPorPaciente.get(d.paciente_id) || [];
        tipos.push(d.tipo_dispositivo);
        dispPorPaciente.set(d.paciente_id, tipos);
      });
      const episodioPorPaciente = new Map((episodiosRes.data || []).map(e => [e.paciente_id, e]));
      const fisioPorPaciente = new Map((fisioSuporteRes.data || []).map(f => [f.patient_id, f]));

      const pacientesPorModalidade = new Map<Modalidade, string[]>();
      let ventSemRegistro = 0;
      const ventTqtAConfirmar: string[] = [];
      const modalidadePorPaciente: Record<string, Modalidade> = {};
      patientsData?.forEach(p => {
        const { modalidade, origem, confirmar } = modalidadeDoPaciente({
          episodio: episodioPorPaciente.get(p.id),
          fisio: fisioPorPaciente.get(p.id),
          dispositivos: dispPorPaciente.get(p.id) || [],
        });
        if (origem === 'assumido') ventSemRegistro++;
        if (confirmar) ventTqtAConfirmar.push(p.name || 'Sem nome');
        modalidadePorPaciente[p.id] = modalidade;
        pacientesPorModalidade.set(modalidade, [...(pacientesPorModalidade.get(modalidade) || []), p.name || 'Sem nome']);
      });
      const cenarioVentilatorio = MODALIDADES.map(modalidade => {
        const pacientes = pacientesPorModalidade.get(modalidade) || [];
        return { modalidade, total: pacientes.length, pacientes };
      });

      // Diagnósticos (reutiliza a query única de paciente_diagnosticos)
      // Só diagnósticos ativos: os marcados como resolvidos não entram nas análises
      const diagnosData = (diagnosRes.data || []).filter(d => patientsMap.has(d.patient_id) && d.status !== 'resolvido');

      // Conta pacientes distintos (não linhas): o mesmo diagnóstico pode aparecer como principal e secundário
      const diagnosMap = new Map<string, Map<string, string>>();
      diagnosData.forEach(d => {
        if (d.opcao_label) {
          const pacientes = diagnosMap.get(d.opcao_label) || new Map<string, string>();
          pacientes.set(String(d.patient_id), (d.patients as any)?.name || 'Sem nome');
          diagnosMap.set(d.opcao_label, pacientes);
        }
      });

      const diagnosticosComPacientes = Array.from(diagnosMap.entries())
        .map(([nome, pacientes]) => ({
          nome,
          total: pacientes.size,
          // % dos pacientes internados que têm o diagnóstico
          percentual: totalPacientes > 0 ? Math.round((pacientes.size / totalPacientes) * 100) : 0,
          pacientes: Array.from(pacientes.values()),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const diagnosticos = diagnosticosComPacientes.map(d => ({ nome: d.nome, total: d.total, percentual: d.percentual }));

      // Top 5 Diagnósticos Principais e Secundários (reutiliza diagnosData)
      const allDiagnosticos = diagnosData;

      const diagnosPrincipaisMap = new Map<string, number>();
      const diagnosSecundariosMap = new Map<string, number>();

      allDiagnosticos?.forEach(d => {
        if (d.opcao_label) {
          if (d.pergunta_id === 1) { // Ajustar pergunta_id conforme necessário
            diagnosPrincipaisMap.set(d.opcao_label, (diagnosPrincipaisMap.get(d.opcao_label) || 0) + 1);
          } else if (d.pergunta_id === 2) { // Ajustar pergunta_id conforme necessário
            diagnosSecundariosMap.set(d.opcao_label, (diagnosSecundariosMap.get(d.opcao_label) || 0) + 1);
          }
        }
      });

      const diagnosticosPrincipaisTop5 = Array.from(diagnosPrincipaisMap.entries())
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const diagnosticosSecundariosTop5 = Array.from(diagnosSecundariosMap.entries())
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const medicacoesCount = medicacoesRes.count;
      const dispositivosCount = dispositivosRes.count;
      const dietasCount = dietasRes.count;

      // Microorganismos por tipo (Top 5 + Outros)
      const culturaData = (culturaRes.data || []).filter(c => patientsMap.has(c.paciente_id));

      // Só culturas positivas: descarta resultado negativo/sem crescimento/pendente.
      // O campo é texto livre ("Finalizada negativa", "Parcial negativa"...), então "negativ" vale em
      // qualquer posição, menos quando descreve o germe ("coagulase-negativo", "gram-negativo").
      const RESULTADO_NAO_POSITIVO = /^(esteril|pendente|em andamento|aguardando.*)$|sem crescimento|nao houve crescimento|ausencia de crescimento/;
      const isCulturaPositiva = (micro: string) => {
        const norm = micro.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
        if (norm === '' || RESULTADO_NAO_POSITIVO.test(norm)) return false;
        return !(/\bnegativ[oa]s?\b/.test(norm) && !/coagulase|gram/.test(norm));
      };

      // Agrupa ignorando maiúsculas/espaços ("E. coli " e "e. coli" são o mesmo germe)
      const microMap = new Map<string, { tipo: string; total: number; pacientes: Set<string> }>();
      culturaData.forEach(c => {
        if (c.microorganismo && isCulturaPositiva(c.microorganismo)) {
          const tipo = c.microorganismo.trim().replace(/\s+/g, ' ');
          const chave = tipo.toLowerCase();
          const existing = microMap.get(chave) || { tipo, total: 0, pacientes: new Set<string>() };
          const pacienteName = (c.patients as any)?.name || 'Sem nome';
          existing.total++;
          existing.pacientes.add(pacienteName);
          microMap.set(chave, existing);
        }
      });

      const microSorted = Array.from(microMap.values())
        .map(data => ({ tipo: data.tipo, total: data.total, pacientes: Array.from(data.pacientes) }))
        .sort((a, b) => b.total - a.total);

      const microTop5 = microSorted.slice(0, 5);
      const microResto = microSorted.slice(5);
      const microOutros = microResto.reduce((sum, m) => sum + m.total, 0);
      const microganismosComPacientes = microOutros > 0
        ? [...microTop5, { tipo: 'Outros', total: microOutros, pacientes: Array.from(new Set(microResto.flatMap(m => m.pacientes))) }]
        : microTop5;

      const microorganismosPorTipo = microganismosComPacientes.map(m => ({ tipo: m.tipo, total: m.total }));

      // Precauções Ativas (apenas de pacientes ativos) com nomes
      const precauctionsFull = precautionsRes.data;

      // Filtrar apenas precauções de pacientes ativos e adicionar nome
      const activePrecautions = (precauctionsFull || [])
        .filter(p => patientsMap.has(p.patient_id))
        .map(p => {
          const patient = patientsMap.get(p.patient_id);
          return {
            ...p,
            pacienteNome: (patient as any)?.name || '',
          };
        });

      const precaucoesAtivas = activePrecautions.length;
      // Um paciente pode ter mais de uma precaução: o % de isolamento conta pacientes, não precauções
      const pacientesEmIsolamento = new Set(activePrecautions.map(p => p.patient_id)).size;

      // Precauções por Tipo (pacientes ativos)
      const tipoMap = new Map<string, { total: number; pacientes: Set<string> }>();
      activePrecautions.forEach(p => {
        const tipo = p.tipo_precaucao || 'padrão';
        const existing = tipoMap.get(tipo) || { total: 0, pacientes: new Set<string>() };
        existing.total++;
        if (p.pacienteNome) existing.pacientes.add(p.pacienteNome);
        tipoMap.set(tipo, existing);
      });
      const precaucoesPorTipoComPacientes = Array.from(tipoMap.entries())
        .map(([tipo, data]) => ({ tipo, total: data.total, pacientes: Array.from(data.pacientes) }))
        .sort((a, b) => b.total - a.total);

      const precaucoesPorTipo = precaucoesPorTipoComPacientes.map(p => ({ tipo: p.tipo, total: p.total }));

      // Status dos Isolamentos (TODOS os ativos)
      // Data local (toISOString é UTC: depois das 21h em Brasília já viraria "amanhã")
      const agora = new Date();
      const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
      const diasAte = (dataFim: string) => {
        const fimDate = new Date(dataFim.slice(0, 10) + 'T00:00:00Z');
        const hojeDate = new Date(hoje + 'T00:00:00Z');
        return Math.round((fimDate.getTime() - hojeDate.getTime()) / (1000 * 60 * 60 * 24));
      };
      const statusCounts = { indefinido: 0, vencida: 0, breve: 0, prazo: 0 };

      // Isolamentos Detalhados (com nome do paciente)
      const isolamentosDetalhados = activePrecautions
        .map(p => {
          const dataFim: string | null = p.data_fim_calculada || null; // já usa COALESCE na view
          const diasRestantes = dataFim ? diasAte(dataFim) : null;
          if (diasRestantes === null) statusCounts.indefinido++;
          else if (diasRestantes < 0) statusCounts.vencida++;
          else if (diasRestantes <= 2) statusCounts.breve++;
          else statusCounts.prazo++;
          return {
            id: String(p.id),
            pacienteNome: p.pacienteNome || 'Sem nome',
            doenca: p.doenca_nome || 'Sem nome',
            tipo: p.tipo_precaucao || 'padrão',
            dataInicio: p.data_inicio,
            dataFim,
            diasRestantes,
          };
        })
        .sort((a, b) => (a.diasRestantes ?? Infinity) - (b.diasRestantes ?? Infinity));

      setData({
        totalPacientes,
        pacientesCriticos,
        pacientesEstavel,
        pacientesEmRisco,
        totalAlertas,
        alertasNoPrazo,
        alertasForaDoPrazo,
        escalasAtivas,
        diagnosticos,
        diagnosticosComPacientes,
        medicacoesAtivas: medicacoesCount || 0,
        dispositivosAtivos: dispositivosCount || 0,
        dietasAtivas: dietasCount || 0,
        precaucoesAtivas: precaucoesAtivas || 0,
        pacientesEmIsolamento,
        precaucoesPorTipo,
        precaucoesPorTipoComPacientes,
        isolamentosDetalhados,
        isolamentosStatus: statusCounts,
        diagnosticosPrincipaisTop5,
        diagnosticosSecundariosTop5,
        microorganismosPorTipo,
        microganismosComPacientes,
        cenarioVentilatorio,
        ventSemRegistro,
        ventTqtAConfirmar,
        pacientes: (patientsData || []).map(p => ({ id: p.id, name: p.name || 'Sem nome', bed_number: p.bed_number ?? null, dob: p.dob ?? null, dt_internacao: p.dt_internacao ?? null })),
        modalidadePorPaciente,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Carregando análises..." />;
  if (error) return <div className="p-6 text-danger-600">{error}</div>;
  if (!data) return <div className="p-6">Sem dados disponíveis</div>;

  const ocupacao = Math.round((data.totalPacientes / 22) * 100);
  const alertasForaPct = data.totalAlertas > 0 ? Math.round((data.alertasForaDoPrazo / data.totalAlertas) * 100) : 0;
  const isolamentoPct = data.totalPacientes > 0 ? Math.round((data.pacientesEmIsolamento / data.totalPacientes) * 100) : 0;
  const porPaciente = (n: number) => (data.totalPacientes > 0 ? `${(n / data.totalPacientes).toFixed(1).replace('.', ',')}/paciente` : undefined);
  const isolamentosAtencao = data.isolamentosDetalhados.filter(i => i.diasRestantes !== null && i.diasRestantes <= 2);
  const formatarData = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');
  const prazoLabel = (dias: number) => {
    if (dias < 0) return `venceu há ${-dias} ${dias === -1 ? 'dia' : 'dias'}`;
    if (dias === 0) return 'termina hoje';
    return `termina em ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1 md:mb-2">
              Análises Clínicas
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Round Kids • UTI Pediátrica
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Atualizando...' : 'Atualizar Dados'}
          </button>
        </div>

        {avisos.length > 0 && (
          <div role="alert" className="mb-6 rounded-lg border border-warning-300 dark:border-warning-700 bg-warning-50 dark:bg-warning-900/40 px-4 py-3 text-sm text-warning-800 dark:text-warning-200">
            <span className="font-bold">Dados incompletos.</span> Não foi possível carregar: {avisos.join(', ')}. Os números desses blocos podem aparecer zerados — tente atualizar.
          </div>
        )}

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
          {/* Pacientes — rosca de ocupação */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg border border-primary-200 dark:border-primary-700 p-4 md:p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <p className="text-xs uppercase font-bold text-primary-600 dark:text-primary-300 tracking-wider min-h-[2rem] flex items-center">
              👥 Pacientes
            </p>
            <KpiDonut percent={ocupacao} ringClass="text-primary-500 dark:text-primary-400" centerClass="text-primary-700 dark:text-primary-200" center={data.totalPacientes} sub={`de 22 leitos`} />
            <div className="text-xs text-primary-700 dark:text-primary-300 mt-3 font-medium leading-relaxed">
              <p>{data.pacientesEstavel} estável</p>
              <p>{data.pacientesCriticos} instável</p>
              <p>{data.pacientesEmRisco} em risco</p>
            </div>
          </div>

          {/* Alertas — rosca de fora do prazo */}
          <div className="bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900 dark:to-danger-800 rounded-lg border border-danger-200 dark:border-danger-700 p-4 md:p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <p className="text-xs uppercase font-bold text-danger-600 dark:text-danger-300 tracking-wider min-h-[2rem] flex items-center">
              🚨 Alertas
            </p>
            <KpiDonut percent={alertasForaPct} ringClass="text-danger-500 dark:text-danger-400" centerClass="text-danger-700 dark:text-danger-200" center={data.totalAlertas} sub={`${alertasForaPct}% fora`} />
            <div className="text-xs text-danger-700 dark:text-danger-300 mt-3 font-medium leading-relaxed">
              <p>{data.alertasNoPrazo} no prazo</p>
              <p>{data.alertasForaDoPrazo} fora do prazo</p>
            </div>
          </div>

          {/* Medicações — número com anel decorativo */}
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900 dark:to-accent-800 rounded-lg border border-accent-200 dark:border-accent-700 p-4 md:p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <p className="text-xs uppercase font-bold text-accent-600 dark:text-accent-300 tracking-wider min-h-[2rem] flex items-center">
              💊 Medicações
            </p>
            <KpiDonut percent={100} decorativo ringClass="text-accent-500 dark:text-accent-400" centerClass="text-accent-700 dark:text-accent-200" center={data.medicacoesAtivas} sub={porPaciente(data.medicacoesAtivas)} />
            <p className="text-xs text-accent-600 dark:text-accent-300 mt-3 font-medium">Prescrições ativas</p>
          </div>

          {/* Dispositivos — número com anel decorativo */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 p-4 md:p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <p className="text-xs uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider min-h-[2rem] flex items-center">
              🛏️ Dispositivos
            </p>
            <KpiDonut percent={100} decorativo ringClass="text-slate-500 dark:text-slate-400" centerClass="text-slate-900 dark:text-slate-100" center={data.dispositivosAtivos} sub={porPaciente(data.dispositivosAtivos)} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-medium">Ativos</p>
          </div>

          {/* Isolamento — rosca de % dos pacientes */}
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900 dark:to-accent-800 rounded-lg border border-accent-200 dark:border-accent-700 p-4 md:p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <p className="text-xs uppercase font-bold tracking-wider text-accent-700 dark:text-accent-300 min-h-[2rem] flex items-center">
              🛡️ Isolamento
            </p>
            <KpiDonut percent={isolamentoPct} ringClass="text-accent-500 dark:text-accent-400" centerClass="text-accent-700 dark:text-accent-200" center={data.pacientesEmIsolamento} sub={`${isolamentoPct}%`} />
            <div className="text-xs text-accent-700 dark:text-accent-400 mt-3 font-medium leading-relaxed">
              <p>de {data.totalPacientes} internados</p>
              <p>{data.precaucoesAtivas} precauções ativas</p>
              {data.isolamentosStatus.vencida > 0 && <p>{data.isolamentosStatus.vencida} com prazo vencido</p>}
            </div>
          </div>
        </div>

        {/* Abas */}
        <div role="tablist" aria-label="Seções das análises" className="flex gap-2 overflow-x-auto mb-8 border-b border-slate-200 dark:border-slate-700">
          {ABAS.map(a => (
            <button
              key={a.key}
              type="button"
              role="tab"
              aria-selected={aba === a.key}
              onClick={() => setAba(a.key)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition ${aba === a.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {aba === 'agora' && (<>
        {/* Prazo dos Isolamentos */}
        {data.precaucoesAtivas > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">⏳ Prazo dos Isolamentos</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Precauções ativas pela data de fim prevista</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-lg border border-danger-200 dark:border-danger-700 bg-danger-50 dark:bg-danger-900/40 p-3 text-center">
                <p className="text-2xl font-bold text-danger-700 dark:text-danger-300">{data.isolamentosStatus.vencida}</p>
                <p className="text-xs font-medium text-danger-700 dark:text-danger-300">Prazo vencido</p>
              </div>
              <div className="rounded-lg border border-warning-200 dark:border-warning-700 bg-warning-50 dark:bg-warning-900/40 p-3 text-center">
                <p className="text-2xl font-bold text-warning-700 dark:text-warning-300">{data.isolamentosStatus.breve}</p>
                <p className="text-xs font-medium text-warning-700 dark:text-warning-300">Termina em até 2 dias</p>
              </div>
              <div className="rounded-lg border border-success-200 dark:border-success-700 bg-success-50 dark:bg-success-900/40 p-3 text-center">
                <p className="text-2xl font-bold text-success-700 dark:text-success-300">{data.isolamentosStatus.prazo}</p>
                <p className="text-xs font-medium text-success-700 dark:text-success-300">No prazo</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 p-3 text-center">
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{data.isolamentosStatus.indefinido}</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Sem data de fim</p>
              </div>
            </div>
            {isolamentosAtencao.length > 0 ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Reavaliar</p>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {isolamentosAtencao.map(iso => (
                    <li key={iso.id} className="py-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{iso.pacienteNome}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {iso.doenca} • {iso.tipo.split('_').join(' + ')}{iso.dataFim ? ` • fim ${formatarData(iso.dataFim)}` : ''}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold ${iso.diasRestantes! < 0 ? 'bg-danger-100 dark:bg-danger-900/60 text-danger-700 dark:text-danger-300' : 'bg-warning-100 dark:bg-warning-900/60 text-warning-700 dark:text-warning-300'}`}>
                        {prazoLabel(iso.diasRestantes!)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum isolamento vencido ou terminando nos próximos 2 dias.</p>
            )}
          </div>
        )}

        </>)}

        {aba === 'infeccao' && (<>
        {/* Microorganismos por Tipo */}
        {data.microorganismosPorTipo.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">🦠 Microorganismos Identificados</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Culturas positivas dos pacientes internados</p>
            <div className="space-y-4 relative">
              {data.microorganismosPorTipo.map((micro, idx) => {
                const microData = data.microganismosComPacientes.find(m => m.tipo === micro.tipo);
                const totalGeral = data.microorganismosPorTipo.reduce((sum, m) => sum + m.total, 0);
                const percentual = Math.round((micro.total / totalGeral) * 100);

                return (
                  <div
                    key={micro.tipo}
                    className="relative flex items-center gap-3 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded transition"
                    onMouseEnter={() => setTooltipData({ tipo: micro.tipo, total: micro.total, percentual, pacientes: microData?.pacientes || [] })}
                    onMouseLeave={() => setTooltipData(null)}
                  >
                    <div className="min-w-7 w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{micro.tipo}</p>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                        <div className="animate-bar bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full" style={{ width: `${(micro.total / Math.max(...data.microorganismosPorTipo.map(m => m.total), 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{micro.total} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{micro.total === 1 ? 'cultura' : 'culturas'}</span></p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{microData?.pacientes.length || 0} {microData?.pacientes.length === 1 ? 'paciente' : 'pacientes'}</p>
                    </div>

                    {/* Tooltip Visual */}
                    {tooltipData?.tipo === micro.tipo && tooltipData.pacientes.length > 0 && (
                      <div className="absolute top-full left-12 mt-1 bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 px-4 py-3 rounded shadow-xl z-30 text-sm w-72 pointer-events-none">
                        <p className="font-bold text-base mb-2">{tooltipData.tipo}</p>
                        <p className="text-slate-300 dark:text-slate-400 mb-3">{tooltipData.total} culturas ({tooltipData.percentual}%)</p>
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Pacientes:</p>
                        <ul className="space-y-1 max-h-48 overflow-y-auto">
                          {tooltipData.pacientes.map(paciente => (
                            <li key={paciente} className="text-sm text-slate-200 break-words">
                              • {paciente}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Isolamento por Tipo */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">🛡️ Isolamento por Tipo</h2>
            <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs font-bold rounded">
              Ativas
            </span>
          </div>
          <div className="space-y-3">
            {data.precaucoesPorTipo.slice(0, 5).map(tipo => {
              const maxTotal = Math.max(...data.precaucoesPorTipo.map(t => t.total));
              const totalGeral = data.precaucoesPorTipo.reduce((sum, t) => sum + t.total, 0);
              const percentual = Math.round((tipo.total / totalGeral) * 100);
              const tipoData = data.precaucoesPorTipoComPacientes.find(t => t.tipo === tipo.tipo);
              const tipoLabel = tipo.tipo.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' + ');
              return (
                <button
                  key={tipo.tipo}
                  type="button"
                  className="w-full flex items-center gap-2 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-700/50 -mx-2 px-2 py-1 rounded transition text-left"
                  onClick={() => setModalData({ titulo: `🛡️ ${tipoLabel}`, total: tipo.total, percentual, pacientes: tipoData?.pacientes || [] })}
                >
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-24 sm:w-64 shrink-0 truncate">{tipoLabel}</p>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div className="animate-bar bg-gradient-to-r from-accent-400 to-accent-600 h-3 rounded-full" style={{ width: `${(tipo.total / maxTotal) * 100}%` }}></div>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 min-w-8 text-right">{tipo.total}</p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">Clique em um tipo para ver os pacientes</p>
        </div>

        </>)}

        {aba === 'respiratorio' && (<>
        {/* Cenário Ventilatório Geral */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">🫁 Cenário Ventilatório Geral</h2>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg flex-shrink-0">
              {data.totalPacientes} pacientes mapeados
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.cenarioVentilatorio.map(item => {
              const vm = MODALIDADES_VM.includes(item.modalidade);
              const vazio = item.total === 0;
              return (
                <button
                  key={item.modalidade}
                  type="button"
                  disabled={vazio}
                  onClick={() => setModalData({
                    titulo: `🫁 ${item.modalidade}`,
                    total: item.total,
                    percentual: data.totalPacientes > 0 ? Math.round((item.total / data.totalPacientes) * 100) : 0,
                    pacientes: item.pacientes,
                  })}
                  className={`rounded-lg border p-3 text-left transition ${vazio ? 'cursor-default' : 'cursor-pointer hover:shadow-md'} ${vm && !vazio
                    ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/40'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40'}`}
                >
                  <p className={`text-xs ${vm ? 'font-bold' : 'font-medium'} text-slate-600 dark:text-slate-300`}>{item.modalidade}</p>
                  <p className={`text-2xl font-bold text-center mt-1 ${vazio ? 'text-slate-300 dark:text-slate-600' : 'text-slate-900 dark:text-slate-100'}`}>{item.total}</p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Clique em uma modalidade para ver os pacientes.
            {data.ventSemRegistro > 0 && ` ${data.ventSemRegistro} ${data.ventSemRegistro === 1 ? 'paciente não tem' : 'pacientes não têm'} suporte nem dispositivo respiratório registrado e ${data.ventSemRegistro === 1 ? 'conta' : 'contam'} como Ar Ambiente.`}
          </p>
          {data.ventTqtAConfirmar.length > 0 && (
            <button
              type="button"
              onClick={() => setModalData({
                titulo: '🫁 TQT em VM a confirmar',
                total: data.ventTqtAConfirmar.length,
                percentual: data.totalPacientes > 0 ? Math.round((data.ventTqtAConfirmar.length / data.totalPacientes) * 100) : 0,
                pacientes: data.ventTqtAConfirmar,
              })}
              className="mt-3 w-full text-left rounded-lg border border-warning-300 dark:border-warning-700 bg-warning-50 dark:bg-warning-900/40 px-3 py-2 text-xs text-warning-800 dark:text-warning-200 hover:shadow-md transition"
            >
              <span className="font-bold">{data.ventTqtAConfirmar.length} em "TQT em VM" a confirmar.</span> Têm traqueostomia, mas nenhum ventilador nem suporte registrado. Registre o suporte no paciente para corrigir a contagem. Clique para ver quem.
            </button>
          )}
        </div>

        </>)}

        <AnalisesComplementares
          pacientes={data.pacientes}
          modalidadePorPaciente={data.modalidadePorPaciente}
          aba={aba}
          antesDaEvolucao={<>
        {/* Distribuição de Diagnósticos */}
        {data.diagnosticos.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">🏥 Distribuição de Diagnósticos</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Pacientes internados com o diagnóstico (principal ou secundário) e % do total de internados</p>
            <div className="space-y-4">
              {data.diagnosticos.map(diag => {
                const diagData = data.diagnosticosComPacientes.find(d => d.nome === diag.nome);
                return (
                  <div
                    key={diag.nome}
                    className="relative flex items-center gap-3 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-700/50 -mx-2 px-2 py-1 rounded transition"
                    onMouseEnter={() => setTooltipData({ tipo: diag.nome, total: diag.total, percentual: diag.percentual, pacientes: diagData?.pacientes || [] })}
                    onMouseLeave={() => setTooltipData(null)}
                  >
                    <div className="flex-1 flex items-center gap-3">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-40">{diag.nome}</p>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden relative">
                        <div className="animate-bar bg-gradient-to-r from-primary-400 to-primary-600 h-6 rounded-full" style={{ width: `${diag.percentual}%` }}></div>
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 drop-shadow-md">{diag.percentual}%</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-8 text-right">{diag.total}</p>

                    {/* Tooltip Visual */}
                    {tooltipData?.tipo === diag.nome && tooltipData.pacientes.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 px-4 py-3 rounded shadow-xl z-30 text-sm w-72 pointer-events-none">
                        <p className="font-bold text-base mb-2">{tooltipData.tipo}</p>
                        <p className="text-slate-300 dark:text-slate-400 mb-3">{tooltipData.total} pacientes ({tooltipData.percentual}%)</p>
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Pacientes:</p>
                        <ul className="space-y-1 max-h-48 overflow-y-auto">
                          {tooltipData.pacientes.map(paciente => (
                            <li key={paciente} className="text-sm text-slate-200 break-words">
                              • {paciente}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top 5 Diagnósticos Principais e Secundários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top 5 Diagnósticos Principais */}
          {data.diagnosticosPrincipaisTop5.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">📋 Top 5 Diagnósticos Principais</h2>
              <div className="space-y-4">
                {data.diagnosticosPrincipaisTop5.map((diag, idx) => (
                  <div key={diag.nome} className="flex items-center gap-3">
                    <div className="min-w-7 w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{diag.nome}</p>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                        <div className="animate-bar bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full" style={{ width: `${(diag.total / Math.max(...data.diagnosticosPrincipaisTop5.map(d => d.total), 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-6 text-right">{diag.total}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 5 Diagnósticos Secundários */}
          {data.diagnosticosSecundariosTop5.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">📋 Top 5 Diagnósticos Secundários</h2>
              <div className="space-y-4">
                {data.diagnosticosSecundariosTop5.map((diag, idx) => (
                  <div key={diag.nome} className="flex items-center gap-3">
                    <div className="min-w-7 w-7 h-7 rounded-full bg-gradient-to-br from-danger-400 to-danger-600 flex items-center justify-center text-white text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{diag.nome}</p>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                        <div className="animate-bar bg-gradient-to-r from-danger-400 to-danger-600 h-2 rounded-full" style={{ width: `${(diag.total / Math.max(...data.diagnosticosSecundariosTop5.map(d => d.total), 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-6 text-right">{diag.total}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Escalas e Dietas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">🧠 Escalas</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Última avaliação de cada paciente internado. A barra mostra quantos internados têm a escala registrada.</p>
            {data.escalasAtivas.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma escala registrada para os pacientes internados.</p>
            ) : (
              <div className="space-y-3">
                {data.escalasAtivas.slice(0, 5).map(escala => (
                  <div key={escala.scale_name}>
                    <div className="flex justify-between mb-1 gap-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{escala.scale_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{escala.total} {escala.total === 1 ? 'paciente' : 'pacientes'}</span> • média {escala.media} ({escala.minimo} a {escala.maximo})
                      </p>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="animate-bar bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full" style={{ width: `${data.totalPacientes > 0 ? (escala.total / data.totalPacientes) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">🍽️ Dietas</h3>
            <p className="text-5xl font-bold text-accent-600 dark:text-accent-400 mb-2">{data.dietasAtivas}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Prescrições ativas</p>
          </div>
        </div>
          </>}
        />

        {aba === 'agora' && <ProblemasEquipamento />}
      </div>

      {/* Modal de Pacientes por Tipo */}
      {modalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setModalData(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{modalData.titulo}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{modalData.total} pacientes ({modalData.percentual}%)</p>
              </div>
              <button
                onClick={() => setModalData(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {modalData.pacientes.length > 0 ? (
                <ul className="space-y-2">
                  {modalData.pacientes.map(paciente => (
                    <li key={paciente} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-primary-500 mt-0.5">•</span>
                      <span>{paciente}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum paciente encontrado.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
