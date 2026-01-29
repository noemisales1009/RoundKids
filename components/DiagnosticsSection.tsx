import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
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
  const isDark = themeContext?.isDark ?? false; // Default to light mode

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

  const handleRemoveDiagnostic = async (optionId: number) => {
    try {
      // Apagar do Supabase (tabela paciente_diagnosticos)
      const { error } = await supabase
        .from('paciente_diagnosticos')
        .delete()
        .eq('patient_id', patientId)
        .eq('opcao_id', optionId);

      if (error) {
        console.error('Erro ao remover diagnóstico do Supabase:', error);
        alert('Erro ao remover diagnóstico. Tente novamente.');
        return;
      }

      // Remover diagnóstico da interface
      setCheckedOptions(prev => {
        const newChecked = { ...prev };
        delete newChecked[optionId];
        return newChecked;
      });
      
      // Remover input associado
      setInputValues(prev => {
        const newInputs = { ...prev };
        delete newInputs[optionId];
        return newInputs;
      });
      
      // Remover status associado
      setSelectedStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[optionId];
        return newStatus;
      });
    } catch (error) {
      console.error('Erro ao remover diagnóstico:', error);
      alert('Erro ao remover diagnóstico. Tente novamente.');
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
        const { error } = await supabase
          .from('paciente_diagnosticos')
          .insert(newDiagnostics);

        if (error) {
          console.error('Erro ao inserir diagnósticos:', error);
          throw new Error(`Erro ao salvar: ${error.message}`);
        }
      }

      // Salvar no histórico APENAS diagnósticos novos (não duplicar) + resolvidos
      const diagnosticsForHistory = [
        ...newDiagnostics,  // Diagnósticos novos que foram inseridos
        ...diagnosticsResolved  // Diagnósticos marcados como resolvidos
      ];

      if (diagnosticsForHistory.length > 0) {
        try {
          const historyData = diagnosticsForHistory.map(d => {
            // Encontrar o label da opção pelo ID
            const opcao = options.find(o => o.id === d.opcao_id);
            return {
              ...d,
              opcao_label: opcao?.label || 'N/A',
              created_at: new Date().toISOString(),
              created_by: userId  // Adicionar ID do usuário logado
            };
          });
          
          await supabase
            .from('diagnosticos_historico')
            .insert(historyData);
        } catch (historyError) {
          console.warn('Aviso: Histórico não foi salvo', historyError);
        }
      }

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
    } catch (error: any) {
      console.error('Erro ao salvar diagnósticos:', error);
      alert(`❌ ${error.message || 'Erro ao salvar diagnósticos. Tente novamente.'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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

  return (
    <div className={`space-y-4 p-3 sm:p-4 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <h3 className={`font-bold text-lg sm:text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Diagnósticos
      </h3>

      {/* Resumo de Seleções */}
      {selectedOptions.length > 0 && (
        <div className={`p-3 rounded-lg border-l-4 ${isDark ? 'bg-slate-800 border-blue-500' : 'bg-blue-50 border-blue-300'}`}>
          <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            📋 {selectedOptions.length} diagnóstico(s) selecionado(s)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedByGroup.principal.length > 0 && (
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                  Principais: {selectedByGroup.principal.length}
                </p>
                <ul className="text-xs space-y-1 mt-1">
                  {selectedByGroup.principal.map(opt => (
                    <li key={opt.id} className={`flex items-start gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {selectedStatus[opt.id] === 'resolvido' ? (
                        <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                      ) : (
                        <span>•</span>
                      )}
                      <span className={`flex-1 break-word ${selectedStatus[opt.id] === 'resolvido' ? 'line-through opacity-60' : ''}`}>
                        {opt.label}
                        {inputValues[opt.id] && <span className={`block text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>"{inputValues[opt.id]}"</span>}
                      </span>
                      <button
                        onClick={() => handleRemoveDiagnostic(opt.id)}
                        className={`ml-2 px-1.5 py-0.5 rounded text-xs font-bold transition-colors hover:bg-red-600 hover:text-white ${isDark ? 'text-red-400 hover:bg-red-700' : 'text-red-600 hover:bg-red-500'}`}
                        title="Remover diagnóstico"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedByGroup.secundario.length > 0 && (
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                  Secundários: {selectedByGroup.secundario.length}
                </p>
                <ul className="text-xs space-y-1 mt-1">
                  {selectedByGroup.secundario.map(opt => (
                    <li key={opt.id} className={`flex items-start gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {selectedStatus[opt.id] === 'resolvido' ? (
                        <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                      ) : (
                        <span>•</span>
                      )}
                      <span className={`flex-1 break-word ${selectedStatus[opt.id] === 'resolvido' ? 'line-through opacity-60' : ''}`}>
                        {opt.label}
                        {inputValues[opt.id] && <span className={`block text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>"{inputValues[opt.id]}"</span>}
                      </span>
                      <button
                        onClick={() => handleRemoveDiagnostic(opt.id)}
                        className={`ml-2 px-1.5 py-0.5 rounded text-xs font-bold transition-colors hover:bg-red-600 hover:text-white ${isDark ? 'text-red-400 hover:bg-red-700' : 'text-red-600 hover:bg-red-500'}`}
                        title="Remover diagnóstico"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Botão Diagnósticos Principais */}
        {mainQuestions.length > 0 && (
          <div>
            <button
              onClick={() => setExpandedGroup(expandedGroup === 'principal' ? null : 'principal')}
              className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-lg font-bold transition-all text-sm sm:text-base ${
                expandedGroup === 'principal'
                  ? `${isDark ? 'bg-blue-900/40' : 'bg-blue-50'} border-2 ${isDark ? 'border-blue-500' : 'border-blue-300'}`
                  : `${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'} border-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`
              }`}
            >
              <span>🏥 Diagnósticos Principais</span>
              <ChevronRightIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform shrink-0 ${expandedGroup === 'principal' ? 'rotate-90' : ''}`} />
            </button>

            {/* Conteúdo Diagnósticos Principais */}
            {expandedGroup === 'principal' && (
              <div className={`mt-2 p-3 sm:p-4 rounded-lg space-y-3 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                {mainQuestions.map(question => {
                  const questionOptions = options.filter(opt => opt.pergunta_id === question.id && !opt.parent_id);
                  const isQuestionExpanded = expandedQuestion === question.id;

                  return (
                    <div key={question.id}>
                      <button
                        onClick={() => setExpandedQuestion(isQuestionExpanded ? null : question.id)}
                        className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all flex items-center justify-between text-sm sm:text-base ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                      >
                        <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {question.titulo}
                        </span>
                        <ChevronRightIcon className={`w-4 h-4 transition-transform shrink-0 ${isQuestionExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isQuestionExpanded && (
                        <div className={`mt-2 ml-2 sm:ml-3 space-y-3 p-2 sm:p-3 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                          {questionOptions.map(option => {
                            const isChecked = diagnostics.some(d => d.opcao_id === option.id);
                            const isCurrentlyChecked = checkedOptions[option.id] !== undefined ? checkedOptions[option.id] : isChecked;
                            const childOptions = options.filter(opt => opt.parent_id === option.id);
                            const hasChildren = childOptions.length > 0;
                            const isParentExpanded = expandedParentOption === option.id;

                            return (
                              <div key={option.id} className="space-y-2">
                                <div className="space-y-2">
                                  <div className={`flex items-center gap-2 sm:gap-3 flex-wrap p-2 sm:p-2.5 rounded-lg ${selectedStatus[option.id] === 'resolvido' 
                                    ? (isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-300')
                                    : (isDark ? 'bg-slate-700/50' : 'bg-slate-50')
                                  }`}>
                                    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 min-w-50">
                                      <input
                                        type="checkbox"
                                        checked={isCurrentlyChecked}
                                        onChange={(e) => {
                                          setCheckedOptions(prev => ({
                                            ...prev,
                                            [option.id]: e.target.checked
                                          }));
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0"
                                      />
                                      <span className={`text-xs sm:text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'} ${selectedStatus[option.id] === 'resolvido' ? 'line-through opacity-60' : ''}`}>
                                        {option.label}
                                      </span>
                                    </label>
                                    
                                    {hasChildren && (
                                      <button
                                        onClick={() => setExpandedParentOption(isParentExpanded ? null : option.id)}
                                        className={`px-2 py-1 rounded transition text-xs font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                                      >
                                        {isParentExpanded ? '▼' : '▶'} {childOptions.length}
                                      </button>
                                    )}
                                    
                                    {isCurrentlyChecked && (
                                      <>
                                        <select
                                          value={selectedStatus[option.id] || 'nao_resolvido'}
                                          onChange={(e) => setSelectedStatus(prev => ({
                                            ...prev,
                                            [option.id]: e.target.value as 'resolvido' | 'nao_resolvido'
                                          }))}
                                          className={`px-2 py-1 text-xs sm:text-sm rounded border shrink-0 ${isDark
                                            ? 'bg-slate-700 border-slate-600 text-slate-200'
                                            : 'bg-white border-slate-300 text-slate-800'
                                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                          <option value="nao_resolvido">❌ Não Res.</option>
                                          <option value="resolvido">✅ Resolvido</option>
                                        </select>
                                        {selectedStatus[option.id] === 'resolvido' && (
                                          <span className={`text-lg font-bold shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {isCurrentlyChecked && option.has_input && (
                                    <div className="ml-6 sm:ml-7 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                      <input
                                        type="text"
                                        placeholder={option.input_placeholder || 'Digite...'}
                                        value={inputValues[option.id] || ''}
                                        onChange={(e) => setInputValues(prev => ({
                                          ...prev,
                                          [option.id]: e.target.value
                                        }))}
                                        className={`w-full px-2 py-1.5 text-xs sm:text-sm rounded border ${isDark 
                                          ? 'bg-slate-800 border-slate-600 text-slate-200' 
                                          : 'bg-white border-slate-300 text-slate-800'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Opções Filhas */}
                                {isParentExpanded && hasChildren && (
                                  <div className={`ml-6 sm:ml-8 space-y-2 p-2 sm:p-3 rounded-lg border-l-2 ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-300 bg-slate-100'}`}>
                                    {childOptions.map(childOption => {
                                      const isChildChecked = diagnostics.some(d => d.opcao_id === childOption.id);
                                      const isChildCurrentlyChecked = checkedOptions[childOption.id] !== undefined ? checkedOptions[childOption.id] : isChildChecked;

                                      return (
                                        <div key={childOption.id} className="space-y-2">
                                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                            <label className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 min-w-50">
                                              <input
                                                type="checkbox"
                                                checked={isChildCurrentlyChecked}
                                                onChange={(e) => {
                                                  setCheckedOptions(prev => ({
                                                    ...prev,
                                                    [childOption.id]: e.target.checked
                                                  }));
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0"
                                              />
                                              <span className={`text-xs sm:text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                {childOption.label}
                                              </span>
                                            </label>
                                            
                                            {isChildCurrentlyChecked && (
                                              <select
                                                value={selectedStatus[childOption.id] || 'nao_resolvido'}
                                                onChange={(e) => setSelectedStatus(prev => ({
                                                  ...prev,
                                                  [childOption.id]: e.target.value as 'resolvido' | 'nao_resolvido'
                                                }))}
                                                className={`px-2 py-1 text-xs sm:text-sm rounded border shrink-0 ${isDark
                                                  ? 'bg-slate-700 border-slate-600 text-slate-200'
                                                  : 'bg-white border-slate-300 text-slate-800'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                              >
                                                <option value="nao_resolvido">❌ Não Res.</option>
                                                <option value="resolvido">✅ Resolvido</option>
                                              </select>
                                            )}
                                          </div>

                                          {isChildCurrentlyChecked && childOption.has_input && (
                                            <div className="ml-6 sm:ml-7 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                              <input
                                                type="text"
                                                placeholder={childOption.input_placeholder || 'Digite...'}
                                                value={inputValues[childOption.id] || ''}
                                                onChange={(e) => setInputValues(prev => ({
                                                  ...prev,
                                                  [childOption.id]: e.target.value
                                                }))}
                                                className={`w-full px-2 py-1.5 text-xs sm:text-sm rounded border ${isDark 
                                                  ? 'bg-slate-800 border-slate-600 text-slate-200' 
                                                  : 'bg-white border-slate-300 text-slate-800'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Botão Diagnósticos Secundários */}
        {secondaryQuestions.length > 0 && (
          <div>
            <button
              onClick={() => setExpandedGroup(expandedGroup === 'secundario' ? null : 'secundario')}
              className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-lg font-bold transition-all text-sm sm:text-base ${
                expandedGroup === 'secundario'
                  ? `${isDark ? 'bg-purple-900/40' : 'bg-purple-50'} border-2 ${isDark ? 'border-purple-500' : 'border-purple-300'}`
                  : `${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'} border-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`
              }`}
            >
              <span>📋 Diagnósticos Secundários</span>
              <ChevronRightIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform shrink-0 ${expandedGroup === 'secundario' ? 'rotate-90' : ''}`} />
            </button>

            {/* Conteúdo Diagnósticos Secundários */}
            {expandedGroup === 'secundario' && (
              <div className={`mt-2 p-3 sm:p-4 rounded-lg space-y-3 ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                {secondaryQuestions.map(question => {
                  const questionOptions = options.filter(opt => opt.pergunta_id === question.id && !opt.parent_id);
                  const isQuestionExpanded = expandedQuestion === question.id;

                  return (
                    <div key={question.id}>
                      <button
                        onClick={() => setExpandedQuestion(isQuestionExpanded ? null : question.id)}
                        className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all flex items-center justify-between text-sm sm:text-base ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                      >
                        <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {question.titulo}
                        </span>
                        <ChevronRightIcon className={`w-4 h-4 transition-transform shrink-0 ${isQuestionExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isQuestionExpanded && (
                        <div className={`mt-2 ml-2 sm:ml-3 space-y-3 p-2 sm:p-3 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                          {questionOptions.map(option => {
                            const isChecked = diagnostics.some(d => d.opcao_id === option.id);
                            const isCurrentlyChecked = checkedOptions[option.id] !== undefined ? checkedOptions[option.id] : isChecked;
                            const childOptions = options.filter(opt => opt.parent_id === option.id);
                            const hasChildren = childOptions.length > 0;
                            const isParentExpanded = expandedParentOption === option.id;

                            return (
                              <div key={option.id} className="space-y-2">
                                <div className="space-y-2">
                                  <div className={`flex items-center gap-2 sm:gap-3 flex-wrap p-2 sm:p-2.5 rounded-lg ${selectedStatus[option.id] === 'resolvido' 
                                    ? (isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-300')
                                    : (isDark ? 'bg-slate-700/50' : 'bg-slate-50')
                                  }`}>
                                    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 min-w-50">
                                      <input
                                        type="checkbox"
                                        checked={isCurrentlyChecked}
                                        onChange={(e) => {
                                          setCheckedOptions(prev => ({
                                            ...prev,
                                            [option.id]: e.target.checked
                                          }));
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0"
                                      />
                                      <span className={`text-xs sm:text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'} ${selectedStatus[option.id] === 'resolvido' ? 'line-through opacity-60' : ''}`}>
                                        {option.label}
                                      </span>
                                    </label>
                                    
                                    {hasChildren && (
                                      <button
                                        onClick={() => setExpandedParentOption(isParentExpanded ? null : option.id)}
                                        className={`px-2 py-1 rounded transition text-xs font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                                      >
                                        {isParentExpanded ? '▼' : '▶'} {childOptions.length}
                                      </button>
                                    )}
                                    
                                    {isCurrentlyChecked && (
                                      <>
                                        <select
                                          value={selectedStatus[option.id] || 'nao_resolvido'}
                                          onChange={(e) => setSelectedStatus(prev => ({
                                            ...prev,
                                            [option.id]: e.target.value as 'resolvido' | 'nao_resolvido'
                                          }))}
                                          className={`px-2 py-1 text-xs sm:text-sm rounded border shrink-0 ${isDark
                                            ? 'bg-slate-700 border-slate-600 text-slate-200'
                                            : 'bg-white border-slate-300 text-slate-800'
                                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                          <option value="nao_resolvido">❌ Não Res.</option>
                                          <option value="resolvido">✅ Resolvido</option>
                                        </select>
                                        {selectedStatus[option.id] === 'resolvido' && (
                                          <span className={`text-lg font-bold shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {isCurrentlyChecked && option.has_input && (
                                    <div className="ml-6 sm:ml-7 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                      <input
                                        type="text"
                                        placeholder={option.input_placeholder || 'Digite...'}
                                        value={inputValues[option.id] || ''}
                                        onChange={(e) => setInputValues(prev => ({
                                          ...prev,
                                          [option.id]: e.target.value
                                        }))}
                                        className={`w-full px-2 py-1.5 text-xs sm:text-sm rounded border ${isDark 
                                          ? 'bg-slate-800 border-slate-600 text-slate-200' 
                                          : 'bg-white border-slate-300 text-slate-800'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Opções Filhas */}
                                {isParentExpanded && hasChildren && (
                                  <div className={`ml-6 sm:ml-8 space-y-2 p-2 sm:p-3 rounded-lg border-l-2 ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-300 bg-slate-100'}`}>
                                    {childOptions.map(childOption => {
                                      const isChildChecked = diagnostics.some(d => d.opcao_id === childOption.id);
                                      const isChildCurrentlyChecked = checkedOptions[childOption.id] !== undefined ? checkedOptions[childOption.id] : isChildChecked;

                                      return (
                                        <div key={childOption.id} className="space-y-2">
                                          <div className={`flex items-center gap-2 sm:gap-3 flex-wrap p-2 sm:p-2.5 rounded-lg ${selectedStatus[childOption.id] === 'resolvido' 
                                            ? (isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-300')
                                            : (isDark ? 'bg-slate-700/50' : 'bg-slate-50')
                                          }`}>
                                            <label className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 min-w-50">
                                              <input
                                                type="checkbox"
                                                checked={isChildCurrentlyChecked}
                                                onChange={(e) => {
                                                  setCheckedOptions(prev => ({
                                                    ...prev,
                                                    [childOption.id]: e.target.checked
                                                  }));
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0"
                                              />
                                              <span className={`text-xs sm:text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'} ${selectedStatus[childOption.id] === 'resolvido' ? 'line-through opacity-60' : ''}`}>
                                                {childOption.label}
                                              </span>
                                            </label>
                                            
                                            {isChildCurrentlyChecked && (
                                              <>
                                                <select
                                                  value={selectedStatus[childOption.id] || 'nao_resolvido'}
                                                  onChange={(e) => setSelectedStatus(prev => ({
                                                    ...prev,
                                                    [childOption.id]: e.target.value as 'resolvido' | 'nao_resolvido'
                                                  }))}
                                                  className={`px-2 py-1 text-xs sm:text-sm rounded border shrink-0 ${isDark
                                                    ? 'bg-slate-700 border-slate-600 text-slate-200'
                                                    : 'bg-white border-slate-300 text-slate-800'
                                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                >
                                                  <option value="nao_resolvido">❌ Não Res.</option>
                                                  <option value="resolvido">✅ Resolvido</option>
                                                </select>
                                                {selectedStatus[childOption.id] === 'resolvido' && (
                                                  <span className={`text-lg font-bold shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                                                )}
                                              </>
                                            )}
                                          </div>

                                          {isChildCurrentlyChecked && childOption.has_input && (
                                            <div className="ml-6 sm:ml-7 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                              <input
                                                type="text"
                                                placeholder={childOption.input_placeholder || 'Digite...'}
                                                value={inputValues[childOption.id] || ''}
                                                onChange={(e) => setInputValues(prev => ({
                                                  ...prev,
                                                  [childOption.id]: e.target.value
                                                }))}
                                                className={`w-full px-2 py-1.5 text-xs sm:text-sm rounded border ${isDark 
                                                  ? 'bg-slate-800 border-slate-600 text-slate-200' 
                                                  : 'bg-white border-slate-300 text-slate-800'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão Salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-lg font-semibold transition text-sm sm:text-base ${
          saving
            ? `${isDark ? 'bg-slate-700' : 'bg-slate-300'} cursor-not-allowed`
            : `bg-blue-600 hover:bg-blue-700 text-white`
        }`}
      >
        <SaveIcon className="w-4 h-4" />
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );
};
