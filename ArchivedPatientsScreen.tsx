import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface ArchivedPatient {
  id: string;
  name: string;
  bed_number: number;
  dt_internacao: string;
  archived_at: string;
  motivo_arquivamento?: string;
}

interface ConfirmModal {
  isOpen: boolean;
  action: 'reactivate' | 'delete';
  patientId?: string;
  patientName?: string;
}

const formatDateToBRL = (dateString?: string | null) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
};

const formatDateTimeToBRL = (dateString?: string | null) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '—';
  }
};

const escapeHtml = (value: any) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const renderList = <T,>(title: string, items: T[] | null | undefined, itemRenderer: (item: T) => string) => {
  if (!items || items.length === 0) return '';
  return `
    <h2>${title}</h2>
    <ul>
      ${items.map(item => `<li>${itemRenderer(item)}</li>`).join('')}
    </ul>
  `;
};

export const ArchivedPatientsScreen: React.FC = () => {
  const [patients, setPatients] = useState<ArchivedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    action: 'reactivate'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchArchivedPatients();
  }, []);

  const fetchArchivedPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, bed_number, dt_internacao, archived_at, motivo_arquivamento')
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false }) as any;

      if (error) throw error;

      setPatients((data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        bed_number: p.bed_number,
        dt_internacao: p.dt_internacao,
        archived_at: p.archived_at,
        motivo_arquivamento: p.motivo_arquivamento || 'Sem motivo'
      })));
    } catch (error) {
      console.error('Erro ao buscar pacientes arquivados:', error);
      showMessage('error', 'Erro ao carregar pacientes arquivados');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleReactivate = async (patientId: string) => {
    try {

      // 1️⃣ Reativar o paciente
      const { error: patientError } = await supabase
        .from('patients')
        .update({ archived_at: null, motivo_arquivamento: null })
        .eq('id', patientId);

      if (patientError) throw patientError;

      // 2️⃣ Restaurar todas as planilhas relacionadas (desarquivar)
      const tables = [
        'medicacoes_pacientes',
        'dispositivos_pacientes',
        'exames_pacientes',
        'procedimentos_pacientes',
        'culturas_pacientes',
        'dietas_pacientes',
        'precautions',
        'diurese',
        'balanco_hidrico',
        'scale_scores',
        'clinical_situations_24h'
      ];

      for (const table of tables) {
        let updateQuery = supabase
          .from(table)
          .update({ is_archived: false })
          .eq('paciente_id', patientId)
          .eq('is_archived', true);

        const { error: tableError } = await updateQuery;

        if (tableError) {
        } else {
        }
      }

      // 3️⃣ Restaurar diagnósticos (usa campo 'arquivado' ao invés de 'is_archived')
      const { error: diagError } = await supabase
        .from('paciente_diagnosticos')
        .update({ arquivado: false })
        .eq('patient_id', patientId)
        .eq('arquivado', true);

      if (diagError) {
      } else {
      }

      showMessage('success', '🎉 Paciente e todas as planilhas restauradas com sucesso!');
      fetchArchivedPatients();
      setConfirmModal({ isOpen: false, action: 'reactivate' });
    } catch (error) {
      console.error('❌ Erro ao reativar paciente:', error);
      showMessage('error', 'Erro ao reativar paciente');
    }
  };

  const handleDelete = async (patientId: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      showMessage('success', 'Paciente deletado permanentemente!');
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(patientId);
        return next;
      });
      fetchArchivedPatients();
      setConfirmModal({ isOpen: false, action: 'delete' });
    } catch (error: any) {
      console.error('Erro ao deletar paciente:', error);
      showMessage('error', `Erro ao deletar: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPatients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPatients.map(p => p.id)));
    }
  };

  const fetchPatientFullData = async (patientId: string) => {
    const [
      patientRes,
      devicesRes,
      medicationsRes,
      examsRes,
      proceduresRes,
      culturesRes,
      dietsRes,
      diureseRes,
      balanceRes,
      scalesRes,
      alertsClinicosRes,
      tasksRes,
      diagnosticsRes,
      alertCompletionsRes,
      alertJustificationsRes,
      archivedAlertsRes,
      archivedDevicesRes,
      archivedExamsRes,
      archivedMedicationsRes,
      archivedProceduresRes,
      archivedCulturesRes,
      archivedDietsRes,
      clinicalSituations24hRes,
      aportesRes,
      pareceresRes,
      examesImagemRes,
      auditLogRes,
    ] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).single(),
      supabase.from('dispositivos_pacientes').select('*').eq('paciente_id', patientId).order('data_inicio', { ascending: false }),
      supabase.from('medicacoes_pacientes').select('*').eq('paciente_id', patientId).order('data_inicio', { ascending: false }),
      supabase.from('exames_pacientes').select('*').eq('paciente_id', patientId).order('data', { ascending: false }),
      supabase.from('procedimentos_pacientes').select('*').eq('paciente_id', patientId).order('data', { ascending: false }),
      supabase.from('culturas_pacientes').select('*').eq('paciente_id', patientId).order('data_coleta', { ascending: false }),
      supabase.from('dietas_pacientes').select('*').eq('paciente_id', patientId).order('data_inicio', { ascending: false }),
      supabase.from('diurese').select('*').eq('patient_id', patientId).order('data_registro', { ascending: false }),
      supabase.from('balanco_hidrico').select('*').eq('patient_id', patientId).order('data_registro', { ascending: false }),
      supabase.from('scale_scores').select('*').eq('paciente_id', patientId).order('created_at', { ascending: false }),
      supabase.from('alertas_paciente_view_completa').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('tasks_view_horario_br').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('diagnosticos_historico_com_usuario').select('*').eq('patient_id', patientId),
      supabase.from('alert_completions_with_user').select('*').eq('patient_id', patientId),
      supabase.from('monitoramento_geral_justificativas').select('*').eq('patient_id', patientId),
      supabase.from('monitoramento_arquivamento_geral').select('*').eq('patient_id', patientId),
      supabase.from('vw_dispositivos_detalhado').select('*').eq('paciente_id', patientId).eq('is_archived', true),
      supabase.from('vw_exames_detalhado').select('*').eq('paciente_id', patientId).eq('is_archived', true),
      supabase.from('vw_medicacoes_detalhado').select('*').eq('paciente_id', patientId).eq('is_archived', true),
      supabase.from('vw_procedimentos_detalhado').select('*').eq('paciente_id', patientId).eq('is_archived', true),
      supabase.from('vw_culturas_detalhado').select('*').eq('paciente_id', patientId).eq('is_archived', true),
      supabase.from('vw_dietas_detalhado').select('*').eq('paciente_id', patientId).eq('is_archived', true),
      supabase.from('clinical_situations_24h').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('aportes_pacientes').select('*').eq('paciente_id', patientId).order('data_referencia', { ascending: false }),
      supabase.from('pareceres_pacientes').select('*').eq('paciente_id', patientId).order('data_parecer', { ascending: false }),
      supabase.from('exames_imagem_pacientes').select('*').eq('paciente_id', patientId).order('data_exame', { ascending: false }),
      supabase.from('diagnosticos_audit_log').select('*').eq('patient_id', patientId).eq('acao', 'OCULTADO').order('created_at', { ascending: false }),
    ]);

    return {
      patient: patientRes.data,
      devices: devicesRes.data || [],
      medications: medicationsRes.data || [],
      exams: examsRes.data || [],
      procedures: proceduresRes.data || [],
      cultures: culturesRes.data || [],
      diets: dietsRes.data || [],
      diurese: diureseRes.data || [],
      balance: balanceRes.data || [],
      scales: scalesRes.data || [],
      alertsClinicos: alertsClinicosRes.data || [],
      tasks: tasksRes.data || [],
      diagnostics: diagnosticsRes.data || [],
      alertCompletions: alertCompletionsRes.data || [],
      alertJustifications: alertJustificationsRes.data || [],
      archivedAlerts: archivedAlertsRes.data || [],
      archivedDevices: archivedDevicesRes.data || [],
      archivedExams: archivedExamsRes.data || [],
      archivedMedications: archivedMedicationsRes.data || [],
      archivedProcedures: archivedProceduresRes.data || [],
      archivedCultures: archivedCulturesRes.data || [],
      archivedDiets: archivedDietsRes.data || [],
      clinicalSituations24h: clinicalSituations24hRes.data || [],
      aportes: aportesRes.data || [],
      pareceres: pareceresRes.data || [],
      examesImagem: examesImagemRes.data || [],
      auditLog: auditLogRes.data || [],
    };
  };

  const buildPatientHtml = (data: Awaited<ReturnType<typeof fetchPatientFullData>>) => {
    const p = data.patient || {};

    const infoTable = `
      <h2>Dados do Paciente</h2>
      <table>
        <tr><th>Nome</th><td>${escapeHtml(p.name)}</td></tr>
        <tr><th>Leito</th><td>${escapeHtml(p.bed_number)}</td></tr>
        <tr><th>Nascimento</th><td>${formatDateToBRL(p.dob)}</td></tr>
        <tr><th>Nome da Mãe</th><td>${escapeHtml(p.mother_name)}</td></tr>
        <tr><th>Diagnóstico</th><td>${escapeHtml(p.diagnosis)}</td></tr>
        <tr><th>Peso</th><td>${escapeHtml(p.peso)} kg</td></tr>
        <tr><th>Data de Internação</th><td>${formatDateToBRL(p.dt_internacao)}</td></tr>
        <tr><th>Arquivado em</th><td>${formatDateToBRL(p.archived_at)}</td></tr>
        <tr><th>Motivo do Arquivamento</th><td>${escapeHtml(p.motivo_arquivamento || 'Sem motivo')}</td></tr>
        ${p.comorbidade ? `<tr><th>Comorbidades</th><td>${escapeHtml(p.comorbidade.split('|').filter((c: string) => c.trim()).join(', '))}</td></tr>` : ''}
        ${p.localTransferencia ? `<tr><th>Destino/Transferência</th><td>${escapeHtml(p.localTransferencia)}</td></tr>` : ''}
      </table>
    `;

    const activeDiagnostics = data.diagnostics.filter((d: any) => !d.arquivado);
    const archivedDiagnostics = data.diagnostics.filter((d: any) => d.arquivado);

    const diagnosticsHtml = renderList('Diagnósticos Ativos', activeDiagnostics, (d: any) => `
      <strong>${escapeHtml(d.opcao_label || 'Não informado')}</strong>${d.texto_digitado ? ` — ${escapeHtml(d.texto_digitado)}` : ''}
      <br>Status: ${escapeHtml(d.status || '—')}
      ${d.nome_criador ? `<br>Criado por: ${escapeHtml(d.nome_criador)}` : ''}
      ${d.data_criacao ? `<br>Data: ${formatDateTimeToBRL(d.data_criacao)}` : ''}
    `);

    const archivedDiagnosticsHtml = renderList('Diagnósticos Arquivados', archivedDiagnostics, (d: any) => `
      <strong>${escapeHtml(d.opcao_label || 'Não informado')}</strong>${d.texto_digitado ? ` — ${escapeHtml(d.texto_digitado)}` : ''}
      ${d.nome_criador ? `<br>Criado por: ${escapeHtml(d.nome_criador)}` : ''}
      ${d.nome_arquivador ? `<br>Arquivado por: ${escapeHtml(d.nome_arquivador)}` : ''}
      ${d.motivo_arquivamento ? `<br>Motivo: ${escapeHtml(d.motivo_arquivamento)}` : ''}
      ${d.data_arquivamento ? `<br>Data arquivamento: ${formatDateTimeToBRL(d.data_arquivamento)}` : ''}
    `);

    const auditLogHtml = renderList('Auditoria de Diagnósticos', data.auditLog, (log: any) => `
      <strong>${escapeHtml(log.diagnostico_label || 'Não informado')}</strong>
      <br>Criado por: ${escapeHtml(log.criado_por_nome || 'Desconhecido')}
      <br>Ocultado por: ${escapeHtml(log.modificado_por_nome || 'Desconhecido')}
      ${log.created_at ? `<br>Data: ${formatDateTimeToBRL(log.created_at)}` : ''}
    `);

    const devicesHtml = renderList('Dispositivos', data.devices.filter((d: any) => !d.is_archived), (d: any) => `
      <strong>${escapeHtml(d.nome || d.tipo)} ${d.localizacao ? `(${escapeHtml(d.localizacao)})` : ''}</strong>
      ${d.data_inicio ? `<br>Início: ${formatDateToBRL(d.data_inicio)}` : ''}
      ${d.data_remocao ? `<br>Retirada: ${formatDateToBRL(d.data_remocao)}` : ''}
      ${d.observacao ? `<br><em>Obs: ${escapeHtml(d.observacao)}</em>` : ''}
    `);

    const archivedDevicesHtml = renderList('Dispositivos Arquivados', data.archivedDevices, (d: any) => `
      <strong>${escapeHtml(d.tipo_dispositivo)} ${d.localizacao ? `— ${escapeHtml(d.localizacao)}` : ''}</strong>
      <br>Motivo: ${escapeHtml(d.motivo_arquivamento || 'Não informado')}
      <br>Arquivado por: ${escapeHtml(d.nome_arquivador || 'Sistema')}
      ${d.created_at ? `<br>Data: ${formatDateTimeToBRL(d.created_at)}` : ''}
    `);

    const medicationsHtml = renderList('Medicações', data.medications.filter((m: any) => !m.is_archived), (m: any) => `
      <strong>${escapeHtml(m.nome)} ${m.dosagem ? `(${escapeHtml(m.dosagem)})` : ''}</strong>
      ${m.sistema ? `<br>Sistema: ${escapeHtml(m.sistema)}` : ''}
      ${m.data_inicio ? `<br>Início: ${formatDateToBRL(m.data_inicio)}` : ''}
      ${m.data_fim ? `<br>Fim: ${formatDateToBRL(m.data_fim)}` : ''}
      ${m.observacao ? `<br><em>Obs: ${escapeHtml(m.observacao)}</em>` : ''}
    `);

    const archivedMedicationsHtml = renderList('Medicações Arquivadas', data.archivedMedications, (m: any) => `
      <strong>${escapeHtml(m.nome_medicacao)} — ${escapeHtml(m.dosagem_valor)} ${escapeHtml(m.unidade_medida)}</strong>
      <br>Motivo: ${escapeHtml(m.motivo_arquivamento || 'Não informado')}
      <br>Arquivado por: ${escapeHtml(m.nome_arquivador || 'Sistema')}
      ${m.created_at ? `<br>Data: ${formatDateTimeToBRL(m.created_at)}` : ''}
    `);

    const examsHtml = renderList('Exames Laboratoriais', data.exams.filter((e: any) => !e.is_archived), (e: any) => `
      <strong>${escapeHtml(e.nome)}</strong>
      ${e.sistema ? `<br>Sistema: ${escapeHtml(e.sistema)}` : ''}
      ${e.data ? `<br>Data: ${formatDateToBRL(e.data)}` : ''}
      ${e.resultado ? `<br>Resultado: ${escapeHtml(e.resultado)}` : ''}
      ${e.observacao ? `<br><em>Obs: ${escapeHtml(e.observacao)}</em>` : ''}
    `);

    const archivedExamsHtml = renderList('Exames Arquivados', data.archivedExams, (e: any) => `
      <strong>${escapeHtml(e.nome_exame)}</strong>
      <br>Motivo: ${escapeHtml(e.motivo_arquivamento || 'Não informado')}
      <br>Arquivado por: ${escapeHtml(e.nome_arquivador || 'Sistema')}
      ${e.created_at ? `<br>Data: ${formatDateTimeToBRL(e.created_at)}` : ''}
    `);

    const proceduresHtml = renderList('Procedimentos Cirúrgicos', data.procedures.filter((pr: any) => !pr.is_archived), (pr: any) => `
      <strong>${escapeHtml(pr.nome)}</strong>
      ${pr.cirurgiao ? `<br>Dr(a): ${escapeHtml(pr.cirurgiao)}` : ''}
      ${pr.data ? `<br>Data: ${formatDateToBRL(pr.data)}` : ''}
      ${pr.observacao ? `<br><em>Obs: ${escapeHtml(pr.observacao)}</em>` : ''}
    `);

    const archivedProceduresHtml = renderList('Procedimentos Cirúrgicos Arquivados', data.archivedProcedures, (pr: any) => `
      <strong>${escapeHtml(pr.nome_procedimento)}</strong>
      ${pr.nome_cirurgiao ? `<br>Dr(a): ${escapeHtml(pr.nome_cirurgiao)}` : ''}
      <br>Motivo: ${escapeHtml(pr.motivo_arquivamento || 'Não informado')}
      <br>Arquivado por: ${escapeHtml(pr.nome_arquivador || 'Sistema')}
      ${pr.created_at ? `<br>Data: ${formatDateTimeToBRL(pr.created_at)}` : ''}
    `);

    const culturesHtml = renderList('Culturas', data.cultures.filter((c: any) => !c.is_archived), (c: any) => `
      <strong>${escapeHtml(c.tipo || c.nome || c.site)}</strong>
      ${c.microorganismo || c.microorganism ? `<br>Microorganismo: ${escapeHtml(c.microorganismo || c.microorganism)}` : ''}
      ${c.data_coleta ? `<br>Coleta: ${formatDateToBRL(c.data_coleta)}` : ''}
      ${c.resultado ? `<br>Resultado: ${escapeHtml(c.resultado)}` : ''}
      ${c.observacao ? `<br><em>Obs: ${escapeHtml(c.observacao)}</em>` : ''}
    `);

    const archivedCulturesHtml = renderList('Culturas Arquivadas', data.archivedCultures, (c: any) => `
      <strong>${escapeHtml(c.local)}</strong> — ${escapeHtml(c.microorganismo || 'Não identificado')}
      <br>Motivo: ${escapeHtml(c.motivo_arquivamento || 'Não informado')}
      <br>Arquivado por: ${escapeHtml(c.nome_arquivador || 'Sistema')}
      ${c.created_at ? `<br>Data: ${formatDateTimeToBRL(c.created_at)}` : ''}
    `);

    const dietsHtml = renderList('Dietas', data.diets.filter((d: any) => !d.is_archived), (d: any) => `
      <strong>${escapeHtml(d.tipo || d.type)}</strong>
      ${d.data_inicio ? `<br>Início: ${formatDateToBRL(d.data_inicio)}` : ''}
      ${d.volume ? `<br>Volume: ${escapeHtml(d.volume)} mL` : ''}
      ${d.vet ? `<br>VET: ${escapeHtml(d.vet)} kcal/dia` : ''}
      ${d.vet_pleno ? `<br>VET Pleno: ${escapeHtml(d.vet_pleno)} kcal/dia` : ''}
      ${d.pt ? `<br>PT: ${escapeHtml(d.pt)} g/dia` : ''}
      ${d.th ? `<br>TH: ${escapeHtml(d.th)} ml/m²/dia` : ''}
      ${d.data_remocao ? `<br>Retirada: ${formatDateToBRL(d.data_remocao)}` : ''}
      ${d.observacao ? `<br><em>Obs: ${escapeHtml(d.observacao)}</em>` : ''}
    `);

    const archivedDietsHtml = renderList('Dietas Arquivadas', data.archivedDiets, (d: any) => `
      <strong>${escapeHtml(d.tipo)}</strong>
      ${d.volume ? `<br>Volume: ${escapeHtml(d.volume)} mL` : ''}
      ${d.vet ? `<br>VET: ${escapeHtml(d.vet)} kcal/dia` : ''}
      <br>Motivo: ${escapeHtml(d.motivo_arquivamento || 'Não informado')}
      <br>Arquivado por: ${escapeHtml(d.nome_arquivador || 'Sistema')}
      ${d.created_at ? `<br>Data: ${formatDateTimeToBRL(d.created_at)}` : ''}
    `);

    const diureseHtml = renderList('Diurese', data.diurese, (d: any) => {
      const result = d.peso && d.horas ? ((d.volume / d.horas) / d.peso).toFixed(2) : 'N/A';
      return `
        <strong>${result} mL/kg/h</strong>
        <br>Peso: ${escapeHtml(d.peso)}kg | Volume: ${escapeHtml(d.volume)}mL | Período: ${escapeHtml(d.horas)}h
        ${d.data_registro ? `<br>Data: ${formatDateTimeToBRL(d.data_registro)}` : ''}
      `;
    });

    const balanceHtml = renderList('Balanço Hídrico', data.balance, (b: any) => {
      const result = b.peso ? (b.volume / (b.peso * 10)).toFixed(2) : 'N/A';
      return `
        <strong>${b.volume > 0 ? '+' : ''}${result}%</strong>
        <br>Peso: ${escapeHtml(b.peso)}kg | Volume: ${b.volume > 0 ? '+' : ''}${escapeHtml(b.volume)}mL
        ${b.data_registro ? `<br>Data: ${formatDateTimeToBRL(b.data_registro)}` : ''}
      `;
    });

    const scalesHtml = renderList('Avaliações de Escalas', data.scales, (s: any) => `
      <strong>${escapeHtml(s.scale_name)}</strong> — Pontuação: ${escapeHtml(s.score)}
      ${s.interpretation ? ` (${escapeHtml(s.interpretation)})` : ''}
      ${s.created_at ? `<br>Data: ${formatDateTimeToBRL(s.created_at)}` : ''}
    `);

    const renderAlertItem = (a: any) => `
      <strong>${escapeHtml(a.alertaclinico || a.descricao_limpa || a.description || 'Alerta')}</strong>
      ${a.responsavel || a.responsible ? `<br>Responsável: ${escapeHtml(a.responsavel || a.responsible)}` : ''}
      ${a.live_status || a.status ? `<br>Status: ${escapeHtml(a.live_status || a.status)}` : ''}
      ${a.created_by_name ? `<br>Criado por: ${escapeHtml(a.created_by_name)}` : ''}
      ${a.prazo_limite_formatado ? `<br>Prazo limite: ${escapeHtml(a.prazo_limite_formatado)}` : ''}
      ${a.created_at ? `<br>Criado em: ${formatDateTimeToBRL(a.created_at)}` : ''}
      ${a.justificativa ? `<br><em>Justificativa: ${escapeHtml(a.justificativa)}</em>` : ''}
    `;

    const alertsClinicosHtml = renderList('Alertas Clínicos', data.alertsClinicos, renderAlertItem);
    const tasksHtml = renderList('Tasks / Checklist', data.tasks, renderAlertItem);

    const alertCompletionsHtml = renderList('Completações de Alertas', data.alertCompletions, (c: any) => `
      <strong>${escapeHtml(c.alert_description || c.description || '—')}</strong>
      <br>Concluído por: ${escapeHtml(c.completed_by_name || 'Não informado')}
      ${c.completed_at ? `<br>Data: ${formatDateTimeToBRL(c.completed_at)}` : ''}
    `);

    const alertJustificationsHtml = renderList('Justificativas de Alertas', data.alertJustifications, (j: any) => `
      <strong>${escapeHtml(j.descricao || '—')}</strong>
      <br>Justificativa: ${escapeHtml(j.justificativa || '—')}
      <br>Por: ${escapeHtml(j.quem_justificou_nome || 'Não informado')}
      ${j.data_justificativa ? `<br>Data: ${formatDateTimeToBRL(j.data_justificativa)}` : ''}
    `);

    const archivedAlertsHtml = renderList('Alertas Arquivados', data.archivedAlerts, (a: any) => `
      <strong>${escapeHtml(a.descricao_original || '—')}</strong>
      <br>Motivo: ${escapeHtml(a.motivo_do_arquivamento || 'Não informado')}
      <br>Arquivado por: ${escapeHtml(a.quem_arquivou || 'Sistema')}
      ${a.data_arquivamento ? `<br>Data: ${formatDateTimeToBRL(a.data_arquivamento)}` : ''}
    `);

    const clinicalSituations24hHtml = renderList('Situação Clínica 24h', data.clinicalSituations24h, (s: any) => `
      ${escapeHtml(s.situacao_texto || '—')}
      ${s.created_at ? `<br>Data: ${formatDateTimeToBRL(s.created_at)}` : ''}
    `);

    const aportesHtml = renderList('Aportes', data.aportes, (a: any) => {
      const vo = Number(a.vo_ml_kg_h || 0);
      const hv = Number(a.hv_npt_ml_kg_h || 0);
      const med = Number(a.medicacoes_ml_kg_h || 0);
      const tht = Number(a.tht_ml_kg_h || 0);
      return `
        <strong>Data: ${escapeHtml(a.data_referencia)}</strong>
        <br>VO: ${vo.toFixed(2)} ml/kg/h | HV/NPT: ${hv.toFixed(2)} ml/kg/h | MED: ${med.toFixed(2)} ml/kg/h | THT: ${tht.toFixed(2)} ml/kg/h
      `;
    });

    const pareceresHtml = renderList('Pareceres', data.pareceres, (pr: any) => `
      <strong>${escapeHtml(pr.especialista || '—')}</strong>
      ${pr.data_parecer ? `<br>Data: ${formatDateToBRL(pr.data_parecer)}` : ''}
      ${pr.parecer ? `<br>${escapeHtml(pr.parecer)}` : ''}
    `);

    const examesImagemHtml = renderList('Exames de Imagem', data.examesImagem, (ex: any) => `
      <strong>${escapeHtml(ex.exame || '—')}</strong>
      ${ex.categoria ? `<br>Categoria: ${escapeHtml(ex.categoria)}` : ''}
      ${ex.sistema ? `<br>Sistema: ${escapeHtml(ex.sistema)}` : ''}
      ${ex.data_exame ? `<br>Data: ${formatDateToBRL(ex.data_exame)}` : ''}
      ${ex.resultado ? `<br>Resultado: ${escapeHtml(ex.resultado)}` : ''}
      ${ex.observacao ? `<br><em>Obs: ${escapeHtml(ex.observacao)}</em>` : ''}
    `);

    return `
      <section class="patient-section">
        <h1>Relatório do Paciente: ${escapeHtml(p.name)}</h1>
        ${infoTable}
        ${diagnosticsHtml}
        ${archivedDiagnosticsHtml}
        ${auditLogHtml}
        ${devicesHtml}
        ${archivedDevicesHtml}
        ${medicationsHtml}
        ${archivedMedicationsHtml}
        ${examsHtml}
        ${archivedExamsHtml}
        ${proceduresHtml}
        ${archivedProceduresHtml}
        ${culturesHtml}
        ${archivedCulturesHtml}
        ${dietsHtml}
        ${archivedDietsHtml}
        ${diureseHtml}
        ${balanceHtml}
        ${scalesHtml}
        ${alertsClinicosHtml}
        ${tasksHtml}
        ${alertCompletionsHtml}
        ${alertJustificationsHtml}
        ${archivedAlertsHtml}
        ${clinicalSituations24hHtml}
        ${aportesHtml}
        ${pareceresHtml}
        ${examesImagemHtml}
      </section>
    `;
  };

  const handleGeneratePdfForSelected = async () => {
    if (selectedIds.size === 0) return;
    setGeneratingPdf(true);
    try {
      const ids = Array.from(selectedIds);
      const allData = await Promise.all(ids.map(id => fetchPatientFullData(id)));
      const sections = allData.map(d => buildPatientHtml(d)).join('<div class="page-break"></div>');

      const htmlContent = `
        <html>
          <head>
            <title>Relatório de Pacientes Arquivados</title>
            <style>
              body { font-family: sans-serif; margin: 20px; color: #333; }
              h1 { color: #00796b; font-size: 22px; border-bottom: 3px solid #00796b; padding-bottom: 8px; }
              h2 { color: #00796b; font-size: 17px; margin-top: 22px; border-bottom: 1px solid #e0f2f1; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              td, th { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
              th { background-color: #e0f2f1; width: 30%; }
              ul { list-style-type: none; padding-left: 0; }
              li { background-color: #f7f7f7; border: 1px solid #eee; padding: 10px; margin-bottom: 6px; border-radius: 4px; font-size: 13px; line-height: 1.5; }
              .patient-section { margin-bottom: 40px; }
              .page-break { page-break-after: always; }
              @media print {
                .page-break { page-break-after: always; }
              }
            </style>
          </head>
          <body>
            ${sections}
          </body>
        </html>
      `;

      const pdfWindow = window.open('', '_blank');
      if (pdfWindow) {
        pdfWindow.document.write(htmlContent);
        pdfWindow.document.close();
        // Aguardar renderização antes de imprimir
        pdfWindow.onload = () => {
          pdfWindow.focus();
          pdfWindow.print();
        };
        // Fallback caso onload não dispare
        setTimeout(() => {
          try { pdfWindow.focus(); pdfWindow.print(); } catch {}
        }, 500);
      } else {
        showMessage('error', 'Pop-up bloqueado. Permita pop-ups para gerar o PDF.');
      }
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      showMessage('error', `Erro ao gerar PDF: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bed_number?.toString().includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando pacientes arquivados...</p>
        </div>
      </div>
    );
  }

  const allSelected = filteredPatients.length > 0 && selectedIds.size === filteredPatients.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            📦 Pacientes Arquivados
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Visualize, reative ou delete pacientes que tiveram alta, óbito ou transferência
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nome ou leito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Arquivados</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{patients.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Encontrados</p>
            <p className="text-2xl font-bold text-blue-600">{filteredPatients.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Selecionados</p>
            <p className="text-2xl font-bold text-green-600">{selectedIds.size}</p>
          </div>
        </div>

        {/* Action bar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              {selectedIds.size} paciente(s) selecionado(s)
            </span>
            <button
              onClick={handleGeneratePdfForSelected}
              disabled={generatingPdf}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {generatingPdf ? '⏳ Gerando...' : '📄 Gerar PDF dos Selecionados'}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              Limpar seleção
            </button>
          </div>
        )}

        {/* Table */}
        {filteredPatients.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <th className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                        title="Selecionar todos"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Leito
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Admissão
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Arquivado em
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Motivo
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, index) => (
                    <tr
                      key={patient.id}
                      className={`border-b border-slate-200 dark:border-slate-700 ${
                        index % 2 === 0
                          ? 'bg-white dark:bg-slate-800'
                          : 'bg-slate-50 dark:bg-slate-700/50'
                      } hover:bg-slate-100 dark:hover:bg-slate-700 transition`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(patient.id)}
                          onChange={() => toggleSelect(patient.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-semibold">
                          {patient.bed_number || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {patient.dt_internacao ? formatDate(patient.dt_internacao) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 font-medium">
                        {formatDate(patient.archived_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                          {patient.motivo_arquivamento || 'Sem motivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                action: 'reactivate',
                                patientId: patient.id,
                                patientName: patient.name
                              })
                            }
                            className="inline-flex items-center justify-center w-9 h-9 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition"
                            title="Reativar paciente"
                          >
                            ♻️
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                action: 'delete',
                                patientId: patient.id,
                                patientName: patient.name
                              })
                            }
                            className="inline-flex items-center justify-center w-9 h-9 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition"
                            title="Deletar permanentemente"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {searchTerm ? '❌ Nenhum paciente encontrado' : '✅ Nenhum paciente arquivado'}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {confirmModal.action === 'reactivate' ? '♻️ Reativar Paciente?' : '🗑️ Deletar Permanentemente?'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {confirmModal.action === 'reactivate'
                ? `Tem certeza que deseja reativar ${confirmModal.patientName}? O paciente voltará a aparecer na lista de ativos.`
                : `Tem certeza que deseja deletar ${confirmModal.patientName} permanentemente? Esta ação não pode ser desfeita!`}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: 'reactivate' })}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmModal.patientId) {
                    if (confirmModal.action === 'reactivate') {
                      handleReactivate(confirmModal.patientId);
                    } else {
                      handleDelete(confirmModal.patientId);
                    }
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded transition ${
                  confirmModal.action === 'reactivate'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmModal.action === 'reactivate' ? 'Reativar' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedPatientsScreen;
