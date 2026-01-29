import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronDownIcon } from './icons';

interface ScaleScore {
  id: number;
  patient_id: string;
  scale_name: string;
  score: number;
  interpretation: string;
  date: string;
  created_at: string;
}

interface ScaleScoresHistoryProps {
  patientId: string;
}

const getScaleColor = (scaleName: string) => {
  if (scaleName.includes('COMFORT')) return { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-400' };
  if (scaleName.includes('CAM-ICU')) return { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-400' };
  if (scaleName.includes('SOS-PD')) return { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-400' };
  if (scaleName.includes('Consciência') || scaleName.includes('CRS-R') || scaleName.includes('FOUR') || scaleName.includes('JFK')) return { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-400' };
  if (scaleName.includes('VNI') || scaleName.includes('CNAF')) return { bg: 'bg-cyan-500/10', border: 'border-cyan-500', text: 'text-cyan-400' };
  if (scaleName.includes('Glasgow')) return { bg: 'bg-indigo-500/10', border: 'border-indigo-500', text: 'text-indigo-400' };
  if (scaleName.includes('FLACC')) return { bg: 'bg-pink-500/10', border: 'border-pink-500', text: 'text-pink-400' };
  if (scaleName.includes('Braden')) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-400' };
  if (scaleName.includes('Abstinência')) return { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-400' };
  if (scaleName.includes('FSS')) return { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-400' };
  return { bg: 'bg-slate-500/10', border: 'border-slate-500', text: 'text-slate-400' };
};

const getInterpretationColor = (interpretation: string) => {
  const lower = interpretation.toLowerCase();
  if (lower.includes('grave') || lower.includes('falência') || lower.includes('severe') || lower.includes('extreme')) return 'text-red-400';
  if (lower.includes('parcial') || lower.includes('partial') || lower.includes('moderate') || lower.includes('vegetative')) return 'text-yellow-400';
  if (lower.includes('boa') || lower.includes('bom') || lower.includes('good') || lower.includes('preserved') || lower.includes('consistent')) return 'text-green-400';
  if (lower.includes('leve') || lower.includes('mild') || lower.includes('light')) return 'text-blue-400';
  return 'text-slate-400';
};

export default function ScaleScoresHistory({ patientId }: ScaleScoresHistoryProps) {
  const [scores, setScores] = useState<ScaleScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('scale_scores')
          .select('*')
          .eq('patient_id', patientId)
          .order('date', { ascending: false });

        if (supabaseError) {
          console.error('Erro ao buscar scale_scores:', supabaseError);
          setError('Erro ao carregar histórico de escalas');
          return;
        }

        setScores(data || []);
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro ao carregar histórico de escalas');
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchScores();
    }
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border-2 border-slate-700 bg-slate-800 text-center">
        <div className="animate-pulse text-slate-400">Carregando histórico...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border-2 border-red-700 bg-red-500/10 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <div className="p-6 rounded-2xl border-2 border-slate-700 bg-slate-800">
        <p className="text-slate-400 text-sm text-center">Nenhuma escala avaliada ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider px-2">
        Histórico de Escalas ({scores.length})
      </h3>
      
      <div className="space-y-2">
        {scores.map((score) => {
          const colors = getScaleColor(score.scale_name);
          const interpretationColor = getInterpretationColor(score.interpretation);
          const isExpanded = expandedId === score.id;
          const dateObj = new Date(score.date);
          const formattedDate = dateObj.toLocaleDateString('pt-BR');
          const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={score.id}
              className={`rounded-lg border-2 transition-all overflow-hidden ${colors.border} ${colors.bg}`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : score.id)}
                className="w-full p-4 flex items-center justify-between gap-4 hover:opacity-75 transition-opacity text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`font-bold text-sm ${colors.text} truncate`}>
                      {score.scale_name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{score.score}</span>
                      <span className={`text-xs font-semibold ${interpretationColor} whitespace-nowrap`}>
                        {score.interpretation}
                      </span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {formattedDate} às {formattedTime}
                  </div>
                </div>

                <div className={`transform transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon className={`w-5 h-5 ${colors.text}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t-2 border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-3 pt-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Escala</p>
                      <p className="text-sm text-slate-200">{score.scale_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pontuação</p>
                        <p className={`text-2xl font-bold ${colors.text}`}>{score.score}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resultado</p>
                        <p className={`text-sm font-semibold ${interpretationColor}`}>{score.interpretation}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Data e Hora</p>
                      <p className="text-sm text-slate-300">{formattedDate} às {formattedTime}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-700">
                      <p className="text-xs text-slate-400">ID: {score.id}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
