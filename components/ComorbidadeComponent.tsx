import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CloseIcon, ChevronRightIcon, PlusIcon } from './icons';
import { Medication } from '../types';
import { acharComorbidadeRepetida } from '../lib/typesafe/comorbidadeRepetida';

interface ComorbidadeComponentProps {
  patientId: string | number;
  medications?: Medication[];
}

const ComorbidadeComponent: React.FC<ComorbidadeComponentProps> = ({ patientId, medications = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comorbidades, setComorbidades] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [repetida, setRepetida] = useState<{ nova: string; existente: string } | null>(null);

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

  const adicionar = async (nova: string) => {
    const newComorbidades = [...comorbidades, nova];
    setComorbidades(newComorbidades);
    setCurrentInput('');
    setRepetida(null);
    await saveToDatabase(newComorbidades);
  };

  // Antes de adicionar, confere se a comorbidade já está na lista escrita de outro jeito
  // (sigla, sinônimo). Se parecer repetida, só avisa: quem decide é quem está cadastrando.
  // Sem resposta do serviço, adiciona direto, como sempre foi.
  const handleAddComorbidade = async () => {
    const nova = currentInput.trim();
    if (!nova || comorbidades.includes(nova) || verificando) return;

    setVerificando(true);
    const igual = await acharComorbidadeRepetida(nova, comorbidades);
    setVerificando(false);

    if (igual) {
      setRepetida({ nova, existente: igual });
      return;
    }
    await adicionar(nova);
  };

  const handleRemoveComorbidade = async (index: number) => {
    const newComorbidades = comorbidades.filter((_, i) => i !== index);
    setComorbidades(newComorbidades);
    await saveToDatabase(newComorbidades);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              ({comorbidades.length})
            </span>
          )}
        </div>
        <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Comorbidades sempre visíveis — chips */}
      {comorbidades.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
          {comorbidades.map((comorbidade, index) => {
            const medsVinculadas = medications.filter(m => m.comorbidadeRelacionada === comorbidade);
            return (
              <div key={index}>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-primary-400 dark:border-primary-500 text-slate-700 dark:text-slate-200 bg-transparent"
                >
                  {comorbidade}
                  <button
                    onClick={() => handleRemoveComorbidade(index)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors leading-none"
                    title="Remover"
                  >
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
                {medsVinculadas.length > 0 && (
                  <div className="mt-1.5 ml-2 flex flex-wrap gap-1.5">
                    {medsVinculadas.map(med => (
                      <span
                        key={med.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700"
                      >
                        💊 {med.name}{med.dosage ? ` ${med.dosage}` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Campo de entrada - Aparece apenas quando expandido */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Adicionar Comorbidade
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => { setCurrentInput(e.target.value); setRepetida(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma comorbidade e clique em adicionar..."
                className="flex-1 min-w-0 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-slate-800 dark:text-slate-100"
              />
              <button
                onClick={handleAddComorbidade}
                disabled={!currentInput.trim() || verificando}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                {verificando ? 'Verificando...' : 'Adicionar'}
              </button>
            </div>
            {repetida && (
              <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Sugestão da IA: "{repetida.nova}" parece ser a mesma comorbidade que "{repetida.existente}", já cadastrada.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => adicionar(repetida.nova)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
                  >
                    Adicionar mesmo assim
                  </button>
                  <button
                    onClick={() => { setRepetida(null); setCurrentInput(''); }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition"
                  >
                    Não adicionar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dica */}
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            💡 Digite uma comorbidade e clique "Adicionar" para adicionar outra no campo acima
          </p>
        </div>
      )}
    </div>
  );
};

export default ComorbidadeComponent;
