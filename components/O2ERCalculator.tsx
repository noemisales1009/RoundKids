import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface Props {
  patientId: string;
}

type Modo = 'simplificada' | 'completa';

interface Result {
  o2er: number;
  caO2?: number;
  ccvO2?: number;
  severity: 'reduzida' | 'normal' | 'aumentada' | 'critica';
  label: string;
  interpretacao: string;
}

function interpretar(o2er: number): Pick<Result, 'severity' | 'label' | 'interpretacao'> {
  if (o2er < 25) {
    return {
      severity: 'reduzida',
      label: 'Extração baixa (< 20–24%)',
      interpretacao: 'DO₂ alta, relação profunda ou má extração tecidual / sepse.',
    };
  } else if (o2er <= 30) {
    return {
      severity: 'normal',
      label: 'Normal (25–30%)',
      interpretacao: 'Taxa de extração dentro da faixa esperada.',
    };
  } else if (o2er <= 50) {
    return {
      severity: 'aumentada',
      label: 'Extração aumentada (31–50%)',
      interpretacao: 'DO₂ insuficiente: baixo DC/IC, anemia, hipoxemia ou VO₂ alta.',
    };
  } else {
    return {
      severity: 'critica',
      label: 'Choque grave (> 50%)',
      interpretacao: 'Extração crítica – oferta de O₂ gravemente insuficiente para a demanda tecidual.',
    };
  }
}

const SEVERITY_STYLES: Record<string, string> = {
  reduzida:  'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
  normal:    'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300',
  aumentada: 'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300',
  critica:   'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300',
};

