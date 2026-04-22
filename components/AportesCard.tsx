import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PencilIcon, CloseIcon } from './icons';
import { AddAporteModal, EditAporteModal, ArchiveAporteModal } from './modals/aportes';

interface AportesCardProps {
  patientId: number | string;
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

export const AportesCard: React.FC<AportesCardProps> = ({ patientId }) => {
  const [aportes, setAportes] = useState<AporteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAporte, setEditingAporte] = useState<AporteRow | null>(null);
  const [archivingAporte, setArchivingAporte] = useState<AporteRow | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadAportes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('aportes_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .is('archived_at', null)
        .order('data_referencia', { ascending: false });

      if (error) throw error;
      setAportes(data || []);
    } catch (error) {
      console.error('Erro ao carregar aportes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAportes();
  }, [patientId]);

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
          {[...aportes].sort((a, b) => new Date(b.data_referencia).getTime() - new Date(a.data_referencia).getTime()).map(aporte => (
            <div key={aporte.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl mt-1">💧</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Aportes - {new Date(aporte.data_referencia).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 space-y-1">
                      <p>VO: <strong>{aporte.vo_ml_kg_h.toFixed(2)}</strong> ml/kg/h</p>
                      <p>HV/NPT: <strong>{aporte.hv_npt_ml_kg_h.toFixed(2)}</strong> ml/kg/h</p>
                      <p>MED: <strong>{aporte.medicacoes_ml_kg_h.toFixed(2)}</strong> ml/kg/h</p>
                      <p className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded font-semibold text-blue-700 dark:text-blue-300">
                        THT: {aporte.tht_ml_kg_h.toFixed(2)} ml/kg/h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => setEditingAporte(aporte)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"
                    aria-label="Editar aporte"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setArchivingAporte(aporte)}
                    className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"
                    aria-label="Arquivar aporte"
                    title="Arquivar aporte"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
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

      {editingAporte && (
        <EditAporteModal
          aporte={editingAporte}
          onClose={() => setEditingAporte(null)}
          onSuccess={() => loadAportes()}
        />
      )}

      {archivingAporte && (
        <ArchiveAporteModal
          aporteId={archivingAporte.id}
          aporteDate={archivingAporte.data_referencia}
          onClose={() => setArchivingAporte(null)}
          onSuccess={() => loadAportes()}
        />
      )}
    </>
  );
};
