import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loading } from '../components/ui/Loading';

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

interface DashboardData {
  totalPacientes: number;
  pacientesCriticos: number;
  pacientesEstavel: number;
  pacientesEmRisco: number;
  totalAlertas: number;
  alertasNoPrazo: number;
  alertasForaDoPrazo: number;
  escalasAtivas: Array<{ scale_name: string; total: number; media: number }>;
  diagnosticos: Array<{ nome: string; total: number; percentual: number }>;
  diagnosticosComPacientes: Array<{ nome: string; total: number; percentual: number; pacientes: string[] }>;
  medicacoesAtivas: number;
  dispositivosAtivos: number;
  dietasAtivas: number;
  precaucoesAtivas: number;
  precaucoesPorTipo: Array<{ tipo: string; total: number }>;
  precaucoesPorTipoComPacientes: Array<{ tipo: string; total: number; pacientes: string[] }>;
  isolamentosDetalhados: Array<{ pacienteNome: string; doenca: string; tipo: string; dataInicio: string; dataFim: string; diasRestantes: number }>;
  isolamentosStatus: { indefinido: number; vencida: number; breve: number; prazo: number };
  diagnosticosPrincipaisTop5: Array<{ nome: string; total: number }>;
  diagnosticosSecundariosTop5: Array<{ nome: string; total: number }>;
  microorganismosPorTipo: Array<{ tipo: string; total: number }>;
  microganismosComPacientes: Array<{ tipo: string; total: number; pacientes: string[] }>;
}

