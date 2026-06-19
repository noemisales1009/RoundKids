import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface Props {
  patientId: string;
}

interface Result {
  deltaPCO2: number;
  caO2: number;
  ccvO2: number;
  cavO2: number;
  relacao: number;
  severity: 'aerobico' | 'inicio_anaerobico' | 'hipoperfusao' | 'anaerobico_forte';
  label: string;
}

function interpretar(relacao: number): Result['severity'] {
  if (relacao < 1.4) return 'aerobico';
  if (relacao <= 1.8) return 'inicio_anaerobico';
  if (relacao <= 2) return 'hipoperfusao';
  return 'anaerobico_forte';
}

const SEVERITY_STYLES: Record<string, string> = {
  aerobico:          'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300',
  inicio_anaerobico: 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
  hipoperfusao:      'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300',
  anaerobico_forte:  'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300',
};

const SEVERITY_BADGE: Record<string, string> = {
  aerobico:          'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  inicio_anaerobico: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  hipoperfusao:      'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  anaerobico_forte:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const SEVERITY_LABEL: Record<string, string> = {
  aerobico:          'Metabolismo aeróbico',
  inicio_anaerobico: 'Início de metabolismo anaeróbico',
  hipoperfusao:      'Hipoperfusão significativa',
  anaerobico_forte:  'Forte evidência de metabolismo anaeróbico',
};

export const IndiceAPDCalculator: React.FC<Props> = ({ patientId }) => {
  const [pcvco2, setPcvco2] = useState('');
  const [paco2, setPaco2]   = useState('');
  const [hb, setHb]         = useState('');
  const [sao2, setSao2]     = useState('');
  const [scvo2, setScvo2]   = useState('');

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  function calcular() {
    const pcv = parseFloat(pcvco2);
    const pa  = parseFloat(paco2);
    const hbN = parseFloat(hb);
    const sa  = parseFloat(sao2) / 100;
    const scv = parseFloat(scvo2) / 100;

    if ([pcv, pa, hbN, sa, scv].some(isNaN)) {
      setError('Preencha todos os campos.');
      setResult(null);
      return;
    }
    if (sa <= 0 || scv <= 0 || hbN <= 0) {
      setError('Os valores devem ser positivos.');
      setResult(null);
      return;
    }

    const deltaPCO2 = parseFloat((pcv - pa).toFixed(2));
    const caO2      = parseFloat((1.34 * hbN * sa).toFixed(2));
    const ccvO2     = parseFloat((1.34 * hbN * scv).toFixed(2));
    const cavO2     = parseFloat((caO2 - ccvO2).toFixed(2));

    if (cavO2 <= 0) {
      setError('C(a-v)O₂ deve ser positivo. Verifique SaO₂ e ScvO₂.');
      setResult(null);
      return;
    }

    const relacao  = parseFloat((deltaPCO2 / cavO2).toFixed(2));
    const severity = interpretar(relacao);

    setError('');
    setResult({ deltaPCO2, caO2, ccvO2, cavO2, relacao, severity, label: SEVERITY_LABEL[severity] });
    setSaved(false);
  }

  async function salvar() {
    if (!result) return;
    setSaving(true);
    await supabase.from('scale_scores').insert({
      patient_id: patientId,
      scale_name: 'indice_apd',
      score: Math.round(result.relacao * 100),
      interpretation: `ΔCO₂/ΔO₂ = ${result.relacao} – ${result.label}`,
    });
    setSaving(false);
    setSaved(true);
  }

  function resetar() {
    setPcvco2(''); setPaco2(''); setHb(''); setSao2(''); setScvo2('');
    setResult(null); setError(''); setSaved(false);
  }

  return (
    <div className="space-y-4 pb-2">
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Índice AP/D – ΔCO₂/ΔO₂
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ΔPCO₂ / C(a−v)O₂ &nbsp;|&nbsp; CaO₂ = 1,34 × Hb × SaO₂ &nbsp;|&nbsp; CcvO₂ = 1,34 × Hb × ScvO₂
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Row 1: CO2 values */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                PcvCO₂ <span className="text-slate-400">(venoso, mmHg)</span>
              </label>
              <input
                type="number" value={pcvco2}
                onChange={e => { setPcvco2(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 50" step="0.1" min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                PaCO₂ <span className="text-slate-400">(arterial, mmHg)</span>
              </label>
              <input
                type="number" value={paco2}
                onChange={e => { setPaco2(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 40" step="0.1" min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>
          </div>

          {/* Row 2: Hb + saturations */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Hb <span className="text-slate-400">(g/dL)</span>
              </label>
              <input
                type="number" value={hb}
                onChange={e => { setHb(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 12" step="0.1" min="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                SaO₂ <span className="text-slate-400">(%)</span>
              </label>
              <input
                type="number" value={sao2}
                onChange={e => { setSao2(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 98" step="0.1" min="0" max="100"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                ScvO₂ <span className="text-slate-400">(%)</span>
              </label>
              <input
                type="number" value={scvo2}
                onChange={e => { setScvo2(e.target.value); setResult(null); setSaved(false); }}
                placeholder="ex: 70" step="0.1" min="0" max="100"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
          >
            Calcular Índice AP/D →
          </button>

          {error && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className={`rounded-lg border px-4 py-3 text-sm space-y-3 ${SEVERITY_STYLES[result.severity]}`}>
              {/* Resultado principal */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-base">
                  ΔCO₂/ΔO₂ = {result.relacao}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SEVERITY_BADGE[result.severity]}`}>
                  {result.label}
                </span>
              </div>

              {/* Cálculos intermediários */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-80 border-t border-current/20 pt-2">
                <p>ΔPCO₂ = <strong>{result.deltaPCO2} mmHg</strong></p>
                <p>C(a−v)O₂ = <strong>{result.cavO2} mL/dL</strong></p>
                <p>CaO₂ = <strong>{result.caO2} mL/dL</strong></p>
                <p>CcvO₂ = <strong>{result.ccvO2} mL/dL</strong></p>
              </div>

              {/* Referência */}
              <div className="text-xs opacity-75 space-y-0.5 border-t border-current/20 pt-2">
                <p>&lt; 1,4 → metabolismo aeróbico</p>
                <p>1,4–1,8 → início de metabolismo anaeróbico</p>
                <p>1,8–2 → hipoperfusão significativa</p>
                <p>&gt; 2 → forte evidência de metabolismo anaeróbico</p>
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
                : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60'
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

export default IndiceAPDCalculator;
