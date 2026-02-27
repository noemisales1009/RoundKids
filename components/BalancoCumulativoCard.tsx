import React, { useState, useEffect, useContext } from 'react';
import { DropletIcon } from './icons';
import { supabase } from '../supabaseClient';
import { PatientsContext } from '../contexts';

interface BalancoCumulativoData {
  patient_id: string;
  patient_name: string;
  data_calculo: string;
  bh_historico_antigo: number;
  bh_ultimas_24h: number;
  bh_cumulativo_total: number;
  registros_ultimas_24h: number;
}

interface BalancoCumulativoCardProps {
  patientId: string | number;
}

const BalancoCumulativoCard: React.FC<BalancoCumulativoCardProps> = ({ patientId }) => {
  const { patients } = useContext(PatientsContext)!;
  const [data, setData] = useState<BalancoCumulativoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalancoCumulativo = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        const { data: balanceData, error: err } = await supabase
          .from('balanco_hidrico_cumulativo')
          .select('*')
          .eq('patient_id', patientId.toString())
          .single();

        if (!err && balanceData) {
          console.log('✅ BH Cumulativo encontrado:', balanceData);
          setData(balanceData);
        }
      } catch (err) {
        console.error('Erro ao buscar BH Cumulativo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalancoCumulativo();
  }, [patientId]);

  // Buscar peso do paciente
  const patient = patients.find(p => p.id.toString() === patientId.toString());
  const peso = patient?.peso || 0;

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

  // Não mostrar componente se não houver dados de 24 horas
  if (!loading && (!data || data.registros_ultimas_24h === 0)) {
    return null;
  }

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <DropletIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">BH Cumulativo</h3>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-4 text-slate-600 dark:text-slate-400">
            Carregando dados...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* BH Histórico Antigo */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-400 mb-2">
                BH HISTÓRICO
              </div>
              <div className={`text-2xl font-bold mb-2 ${
                data.bh_historico_antigo > 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : data.bh_historico_antigo < 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {data.bh_historico_antigo > 0 ? '+' : ''}{data.bh_historico_antigo.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {data.bh_historico_antigo > 0 ? 'Ganho' : data.bh_historico_antigo < 0 ? 'Perda' : 'Neutro'}
              </div>
            </div>

            {/* BH Últimas 24h */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-400 mb-2">
                BH ÚLTIMAS 24H
              </div>
              <div className={`text-2xl font-bold mb-2 ${
                data.bh_ultimas_24h > 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : data.bh_ultimas_24h < 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {data.bh_ultimas_24h > 0 ? '+' : ''}{data.bh_ultimas_24h.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {data.registros_ultimas_24h} medição{data.registros_ultimas_24h !== 1 ? 'ões' : ''}
              </div>
            </div>

            {/* BH Cumulativo */}
            <div className={`p-4 rounded-lg border ${
              Math.abs(data.bh_cumulativo_total) > 200
                ? data.bh_cumulativo_total > 0
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                : data.bh_cumulativo_total > 0
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : data.bh_cumulativo_total < 0
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700'
            }`}>
              <div className={`text-xs font-medium mb-2 ${
                Math.abs(data.bh_cumulativo_total) > 200
                  ? data.bh_cumulativo_total > 0
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-orange-700 dark:text-orange-400'
                  : data.bh_cumulativo_total > 0
                  ? 'text-blue-700 dark:text-blue-400'
                  : data.bh_cumulativo_total < 0
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-slate-700 dark:text-slate-400'
              }`}>
                BH CUMULATIVO
              </div>
              <div className={`text-2xl font-bold mb-2 ${
                Math.abs(data.bh_cumulativo_total) > 200
                  ? data.bh_cumulativo_total > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-orange-600 dark:text-orange-400'
                  : data.bh_cumulativo_total > 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : data.bh_cumulativo_total < 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {data.bh_cumulativo_total > 0 ? '+' : ''}{data.bh_cumulativo_total.toFixed(2)}%
              </div>
              <div className={`text-xs font-medium mb-2 ${
                Math.abs(data.bh_cumulativo_total) > 200
                  ? data.bh_cumulativo_total > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-orange-600 dark:text-orange-400'
                  : data.bh_cumulativo_total > 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : data.bh_cumulativo_total < 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {Math.abs(data.bh_cumulativo_total) > 200 
                  ? data.bh_cumulativo_total > 0 ? '⚠️ Retenção' : '⚠️ Perda'
                  : data.bh_cumulativo_total > 0 ? '💧 Ganho' : data.bh_cumulativo_total < 0 ? '✓ Eliminação' : 'Neutro'}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Peso: {peso.toFixed(2)}kg
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalancoCumulativoCard;
