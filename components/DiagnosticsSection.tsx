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
}

interface PatientDiagnostic {
  id: number;
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
  const { isDark } = useContext(ThemeContext) || { isDark: false };

  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [options, setOptions] = useState<DiagnosticOption[]>([]);
  const [diagnostics, setDiagnostics] = useState<PatientDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado da UI
  const [expandedGroup, setExpandedGroup] = useState<'principal' | 'secundario' | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [selectedStatus, setSelectedStatus] = useState<Record<number, 'resolvido' | 'nao_resolvido'>>({});

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

        if (questionsRes.data) setQuestions(questionsRes.data as DiagnosticQuestion[]);
        if (optionsRes.data) setOptions(optionsRes.data as DiagnosticOption[]);
        if (diagnosticsRes.data) {
          setDiagnostics(diagnosticsRes.data as PatientDiagnostic[]);
          
          const inputs: Record<number, string> = {};
          const statuses: Record<number, 'resolvido' | 'nao_resolvido'> = {};
          
          (diagnosticsRes.data as PatientDiagnostic[]).forEach(diag => {
            if (diag.texto_digitado) {
              inputs[diag.opcao_id] = diag.texto_digitado;
            }
            statuses[diag.opcao_id] = diag.status;
          });
          
          setInputValues(inputs);
          setSelectedStatus(statuses);
        }
      } catch (error) {
        console.error('Erro ao carregar diagnósticos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const diagnosticsToSave: PatientDiagnostic[] = [];

      options.forEach(option => {
        const checkbox = document.getElementById(`diag-${option.id}`) as HTMLInputElement;
        
        if (checkbox && checkbox.checked) {
          const status = selectedStatus[option.id] || 'nao_resolvido';
          const textoDigitado = inputValues[option.id] || undefined;

          diagnosticsToSave.push({
            id: 0,
            patient_id: patientId,
            pergunta_id: option.pergunta_id,
            opcao_id: option.id,
            texto_digitado: textoDigitado,
            status: status as 'resolvido' | 'nao_resolvido'
          });
        }
      });

      await supabase
        .from('paciente_diagnosticos')
        .delete()
        .eq('patient_id', patientId);

      if (diagnosticsToSave.length > 0) {
        const { error } = await supabase
          .from('paciente_diagnosticos')
          .insert(diagnosticsToSave);

        if (error) throw error;
      }

      if (onSave) {
        onSave(diagnosticsToSave);
      }

      alert('✅ Diagnósticos salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar diagnósticos:', error);
      alert('❌ Erro ao salvar diagnósticos. Tente novamente.');
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

  const renderGroup = (groupQuestions: DiagnosticQuestion[], groupType: 'principal' | 'secundario', title: string) => {
    const isExpanded = expandedGroup === groupType;

    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        {/* Header - Clicável */}
        <button
          onClick={() => setExpandedGroup(isExpanded ? null : groupType)}
          className={`w-full flex items-center justify-between p-4 transition-all ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
        >
          <span className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {title}
          </span>
          <ChevronRightIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
        </button>

        {/* Conteúdo - Expandido */}
        {isExpanded && (
          <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} p-4 space-y-2`}>
            {groupQuestions.map(question => {
              const questionOptions = options.filter(opt => opt.pergunta_id === question.id);
              const isQuestionExpanded = expandedQuestion === question.id;

              return (
                <div key={question.id}>
                  {/* Pergunta - Clicável */}
                  <button
                    onClick={() => setExpandedQuestion(isQuestionExpanded ? null : question.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                  >
                    <span className={`font-medium text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {question.titulo}
                    </span>
                    <ChevronRightIcon className={`w-4 h-4 transition-transform ${isQuestionExpanded ? 'rotate-90' : ''} ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                  </button>

                  {/* Opções - Expandidas */}
                  {isQuestionExpanded && (
                    <div className={`mt-2 ml-3 space-y-2 p-3 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                      {questionOptions.map(option => {
                        const isChecked = diagnostics.some(d => d.opcao_id === option.id);

                        return (
                          <div key={option.id} className="space-y-2">
                            {/* Checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                id={`diag-${option.id}`}
                                defaultChecked={isChecked}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {option.label}
                              </span>
                            </label>

                            {/* Input dinâmico */}
                            {option.has_input && (
                              <div className="ml-7">
                                <input
                                  type="text"
                                  placeholder={option.input_placeholder || 'Digite...'}
                                  value={inputValues[option.id] || ''}
                                  onChange={(e) => setInputValues(prev => ({
                                    ...prev,
                                    [option.id]: e.target.value
                                  }))}
                                  className={`w-full px-2 py-1.5 text-sm rounded border ${isDark 
                                    ? 'bg-slate-800 border-slate-600 text-slate-200' 
                                    : 'bg-white border-slate-300 text-slate-800'
                                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                              </div>
                            )}

                            {/* Status */}
                            {(() => {
                              const checkbox = document.getElementById(`diag-${option.id}`) as HTMLInputElement;
                              return checkbox?.checked && (
                                <div className="ml-7">
                                  <select
                                    value={selectedStatus[option.id] || 'nao_resolvido'}
                                    onChange={(e) => setSelectedStatus(prev => ({
                                      ...prev,
                                      [option.id]: e.target.value as 'resolvido' | 'nao_resolvido'
                                    }))}
                                    className={`w-full px-2 py-1.5 text-sm rounded border ${isDark
                                      ? 'bg-slate-800 border-slate-600 text-slate-200'
                                      : 'bg-white border-slate-300 text-slate-800'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  >
                                    <option value="nao_resolvido">❌ Não Resolvido</option>
                                    <option value="resolvido">✅ Resolvido</option>
                                  </select>
                                </div>
                              );
                            })()}
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
  };

  return (
    <div className={`space-y-4 p-4 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <h3 className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        Diagnósticos
      </h3>

      {/* Diagnósticos Principais */}
      {mainQuestions.length > 0 && renderGroup(mainQuestions, 'principal', '🏥 Diagnósticos Principais')}

      {/* Diagnósticos Secundários */}
      {secondaryQuestions.length > 0 && renderGroup(secondaryQuestions, 'secundario', '📋 Diagnósticos Secundários')}

      {/* Botão Salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold transition ${
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

