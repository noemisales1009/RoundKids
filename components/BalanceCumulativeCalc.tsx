import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { NotificationContext } from '../contexts';
import { ChevronRightIcon } from './icons';

interface BHCumulativoData {
  bh_dia_anterior: number | null;
  bh_do_dia: number;
  bh_cumulativo: number | null;
}

interface BalanceCumulativeCalcProps {
  patientId: string | number;
  onCalculationComplete?: (data: BHCumulativoData) => void;
}

const BalanceCumulativeCalc: React.FC<BalanceCumulativeCalcProps> = ({ 
  patientId, 
  onCalculationComplete 
}) => {
  const { showNotification } = useContext(NotificationContext)!;
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BHCumulativoData>({
    bh_dia_anterior: null,
    bh_do_dia: 0,
    bh_cumulativo: null,
  });

  useEffect(() => {
    fetchLatestBHData();
  }, [patientId]);

  const fetchLatestBHData = async () => {
    try {
      setLoading(true);
      
      // Buscar os 2 últimos dias
      const { data: balanceData, error } = await supabase
        .from('vw_resumo_balanco')
        .select('dia, bh_do_dia, bh_cumulativo')
        .eq('patient_id', patientId)
        .order('dia', { ascending: false })
        .limit(2);

      if (error) throw error;

      if (balanceData && balanceData.length > 0) {
        // Hoje (índice 0)
        const today = balanceData[0];
        
        // Dia anterior (índice 1, se existir)
        const yesterday = balanceData.length > 1 ? balanceData[1] : null;

        const newData: BHCumulativoData = {
          bh_dia_anterior: yesterday?.bh_do_dia || null,
          bh_do_dia: today.bh_do_dia || 0,
          bh_cumulativo: today.bh_cumulativo || 0,
        };

        setData(newData);

        if (onCalculationComplete) {
          onCalculationComplete(newData);
        }
      } else {
        // Sem dados ainda
        setData({
          bh_dia_anterior: null,
          bh_do_dia: 0,
          bh_cumulativo: null,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      showNotification({ message: 'Erro ao carregar dados de balanço', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Cálculo manual para visualização
  const calculateCumulative = () => {
    if (data.bh_dia_anterior === null) {
      return data.bh_do_dia;
    }
    return data.bh_dia_anterior + data.bh_do_dia;
  };

  const getAlertStatus = (value: number) => {
    if (value === 0) return 'Equilibrado';
    if (value > 500) return 'Superávit Alto ⚠️';
    if (value > 0) return 'Superávit';
    if (value < -500) return 'Déficit Alto ⚠️';
    return 'Déficit';
  };

  const formatValue = (value: number | null) => {
    if (value === null) return '—';
    return value >= 0 ? `+${value.toFixed(2)}` : `${value.toFixed(2)}`;
  };

  const cumulativeValue = calculateCumulative();

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header - Expandível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💧</span>
          <h3 className="text-base font-semibold text-slate-700">
            BH Cumulativo
          </h3>
        </div>
        <ChevronRightIcon 
          className={`w-5 h-5 text-slate-600 transition transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Conteúdo Expandível */}
      {isExpanded && !loading && (
        <div className="border-t border-slate-200 px-4 py-4 space-y-4 bg-slate-50">
          
          {/* Cálculo Visual */}
          <div className="bg-white p-3 rounded border border-slate-200">
            <p className="text-xs text-slate-600 font-medium mb-3">Cálculo: BH Anterior + BH Hoje = Cumulativo</p>
            
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex-1 bg-blue-50 p-2 rounded text-center border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">BH Anterior</p>
                <p className={`font-bold text-sm ${
                  data.bh_dia_anterior === null 
                    ? 'text-gray-500' 
                    : data.bh_dia_anterior >= 0 
                      ? 'text-red-600' 
                      : 'text-blue-600'
                }`}>
                  {formatValue(data.bh_dia_anterior)}
                </p>
              </div>

              <div className="text-slate-600 font-bold">+</div>

              <div className="flex-1 bg-blue-50 p-2 rounded text-center border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">BH Hoje</p>
                <p className={`font-bold text-sm ${
                  data.bh_do_dia >= 0 
                    ? 'text-red-600' 
                    : 'text-blue-600'
                }`}>
                  {formatValue(data.bh_do_dia)}
                </p>
              </div>

              <div className="text-slate-600 font-bold">=</div>

              <div className="flex-1 bg-indigo-50 p-2 rounded text-center border border-indigo-200">
                <p className="text-xs text-slate-600 mb-1">Cumulativo</p>
                <p className="font-bold text-sm text-indigo-600">
                  {formatValue(cumulativeValue)}
                </p>
              </div>
            </div>

            {/* Status com Alerta */}
            <div className="bg-white p-2 rounded border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Status</p>
                  <p className="font-semibold text-slate-800">{getAlertStatus(cumulativeValue)}</p>
                </div>
                
                {cumulativeValue > 500 && (
                  <div className="bg-red-50 px-3 py-2 rounded border border-red-200">
                    <p className="text-xs font-bold text-red-700">⚠️ Alerta</p>
                    <p className="text-xs text-red-600">Superávit {Math.abs(cumulativeValue).toFixed(0)} mL</p>
                  </div>
                )}
                
                {cumulativeValue < -500 && (
                  <div className="bg-blue-50 px-3 py-2 rounded border border-blue-200">
                    <p className="text-xs font-bold text-blue-700">⚠️ Alerta</p>
                    <p className="text-xs text-blue-600">Déficit {Math.abs(cumulativeValue).toFixed(0)} mL</p>
                  </div>
                )}

                {Math.abs(cumulativeValue) <= 500 && (
                  <div className="bg-green-50 px-3 py-2 rounded border border-green-200">
                    <p className="text-xs font-bold text-green-700">✓ OK</p>
                    <p className="text-xs text-green-600">Equilibrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-2 rounded border border-slate-200">
              <p className="text-slate-600 font-medium">📅 Se anterior</p>
              <p className="text-slate-800">{data.bh_dia_anterior === null ? 'Sem dados' : data.bh_dia_anterior >= 0 ? 'Retenção' : 'Eliminação'}</p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <p className="text-slate-600 font-medium">📊 Se hoje</p>
              <p className="text-slate-800">{data.bh_do_dia >= 0 ? 'Retenção' : 'Eliminação'}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="px-4 py-3 text-center text-sm text-slate-600">
          Carregando dados...
        </div>
      )}

      {!loading && !isExpanded && (
        <div className="px-4 py-2 bg-slate-50 text-sm">
          <span className={`font-bold ${
            cumulativeValue >= 0 
              ? 'text-red-600' 
              : 'text-blue-600'
          }`}>
            {formatValue(cumulativeValue)} mL
          </span>
          <span className="text-slate-600 ml-2">{getAlertStatus(cumulativeValue)}</span>
        </div>
      )}
    </div>
  );
};

export default BalanceCumulativeCalc;
