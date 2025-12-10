import React, { useState, useEffect } from 'react';
import { Save, Droplets, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface FluidOverloadCalcProps {
  patientId: string;
}

const FluidOverloadCalc: React.FC<FluidOverloadCalcProps> = ({ patientId }) => {
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [isPositive, setIsPositive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [calculatedResult, setCalculatedResult] = useState(0);

  // --- LÓGICA DO CÁLCULO (FRONT-END) ---
  useEffect(() => {
    const weightNum = parseFloat(weight);
    const volumeNum = parseFloat(volume);

    if (weightNum > 0 && volumeNum >= 0) {
      // 1. Definimos o sinal do volume (se é ganho ou perda)
      const signedVolume = isPositive ? volumeNum : -volumeNum;

      // 2. Aplicamos a fórmula simplificada: Volume / (Peso * 10)
      // O resultado dessa conta já é a porcentagem (ex: 4.16)
      const result = signedVolume / (weightNum * 10);
      
      setCalculatedResult(result);
    } else {
      setCalculatedResult(0);
    }
  }, [weight, volume, isPositive]);


  // --- SALVAR NO SUPABASE ---
  const handleSave = async () => {
    if (!weight || !volume || !patientId) {
      setMessage({ type: 'error', text: 'Preencha todos os campos.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    // Convertendo para números para enviar ao banco
    const weightNum = parseFloat(weight);
    const volumeAbsolute = parseFloat(volume);
    
    // O banco espera o volume com sinal (+ ou -) para calcular corretamente
    const finalVolume = isPositive ? volumeAbsolute : -volumeAbsolute;

    try {
      const { error } = await supabase
        .from('balanco_hidrico')
        .insert({
          patient_id: patientId,
          peso: weightNum,
          volume: finalVolume
          // O campo 'resultado' é gerado automaticamente pelo banco, não enviamos aqui
        });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Cálculo salvo com sucesso!' });
      // Limpar campo de volume para facilitar nova entrada, mantendo o peso
      setVolume('');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar. Verifique a conexão.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 font-sans mb-6">
      
      {/* Cabeçalho */}
      <div className="bg-blue-600 p-4 flex items-center gap-3">
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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Peso de Admissão (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 12.5"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900"
          />
        </div>

        {/* Seletor de Tipo de Balanço (Positivo ou Negativo) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tipo de Balanço Hídrico
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsPositive(true)}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                isPositive 
                  ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <ArrowUpCircle size={20} />
              <span className="font-medium">Positivo (+)</span>
            </button>
            <button
              onClick={() => setIsPositive(false)}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                !isPositive 
                  ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <ArrowDownCircle size={20} />
              <span className="font-medium">Negativo (-)</span>
            </button>
          </div>
        </div>

        {/* Input de Volume */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Volume do Balanço (mL)
          </label>
          <div className="relative">
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="Ex: 500"
              className={`w-full p-3 pl-10 border rounded-lg outline-none transition focus:ring-2 text-slate-900 ${
                isPositive 
                  ? 'border-slate-300 focus:border-blue-500 focus:ring-blue-500' 
                  : 'border-slate-300 focus:border-red-500 focus:ring-red-500'
              }`}
            />
            <Droplets 
              className={`absolute left-3 top-3.5 w-5 h-5 ${isPositive ? 'text-blue-400' : 'text-red-400'}`} 
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Insira o valor absoluto (sem sinal de menos). O sistema ajustará o cálculo.
          </p>
        </div>

        {/* Área de Resultado Visual */}
        <div className={`rounded-xl p-4 border flex justify-between items-center transition-colors duration-300 ${
           Math.abs(calculatedResult) > 10 
             ? 'bg-orange-50 border-orange-200' 
             : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              Resultado Estimado
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${
                calculatedResult > 0 ? 'text-blue-600' : 
                calculatedResult < 0 ? 'text-red-600' : 'text-slate-700'
              }`}>
                {calculatedResult > 0 ? '+' : ''}
                {calculatedResult.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Alerta Visual se passar de 10% */}
          {Math.abs(calculatedResult) >= 10 && (
            <div className="flex items-center gap-2 text-orange-600 bg-white px-3 py-1 rounded-full shadow-sm border border-orange-100 animate-pulse">
              <AlertCircle size={16} />
              <span className="text-xs font-bold">Sobrecarga Alta</span>
            </div>
          )}
        </div>

        {/* Mensagens de Erro/Sucesso */}
        {message && (
          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <span>{message.text}</span>
          </div>
        )}

        {/* Botão de Salvar */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Salvando...'
          ) : (
            <>
              <Save size={18} />
              Salvar no Prontuário
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default FluidOverloadCalc;
