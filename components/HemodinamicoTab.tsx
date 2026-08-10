import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { GapCO2Calculator } from './GapCO2Calculator';
import { EtCO2Calculator } from './EtCO2Calculator';
import { EtCO2DirectCalculator } from './EtCO2DirectCalculator';
import { IndiceAPDCalculator } from './IndiceAPDCalculator';
import { ScvO2Calculator } from './ScvO2Calculator';
import { O2ERCalculator } from './O2ERCalculator';
import { PressaoPulsoCalculator } from './PressaoPulsoCalculator';

/**
 * Aba Hemodinâmico com sub-abas Calculadoras / Histórico (padrão do NPT).
 * As 7 calculadoras gravam em scale_scores; o histórico unifica os registros.
 */

const SCALE_NAMES = [
  'gap_co2',
  'etco2_gradiente',
  'etco2_direto',
  'indice_apd',
  'scvo2',
  'o2er',
  'pressao_pulso',
] as const;

const SCALE_LABEL: Record<string, string> = {
  gap_co2: 'GAP de CO₂',
  etco2_gradiente: 'Gradiente PaCO₂–ETCO₂',
  etco2_direto: 'ETCO₂ direto',
  indice_apd: 'Índice ΔPCO₂/C(a-v)O₂',
  scvo2: 'ScvO₂',
  o2er: 'O₂ER',
  pressao_pulso: 'Pressão de pulso',
};

const SCALE_BADGE: Record<string, string> = {
  gap_co2: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  etco2_gradiente: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  etco2_direto: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  indice_apd: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  scvo2: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  o2er: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  pressao_pulso: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

interface Registro {
  id: string;
  created_at: string;
  scale_name: string;
  interpretation: string;
}

const formatDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

interface Props {
  patientId: string;
}

export const HemodinamicoTab: React.FC<Props> = ({ patientId }) => {
  const [aba, setAba] = useState<'calc' | 'historico'>('calc');
  const [historico, setHistorico] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('todos');

  // Recarrega ao abrir a aba Histórico — as calculadoras não avisam quando gravam.
  useEffect(() => {
    if (aba !== 'historico') return;
    let ativo = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('scale_scores')
        .select('id, created_at, scale_name, interpretation')
        .eq('patient_id', patientId)
        .in('scale_name', [...SCALE_NAMES])
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(40);
      if (ativo) {
        setHistorico((data as Registro[]) ?? []);
        setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, [aba, patientId]);

  const tabBtn = (ativa: boolean) =>
    `px-4 py-2 font-semibold text-sm transition-colors ${ativa
      ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`;

  const visiveis = filtro === 'todos' ? historico : historico.filter(r => r.scale_name === filtro);
  const tiposPresentes = SCALE_NAMES.filter(n => historico.some(r => r.scale_name === n));

  return (
    <div>
      {/* Sub-abas: Calculadoras / Histórico (mesmo padrão do NPT) */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => setAba('calc')} className={tabBtn(aba === 'calc')}>
          🧮 Calculadoras
        </button>
        <button onClick={() => setAba('historico')} className={tabBtn(aba === 'historico')}>
          📋 Histórico de Cálculos
        </button>
      </div>

      {aba === 'calc' && (
        <div className="space-y-6">
          <GapCO2Calculator patientId={patientId} />
          <div className="border-t border-slate-200 dark:border-slate-700" />
          <EtCO2Calculator patientId={patientId} />
          <div className="border-t border-slate-200 dark:border-slate-700" />
          <EtCO2DirectCalculator patientId={patientId} />
          <div className="border-t border-slate-200 dark:border-slate-700" />
          <IndiceAPDCalculator patientId={patientId} />
          <div className="border-t border-slate-200 dark:border-slate-700" />
          <ScvO2Calculator patientId={patientId} />
          <div className="border-t border-slate-200 dark:border-slate-700" />
          <O2ERCalculator patientId={patientId} />
          <div className="border-t border-slate-200 dark:border-slate-700" />
          <PressaoPulsoCalculator patientId={patientId} />
        </div>
      )}

      {aba === 'historico' && (
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          {tiposPresentes.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {['todos', ...tiposPresentes].map(t => (
                <button
                  key={t}
                  onClick={() => setFiltro(t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${filtro === t
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                >
                  {t === 'todos' ? 'Todos' : SCALE_LABEL[t]}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">Carregando...</p>
          ) : visiveis.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">Nenhum cálculo registrado para este paciente.</p>
          ) : (
            <div className="space-y-2">
              {visiveis.map(r => (
                <div key={r.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatDataHora(r.created_at)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SCALE_BADGE[r.scale_name] ?? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                      {SCALE_LABEL[r.scale_name] ?? r.scale_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{r.interpretation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HemodinamicoTab;
