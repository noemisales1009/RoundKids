import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronRightIcon } from './icons';

interface DestinoComponentProps {
  patientId: string | number;
}

const DestinoComponent: React.FC<DestinoComponentProps> = ({ patientId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localTransferencia, setLocalTransferencia] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('local_transferencia')
          .eq('id', patientId)
          .single();

        if (error) {
          console.warn('⚠️ Campo local_transferencia pode não existir na tabela patients:', error.message);
          return;
        }

        if (data?.local_transferencia) {
          setLocalTransferencia(data.local_transferencia);
        }
      } catch (err) {
        console.warn('Campo local_transferencia não disponível');
      }
    };

    fetchData();
  }, [patientId]);

  const handleLocalChange = async (newLocal: string) => {
    setLocalTransferencia(newLocal);
    setLoading(true);

    try {
      await supabase
        .from('patients')
        .update({ local_transferencia: newLocal })
        .eq('id', patientId);
    } catch (err) {
      console.error('Erro ao salvar local:', err);
    } finally {
      setLoading(false);
    }
  };

  const destinoLabels = {
    alta: 'Alta',
    interna: 'Transferência Interna',
    externa: 'Transferência Externa',
    obito: 'Óbito',
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
      {/* Header Expansível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Destino da Transferência</h3>
        </div>
        <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          {/* Local de Transferência */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Selecione o Local</h4>
            <select
              value={localTransferencia}
              onChange={(e) => handleLocalChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium transition hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um local</option>
              <option value="Alta">Alta</option>
              <option value="Transferência Interna">Transferência Interna</option>
              <option value="Transferência Externa">Transferência Externa</option>
              <option value="Óbito">Óbito</option>
            </select>
          </div>

          {/* Resumo */}
          {localTransferencia && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">Local Selecionado</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {localTransferencia}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DestinoComponent;
