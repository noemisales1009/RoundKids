import React, { useState, useEffect, useContext } from 'react';
import { DropletIcon, SaveIcon, ChevronRightIcon } from './icons';
import { supabase } from '../supabaseClient';
import { NotificationContext, PatientsContext } from '../contexts';

interface FluidBalanceCalcProps {
  patientId: string | number;
  onCalculationSaved?: () => void;
}

const FluidBalanceCalc: React.FC<FluidBalanceCalcProps> = ({ patientId, onCalculationSaved }) => {
  const { showNotification } = useContext(NotificationContext)!;
  const { patients } = useContext(PatientsContext)!;
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [isPositive, setIsPositive] = useState(true);
  const [result, setResult] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Buscar peso do paciente do context (mais rápido e confiável)
  useEffect(() => {
    const patient = patients.find(p => p.id.toString() === patientId.toString());
    if (patient?.peso) {
      console.log('Peso encontrado do context:', patient.peso);
      setWeight(patient.peso.toString());
    } else {
      console.log('Peso não encontrado para paciente:', patientId);
    }
  }, [patientId, patients]);

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

      const balanceRecord = {
        patient_id: patientId,
        peso: w,
        volume: signed,
      };

      await supabase.from('balanco_hidrico').insert(balanceRecord);

      showNotification({ message: 'Balanço hídrico salvo com sucesso!', type: 'success' });
      
      // Notificar que foi salvo
      if (onCalculationSaved) {
        onCalculationSaved();
      }
    } catch (error) {
      console.error('Erro:', error);
      showNotification({ message: 'Erro ao salvar balanço hídrico', type: 'error' });
    } finally {
      setLoading(false);
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
          <DropletIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Balanço Hídrico</h3>
        </div>
        <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
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
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className={`p-3 rounded-lg border ${result > 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : result < 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Resultado</p>
            <p className={`text-2xl font-bold ${result > 0 ? 'text-blue-600 dark:text-blue-400' : result < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
              {result > 0 ? '+' : ''}{result.toFixed(2)}%
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <SaveIcon className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FluidBalanceCalc;