const SEVERITY_BADGE: Record<string, string> = {
  reduzida:  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  normal:    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  aumentada: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  critica:   'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export const O2ERCalculator: React.FC<Props> = ({ patientId }) => {
  const [modo, setModo] = useState<Modo>('simplificada');

  // Simplificada
  const [sao2, setSao2]   = useState('');
  const [scvo2, setScvo2] = useState('');

  // Completa
  const [hb, setHb]         = useState('');
  const [sao2c, setSao2c]   = useState('');
  const [scvo2c, setScvo2c] = useState('');

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  function calcular() {
    setError('');
    setResult(null);

    if (modo === 'simplificada') {
      const sa = parseFloat(sao2);
      const scv = parseFloat(scvo2);
      if (isNaN(sa) || isNaN(scv)) { setError('Preencha SaO₂ e ScvO₂.'); return; }
      if (sa <= 0 || sa > 100 || scv <= 0 || scv > 100) { setError('Valores devem estar entre 0 e 100%.'); return; }
      if (scv >= sa) { setError('ScvO₂ deve ser menor que SaO₂.'); return; }
      const o2er = parseFloat(((sa - scv) / sa * 100).toFixed(1));
      const interp = interpretar(o2er);
      setResult({ o2er, ...interp });
    } else {
      const hbN = parseFloat(hb);
      const sa  = parseFloat(sao2c) / 100;
      const scv = parseFloat(scvo2c) / 100;
      if (isNaN(hbN) || isNaN(sa) || isNaN(scv)) { setError('Preencha todos os campos.'); return; }
      if (hbN <= 0 || sa <= 0 || scv <= 0) { setError('Os valores devem ser positivos.'); return; }
      if (scv >= sa) { setError('ScvO₂ deve ser menor que SaO₂.'); return; }
      const caO2  = parseFloat((1.34 * hbN * sa).toFixed(2));
      const ccvO2 = parseFloat((1.34 * hbN * scv).toFixed(2));
      const o2er  = parseFloat(((caO2 - ccvO2) / caO2 * 100).toFixed(1));
      const interp = interpretar(o2er);
      setResult({ o2er, caO2, ccvO2, ...interp });
    }
    setSaved(false);
  }

  async function salvar() {
    if (!result) return;
    setSaving(true);
    await supabase.from('scale_scores').insert({
      patient_id: patientId,
      scale_name: 'o2er',
      score: Math.round(result.o2er * 10),
      interpretation: `O₂ER = ${result.o2er}% – ${result.label}`,
    });
    setSaving(false);
    setSaved(true);
  }

  function resetar() {
    setSao2(''); setScvo2(''); setHb(''); setSao2c(''); setScvo2c('');
    setResult(null); setError(''); setSaved(false);
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400';

  return (
    <div className="space-y-4 pb-2">
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">6</span>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              O₂ER – Taxa de Extração de O₂
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Normal: 20–30%
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Seletor de modo */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => { setModo('simplificada'); setResult(null); setError(''); }}
              className={`flex-1 py-2 transition-colors ${modo === 'simplificada'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Simplificada (SaO₂ / ScvO₂)
            </button>
            <button
              onClick={() => { setModo('completa'); setResult(null); setError(''); }}
              className={`flex-1 py-2 transition-colors ${modo === 'completa'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Completa (com Hb)
            </button>
          </div>

          {/* Fórmula em destaque */}
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 text-center">
            {modo === 'simplificada'
              ? 'O₂ER = (SaO₂ − ScvO₂) / SaO₂ × 100'
              : 'O₂ER = (CaO₂ − CcvO₂) / CaO₂ × 100   |   CaO₂ = 1,34 × Hb × SaO₂'}
          </div>

          {/* Inputs */}
          {modo === 'simplificada' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">SaO₂ <span className="text-slate-400">(%)</span></label>
                <input type="number" value={sao2} onChange={e => { setSao2(e.target.value); setResult(null); setSaved(false); }}
                  placeholder="ex: 98" step="0.1" min="0" max="100" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">ScvO₂ <span className="text-slate-400">(%)</span></label>
                <input type="number" value={scvo2} onChange={e => { setScvo2(e.target.value); setResult(null); setSaved(false); }}
                  placeholder="ex: 70" step="0.1" min="0" max="100" className={inputClass} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Hb <span className="text-slate-400">(g/dL)</span></label>
                <input type="number" value={hb} onChange={e => { setHb(e.target.value); setResult(null); setSaved(false); }}
                  placeholder="ex: 12" step="0.1" min="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">SaO₂ <span className="text-slate-400">(%)</span></label>
                <input type="number" value={sao2c} onChange={e => { setSao2c(e.target.value); setResult(null); setSaved(false); }}
                  placeholder="ex: 98" step="0.1" min="0" max="100" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">ScvO₂ <span className="text-slate-400">(%)</span></label>
                <input type="number" value={scvo2c} onChange={e => { setScvo2c(e.target.value); setResult(null); setSaved(false); }}
                  placeholder="ex: 70" step="0.1" min="0" max="100" className={inputClass} />
              </div>
            </div>
          )}

          <button
            onClick={calcular}
            className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
          >
            Calcular O₂ER →
          </button>

          {error && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className={`rounded-lg border px-4 py-3 text-sm space-y-2 ${SEVERITY_STYLES[result.severity]}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-base">O₂ER = {result.o2er}%</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SEVERITY_BADGE[result.severity]}`}>
                  {result.label}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{result.interpretacao}</p>
              {result.caO2 !== undefined && (
                <div className="grid grid-cols-2 gap-x-4 text-xs opacity-80 border-t border-current/20 pt-2">
                  <p>CaO₂ = <strong>{result.caO2} mL/dL</strong></p>
                  <p>CcvO₂ = <strong>{result.ccvO2} mL/dL</strong></p>
                </div>
              )}
              <div className="text-xs opacity-70 space-y-0.5 border-t border-current/20 pt-2">
                <p>&lt; 20–24% → extração baixa (DO₂ alta, má extração / sepse)</p>
                <p>25–30% → normal</p>
                <p>31–50% → extração aumentada (DO₂ insuficiente, baixo DC/IC, anemia, hipoxemia ou VO₂ alta)</p>
                <p>&gt; 50% → choque grave</p>
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
                : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60'
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

export default O2ERCalculator;
