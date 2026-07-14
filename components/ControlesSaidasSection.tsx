import React, { useContext, useEffect, useRef, useState } from 'react';
import { ThemeContext } from '../contexts';
import { supabase } from '../supabaseClient';
import { ChevronRightIcon } from './icons';

interface Props {
  patientId: string;
  readOnly?: boolean;
}

interface Data {
  pam_min: string; pam_max: string;
  fc_min: string;  fc_max: string;
  fr_min: string;  fr_max: string;
  tax_min: string; tax_max: string;
  dxt_min: string; dxt_max: string;
  spo2_min: string; spo2_max: string;
  evacuacoes: string;
  dreno_torax: string;
  dve: string;
  sng: string;
  ileostomia: string;
  penrose: string;
  outros_drenos: string;
  outros_drenos_label: string;
  hemodialise: string;
  dialise_peritoneal: string;
}

const EMPTY: Data = {
  pam_min: '', pam_max: '', fc_min: '', fc_max: '',
  fr_min: '', fr_max: '', tax_min: '', tax_max: '',
  dxt_min: '', dxt_max: '', spo2_min: '', spo2_max: '', evacuacoes: '',
  dreno_torax: '', dve: '', sng: '', ileostomia: '',
  penrose: '', outros_drenos: '', outros_drenos_label: '',
  hemodialise: '', dialise_peritoneal: '',
};

const VITAIS = [
  { minKey: 'pam_min', maxKey: 'pam_max', label: 'Δ PAM', unit: 'mmHg',  desc: 'Delta da Pressão Arterial Média' },
  { minKey: 'fc_min',  maxKey: 'fc_max',  label: 'Δ FC',  unit: 'bpm',   desc: 'Delta da Frequência Cardíaca' },
  { minKey: 'fr_min',  maxKey: 'fr_max',  label: 'Δ Fr',  unit: 'irpm',  desc: 'Delta da Frequência Respiratória' },
  { minKey: 'tax_min', maxKey: 'tax_max', label: 'Δ Tax', unit: 'ºC',    desc: 'Delta da Temperatura Axilar' },
  { minKey: 'dxt_min', maxKey: 'dxt_max', label: 'Δ Dxt', unit: 'mg/dl', desc: 'Delta do Dextro / Glicemia capilar' },
  { minKey: 'spo2_min', maxKey: 'spo2_max', label: 'SpO₂', unit: '%',    desc: 'Saturação de Oxigênio' },
] as const;

const DRENO_OPTIONS = [
  { key: 'dreno_torax',   label: 'Tórax' },
  { key: 'dve',           label: 'DVE — Derivação Ventricular Externa' },
  { key: 'sng',           label: 'SNG — Sonda Nasogástrica' },
  { key: 'ileostomia',    label: 'Ileostomia' },
  { key: 'penrose',       label: 'Penrose' },
  { key: 'outros_drenos', label: 'Outros' },
] as const;

type DrenoKey = typeof DRENO_OPTIONS[number]['key'];

const todayStr = () => new Date().toISOString().slice(0, 10);

const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const getCurrentUserName = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'Usuário';
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();
  return profile?.name || user.email || 'Usuário';
};

