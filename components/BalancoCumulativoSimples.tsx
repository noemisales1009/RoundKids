import React, { useState, useEffect } from 'react';
import { DropletIcon } from './icons';
import { supabase } from '../supabaseClient';

interface BalancoCumulativoData {
  patient_id: string;
  patient_name: string;
  period_hours: number;
  periodo_label: string;
  bh_anterior: number;
  bh_atual: number;
  bh_cumulativo: number;
  timestamp_anterior: string;
  timestamp_atual: string;
  data_calculo: string;
}

interface Props {
  patientId: string | number;
}

const PERIODOS = [24, 18, 6, 4, 2];

const BalancoCumulativoSimples: React.FC<Props> = ({ patientId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(24);
  const [data, setData] = useState<BalancoCumulativoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchBalanco = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        const { data: resultData, error } = await supabase.rpc(
          'get_bh_cumulativo_v2',
          {
            p_patient_id: patientId.toString(),
            p_hours: selectedPeriod,
          }
        );

        if (error) {
          console.error('❌ Erro ao buscar BH:', error);
        } else if (resultData && resultData.length > 0) {
          console.log('✅ BH encontrado:', resultData[0]);
          setData(resultData[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar BH:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalanco();
  }, [patientId, selectedPeriod]);

  // Determinar cor baseado no valor cumulativo
  const getColorClasses = (value: number) => {
    if (Math.abs(value) > 200) {
      if (value > 0) {
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          value: 'text-red-600 dark:text-red-400',
          status: '⚠️ Retenção Crítica',
        };
      } else {
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          value: 'text-orange-600 dark:text-orange-400',
          status: '⚠️ Perda Crítica',
        };
      }
    } else if (value > 0) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        value: 'text-blue-600 dark:text-blue-400',
        status: '💧 Ganho',
      };
    } else if (value < 0) {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        value: 'text-green-600 dark:text-green-400',
        status: '✓ Eliminação',
      };
    } else {
      return {
        bg: 'bg-slate-50 dark:bg-slate-900/20',
        border: 'border-slate-200 dark:border-slate-700',
        value: 'text-slate-600 dark:text-slate-400',
        status: '○ Neutro',
      };
    }
  };

  if (!data && !loading) {
    return null;
  }

  const colors = data ? getColorClasses(data.bh_cumulativo) : getColorClasses(0);

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 mb-4">
      {/* Header - Clicável */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <DropletIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">BH Cumulativo</h3>
        </div>
        <svg
          className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${
            isOpen ? 'transform rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Conteúdo - Aparece quando aberto */}
      {isOpen && (
        <>
          {/* Abas de período */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex gap-2 overflow-x-auto">
            {PERIODOS.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                  selectedPeriod === period
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {period}h
              </button>
            ))}
          </div>

          {/* Conteúdo principal */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-6 text-slate-600 dark:text-slate-400">
                Carregando...
              </div>
            ) : !data ? (
              <div className="text-center py-6 text-slate-600 dark:text-slate-400">
                Nenhum dado disponível
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                {/* Título */}
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-4 uppercase tracking-wide">
                  BH Cumulativo ({data.periodo_label})
                </div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {/* BH DA MANHÃ DO DIA ANTERIOR */}
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700/30 rounded-lg border border-slate-300 dark:border-slate-600">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                    BH da Manhã do Dia Anterior ({data.periodo_label} atrás)
                  </p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {data.bh_anterior > 0 ? '+' : ''}{data.bh_anterior.toFixed(2)}%
                  </p>
                  {data.timestamp_anterior && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(data.timestamp_anterior).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {/* SINAL + ou - */}
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="flex justify-center mb-6">
                  <span className="text-4xl font-bold text-slate-400 dark:text-slate-500">
                    {data.bh_atual > 0 ? '+' : '-'}
                  </span>
                </div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {/* BH CALCULADO NA MANHÃ ATUAL */}
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700/30 rounded-lg border border-slate-300 dark:border-slate-600">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                    BH Calculado na Manhã Atual (últimas {data.periodo_label})
                  </p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {data.bh_atual > 0 ? '+' : ''}{Math.abs(data.bh_atual).toFixed(2)}%
                  </p>
                  {data.timestamp_atual && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(data.timestamp_atual).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {/* LINHA HORIZONTAL SEPARADORA */}
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="mb-6 border-t-2 border-slate-400 dark:border-slate-500"></div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {/* RESULTADO FINAL */}
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-800 border-2" style={{
                  borderColor: colors.value.includes('red') ? '#dc2626' : 
                              colors.value.includes('orange') ? '#ea580c' :
                              colors.value.includes('blue') ? '#2563eb' :
                              colors.value.includes('green') ? '#16a34a' : '#94a3b8'
                }}>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 uppercase">
                    = Resultado
                  </p>
                  <p className={`text-5xl font-bold mb-2 ${colors.value}`}>
                    {data.bh_cumulativo > 0 ? '+' : ''}{data.bh_cumulativo.toFixed(2)}%
                  </p>
                  <p className={`text-sm font-semibold ${colors.value}`}>
                    {colors.status}
                  </p>
                </div>

                {/* Aviso crítico */}
                {Math.abs(data.bh_cumulativo) > 200 && (
                  <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                      ⚠️ {data.bh_cumulativo > 0 ? 'Retenção' : 'Perda'} excessiva de líquido!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BalancoCumulativoSimples;
