import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { DropletIcon } from './icons';

interface LatestCalculationsCardProps {
  patientId: string | number;
  refreshTrigger?: number;
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

interface BalancoCumulativoRecord {
  patient_id: string;
  patient_name: string;
  data_calculo: string;
  bh_historico_antigo: number;
  bh_ultimas_24h: number;
  bh_cumulativo_total: number;
  registros_ultimas_24h: number;
}

const LatestCalculationsCard: React.FC<LatestCalculationsCardProps> = ({ patientId, refreshTrigger }) => {
  const [latestDiuresis, setLatestDiuresis] = useState<DiuresisRecord | null>(null);
  const [latestBalance, setLatestBalance] = useState<BalanceRecord | null>(null);
  const [balancoCumulativo, setBalancoCumulativo] = useState<BalancoCumulativoRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLatestCalculations = async () => {
    setLoading(true);
    try {
      const patientIdStr = String(patientId);
      
      const [diuresisResult, balanceResult, balancoCumulativoResult] = await Promise.all([
        supabase
          .from('diurese')
          .select('*')
          .eq('patient_id', patientIdStr)
          .order('data_registro', { ascending: false })
          .limit(1),
        supabase
          .from('balanco_hidrico')
          .select('*')
          .eq('patient_id', patientIdStr)
          .order('data_registro', { ascending: false })
          .limit(1),
        supabase
          .from('balanco_hidrico_cumulativo')
          .select('*')
          .eq('patient_id', patientIdStr)
          .single(),
      ]);


      if (diuresisResult.data && diuresisResult.data.length > 0) {
        const data = diuresisResult.data[0];
        setLatestDiuresis({
          id: data.id,
          created_at: data.data_registro || new Date().toISOString(),
          peso: parseFloat(data.peso),
          volume: parseFloat(data.volume),
          horas: parseInt(data.horas)
        });
      } else {
      }

      if (balanceResult.data && balanceResult.data.length > 0) {
        const data = balanceResult.data[0];
        setLatestBalance({
          id: data.id,
          created_at: data.data_registro || data.created_at || new Date().toISOString(),
          peso: parseFloat(data.peso),
          volume: parseFloat(data.volume)
        });
      } else {
      }

      if (balancoCumulativoResult.data) {
        setBalancoCumulativo(balancoCumulativoResult.data);
      } else {
      }
    } catch (error) {
      console.error('Erro ao buscar últimos cálculos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestCalculations();
  }, [patientId, refreshTrigger]);

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

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
      {/* Header - Sempre visível, sem botão de colapsar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <DropletIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Últimos Cálculos</h3>
        </div>
      </div>

      {/* Content - Sempre visível */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-4 text-slate-600 dark:text-slate-400">
            Carregando cálculos...
          </div>
        ) : !latestDiuresis && !latestBalance ? (
          <div className="text-center py-4 text-slate-600 dark:text-slate-400">
            Nenhum cálculo registrado ainda
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Diurese - sempre mostra, mesmo sem dados */}
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-2">
                DIURESE
              </div>
              {latestDiuresis ? (
                <>
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
                </>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400 py-2">
                  Nenhum registro
                </div>
              )}
            </div>

            {/* Balanço Hídrico - sempre mostra, mesmo sem dados */}
            <div className={`p-4 rounded-lg border ${
              latestBalance && latestBalance.volume > 0
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : latestBalance && latestBalance.volume < 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700'
            }`}>
              <div className={`text-xs font-medium mb-2 ${
                latestBalance && latestBalance.volume > 0
                  ? 'text-blue-700 dark:text-blue-400'
                  : latestBalance && latestBalance.volume < 0
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-slate-700 dark:text-slate-400'
              }`}>
                BALANÇO HÍDRICO
              </div>
              {latestBalance ? (
                <>
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
                </>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400 py-2">
                  Nenhum registro
                </div>
              )}
            </div>

            {/* BH Cumulativo - Balanço acumulado */}
            {balancoCumulativo && balancoCumulativo.registros_ultimas_24h > 0 ? (
              <div className={`p-4 rounded-lg border ${
                Math.abs(balancoCumulativo.bh_cumulativo_total) > 200
                  ? balancoCumulativo.bh_cumulativo_total > 0
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  : balancoCumulativo.bh_cumulativo_total > 0
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : balancoCumulativo.bh_cumulativo_total < 0
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700'
              }`}>
                <div className={`text-xs font-medium mb-2 ${
                  Math.abs(balancoCumulativo.bh_cumulativo_total) > 200
                    ? balancoCumulativo.bh_cumulativo_total > 0
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-orange-700 dark:text-orange-400'
                    : balancoCumulativo.bh_cumulativo_total > 0
                    ? 'text-blue-700 dark:text-blue-400'
                    : balancoCumulativo.bh_cumulativo_total < 0
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-slate-700 dark:text-slate-400'
                }`}>
                  BH CUMULATIVO
                </div>
                <div className={`text-2xl font-bold mb-2 ${
                  Math.abs(balancoCumulativo.bh_cumulativo_total) > 200
                    ? balancoCumulativo.bh_cumulativo_total > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-orange-600 dark:text-orange-400'
                    : balancoCumulativo.bh_cumulativo_total > 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : balancoCumulativo.bh_cumulativo_total < 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {balancoCumulativo.bh_cumulativo_total > 0 ? '+' : ''}{balancoCumulativo.bh_cumulativo_total.toFixed(2)}%
                </div>
                <div className={`text-xs font-medium mb-2 ${
                  Math.abs(balancoCumulativo.bh_cumulativo_total) > 200
                    ? balancoCumulativo.bh_cumulativo_total > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-orange-600 dark:text-orange-400'
                    : balancoCumulativo.bh_cumulativo_total > 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : balancoCumulativo.bh_cumulativo_total < 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {Math.abs(balancoCumulativo.bh_cumulativo_total) > 200 
                    ? balancoCumulativo.bh_cumulativo_total > 0 ? '⚠️ Retenção' : '⚠️ Perda'
                    : balancoCumulativo.bh_cumulativo_total > 0 ? '💧 Ganho' : balancoCumulativo.bh_cumulativo_total < 0 ? '✓ Eliminação' : 'Neutro'}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Anterior: {balancoCumulativo.bh_historico_antigo > 0 ? '+' : ''}{balancoCumulativo.bh_historico_antigo.toFixed(2)}% | 24h: {balancoCumulativo.bh_ultimas_24h > 0 ? '+' : ''}{balancoCumulativo.bh_ultimas_24h.toFixed(2)}%
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestCalculationsCard;
