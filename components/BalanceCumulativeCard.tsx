import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { NotificationContext } from '../contexts';
import { ChevronRightIcon } from './icons';

interface BHCumulativoCardData {
  bh_dia_anterior: number | null;
  bh_do_dia: number;
  bh_cumulativo: number | null;
  dia: string;
}

interface BalanceCumulativeCardProps {
  patientId: string | number;
  refreshTrigger?: number;
}

const BalanceCumulativeCard: React.FC<BalanceCumulativeCardProps> = ({ 
  patientId, 
  refreshTrigger 
}) => {
  const notificationContext = useContext(NotificationContext);
  const [data, setData] = useState<BHCumulativoCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchLatestCumulativeData();
    }
  }, [patientId, refreshTrigger]);

  const fetchLatestCumulativeData = async () => {
    try {
      setLoading(true);
      
      // Tenta do vw_resumo_balanco
      const { data: balanceData, error } = await supabase
        .from('vw_resumo_balanco')
        .select('dia, bh_do_dia, bh_dia_anterior, bh_cumulativo')
        .eq('patient_id', patientId)
        .order('dia', { ascending: false })
        .limit(1);

      if (error) {
      } else if (balanceData && balanceData.length > 0) {
        const latest = balanceData[0];
        setData({
          bh_dia_anterior: latest.bh_dia_anterior || null,
          bh_do_dia: latest.bh_do_dia || 0,
          bh_cumulativo: latest.bh_cumulativo || null,
          dia: latest.dia,
        });
        setLoading(false);
        return;
      }

      // Fallback: buscar direto da tabela balanco_hidrico
      const { data: directData, error: directError } = await supabase
        .from('balanco_hidrico')
        .select('*')
        .eq('patient_id', patientId)
        .order('data_registro', { ascending: false })
        .limit(1);

      if (directError) {
        console.error('Erro na tabela balanco_hidrico:', directError);
        setData(null);
      } else if (directData && directData.length > 0) {
        const latest = directData[0];
        setData({
          bh_dia_anterior: latest.bh_anterior || null,
          bh_do_dia: latest.bh_atual || 0,
          bh_cumulativo: latest.bh_cumulativo || null,
          dia: latest.data_registro,
        });
      } else {
        setData(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar BH Cumulativo:', error);
      if (notificationContext) {
        notificationContext.showNotification({ message: 'Erro ao carregar BH Cumulativo', type: 'error' });
      }
      setData(null);
      setLoading(false);
    }
  };

  const getStatusColor = (value: number | null): string => {
    if (value === null || value === undefined) {
      return 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600';
    }
    if (value < -500) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600';
    }
    if (value < -200) {
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600';
    }
    if (value <= 200) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600';
    }
    if (value < 500) {
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600';
    }
    return 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600';
  };

  const getStatusLabel = (value: number | null): string => {
    if (value === null || value === undefined) return 'Sem dados';
    if (value < -500) return '🔴 Desidratação severa';
    if (value < -200) return '🟠 Possível desidratação';
    if (value <= 200) return '🟢 Normal';
    if (value < 500) return '🟠 Possível retenção';
    return '🔴 Retenção severa';
  };

  const formatValue = (value: number | null): string => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 p-4 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">Carregando...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Nenhum registro de BH Cumulativo
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 transition-all ${getStatusColor(data.bh_cumulativo)}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:opacity-80 transition"
      >
        <div className="flex items-center gap-2 text-left">
          <span className="text-lg font-bold">🧮</span>
          <div>
            <p className="font-bold text-sm">BH CUMULATIVO</p>
            <p className="text-xs opacity-75">{formatValue(data.bh_cumulativo)} mL</p>
          </div>
        </div>
        <ChevronRightIcon 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="border-t px-4 py-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="opacity-75">BH do Dia</span>
            <span className="font-bold">{formatValue(data.bh_do_dia)} mL</span>
          </div>
          {data.bh_dia_anterior !== null && (
            <div className="flex justify-between">
              <span className="opacity-75">BH Dia Anterior</span>
              <span className="font-bold">{formatValue(data.bh_dia_anterior)} mL</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t opacity-75">
            <span className="font-semibold">Status:</span>
            <span className="font-bold">{getStatusLabel(data.bh_cumulativo)}</span>
          </div>
          <div className="pt-2 text-xs opacity-75">
            📅 {formatDate(data.dia)}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceCumulativeCard;
