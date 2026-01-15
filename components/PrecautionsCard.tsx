import React, { useState, useContext } from 'react';
import { Precaution } from '../types';
import { PlusIcon, PencilIcon, CloseIcon, SaveIcon, ShieldIcon, ChevronDownIcon } from './icons';
import { PatientsContext, NotificationContext } from '../contexts';

interface PrecautionsCardProps {
  patientId: number | string;
  precautions: Precaution[];
}

export const PrecautionsCard: React.FC<PrecautionsCardProps> = ({ patientId, precautions }) => {
  const { addPrecautionToPatient, updatePrecautionInPatient, deletePrecautionFromPatient, addEndDateToPrecaution } = useContext(PatientsContext)!;
  const { showNotification } = useContext(NotificationContext)!;

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedPrecaution, setSelectedPrecaution] = useState<Precaution | null>(null);
  const [isEndDateModalOpen, setEndDateModalOpen] = useState<number | string | null>(null);

  const [newPrecautionType, setNewPrecautionType] = useState<'padrao' | 'contato' | 'goticula' | 'aerossois'>('padrao');
  const [newDataInicio, setNewDataInicio] = useState(getTodayDateString());

  const activePrecautions = precautions.filter(p => !p.isArchived && !p.data_fim);

  const handleAddPrecaution = () => {
    if (!newPrecautionType) {
      showNotification({ message: 'Por favor, selecione um tipo de precaução.', type: 'error' });
      return;
    }

    addPrecautionToPatient(patientId, {
      tipo_precaucao: newPrecautionType,
      data_inicio: newDataInicio,
      isArchived: false
    });

    showNotification({ message: 'Precaução adicionada com sucesso!', type: 'success' });
    setAddModalOpen(false);
    setNewPrecautionType('padrao');
    setNewDataInicio(getTodayDateString());
  };

  const handleEditPrecaution = () => {
    if (!selectedPrecaution) return;

    updatePrecautionInPatient(patientId, selectedPrecaution);
    showNotification({ message: 'Precaução atualizada com sucesso!', type: 'success' });
    setEditModalOpen(false);
    setSelectedPrecaution(null);
  };

  const handleAddEndDate = (precautionId: number | string, endDate: string) => {
    addEndDateToPrecaution(patientId, precautionId, endDate);
    showNotification({ message: 'Data de fim adicionada com sucesso!', type: 'success' });
    setEndDateModalOpen(null);
  };

  const handleDeletePrecaution = (precautionId: number | string) => {
    if (window.confirm('Tem certeza que deseja arquivar esta precaução?')) {
      deletePrecautionFromPatient(patientId, precautionId);
      showNotification({ message: 'Precaução arquivada.', type: 'info' });
    }
  };

  const calculateDays = (startDate: string): number => {
    const parts = startDate.split('-').map(Number);
    const start = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start.getTime() > today.getTime()) {
      return 0;
    }

    const diffTime = today.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPrecautionLabel = (tipo: string): string => {
    const labels: Record<string, string> = {
      'padrao': 'Padrão',
      'contato': 'Contato',
      'goticula': 'Gotícula',
      'aerossois': 'Aerossóis'
    };
    return labels[tipo] || tipo;
  };

  const getPrecautionColor = (tipo: string): string => {
    const colors: Record<string, string> = {
      'padrao': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'contato': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'goticula': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'aerossois': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShieldIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Precauções</h3>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </div>

      {activePrecautions.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          Nenhuma precaução ativa no momento.
        </p>
      ) : (
        <div className="space-y-3">
          {activePrecautions.map(precaution => {
            const dias = calculateDays(precaution.data_inicio);
            const showDays = precaution.tipo_precaucao !== 'padrao';

            return (
              <div
                key={precaution.id}
                className={`p-3 rounded-lg border ${getPrecautionColor(precaution.tipo_precaucao)} border-opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">
                        {getPrecautionLabel(precaution.tipo_precaucao)}
                      </span>
                      {showDays && (
                        <span className="text-xs font-medium px-2 py-0.5 bg-white dark:bg-slate-700 rounded-full">
                          {dias} {dias === 1 ? 'dia' : 'dias'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1 opacity-80">
                      Início: {formatDateToBRL(precaution.data_inicio)}
                    </p>
                  </div>

                  {precaution.tipo_precaucao !== 'padrao' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPrecaution(precaution);
                          setEditModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded transition"
                        title="Editar"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEndDateModalOpen(precaution.id)}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded transition text-xs font-medium"
                        title="Finalizar precaução"
                      >
                        Finalizar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Adicionar Precaução */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Adicionar Precaução
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Precaução
                </label>
                <div className="relative">
                  <select
                    value={newPrecautionType}
                    onChange={(e) => setNewPrecautionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="padrao">Padrão</option>
                    <option value="contato">Contato</option>
                    <option value="goticula">Gotícula</option>
                    <option value="aerossois">Aerossóis</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={newDataInicio}
                  onChange={(e) => setNewDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setAddModalOpen(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPrecaution}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center space-x-2"
              >
                <SaveIcon className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Precaução */}
      {isEditModalOpen && selectedPrecaution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Editar Precaução
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Precaução
                </label>
                <div className="relative">
                  <select
                    value={selectedPrecaution.tipo_precaucao}
                    onChange={(e) => setSelectedPrecaution({ ...selectedPrecaution, tipo_precaucao: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="padrao">Padrão</option>
                    <option value="contato">Contato</option>
                    <option value="goticula">Gotícula</option>
                    <option value="aerossois">Aerossóis</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={selectedPrecaution.data_inicio}
                  onChange={(e) => setSelectedPrecaution({ ...selectedPrecaution, data_inicio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleDeletePrecaution(selectedPrecaution.id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium"
              >
                Arquivar
              </button>
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditPrecaution}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center space-x-2"
              >
                <SaveIcon className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Finalizar Precaução */}
      {isEndDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Finalizar Precaução
              </h3>
              <button onClick={() => setEndDateModalOpen(null)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Data de Fim
              </label>
              <input
                type="date"
                defaultValue={getTodayDateString()}
                id="endDateInput"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setEndDateModalOpen(null)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('endDateInput') as HTMLInputElement;
                  if (input.value) {
                    handleAddEndDate(isEndDateModalOpen, input.value);
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center space-x-2"
              >
                <SaveIcon className="w-4 h-4" />
                <span>Confirmar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateToBRL = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};
