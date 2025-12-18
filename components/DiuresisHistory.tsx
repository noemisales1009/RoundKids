import React, { useState, useEffect } from 'react';
import { DropletIcon, ChevronRightIcon } from './icons';
import { supabase } from '../supabaseClient';

interface DiuresisRecord {
  id: number;
  patient_id: string;
  volume: number;
  peso: number;
  horas: number;
  resultado: number;
  data_registro: string;
}

interface DiuresisHistoryProps {
  patientId: string | number;
}

const DiuresisHistory: React.FC<DiuresisHistoryProps> = ({ patientId }) => {
  const [records, setRecords] = useState<DiuresisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchDiuresisHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('diurese')
        .select('*')
        .eq('patient_id', patientId)
        .order('data_registro', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico de diurese:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchDiuresisHistory();
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
          <DropletIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Histórico de Diurese</h3>
        </div>
        <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
          {loading ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-4">Carregando...</p>
          ) : records.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-4">Sem registros de diurese</p>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div key={record.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Débito: <span className="text-teal-600 dark:text-teal-400 font-bold">{record.resultado?.toFixed(2) || '-'}</span> mL/kg/h
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {record.volume}mL / {record.horas}h / {record.peso}kg
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{formatDate(record.data_registro)}</p>
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

export default DiuresisHistory;
