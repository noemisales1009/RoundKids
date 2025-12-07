import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ThemeContext } from '../contexts';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, SaveIcon, AlertIcon } from './icons';

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

  // Estado
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [options, setOptions] = useState<DiagnosticOption[]>([]);
  const [diagnostics, setDiagnostics] = useState<PatientDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedMain, setExpandedMain] = useState(true);
  const [expandedSecondary, setExpandedSecondary] = useState(true);
  
  // Estado para inputs dinâmicos
  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [selectedStatus, setSelectedStatus] = useState<Record<number, 'resolvido' | 'nao_resolvido'>>({});

  // Carregar dados do banco
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
          
          // Popular inputs e status do que já existe
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

  // Salvar diagnósticos
  const handleSave = async () => {
    setSaving(true);
    try {
      const diagnosticsToSave: PatientDiagnostic[] = [];

      // Percorrer todas as opções e ver quais estão marcadas no DOM
      options.forEach(option => {
        const checkbox = document.getElementById(`diag-${option.id}`) as HTMLInputElement;
        
        if (checkbox && checkbox.checked) {
          const status = selectedStatus[option.id] || 'nao_resolvido';
          const textoDigitado = inputValues[option.id] || undefined;

          diagnosticsToSave.push({
            id: 0, // Será gerado pelo banco
            patient_id: patientId,
            pergunta_id: option.pergunta_id,
            opcao_id: option.id,
            texto_digitado: textoDigitado,
            status: status as 'resolvido' | 'nao_resolvido'
          });
        }
      });

      // Primeiro, deletar diagnósticos antigos
      await supabase
        .from('paciente_diagnosticos')
        .delete()
        .eq('patient_id', patientId);

      // Depois inserir os novos
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
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Carregando diagnósticos...</p>
        </div>
      </div>
    );
  }

  const mainDiagnostics = questions.filter(q => q.tipo === 'principal');
  const secondaryDiagnostics = questions.filter(q => q.tipo === 'secundario');

  const renderDiagnosticGroup = (groupQuestions: DiagnosticQuestion[], groupTitle: string, isExpanded: boolean, setExpanded: (val: boolean) => void) => {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
        {/* Header */}
        <button
          onClick={() => setExpanded(!isExpanded)}
          className={`w-full flex items-center justify-between p-4 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-50'} transition`}
        >
          <h3 className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {groupTitle}
          </h3>
          {isExpanded ? (
            <ChevronUpIcon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
          ) : (
            <ChevronDownIcon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 space-y-6">
            {groupQuestions.map(question => {
              const questionOptions = options.filter(opt => opt.pergunta_id === question.id);
              
              return (
                <div key={question.id} className={`p-4 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                  <p className={`font-semibold text-sm mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {question.titulo}
                  </p>

                  <div className="space-y-3">
                    {questionOptions.map(option => {
                      const isChecked = diagnostics.some(d => d.opcao_id === option.id);
                      
                      return (
                        <div key={option.id}>
                          {/* Checkbox */}
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              id={`diag-${option.id}`}
                              defaultChecked={isChecked}
                              onChange={() => {
                                // Atualizar estado local se necessário
                              }}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {option.label}
                            </span>
                          </label>

                          {/* Input dinâmico */}
                          {option.has_input && (
                            <div className="ml-8 mt-2">
                              <input
                                type="text"
                                placeholder={option.input_placeholder || 'Digite aqui...'}
                                value={inputValues[option.id] || ''}
                                onChange={(e) => setInputValues(prev => ({
                                  ...prev,
                                  [option.id]: e.target.value
                                }))}
                                className={`w-full px-3 py-2 text-sm rounded border ${isDark 
                                  ? 'bg-slate-900 border-slate-600 text-slate-200' 
                                  : 'bg-white border-slate-300 text-slate-800'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              />
                            </div>
                          )}

                          {/* Status - aparece quando checkbox está marcado */}
                          {(() => {
                            const checkbox = document.getElementById(`diag-${option.id}`) as HTMLInputElement;
                            return checkbox?.checked && (
                              <div className="ml-8 mt-2">
                                <select
                                  value={selectedStatus[option.id] || 'nao_resolvido'}
                                  onChange={(e) => setSelectedStatus(prev => ({
                                    ...prev,
                                    [option.id]: e.target.value as 'resolvido' | 'nao_resolvido'
                                  }))}
                                  className={`w-full px-3 py-2 text-sm rounded border ${isDark
                                    ? 'bg-slate-900 border-slate-600 text-slate-200'
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${isDark ? 'bg-slate-900' : 'bg-slate-50'} p-4 rounded-lg`}>
      <div className="flex items-center gap-2 mb-4">
        <AlertIcon className="w-6 h-6 text-red-600" />
        <h2 className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          Diagnósticos Clínicos
        </h2>
      </div>

      {/* Diagnósticos Principais */}
      {mainDiagnostics.length > 0 && renderDiagnosticGroup(mainDiagnostics, '🏥 Diagnósticos Principais', expandedMain, setExpandedMain)}

      {/* Diagnósticos Secundários */}
      {secondaryDiagnostics.length > 0 && renderDiagnosticGroup(secondaryDiagnostics, '📋 Diagnósticos Secundários', expandedSecondary, setExpandedSecondary)}

      {/* Botão Salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition ${
          saving
            ? `${isDark ? 'bg-slate-700' : 'bg-slate-300'} cursor-not-allowed`
            : `bg-blue-600 hover:bg-blue-700 text-white`
        }`}
      >
        <SaveIcon className="w-5 h-5" />
        {saving ? 'Salvando...' : 'Salvar Diagnósticos'}
      </button>
    </div>
  );
};