export const DashboardAnalyticsScreen: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      ] = await Promise.all([
        supabase.from('patients').select('id, status, name').is('archived_at', null),
        supabase.from('dashboard_summary').select('*'),
        supabase.from('scale_scores').select('scale_name, score').is('archived_at', null),
        supabase.from('paciente_diagnosticos').select('opcao_label, pergunta_id, patient_id, patients(name)').eq('arquivado', false),
        supabase.from('medicacoes_pacientes').select('*', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('dispositivos_pacientes').select('*', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('dietas_pacientes').select('*', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('culturas_pacientes').select('microorganismo, paciente_id, patients(name)').eq('is_archived', false),
        supabase.from('precautions_com_calculo').select('id, patient_id, tipo_precaucao, doenca_nome, data_inicio, data_fim_calculada').is('archived_at', null),
      ]);

      const patientsData = patientsRes.data;
      const totalPacientes = patientsData?.length || 0;
      const pacientesCriticos = patientsData?.filter(p => p.status === 'instavel').length || 0;
      const pacientesEstavel = patientsData?.filter(p => p.status === 'estavel').length || 0;
      const pacientesEmRisco = patientsData?.filter(p => p.status === 'em_risco').length || 0;

      const alertsData = alertsRes.data;

      const totalAlertas = alertsData?.[0]?.totalAlertas || 0;
      const alertasNoPrazo = alertsData?.[0]?.totalNoPrazo || 0;
      const alertasForaDoPrazo = alertsData?.[0]?.totalForaDoPrazo || 0;

      const scalesData = scalesRes.data;

      const escalasMap = new Map<string, { total: number; sum: number }>();
      scalesData?.forEach(s => {
        if (!escalasMap.has(s.scale_name)) {
          escalasMap.set(s.scale_name, { total: 0, sum: 0 });
        }
        const current = escalasMap.get(s.scale_name)!;
        current.total += 1;
        current.sum += s.score || 0;
      });

      const escalasAtivas = Array.from(escalasMap.entries())
        .map(([name, { total, sum }]) => ({
          scale_name: name,
          total,
          media: parseFloat((sum / total).toFixed(1)),
        }))
        .sort((a, b) => b.total - a.total);

      // Diagnósticos (reutiliza a query única de paciente_diagnosticos)
      const diagnosData = diagnosRes.data;

      const diagnosMap = new Map<string, { total: number; pacientes: Set<string> }>();
      diagnosData?.forEach(d => {
        if (d.opcao_label) {
          const existing = diagnosMap.get(d.opcao_label) || { total: 0, pacientes: new Set<string>() };
          const pacienteName = (d.patients as any)?.name || 'Sem nome';
          existing.total++;
          existing.pacientes.add(pacienteName);
          diagnosMap.set(d.opcao_label, existing);
        }
      });

      const totalDiagnos = diagnosMap.size > 0 ? Math.max(...Array.from(diagnosMap.values()).map(v => v.total)) : 1;
      const diagnosticosComPacientes = Array.from(diagnosMap.entries())
        .map(([nome, data]) => ({
          nome,
          total: data.total,
          percentual: parseFloat((totalDiagnos > 0 ? (data.total / totalDiagnos) * 100 : 0).toFixed(1)),
          pacientes: Array.from(data.pacientes),
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
      const culturaData = culturaRes.data;

      const microMap = new Map<string, { total: number; pacientes: Set<string> }>();
      culturaData?.forEach(c => {
        if (c.microorganismo) {
          const existing = microMap.get(c.microorganismo) || { total: 0, pacientes: new Set<string>() };
          const pacienteName = (c.patients as any)?.name || 'Sem nome';
          existing.total++;
          existing.pacientes.add(pacienteName);
          microMap.set(c.microorganismo, existing);
        }
      });

      const microSorted = Array.from(microMap.entries())
        .map(([tipo, data]) => ({ tipo, total: data.total, pacientes: Array.from(data.pacientes) }))
        .sort((a, b) => b.total - a.total);

      const microTop5 = microSorted.slice(0, 5);
      const microOutros = microSorted.slice(5).reduce((sum, m) => sum + m.total, 0);
      const microganismosComPacientes = microOutros > 0
        ? [...microTop5, { tipo: 'Outros', total: microOutros, pacientes: [] }]
        : microTop5;

      const microorganismosPorTipo = microganismosComPacientes.map(m => ({ tipo: m.tipo, total: m.total }));

      // Precauções Ativas (apenas de pacientes ativos) com nomes
      const precauctionsFull = precautionsRes.data;

      // Criar mapa de pacientes por ID
      const patientsMap = new Map(patientsData?.map(p => [p.id, p]) || []);

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
      const hoje = new Date().toISOString().split('T')[0];
      const statusCounts = { indefinido: 0, vencida: 0, breve: 0, prazo: 0 };

      activePrecautions.forEach(p => {
        const dataFim = p.data_fim_calculada; // já usa COALESCE na view
        if (!dataFim) {
          statusCounts.indefinido++;
        } else if (dataFim < hoje) {
          statusCounts.vencida++;
        } else {
          const fimDate = new Date(dataFim + 'T00:00:00Z');
          const hojeDate = new Date(hoje + 'T00:00:00Z');
          const dias = Math.ceil((fimDate.getTime() - hojeDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dias <= 2) {
            statusCounts.breve++;
          } else {
            statusCounts.prazo++;
          }
        }
      });

      // Isolamentos Detalhados (com nome do paciente)
      const isolamentosDetalhados = activePrecautions
        .filter(p => p.pacienteNome)
        .map(p => {
          const dataFim = p.data_fim_calculada;
          let diasRestantes = 0;
          if (dataFim) {
            const fimDate = new Date(dataFim + 'T00:00:00Z');
            const hojeDate = new Date(hoje + 'T00:00:00Z');
            diasRestantes = Math.ceil((fimDate.getTime() - hojeDate.getTime()) / (1000 * 60 * 60 * 24));
          }
          return {
            pacienteNome: p.pacienteNome,
            doenca: p.doenca_nome || 'Sem nome',
            tipo: p.tipo_precaucao || 'padrão',
            dataInicio: p.data_inicio,
            dataFim: dataFim || 'Indefinido',
            diasRestantes: Math.max(0, diasRestantes),
          };
        })
        .sort((a, b) => a.diasRestantes - b.diasRestantes);

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
        precaucoesPorTipo,
        precaucoesPorTipoComPacientes,
        isolamentosDetalhados,
        isolamentosStatus: statusCounts,
        diagnosticosPrincipaisTop5,
        diagnosticosSecundariosTop5,
        microorganismosPorTipo,
        microganismosComPacientes,
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
  const isolamentoPct = data.totalPacientes > 0 ? Math.round((data.precaucoesAtivas / data.totalPacientes) * 100) : 0;

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
            <KpiDonut percent={100} decorativo ringClass="text-accent-500 dark:text-accent-400" centerClass="text-accent-700 dark:text-accent-200" center={data.medicacoesAtivas} />
            <p className="text-xs text-accent-600 dark:text-accent-300 mt-3 font-medium">Prescrições ativas</p>
          </div>

          {/* Dispositivos — número com anel decorativo */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 p-4 md:p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <p className="text-xs uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider min-h-[2rem] flex items-center">
              🛏️ Dispositivos
            </p>
            <KpiDonut percent={100} decorativo ringClass="text-slate-500 dark:text-slate-400" centerClass="text-slate-900 dark:text-slate-100" center={data.dispositivosAtivos} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-medium">Ativos</p>
          </div>

          {/* Isolamento — rosca de % dos pacientes */}
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900 dark:to-accent-800 rounded-lg border border-accent-200 dark:border-accent-700 p-4 md:p-6 shadow-lg hover:shadow-xl transition flex flex-col items-center text-center">
            <p className="text-xs uppercase font-bold tracking-wider text-accent-700 dark:text-accent-300 min-h-[2rem] flex items-center">
              🛡️ Isolamento
            </p>
            <KpiDonut percent={isolamentoPct} ringClass="text-accent-500 dark:text-accent-400" centerClass="text-accent-700 dark:text-accent-200" center={data.precaucoesAtivas} sub={`${isolamentoPct}%`} />
            <p className="text-xs text-accent-700 dark:text-accent-400 mt-3 font-medium">de {data.totalPacientes} internados</p>
          </div>
        </div>

        {/* Microorganismos por Tipo */}
        {data.microorganismosPorTipo.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">🦠 Microorganismos Identificados</h2>
            <div className="space-y-4 relative">
              {data.microorganismosPorTipo.map((micro, idx) => {
                const colors = ['from-primary-400 to-primary-600', 'from-danger-400 to-danger-600', 'from-accent-400 to-accent-600', 'from-success-400 to-success-600', 'from-warning-400 to-warning-600', 'from-slate-400 to-slate-600'];
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
                        <div className={`animate-bar bg-gradient-to-r ${colors[idx % colors.length]} h-2 rounded-full`} style={{ width: `${(micro.total / Math.max(...data.microorganismosPorTipo.map(m => m.total), 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{micro.total}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">culturas</p>
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

        {/* Distribuição de Diagnósticos */}
        {data.diagnosticos.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">🏥 Distribuição de Diagnósticos</h2>
            <div className="space-y-4">
              {data.diagnosticos.map((diag, idx) => {
                const colors = ['from-primary-400 to-primary-600', 'from-danger-400 to-danger-600', 'from-accent-400 to-accent-600', 'from-success-400 to-success-600', 'from-warning-400 to-warning-600'];
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
                        <div className={`animate-bar bg-gradient-to-r ${colors[idx]} h-6 rounded-full`} style={{ width: `${(diag.total / Math.max(...data.diagnosticos.map(d => d.total))) * 100}%` }}></div>
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

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Taxa Ocupação */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">📊 Taxa de Ocupação</h2>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-primary-500 dark:text-primary-400 transition-all"
                    strokeDasharray={`${(ocupacao / 100) * 314} 314`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{ocupacao}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ocupado</p>
                </div>
              </div>
              <div className="w-full max-w-xs">
                <div className="space-y-3 text-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Ocupados <span className="text-primary-600 dark:text-primary-400">{data.totalPacientes}/22</span>
                    </p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <div className="animate-bar bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full" style={{ width: `${ocupacao}%` }}></div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">{22 - data.totalPacientes}</span> livres
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Escalas Top 5 */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">🧠 Escalas (Top 5)</h2>
            <div className="space-y-3">
              {data.escalasAtivas.slice(0, 5).map((escala, idx) => (
                <div key={escala.scale_name} className="flex items-center gap-2">
                  <div className="min-w-6 w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1 gap-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{escala.scale_name}</p>
                      <p className="text-xs font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">{escala.media}</p>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="animate-bar bg-gradient-to-r from-primary-400 to-primary-500 h-2 rounded-full" style={{ width: `${(escala.total / Math.max(...data.escalasAtivas.map(e => e.total))) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Isolamento por Tipo */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">🛡️ Isolamento por Tipo</h2>
              <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs font-bold rounded">
                Ativas
              </span>
            </div>
            <div className="space-y-3">
              {data.precaucoesPorTipo.slice(0, 5).map((tipo, idx) => {
                const colors = ['from-success-400 to-success-600', 'from-accent-400 to-accent-600', 'from-primary-400 to-primary-600', 'from-warning-400 to-warning-600', 'from-danger-400 to-danger-600'];
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
                    onClick={() => setModalData({ titulo: tipoLabel, total: tipo.total, percentual, pacientes: tipoData?.pacientes || [] })}
                  >
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-24 truncate">{tipoLabel}</p>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div className={`animate-bar bg-gradient-to-r ${colors[idx]} h-3 rounded-full flex items-center justify-end pr-2`} style={{ width: `${(tipo.total / maxTotal) * 100}%` }}></div>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 min-w-8 text-right">{tipo.total}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">Clique em um tipo para ver os pacientes</p>
          </div>
        </div>

        {/* Detalhes Clínicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">🍽️ Dietas</h3>
            <p className="text-5xl font-bold text-accent-600 dark:text-accent-400 mb-2">{data.dietasAtivas}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Prescrições ativas</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">⏱️ Distribuição de Alertas</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-success-600 dark:text-success-400">No prazo</span>
                  <span className="text-success-600 dark:text-success-400">{Math.round((data.alertasNoPrazo / data.totalAlertas) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="animate-bar bg-gradient-to-r from-success-400 to-success-600 h-3 rounded-full" style={{ width: `${(data.alertasNoPrazo / data.totalAlertas) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-danger-600 dark:text-danger-400">Crítico</span>
                  <span className="text-danger-600 dark:text-danger-400">{Math.round((data.alertasForaDoPrazo / data.totalAlertas) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="animate-bar bg-gradient-to-r from-danger-400 to-danger-600 h-3 rounded-full" style={{ width: `${(data.alertasForaDoPrazo / data.totalAlertas) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">📈 Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Escalas ativas</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{data.escalasAtivas.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Média de ocupação</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{ocupacao}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Taxa crítica</span>
                <span className="font-bold text-danger-600 dark:text-danger-400">
                  {Math.round((data.alertasForaDoPrazo / data.totalAlertas) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">🛡️ {modalData.titulo}</h2>
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
