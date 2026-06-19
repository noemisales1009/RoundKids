import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface Props {
  patientId: string;
}

interface Result {
  valor: number;
  severity: 'normal' | 'moderate' | 'low' | 'critical';
  label: string;
}

function interpretar(valor: number): Result {
  if (valor > 35) {
    return { valor, severity: 'normal', label: 'Perfusão preservada' };
  } else if (valor >= 20) {
    return { valor, severity: 'moderate', label: 'Hipoperfusão moderada' };
  } else if (valor >= 15) {
    return { valor, severity: 'low', label: 'Baixo débito' };
  } else {
    return { valor, severity: 'critical', label: 'Hipoperfusão grave' };
  }
}

const SEVERITY_STYLES: Record<string, string> = {
  normal:   'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300',
  moderate: 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
  low:      'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300',
  critical: 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300',
};

const SEVERITY_BADGE: Record<string, string> = {
  normal:   'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  low:      'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export const EtCO2DirectCalculator: React.FC<Props> = ({ patientId }) => {
  const [etco2, setEtco2] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function calcular() {
    const val = parseFloat(etco2);
    if (isNaN(val)) {
      setError('Preencha o valor de ETCO₂.');
      setResult(null);
      return;
    }
    if (val <= 0) {
      setError('O valor deve ser positivo.');
      setResult(null);
      return;
    }
    setError('');
    setResult(interpretar(val));
    setSaved(false);
  }

  async function salvar() {
    if (!result) return;
    setSaving(true);
    await supabase.from('scale_scores').insert({
      patient_id: patientId,
      scale_name: 'etco2_direto',
      score: Math.round(result.valor * 10),
      interpretation: `ETCO₂ = ${result.valor} mmHg – ${result.label}`,
    });
    setSaving(false);
    setSaved(true);
  }

  function resetar() {
    setEtco2('');
    setResult(null);
    setError('');
    setSaved(false);
  }

  return (
    <div className="space-y-4 pb-2">
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              ETCO₂ – Valor direto
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              End-Tidal CO₂ &nbsp;|&nbsp; Normal: 35–45 mmHg
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              ETCO₂ <span className="text-slate-400">(mmHg)</span>
            </label>
            <input
              type="number"
              value={etco2}
              onChange={e => { setEtco2(e.target.value); setResult(null); setSaved(false); }}
              placeholder="ex: 38"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
            />
          </div>

          <button
            onClick={calcular}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
          >
            Interpretar ETCO₂ →
          </button>

          {error && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className={`rounded-lg border px-4 py-3 text-sm space-y-2 ${SEVERITY_STYLES[result.severity]}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-base">ETCO₂ = {result.valor} mmHg</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SEVERITY_BADGE[result.severity]}`}>
                  {result.label}
                </span>
              </div>
              <div className="text-xs opacity-75 space-y-0.5 border-t border-current/20 pt-2">
                <p>&gt; 35 mmHg → perfusão preservada</p>
                <p>20–30 mmHg → hipoperfusão moderada</p>
                <p>&lt; 20 mmHg → baixo débito</p>
                <p>&lt; 15 mmHg → hipoperfusão grave</p>
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
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60'
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

export default EtCO2DirectCalculator;
