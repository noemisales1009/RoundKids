import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PencilIcon, CloseIcon } from './icons';
import { AddAporteModal } from './modals/aportes';

interface AportesCardProps {
  patientId: number | string;
  userId?: string;
  accessLevel?: 'adm' | 'geral';
}

type AporteRow = {
  id: string;
  data_referencia: string;
  vo_ml_kg_h: number;
  hv_npt_ml_kg_h: number;
  medicacoes_ml_kg_h: number;
  tht_ml_kg_h: number;
  created_by: string;
  created_at: string;
};

export const AportesCard: React.FC<AportesCardProps> = ({ patientId, userId, accessLevel }) => {
  const [aportes, setAportes] = useState<AporteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<AporteRow>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  const isAdmin = accessLevel === 'adm';

  const loadAportes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('aportes_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .order('data_referencia', { ascending: false });

      if (error) throw error;
      setAportes(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAportes();
  }, [patientId]);

  const startEdit = (aporte: AporteRow) => {
    setEditingId(aporte.id);
    setEditValues({
      vo_ml_kg_h: aporte.vo_ml_kg_h,
      hv_npt_ml_kg_h: aporte.hv_npt_ml_kg_h,
      medicacoes_ml_kg_h: aporte.medicacoes_ml_kg_h,
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('aportes_pacientes')
        .update(editValues)
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      loadAportes();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este aporte?')) {
      try {
        const { error } = await supabase
          .from('aportes_pacientes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        loadAportes();
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center text-slate-500">Carregando aportes...</div>;
  }

  return (
    <>
      {aportes.length === 0 ? (
        <div className="space-y-2">
          <div className="text-center text-slate-500 dark:text-slate-400 py-4">
            Nenhum aporte registrado
          </div>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Cadastrar Aporte
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {aportes.map(aporte => (
            <div key={aporte.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl mt-1">💧</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Aportes - {new Date(aporte.data_referencia).toLocaleDateString('pt-BR')}
                    </p>
                
                {editingId === aporte.id ? (
                  <div className="space-y-2 mt-2">
                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-300">VO (ml/kg/h)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.vo_ml_kg_h || 0}
                        onChange={(e) => setEditValues({...editValues, vo_ml_kg_h: parseFloat(e.target.value)})}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-300">HV/NPT (ml/kg/h)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.hv_npt_ml_kg_h || 0}
                        onChange={(e) => setEditValues({...editValues, hv_npt_ml_kg_h: parseFloat(e.target.value)})}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-300">MED (ml/kg/h)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.medicacoes_ml_kg_h || 0}
                        onChange={(e) => setEditValues({...editValues, medicacoes_ml_kg_h: parseFloat(e.target.value)})}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 space-y-1">
                    <p>VO: <strong>{aporte.vo_ml_kg_h.toFixed(2)}</strong> ml/kg/h</p>
                    <p>HV/NPT: <strong>{aporte.hv_npt_ml_kg_h.toFixed(2)}</strong> ml/kg/h</p>
                    <p>MED: <strong>{aporte.medicacoes_ml_kg_h.toFixed(2)}</strong> ml/kg/h</p>
                    <p className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded font-semibold text-blue-700 dark:text-blue-300">
                      THT: {aporte.tht_ml_kg_h.toFixed(2)} ml/kg/h
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {editingId === aporte.id ? (
                <>
                  <button 
                    onClick={() => handleSaveEdit(aporte.id)}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition"
                  >
                    Salvar
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-xs bg-slate-400 hover:bg-slate-500 text-white rounded transition"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => startEdit(aporte)}
                    disabled={!isAdmin && userId !== aporte.created_by}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition disabled:opacity-50"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(aporte.id)}
                    disabled={!isAdmin && userId !== aporte.created_by}
                    className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition disabled:opacity-50"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
          ))}
          <button 
            onClick={() => setShowAddModal(true)} 
            className="w-full mt-2 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Cadastrar Aporte
          </button>
        </div>
      )}

      {showAddModal && (
        <AddAporteModal
          patientId={patientId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => loadAportes()}
        />
      )}
    </>
  );
};
