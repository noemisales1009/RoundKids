import React, { useState, useEffect } from 'react';
import { DropletIcon, SaveIcon } from './icons';
import { supabase } from '../supabaseClient';

interface FluidBalanceCalcProps {
  patientId: string | number;
}

const FluidBalanceCalc: React.FC<FluidBalanceCalcProps> = ({ patientId }) => {
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [isPositive, setIsPositive] = useState(true);
  const [result, setResult] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const w = parseFloat(weight) || 0;
    const v = parseFloat(volume) || 0;

    if (w > 0 && v >= 0) {
      const signed = isPositive ? v : -v;
      setResult(signed / (w * 10));
    } else {
      setResult(0);
    }
  }, [weight, volume, isPositive]);

  const handleSave = async () => {
    if (!weight || !volume) return;

    setLoading(true);
    try {
      const w = parseFloat(weight);
      const v = parseFloat(volume);
      const signed = isPositive ? v : -v;

      await supabase.from('balanco_hidrico').insert({
        patient_id: patientId,
        peso: w,
        volume: signed,
      });

      setVolume('');
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-4 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Balanço Hídrico</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Peso (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tipo
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPositive(true)}
              className={`flex-1 p-2 rounded-lg font-medium transition ${
                isPositive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              ↑ Positivo
            </button>
            <button
              onClick={() => setIsPositive(false)}
              className={`flex-1 p-2 rounded-lg font-medium transition ${
                !isPositive 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              ↓ Negativo
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Volume (mL)
          </label>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          />
        </div>

        <div className={`${result > 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : result < 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-700/50'} p-3 rounded-lg border`}>
          <p className="text-sm text-slate-600 dark:text-slate-400">Resultado:</p>
          <p className={`text-2xl font-bold ${result > 0 ? 'text-blue-600 dark:text-blue-400' : result < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
            {result > 0 ? '+' : ''}{result.toFixed(2)}%
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <SaveIcon className="w-4 h-4" />
          Salvar
        </button>
      </div>
    </div>
  );
};

export default FluidBalanceCalc;
