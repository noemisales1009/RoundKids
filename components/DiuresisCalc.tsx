import React, { useState, useEffect } from 'react';
import { Save, Droplets, Clock, Scale, Activity } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface DiuresisCalcProps {
  patientId: string;
}

const DiuresisCalc: React.FC<DiuresisCalcProps> = ({ patientId }) => {
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [hours, setHours] = useState('24');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [calculatedResult, setCalculatedResult] = useState(0);

  // --- LÓGICA DO CÁLCULO (EM TEMPO REAL) ---
  useEffect(() => {
    const weightNum = parseFloat(weight);
    const volumeNum = parseFloat(volume);
    const hoursNum = parseInt(hours);

    // Fórmula: Volume / Horas / Peso
    if (weightNum > 0 && volumeNum >= 0 && hoursNum > 0) {
      const result = (volumeNum / hoursNum) / weightNum;
      setCalculatedResult(result);
    } else {
      setCalculatedResult(0);
    }
  }, [weight, volume, hours]);

  // --- SALVAR NO SUPABASE ---
  const handleSave = async () => {
    if (!weight || !volume || !patientId) {
      setMessage({ type: 'error', text: 'Preencha peso e volume.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('diurese')
        .insert({
          patient_id: patientId,
          peso: parseFloat(weight),
          volume: parseFloat(volume),
          horas: parseInt(hours)
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Diurese registrada com sucesso!' });
      setVolume(''); // Limpa o volume para facilitar o próximo registro
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erro ao salvar dados.' });
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para definir a cor do resultado (Alertas clínicos)
  // < 0.5 é oligúria (ruim), > 1.0 é normal/bom
  const getResultColor = (val: number) => {
    if (val === 0) return 'text-slate-700';
    if (val < 0.5) return 'text-red-600'; // Alerta: Baixa produção de urina
    if (val < 1.0) return 'text-yellow-600'; // Atenção
    return 'text-green-600'; // Normal
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 font-sans mb-6">
      
      {/* Cabeçalho */}
      <div className="bg-teal-600 p-4 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <Activity className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Cálculo de Diurese</h2>
          <p className="text-teal-100 text-xs">Débito Urinário (mL/kg/h)</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        
        {/* Input de Peso */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
            <Scale size={16} className="text-slate-400" />
            Peso do Paciente (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 70.5"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900"
          />
        </div>

        {/* Seleção de Horas */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
            <Clock size={16} className="text-slate-400" />
            Período de Coleta (Horas)
          </label>
          <select
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white text-slate-900"
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
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
            <Droplets size={16} className="text-slate-400" />
            Volume Urinário Total (mL)
          </label>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="Ex: 1500"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900"
          />
        </div>

        {/* Resultado Visual */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">
            Resultado (Débito Urinário)
          </p>
          <div className={`text-4xl font-bold ${getResultColor(calculatedResult)} transition-colors`}>
            {calculatedResult.toFixed(2)}
            <span className="text-sm text-slate-400 font-medium ml-1">mL/kg/h</span>
          </div>
          
          {/* Feedback Clínico Simples */}
          {calculatedResult > 0 && calculatedResult < 0.5 && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
              ⚠️ Oligúria (Baixo débito)
            </div>
          )}
        </div>

        {/* Mensagens de Erro/Sucesso */}
        {message && (
          <div className={`p-3 rounded-lg text-sm text-center ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Botão Salvar */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : <><Save size={18} /> Salvar Diurese</>}
        </button>

      </div>
    </div>
  );
};

export default DiuresisCalc;
