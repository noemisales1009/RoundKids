import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface ArchivedPatient {
  id: string;
  name: string;
  bed_number: number;
  dt_internacao: string;
  archived_at: string;
  motivo_arquivamento?: string;
}

interface ConfirmModal {
  isOpen: boolean;
  action: 'reactivate' | 'delete';
  patientId?: string;
  patientName?: string;
}

export const ArchivedPatientsScreen: React.FC = () => {
  const [patients, setPatients] = useState<ArchivedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    action: 'reactivate'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchArchivedPatients();
  }, []);

  const fetchArchivedPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, bed_number, dt_internacao, archived_at, motivo_arquivamento')
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false }) as any;

      if (error) throw error;
      
      setPatients((data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        bed_number: p.bed_number,
        dt_internacao: p.dt_internacao,
        archived_at: p.archived_at,
        motivo_arquivamento: p.motivo_arquivamento || 'Sem motivo'
      })));
    } catch (error) {
      console.error('Erro ao buscar pacientes arquivados:', error);
      showMessage('error', 'Erro ao carregar pacientes arquivados');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleReactivate = async (patientId: string) => {
    try {
      console.log('🔄 Reativando paciente e todas as planilhas relacionadas:', patientId);
      
      // 1️⃣ Reativar o paciente
      const { error: patientError } = await supabase
        .from('patients')
        .update({ archived_at: null, motivo_arquivamento: null })
        .eq('id', patientId);

      if (patientError) throw patientError;
      console.log('✅ Paciente reativado');

      // 2️⃣ Restaurar todas as planilhas relacionadas (desarquivar)
      const tables = [
        'medicacoes_pacientes',
        'dispositivos_pacientes',
        'exames_pacientes',
        'procedimentos_pacientes',
        'culturas_pacientes',
        'dietas_pacientes',
        'precautions',
        'diurese',
        'balanco_hidrico',
        'scale_scores',
        'clinical_situations_24h'
      ];

      for (const table of tables) {
        let updateQuery = supabase
          .from(table)
          .update({ is_archived: false })
          .eq('paciente_id', patientId)
          .eq('is_archived', true);

        const { error: tableError } = await updateQuery;

        if (tableError) {
          console.warn(`⚠️ Erro ao restaurar ${table}:`, tableError.message);
        } else {
          console.log(`✅ ${table} restaurada`);
        }
      }

      // 3️⃣ Restaurar diagnósticos (usa campo 'arquivado' ao invés de 'is_archived')
      const { error: diagError } = await supabase
        .from('paciente_diagnosticos')
        .update({ arquivado: false })
        .eq('patient_id', patientId)
        .eq('arquivado', true);

      if (diagError) {
        console.warn(`⚠️ Erro ao restaurar paciente_diagnosticos:`, diagError.message);
      } else {
        console.log(`✅ paciente_diagnosticos restaurada`);
      }

      showMessage('success', '🎉 Paciente e todas as planilhas restauradas com sucesso!');
      fetchArchivedPatients();
      setConfirmModal({ isOpen: false, action: 'reactivate' });
    } catch (error) {
      console.error('❌ Erro ao reativar paciente:', error);
      showMessage('error', 'Erro ao reativar paciente');
    }
  };

  const handleDelete = async (patientId: string) => {
    try {
      // Deletar o paciente (as chaves estrangeiras vão cuidar do resto)
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      showMessage('success', 'Paciente deletado permanentemente!');
      fetchArchivedPatients();
      setConfirmModal({ isOpen: false, action: 'delete' });
    } catch (error: any) {
      console.error('Erro ao deletar paciente:', error);
      showMessage('error', `Erro ao deletar: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bed_number?.toString().includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando pacientes arquivados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            📦 Pacientes Arquivados
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Visualize, reative ou delete pacientes que tiveram alta, óbito ou transferência
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nome ou leito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Arquivados</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{patients.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Encontrados</p>
            <p className="text-2xl font-bold text-blue-600">{filteredPatients.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Filtro Ativo</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {searchTerm ? '🔍' : '—'}
            </p>
          </div>
        </div>

        {/* Table */}
        {filteredPatients.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Leito
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Admissão
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Arquivado em
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Motivo
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, index) => (
                    <tr
                      key={patient.id}
                      className={`border-b border-slate-200 dark:border-slate-700 ${
                        index % 2 === 0
                          ? 'bg-white dark:bg-slate-800'
                          : 'bg-slate-50 dark:bg-slate-700/50'
                      } hover:bg-slate-100 dark:hover:bg-slate-700 transition`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-semibold">
                          {patient.bed_number || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {patient.dt_internacao ? formatDate(patient.dt_internacao) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 font-medium">
                        {formatDate(patient.archived_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                          {patient.motivo_arquivamento || 'Sem motivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                action: 'reactivate',
                                patientId: patient.id,
                                patientName: patient.name
                              })
                            }
                            className="inline-flex items-center justify-center w-9 h-9 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition"
                            title="Reativar paciente"
                          >
                            ♻️
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                action: 'delete',
                                patientId: patient.id,
                                patientName: patient.name
                              })
                            }
                            className="inline-flex items-center justify-center w-9 h-9 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition"
                            title="Deletar permanentemente"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {searchTerm ? '❌ Nenhum paciente encontrado' : '✅ Nenhum paciente arquivado'}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {confirmModal.action === 'reactivate' ? '♻️ Reativar Paciente?' : '🗑️ Deletar Permanentemente?'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {confirmModal.action === 'reactivate'
                ? `Tem certeza que deseja reativar ${confirmModal.patientName}? O paciente voltará a aparecer na lista de ativos.`
                : `Tem certeza que deseja deletar ${confirmModal.patientName} permanentemente? Esta ação não pode ser desfeita!`}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: 'reactivate' })}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmModal.patientId) {
                    if (confirmModal.action === 'reactivate') {
                      handleReactivate(confirmModal.patientId);
                    } else {
                      handleDelete(confirmModal.patientId);
                    }
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded transition ${
                  confirmModal.action === 'reactivate'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmModal.action === 'reactivate' ? 'Reativar' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedPatientsScreen;
