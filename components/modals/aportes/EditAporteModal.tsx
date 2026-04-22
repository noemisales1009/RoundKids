import React, { useState, useContext } from 'react';
import { supabase } from '../../../supabaseClient';
import { NotificationContext } from '../../../contexts';
import { CloseIcon } from '../../icons';

interface AporteData {
  id: string;
  data_referencia: string;
  vo_ml_kg_h: number;
  hv_npt_ml_kg_h: number;
  medicacoes_ml_kg_h: number;
}

export const EditAporteModal: React.FC<{
  aporte: AporteData;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ aporte, onClose, onSuccess }) => {
  const { showNotification } = useContext(NotificationContext)!;

  const [dataReferencia, setDataReferencia] = useState(aporte.data_referencia);
  const [vo, setVo] = useState(String(aporte.vo_ml_kg_h));
  const [hvNpt, setHvNpt] = useState(String(aporte.hv_npt_ml_kg_h));
  const [medicacoes, setMedicacoes] = useState(String(aporte.medicacoes_ml_kg_h));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dataReferencia) {
      showNotification({ message: 'Por favor, preencha a data', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const voNum = parseFloat(vo) || 0;
      const hvNptNum = parseFloat(hvNpt) || 0;
      const medicacoesNum = parseFloat(medicacoes) || 0;

      const { error } = await supabase
        .from('aportes_pacientes')
        .update({
          data_referencia: dataReferencia,
          vo_ml_kg_h: voNum,
          hv_npt_ml_kg_h: hvNptNum,
          medicacoes_ml_kg_h: medicacoesNum,
        })
        .eq('id', aporte.id);

      if (error) throw error;

      showNotification({ message: 'Aporte atualizado com sucesso!', type: 'success' });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar aporte:', error);
      showNotification({
        message: error?.message || 'Erro ao atualizar aporte',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" role="dialog" aria-modal="true" aria-label="Editar Aporte">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Aporte</h2>
          <button onClick={onClose} disabled={loading} aria-label="Fechar modal">
            <CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Data
            </label>
            <input
              type="date"
              value={dataReferencia}
              onChange={(e) => setDataReferencia(e.target.value)}
              className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              VO (ml/kg/h)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={vo}
              onChange={(e) => setVo(e.target.value)}
              placeholder="0"
              className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              HV/NPT (ml/kg/h)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={hvNpt}
              onChange={(e) => setHvNpt(e.target.value)}
              placeholder="0"
              className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              MED (ml/kg/h)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={medicacoes}
              onChange={(e) => setMedicacoes(e.target.value)}
              placeholder="0"
              className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
