import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronRightIcon } from './icons';

interface DestinoComponentProps {
  patientId: string | number;
}

const DestinoComponent: React.FC<DestinoComponentProps> = ({ patientId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDestino = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('destino')
          .eq('id', patientId)
          .single();

        if (!error && data?.destino) {
          setDestino(data.destino);
        }
      } catch (err) {
        console.error('Erro ao carregar destino:', err);
      }
    };

    fetchDestino();
  }, [patientId]);

  const handleDestinoChange = async (newDestino: string) => {
    setDestino(newDestino);
    setLoading(true);

    try {
      await supabase
        .from('patients')
        .update({ destino: newDestino })
        .eq('id', patientId);
    } catch (err) {
      console.error('Erro ao salvar destino:', err);
    } finally {
      setLoading(false);
    }
  };

  const destinoLabels = {
    interno: 'Interno',
    externo: 'Externo',
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
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDestinoChange('interno')}
              disabled={loading}
              className={`p-3 rounded-lg font-medium transition ${
                destino === 'interno'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              } disabled:opacity-50`}
            >
              Interno
            </button>
            <button
              onClick={() => handleDestinoChange('externo')}
              disabled={loading}
              className={`p-3 rounded-lg font-medium transition ${
                destino === 'externo'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              } disabled:opacity-50`}
            >
              Externo
            </button>
          </div>

          {destino && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-slate-600 dark:text-slate-400">Destino Selecionado</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 capitalize">
                {destino === 'interno' ? 'Interno' : 'Externo'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DestinoComponent;
