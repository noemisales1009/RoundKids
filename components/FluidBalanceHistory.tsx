import React, { useState, useEffect } from 'react';
import { DropletIcon, ChevronRightIcon } from './icons';
import { supabase } from '../supabaseClient';

interface FluidBalanceRecord {
  id: string;
  patient_id: string;
  volume: number;
  peso: number;
  resultado: number;
  data_calculo: string;
  created_at: string;
}

interface FluidBalanceHistoryProps {
  patientId: string | number;
}

const FluidBalanceHistory: React.FC<FluidBalanceHistoryProps> = ({ patientId }) => {
  const [records, setRecords] = useState<FluidBalanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchFluidBalanceHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('balanco_hidrico_historico')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico de balanço hídrico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchFluidBalanceHistory();
    }
  }, [isExpanded, patientId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
      {/* Header Expansível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
      >
        <div className="flex items-center gap-2">
          <DropletIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Histórico de Balanço Hídrico</h3>
        </div>
        <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
          {loading ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-4">Carregando...</p>
          ) : records.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-4">Sem registros de balanço hídrico</p>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div key={record.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Balanço: <span className={`font-bold ${record.resultado > 0 ? 'text-blue-600 dark:text-blue-400' : record.resultado < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {record.resultado > 0 ? '+' : ''}{record.resultado?.toFixed(2) || '-'}%
                        </span>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {record.volume > 0 ? '+' : ''}{record.volume}mL / {record.peso}kg
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{formatDate(record.created_at || record.data_calculo)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FluidBalanceHistory;
