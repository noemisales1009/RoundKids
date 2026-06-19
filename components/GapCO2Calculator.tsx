import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface Props {
  patientId: string;
}

interface Result {
  delta: number;
  label: string;
  severity: 'normal' | 'warning' | 'danger' | 'critical';
}

function interpretar(delta: number): Result {
  if (delta <= 6) {
    return { delta, label: 'Normal – perfusão adequada', severity: 'normal' };
  } else if (delta <= 8) {
    return { delta, label: 'Fluxo inadequado', severity: 'warning' };
  } else if (delta <= 10) {
    return { delta, label: 'Hipoperfusão importante', severity: 'danger' };
  } else {
    return { delta, label: 'Baixo débito cardíaco', severity: 'critical' };
  }
}

const SEVERITY_STYLES: Record<string, string> = {
  normal: 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300',
  warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
  danger: 'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300',
  critical: 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300',
};

const SEVERITY_BADGE: Record<string, string> = {
  normal: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export const GapCO2Calculator: React.FC<Props> = ({ patientId }) => {
  const [pcvco2, setPcvco2] = useState('');
  const [paco2, setPaco2] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function calcular() {
    const pcv = parseFloat(pcvco2);
    const pa = parseFloat(paco2);

    if (isNaN(pcv) || isNaN(pa)) {
      setError('Preencha os dois campos.');
      setResult(null);
      return;
    }
    if (pcv <= 0 || pa <= 0) {
      setError('Os valores devem ser positivos.');
      setResult(null);
      return;
    }

    setError('');
    const delta = parseFloat((pcv - pa).toFixed(1));
    setResult(interpretar(delta));
    setSaved(false);
  }

  async function salvar() {
    if (!result) return;
    setSaving(true);

    await supabase.from('scale_scores').insert({
      patient_id: patientId,
      scale_name: 'gap_co2',
      score: Math.round(result.delta * 10),
      interpretation: `ΔPCO₂ = ${result.delta} mmHg – ${result.label}`,
    });

    setSaving(false);
    setSaved(true);
  }

  function resetar() {
    setPcvco2('');
    setPaco2('');
    setResult(null);
    setError('');
    setSaved(false);
  }

  return (
    <div className="space-y-4 pb-2">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">♥</span>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Avaliação Hemodinâmica – GAP de CO₂
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ΔPCO₂ = PcvCO₂ − PaCO₂ &nbsp;|&nbsp; Normal: 4–5 mmHg
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                PcvCO₂ <span className="text-slate-400">(venoso, mmHg)</span>
              </label>
              <input
                type="number"
                value={pcvco2}
                onChange={e => { setPcvco2(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 50"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-rose-500 dark:focus:border-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                PaCO₂ <span className="text-slate-400">(arterial, mmHg)</span>
              </label>
              <input
                type="number"
                value={paco2}
                onChange={e => { setPaco2(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 40"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-rose-500 dark:focus:border-rose-400"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
          >
            Calcular GAP de CO₂ →
          </button>

          {error && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className={`rounded-lg border px-4 py-3 text-sm space-y-2 ${SEVERITY_STYLES[result.severity]}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-base">
                  ΔPCO₂ = {result.delta} mmHg
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SEVERITY_BADGE[result.severity]}`}>
                  {result.label}
                </span>
              </div>
              <div className="text-xs opacity-80 space-y-0.5">
                <p>≤ 6 mmHg → normal</p>
                <p>&gt; 6 mmHg → fluxo inadequado</p>
                <p>&gt; 8 mmHg → hipoperfusão importante</p>
                <p>&gt; 10 mmHg → baixo débito cardíaco</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="flex gap-3">
          <button
            onClick={salvar}
            disabled={saving || saved}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              saved
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 cursor-default'
                : 'bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-60'
            }`}
          >
            {saved ? '✓ Gravado no prontuário' : saving ? 'Gravando...' : 'Gravar no prontuário'}
          </button>
          <button
            onClick={resetar}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Novo cálculo
          </button>
        </div>
      )}
    </div>
  );
};

export default GapCO2Calculator;
