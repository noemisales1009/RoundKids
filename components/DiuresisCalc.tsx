import React, { useState, useEffect, useContext } from 'react';
import { DropletIcon, SaveIcon, ChevronRightIcon } from './icons';
import { supabase } from '../supabaseClient';
import { NotificationContext, PatientsContext } from '../contexts';

interface DiuresisCalcProps {
  patientId: string | number;
  onCalculationSaved?: () => void;
}

const DiuresisCalc: React.FC<DiuresisCalcProps> = ({ patientId, onCalculationSaved }) => {
  const { showNotification } = useContext(NotificationContext)!;
  const { patients } = useContext(PatientsContext)!;
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [hours, setHours] = useState('24');
  const [result, setResult] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Começa fechado

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
    const h = parseInt(hours) || 1;

    if (w > 0 && v >= 0 && h > 0) {
      setResult((v / h) / w);
    } else {
      setResult(0);
    }
  }, [weight, volume, hours]);

  const handleSave = async () => {
    if (!weight || !volume) return;

    setLoading(true);
    try {
      const w = parseFloat(weight);
      const v = parseFloat(volume);
      const h = parseInt(hours);

      const diuresisRecord = {
        patient_id: patientId,
        peso: w,
        volume: v,
        horas: h,
        data_registro: new Date().toISOString(),
      };

      await supabase.from('diurese').insert(diuresisRecord);

      showNotification({ message: 'Diurese salva com sucesso!', type: 'success' });
      
      // Notificar que foi salvo
      if (onCalculationSaved) {
        onCalculationSaved();
      }
    } catch (error) {
      console.error('Erro:', error);
      showNotification({ message: 'Erro ao salvar diurese', type: 'error' });
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
          <DropletIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Diurese</h3>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Período (h)
            </label>
            <select 
              value={hours} 
              onChange={(e) => setHours(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              {[...Array(24)].map((_, i) => <option key={i+1} value={i+1}>{i+1}h</option>)}
            </select>
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

          <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg border border-teal-200 dark:border-teal-800">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Débito Urinário</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{result.toFixed(2)} mL/kg/h</p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <SaveIcon className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DiuresisCalc;
