import React, { useState, useContext, useEffect, useRef } from 'react';
import { Precaution, DoencaPrecaucao } from '../types';
import { PlusIcon, PencilIcon, CloseIcon, SaveIcon, ShieldIcon, ChevronDownIcon } from './icons';
import { PatientsContext, NotificationContext } from '../contexts';
import { supabase } from '../supabaseClient';

interface PrecautionsCardProps {
  patientId: number | string;
  precautions: Precaution[];
}

// =================== HELPERS ===================

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const formatDateToBRL = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const addDiasToDate = (dateStr: string, dias: number): string => {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const calculateDays = (startDate: string): number => {
  const parts = startDate.split('-').map(Number);
  const start = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start.getTime() > today.getTime()) return 0;
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

// =================== TIPO PRECAUÇÃO DISPLAY ===================

type TipoPrecaucao = Precaution['tipo_precaucao'];

const TIPO_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  padrao:                    { label: 'Padrão',                  bg: 'bg-blue-100 dark:bg-blue-900',   text: 'text-blue-800 dark:text-blue-200' },
  contato:                   { label: 'Contato',                 bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
  goticula:                  { label: 'Gotículas',               bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200' },
  aerossois:                 { label: 'Aerossóis',               bg: 'bg-red-100 dark:bg-red-900',     text: 'text-red-800 dark:text-red-200' },
  contato_goticula:          { label: 'Contato + Gotículas',     bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
  contato_aerossois:         { label: 'Contato + Aerossóis',     bg: 'bg-rose-100 dark:bg-rose-900',   text: 'text-rose-800 dark:text-rose-200' },
  contato_goticula_aerossois:{ label: 'Contato + Gotículas + Aerossóis', bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-900 dark:text-red-200' },
};

const PrecaucaoBadge: React.FC<{ tipo: string }> = ({ tipo }) => {
  const config = TIPO_CONFIG[tipo] ?? { label: tipo, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// =================== COMPONENTE PRINCIPAL ===================

export const PrecautionsCard: React.FC<PrecautionsCardProps> = ({ patientId, precautions }) => {
  const { addPrecautionToPatient, updatePrecautionInPatient, deletePrecautionFromPatient, addEndDateToPrecaution } = useContext(PatientsContext)!;
  const { showNotification } = useContext(NotificationContext)!;

  // Modais
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isEndDateModalOpen, setEndDateModalOpen] = useState<number | string | null>(null);
  const [isArchiveModalOpen, setArchiveModalOpen] = useState<number | string | null>(null);
  const [archiveMotivo, setArchiveMotivo] = useState('');
  const [selectedPrecaution, setSelectedPrecaution] = useState<Precaution | null>(null);

  // Estado do modal de adicionar
  const [doencas, setDoencas] = useState<DoencaPrecaucao[]>([]);
  const [loadingDoencas, setLoadingDoencas] = useState(false);
  const [doencaSearch, setDoencaSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDoenca, setSelectedDoenca] = useState<DoencaPrecaucao | null>(null);
  const [newDataInicio, setNewDataInicio] = useState(getTodayDateString());
  const searchRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Carregar doenças ao abrir modal
  useEffect(() => {
    if (!isAddModalOpen || doencas.length > 0) return;
    setLoadingDoencas(true);
    supabase
      .from('doencas_precaucao')
      .select('*')
      .order('nome')
      .then(({ data }) => {
        setDoencas((data as DoencaPrecaucao[]) ?? []);
        setLoadingDoencas(false);
      });
  }, [isAddModalOpen]);

  const doencasFiltradas = doencas.filter(d =>
    d.nome.toLowerCase().includes(doencaSearch.toLowerCase())
  );

  const dataFimSugerida = selectedDoenca?.duracao_dias
    ? addDiasToDate(newDataInicio, selectedDoenca.duracao_dias)
    : null;

  const handleSelecionarDoenca = (doenca: DoencaPrecaucao) => {
    setSelectedDoenca(doenca);
    setDoencaSearch(doenca.nome);
    setShowDropdown(false);
  };

  const handleAddPrecaution = () => {
    if (!selectedDoenca) {
      showNotification({ message: 'Por favor, selecione uma doença.', type: 'error' });
      return;
    }

    addPrecautionToPatient(patientId, {
      tipo_precaucao: selectedDoenca.tipo_precaucao as TipoPrecaucao,
      data_inicio: newDataInicio,
      data_fim_sugerida: dataFimSugerida ?? undefined,
      doenca_id: selectedDoenca.id,
      doenca_nome: selectedDoenca.nome,
      observacao: selectedDoenca.duracao_observacao,
      isArchived: false,
    });

    showNotification({ message: `Precaução de ${selectedDoenca.nome} adicionada.`, type: 'success' });
    handleCloseAddModal();
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setSelectedDoenca(null);
    setDoencaSearch('');
    setShowDropdown(false);
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
    showNotification({ message: 'Precaução finalizada.', type: 'success' });
    setEndDateModalOpen(null);
  };

  const handleArchivePrecaution = () => {
    if (!isArchiveModalOpen) return;
    deletePrecautionFromPatient(patientId, isArchiveModalOpen, archiveMotivo || undefined);
    showNotification({ message: 'Precaução arquivada.', type: 'info' });
    setArchiveModalOpen(null);
    setArchiveMotivo('');
  };

  const activePrecautions = precautions.filter(p => !p.isArchived && !p.data_fim);

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
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Doença ou tipo (fallback para precauções antigas) */}
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                      {precaution.doenca_nome ?? TIPO_CONFIG[precaution.tipo_precaucao]?.label ?? precaution.tipo_precaucao}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <PrecaucaoBadge tipo={precaution.tipo_precaucao} />
                      {showDays && (
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {dias} {dias === 1 ? 'dia' : 'dias'}
                        </span>
                      )}
                    </div>

                    {precaution.observacao && (
                      <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 line-clamp-2">
                        {precaution.observacao}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Início: {formatDateToBRL(precaution.data_inicio)}
                      {precaution.data_fim_sugerida && (
                        <> · Fim sugerido: {formatDateToBRL(precaution.data_fim_sugerida)}</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => { setSelectedPrecaution(precaution); setEditModalOpen(true); }}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                    {precaution.tipo_precaucao !== 'padrao' && (
                      <button
                        onClick={() => setEndDateModalOpen(precaution.id)}
                        className="px-2 py-1 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition text-slate-600 dark:text-slate-300"
                      >
                        Finalizar
                      </button>
                    )}
                    <button
                      onClick={() => { setArchiveModalOpen(precaution.id); setArchiveMotivo(''); }}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition"
                      title="Arquivar"
                    >
                      <CloseIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================== MODAL ADICIONAR =================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Adicionar Precaução
              </h3>
              <button onClick={handleCloseAddModal} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Busca de doença */}
              <div ref={searchRef}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Doença
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={loadingDoencas ? 'Carregando...' : 'Buscar doença...'}
                    value={doencaSearch}
                    disabled={loadingDoencas}
                    onChange={(e) => {
                      setDoencaSearch(e.target.value);
                      setSelectedDoenca(null);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  />
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                  {showDropdown && doencasFiltradas.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {doencasFiltradas.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onMouseDown={() => handleSelecionarDoenca(d)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-600"
                        >
                          <span className="block font-medium text-slate-800 dark:text-slate-100">{d.nome}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">
                            {TIPO_CONFIG[d.tipo_precaucao]?.label ?? d.tipo_precaucao}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {showDropdown && doencaSearch.length > 0 && doencasFiltradas.length === 0 && !loadingDoencas && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                      Nenhuma doença encontrada.
                    </div>
                  )}
                </div>
              </div>

              {/* Card de informações da doença selecionada */}
              {selectedDoenca && (
                <div className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Precaução:</span>
                    <PrecaucaoBadge tipo={selectedDoenca.tipo_precaucao} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Duração: </span>
                    {selectedDoenca.duracao_observacao}
                  </p>
                  {dataFimSugerida && (
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                      📅 Data fim sugerida: {formatDateToBRL(dataFimSugerida)}
                    </p>
                  )}
                </div>
              )}

              {/* Data de início */}
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
                onClick={handleCloseAddModal}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPrecaution}
                disabled={!selectedDoenca}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center space-x-2"
              >
                <SaveIcon className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== MODAL EDITAR =================== */}
      {isEditModalOpen && selectedPrecaution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Editar Precaução</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {selectedPrecaution.doenca_nome && (
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                {selectedPrecaution.doenca_nome}
              </p>
            )}

            <div className="space-y-4">
              {/* Tipo (editável para retrocompatibilidade) */}
              {!selectedPrecaution.doenca_id && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tipo de Precaução
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPrecaution.tipo_precaucao}
                      onChange={(e) => setSelectedPrecaution({ ...selectedPrecaution, tipo_precaucao: e.target.value as TipoPrecaucao })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="padrao">Padrão</option>
                      <option value="contato">Contato</option>
                      <option value="goticula">Gotículas</option>
                      <option value="aerossois">Aerossóis</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

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

      {/* =================== MODAL ARQUIVAR =================== */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Arquivar Precaução</h3>
              <button onClick={() => setArchiveModalOpen(null)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Motivo do arquivamento <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={archiveMotivo}
                onChange={(e) => setArchiveMotivo(e.target.value)}
                rows={3}
                placeholder="Ex: Precaução encerrada por resolução clínica..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setArchiveModalOpen(null)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleArchivePrecaution}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== MODAL FINALIZAR =================== */}
      {isEndDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Finalizar Precaução</h3>
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
                  if (input.value) handleAddEndDate(isEndDateModalOpen, input.value);
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
