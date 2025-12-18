import React, { useState, useEffect } from 'react';
import { DropletIcon, SaveIcon } from './icons';

interface DiuresisCalcProps {
  patientId: string | number;
}

const DiuresisCalc: React.FC<DiuresisCalcProps> = ({ patientId }) => {
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [hours, setHours] = useState('24');
  const [result, setResult] = useState(0);

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

  const handleSave = () => {
    if (weight && volume) {
      alert(`Diurese: ${result.toFixed(2)} mL/kg/h`);
      setVolume('');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-4 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Diurese</h3>
      
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Horas
          </label>
          <select value={hours} onChange={(e) => setHours(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
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
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">Resultado:</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.toFixed(2)} mL/kg/h</p>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <SaveIcon className="w-4 h-4" />
          Salvar
        </button>
      </div>
    </div>
  );
};

export default DiuresisCalc;
