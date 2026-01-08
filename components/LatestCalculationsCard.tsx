import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronRightIcon, DropletIcon } from './icons';

interface LatestCalculationsCardProps {
  patientId: string | number;
}

interface DiuresisRecord {
  id: string;
  created_at: string;
  peso: number;
  volume: number;
  horas: number;
}

interface BalanceRecord {
  id: string;
  created_at: string;
  peso: number;
  volume: number;
}

const LatestCalculationsCard: React.FC<LatestCalculationsCardProps> = ({ patientId }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [latestDiuresis, setLatestDiuresis] = useState<DiuresisRecord | null>(null);
  const [latestBalance, setLatestBalance] = useState<BalanceRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLatestCalculations = async () => {
    setLoading(true);
    try {
      const [diuresisResult, balanceResult] = await Promise.all([
        supabase
          .from('diurese_historico')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('balanco_hidrico_historico')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      if (diuresisResult.data && diuresisResult.data.length > 0) {
        setLatestDiuresis(diuresisResult.data[0]);
      }

      if (balanceResult.data && balanceResult.data.length > 0) {
        setLatestBalance(balanceResult.data[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar últimos cálculos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestCalculations();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchLatestCalculations, 30000);
    return () => clearInterval(interval);
  }, [patientId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const hasBothCalculations = latestDiuresis && latestBalance;

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
      >
        <div className="flex items-center gap-2">
          <DropletIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Últimos Cálculos</h3>
        </div>
        <ChevronRightIcon
          className={`w-5 h-5 text-slate-400 transition transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
          {loading ? (
            <div className="text-center py-4 text-slate-600 dark:text-slate-400">
              Carregando cálculos...
            </div>
          ) : !latestDiuresis && !latestBalance ? (
            <div className="text-center py-4 text-slate-600 dark:text-slate-400">
              Nenhum cálculo registrado
            </div>
          ) : (
            <div className={`space-y-4 ${hasBothCalculations ? 'grid grid-cols-2 gap-4 space-y-0' : ''}`}>
              {/* Latest Diuresis */}
              {latestDiuresis && (
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-2">
                    DIURESE
                  </div>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                    {((latestDiuresis.volume / latestDiuresis.horas) / latestDiuresis.peso).toFixed(2)}
                  </div>
                  <div className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-2">
                    mL/kg/h
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    Peso: {latestDiuresis.peso}kg | Volume: {latestDiuresis.volume}mL | {latestDiuresis.horas}h
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-500">
                    {formatDate(latestDiuresis.created_at)}
                  </div>
                </div>
              )}

              {/* Latest Balance */}
              {latestBalance && (
                <div className={`p-4 rounded-lg border ${
                  latestBalance.volume > 0
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className={`text-xs font-medium mb-2 ${
                    latestBalance.volume > 0
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    BALANÇO HÍDRICO
                  </div>
                  <div className={`text-2xl font-bold mb-2 ${
                    latestBalance.volume > 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {latestBalance.volume > 0 ? '+' : ''}{((latestBalance.volume / (latestBalance.peso * 10))).toFixed(2)}%
                  </div>
                  <div className={`text-xs font-medium mb-2 ${
                    latestBalance.volume > 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {latestBalance.volume > 0 ? 'Ganho' : 'Perda'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    Peso: {latestBalance.peso}kg | Volume: {latestBalance.volume > 0 ? '+' : ''}{latestBalance.volume}mL
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-500">
                    {formatDate(latestBalance.created_at)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LatestCalculationsCard;
