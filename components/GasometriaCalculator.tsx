import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const H_TABLE: Record<number, number> = {
  6.80:158,6.81:155,6.82:151,6.83:148,6.84:145,6.85:141,6.86:138,6.87:135,6.88:132,6.89:129,
  6.90:126,6.91:123,6.92:120,6.93:117,6.94:115,6.95:112,6.96:110,6.97:107,6.98:105,6.99:102,
  7.00:100,7.01:98,7.02:95,7.03:93,7.04:91,7.05:89,7.06:87,7.07:85,7.08:83,7.09:81,
  7.10:79,7.11:78,7.12:76,7.13:74,7.14:72,7.15:71,7.16:69,7.17:68,7.18:66,7.19:65,
  7.20:63,7.21:62,7.22:60,7.23:59,7.24:58,7.25:56,7.26:55,7.27:54,7.28:52,7.29:51,
  7.30:50,7.31:49,7.32:48,7.33:47,7.34:46,7.35:45,7.36:44,7.37:43,7.38:42,7.39:41,
  7.40:40,7.41:39,7.42:38,7.43:37,7.44:36,7.45:35,7.46:35,7.47:34,7.48:33,7.49:32,
  7.50:32,7.51:31,7.52:30,7.53:30,7.54:29,7.55:28,7.56:28,7.57:27,7.58:26,7.59:26,
  7.60:25,7.61:25,7.62:24,7.63:23,7.64:23,7.65:22,7.66:22,7.67:21,7.68:21,7.69:20,
  7.70:20,7.71:19,7.72:19,7.73:19,7.74:18,7.75:18,7.76:17,7.77:17,7.78:17,7.79:16,7.80:16,
};

function getHplus(ph: number): number | null {
  const key = Math.round(ph * 100) / 100;
  return H_TABLE[key] ?? null;
}

interface ValidationResult {
  valid: boolean;
  hCalc: number;
  hTabela: number;
  diff: number;
}

interface DisturbioResult {
  tendenciaPh: string;
  metabolico: string;
  respiratorio: string;
  tags: { label: string; color: string }[];
}

type Step = 'form' | 'disturbio' | 'resp';

interface Props {
  patientId: string;
}

const TAG_COLORS: Record<string, string> = {
  acid: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  alc: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  meta: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  resp: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  norm: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  misto: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
};

