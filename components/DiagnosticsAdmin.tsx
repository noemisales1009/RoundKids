import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ThemeContext } from '../contexts';
import { ChevronRightIcon, SaveIcon, TrashIcon } from './icons';

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

export const DiagnosticsAdmin: React.FC = () => {
  const { theme } = useContext(ThemeContext) || { theme: 'light' as const };
  const isDark = theme === 'dark';

  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [options, setOptions] = useState<DiagnosticOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado para nova opção
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionCodigo, setNewOptionCodigo] = useState('');
  const [newOptionHasInput, setNewOptionHasInput] = useState(false);
  const [newOptionPlaceholder, setNewOptionPlaceholder] = useState('');

  // UI Estado
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [questionsRes, optionsRes] = await Promise.all([
        supabase.from('perguntas_diagnistico').select('*').order('id'),
        supabase.from('pergunta_opcoes_diagnostico').select('*').order('pergunta_id').order('ordem')
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (optionsRes.error) throw optionsRes.error;

      setQuestions(questionsRes.data || []);
      setOptions(optionsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('❌ Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm('Tem certeza? Todas as opções desta pergunta também serão deletadas.')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('perguntas_diagnistico')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== id));
      setOptions(options.filter(o => o.pergunta_id !== id));
      alert('✅ Pergunta deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      alert('❌ Erro ao deletar pergunta');
    } finally {
      setSaving(false);
    }
  };

  const addOption = async () => {
    if (!selectedQuestionId) {
      alert('⚠️ Selecione uma pergunta');
      return;
    }

    if (!newOptionLabel.trim()) {
      alert('⚠️ Digite um rótulo para a opção');
      return;
    }

    setSaving(true);
    try {
      const maxOrdem = Math.max(
        0,
        ...options
          .filter(o => o.pergunta_id === selectedQuestionId)
          .map(o => o.ordem)
      );

      const { data, error } = await supabase
        .from('pergunta_opcoes_diagnostico')
        .insert([
          {
            pergunta_id: selectedQuestionId,
            codigo: newOptionCodigo || newOptionLabel.substring(0, 10),
            label: newOptionLabel,
            has_input: newOptionHasInput,
            input_placeholder: newOptionHasInput ? newOptionPlaceholder : null,
            ordem: maxOrdem + 1
          }
        ])
        .select();

      if (error) throw error;

      setOptions([...options, data[0]]);
      setNewOptionLabel('');
      setNewOptionCodigo('');
      setNewOptionHasInput(false);
      setNewOptionPlaceholder('');
      alert('✅ Opção adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar opção:', error);
      alert('❌ Erro ao adicionar opção');
    } finally {
      setSaving(false);
    }
  };

  const deleteOption = async (id: number) => {
    if (!confirm('Tem certeza? Esta opção será deletada.')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pergunta_opcoes_diagnostico')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOptions(options.filter(o => o.id !== id));
      alert('✅ Opção deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar opção:', error);
      alert('❌ Erro ao deletar opção');
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

  return (
    <div className={`space-y-6 p-4 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <h2 className={`font-bold text-2xl ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        ⚙️ Administração de Diagnósticos
      </h2>

      {/* Seção: Perguntas Principais */}
      {mainQuestions.length > 0 && (
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            🏥 Perguntas Principais ({mainQuestions.length})
          </h3>

          <div className="space-y-2">
            {mainQuestions.map(question => {
              const questionOptions = options.filter(o => o.pergunta_id === question.id);
              const isExpanded = expandedQuestionId === question.id;

              return (
                <div key={question.id} className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
                      className="flex-1 text-left flex items-center gap-2"
                    >
                      <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {question.titulo}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ml-auto ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                        {questionOptions.length} opção(ões)
                      </span>
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      disabled={saving}
                      className={`ml-2 p-2 rounded transition ${
                        saving
                          ? 'text-slate-500 cursor-not-allowed'
                          : isDark
                          ? 'text-red-400 hover:bg-red-900/30'
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
                      <div className="space-y-2">
                        {questionOptions.map(option => (
                          <div key={option.id} className={`p-2 rounded flex items-start justify-between ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                            <div className="flex-1">
                              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {option.label}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Código: {option.codigo} {option.has_input ? '| Com Input' : ''}
                              </p>
                              {option.has_input && option.input_placeholder && (
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Placeholder: "{option.input_placeholder}"
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteOption(option.id)}
                              disabled={saving}
                              className={`p-1 rounded transition ${
                                saving
                                  ? 'text-slate-500 cursor-not-allowed'
                                  : isDark
                                  ? 'text-red-400 hover:bg-red-900/30'
                                  : 'text-red-600 hover:bg-red-100'
                              }`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Adicionar opção para esta pergunta */}
                      {selectedQuestionId === question.id && (
                        <div className={`mt-3 p-3 rounded border-t ${isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-300 bg-slate-50'}`}>
                          <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Adicionar Opção
                          </p>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={newOptionLabel}
                              onChange={(e) => setNewOptionLabel(e.target.value)}
                              placeholder="Rótulo da opção"
                              className={`w-full px-2 py-1 text-sm rounded border ${isDark
                                ? 'bg-slate-600 border-slate-500 text-slate-200'
                                : 'bg-white border-slate-300 text-slate-800'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <input
                              type="text"
                              value={newOptionCodigo}
                              onChange={(e) => setNewOptionCodigo(e.target.value)}
                              placeholder="Código (opcional)"
                              className={`w-full px-2 py-1 text-sm rounded border ${isDark
                                ? 'bg-slate-600 border-slate-500 text-slate-200'
                                : 'bg-white border-slate-300 text-slate-800'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={newOptionHasInput}
                                onChange={(e) => setNewOptionHasInput(e.target.checked)}
                                className="w-4 h-4"
                              />
                              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                                Precisa de input de texto?
                              </span>
                            </label>
                            {newOptionHasInput && (
                              <input
                                type="text"
                                value={newOptionPlaceholder}
                                onChange={(e) => setNewOptionPlaceholder(e.target.value)}
                                placeholder="Placeholder do input"
                                className={`w-full px-2 py-1 text-sm rounded border ${isDark
                                  ? 'bg-slate-600 border-slate-500 text-slate-200'
                                  : 'bg-white border-slate-300 text-slate-800'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              />
                            )}
                            <button
                              onClick={addOption}
                              disabled={saving}
                              className={`w-full py-1 px-2 text-sm rounded font-semibold transition ${
                                saving
                                  ? `${isDark ? 'bg-slate-600' : 'bg-slate-300'} cursor-not-allowed`
                                  : `bg-blue-600 hover:bg-blue-700 text-white`
                              }`}
                            >
                              {saving ? 'Adicionando...' : 'Adicionar Opção'}
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedQuestionId !== question.id && (
                        <button
                          onClick={() => setSelectedQuestionId(question.id)}
                          className="mt-2 w-full py-1 px-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                        >
                          + Adicionar Opção
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seção: Perguntas Secundárias */}
      {secondaryQuestions.length > 0 && (
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            📋 Perguntas Secundárias ({secondaryQuestions.length})
          </h3>

          <div className="space-y-2">
            {secondaryQuestions.map(question => {
              const questionOptions = options.filter(o => o.pergunta_id === question.id);
              const isExpanded = expandedQuestionId === question.id;

              return (
                <div key={question.id} className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
                      className="flex-1 text-left flex items-center gap-2"
                    >
                      <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {question.titulo}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ml-auto ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                        {questionOptions.length} opção(ões)
                      </span>
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      disabled={saving}
                      className={`ml-2 p-2 rounded transition ${
                        saving
                          ? 'text-slate-500 cursor-not-allowed'
                          : isDark
                          ? 'text-red-400 hover:bg-red-900/30'
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
                      <div className="space-y-2">
                        {questionOptions.map(option => (
                          <div key={option.id} className={`p-2 rounded flex items-start justify-between ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                            <div className="flex-1">
                              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {option.label}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Código: {option.codigo} {option.has_input ? '| Com Input' : ''}
                              </p>
                              {option.has_input && option.input_placeholder && (
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Placeholder: "{option.input_placeholder}"
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteOption(option.id)}
                              disabled={saving}
                              className={`p-1 rounded transition ${
                                saving
                                  ? 'text-slate-500 cursor-not-allowed'
                                  : isDark
                                  ? 'text-red-400 hover:bg-red-900/30'
                                  : 'text-red-600 hover:bg-red-100'
                              }`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Adicionar opção para esta pergunta */}
                      {selectedQuestionId === question.id && (
                        <div className={`mt-3 p-3 rounded border-t ${isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-300 bg-slate-50'}`}>
                          <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Adicionar Opção
                          </p>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={newOptionLabel}
                              onChange={(e) => setNewOptionLabel(e.target.value)}
                              placeholder="Rótulo da opção"
                              className={`w-full px-2 py-1 text-sm rounded border ${isDark
                                ? 'bg-slate-600 border-slate-500 text-slate-200'
                                : 'bg-white border-slate-300 text-slate-800'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <input
                              type="text"
                              value={newOptionCodigo}
                              onChange={(e) => setNewOptionCodigo(e.target.value)}
                              placeholder="Código (opcional)"
                              className={`w-full px-2 py-1 text-sm rounded border ${isDark
                                ? 'bg-slate-600 border-slate-500 text-slate-200'
                                : 'bg-white border-slate-300 text-slate-800'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={newOptionHasInput}
                                onChange={(e) => setNewOptionHasInput(e.target.checked)}
                                className="w-4 h-4"
                              />
                              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                                Precisa de input de texto?
                              </span>
                            </label>
                            {newOptionHasInput && (
                              <input
                                type="text"
                                value={newOptionPlaceholder}
                                onChange={(e) => setNewOptionPlaceholder(e.target.value)}
                                placeholder="Placeholder do input"
                                className={`w-full px-2 py-1 text-sm rounded border ${isDark
                                  ? 'bg-slate-600 border-slate-500 text-slate-200'
                                  : 'bg-white border-slate-300 text-slate-800'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              />
                            )}
                            <button
                              onClick={addOption}
                              disabled={saving}
                              className={`w-full py-1 px-2 text-sm rounded font-semibold transition ${
                                saving
                                  ? `${isDark ? 'bg-slate-600' : 'bg-slate-300'} cursor-not-allowed`
                                  : `bg-blue-600 hover:bg-blue-700 text-white`
                              }`}
                            >
                              {saving ? 'Adicionando...' : 'Adicionar Opção'}
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedQuestionId !== question.id && (
                        <button
                          onClick={() => setSelectedQuestionId(question.id)}
                          className="mt-2 w-full py-1 px-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                        >
                          + Adicionar Opção
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {questions.length === 0 && (
        <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Nenhuma pergunta cadastrada ainda. Comece adicionando uma! 👆
          </p>
        </div>
      )}
    </div>
  );
};
