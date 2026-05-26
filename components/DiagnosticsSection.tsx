import React, { useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { sanitizeTextOrNull } from '../lib/sanitize';
import { ThemeContext, NotificationContext } from '../contexts';
import { ALERT_SYSTEMS, DIAGNOSTICO_CATEGORIAS, STATIC_DIAGNOSTICO_OPTIONS } from '../constants';

interface DiagnosticOption {
  id: number;
  pergunta_id: number;
  codigo: string;
  label: string;
  has_input: boolean;
  input_placeholder?: string;
  ordem: number;
  parent_id?: number | null;
  isStatic?: boolean;
}

interface PatientDiagnostic {
  id?: number;
  patient_id: string;
  pergunta_id: number;
  opcao_id: number;
  opcao_label?: string;
  texto_digitado?: string;
  sistema?: string;
  status: 'resolvido' | 'nao_resolvido';
  created_at?: string;
  resolved_at?: string | null;
  data_inicio?: string | null;
}

interface DiagnosticsSectionProps {
  patientId: string;
  onSave?: (data: PatientDiagnostic[]) => void;
}

interface MedItem {
  id: number;
  nome: string;
  dosagem?: string;
  dataInicio?: string;
  mostrarEvolucao: boolean;
  diagnosticoId?: number;
}

interface WorkingDiag {
  tempId: string;
  dbId?: number;
  perguntaId: number;
  opcaoId: number;
  label: string;
  categoria: string;
  tipo: 'principal' | 'secundario';
  dataInicio: string;
  observacao: string;
  inputComplement?: string;
  sistema: string;
  status: 'resolvido' | 'nao_resolvido';
  mostrarWord: boolean;
  createdAt?: string;
  resolvedAt?: string;
  isNew: boolean;
  isStatic?: boolean;
  staticCodigo?: string;
}

const CATEGORY_ORDER = [
  'Cardiovascular', 'Choque / Distributivo', 'Gastrointestinal / Hepático',
  'Hematológico / Oncológico', 'Infeccioso / Séptico', 'Metabólico / Endócrino',
  'Neurológico', 'Nutricional / Outros', 'Psiquiátrico / Social', 'Renal',
  'Respiratório', 'Trauma / Cirúrgico', 'Outros',
];

const SISTEMAS = ALERT_SYSTEMS;

const formatDiagDate = (dateStr?: string | null) => {
  if (!dateStr) return null;
  try {
    const normalized = dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00-03:00';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(normalized));
  } catch {
    return null;
  }
};

// IDs negativos para opções estáticas (não existem no banco ainda)
const staticId = (codigo: string): number =>
  -Math.abs(codigo.split('').reduce((a, c) => a + c.charCodeAt(0), 0));

// Sentinel para a opção "Outros (especificar)"
const OUTROS_ID = -99999;

export const DiagnosticsSection: React.FC<DiagnosticsSectionProps> = ({ patientId, onSave }) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === 'dark';
  const { showNotification } = useContext(NotificationContext)!;

  const [dbOptions, setDbOptions] = useState<DiagnosticOption[]>([]);
  const [workingDiags, setWorkingDiags] = useState<WorkingDiag[]>([]);
  const [medications, setMedications] = useState<MedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTempId, setEditingTempId] = useState<string | null>(null);

  // Form
  const [formTipo, setFormTipo] = useState<'principal' | 'secundario'>('principal');
  const [formCategoria, setFormCategoria] = useState('');
  const [formOpcaoId, setFormOpcaoId] = useState<number | ''>('');
  const [formCustomLabel, setFormCustomLabel] = useState('');
  const [formInputText, setFormInputText] = useState('');
  const [formChildId, setFormChildId] = useState<number | ''>('');
  const [formDataInicio, setFormDataInicio] = useState('');
  const [formObservacao, setFormObservacao] = useState('');
  const [formSistema, setFormSistema] = useState('');
  const [formStatus, setFormStatus] = useState<'resolvido' | 'nao_resolvido'>('nao_resolvido');
  const [formDataRetirada, setFormDataRetirada] = useState('');

  // Archive modal
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [tempIdToArchive, setTempIdToArchive] = useState<string | null>(null);
  const [archiveReason, setArchiveReason] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [optionsRes, diagnosticsRes, medsRes] = await Promise.all([
        supabase.from('pergunta_opcoes_diagnostico').select('*').order('pergunta_id').order('ordem'),
        supabase.from('paciente_diagnosticos').select('*').eq('patient_id', patientId).eq('arquivado', false),
        supabase.from('medicacoes_pacientes')
          .select('id, nome_medicacao, dosagem_valor, unidade_medida, data_inicio, mostrar_evolucao, diagnostico_id')
          .eq('patient_id', patientId)
          .eq('arquivado', false),
      ]);

      if (optionsRes.error) throw optionsRes.error;
      if (diagnosticsRes.error) throw diagnosticsRes.error;

      const opts: DiagnosticOption[] = optionsRes.data || [];
      setDbOptions(opts);

      setMedications((medsRes.data || []).map(m => ({
        id: m.id,
        nome: m.nome_medicacao,
        dosagem: m.dosagem_valor ? `${m.dosagem_valor}${m.unidade_medida ? ' ' + m.unidade_medida : ''}` : undefined,
        dataInicio: m.data_inicio || undefined,
        mostrarEvolucao: m.mostrar_evolucao !== false,
        diagnosticoId: m.diagnostico_id ?? undefined,
      })));

      const working: WorkingDiag[] = (diagnosticsRes.data || []).map(d => {
        const opt = opts.find(o => o.id === d.opcao_id);
        const staticOpt = STATIC_DIAGNOSTICO_OPTIONS.find(s => s.codigo === opt?.codigo);
        // Filho (parent_id) → combina label do pai + filho
        const parentOpt = opt?.parent_id ? opts.find(o => o.id === opt.parent_id) : null;
        const baseLabel = parentOpt
          ? `${parentOpt.label} ${opt?.label || ''}`.trim()
          : (opt?.label || d.opcao_label || '');
        const isOutrosOption = baseLabel.toLowerCase().startsWith('outro');
        // has_input com complemento salvo: combina base + texto_digitado
        const hasInputAndText = !!opt?.has_input && !!d.texto_digitado;
        let resolvedLabel: string;
        if (hasInputAndText) {
          resolvedLabel = isOutrosOption
            ? d.texto_digitado
            : `${baseLabel} ${d.texto_digitado}`.trim();
        } else {
          resolvedLabel = d.opcao_label || baseLabel;
        }
        return {
          tempId: `db-${d.id}`,
          dbId: d.id,
          perguntaId: d.pergunta_id,
          opcaoId: d.opcao_id,
          label: resolvedLabel,
          categoria: DIAGNOSTICO_CATEGORIAS[d.opcao_id] || staticOpt?.categoria || 'Outros',
          tipo: d.pergunta_id === 1 ? 'principal' : 'secundario',
          dataInicio: d.data_inicio || d.created_at?.split('T')[0] || '',
          observacao: hasInputAndText ? '' : (d.texto_digitado || ''),
          inputComplement: hasInputAndText ? d.texto_digitado : undefined,
          sistema: d.sistema || '',
          status: d.status,
          mostrarWord: d.mostrar_word !== false,
          createdAt: d.created_at,
          resolvedAt: d.resolved_at || undefined,
          isNew: false,
        };
      });

      // Deduplica por opcao_id mantendo o registro mais recente
      const seen = new Map<number, WorkingDiag>();
      working.forEach(d => {
        const existing = seen.get(d.opcaoId);
        if (!existing || (d.dbId ?? 0) > (existing.dbId ?? 0)) seen.set(d.opcaoId, d);
      });
      setWorkingDiags(Array.from(seen.values()));
    } catch (err) {
      console.error('Erro ao carregar diagnósticos:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handleReactivated = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.type === 'diagnostic') loadData();
    };
    window.addEventListener('item-reactivated', handleReactivated);
    return () => window.removeEventListener('item-reactivated', handleReactivated);
  }, [loadData]);

  // Mescla opções do banco com opções estáticas (para o dropdown)
  const allOptionsForForm = (): DiagnosticOption[] => {
    const perguntaId = formTipo === 'principal' ? 1 : 2;
    const fromDb = dbOptions.filter(opt => opt.pergunta_id === perguntaId && !opt.parent_id);
    const dbCodigos = new Set(fromDb.map(o => o.codigo));
    const fromStatic = STATIC_DIAGNOSTICO_OPTIONS
      .filter(s => s.pergunta_id === perguntaId && !dbCodigos.has(s.codigo))
      .map(s => ({
        id: staticId(s.codigo),
        pergunta_id: s.pergunta_id,
        codigo: s.codigo,
        label: s.label,
        has_input: s.has_input ?? false,
        input_placeholder: s.input_placeholder,
        ordem: s.ordem,
        parent_id: null,
        isStatic: true,
      }));
    return [...fromDb, ...fromStatic];
  };

  const optionsInCategory: DiagnosticOption[] = formCategoria
    ? [
        ...allOptionsForForm().filter(opt =>
          (DIAGNOSTICO_CATEGORIAS[opt.id] || (opt.isStatic
            ? STATIC_DIAGNOSTICO_OPTIONS.find(s => s.codigo === opt.codigo)?.categoria
            : undefined) || 'Outros') === formCategoria
        ),
        // "Outros" sempre disponível no final de cada categoria
        { id: OUTROS_ID, pergunta_id: formTipo === 'principal' ? 1 : 2, codigo: 'OUTROS', label: 'Outros (especificar)', has_input: true, ordem: 9999, parent_id: null },
      ]
    : [];

  const handleAdd = () => {
    if (formOpcaoId === '') return;

    // Impede duplicata do mesmo diagnóstico
    if (formOpcaoId !== OUTROS_ID) {
      const jaExiste = workingDiags.some(
        d => d.opcaoId === formOpcaoId && d.tipo === formTipo
      );
      if (jaExiste) {
        showNotification({ message: 'Este diagnóstico já foi adicionado à lista.', type: 'error' });
        return;
      }
    }

    const resetForm = () => {
      setFormOpcaoId('');
      setFormCustomLabel('');
      setFormInputText('');
      setFormChildId('');
      setFormDataInicio('');
      setFormObservacao('');
      setFormSistema('');
      setFormStatus('nao_resolvido');
      setFormDataRetirada('');
    };

    // Caso "Outros (especificar)"
    if (formOpcaoId === OUTROS_ID) {
      const label = formCustomLabel.trim();
      if (!label) return;
      const jaExiste = workingDiags.some(
        d => d.opcaoId === OUTROS_ID && d.label.toLowerCase() === label.toLowerCase() && d.tipo === formTipo
      );
      if (jaExiste) {
        showNotification({ message: 'Este diagnóstico já foi adicionado à lista.', type: 'error' });
        return;
      }
      const uniqueCodigo = `OUTROS_${formTipo.toUpperCase()}_${Date.now()}`;
      setWorkingDiags(prev => [...prev, {
        tempId: `new-${Date.now()}`,
        perguntaId: formTipo === 'principal' ? 1 : 2,
        opcaoId: OUTROS_ID,
        label,
        categoria: formCategoria,
        tipo: formTipo,
        dataInicio: formDataInicio,
        observacao: formObservacao,
        sistema: formSistema,
        status: formStatus,
        mostrarWord: true,
        resolvedAt: formStatus === 'resolvido' ? (formDataRetirada || undefined) : undefined,
        isNew: true,
        isStatic: true,
        staticCodigo: uniqueCodigo,
      }]);
      resetForm();
      return;
    }

    const allOpts = allOptionsForForm();
    const opt = allOpts.find(o => o.id === formOpcaoId);
    if (!opt) return;
    if (workingDiags.some(d => d.opcaoId === formOpcaoId || (opt.isStatic && d.staticCodigo === opt.codigo))) return;

    const categoria = DIAGNOSTICO_CATEGORIAS[opt.id]
      || STATIC_DIAGNOSTICO_OPTIONS.find(s => s.codigo === opt.codigo)?.categoria
      || 'Outros';

    // Se tem filho selecionado, usa o filho como opção real
    const childOpt = formChildId !== ''
      ? dbOptions.find(o => o.id === formChildId)
      : null;
    const finalOpt = childOpt ?? opt;
    const finalLabel = childOpt
      ? `${opt.label} ${childOpt.label}`.trim()
      : opt.has_input && formInputText.trim()
        ? `${opt.label} ${formInputText.trim()}`.trim()
        : opt.label;

    setWorkingDiags(prev => [...prev, {
      tempId: `new-${Date.now()}`,
      perguntaId: finalOpt.pergunta_id,
      opcaoId: finalOpt.id,
      label: finalLabel,
      categoria,
      tipo: formTipo,
      dataInicio: formDataInicio,
      observacao: formObservacao,
      inputComplement: !childOpt && opt.has_input ? formInputText.trim() : undefined,
      sistema: formSistema,
      status: formStatus,
      mostrarWord: true,
      resolvedAt: formStatus === 'resolvido' ? (formDataRetirada || undefined) : undefined,
      isNew: true,
      isStatic: finalOpt.isStatic,
      staticCodigo: finalOpt.isStatic ? finalOpt.codigo : undefined,
    }]);

    resetForm();
  };

  const handleEditField = (tempId: string, field: keyof WorkingDiag, value: string) => {
    setWorkingDiags(prev => prev.map(d =>
      d.tempId === tempId ? { ...d, [field]: value } : d
    ));
  };

  const handleEditFieldSave = async (tempId: string, field: keyof WorkingDiag, value: string) => {
    handleEditField(tempId, field, value);
    const diag = workingDiags.find(d => d.tempId === tempId);
    if (!diag?.dbId) return;
    const dbField: Record<string, string> = {
      dataInicio: 'data_inicio',
      observacao: 'texto_digitado',
      sistema: 'sistema',
      resolvedAt: 'resolved_at',
    };
    const col = dbField[field as string];
    if (col) await supabase.from('paciente_diagnosticos').update({ [col]: value || null }).eq('id', diag.dbId);
  };

  const handleStatusChange = async (tempId: string, newStatus: 'resolvido' | 'nao_resolvido') => {
    const diag = workingDiags.find(d => d.tempId === tempId);
    if (!diag) return;
    const now = new Date().toISOString();
    const resolvedAt = newStatus === 'resolvido' ? (diag.resolvedAt || now) : undefined;
    setWorkingDiags(prev => prev.map(d =>
      d.tempId === tempId ? { ...d, status: newStatus, resolvedAt } : d
    ));
    if (diag.dbId) {
      await supabase.from('paciente_diagnosticos').update({
        status: newStatus,
        resolved_at: newStatus === 'resolvido' ? (diag.resolvedAt || now) : null,
      }).eq('id', diag.dbId);
    }
  };

  const handleArchiveRequest = (tempId: string) => {
    setTempIdToArchive(tempId);
    setArchiveReason('');
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!tempIdToArchive) return;
    const diag = workingDiags.find(d => d.tempId === tempIdToArchive);
    if (!diag) return;

    if (diag.dbId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        const { error } = await supabase.from('paciente_diagnosticos').update({
          arquivado: true,
          archived_by: userId,
          archived_at: new Date().toISOString(),
          motivo_arquivamento: sanitizeTextOrNull(archiveReason),
        }).eq('id', diag.dbId);
        if (error) throw error;
      } catch (err) {
        showNotification({ message: `Erro ao remover: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, type: 'error' });
        return;
      }
    }

    setWorkingDiags(prev => prev.filter(d => d.tempId !== tempIdToArchive));
    setArchiveModalOpen(false);
    setTempIdToArchive(null);
    setArchiveReason('');
  };

  const handleToggleMostrarEvolucao = async (medId: number, current: boolean) => {
    const { error } = await supabase.from('medicacoes_pacientes').update({ mostrar_evolucao: !current }).eq('id', medId);
    if (!error) setMedications(prev => prev.map(m => m.id === medId ? { ...m, mostrarEvolucao: !current } : m));
  };

  const resolveStaticOpcaoId = async (d: WorkingDiag): Promise<number> => {
    if (!d.isStatic || !d.staticCodigo) return d.opcaoId;

    // Verifica se já foi inserida (apenas para opções do catálogo, não "Outros" dinâmicos)
    const isDynamicOutros = d.staticCodigo.startsWith('OUTROS_');
    if (!isDynamicOutros) {
      const { data: existing } = await supabase
        .from('pergunta_opcoes_diagnostico')
        .select('id')
        .eq('codigo', d.staticCodigo)
        .single();
      if (existing) return existing.id;
    }

    // Insere no banco (opção do catálogo ou "Outros" com label digitado)
    const staticDef = STATIC_DIAGNOSTICO_OPTIONS.find(s => s.codigo === d.staticCodigo);
    const { data: inserted, error } = await supabase
      .from('pergunta_opcoes_diagnostico')
      .insert({
        pergunta_id: d.perguntaId,
        codigo: d.staticCodigo,
        label: staticDef?.label ?? d.label,
        has_input: false,
        input_placeholder: staticDef?.input_placeholder || null,
        ordem: staticDef?.ordem ?? 9999,
        parent_id: null,
      })
      .select('id')
      .single();
    if (error) throw new Error(`Erro ao criar opção "${d.label}": ${error.message}`);
    return inserted!.id;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Atualiza existentes
      const existing = workingDiags.filter(d => !d.isNew && d.dbId);
      if (existing.length > 0) {
        await Promise.all(existing.map(d =>
          supabase.from('paciente_diagnosticos').update({
            status: d.status,
            sistema: d.sistema || null,
            data_inicio: d.dataInicio || null,
            texto_digitado: d.inputComplement ?? d.observacao ?? null,
            resolved_at: d.status === 'resolvido' ? (d.resolvedAt || now) : null,
          }).eq('id', d.dbId!)
        ));
      }

      // Insere novos
      const newOnes = workingDiags.filter(d => d.isNew);
      for (const d of newOnes) {
        const opcaoId = await resolveStaticOpcaoId(d);
        const { error } = await supabase.from('paciente_diagnosticos').insert({
          patient_id: patientId,
          pergunta_id: d.perguntaId,
          opcao_id: opcaoId,
          opcao_label: d.label,
          texto_digitado: d.inputComplement ?? d.observacao ?? null,
          sistema: d.sistema || null,
          data_inicio: d.dataInicio || null,
          status: d.status,
          created_at: now,
          created_by: userId,
          resolved_at: d.status === 'resolvido' ? (d.resolvedAt || now) : null,
        });
        if (error) throw new Error(error.message);
      }

      await loadData();
      if (onSave) onSave([]);
      showNotification({ message: 'Diagnósticos salvos com sucesso!', type: 'success' });
    } catch (err: any) {
      showNotification({ message: err.message || 'Erro ao salvar diagnósticos.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-200 border-t-blue-500" />
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Carregando diagnósticos...
          </span>
        </div>
      </div>
    );
  }

  const selectedFormOpt = typeof formOpcaoId === 'number' && formOpcaoId !== OUTROS_ID
    ? optionsInCategory.find(o => o.id === formOpcaoId) ?? null
    : null;
  const childOptions = selectedFormOpt
    ? dbOptions.filter(o => o.parent_id === selectedFormOpt.id)
    : [];

  const inputCls = `w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500'
      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
  }`;
  const selectCls = `w-full px-3 py-2 text-sm rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
  }`;
  const labelCls = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

  const principalDiags = workingDiags.filter(d => d.tipo === 'principal');
  const secundarioDiags = workingDiags.filter(d => d.tipo === 'secundario' && d.status === 'resolvido');

  const renderCard = (diag: WorkingDiag) => {
    const isEditing = editingTempId === diag.tempId;
    const isResolved = diag.status === 'resolvido';
    const isPrincipal = diag.tipo === 'principal';

    const borderColor = isResolved ? 'border-l-emerald-500' : isPrincipal ? 'border-l-blue-500' : 'border-l-violet-400';
    const cardBg = isResolved
      ? isDark ? 'bg-emerald-950/40 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'
      : isPrincipal
        ? isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'
        : isDark ? 'bg-violet-950/20 border-slate-700' : 'bg-violet-50/50 border-violet-100';

    return (
      <div key={diag.tempId} className={`rounded-xl border border-l-4 overflow-hidden transition-all ${cardBg} ${borderColor}`}>
        <div className="flex items-start gap-3 px-3 py-2.5">
          <span className={`material-symbols-rounded text-[18px] mt-0.5 shrink-0 ${
            isResolved ? 'text-emerald-500' : isPrincipal ? (isDark ? 'text-blue-400' : 'text-blue-500') : (isDark ? 'text-violet-400' : 'text-violet-500')
          }`}>
            {isResolved ? 'check_circle' : 'radio_button_unchecked'}
          </span>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {diag.label}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isPrincipal
                  ? isDark ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-700'
                  : isDark ? 'bg-violet-900/60 text-violet-300' : 'bg-violet-100 text-violet-700'
              }`}>
                {isPrincipal ? 'Principal' : 'Secundário'}
              </span>
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {diag.categoria}
              </span>
              {diag.sistema && (
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  isDark ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-50 text-slate-500'
                }`}>
                  {diag.sistema}
                </span>
              )}
              {diag.dataInicio && (
                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {formatDiagDate(diag.dataInicio)}
                </span>
              )}
              {isResolved && (
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isDark ? 'bg-emerald-900/60 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Resolvido{diag.resolvedAt ? ` em ${formatDiagDate(diag.resolvedAt)}` : ''}
                </span>
              )}
              {diag.isNew && (
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  Não salvo
                </span>
              )}
            </div>
            {!isEditing && diag.observacao && (
              <p className={`text-xs mt-1.5 italic leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {diag.observacao}
              </p>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setEditingTempId(isEditing ? null : diag.tempId)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-slate-500 hover:text-blue-400 hover:bg-blue-900/30' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title={isEditing ? 'Fechar' : 'Editar'}
            >
              <span className="material-symbols-rounded text-[16px]">{isEditing ? 'expand_less' : 'edit'}</span>
            </button>
            <button
              onClick={() => handleArchiveRequest(diag.tempId)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-slate-500 hover:text-amber-400 hover:bg-amber-900/30' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
              }`}
              title="Arquivar diagnóstico"
            >
              <span className="material-symbols-rounded text-[16px]">archive</span>
            </button>
          </div>
        </div>

        {isEditing && (
          <div className={`px-3 pb-3 pt-0 border-t space-y-2.5 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            {(() => {
              const currentOpt = dbOptions.find(o => o.id === diag.opcaoId);
              // Se é filho → pega irmãos e o pai; se é pai → pega seus filhos
              const isChild = !!currentOpt?.parent_id;
              const parentOpt = isChild
                ? dbOptions.find(o => o.id === currentOpt!.parent_id)
                : currentOpt;
              const children = isChild
                ? dbOptions.filter(o => o.parent_id === currentOpt!.parent_id)
                : dbOptions.filter(o => o.parent_id === diag.opcaoId);
              if (!children.length) return null;
              return (
                <div className="pt-2.5">
                  <label className={labelCls}>Especificar</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {children.map(child => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          const newLabel = parentOpt
                            ? `${parentOpt.label} ${child.label}`.trim()
                            : child.label;
                          setWorkingDiags(prev => prev.map(d =>
                            d.tempId === diag.tempId ? { ...d, opcaoId: child.id, label: newLabel } : d
                          ));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          diag.opcaoId === child.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : isDark
                              ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
            {diag.inputComplement !== undefined && (
              <div className="pt-2.5">
                <label className={labelCls}>Complemento</label>
                <input
                  type="text"
                  value={diag.inputComplement}
                  onChange={e => handleEditField(diag.tempId, 'inputComplement', e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5">
              <div>
                <label className={labelCls}>Data de início</label>
                <input
                  type="date"
                  value={diag.dataInicio}
                  onChange={e => handleEditFieldSave(diag.tempId, 'dataInicio', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Sistema</label>
                <select
                  value={diag.sistema}
                  onChange={e => handleEditFieldSave(diag.tempId, 'sistema', e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Selecione —</option>
                  {SISTEMAS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Observação</label>
              <textarea
                value={diag.observacao}
                onChange={e => handleEditField(diag.tempId, 'observacao', e.target.value)}
                onBlur={e => handleEditFieldSave(diag.tempId, 'observacao', e.target.value)}
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className={`flex rounded-lg overflow-hidden border w-fit text-xs font-semibold ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
                <button
                  onClick={() => handleStatusChange(diag.tempId, 'nao_resolvido')}
                  className={`px-3 py-2 transition-colors ${
                    diag.status === 'nao_resolvido'
                      ? 'bg-rose-500 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Não Resolvido
                </button>
                <button
                  onClick={() => handleStatusChange(diag.tempId, 'resolvido')}
                  className={`px-3 py-2 transition-colors ${
                    diag.status === 'resolvido'
                      ? 'bg-emerald-500 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Resolvido
                </button>
              </div>
              {diag.status === 'resolvido' && (
                <div>
                  <label className={labelCls}>Data de retirada</label>
                  <input
                    type="date"
                    value={(diag.resolvedAt || '').split('T')[0]}
                    onChange={e => handleEditFieldSave(diag.tempId, 'resolvedAt', e.target.value)}
                    className={inputCls}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medicações vinculadas */}
        {diag.dbId && (() => {
          const linkedMeds = medications.filter(m => m.diagnosticoId === diag.dbId);
          if (!linkedMeds.length) return null;
          return (
            <div className={`border-t px-3 py-2.5 space-y-1.5 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Medicações
              </p>
              {linkedMeds.map(med => (
                <div key={med.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`material-symbols-rounded text-[14px] shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      medication
                    </span>
                    <span className={`text-xs truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {med.nome}{med.dosagem ? ` — ${med.dosagem}` : ''}
                    </span>
                    {med.dataInicio && (
                      <span className={`text-[10px] shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatDiagDate(med.dataInicio)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleMostrarEvolucao(med.id, med.mostrarEvolucao)}
                    title={med.mostrarEvolucao ? 'Remover do Word' : 'Incluir no Word'}
                    className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                      med.mostrarEvolucao
                        ? isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isDark ? 'bg-slate-700 text-slate-500 border border-slate-600' : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-rounded text-[12px]">
                      {med.mostrarEvolucao ? 'description' : 'description'}
                    </span>
                    {med.mostrarEvolucao ? 'No Word' : 'Fora do Word'}
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className={`space-y-5 p-3 sm:p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-rounded text-[22px] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>biotech</span>
          <h3 className={`font-bold text-lg sm:text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Diagnósticos</h3>
        </div>
        {workingDiags.length > 0 && (
          <div className="flex items-center gap-1.5">
            {principalDiags.length > 0 && (
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
                isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                P: {principalDiags.length}
              </span>
            )}
            {secundarioDiags.length > 0 && (
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
                isDark ? 'bg-violet-900/50 text-violet-300 border border-violet-700' : 'bg-violet-100 text-violet-800 border border-violet-200'
              }`}>
                S: {secundarioDiags.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add form */}
      <div className={`rounded-xl border p-3 sm:p-4 space-y-3 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Adicionar diagnóstico
        </p>

        {/* Tipo toggle */}
        <div className={`flex rounded-lg overflow-hidden border text-sm font-semibold ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
          <button
            onClick={() => { setFormTipo('principal'); setFormOpcaoId(''); setFormCategoria(''); }}
            className={`flex-1 py-2 transition-colors ${
              formTipo === 'principal'
                ? 'bg-blue-600 text-white'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            Principal
          </button>
          <button
            onClick={() => { setFormTipo('secundario'); setFormOpcaoId(''); setFormCategoria(''); }}
            className={`flex-1 py-2 transition-colors ${
              formTipo === 'secundario'
                ? 'bg-violet-600 text-white'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            Secundário
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Categoria</label>
            <select
              value={formCategoria}
              onChange={e => { setFormCategoria(e.target.value); setFormOpcaoId(''); setFormChildId(''); setFormInputText(''); }}
              className={selectCls}
            >
              <option value="">— Selecione a categoria —</option>
              {CATEGORY_ORDER.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Diagnóstico</label>
            <select
              value={formOpcaoId}
              onChange={e => { const v = e.target.value; setFormOpcaoId(v === '' ? '' : Number(v)); setFormCustomLabel(''); setFormChildId(''); setFormInputText(''); }}
              disabled={!formCategoria}
              className={`${selectCls} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">— Selecione —</option>
              {optionsInCategory.map(opt => {
                const isOutros = opt.id === OUTROS_ID;
                const alreadyAdded = !isOutros && workingDiags.some(d =>
                  d.opcaoId === opt.id || (opt.isStatic && d.staticCodigo === opt.codigo)
                );
                return (
                  <option key={opt.id} value={opt.id} disabled={alreadyAdded}>
                    {opt.label}{alreadyAdded ? ' (já adicionado)' : ''}
                  </option>
                );
              })}
            </select>
            {childOptions.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <label className={labelCls}>Especificar</label>
                <div className="flex flex-wrap gap-2">
                  {childOptions.map(child => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => setFormChildId(formChildId === child.id ? '' : child.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        formChildId === child.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : isDark
                            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedFormOpt?.has_input && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={formInputText}
                  onChange={e => setFormInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder={selectedFormOpt.input_placeholder || 'Especifique...'}
                  autoFocus
                  className={`${inputCls} flex-1`}
                />
                <button
                  onClick={() => { setFormOpcaoId(''); setFormInputText(''); }}
                  title="Cancelar"
                  className={`shrink-0 p-2 rounded-lg transition-colors ${
                    isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/30' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <span className="material-symbols-rounded text-[18px]">close</span>
                </button>
              </div>
            )}
            {formOpcaoId === OUTROS_ID && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={formCustomLabel}
                  onChange={e => setFormCustomLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder="Especifique o diagnóstico..."
                  autoFocus
                  className={`${inputCls} flex-1`}
                />
                <button
                  onClick={() => { setFormOpcaoId(''); setFormCustomLabel(''); }}
                  title="Cancelar"
                  className={`shrink-0 p-2 rounded-lg transition-colors ${
                    isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/30' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <span className="material-symbols-rounded text-[18px]">close</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {formOpcaoId !== '' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Data de início</label>
                <input
                  type="date"
                  value={formDataInicio}
                  onChange={e => setFormDataInicio(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Sistema</label>
                <select
                  value={formSistema}
                  onChange={e => setFormSistema(e.target.value)}
                  className={selectCls}
                >
                  <option value="">— Selecione —</option>
                  {SISTEMAS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Observação</label>
              <textarea
                value={formObservacao}
                onChange={e => setFormObservacao(e.target.value)}
                placeholder="Observações clínicas..."
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className={`flex rounded-lg overflow-hidden border text-xs font-semibold shrink-0 ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
                <button
                  onClick={() => setFormStatus('nao_resolvido')}
                  className={`px-3 py-2 transition-colors ${
                    formStatus === 'nao_resolvido'
                      ? 'bg-rose-500 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Não Resolvido
                </button>
                <button
                  onClick={() => setFormStatus('resolvido')}
                  className={`px-3 py-2 transition-colors ${
                    formStatus === 'resolvido'
                      ? 'bg-emerald-500 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Resolvido
                </button>
              </div>
              {formStatus === 'resolvido' && (
                <div>
                  <label className={labelCls}>Data de retirada</label>
                  <input
                    type="date"
                    value={formDataRetirada}
                    onChange={e => setFormDataRetirada(e.target.value)}
                    className={inputCls}
                  />
                </div>
              )}
              <button
                onClick={handleAdd}
                disabled={
                  (formOpcaoId === OUTROS_ID && !formCustomLabel.trim()) ||
                  (!!selectedFormOpt?.has_input && formChildId === '' && !formInputText.trim())
                }
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
              >
                <span className="material-symbols-rounded text-[18px]">add</span>
                Adicionar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Lista agrupada por Principal / Secundário */}
      {workingDiags.length > 0 ? (
        <div className="space-y-4">
          {principalDiags.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Principais
                </span>
                <div className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {principalDiags.length}
                </span>
              </div>
              <div className="space-y-2">{principalDiags.map(renderCard)}</div>
            </div>
          )}

          {secundarioDiags.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                  Secundários
                </span>
                <div className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {secundarioDiags.length}
                </span>
              </div>
              <div className="space-y-2">{secundarioDiags.map(renderCard)}</div>
            </div>
          )}
        </div>
      ) : (
        <div className={`text-center py-10 rounded-xl border-2 border-dashed ${
          isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}>
          <span className="material-symbols-rounded text-[36px] block mb-1.5 opacity-50">biotech</span>
          <p className="text-sm font-medium">Nenhum diagnóstico adicionado</p>
          <p className="text-xs mt-0.5 opacity-70">Selecione o tipo e a categoria acima para começar</p>
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 shadow-sm ${
          saving
            ? isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] text-white shadow-blue-500/30 hover:shadow-blue-500/50 hover:shadow-md'
        }`}
      >
        {saving ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <span className="material-symbols-rounded text-[20px]">save</span>
            Salvar Diagnósticos
          </>
        )}
      </button>

      {/* Archive modal */}
      {archiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden`}>
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <span className="material-symbols-rounded text-[22px] text-amber-500">archive</span>
              <h3 className={`text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Remover Diagnóstico</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Motivo do arquivamento (opcional):
              </p>
              <textarea
                value={archiveReason}
                onChange={e => setArchiveReason(e.target.value)}
                placeholder="Ex: Diagnóstico descartado após exame complementar..."
                className={`w-full px-3 py-2.5 text-sm rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                rows={3}
              />
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <button
                onClick={() => { setArchiveModalOpen(false); setTempIdToArchive(null); setArchiveReason(''); }}
                className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-colors ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmArchive}
                className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-white transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded text-[16px]">archive</span>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
