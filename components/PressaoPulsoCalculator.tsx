import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface Props {
  patientId: string;
}

interface Result {
  pp: number;
  ppNormal: number;
  severity: 'normal' | 'estreita' | 'ampla';
  label: string;
  interpretacao: string;
}

function interpretar(pp: number, ppNormal: number): Pick<Result, 'severity' | 'label' | 'interpretacao'> {
  if (pp < ppNormal) {
    return {
      severity: 'estreita',
      label: 'PP Estreita / Convergente',
      interpretacao:
        'PP encontrada < PP normal. Sugere baixo débito cardíaco, tamponamento, estenose aórtica ou hipovolemia.',
    };
  } else if (pp > ppNormal) {
    return {
      severity: 'ampla',
      label: 'PP Ampla / Divergente',
      interpretacao:
        'PP encontrada > PP normal. Sugere insuficiência aórtica, hipertireoidismo, anemia grave, febre ou fístula arteriovenosa.',
    };
  } else {
    return {
      severity: 'normal',
      label: 'PP Normal',
      interpretacao: 'Pressão de pulso dentro da faixa esperada (≈ ½ PAS).',
    };
  }
}

const SEVERITY_STYLES: Record<string, string> = {
  estreita: 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
  normal:   'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300',
  ampla:    'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300',
};

const SEVERITY_BADGE: Record<string, string> = {
  estreita: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  normal:   'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  ampla:    'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

export const PressaoPulsoCalculator: React.FC<Props> = ({ patientId }) => {
  const [pas, setPas] = useState('');
  const [pad, setPad] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  function calcular() {
    const pasN = parseFloat(pas);
    const padN = parseFloat(pad);

    if (isNaN(pasN) || isNaN(padN)) {
      setError('Preencha PAS e PAD.');
      setResult(null);
      return;
    }
    if (pasN <= 0 || padN <= 0) {
      setError('Os valores devem ser positivos.');
      setResult(null);
      return;
    }
    if (padN >= pasN) {
      setError('PAD deve ser menor que PAS.');
      setResult(null);
      return;
    }

    const pp       = parseFloat((pasN - padN).toFixed(1));
    const ppNormal = parseFloat((pasN / 2).toFixed(1));
    const interp   = interpretar(pp, ppNormal);

    setError('');
    setResult({ pp, ppNormal, ...interp });
    setSaved(false);
  }

  async function salvar() {
    if (!result) return;
    setSaving(true);
    await supabase.from('scale_scores').insert({
      patient_id: patientId,
      scale_name: 'pressao_pulso',
      score: Math.round(result.pp * 10),
      interpretation: `PP = ${result.pp} mmHg (normal: ${result.ppNormal} mmHg) – ${result.label}`,
    });
    setSaving(false);
    setSaved(true);
  }

  function resetar() {
    setPas(''); setPad('');
    setResult(null); setError(''); setSaved(false);
  }

  return (
    <div className="space-y-4 pb-2">
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="w-6 h-6 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">♥</span>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Pressão de Pulso (PP)
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              PP = PAS − PAD &nbsp;|&nbsp; PP normal ≈ ½ PAS
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                PAS <span className="text-slate-400">(sistólica, mmHg)</span>
              </label>
              <input
                type="number" value={pas}
                onChange={e => { setPas(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 120" step="1" min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-pink-500 dark:focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                PAD <span className="text-slate-400">(diastólica, mmHg)</span>
              </label>
              <input
                type="number" value={pad}
                onChange={e => { setPad(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 80" step="1" min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-pink-500 dark:focus:border-pink-400"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            className="w-full py-2.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition-colors"
          >
            Calcular PP →
          </button>

          {error && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className={`rounded-lg border px-4 py-3 text-sm space-y-2 ${SEVERITY_STYLES[result.severity]}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-base">PP = {result.pp} mmHg</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SEVERITY_BADGE[result.severity]}`}>
                  {result.label}
                </span>
              </div>
              <p className="text-xs opacity-80">
                PP normal esperada (½ PAS): <strong>{result.ppNormal} mmHg</strong>
              </p>
              <p className="text-xs leading-relaxed opacity-90">{result.interpretacao}</p>
              <div className="text-xs opacity-70 space-y-0.5 border-t border-current/20 pt-2">
                <p>PP normal = ½ PAS</p>
                <p>PP estreita/convergente → PP encontrada &lt; PP normal</p>
                <p>PP ampla/divergente → PP encontrada &gt; PP normal</p>
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
                : 'bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-60'
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

export default PressaoPulsoCalculator;
