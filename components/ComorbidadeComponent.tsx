import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CloseIcon, ChevronRightIcon, PlusIcon } from './icons';

interface ComorbidadeComponentProps {
  patientId: string | number;
}

const ComorbidadeComponent: React.FC<ComorbidadeComponentProps> = ({ patientId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comorbidades, setComorbidades] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  useEffect(() => {
    const fetchComorbidades = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('comorbidade')
          .eq('id', patientId)
          .single();

        if (!error && data?.comorbidade) {
          const comorbs = data.comorbidade.split('|').filter((c: string) => c.trim());
          setComorbidades(comorbs);
        }
      } catch (err) {
        console.error('Erro ao carregar comorbidades:', err);
      }
    };

    fetchComorbidades();
  }, [patientId]);

  const saveToDatabase = async (updatedList: string[]) => {
    try {
      await supabase
        .from('patients')
        .update({ comorbidade: updatedList.join('|') })
        .eq('id', patientId);
    } catch (err) {
      console.error('Erro ao salvar comorbidades:', err);
    }
  };

  const handleAddComorbidade = async () => {
    if (currentInput.trim() && !comorbidades.includes(currentInput.trim())) {
      const newComorbidades = [...comorbidades, currentInput.trim()];
      setComorbidades(newComorbidades);
      setCurrentInput('');
      await saveToDatabase(newComorbidades);
    }
  };

  const handleRemoveComorbidade = async (index: number) => {
    const newComorbidades = comorbidades.filter((_, i) => i !== index);
    setComorbidades(newComorbidades);
    await saveToDatabase(newComorbidades);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddComorbidade();
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
      {/* Header Expansível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🏥</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Comorbidades</h3>
          {comorbidades.length > 0 && (
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              ({comorbidades.length})
            </span>
          )}
        </div>
        <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          {/* Comorbidades já adicionadas */}
          {comorbidades.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Adicionadas ({comorbidades.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {comorbidades.map((comorbidade, index) => (
                  <div
                    key={index}
                    className="bg-blue-600 dark:bg-blue-700 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    <span>{comorbidade}</span>
                    <button
                      onClick={() => handleRemoveComorbidade(index)}
                      className="text-blue-200 hover:text-white font-bold transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campo de entrada */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Adicionar Comorbidade
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma comorbidade e clique em adicionar..."
                className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-100"
              />
              <button
                onClick={handleAddComorbidade}
                disabled={!currentInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>

          {/* Dica */}
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            💡 Digite uma comorbidade e clique "Adicionar" para adicionar outra no campo abaixo
          </p>
        </div>
      )}
    </div>
  );
};

export default ComorbidadeComponent;
