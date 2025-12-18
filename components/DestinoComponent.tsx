import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface DestinoComponentProps {
  patientId: string | number;
}

const DestinoComponent: React.FC<DestinoComponentProps> = ({ patientId }) => {
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

  const handleDestinoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDestino = e.target.value;
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

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4 p-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Destino da Transferência
      </label>
      <select
        value={destino}
        onChange={handleDestinoChange}
        disabled={loading}
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium disabled:opacity-50"
      >
        <option value="">Selecionar destino...</option>
        <option value="interno">Interno</option>
        <option value="externo">Externo</option>
      </select>

      {destino && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">Destino Selecionado</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 capitalize">
            {destino === 'interno' ? 'Interno' : 'Externo'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DestinoComponent;
