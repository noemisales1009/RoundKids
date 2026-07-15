import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loading } from '../components/ui/Loading';

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
  medicacoesAtivas: number;
  dispositivosAtivos: number;
  dietasAtivas: number;
  precaucoesAtivas: number;
  precaucoesPorTipo: Array<{ tipo: string; total: number }>;
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: patientsData } = await supabase
        .from('patients')
        .select('id, status')
        .is('archived_at', null);

      const totalPacientes = patientsData?.length || 0;
      const pacientesCriticos = patientsData?.filter(p => p.status === 'critico').length || 0;
      const pacientesEstavel = patientsData?.filter(p => p.status === 'estavel').length || 0;
      const pacientesEmRisco = patientsData?.filter(p => p.status === 'em_risco').length || 0;

      const { data: alertsData } = await supabase
        .from('dashboard_summary')
        .select('*');

      const totalAlertas = alertsData?.[0]?.totalAlertas || 0;
      const alertasNoPrazo = alertsData?.[0]?.totalNoPrazo || 0;
      const alertasForaDoPrazo = alertsData?.[0]?.totalForaDoPrazo || 0;

      const { data: scalesData } = await supabase
        .from('scale_scores')
        .select('scale_name, score')
        .is('archived_at', null);

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

      // Diagnósticos
      const { data: diagnosData } = await supabase.from('paciente_diagnosticos')
        .select('opcao_label')
        .eq('arquivado', false);

      const diagnosMap = new Map<string, number>();
      diagnosData?.forEach(d => {
        if (d.opcao_label) {
          diagnosMap.set(d.opcao_label, (diagnosMap.get(d.opcao_label) || 0) + 1);
        }
      });

      const totalDiagnos = diagnosMap.size > 0 ? Math.max(...diagnosMap.values()) : 1;
      const diagnosticos = Array.from(diagnosMap.entries())
        .map(([nome, total]) => ({
          nome,
          total,
          percentual: parseFloat((totalDiagnos > 0 ? (total / totalDiagnos) * 100 : 0).toFixed(1)),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Top 5 Diagnósticos Principais e Secundários
      const { data: allDiagnosticos } = await supabase.from('paciente_diagnosticos')
        .select('opcao_label, pergunta_id')
        .eq('arquivado', false);

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

      const { count: medicacoesCount } = await supabase
        .from('medicacoes_pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('is_archived', false);

      const { count: dispositivosCount } = await supabase
        .from('dispositivos_pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('is_archived', false);

      const { count: dietasCount } = await supabase
        .from('dietas_pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('is_archived', false);

      // Microorganismos por tipo (Top 5 + Outros)
      const { data: culturaData } = await supabase
        .from('culturas_pacientes')
        .select('microorganismo, paciente_id, patients(name)')
        .eq('is_archived', false);

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
      const { data: precauctionsFull } = await supabase
        .from('precautions_com_calculo')
        .select('id, patient_id, tipo_precaucao, doenca_nome, data_inicio, data_fim_calculada')
        .is('archived_at', null);

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
      const tipoMap = new Map<string, number>();
      activePrecautions.forEach(p => {
        const tipo = p.tipo_precaucao || 'padrão';
        tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + 1);
      });
      const precaucoesPorTipo = Array.from(tipoMap.entries())
        .map(([tipo, total]) => ({ tipo, total }))
        .sort((a, b) => b.total - a.total);

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
        medicacoesAtivas: medicacoesCount || 0,
        dispositivosAtivos: dispositivosCount || 0,
        dietasAtivas: dietasCount || 0,
        precaucoesAtivas: precaucoesAtivas || 0,
        precaucoesPorTipo,
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Análises Clínicas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Round Kids • UTI Pediátrica
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg border border-primary-200 dark:border-primary-700 p-6 shadow-lg hover:shadow-xl transition">
            <p className="text-xs uppercase font-bold text-primary-600 dark:text-primary-300 tracking-wider mb-3">
              👥 Pacientes
            </p>
            <p className="text-4xl font-bold text-primary-700 dark:text-primary-200 mb-2">{data.totalPacientes}</p>
            <div className="flex gap-2 text-xs font-semibold flex-wrap">
              <span className="px-2 py-1 bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 rounded">
                {data.pacientesEstavel} estável
              </span>
              <span className="px-2 py-1 bg-danger-200 dark:bg-danger-700 text-danger-700 dark:text-danger-200 rounded">
                {data.pacientesCriticos} instável
              </span>
              <span className="px-2 py-1 bg-warning-200 dark:bg-warning-700 text-warning-700 dark:text-warning-200 rounded">
                {data.pacientesEmRisco} risco
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900 dark:to-danger-800 rounded-lg border border-danger-200 dark:border-danger-700 p-6 shadow-lg hover:shadow-xl transition">
            <p className="text-xs uppercase font-bold text-danger-600 dark:text-danger-300 tracking-wider mb-3">
              🚨 Alertas
            </p>
            <p className="text-4xl font-bold text-danger-700 dark:text-danger-200 mb-2">{data.totalAlertas}</p>
            <div className="flex gap-2 text-xs font-semibold">
              <span className="px-2 py-1 bg-success-200 dark:bg-success-700 text-success-700 dark:text-success-200 rounded">
                {data.alertasNoPrazo} OK
              </span>
              <span className="px-2 py-1 bg-danger-200 dark:bg-danger-700 text-danger-700 dark:text-danger-200 rounded">
                {data.alertasForaDoPrazo} crítico
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900 dark:to-accent-800 rounded-lg border border-accent-200 dark:border-accent-700 p-6 shadow-lg hover:shadow-xl transition">
            <p className="text-xs uppercase font-bold text-accent-600 dark:text-accent-300 tracking-wider mb-3">
              💊 Medicações
            </p>
            <p className="text-4xl font-bold text-accent-700 dark:text-accent-200">{data.medicacoesAtivas}</p>
            <p className="text-xs text-accent-600 dark:text-accent-300 mt-2">Prescrições ativas</p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 p-6 shadow-lg hover:shadow-xl transition">
            <p className="text-xs uppercase font-bold text-slate-600 dark:text-slate-300 tracking-wider mb-3">
              🛏️ Dispositivos
            </p>
            <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">{data.dispositivosAtivos}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Ativos</p>
          </div>

          <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900 dark:to-accent-800 rounded-lg border border-accent-200 dark:border-accent-700 p-6 shadow-lg hover:shadow-xl transition">
            <p className="text-xs uppercase font-bold tracking-wider text-accent-700 dark:text-accent-300 mb-3">
              🛡️ Isolamento (Ativas)
            </p>
            <p className="text-4xl font-bold mb-2 text-accent-700 dark:text-accent-200">{data.precaucoesAtivas}</p>
            <p className="text-xs text-accent-700 dark:text-accent-400">Pacientes em isolamento</p>
          </div>
        </div>

        {/* Microorganismos por Tipo */}
        {data.microorganismosPorTipo.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">🦠 Microorganismos Identificados</h2>
            <div className="space-y-4">
              {data.microorganismosPorTipo.map((micro, idx) => {
                const colors = ['from-primary-400 to-primary-600', 'from-danger-400 to-danger-600', 'from-accent-400 to-accent-600', 'from-success-400 to-success-600', 'from-warning-400 to-warning-600', 'from-slate-400 to-slate-600'];
                const microData = data.microganismosComPacientes.find(m => m.tipo === micro.tipo);
                const totalGeral = data.microorganismosPorTipo.reduce((sum, m) => sum + m.total, 0);
                const percentual = Math.round((micro.total / totalGeral) * 100);
                const pacientesStr = microData?.pacientes.slice(0, 3).join(', ') + (microData && microData.pacientes.length > 3 ? '...' : '');
                const tooltipText = `${micro.tipo}\n${micro.total} culturas (${percentual}%)\nPacientes: ${pacientesStr || 'N/A'}`;

                return (
                  <div key={micro.tipo} className="flex items-center gap-3" title={tooltipText}>
                    <div className="min-w-7 w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{micro.tipo}</p>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                        <div className={`bg-gradient-to-r ${colors[idx % colors.length]} h-2 rounded-full`} style={{ width: `${(micro.total / Math.max(...data.microorganismosPorTipo.map(m => m.total), 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-6 text-right">{micro.total}</p>
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
                return (
                  <div key={diag.nome} className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-3">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-40">{diag.nome}</p>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden relative">
                        <div className={`bg-gradient-to-r ${colors[idx]} h-6 rounded-full`} style={{ width: `${(diag.total / Math.max(...data.diagnosticos.map(d => d.total))) * 100}%` }}></div>
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 drop-shadow-md">{diag.percentual}%</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-8 text-right">{diag.total}</p>
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
                        <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full" style={{ width: `${(diag.total / Math.max(...data.diagnosticosPrincipaisTop5.map(d => d.total), 1)) * 100}%` }}></div>
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
                        <div className="bg-gradient-to-r from-danger-400 to-danger-600 h-2 rounded-full" style={{ width: `${(diag.total / Math.max(...data.diagnosticosSecundariosTop5.map(d => d.total), 1)) * 100}%` }}></div>
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
                      <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full" style={{ width: `${ocupacao}%` }}></div>
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
                      <div className="bg-gradient-to-r from-primary-400 to-primary-500 h-2 rounded-full" style={{ width: `${(escala.total / Math.max(...data.escalasAtivas.map(e => e.total))) * 100}%` }}></div>
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
                return (
                  <div key={tipo.tipo} className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-24 truncate">{tipo.tipo}</p>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div className={`bg-gradient-to-r ${colors[idx]} h-3 rounded-full flex items-center justify-end pr-2`} style={{ width: `${(tipo.total / maxTotal) * 100}%` }}></div>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 min-w-8 text-right">{tipo.total}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Isolamentos - Gráfico + Tabela */}
        {data.isolamentosDetalhados.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Distribuição */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">🛡️ Isolamentos por Tipo</h2>
              <div className="space-y-3">
                {data.precaucoesPorTipo.slice(0, 5).map((tipo, idx) => {
                  const colors = ['from-success-400 to-success-600', 'from-accent-400 to-accent-600', 'from-primary-400 to-primary-600', 'from-warning-400 to-warning-600', 'from-danger-400 to-danger-600'];
                  const maxTotal = Math.max(...data.precaucoesPorTipo.map(t => t.total));
                  const percentual = Math.round((tipo.total / maxTotal) * 100);
                  return (
                    <div key={tipo.tipo} className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-28 truncate">{tipo.tipo}</p>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div className={`bg-gradient-to-r ${colors[idx]} h-3 rounded-full`} style={{ width: `${percentual}%` }}></div>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 min-w-12 text-right">{tipo.total}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo de Isolamentos */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">📊 Resumo de Isolamentos</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Ativo</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{data.precaucoesAtivas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Tipos diferentes</span>
                  <span className="text-2xl font-bold text-success-600 dark:text-success-400">{data.precaucoesPorTipo.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Com data definida</span>
                  <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">{data.isolamentosDetalhados.filter(i => i.dataFim !== 'Indefinido').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Indefinido</span>
                  <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">{data.isolamentosDetalhados.filter(i => i.dataFim === 'Indefinido').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Isolamentos Ativos - Detalhado */}
        {data.isolamentosDetalhados.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">🛡️ Isolamentos Ativos - Lista Completa</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                    <th className="text-left px-4 py-3 font-bold text-sm text-slate-800 dark:text-slate-200">Paciente</th>
                    <th className="text-left px-4 py-3 font-bold text-sm text-slate-800 dark:text-slate-200">Doença</th>
                    <th className="text-left px-4 py-3 font-bold text-sm text-slate-800 dark:text-slate-200">Tipo</th>
                    <th className="text-left px-4 py-3 font-bold text-sm text-slate-800 dark:text-slate-200">Início</th>
                    <th className="text-left px-4 py-3 font-bold text-sm text-slate-800 dark:text-slate-200">Fim</th>
                    <th className="text-center px-4 py-3 font-bold text-sm text-slate-800 dark:text-slate-200">Dias</th>
                  </tr>
                </thead>
                <tbody>
                  {data.isolamentosDetalhados.slice(0, 20).map((iso, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-bold text-sm">{iso.pacienteNome}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-sm">{iso.doenca}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1.5 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-xs font-bold rounded-md">
                          {iso.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm font-medium">{iso.dataInicio}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm font-medium">{iso.dataFim}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1.5 rounded-md font-bold text-sm ${iso.diasRestantes <= 2 ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300' : 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'}`}>
                          {iso.diasRestantes}d
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.isolamentosDetalhados.length > 20 && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">Mostrando 20 de {data.isolamentosDetalhados.length} isolamentos</p>
            )}
          </div>
        )}

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
                  <div className="bg-gradient-to-r from-success-400 to-success-600 h-3 rounded-full" style={{ width: `${(data.alertasNoPrazo / data.totalAlertas) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-danger-600 dark:text-danger-400">Crítico</span>
                  <span className="text-danger-600 dark:text-danger-400">{Math.round((data.alertasForaDoPrazo / data.totalAlertas) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-danger-400 to-danger-600 h-3 rounded-full" style={{ width: `${(data.alertasForaDoPrazo / data.totalAlertas) * 100}%` }}></div>
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

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg font-semibold transition shadow-lg"
          >
            🔄 Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
};