export const GasometriaCalculator: React.FC<Props> = ({ patientId }) => {
  const [ph, setPh] = useState('');
  const [paco2, setPaco2] = useState('');
  const [hco3, setHco3] = useState('');

  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validError, setValidError] = useState('');

  const [disturbio, setDisturbio] = useState<DisturbioResult | null>(null);
  const [respResult, setRespResult] = useState('');

  const [step, setStep] = useState<Step>('form');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function validar() {
    const phN = parseFloat(ph);
    const paco2N = parseFloat(paco2);
    const hco3N = parseFloat(hco3);

    if (isNaN(phN) || isNaN(paco2N) || isNaN(hco3N)) {
      setValidError('Preencha todos os campos.');
      setValidation(null);
      return;
    }

    const hTabela = getHplus(phN);
    if (!hTabela) {
      setValidError('pH fora do intervalo da tabela (6,80 – 7,80).');
      setValidation(null);
      return;
    }

    setValidError('');
    const hCalc = parseFloat((24 * paco2N / hco3N).toFixed(1));
    const diff = Math.abs(hCalc - hTabela);
    const result: ValidationResult = { valid: diff <= 5, hCalc, hTabela, diff };
    setValidation(result);
    setDisturbio(null);
    setRespResult('');
    setSaved(false);

    if (result.valid) setStep('disturbio');
    else setStep('form');
  }

  function definirDisturbio() {
    const phN = parseFloat(ph);
    const paco2N = parseFloat(paco2);
    const hco3N = parseFloat(hco3);
    const tags: { label: string; color: string }[] = [];

    let tendenciaPh = 'normal';
    if (phN < 7.35) { tendenciaPh = 'acidose'; tags.push({ label: 'Acidemia', color: TAG_COLORS.acid }); }
    else if (phN > 7.45) { tendenciaPh = 'alcalose'; tags.push({ label: 'Alcalemia', color: TAG_COLORS.alc }); }
    else if (Math.abs(phN - 7.4) < 0.001) { tendenciaPh = 'misto'; tags.push({ label: 'Misto / normal', color: TAG_COLORS.misto }); }
    else { tags.push({ label: 'pH normal', color: TAG_COLORS.norm }); }

    let metabolico = 'normal';
    if (hco3N < 22) { metabolico = 'acidose_metabolica'; tags.push({ label: 'Acidose metabólica', color: TAG_COLORS.meta }); }
    else if (hco3N > 26) { metabolico = 'alcalose_metabolica'; tags.push({ label: 'Alcalose metabólica', color: TAG_COLORS.meta }); }
    else { tags.push({ label: 'HCO₃⁻ normal', color: TAG_COLORS.norm }); }

    let respiratorio = 'normal';
    if (paco2N > 45) { respiratorio = 'acidose_respiratoria'; tags.push({ label: 'Acidose respiratória', color: TAG_COLORS.resp }); }
    else if (paco2N < 35) { respiratorio = 'alcalose_respiratoria'; tags.push({ label: 'Alcalose respiratória', color: TAG_COLORS.resp }); }
    else { tags.push({ label: 'PaCO₂ normal', color: TAG_COLORS.norm }); }

    setDisturbio({ tendenciaPh, metabolico, respiratorio, tags });
    setRespResult('');
    setStep('resp');
  }

  function classificarResp() {
    const paco2N = parseFloat(paco2);
    const hasResp = paco2N > 45 || paco2N < 35;
    if (!hasResp) {
      setRespResult('normal');
    } else {
      setRespResult(paco2N > 45 ? 'acidose_respiratoria' : 'alcalose_respiratoria');
    }
  }

  async function salvar() {
    if (!validation?.valid || !disturbio) return;
    setSaving(true);
    const phN = parseFloat(ph);
    const paco2N = parseFloat(paco2);
    const hco3N = parseFloat(hco3);

    await supabase.from('gasometrias').insert({
      paciente_id: patientId,
      ph: phN,
      paco2: paco2N,
      hco3: hco3N,
      h_calculado: validation.hCalc,
      h_tabela: validation.hTabela,
      gasometria_valida: true,
      tendencia_ph: disturbio.tendenciaPh,
      disturbio_metabolico: disturbio.metabolico,
      disturbio_respiratorio: disturbio.respiratorio,
      tipo_respiratorio: respResult === 'normal' ? 'nao_aplicavel' : (respResult ? null : 'nao_aplicavel'),
    });

    setSaving(false);
    setSaved(true);
  }

  function resetar() {
    setPh(''); setPaco2(''); setHco3('');
    setValidation(null); setValidError('');
    setDisturbio(null); setRespResult('');
    setStep('form'); setSaved(false);
  }

  const phN = parseFloat(ph);
  const paco2N = parseFloat(paco2);
  const hco3N = parseFloat(hco3);
  const hasResp = !isNaN(paco2N) && (paco2N > 45 || paco2N < 35);

  return (
    <div className="space-y-4 pb-6">

      {/* Step 1 – Inputs */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Inserir valores da gasometria</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'pH', value: ph, set: setPh, placeholder: 'ex: 7.35', step: '0.01', min: '6.8', max: '7.8' },
              { label: 'PaCO₂ (mmHg)', value: paco2, set: setPaco2, placeholder: 'ex: 40', step: '0.1' },
              { label: 'HCO₃⁻ (mEq/L)', value: hco3, set: setHco3, placeholder: 'ex: 24', step: '0.1' },
            ].map(({ label, value, set, placeholder, step, min, max }) => (
              <div key={label}>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={e => { set(e.target.value); setValidation(null); setDisturbio(null); setRespResult(''); setSaved(false); }}
                  placeholder={placeholder}
                  step={step}
                  min={min}
                  max={max}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                />
              </div>
            ))}
          </div>

          <button
            onClick={validar}
            className="w-full py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-colors"
          >
            Validar gasometria →
          </button>

          {validError && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm">
              {validError}
            </div>
          )}

          {validation && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${validation.valid
              ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'}`}>
              <p className={`font-semibold mb-1 ${validation.valid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {validation.valid ? '✓ Gasometria válida' : '✗ Gasometria não válida'}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                [H⁺] calculado: <strong>{validation.hCalc}</strong> nEq/L &nbsp;|&nbsp;
                [H⁺] esperado (pH {parseFloat(ph).toFixed(2)}): <strong>{validation.hTabela}</strong> nEq/L &nbsp;|&nbsp;
                Diferença: <strong>{validation.diff.toFixed(1)}</strong> nEq/L
                {!validation.valid && ' – valores inconsistentes, revisar coleta.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 2 – Distúrbio primário */}
      <div className={`bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-opacity ${!validation?.valid ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="w-6 h-6 rounded-full bg-slate-400 dark:bg-slate-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Definir distúrbio primário</span>
        </div>
        <div className="p-4 space-y-3">
          <button
            onClick={definirDisturbio}
            disabled={!validation?.valid}
            className="w-full py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Identificar distúrbio →
          </button>

          {disturbio && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                pH: <strong>{phN.toFixed(2)}</strong> &nbsp;|&nbsp;
                HCO₃⁻: <strong>{hco3N.toFixed(1)}</strong> mEq/L &nbsp;|&nbsp;
                PaCO₂: <strong>{paco2N.toFixed(1)}</strong> mmHg
              </p>
              <div className="flex flex-wrap gap-2">
                {disturbio.tags.map((t, i) => (
                  <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.color}`}>{t.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3 – Distúrbio respiratório */}
      <div className={`bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-opacity ${!disturbio ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="w-6 h-6 rounded-full bg-slate-400 dark:bg-slate-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Classificação do distúrbio respiratório</span>
        </div>
        <div className="p-4 space-y-3">
          <button
            onClick={classificarResp}
            disabled={!disturbio}
            className="w-full py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Classificar distúrbio respiratório →
          </button>

          {respResult !== '' && (
            <div className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${respResult === 'normal'
              ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              : 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-700 text-primary-800 dark:text-primary-300'}`}>
              {respResult === 'normal' ? (
                <>
                  <p className="font-semibold mb-1">Sem distúrbio respiratório primário</p>
                  <p className="text-xs">PaCO₂ dentro da faixa normal (35–45 mmHg). Avalie compensação e contexto clínico.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold mb-1">
                    {respResult === 'acidose_respiratoria' ? 'Acidose respiratória' : 'Alcalose respiratória'} – verificar agudo ou crônico
                  </p>
                  <p className="text-xs">
                    • Distúrbio <strong>AGUDO</strong>: HCO₃ standard e BE dentro do normal (compensação renal ainda não ocorreu){'\n'}
                    • Distúrbio <strong>CRÔNICO</strong>: HCO₃ standard e BE alterados (compensação renal já presente)
                  </p>
                  <p className="text-xs mt-1 opacity-75">Integre com o quadro clínico e tempo de instalação.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ações finais */}
      {validation?.valid && disturbio && (
        <div className="flex gap-3">
          <button
            onClick={salvar}
            disabled={saving || saved}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${saved
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 cursor-default'
              : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60'}`}
          >
            {saved ? '✓ Gravado no prontuário' : saving ? 'Gravando...' : 'Gravar no prontuário'}
          </button>
          <button
            onClick={resetar}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Nova gasometria
          </button>
        </div>
      )}
    </div>
  );
};

export default GasometriaCalculator;
