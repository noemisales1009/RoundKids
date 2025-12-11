import React, { useState, useEffect } from 'react';
import { Calculator, Save, Droplets, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface FluidBalanceCalcProps {
  patientId: string | number;
}

const FluidBalanceCalc: React.FC<FluidBalanceCalcProps> = ({ patientId }) => {
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [isPositive, setIsPositive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [calculatedResult, setCalculatedResult] = useState(0);

  // Calcular resultado em tempo real
  useEffect(() => {
    const weightNum = parseFloat(weight);
    const volumeNum = parseFloat(volume);

    if (weightNum > 0 && volumeNum >= 0) {
      const signedVolume = isPositive ? volumeNum : -volumeNum;
      const result = signedVolume / (weightNum * 10);
      setCalculatedResult(result);
    } else {
      setCalculatedResult(0);
    }
  }, [weight, volume, isPositive]);

  // Salvar no banco
  const handleSave = async () => {
    if (!weight || !volume || !patientId) {
      setMessage({ type: 'error', text: 'Preencha todos os campos.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const weightNum = parseFloat(weight);
    const volumeAbsolute = parseFloat(volume);
    const finalVolume = isPositive ? volumeAbsolute : -volumeAbsolute;

    try {
      const { error } = await supabase.from('balanco_hidrico').insert({
        patient_id: patientId,
        peso: weightNum,
        volume: finalVolume,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Cálculo salvo com sucesso!' });
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 p-4 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <Calculator className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base sm:text-lg">Sobrecarga Hídrica</h2>
          <p className="text-blue-100 text-xs">Cálculo de % acumulada</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        
        {/* Input de Peso */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Peso de Admissão (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 12.5"
            className="w-full p-2.5 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition"
          />
        </div>

        {/* Seletor de Tipo de Balanço */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tipo de Balanço Hídrico
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => setIsPositive(true)}
              className={`flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border transition-all text-xs sm:text-sm font-medium ${
                isPositive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500 dark:ring-blue-400 shadow-sm' 
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              <ArrowUpCircle size={16} className="hidden sm:block" />
              <ArrowUpCircle size={14} className="sm:hidden" />
              <span>Positivo (+)</span>
            </button>
            <button
              onClick={() => setIsPositive(false)}
              className={`flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border transition-all text-xs sm:text-sm font-medium ${
                !isPositive 
                  ? 'bg-red-50 dark:bg-red-900/30 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 ring-1 ring-red-500 dark:ring-red-400 shadow-sm' 
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              <ArrowDownCircle size={16} className="hidden sm:block" />
              <ArrowDownCircle size={14} className="sm:hidden" />
              <span>Negativo (-)</span>
            </button>
          </div>
        </div>

        {/* Input de Volume */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Volume do Balanço (mL)
          </label>
          <div className="relative">
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="Ex: 500"
              className={`w-full p-2.5 sm:p-3 pl-9 sm:pl-10 border rounded-lg outline-none transition focus:ring-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 ${
                isPositive 
                  ? 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400' 
                  : 'border-slate-300 dark:border-slate-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
              }`}
            />
            <Droplets 
              className={`absolute left-2.5 sm:left-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 ${isPositive ? 'text-blue-400 dark:text-blue-300' : 'text-red-400 dark:text-red-300'}`} 
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Insira o valor absoluto. O sistema ajustará o cálculo.
          </p>
        </div>

        {/* Área de Resultado Visual */}
        <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-colors duration-300 ${
           Math.abs(calculatedResult) > 10 
             ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' 
             : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
        }`}>
          <div>
            <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider">
              Resultado Estimado
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl sm:text-3xl font-bold ${
                calculatedResult > 0 ? 'text-blue-600 dark:text-blue-400' : 
                calculatedResult < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {calculatedResult > 0 ? '+' : ''}
                {calculatedResult.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Alerta Visual */}
          {Math.abs(calculatedResult) >= 10 && (
            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-300 bg-white dark:bg-slate-800 px-2 sm:px-3 py-1 rounded-full shadow-sm border border-orange-100 dark:border-orange-800 animate-pulse text-xs sm:text-sm font-bold">
              <AlertCircle size={14} className="sm:w-4 sm:h-4" />
              <span>Sobrecarga Alta</span>
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

        {/* Botão de Salvar */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? (
            'Salvando...'
          ) : (
            <>
              <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
              Salvar no Prontuário
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default FluidBalanceCalc;
