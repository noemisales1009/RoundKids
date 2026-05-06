import React, { useState, useMemo } from 'react';
import { classificarPA, type ClassificacaoPAResult, type Sexo, idadeParaLabel } from '../services/paPercentis';
import { HeartPulseIcon } from './icons';

interface PAPercentisCardProps {
  sexo: string;
  dob: string;
}

function computeIdadeLabel(dob: string): string {
  const birth = new Date(dob);
  const today = new Date();

  let anos = today.getFullYear() - birth.getFullYear();
  let meses = today.getMonth() - birth.getMonth();
  let dias = today.getDate() - birth.getDate();

  if (dias < 0) {
    meses--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    dias += prevMonth.getDate();
  }
  if (meses < 0) { anos--; meses += 12; }

  return idadeParaLabel(anos, meses, dias);
}

function classBadge(classe: string): string {
  if (classe === 'abaixo_p5') return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
  if (classe === 'acima_p95') return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
  return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
}

function classeTexto(classe: string): string {
  if (classe === 'abaixo_p5') return 'Abaixo do P5 ↓';
  if (classe === 'acima_p95') return 'Acima do P95 ↑';
  return 'Normal ✓';
}

type PARow = [string, number | string];

export const PAPercentisCard: React.FC<PAPercentisCardProps> = ({ sexo, dob }) => {
  const idadeLabel = useMemo(() => computeIdadeLabel(dob), [dob]);
  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [resultado, setResultado] = useState<ClassificacaoPAResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const semSexo = !sexo || sexo === 'Não informado';

  const handleClassificar = async () => {
    const sist = parseInt(sistolica);
    const diast = parseInt(diastolica);
    if (isNaN(sist) || sist <= 0 || isNaN(diast) || diast <= 0) {
      setErro('Preencha valores válidos para sistólica e diastólica.');
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const res = await classificarPA(sexo.toLowerCase() as Sexo, idadeLabel, sist, diast);
      if (!res) throw new Error('Sem dados de referência para esta faixa etária/sexo.');
      setResultado(res);
    } catch (e: any) {
      setErro(e.message || 'Erro ao classificar PA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 flex gap-6 text-sm">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Sexo</p>
          <p className={`font-semibold ${semSexo ? 'text-amber-500 italic' : 'text-slate-700 dark:text-slate-200'}`}>
            {sexo || 'Não informado'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Faixa etária</p>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{idadeLabel}</p>
        </div>
      </div>

      {semSexo && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Informe o sexo do paciente (editar dados) para classificar a PA por percentis.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            PA Sistólica (mmHg)
          </label>
          <input
            type="number"
            min="0"
            value={sistolica}
            onChange={e => { setSistolica(e.target.value); setResultado(null); }}
            placeholder="ex: 110"
            disabled={semSexo}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            PA Diastólica (mmHg)
          </label>
          <input
            type="number"
            min="0"
            value={diastolica}
            onChange={e => { setDiastolica(e.target.value); setResultado(null); }}
            placeholder="ex: 65"
            disabled={semSexo}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          />
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{erro}</p>
        </div>
      )}

      <button
        onClick={handleClassificar}
        disabled={loading || semSexo}
        className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-3 rounded-lg transition active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Classificando...' : 'Classificar PA'}
      </button>

      {resultado && (
        <div className={`rounded-xl overflow-hidden border-2 ${resultado.alerta ? 'border-red-500' : 'border-emerald-500'}`}>
          {resultado.alerta && (
            <div className="bg-red-500 px-4 py-2.5 flex items-center gap-2">
              <HeartPulseIcon className="w-5 h-5 text-white shrink-0" />
              <p className="text-white font-bold text-sm">ALERTA: PA fora do intervalo P5–P95</p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            <PASection
              titulo="PA Sistólica"
              medido={`${sistolica} mmHg`}
              classe={resultado.class_sistolica}
              percentis={[['P5', resultado.sist_p5], ['P50', resultado.sist_p50], ['P95', resultado.sist_p95]]}
            />
            <PASection
              titulo="PA Diastólica"
              medido={`${diastolica} mmHg`}
              classe={resultado.class_diastolica}
              percentis={[['P5', resultado.diast_p5], ['P50', resultado.diast_p50], ['P95', resultado.diast_p95]]}
            />
            <PASection
              titulo="PA Média"
              medido={`${resultado.media_medida} mmHg`}
              classe={resultado.class_media}
              percentis={[['P5', resultado.media_p5], ['P50', resultado.media_p50], ['P95', resultado.media_p95]]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface PASectionProps {
  titulo: string;
  medido: string;
  classe: string;
  percentis: PARow[];
}

const PASection: React.FC<PASectionProps> = ({ titulo, medido, classe, percentis }) => (
  <div className="p-4">
    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{titulo}</p>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{medido}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${classBadge(classe)}`}>
          {classeTexto(classe)}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {percentis.map(([label, val]) => (
        <div key={label} className="bg-slate-100 dark:bg-slate-700 rounded-lg py-2 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{val}</p>
        </div>
      ))}
    </div>
  </div>
);
