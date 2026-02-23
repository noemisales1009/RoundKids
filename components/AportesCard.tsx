import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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
};

export const AportesCard: React.FC<AportesCardProps> = ({ patientId, userId, accessLevel }) => {
  const [referenceDate, setReferenceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [vo, setVo] = useState('');
  const [hvNpt, setHvNpt] = useState('');
  const [medicacoes, setMedicacoes] = useState('');
  const [thtFromDb, setThtFromDb] = useState<number | null>(null);
  const [row, setRow] = useState<AporteRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = accessLevel === 'adm';
  const canEdit = !row || isAdmin || (userId && row.created_by === userId);

  const parseValue = (value: string) => {
    const normalized = value.replace(',', '.').trim();
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  };

  const loadAportesByDate = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: fetchError } = await supabase
      .from('aportes_pacientes')
      .select('*')
      .eq('paciente_id', patientId)
      .eq('data_referencia', referenceDate)
      .maybeSingle();

    if (fetchError) {
      setError('Não foi possível carregar os aportes desta data.');
      setRow(null);
      setVo('');
      setHvNpt('');
      setMedicacoes('');
      setThtFromDb(null);
      setLoading(false);
      return;
    }

    const typedRow = (data as AporteRow | null) || null;
    setRow(typedRow);
    setVo(typedRow ? String(typedRow.vo_ml_kg_h ?? 0) : '');
    setHvNpt(typedRow ? String(typedRow.hv_npt_ml_kg_h ?? 0) : '');
    setMedicacoes(typedRow ? String(typedRow.medicacoes_ml_kg_h ?? 0) : '');
    setThtFromDb(typedRow?.tht_ml_kg_h ?? null);
    setLoading(false);
  };

  useEffect(() => {
    loadAportesByDate();
  }, [patientId, referenceDate]);

  const handleSave = async () => {
    if (!userId) {
      setError('Usuário não autenticado. Faça login novamente.');
      return;
    }
    if (!canEdit) {
      setError('Somente quem criou (ou admin) pode editar este aporte.');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      paciente_id: patientId,
      data_referencia: referenceDate,
      vo_ml_kg_h: parseValue(vo),
      hv_npt_ml_kg_h: parseValue(hvNpt),
      medicacoes_ml_kg_h: parseValue(medicacoes),
      created_by: row?.created_by || userId,
      updated_by: userId,
    };

    const { data, error: upsertError } = await supabase
      .from('aportes_pacientes')
      .upsert(payload, { onConflict: 'paciente_id,data_referencia' })
      .select('*')
      .maybeSingle();

    if (upsertError) {
      setError('Não foi possível salvar os aportes.');
      setSaving(false);
      return;
    }

    const typedRow = (data as AporteRow | null) || null;
    setRow(typedRow);
    setThtFromDb(typedRow?.tht_ml_kg_h ?? null);
    setMessage('Aportes salvos com sucesso. THT calculado pelo banco.');
    setSaving(false);
  };

  const inputClassName =
    'w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200';

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">APORTES</h3>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={referenceDate}
            onChange={(e) => setReferenceDate(e.target.value)}
            className="px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !canEdit}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            VO (ml/kg/h)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={vo}
            onChange={(e) => setVo(e.target.value)}
            disabled={loading || saving || !canEdit}
            className={inputClassName}
            placeholder="Digite o valor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            H. VENOSA / NPT (ml/kg/h)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={hvNpt}
            onChange={(e) => setHvNpt(e.target.value)}
            disabled={loading || saving || !canEdit}
            className={inputClassName}
            placeholder="Digite o valor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            MEDICAÇÕES (ml/kg/h)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={medicacoes}
            onChange={(e) => setMedicacoes(e.target.value)}
            disabled={loading || saving || !canEdit}
            className={inputClassName}
            placeholder="Digite o valor"
          />
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          THT (Σ VO + HV + MED):
          <span className="ml-2 text-base">{thtFromDb != null ? `${thtFromDb.toFixed(2)} ml/kg/h` : '--'}</span>
        </p>
      </div>

      {!loading && row && !canEdit && (
        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 font-medium">
          Este lançamento foi criado por outro usuário. Apenas o criador ou admin pode editar.
        </p>
      )}

      {loading && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Carregando aportes da data selecionada...</p>
      )}

      {message && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">{message}</p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};
