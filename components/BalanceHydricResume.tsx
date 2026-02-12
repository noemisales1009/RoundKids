import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { NotificationContext } from '../contexts';
import { ChevronRightIcon } from './icons';

interface BalanceHydricData {
  dia: string;
  bh_do_dia: number;
  bh_dia_anterior: number | null;
  bh_cumulativo: number | null;
  classificacao: string;
}

interface BalanceHydricResumeProps {
  patientId: string | number;
}

const BalanceHydricResume: React.FC<BalanceHydricResumeProps> = ({ patientId }) => {
  const { showNotification } = useContext(NotificationContext)!;
  const [data, setData] = useState<BalanceHydricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchBalanceData();
  }, [patientId]);

  const fetchBalanceData = async () => {
    try {
      setLoading(true);
      const { data: balanceData, error } = await supabase
        .from('vw_resumo_balanco')
        .select('*')
        .eq('patient_id', patientId)
        .order('dia', { ascending: false })
        .limit(30);

      if (error) throw error;
      setData(balanceData || []);
    } catch (error) {
      console.error('Erro ao buscar balanço hídrico:', error);
      showNotification('Erro ao carregar balanço hídrico', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (classificacao: string) => {
    switch (classificacao) {
      case 'Superávit Alto':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Superávit':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Equilibrado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Déficit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Déficit Alto':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatValue = (value: number | null) => {
    if (value === null) return '-';
    return value > 0 ? `+${value.toFixed(2)}` : `${value.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const latestData = data.length > 0 ? data[0] : null;

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4 border border-gray-200">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">💧</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Balanço Hídrico</h3>
            {latestData && (
              <p className="text-sm text-gray-600">
                {formatDate(latestData.dia)} • {formatValue(latestData.bh_do_dia)} mL
              </p>
            )}
          </div>
        </div>
        <ChevronRightIcon
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </div>

      {/* Resumo Rápido */}
      {latestData && !isExpanded && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">BH Hoje</p>
            <p className={`text-lg font-bold ${latestData.bh_do_dia >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatValue(latestData.bh_do_dia)}
            </p>
          </div>
          {latestData.bh_dia_anterior !== null && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Ontem</p>
              <p className={`text-lg font-bold ${latestData.bh_dia_anterior >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatValue(latestData.bh_dia_anterior)}
              </p>
            </div>
          )}
          {latestData.bh_cumulativo !== null && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Cumulativo</p>
              <p className={`text-lg font-bold ${latestData.bh_cumulativo >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatValue(latestData.bh_cumulativo)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detalhes Expandidos */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Dados de Hoje */}
          {latestData && (
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-gray-800 mb-3">Dados de Hoje</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">BH do Dia</p>
                  <p className={`text-xl font-bold ${latestData.bh_do_dia >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatValue(latestData.bh_do_dia)} mL
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(latestData.classificacao)}`}>
                    {latestData.classificacao}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Comparação com Dias Anteriores */}
          {latestData?.bh_dia_anterior !== null && (
            <div className="border border-gray-300 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Dia Anterior</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">BH - Dia Anterior</p>
                  <p className={`text-xl font-bold ${latestData.bh_dia_anterior >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatValue(latestData.bh_dia_anterior)} mL
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Variação</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatValue(latestData.bh_do_dia - (latestData.bh_dia_anterior || 0))} mL
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BH Cumulativo */}
          {latestData?.bh_cumulativo !== null && (
            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-gray-800 mb-2">Balanço Hídrico Cumulativo</h4>
              <p className="text-sm text-gray-600 mb-2">
                Soma de todos os balanços desde o início do acompanhamento
              </p>
              <p className={`text-2xl font-bold ${latestData.bh_cumulativo >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatValue(latestData.bh_cumulativo)} mL
              </p>
              {latestData.bh_cumulativo > 500 && (
                <p className="text-xs text-red-600 mt-2 font-semibold">
                  ⚠️ Alerta: Superávit significativo de líquidos
                </p>
              )}
              {latestData.bh_cumulativo < -500 && (
                <p className="text-xs text-blue-600 mt-2 font-semibold">
                  ⚠️ Alerta: Déficit significativo de líquidos
                </p>
              )}
            </div>
          )}

          {/* Histórico dos últimos 7 dias */}
          {data.length > 1 && (
            <div className="border border-gray-300 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Histórico (últimos 7 dias)</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.slice(0, 7).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{formatDate(item.dia)}</p>
                      <p className="text-xs text-gray-600">{item.classificacao}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${item.bh_do_dia >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatValue(item.bh_do_dia)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Acum: {formatValue(item.bh_cumulativo)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legenda */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-gray-700">
            <p className="font-semibold mb-2">📋 Legenda:</p>
            <ul className="space-y-1">
              <li>• <span className="font-semibold">BH Positivo (Superávit):</span> Mais entrada que saída de líquidos</li>
              <li>• <span className="font-semibold">BH Negativo (Déficit):</span> Mais saída que entrada de líquidos</li>
              <li>• <span className="font-semibold">BH Cumulativo:</span> Soma de todos os dias desde o início</li>
            </ul>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">Carregando dados...</p>
        </div>
      )}
    </div>
  );
};

export default BalanceHydricResume;
