import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircleIcon, AlertIcon, WarningIcon } from './icons';

interface StatusComponentProps {
  patientId: string | number;
}

const StatusComponent: React.FC<StatusComponentProps> = ({ patientId }) => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const statusOptions = ['estavel', 'instavel', 'em_risco'];
  const statusLabels = { estavel: 'Estável', instavel: 'Instável', em_risco: 'Em Risco' };
  
  const getStatusIcon = (stat: string) => {
    switch (stat) {
      case 'estavel':
        return <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'instavel':
        return <AlertIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'em_risco':
        return <WarningIcon className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('status')
          .eq('id', patientId)
          .single();

        if (!error && data?.status) {
          setStatus(data.status);
        }
      } catch (err) {
        console.error('Erro ao carregar status:', err);
      }
    };

    fetchStatus();
  }, [patientId]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);

    try {
      await supabase
        .from('patients')
        .update({ status: newStatus })
        .eq('id', patientId);
    } catch (err) {
      console.error('Erro ao salvar status:', err);
      setStatus(status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Status
      </label>
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={loading}
        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-100 disabled:opacity-50"
      >
        <option value="">Selecionar...</option>
        {statusOptions.map((opt) => (
          <option key={opt} value={opt}>
            {statusLabels[opt as keyof typeof statusLabels]}
          </option>
        ))}
      </select>

      {status && (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center gap-3 border border-slate-200 dark:border-slate-600">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status === 'estavel' ? 'bg-green-100 dark:bg-green-900/30' :
            status === 'instavel' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            'bg-red-100 dark:bg-red-900/30'
          }`}>
            {getStatusIcon(status)}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Status Atual</p>
            <p className={`text-sm font-bold ${
              status === 'estavel' ? 'text-green-600 dark:text-green-400' :
              status === 'instavel' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {statusLabels[status as keyof typeof statusLabels]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusComponent;
