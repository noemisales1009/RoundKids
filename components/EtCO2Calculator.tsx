import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface Props {
  patientId: string;
}

interface Result {
  gradiente: number;
  severity: 'normal' | 'moderate' | 'severe';
  label: string;
  causes: string[];
}

function interpretar(gradiente: number): Result {
  if (gradiente <= 5) {
    return {
      gradiente,
      severity: 'normal',
      label: 'Normal',
      causes: [],
    };
  } else if (gradiente <= 10) {
    return {
      gradiente,
      severity: 'moderate',
      label: 'Gradiente elevado (6–10 mmHg)',
      causes: ['Pneumonia', 'Atelectasia', 'SDRA inicial', 'Hipotensão', 'Choque compensado'],
    };
  } else {
    return {
      gradiente,
      severity: 'severe',
      label: 'Gradiente muito elevado (> 10 mmHg)',
      causes: [
        'Choque séptico grave',
        'Choque cardiogênico',
        'Hipovolemia grave',
        'Embolia pulmonar',
        'SDRA grave',
        'Baixo débito cardíaco',
      ],
    };
  }
}

const SEVERITY_STYLES: Record<string, string> = {
  normal:
    'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300',
  moderate:
    'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
  severe:
    'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300',
};

const SEVERITY_BADGE: Record<string, string> = {
  normal: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  severe: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export const EtCO2Calculator: React.FC<Props> = ({ patientId }) => {
  const [paco2, setPaco2] = useState('');
  const [etco2, setEtco2] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function calcular() {
    const pa = parseFloat(paco2);
    const et = parseFloat(etco2);

    if (isNaN(pa) || isNaN(et)) {
      setError('Preencha os dois campos.');
      setResult(null);
      return;
    }
    if (pa <= 0 || et <= 0) {
      setError('Os valores devem ser positivos.');
      setResult(null);
      return;
    }

    setError('');
    const gradiente = parseFloat((pa - et).toFixed(1));
    setResult(interpretar(gradiente));
    setSaved(false);
  }

  async function salvar() {
    if (!result) return;
    setSaving(true);

    await supabase.from('scale_scores').insert({
      patient_id: patientId,
      scale_name: 'etco2_gradiente',
      score: Math.round(result.gradiente * 10),
      interpretation: `Gradiente PaCO₂-ETCO₂ = ${result.gradiente} mmHg – ${result.label}`,
    });

    setSaving(false);
    setSaved(true);
  }

  function resetar() {
    setPaco2('');
    setEtco2('');
    setResult(null);
    setError('');
    setSaved(false);
  }

  return (
    <div className="space-y-4 pb-2">
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              ETCO₂ – Gradiente PaCO₂ − ETCO₂
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              GRADIENTE = PaCO₂ − ETCO₂ &nbsp;|&nbsp; Normal: 2–5 mmHg
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-teal-500 dark:focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                ETCO₂ <span className="text-slate-400">(expirado, mmHg)</span>
              </label>
              <input
                type="number"
                value={etco2}
                onChange={e => { setEtco2(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 35"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-teal-500 dark:focus:border-teal-400"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
          >
            Calcular Gradiente →
          </button>

          {error && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className={`rounded-lg border px-4 py-3 text-sm space-y-3 ${SEVERITY_STYLES[result.severity]}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-base">
                  Gradiente = {result.gradiente} mmHg
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SEVERITY_BADGE[result.severity]}`}>
                  {result.label}
                </span>
              </div>

              {result.causes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-1 opacity-80">Causas prováveis:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.causes.map(cause => (
                      <span
                        key={cause}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          result.severity === 'moderate'
                            ? 'border-amber-300 dark:border-amber-600 bg-amber-100/60 dark:bg-amber-900/20'
                            : 'border-red-300 dark:border-red-600 bg-red-100/60 dark:bg-red-900/20'
                        }`}
                      >
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs opacity-75 space-y-0.5 border-t border-current/20 pt-2">
                <p>2–5 mmHg → normal</p>
                <p>6–10 mmHg → pneumonia, atelectasia, SDRA inicial, hipotensão, choque compensado</p>
                <p>&gt; 10 mmHg → choque séptico/cardiogênico, hipovolemia grave, embolia pulmonar, SDRA grave</p>
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
                : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60'
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

export default EtCO2Calculator;