const CollapsibleHeader = ({
  label, icon, open, onToggle, badge, isDark,
}: { label: string; icon: string; open: boolean; onToggle: () => void; badge?: number; isDark: boolean }) => (
  <button
    onClick={onToggle}
    className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 rounded-xl border transition-all ${
      open
        ? isDark
          ? 'bg-slate-800 border-blue-800/50 border-l-4 border-l-blue-500'
          : 'bg-blue-50/50 border-blue-200 border-l-4 border-l-blue-500'
        : isDark
          ? 'bg-slate-800 border-slate-700 border-l-4 border-l-blue-700'
          : 'bg-slate-50 border-slate-200 border-l-4 border-l-blue-300'
    }`}
  >
    <div className="flex items-center gap-2.5">
      <span className={`material-symbols-rounded text-[22px] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
        {icon}
      </span>
      <span className={`font-bold text-sm sm:text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
          {badge}
        </span>
      )}
    </div>
    <ChevronRightIcon className={`w-4 h-4 transition-transform shrink-0 ${open ? 'rotate-90' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
  </button>
);

export const ControlesSaidasSection: React.FC<Props> = ({ patientId, readOnly = false }) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === 'dark';

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [data, setData] = useState<Data>(EMPTY);
  const [savedDates, setSavedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [openControles, setOpenControles] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openSaidas, setOpenSaidas] = useState(false);
  const [drenoDropdownOpen, setDrenoDropdownOpen] = useState(false);
  const [activeDrenos, setActiveDrenos] = useState<Set<DrenoKey>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modo e auditoria
  const [rowId, setRowId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // false = leitura, true = edição
  const [isArchived, setIsArchived] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);

  const loadSavedDates = async () => {
    const { data: rows } = await supabase
      .from('patient_controles_saidas')
      .select('data')
      .eq('patient_id', patientId)
      .is('archived_at', null)
      .order('data', { ascending: false });
    setSavedDates((rows || []).map((r: any) => r.data));
  };

  const loadForDate = async (date: string) => {
    setLoading(true);
    setArchiveConfirm(false);
    const { data: row } = await supabase
      .from('patient_controles_saidas')
      .select('*')
      .eq('patient_id', patientId)
      .eq('data', date)
      .maybeSingle();

    if (row) {
      const d: Data = {
        pam_min: row.pam_min ?? '', pam_max: row.pam_max ?? '',
        fc_min:  row.fc_min  ?? '', fc_max:  row.fc_max  ?? '',
        fr_min:  row.fr_min  ?? '', fr_max:  row.fr_max  ?? '',
        tax_min: row.tax_min ?? '', tax_max: row.tax_max ?? '',
        dxt_min: row.dxt_min ?? '', dxt_max: row.dxt_max ?? '',
        spo2_min: row.spo2_min ?? '', spo2_max: row.spo2_max ?? '',
        evacuacoes:          row.evacuacoes          ?? '',
        dreno_torax:         row.dreno_torax         ?? '',
        dve:                 row.dve                 ?? '',
        sng:                 row.sng                 ?? '',
        ileostomia:          row.ileostomia          ?? '',
        penrose:             row.penrose             ?? '',
        outros_drenos:       row.outros_drenos       ?? '',
        outros_drenos_label: row.outros_drenos_label ?? '',
        hemodialise:         row.hemodialise         ?? '',
        dialise_peritoneal:  row.dialise_peritoneal  ?? '',
      };
      setData(d);
      const active = new Set<DrenoKey>();
      DRENO_OPTIONS.forEach(({ key }) => {
        if (d[key as keyof Data]) active.add(key);
      });
      setActiveDrenos(active);
      setRowId(row.id);
      setIsArchived(!!row.archived_at);
      setIsEditing(false); // dados existentes → modo leitura
      setCreatedBy(row.created_by || null);
      setUpdatedBy(row.updated_by || null);
    } else {
      setData(EMPTY);
      setActiveDrenos(new Set());
      setRowId(null);
      setIsArchived(false);
      setIsEditing(true); // sem dados → modo preenchimento
      setCreatedBy(null);
      setUpdatedBy(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSavedDates();
    loadForDate(selectedDate);
  }, [patientId]);

  useEffect(() => {
    loadForDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDrenoDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const set = (key: keyof Data, val: string) =>
    setData(prev => ({ ...prev, [key]: val }));

  // Campos numéricos: aceita vírgula e normaliza para ponto, evitando que
  // "1,5" seja descartado (type="number" rejeita vírgula em pt-BR).
  const setNum = (key: keyof Data, val: string) => set(key, val.replace(',', '.'));

  const toggleDreno = (key: DrenoKey) => {
    setActiveDrenos(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setData(d => ({ ...d, [key]: '' }));
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const userName = await getCurrentUserName();
    const now = new Date().toISOString();

    if (!rowId) {
      const { data: newRow } = await supabase
        .from('patient_controles_saidas')
        .insert({
          patient_id: patientId,
          data: selectedDate,
          ...data,
          created_by: userName,
          updated_by: userName,
          updated_at: now,
        })
        .select('id')
        .single();
      if (newRow) {
        setRowId(newRow.id);
        setCreatedBy(userName);
        setUpdatedBy(userName);
      }
    } else {
      await supabase
        .from('patient_controles_saidas')
        .update({ ...data, updated_by: userName, updated_at: now })
        .eq('id', rowId);
      setUpdatedBy(userName);
    }

    setSaving(false);
    setSavedOk(true);
    setIsEditing(false); // volta para modo leitura após salvar
    setTimeout(() => setSavedOk(false), 2500);
    await loadSavedDates();
  };

  const handleCancel = () => {
    loadForDate(selectedDate); // recarrega dados originais e volta ao modo leitura
  };

  const handleArchive = async () => {
    if (!rowId) return;
    setArchiving(true);
    await supabase
      .from('patient_controles_saidas')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', rowId);
    setArchiving(false);
    setArchiveConfirm(false);
    await loadSavedDates();
    setSelectedDate(todayStr());
  };

  const handleDelete = async () => {
    if (!rowId) return;
    setDeleting(true);
    await supabase.from('patient_controles_saidas').delete().eq('id', rowId);
    setDeleting(false);
    setDeleteConfirm(false);
    setRowId(null);
    setData(EMPTY);
    setIsArchived(false);
    setIsEditing(true);
    await loadSavedDates();
  };

  // Inputs desabilitados quando em modo leitura ou arquivado
  const inputDisabled = !isEditing || isArchived;

  const numCls = `w-20 bg-white dark:bg-slate-800 border ${
    isDark ? 'border-slate-600' : 'border-slate-300'
  } rounded-md py-1.5 px-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center disabled:opacity-60 disabled:cursor-default`;

  const rowCls = 'flex items-center gap-2 flex-wrap';
  const labelCls = `text-sm font-bold shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;
  const unitCls = 'text-sm text-slate-500 dark:text-slate-400';
  const descCls = 'text-xs text-slate-400 italic hidden sm:inline';

  return (
    <div className={`space-y-4 p-3 sm:p-4 rounded-xl border ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-rounded text-[22px] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            monitor_heart
          </span>
          <h3 className={`font-bold text-lg sm:text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Controles e Saídas
          </h3>
          {/* Badge de modo */}
          {!loading && rowId && !isArchived && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isEditing
                ? 'bg-blue-500 text-white'
                : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {isEditing ? 'Editando' : 'Visualizando'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setShowDatePicker(false); }}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          />
          {savedDates.length > 0 && (
            <button
              onClick={() => setShowDatePicker(v => !v)}
              title="Ver datas com registros"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                showDatePicker
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : isDark
                    ? 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'
              }`}
            >
              📅 {savedDates.length}
            </button>
          )}
        </div>
      </div>

      {/* Botões de datas salvas — visível só quando aberto */}
      {showDatePicker && savedDates.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {savedDates.map(d => (
            <button
              key={d}
              onClick={() => { setSelectedDate(d); setShowDatePicker(false); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                d === selectedDate
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
              }`}
            >
              {formatDateBR(d)}
            </button>
          ))}
        </div>
      )}

      {/* Banner: arquivado */}
      {isArchived && (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${
          isDark
            ? 'bg-amber-900/20 border-amber-700/50 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <span className="material-symbols-rounded text-[18px]">archive</span>
          <span className="text-sm font-semibold">Dia arquivado — somente leitura</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {/* Controles */}
          <div className="space-y-2">
            <CollapsibleHeader
              label="Controles"
              icon="vital_signs"
              open={openControles}
              onToggle={() => setOpenControles(p => !p)}
              isDark={isDark}
            />
            {openControles && (
              <div className={`px-3 sm:px-4 pb-4 pt-3 space-y-3 rounded-b-xl border-x border-b ${
                isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Delta de Sinais Vitais
                </p>
                {VITAIS.map(({ minKey, maxKey, label, unit, desc }) => (
                  <div key={minKey} className={rowCls}>
                    <span className={`${labelCls} w-16`}>{label}:</span>
                    <input type="text" inputMode="decimal" className={numCls}
                      value={data[minKey as keyof Data]}
                      onChange={e => setNum(minKey as keyof Data, e.target.value)}
                      placeholder="mín"
                      disabled={inputDisabled} />
                    <span className={unitCls}>a</span>
                    <input type="text" inputMode="decimal" className={numCls}
                      value={data[maxKey as keyof Data]}
                      onChange={e => setNum(maxKey as keyof Data, e.target.value)}
                      placeholder="máx"
                      disabled={inputDisabled} />
                    <span className={unitCls}>{unit}</span>
                    <span className={descCls}>({desc})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saídas */}
          <div className="space-y-2">
            <CollapsibleHeader
              label="Saídas"
              icon="output"
              open={openSaidas}
              onToggle={() => setOpenSaidas(p => !p)}
              isDark={isDark}
            />
            {openSaidas && (
              <div className={`px-3 sm:px-4 pb-4 pt-3 space-y-4 rounded-b-xl border-x border-b ${
                isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'
              }`}>

                {/* Evacuações */}
                <div className="space-y-3">
                  <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Eliminações
                  </p>
                  <div className={rowCls}>
                    <span className={`${labelCls} w-36`}>EVACUAÇÕES:</span>
                    <input type="text" inputMode="decimal" className={numCls} value={data.evacuacoes}
                      onChange={e => setNum('evacuacoes', e.target.value)}
                      disabled={inputDisabled} />
                    <span className={unitCls}>g/ml</span>
                  </div>
                </div>

                {/* Drenos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Drenos
                      </p>
                      {activeDrenos.size > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-blue-500 text-white font-bold">
                            {activeDrenos.size}
                          </span>
                          {DRENO_OPTIONS.filter(({ key }) => activeDrenos.has(key)).map(({ key, label }) => (
                            <span key={key} className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                              isDark
                                ? 'bg-blue-900/40 text-blue-300 border-blue-700/60'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {key === 'outros_drenos' && data.outros_drenos_label ? data.outros_drenos_label : label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {isEditing && !isArchived && (
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setDrenoDropdownOpen(p => !p)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            isDark
                              ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="material-symbols-rounded text-[16px]">add</span>
                          Selecionar Dreno
                          <span className={`material-symbols-rounded text-[14px] transition-transform ${drenoDropdownOpen ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>

                        {drenoDropdownOpen && (
                          <div className={`absolute right-0 top-full mt-1 z-20 w-72 rounded-xl border shadow-lg overflow-hidden ${
                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            <p className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b ${
                              isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'
                            }`}>
                              Selecione os drenos ativos
                            </p>
                            {DRENO_OPTIONS.map(({ key, label }) => {
                              const isActive = activeDrenos.has(key);
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => toggleDreno(key)}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                    isDark
                                      ? isActive ? 'bg-blue-900/40 hover:bg-blue-900/60' : 'hover:bg-slate-700'
                                      : isActive ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <span className={`material-symbols-rounded text-[20px] ${
                                    isActive ? 'text-blue-500' : isDark ? 'text-slate-600' : 'text-slate-300'
                                  }`}>
                                    {isActive ? 'check_box' : 'check_box_outline_blank'}
                                  </span>
                                  <span className={`text-sm ${
                                    isActive
                                      ? isDark ? 'text-blue-300 font-semibold' : 'text-blue-700 font-semibold'
                                      : isDark ? 'text-slate-300' : 'text-slate-700'
                                  }`}>
                                    {label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {activeDrenos.size === 0 ? (
                    <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isEditing ? 'Nenhum dreno selecionado. Clique em "Selecionar Dreno" para adicionar.' : 'Nenhum dreno registrado.'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {DRENO_OPTIONS.filter(({ key }) => activeDrenos.has(key)).map(({ key, label }) => (
                        <div key={key} className={`flex items-center gap-2 flex-wrap p-2 rounded-lg ${
                          isDark ? 'bg-slate-700/50' : 'bg-blue-50/60'
                        }`}>
                          {isEditing && !isArchived && (
                            <button
                              type="button"
                              onClick={() => toggleDreno(key)}
                              title="Remover dreno"
                              className={`shrink-0 transition-colors ${isDark ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                            >
                              <span className="material-symbols-rounded text-[18px]">close</span>
                            </button>
                          )}
                          <span className={`text-sm font-semibold shrink-0 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            {label}:
                          </span>
                          {key === 'outros_drenos' && (
                            <input
                              type="text"
                              className={`flex-1 min-w-[120px] bg-white dark:bg-slate-800 border ${
                                isDark ? 'border-slate-600' : 'border-slate-300'
                              } rounded-md py-1.5 px-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-60 disabled:cursor-default`}
                              value={data.outros_drenos_label}
                              onChange={e => set('outros_drenos_label', e.target.value)}
                              placeholder="Descreva o dreno..."
                              disabled={inputDisabled}
                            />
                          )}
                          <input
                            type="text"
                            inputMode="decimal"
                            className={numCls}
                            value={data[key as keyof Data]}
                            onChange={e => setNum(key as keyof Data, e.target.value)}
                            placeholder="valor"
                            disabled={inputDisabled}
                          />
                          <span className={unitCls}>ml/24h</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TSR */}
                <div className="space-y-2">
                  <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    TSR — Terapia de Substituição Renal
                  </p>
                  <div className={rowCls}>
                    <span className={`${labelCls} w-48`}>HEMODIÁLISE:</span>
                    <input type="text" inputMode="decimal" className={numCls} value={data.hemodialise}
                      onChange={e => setNum('hemodialise', e.target.value)}
                      disabled={inputDisabled} />
                    <span className={unitCls}>ml/24h</span>
                  </div>
                  <div className={rowCls}>
                    <span className={`${labelCls} w-48`}>DIÁLISE PERITONEAL:</span>
                    <input type="text" inputMode="decimal" className={numCls} value={data.dialise_peritoneal}
                      onChange={e => setNum('dialise_peritoneal', e.target.value)}
                      disabled={inputDisabled} />
                    <span className={unitCls}>ml/24h</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auditoria */}
          {(createdBy || updatedBy) && (
            <div className={`text-xs px-1 space-y-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {createdBy && <p>Criado por: <span className="font-semibold">{createdBy}</span></p>}
              {updatedBy && updatedBy !== createdBy && (
                <p>Editado por: <span className="font-semibold">{updatedBy}</span></p>
              )}
            </div>
          )}

          {/* Botões de ação */}
          {!isArchived && !readOnly && (
            <div className="space-y-2">

              {/* Modo leitura: botão Editar */}
              {rowId && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border transition-colors ${
                    isDark
                      ? 'border-blue-600 text-blue-400 hover:bg-blue-900/20'
                      : 'border-blue-400 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="material-symbols-rounded text-[20px]">edit</span>
                  Editar
                </button>
              )}

              {/* Modo edição: botão Salvar + Cancelar */}
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                      saving
                        ? isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : savedOk
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white'
                    }`}
                  >
                    {saving ? (
                      <><div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />Salvando...</>
                    ) : savedOk ? (
                      <><span className="material-symbols-rounded text-[20px]">check_circle</span>Salvo!</>
                    ) : (
                      <><span className="material-symbols-rounded text-[20px]">save</span>Salvar — {formatDateBR(selectedDate)}</>
                    )}
                  </button>
                  {rowId && (
                    <button
                      onClick={handleCancel}
                      className={`px-4 py-3 rounded-xl font-bold text-sm border transition-colors ${
                        isDark
                          ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              )}

              {/* Botão Arquivar — visível quando há dados e não está arquivado */}
              {rowId && (
                archiveConfirm ? (
                  <div className={`flex flex-col gap-2 p-3 rounded-xl border ${
                    isDark ? 'border-amber-700/50 bg-amber-900/20' : 'border-amber-200 bg-amber-50'
                  }`}>
                    <p className={`text-sm font-semibold text-center ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      Quer arquivar o dia {formatDateBR(selectedDate)}?
                    </p>
                    <p className={`text-xs text-center ${isDark ? 'text-amber-400/70' : 'text-amber-600/80'}`}>
                      Os dados ficarão apenas no histórico e não poderão ser editados.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleArchive}
                        disabled={archiving}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-60"
                      >
                        {archiving
                          ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          : <span className="material-symbols-rounded text-[18px]">check</span>
                        }
                        Sim, arquivar
                      </button>
                      <button
                        onClick={() => setArchiveConfirm(false)}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-sm border transition-colors ${
                          isDark
                            ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                            : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setArchiveConfirm(true)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm border transition-colors ${
                      isDark
                        ? 'border-amber-700/60 text-amber-400 hover:bg-amber-900/20'
                        : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <span className="material-symbols-rounded text-[18px]">archive</span>
                    Arquivar Dia — {formatDateBR(selectedDate)}
                  </button>
                )
              )}
            </div>
          )}

          {/* Botão Apagar — visível mesmo quando arquivado */}
          {rowId && !readOnly && (
            deleteConfirm ? (
              <div className={`flex flex-col gap-2 p-3 rounded-xl border ${
                isDark ? 'border-red-700/50 bg-red-900/20' : 'border-red-200 bg-red-50'
              }`}>
                <p className={`text-sm font-semibold text-center ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                  Tem certeza que quer apagar os dados do dia {formatDateBR(selectedDate)}?
                </p>
                <p className={`text-xs text-center ${isDark ? 'text-red-400/70' : 'text-red-600/80'}`}>
                  Esta ação é irreversível. Os dados serão excluídos permanentemente.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60"
                  >
                    {deleting
                      ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      : <span className="material-symbols-rounded text-[18px]">delete</span>
                    }
                    Sim, apagar
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm border transition-colors ${
                      isDark
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className={`w-full flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl font-bold text-sm border transition-colors ${
                  isDark
                    ? 'border-red-700/60 text-red-400 hover:bg-red-900/20'
                    : 'border-red-300 text-red-600 hover:bg-red-50'
                }`}
              >
                <span className="material-symbols-rounded text-[18px]">delete</span>
                Apagar Dia — {formatDateBR(selectedDate)}
              </button>
            )
          )}
        </>
      )}
    </div>
  );
};

export default ControlesSaidasSection;
