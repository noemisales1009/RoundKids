import React, { useState, useEffect, useContext } from 'react';
import { DropletIcon } from './icons';
import { supabase } from '../supabaseClient';
import { PatientsContext } from '../contexts';

interface BalancoCumulativoPeriodo {
  patient_id: string;
  patient_name: string;
  period_hours: number;
  periodo_label: string;
  data_calculo: string;
  bh_periodo_anterior: number;
  bh_periodo_atual: number;
  bh_cumulativo: number;
  registros_periodo_atual: number;
}

interface BalancoCumulativoPorPeriodoProps {
  patientId: string | number;
}

const PERIODOS = [24, 18, 12, 6, 4, 2];

const BalancoCumulativoPorPeriodo: React.FC<BalancoCumulativoPorPeriodoProps> = ({ patientId }) => {
  const { patients } = useContext(PatientsContext)!;
  const [selectedPeriod, setSelectedPeriod] = useState(24);
  const [data, setData] = useState<BalancoCumulativoPeriodo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchBalancoPeriodo = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        const { data: resultData, error } = await supabase.rpc(
          'get_balanco_cumulativo',
          {
            p_patient_id: patientId.toString(),
            p_hours: selectedPeriod,
          }
        );

        if (error) {
          console.error('Erro ao buscar BH por período:', error);
        } else if (resultData && resultData.length > 0) {
          setData(resultData[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar BH por período:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalancoPeriodo();
  }, [patientId, selectedPeriod]);

  // Buscar peso do paciente
  const patient = patients.find(p => p.id.toString() === patientId.toString());
  const peso = patient?.peso || 0;

  // Determinar cor baseado no valor cumulativo
  const getColorClasses = (value: number) => {
    if (Math.abs(value) > 200) {
      if (value > 0) {
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          label: 'text-red-700 dark:text-red-400',
          value: 'text-red-600 dark:text-red-400',
          status: '⚠️ Retenção Crítica',
        };
      } else {
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          label: 'text-orange-700 dark:text-orange-400',
          value: 'text-orange-600 dark:text-orange-400',
          status: '⚠️ Perda Crítica',
        };
      }
    } else if (value > 0) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        label: 'text-blue-700 dark:text-blue-400',
        value: 'text-blue-600 dark:text-blue-400',
        status: '💧 Ganho',
      };
    } else if (value < 0) {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        label: 'text-green-700 dark:text-green-400',
        value: 'text-green-600 dark:text-green-400',
        status: '✓ Eliminação',
      };
    } else {
      return {
        bg: 'bg-slate-50 dark:bg-slate-900/20',
        border: 'border-slate-200 dark:border-slate-700',
        label: 'text-slate-700 dark:text-slate-400',
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
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <DropletIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">BH por Período</h3>
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

      {/* Abas de seleção de período */}
      {isOpen && (
        <>
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex gap-2 overflow-x-auto">
            {PERIODOS.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                  selectedPeriod === period
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {period}h
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="px-4 py-4">
            {loading ? (
              <div className="text-center py-4 text-slate-600 dark:text-slate-400">
                Carregando...
              </div>
            ) : !data ? (
              <div className="text-center py-4 text-slate-600 dark:text-slate-400">
                Nenhum dado disponível
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                {/* Título BH Cumulativo */}
                <div className={`text-xs font-medium mb-2 ${colors.label}`}>
                  BH CUMULATIVO
                </div>

                {/* Valor principal - bem grande */}
                <div className={`text-4xl font-bold mb-6 ${colors.value}`}>
                  {data.bh_cumulativo > 0 ? '+' : ''}{data.bh_cumulativo.toFixed(2)}%
                </div>

                {/* Status */}
                <div className={`text-sm font-semibold mb-6 ${colors.value}`}>
                  {colors.status}
                </div>

                {/* Separador visual */}
                <div className="mb-6 pb-4 border-b-2 border-slate-300 dark:border-slate-600"></div>

                {/* Fórmula Visual: Período Anterior + Período Atual = Cumulativo */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-4 text-center">
                    Como é calculado:
                  </p>
                  
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {/* Período Anterior */}
                    <div className="flex-1 text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2">
                        BH de {data.periodo_label} atrás
                      </p>
                      {data.bh_periodo_anterior === 0 && data.registros_periodo_atual === 0 ? (
                        <p className="text-lg font-bold text-slate-500 dark:text-slate-500">
                          Sem dados
                        </p>
                      ) : (
                        <p className={`text-2xl font-bold ${
                          data.bh_periodo_anterior > 0 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : data.bh_periodo_anterior < 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {data.bh_periodo_anterior > 0 ? '+' : ''}{data.bh_periodo_anterior.toFixed(2)}%
                        </p>
                      )}
                    </div>

                    {/* Sinal de Soma */}
                    <div className="flex items-center justify-center">
                      <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">+</span>
                    </div>

                    {/* Período Atual */}
                    <div className="flex-1 text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2">
                        BH da Última{' '}
                        <br />
                        {data.periodo_label}
                      </p>
                      {data.bh_periodo_atual === 0 && data.registros_periodo_atual === 0 ? (
                        <p className="text-lg font-bold text-slate-500 dark:text-slate-500">
                          Sem dados
                        </p>
                      ) : (
                        <p className={`text-2xl font-bold ${
                          data.bh_periodo_atual > 0 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : data.bh_periodo_atual < 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {data.bh_periodo_atual > 0 ? '+' : ''}{data.bh_periodo_atual.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Linha horizontal */}
                  <div className="mb-4 border-t-2 border-slate-400 dark:border-slate-500"></div>

                  {/* Resultado */}
                  <div className="text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2">
                      Resultado Cumulativo ({data.periodo_label})
                    </p>
                    <p className={`text-2xl font-bold ${colors.value}`}>
                      {data.bh_cumulativo > 0 ? '+' : ''}{data.bh_cumulativo.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Separador visual */}
                <div className="mb-4 pb-4 border-b border-slate-300 dark:border-slate-600"></div>

                {/* Informações adicionais */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Peso:</span> {peso.toFixed(2)} kg
                  </p>
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Período:</span> {data.periodo_label}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Medições neste período:</span> {data.registros_periodo_atual}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Calculado em:</span>{' '}
                    {new Date(data.data_calculo).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>

                {/* Aviso crítico */}
                {Math.abs(data.bh_cumulativo) > 200 && (
                  <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-300 dark:border-slate-600">
                    <p className={`text-xs font-semibold ${colors.value}`}>
                      ⚠️ Atenção: {
                        data.bh_cumulativo > 0 
                          ? 'Retenção excessiva de líquido' 
                          : 'Perda excessiva de líquido'
                      }
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

export default BalancoCumulativoPorPeriodo;
