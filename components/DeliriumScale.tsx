import React, { useState } from 'react';

interface ScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string }) => void;
}

export const DeliriumScale: React.FC<ScaleProps> = ({ onSaveScore }) => {
  const [score, setScore] = useState(0);

  const handleSave = () => {
    onSaveScore({ scaleName: 'Delirium', score, interpretation: 'Avaliado' });
  };

  return (
    <div className="space-y-4 bg-slate-900 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-slate-100">Escala CAM-ICU Pediátrico</h3>
      <div className="space-y-2">
        <label className="block text-slate-200">Pontuação:</label>
        <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg" />
      </div>
      <button onClick={handleSave} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Salvar</button>
    </div>
  );
};
