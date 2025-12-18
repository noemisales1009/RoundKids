import React, { useState, useEffect } from 'react';
import { ChevronRightIcon } from './icons';
import { supabase } from '../supabaseClient';

interface DistintvoComponentProps {
  patientId: string | number;
}

const DistintvoComponent: React.FC<DistintvoComponentProps> = ({ patientId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [distintivos, setDistintivos] = useState<string[]>([]);
  const [newDistintivo, setNewDistintivo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDistintivos = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('destino')
          .eq('id', patientId)
          .single();

        if (!error && data?.destino) {
          setDistintivos(data.destino.split('|').filter((d: string) => d.trim()));
        }
      } catch (err) {
        console.error('Erro ao carregar distintivos:', err);
      }
    };

    fetchDistintivos();
  }, [patientId]);

  const saveToDatabase = async (updatedList: string[]) => {
    try {
      await supabase
        .from('patients')
        .update({ destino: updatedList.join('|') })
        .eq('id', patientId);
    } catch (err) {
      console.error('Erro ao salvar distintivos:', err);
    }
  };

  const createAlert = async (distintivo: string) => {
    try {
      const { data: patientData } = await supabase
        .from('patients')
        .select('name, bed_number')
        .eq('id', patientId)
        .single();

      if (patientData) {
        await supabase.from('alertas_paciente').insert({
          patient_id: patientId,
          titulo: `Distintivo: ${distintivo}`,
          descricao: `Paciente possui distintivo: ${distintivo}`,
          tipo: 'distintivo',
          status: 'ativo',
        });
      }
    } catch (err) {
      console.error('Erro ao criar alerta:', err);
    }
  };

  const addDistintivo = async () => {
    if (newDistintivo.trim() && !distintivos.includes(newDistintivo)) {
      const updatedList = [...distintivos, newDistintivo];
      setDistintivos(updatedList);
      setNewDistintivo('');
      await saveToDatabase(updatedList);
      await createAlert(newDistintivo);
    }
  };

  const removeDistintivo = async (index: number) => {
    const updatedList = distintivos.filter((_, i) => i !== index);
    setDistintivos(updatedList);
    await saveToDatabase(updatedList);
  };

  const toggleDistintivo = async (distintivo: string) => {
    let updatedList;
    if (distintivos.includes(distintivo)) {
      updatedList = distintivos.filter((d) => d !== distintivo);
    } else {
      updatedList = [...distintivos, distintivo];
      await createAlert(distintivo);
    }
    setDistintivos(updatedList);
    await saveToDatabase(updatedList);
  };

  const commonDistintivos = [
    'Precisa de interpretação',
    'Alérgico a medicamentos',
    'Risco de fuga',
    'Comportamento agressivo',
    'Restrição de movimento',
    'Precisa de supervisão constante',
    'Risco de queda',
    'Isolamento',
    'Precisa de intérprete',
    'Cegueira ou baixa visão'
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
      {/* Header Expansível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Destino</h3>
        </div>
        <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          {/* Distintivos Selecionados */}
          {distintivos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ativos ({distintivos.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {distintivos.map((distintivo, index) => (
                  <div
                    key={index}
                    className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {distintivo}
                    <button
                      onClick={() => removeDistintivo(index)}
                      className="font-bold hover:text-red-600 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campo de Entrada */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Adicionar Destino
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDistintivo}
                onChange={(e) => setNewDistintivo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDistintivo()}
                placeholder="Digite um destino..."
                className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
              <button
                onClick={addDistintivo}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Lista de Sugestões Comuns */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Destinos Comuns
            </label>
            <div className="grid grid-cols-1 gap-2">
              {commonDistintivos.map((distintivo) => (
                <button
                  key={distintivo}
                  onClick={() => toggleDistintivo(distintivo)}
                  className={`p-2 rounded-lg font-medium transition text-left ${
                    distintivos.includes(distintivo)
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {distintivos.includes(distintivo) ? '✓ ' : ''}
                  {distintivo}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistintvoComponent;
