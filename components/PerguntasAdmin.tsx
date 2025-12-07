import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ThemeContext } from '../contexts';
import { ChevronRightIcon, SaveIcon, TrashIcon } from './icons';

interface Category {
  id: number;
  nome: string;
  icone?: string;
}

interface Pergunta {
  id: number;
  texto: string;
  categoria_id: number | null;
  ordem: number;
  categoria?: Category;
}

interface PerguntaOpcao {
  id: number;
  pergunta_id: number;
  codigo: string;
  label: string;
  has_input: boolean;
  input_placeholder?: string;
  ordem: number;
}

export const PerguntasAdmin: React.FC = () => {
  const { isDark } = useContext(ThemeContext) || { isDark: false };

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [opcoes, setOpcoes] = useState<PerguntaOpcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado para nova pergunta
  const [newPerguntaTexto, setNewPerguntaTexto] = useState('');
  const [newPerguntaCategoria, setNewPerguntaCategoria] = useState<number | ''>('');
  const [newPerguntaOrdem, setNewPerguntaOrdem] = useState('');

  // Estado para nova opção
  const [selectedPerguntaId, setSelectedPerguntaId] = useState<number | null>(null);
  const [newOpcaoCodigo, setNewOpcaoCodigo] = useState('');
  const [newOpcaoLabel, setNewOpcaoLabel] = useState('');
  const [newOpcaoHasInput, setNewOpcaoHasInput] = useState(false);
  const [newOpcaoPlaceholder, setNewOpcaoPlaceholder] = useState('');

  // Estado para edição
  const [editingPerguntaId, setEditingPerguntaId] = useState<number | null>(null);
  const [editingOpcaoId, setEditingOpcaoId] = useState<number | null>(null);
  const [expandedPerguntaId, setExpandedPerguntaId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriasRes, perguntasRes, opcoesRes] = await Promise.all([
        supabase.from('categorias').select('*').order('ordem', { ascending: true }),
        supabase.from('perguntas').select('*').order('ordem', { ascending: true }),
        supabase.from('pergunta_opcoes').select('*').order('pergunta_id').order('ordem')
      ]);

      if (categoriasRes.error) throw categoriasRes.error;
      if (perguntasRes.error) throw perguntasRes.error;
      if (opcoesRes.error) throw opcoesRes.error;

      setCategorias(categoriasRes.data || []);
      setPerguntas(perguntasRes.data || []);
      setOpcoes(opcoesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('❌ Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const addPergunta = async () => {
    if (!newPerguntaTexto.trim()) {
      alert('⚠️ Digite o texto da pergunta');
      return;
    }

    setSaving(true);
    try {
      const maxOrdem = Math.max(0, ...perguntas.map(p => p.ordem || 0));
      
      const { data, error } = await supabase
        .from('perguntas')
        .insert([{
          texto: newPerguntaTexto.trim(),
          categoria_id: newPerguntaCategoria ? parseInt(String(newPerguntaCategoria)) : null,
          ordem: newPerguntaOrdem ? parseInt(newPerguntaOrdem) : maxOrdem + 1
        }])
        .select();

      if (error) throw error;

      setPerguntas([...perguntas, data[0]]);
      setNewPerguntaTexto('');
      setNewPerguntaCategoria('');
      setNewPerguntaOrdem('');
      alert('✅ Pergunta adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar pergunta:', error);
      alert('❌ Erro ao adicionar pergunta');
    } finally {
      setSaving(false);
    }
  };

  const deletePergunta = async (id: number) => {
    if (!confirm('Tem certeza? Todas as opções desta pergunta também serão deletadas.')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('perguntas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPerguntas(perguntas.filter(p => p.id !== id));
      setOpcoes(opcoes.filter(o => o.pergunta_id !== id));
      alert('✅ Pergunta deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      alert('❌ Erro ao deletar pergunta');
    } finally {
      setSaving(false);
    }
  };

  const addOpcao = async () => {
    if (!selectedPerguntaId) {
      alert('⚠️ Selecione uma pergunta');
      return;
    }

    if (!newOpcaoLabel.trim()) {
      alert('⚠️ Digite o rótulo da opção');
      return;
    }

    if (!newOpcaoCodigo.trim()) {
      alert('⚠️ Digite o código da opção');
      return;
    }

    setSaving(true);
    try {
      const maxOrdem = Math.max(
        0,
        ...opcoes
          .filter(o => o.pergunta_id === selectedPerguntaId)
          .map(o => o.ordem)
      );

      const { data, error } = await supabase
        .from('pergunta_opcoes')
        .insert([{
          pergunta_id: selectedPerguntaId,
          codigo: newOpcaoCodigo.trim(),
          label: newOpcaoLabel.trim(),
          has_input: newOpcaoHasInput,
          input_placeholder: newOpcaoHasInput ? newOpcaoPlaceholder : null,
          ordem: maxOrdem + 1
        }])
        .select();

      if (error) throw error;

      setOpcoes([...opcoes, data[0]]);
      setNewOpcaoCodigo('');
      setNewOpcaoLabel('');
      setNewOpcaoHasInput(false);
      setNewOpcaoPlaceholder('');
      alert('✅ Opção adicionada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar opção:', error);
      if (error.message.includes('unique')) {
        alert('❌ Este código já existe para esta pergunta!');
      } else {
        alert('❌ Erro ao adicionar opção');
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteOpcao = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta opção?')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pergunta_opcoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOpcoes(opcoes.filter(o => o.id !== id));
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

  return (
    <div className={`space-y-6 p-4 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <h2 className={`font-bold text-2xl ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        ❓ Gerenciamento de Perguntas
      </h2>

      {/* Seção: Adicionar Nova Pergunta */}
      <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          ➕ Adicionar Nova Pergunta
        </h3>

        <div className="space-y-3">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Texto da Pergunta
            </label>
            <textarea
              value={newPerguntaTexto}
              onChange={(e) => setNewPerguntaTexto(e.target.value)}
              placeholder="Ex: Como está a respiração do paciente?"
              rows={2}
              className={`w-full px-3 py-2 rounded border ${isDark
                ? 'bg-slate-700 border-slate-600 text-slate-200'
                : 'bg-white border-slate-300 text-slate-800'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Categoria
              </label>
              <select
                value={newPerguntaCategoria}
                onChange={(e) => setNewPerguntaCategoria(e.target.value ? parseInt(e.target.value) : '')}
                className={`w-full px-3 py-2 rounded border ${isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Sem categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icone && `${cat.icone} `}{cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Ordem
              </label>
              <input
                type="number"
                value={newPerguntaOrdem}
                onChange={(e) => setNewPerguntaOrdem(e.target.value)}
                placeholder="Ex: 1"
                className={`w-full px-3 py-2 rounded border ${isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <button
            onClick={addPergunta}
            disabled={saving}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition ${
              saving
                ? `${isDark ? 'bg-slate-700' : 'bg-slate-300'} cursor-not-allowed`
                : `bg-green-600 hover:bg-green-700 text-white`
            }`}
          >
            <SaveIcon className="w-4 h-4" />
            {saving ? 'Adicionando...' : 'Adicionar Pergunta'}
          </button>
        </div>
      </div>

      {/* Seção: Lista de Perguntas */}
      {perguntas.length > 0 && (
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            📋 Perguntas ({perguntas.length})
          </h3>

          <div className="space-y-2">
            {perguntas.map(pergunta => {
              const perguntaOpcoes = opcoes.filter(o => o.pergunta_id === pergunta.id);
              const isExpanded = expandedPerguntaId === pergunta.id;
              const categoria = categorias.find(c => c.id === pergunta.categoria_id);

              return (
                <div key={pergunta.id} className={`rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <button
                    onClick={() => setExpandedPerguntaId(isExpanded ? null : pergunta.id)}
                    className={`w-full p-3 flex items-center justify-between text-left transition ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}
                  >
                    <div className="flex-1">
                      <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {pergunta.texto}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {categoria && `${categoria.icone || ''} ${categoria.nome}`} · Ordem: {pergunta.ordem} · {perguntaOpcoes.length} opção(ões)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePergunta(pergunta.id);
                        }}
                        disabled={saving}
                        className={`p-2 rounded transition ${
                          saving
                            ? `${isDark ? 'text-slate-600' : 'text-slate-400'} cursor-not-allowed`
                            : `text-red-500 hover:bg-red-500/20`
                        }`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Opções da Pergunta */}
                  {isExpanded && (
                    <div className={`border-t p-3 space-y-3 ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                      {/* Adicionar nova opção */}
                      {selectedPerguntaId === pergunta.id && (
                        <div className={`p-3 rounded-lg space-y-2 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                          <p className={`font-semibold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Adicionando nova opção
                          </p>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={newOpcaoCodigo}
                                onChange={(e) => setNewOpcaoCodigo(e.target.value)}
                                placeholder="Código"
                                className={`px-2 py-1 text-sm rounded border ${isDark
                                  ? 'bg-slate-600 border-slate-500 text-slate-200'
                                  : 'bg-white border-slate-300 text-slate-800'
                                }`}
                              />
                              <input
                                type="text"
                                value={newOpcaoLabel}
                                onChange={(e) => setNewOpcaoLabel(e.target.value)}
                                placeholder="Rótulo"
                                className={`px-2 py-1 text-sm rounded border ${isDark
                                  ? 'bg-slate-600 border-slate-500 text-slate-200'
                                  : 'bg-white border-slate-300 text-slate-800'
                                }`}
                              />
                            </div>

                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={newOpcaoHasInput}
                                onChange={(e) => setNewOpcaoHasInput(e.target.checked)}
                                className="w-4 h-4"
                              />
                              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Tem campo de texto?
                              </span>
                            </label>

                            {newOpcaoHasInput && (
                              <input
                                type="text"
                                value={newOpcaoPlaceholder}
                                onChange={(e) => setNewOpcaoPlaceholder(e.target.value)}
                                placeholder="Placeholder do input"
                                className={`w-full px-2 py-1 text-sm rounded border ${isDark
                                  ? 'bg-slate-600 border-slate-500 text-slate-200'
                                  : 'bg-white border-slate-300 text-slate-800'
                                }`}
                              />
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={addOpcao}
                                disabled={saving}
                                className={`flex-1 py-1 px-2 text-sm rounded font-semibold transition ${
                                  saving
                                    ? `${isDark ? 'bg-slate-600' : 'bg-slate-300'} cursor-not-allowed`
                                    : `bg-blue-600 hover:bg-blue-700 text-white`
                                }`}
                              >
                                Adicionar
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPerguntaId(null);
                                  setNewOpcaoCodigo('');
                                  setNewOpcaoLabel('');
                                  setNewOpcaoHasInput(false);
                                  setNewOpcaoPlaceholder('');
                                }}
                                className={`flex-1 py-1 px-2 text-sm rounded font-semibold transition ${isDark
                                  ? 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                                  : 'bg-slate-300 hover:bg-slate-400 text-slate-800'
                                }`}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lista de opções */}
                      {perguntaOpcoes.length > 0 ? (
                        <div className="space-y-2">
                          {perguntaOpcoes.map(opcao => (
                            <div
                              key={opcao.id}
                              className={`p-2 rounded-lg flex items-center justify-between text-sm ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                            >
                              <div className="flex-1">
                                <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                  [{opcao.codigo}] {opcao.label}
                                </p>
                                {opcao.has_input && (
                                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    📝 Input: {opcao.input_placeholder || '(sem placeholder)'}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => deleteOpcao(opcao.id)}
                                disabled={saving}
                                className={`p-1 rounded transition ${
                                  saving
                                    ? `${isDark ? 'text-slate-600' : 'text-slate-400'} cursor-not-allowed`
                                    : `text-red-500 hover:bg-red-500/20`
                                }`}
                              >
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Nenhuma opção adicionada
                        </p>
                      )}

                      {/* Botão para adicionar opção */}
                      {selectedPerguntaId !== pergunta.id && (
                        <button
                          onClick={() => setSelectedPerguntaId(pergunta.id)}
                          className="w-full py-1 px-2 text-sm rounded font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
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

      {perguntas.length === 0 && !loading && (
        <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Nenhuma pergunta criada ainda. Adicione uma para começar!
          </p>
        </div>
      )}
    </div>
  );
};
