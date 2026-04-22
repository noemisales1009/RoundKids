import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { sanitizeTextOrNull } from '../lib/sanitize';
import { ThemeContext } from '../contexts';
import { ChevronRightIcon, SaveIcon } from './icons';

interface DiagnosticQuestion {
  id: number;
  titulo: string;
  tipo: 'principal' | 'secundario';
}

interface DiagnosticOption {
  id: number;
  pergunta_id: number;
  codigo: string;
  label: string;
  has_input: boolean;
  input_placeholder?: string;
  ordem: number;
  parent_id?: number | null;
}

interface PatientDiagnostic {
  id?: number;
  patient_id: string;
  pergunta_id: number;
  opcao_id: number;
  texto_digitado?: string;
  status: 'resolvido' | 'nao_resolvido';
}

interface DiagnosticsSectionProps {
  patientId: string;
  onSave?: (data: PatientDiagnostic[]) => void;
}

export const DiagnosticsSection: React.FC<DiagnosticsSectionProps> = ({ patientId, onSave }) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === 'dark';

  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [options, setOptions] = useState<DiagnosticOption[]>([]);
  const [diagnostics, setDiagnostics] = useState<PatientDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado da UI
  const [expandedGroup, setExpandedGroup] = useState<'principal' | 'secundario' | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [expandedParentOption, setExpandedParentOption] = useState<number | null>(null);
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [selectedStatus, setSelectedStatus] = useState<Record<number, 'resolvido' | 'nao_resolvido'>>({});
  const [checkedOptions, setCheckedOptions] = useState<Record<number, boolean>>({});

  // Estado para modal de arquivamento
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [optionToArchive, setOptionToArchive] = useState<number | null>(null);
  const [archiveReason, setArchiveReason] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [questionsRes, optionsRes, diagnosticsRes] = await Promise.all([
          supabase.from('perguntas_diagnistico').select('*').order('id'),
          supabase.from('pergunta_opcoes_diagnostico').select('*').order('pergunta_id').order('ordem'),
          supabase
            .from('paciente_diagnosticos')
            .select('*')
            .eq('patient_id', patientId)
            .eq('arquivado', false)
        ]);

        if (questionsRes.error) throw questionsRes.error;
        if (optionsRes.error) throw optionsRes.error;
        if (diagnosticsRes.error) throw diagnosticsRes.error;

        setQuestions(questionsRes.data || []);
        setOptions(optionsRes.data || []);
        setDiagnostics(diagnosticsRes.data || []);

        // Inicializar estado a partir dos dados carregados
        const checked: Record<number, boolean> = {};
        const inputs: Record<number, string> = {};
        const statuses: Record<number, 'resolvido' | 'nao_resolvido'> = {};

        (diagnosticsRes.data || []).forEach(diag => {
          checked[diag.opcao_id] = true;
          if (diag.texto_digitado) {
            inputs[diag.opcao_id] = diag.texto_digitado;
          }
          statuses[diag.opcao_id] = diag.status;
        });

        setCheckedOptions(checked);
        setInputValues(inputs);
        setSelectedStatus(statuses);
      } catch (error) {
        console.error('Erro ao carregar diagnósticos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handleRemoveDiagnostic = (optionId: number) => {
    setOptionToArchive(optionId);
    setArchiveReason('');
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!optionToArchive) return;

    try {

      // Obter o ID do usuário logado
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Arquivar diagnóstico (soft delete) com informações do arquivador
      const { error } = await supabase
        .from('paciente_diagnosticos')
        .update({
          arquivado: true,
          archived_by: userId,
          archived_at: new Date().toISOString(),
          motivo_arquivamento: sanitizeTextOrNull(archiveReason)
        })
        .eq('patient_id', patientId)
        .eq('opcao_id', optionToArchive)
        .eq('arquivado', false);

      if (error) {
        console.error('Erro detalhado ao arquivar diagnóstico:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Erro ao remover diagnóstico: ${error.message}`);
        return;
      }


      // Atualizar a lista de diagnósticos removendo o arquivado
      setDiagnostics(prev => prev.filter(d => d.opcao_id !== optionToArchive));

      // Remover diagnóstico da interface - Garantir que o checkbox seja desmarcado
      setCheckedOptions(prev => {
        const newChecked = { ...prev };
        delete newChecked[optionToArchive];
        return newChecked;
      });

      // Remover input associado
      setInputValues(prev => {
        const newInputs = { ...prev };
        delete newInputs[optionToArchive];
        return newInputs;
      });

      // Remover status associado
      setSelectedStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[optionToArchive];
        return newStatus;
      });

      // Fechar modal
      setArchiveModalOpen(false);
      setOptionToArchive(null);
      setArchiveReason('');

      // Mensagem de sucesso
      alert('✅ Diagnóstico removido com sucesso!');
    } catch (error) {
      console.error('Erro ao arquivar diagnóstico (catch):', error);
      alert(`Erro ao arquivar diagnóstico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Obter o ID do usuário logado
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Separar diagnósticos resolvidos e não resolvidos
      const allDiagnostics = options
        .filter(option => checkedOptions[option.id])
        .map(option => ({
          patient_id: patientId,
          pergunta_id: option.pergunta_id,
          opcao_id: option.id,
          opcao_label: option.label,  // ← Adicionar o rótulo da opção
          texto_digitado: inputValues[option.id] || null,
          status: selectedStatus[option.id] || 'nao_resolvido' as const
        }));

      // Todos os diagnósticos selecionados ficam na tabela ativa (resolvidos e não resolvidos)
      const diagnosticsToKeep = allDiagnostics;

      // Resolvidos também vão para histórico
      const diagnosticsResolved = allDiagnostics.filter(d => d.status === 'resolvido');

      // Buscar diagnósticos de HOJE para evitar duplicatas no mesmo dia
      const { data: existingDiagnostics } = await supabase
        .from('paciente_diagnosticos')
        .select('opcao_id')
        .eq('patient_id', patientId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      const existingOpcaoIds = new Set((existingDiagnostics || []).map(d => d.opcao_id));

      // Filtrar apenas diagnósticos NOVOS (que não foram salvos hoje)
      const newDiagnostics = diagnosticsToKeep.filter(d => !existingOpcaoIds.has(d.opcao_id));

      // Inserir apenas diagnósticos novos (evita duplicatas)
      if (newDiagnostics.length > 0) {
        const diagnosticsWithUserId = newDiagnostics.map(d => ({
          ...d,
          created_by: userId
        }));

        const { error } = await supabase
          .from('paciente_diagnosticos')
          .insert(diagnosticsWithUserId);

        if (error) {
          console.error('Erro ao inserir diagnósticos:', error);
          throw new Error(`Erro ao salvar: ${error.message}`);
        }
      }

      // Não é mais necessário salvar em diagnosticos_historico separadamente
      // Os dados já estão em paciente_diagnosticos com opcao_label

      // Recarregar dados para refletir mudanças
      const { data: diagnosticsData } = await supabase
        .from('paciente_diagnosticos')
        .select('*')
        .eq('patient_id', patientId);

      setDiagnostics(diagnosticsData || []);

      // Limpar checkboxes de resolvidos
      const newCheckedOptions = { ...checkedOptions };
      diagnosticsResolved.forEach(d => {
        newCheckedOptions[d.opcao_id] = false;
      });
      setCheckedOptions(newCheckedOptions);

      if (onSave) {
        onSave(diagnosticsToKeep as PatientDiagnostic[]);
      }

      alert('✅ Diagnósticos salvos com sucesso!');

      // Fechar/colapsar todos os grupos após salvar
      setExpandedGroup(null);
      setExpandedQuestion(null);
      setExpandedParentOption(null);
    } catch (error: any) {
      console.error('Erro ao salvar diagnósticos:', error);
      alert(`❌ ${error.message || 'Erro ao salvar diagnósticos. Tente novamente.'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className={`flex flex-col items-center gap-3`}>
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-200 border-t-blue-500"></div>
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Carregando diagnósticos...
          </span>
        </div>
      </div>
    );
  }

  const mainQuestions = questions.filter(q => q.tipo === 'principal');
  const secondaryQuestions = questions.filter(q => q.tipo === 'secundario');

  // Calcular resumo de seleções
  const selectedOptions = options.filter(opt => checkedOptions[opt.id]);
  const selectedByGroup = {
    principal: selectedOptions.filter(opt => {
      const question = questions.find(q => q.id === opt.pergunta_id);
      return question?.tipo === 'principal';
    }),
    secundario: selectedOptions.filter(opt => {
      const question = questions.find(q => q.id === opt.pergunta_id);
      return question?.tipo === 'secundario';
    })
  };

  // ── Reusable sub-components (defined inline to access closure vars) ──

  /** Pill-shaped status select with colour coding */
  const StatusSelect = ({ optionId }: { optionId: number }) => {
    const status = selectedStatus[optionId] || 'nao_resolvido';
    const isResolved = status === 'resolvido';
    return (
      <select
        value={status}
        onChange={(e) => setSelectedStatus(prev => ({
          ...prev,
          [optionId]: e.target.value as 'resolvido' | 'nao_resolvido'
        }))}
        className={`px-2.5 py-1 text-xs rounded-full border font-semibold shrink-0 appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          isResolved
            ? 'bg-emerald-500 border-emerald-400 text-white focus:ring-emerald-400'
            : isDark
              ? 'bg-rose-900/60 border-rose-700 text-rose-300 focus:ring-rose-500'
              : 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-400'
        }`}
      >
        <option value="nao_resolvido">Não Res.</option>
        <option value="resolvido">Resolvido</option>
      </select>
    );
  };

  /** A single checkbox option row (parent or child) */
  const OptionRow = ({
    option,
    depth = 0,
  }: {
    option: DiagnosticOption;
    depth?: number;
  }) => {
    const isChecked = diagnostics.some(d => d.opcao_id === option.id);
    const isCurrentlyChecked = checkedOptions[option.id] !== undefined ? checkedOptions[option.id] : isChecked;
    const childOptions = options.filter(opt => opt.parent_id === option.id);
    const hasChildren = childOptions.length > 0;
    const isParentExpanded = expandedParentOption === option.id;
    const isResolved = selectedStatus[option.id] === 'resolvido';

    const rowBg = isCurrentlyChecked
      ? isResolved
        ? isDark
          ? 'bg-emerald-950/60 border-l-4 border-l-emerald-500 border border-emerald-800/50'
          : 'bg-emerald-50 border-l-4 border-l-emerald-500 border border-emerald-200'
        : isDark
          ? 'bg-blue-950/40 border-l-4 border-l-blue-500 border border-blue-800/40'
          : 'bg-blue-50 border-l-4 border-l-blue-400 border border-blue-200'
      : isDark
        ? 'bg-slate-800/60 border border-slate-700/50'
        : 'bg-white border border-slate-200';

    return (
      <div className="space-y-1.5">
        {/* Main row */}
        <div className={`rounded-lg overflow-hidden transition-all duration-150 ${rowBg}`}>
          <div className="flex items-center gap-2 px-3 py-2.5">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isCurrentlyChecked}
              onChange={(e) => {
                setCheckedOptions(prev => ({
                  ...prev,
                  [option.id]: e.target.checked
                }));
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0 accent-blue-500"
            />

            {/* Label */}
            <span className={`flex-1 text-xs sm:text-sm leading-snug ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            } ${isResolved ? 'line-through opacity-50' : ''}`}>
              {option.label}
            </span>

            {/* Expand children button */}
            {hasChildren && (
              <button
                onClick={() => setExpandedParentOption(isParentExpanded ? null : option.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors shrink-0 ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title="Ver sub-opções"
              >
                <span className="material-symbols-rounded text-[14px]">
                  {isParentExpanded ? 'expand_less' : 'expand_more'}
                </span>
                <span>{childOptions.length}</span>
              </button>
            )}

            {/* Status + remove (only when checked) */}
            {isCurrentlyChecked && (
              <>
                <StatusSelect optionId={option.id} />
                <button
                  onClick={() => handleRemoveDiagnostic(option.id)}
                  className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors ${
                    isDark
                      ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/40'
                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title="Arquivar diagnóstico"
                >
                  <span className="material-symbols-rounded text-[16px]">close</span>
                </button>
              </>
            )}
          </div>

          {/* Optional text input */}
          {isCurrentlyChecked && option.has_input && (
            <div className={`px-3 pb-2.5 pt-0 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <input
                type="text"
                placeholder={option.input_placeholder || 'Digite aqui...'}
                value={inputValues[option.id] || ''}
                onChange={(e) => setInputValues(prev => ({
                  ...prev,
                  [option.id]: e.target.value
                }))}
                className={`mt-2 w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-600 text-slate-200 placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          )}
        </div>

        {/* Child options */}
        {isParentExpanded && hasChildren && (
          <div className={`ml-4 sm:ml-6 space-y-1.5 pl-3 border-l-2 ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
            {childOptions.map(childOption => {
              const isChildChecked = diagnostics.some(d => d.opcao_id === childOption.id);
              const isChildCurrentlyChecked = checkedOptions[childOption.id] !== undefined ? checkedOptions[childOption.id] : isChildChecked;
              const isChildResolved = selectedStatus[childOption.id] === 'resolvido';

              const childRowBg = isChildCurrentlyChecked
                ? isChildResolved
                  ? isDark
                    ? 'bg-emerald-950/60 border-l-4 border-l-emerald-500 border border-emerald-800/50'
                    : 'bg-emerald-50 border-l-4 border-l-emerald-500 border border-emerald-200'
                  : isDark
                    ? 'bg-blue-950/40 border-l-4 border-l-blue-500 border border-blue-800/40'
                    : 'bg-blue-50 border-l-4 border-l-blue-400 border border-blue-200'
                : isDark
                  ? 'bg-slate-800/40 border border-slate-700/40'
                  : 'bg-slate-50 border border-slate-200';

              return (
                <div key={childOption.id} className="space-y-1.5">
                  <div className={`rounded-lg overflow-hidden transition-all duration-150 ${childRowBg}`}>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isChildCurrentlyChecked}
                        onChange={(e) => {
                          setCheckedOptions(prev => ({
                            ...prev,
                            [childOption.id]: e.target.checked
                          }));
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0 accent-blue-500"
                      />
                      <span className={`flex-1 text-xs sm:text-sm leading-snug ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      } ${isChildResolved ? 'line-through opacity-50' : ''}`}>
                        {childOption.label}
                      </span>
                      {isChildCurrentlyChecked && (
                        <>
                          <StatusSelect optionId={childOption.id} />
                          <button
                            onClick={() => handleRemoveDiagnostic(childOption.id)}
                            className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors ${
                              isDark
                                ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/40'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Arquivar diagnóstico"
                          >
                            <span className="material-symbols-rounded text-[16px]">close</span>
                          </button>
                        </>
                      )}
                    </div>
                    {isChildCurrentlyChecked && childOption.has_input && (
                      <div className={`px-3 pb-2.5 pt-0 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <input
                          type="text"
                          placeholder={childOption.input_placeholder || 'Digite aqui...'}
                          value={inputValues[childOption.id] || ''}
                          onChange={(e) => setInputValues(prev => ({
                            ...prev,
                            [childOption.id]: e.target.value
                          }))}
                          className={`mt-2 w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDark
                              ? 'bg-slate-900 border-slate-600 text-slate-200 placeholder-slate-500'
                              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /** A collapsible question sub-header inside a group */
  const QuestionBlock = ({
    question,
    accentColor,
  }: {
    question: DiagnosticQuestion;
    accentColor: 'blue' | 'secondary';
  }) => {
    const questionOptions = options.filter(opt => opt.pergunta_id === question.id && !opt.parent_id);
    const isExpanded = expandedQuestion === question.id;
    const checkedCount = questionOptions.filter(opt => checkedOptions[opt.id]).length;

    const pillColors = isDark
      ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/80'
      : 'bg-blue-50 text-blue-700 hover:bg-blue-100';

    return (
      <div>
        <button
          onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between gap-2 ${pillColors}`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`material-symbols-rounded text-[18px] shrink-0 ${
              accentColor === 'blue'
                ? isDark ? 'text-blue-400' : 'text-blue-600'
                : isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {accentColor === 'blue' ? 'folder_open' : 'folder'}
            </span>
            <span className="font-semibold text-xs sm:text-sm truncate">{question.titulo}</span>
            {checkedCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                accentColor === 'blue'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}>
                {checkedCount}
              </span>
            )}
          </div>
          <ChevronRightIcon className={`w-4 h-4 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {isExpanded && (
          <div className={`mt-2 ml-1 sm:ml-2 space-y-1.5 p-2 sm:p-3 rounded-xl ${
            isDark ? 'bg-slate-900/60' : 'bg-slate-50'
          }`}>
            {questionOptions.map(option => (
              <OptionRow key={option.id} option={option} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 p-3 sm:p-4 rounded-xl border ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-rounded text-[22px] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            biotech
          </span>
          <h3 className={`font-bold text-lg sm:text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Diagnósticos
          </h3>
        </div>
        {selectedOptions.length > 0 && (
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <span className="material-symbols-rounded text-[14px]">check_circle</span>
            {selectedOptions.length} selecionado{selectedOptions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Summary strip ── */}
      {selectedOptions.length > 0 && (
        <div className={`rounded-xl border overflow-hidden ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* column headers */}
          <div className={`grid grid-cols-2 border-b text-[10px] font-bold uppercase tracking-wider ${
            isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
          }`}>
            {selectedByGroup.principal.length > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 border-r ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <span className="material-symbols-rounded text-[12px] text-blue-500">local_hospital</span>
                Principais ({selectedByGroup.principal.length})
              </div>
            )}
            {selectedByGroup.secundario.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <span className="material-symbols-rounded text-[12px] text-blue-500">description</span>
                Secundários ({selectedByGroup.secundario.length})
              </div>
            )}
          </div>
          {/* items */}
          <div className="grid grid-cols-2">
            {selectedByGroup.principal.length > 0 && (
              <ul className={`px-3 py-2 space-y-1 text-xs border-r ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              }`}>
                {selectedByGroup.principal.map(opt => (
                  <li key={opt.id} className="flex items-start gap-1.5">
                    {selectedStatus[opt.id] === 'resolvido' ? (
                      <span className="material-symbols-rounded text-[13px] text-emerald-500 mt-px shrink-0">check_circle</span>
                    ) : (
                      <span className={`material-symbols-rounded text-[13px] mt-px shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>radio_button_unchecked</span>
                    )}
                    <span className={`leading-snug ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    } ${selectedStatus[opt.id] === 'resolvido' ? 'line-through opacity-50' : ''}`}>
                      {opt.label}
                      {inputValues[opt.id] && (
                        <span className={`block italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          "{inputValues[opt.id]}"
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {selectedByGroup.secundario.length > 0 && (
              <ul className="px-3 py-2 space-y-1 text-xs">
                {selectedByGroup.secundario.map(opt => (
                  <li key={opt.id} className="flex items-start gap-1.5">
                    {selectedStatus[opt.id] === 'resolvido' ? (
                      <span className="material-symbols-rounded text-[13px] text-emerald-500 mt-px shrink-0">check_circle</span>
                    ) : (
                      <span className={`material-symbols-rounded text-[13px] mt-px shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>radio_button_unchecked</span>
                    )}
                    <span className={`leading-snug ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    } ${selectedStatus[opt.id] === 'resolvido' ? 'line-through opacity-50' : ''}`}>
                      {opt.label}
                      {inputValues[opt.id] && (
                        <span className={`block italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          "{inputValues[opt.id]}"
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Group panels ── */}
      <div className="space-y-2">

        {/* Diagnósticos Principais */}
        {mainQuestions.length > 0 && (
          <div className={`rounded-xl overflow-hidden border-l-4 border transition-all ${
            expandedGroup === 'principal'
              ? isDark
                ? 'border-l-blue-500 border-blue-800/50 bg-slate-800'
                : 'border-l-blue-500 border-blue-200 bg-blue-50/50'
              : isDark
                ? 'border-l-blue-700 border-slate-700 bg-slate-800'
                : 'border-l-blue-300 border-slate-200 bg-slate-50'
          }`}>
            {/* Toggle header */}
            <button
              onClick={() => setExpandedGroup(expandedGroup === 'principal' ? null : 'principal')}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-3 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-rounded text-[22px] ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  local_hospital
                </span>
                <span className={`font-bold text-sm sm:text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Diagnósticos Principais
                </span>
                {selectedByGroup.principal.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
                    {selectedByGroup.principal.length}
                  </span>
                )}
              </div>
              <ChevronRightIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform shrink-0 ${
                expandedGroup === 'principal' ? 'rotate-90' : ''
              } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>

            {/* Content */}
            {expandedGroup === 'principal' && (
              <div className={`px-3 sm:px-4 pb-4 space-y-2 border-t ${isDark ? 'border-slate-700' : 'border-blue-100'}`}>
                <div className="pt-3 space-y-2">
                  {mainQuestions.map(question => (
                    <QuestionBlock key={question.id} question={question} accentColor="blue" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Diagnósticos Secundários */}
        {secondaryQuestions.length > 0 && (
          <div className={`rounded-xl overflow-hidden border-l-4 border transition-all ${
            expandedGroup === 'secundario'
              ? isDark
                ? 'border-l-blue-400 border-blue-800/50 bg-slate-800'
                : 'border-l-blue-400 border-blue-200 bg-blue-50/30'
              : isDark
                ? 'border-l-blue-600 border-slate-700 bg-slate-800'
                : 'border-l-blue-300 border-slate-200 bg-slate-50'
          }`}>
            {/* Toggle header */}
            <button
              onClick={() => setExpandedGroup(expandedGroup === 'secundario' ? null : 'secundario')}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-3 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-rounded text-[22px] ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  description
                </span>
                <span className={`font-bold text-sm sm:text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Diagnósticos Secundários
                </span>
                {selectedByGroup.secundario.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
                    {selectedByGroup.secundario.length}
                  </span>
                )}
              </div>
              <ChevronRightIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform shrink-0 ${
                expandedGroup === 'secundario' ? 'rotate-90' : ''
              } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>

            {/* Content */}
            {expandedGroup === 'secundario' && (
              <div className={`px-3 sm:px-4 pb-4 space-y-2 border-t ${isDark ? 'border-slate-700' : 'border-blue-100'}`}>
                <div className="pt-3 space-y-2">
                  {secondaryQuestions.map(question => (
                    <QuestionBlock key={question.id} question={question} accentColor="secondary" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Save button ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 shadow-sm ${
          saving
            ? isDark
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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

      {/* ── Archive modal ── */}
      {archiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden`}>
            {/* Modal header */}
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <span className="material-symbols-rounded text-[22px] text-amber-500">archive</span>
              <h3 className={`text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Arquivar Diagnóstico
              </h3>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-3">
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Informe o motivo do arquivamento (opcional):
              </p>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Ex: Diagnóstico descartado após exame complementar..."
                className={`w-full px-3 py-2.5 text-sm rounded-xl border resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                rows={4}
              />
            </div>

            {/* Modal footer */}
            <div className={`flex gap-2 px-5 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <button
                onClick={() => {
                  setArchiveModalOpen(false);
                  setOptionToArchive(null);
                  setArchiveReason('');
                }}
                className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-colors ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmArchive}
                className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded text-[16px]">archive</span>
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
