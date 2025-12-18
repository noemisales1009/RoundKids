import React, { useState, useEffect } from 'react';
import { SaveIcon, DropletIcon, PillIcon } from './icons';
import { supabase } from '../supabaseClient';

interface DiuresisCalcProps {
  patientId: string | number;
}

const DiuresisCalc: React.FC<DiuresisCalcProps> = ({ patientId }) => {
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [hours, setHours] = useState('24');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [calculatedResult, setCalculatedResult] = useState(0);

  // Calcular resultado em tempo real
  useEffect(() => {
    const weightNum = parseFloat(weight);
    const volumeNum = parseFloat(volume);
    const hoursNum = parseInt(hours);

    if (weightNum > 0 && volumeNum >= 0 && hoursNum > 0) {
      const result = (volumeNum / hoursNum) / weightNum;
      setCalculatedResult(result);
    } else {
      setCalculatedResult(0);
    }
  }, [weight, volume, hours]);

  // Função para definir a cor do resultado
  const getResultColor = (val: number) => {
    if (val === 0) return 'text-slate-700 dark:text-slate-300';
    if (val < 0.5) return 'text-red-600 dark:text-red-400';
    if (val < 1.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getAlertBgColor = (val: number) => {
    if (val === 0) return 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600';
    if (val < 0.5) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    if (val < 1.0) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
  };

  // Salvar no Supabase
  const handleSave = async () => {
    if (!weight || !volume || !patientId) {
      setMessage({ type: 'error', text: 'Preencha todos os campos.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const weightNum = parseFloat(weight);
    const volumeNum = parseFloat(volume);
    const hoursNum = parseInt(hours);

    try {
      const { error: insertError } = await supabase.from('diurese').insert({
        patient_id: patientId,
        peso: weightNum,
        volume: volumeNum,
        horas: hoursNum,
      });

      if (insertError) throw insertError;

      setMessage({ type: 'success', text: 'Diurese registrada com sucesso!' });
      setVolume('');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 font-sans mb-4">
      
      {/* Cabeçalho */}
      <div className="bg-linear-to-r from-teal-600 to-teal-700 dark:from-teal-900 dark:to-teal-800 p-4 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <PillIcon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base sm:text-lg">Cálculo de Diurese</h2>
          <p className="text-teal-100 text-xs">Débito Urinário (mL/kg/h)</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        
        {/* Input de Peso */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Peso do Paciente (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 70.5"
            className="w-full p-2.5 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
          />
        </div>

        {/* Seleção de Horas */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Período de Coleta (Horas)
          </label>
          <select
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full p-2.5 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
          >
            {[...Array(24)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i + 1 === 1 ? 'hora' : 'horas'}
              </option>
            ))}
          </select>
        </div>

        {/* Input de Volume */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            <DropletIcon className="text-slate-400 dark:text-slate-500" />
            Volume Urinário Total (mL)
          </label>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="Ex: 1500"
            className="w-full p-2.5 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition"
          />
        </div>

        {/* Resultado Visual */}
        <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-colors duration-300 ${getAlertBgColor(calculatedResult)}`}>
          <div>
            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
              Resultado
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl sm:text-3xl font-bold ${getResultColor(calculatedResult)}`}>
                {calculatedResult.toFixed(2)}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">mL/kg/h</span>
            </div>
          </div>

          {/* Alerta Visual */}
          {calculatedResult > 0 && calculatedResult < 0.5 && (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-300 bg-white dark:bg-slate-800 px-2 sm:px-3 py-1 rounded-full shadow-sm border border-red-100 dark:border-red-800 animate-pulse text-xs sm:text-sm font-bold">
              <span>🔴 Oligúria</span>
            </div>
          )}
          {calculatedResult >= 0.5 && calculatedResult < 1.0 && (
            <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-300 bg-white dark:bg-slate-800 px-2 sm:px-3 py-1 rounded-full shadow-sm border border-yellow-100 dark:border-yellow-800 text-xs sm:text-sm font-bold">
              ⚠️ <span>Atenção</span>
            </div>
          )}
          {calculatedResult >= 1.0 && (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-300 bg-white dark:bg-slate-800 px-2 sm:px-3 py-1 rounded-full shadow-sm border border-green-100 dark:border-green-800 text-xs sm:text-sm font-bold">
              ✓ <span>Normal</span>
            </div>
          )}
        </div>

        {/* Mensagens de Erro/Sucesso */}
        {message && (
          <div className={`p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            <span>{message.text}</span>
          </div>
        )}



        {/* Botão Salvar */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? (
            'Salvando...'
          ) : (
            <>
              <SaveIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              Salvar
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default DiuresisCalc;
