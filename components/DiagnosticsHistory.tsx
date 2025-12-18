import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, FileTextIcon } from './icons';
import { supabase } from '../supabaseClient';

interface DiagnosticRecord {
  id: string;
  patient_id: string;
  pergunta_id: number;
  opcao_id: string;
  texto_digitado: string;
  status: string;
  created_at: string;
  opcao_label: string;
  created_by: string;
  created_by_name: string;
}

interface DiagnosticsHistoryProps {
  patientId: string | number;
}

const DiagnosticsHistory: React.FC<DiagnosticsHistoryProps> = ({ patientId }) => {
  const [records, setRecords] = useState<DiagnosticRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchDiagnosticsHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('diagnosticos_historico_com_usuario')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'resolvido')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico de diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchDiagnosticsHistory();
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
          <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Histórico de Diagnósticos Resolvidos</h3>
        </div>
        <ChevronRightIcon className={`w-5 h-5 text-slate-400 transition transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
          {loading ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-4">Carregando...</p>
          ) : records.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-4">Sem diagnósticos resolvidos</p>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div key={record.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {record.opcao_label || record.texto_digitado || 'Diagnóstico'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Resolvido por: <span className="font-semibold text>{record.created_by_name}</span>
                      </p>
                      {record.texto_digitado && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Observação: {record.texto_digitado}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 ml-2">{formatDate(record.created_at)}</p>
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

export default DiagnosticsHistory;
