import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronRightIcon, DropletIcon } from './icons';

interface HistorySectionProps {
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

const HistorySection: React.FC<HistorySectionProps> = ({ patientId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [diuresisHistory, setDiuresisHistory] = useState<DiuresisRecord[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<BalanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [diuresisResult, balanceResult] = await Promise.all([
        supabase
          .from('diurese_historico')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('balanco_hidrico_historico')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      setDiuresisHistory(diuresisResult.data || []);
      setBalanceHistory(balanceResult.data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchHistory();
    }
  }, [isExpanded, patientId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalRecords = diuresisHistory.length + balanceHistory.length;

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
      >
        <div className="flex items-center gap-2">
          <DropletIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Histórico</h3>
          {totalRecords > 0 && (
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              ({totalRecords})
            </span>
          )}
        </div>
        <ChevronRightIcon
          className={`w-5 h-5 text-slate-400 transition transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          {loading ? (
            <div className="text-center py-4 text-slate-600 dark:text-slate-400">
              Carregando histórico...
            </div>
          ) : (
            <>
              {/* Diurese History */}
              {diuresisHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                    Diurese ({diuresisHistory.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {diuresisHistory.map((record) => (
                      <div
                        key={record.id}
                        className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                            {formatDate(record.created_at)}
                          </span>
                          <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                            {((record.volume / record.horas) / record.peso).toFixed(2)} mL/kg/h
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Peso: {record.peso} kg | Volume: {record.volume} mL | Período: {record.horas}h
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Balance History */}
              {balanceHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                    Balanço Hídrico ({balanceHistory.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {balanceHistory.map((record) => (
                      <div
                        key={record.id}
                        className={`p-3 rounded-lg border ${
                          record.volume > 0
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
                            {formatDate(record.created_at)}
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              record.volume > 0
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {record.volume > 0 ? '+' : ''}{(record.volume / (record.peso * 10)).toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Peso: {record.peso} kg | Volume: {record.volume > 0 ? '+' : ''}{record.volume} mL
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalRecords === 0 && (
                <div className="text-center py-4 text-slate-600 dark:text-slate-400">
                  Nenhum registro de histórico ainda
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HistorySection;
