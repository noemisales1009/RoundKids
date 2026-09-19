import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { sanitizeText } from '../lib/sanitize';
import { Turno, turnoAtualSP } from '../lib/turno';

const TURNOS: { id: Turno; label: string; icon: string }[] = [
  { id: 'manha', label: 'Manhã', icon: '🌅' },
  { id: 'tarde', label: 'Tarde', icon: '☀️' },
  { id: 'noite', label: 'Noite', icon: '🌙' },
];

interface ClinicalSituation24hCardProps {
  patientId: number | string;
  userId?: string;
}

type ClinicalSituationRow = {
  id: string;
  situacao_texto: string;
  created_by: string;
  visible_until: string;
  created_at: string;
  turno?: string | null;
};

export const ClinicalSituation24hCard: React.FC<ClinicalSituation24hCardProps> = ({ patientId, userId }) => {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notas, setNotas] = useState<ClinicalSituationRow[]>([]);
  const [turno, setTurno] = useState<Turno>(turnoAtualSP);
  // Cada turno tem a sua evolução. Registros antigos, sem turno, contam como Manhã.
  const activeNote = notas.find(n => (n.turno ?? 'manha') === turno) ?? null;

  const loadActiveSituation = async () => {
    setLoading(true);
    setError(null);

    const nowIso = new Date().toISOString();
    const { data, error: fetchError } = await supabase
      .from('clinical_situations_24h')
      .select('id, situacao_texto, created_by, visible_until, created_at, turno')
      .eq('patient_id', patientId)
      .gt('visible_until', nowIso)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(30);

    if (fetchError) {
      setError('Não foi possível carregar a avaliação clínica.');
      setNotas([]);
      setLoading(false);
      return;
    }

    setNotas((data as ClinicalSituationRow[] | null) || []);
    setLoading(false);
  };

  // Ao trocar de turno (ou recarregar), o campo mostra o texto daquele turno
  useEffect(() => {
    setText(activeNote?.situacao_texto || '');
    setEditing(false);
    setConfirmArchive(false);
    setError(null);
  }, [turno, notas]);

  useEffect(() => {
    setEditing(false);
    loadActiveSituation();
  }, [patientId]);

  const handleSave = async () => {
    const finalText = sanitizeText(text, 5000);
    if (!finalText) { setError('Digite um texto antes de salvar.'); return; }
    if (!userId) { setError('Usuário não autenticado. Faça login novamente.'); return; }

    setSaving(true);
    setError(null);

    if (activeNote) {
      const { error: updateError } = await supabase
        .from('clinical_situations_24h')
        .update({ situacao_texto: finalText, updated_by: userId })
        .eq('id', activeNote.id);

      if (updateError) {
        setError('Não foi possível atualizar a situação clínica.');
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('clinical_situations_24h')
        .insert({ patient_id: patientId, situacao_texto: finalText, created_by: userId, updated_by: userId, turno });

      if (insertError) {
        setError('Não foi possível salvar a situação clínica.');
        setSaving(false);
        return;
      }
    }

    await loadActiveSituation();
    setEditing(false);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancelEdit = () => {
    setText(activeNote?.situacao_texto || '');
    setEditing(false);
    setError(null);
  };

  const handleArchive = async () => {
    if (!activeNote) return;

    setSaving(true);
    setError(null);
    setConfirmArchive(false);

    const { error: archiveError } = await supabase
      .from('clinical_situations_24h')
      .update({ archived_at: new Date().toISOString(), updated_by: userId ?? null })
      .eq('id', activeNote.id);

    if (archiveError) {
      setError('Não foi possível arquivar a situação clínica.');
      setSaving(false);
      return;
    }

    setText('');
    setNotas(prev => prev.filter(n => n.id !== activeNote.id));
    setSaving(false);
    setArchived(true);
    setTimeout(() => setArchived(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Avaliação clínica</h3>
        <div className="flex items-center gap-2">
          {activeNote && !confirmArchive && !editing && (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition disabled:opacity-60"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setConfirmArchive(true)}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-semibold transition disabled:opacity-60"
              >
                Arquivar
              </button>
            </>
          )}
          {activeNote && editing && (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !userId}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition disabled:opacity-60"
              >
                Cancelar
              </button>
            </>
          )}
          {confirmArchive && (
            <>
              <span className="text-sm text-slate-500 dark:text-slate-400">Confirmar arquivamento?</span>
              <button
                type="button"
                onClick={handleArchive}
                disabled={saving}
                className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition disabled:opacity-60"
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setConfirmArchive(false)}
                disabled={saving}
                className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-sm transition"
              >
                Não
              </button>
            </>
          )}
          {!confirmArchive && !activeNote && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading || !userId}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 mb-3">
        {TURNOS.map(t => {
          const preenchido = notas.some(n => (n.turno ?? 'manha') === t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTurno(t.id)}
              disabled={saving}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                turno === t.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{t.icon}</span>{t.label}
              {preenchido && <span className={`w-2 h-2 rounded-full ${turno === t.id ? 'bg-white' : 'bg-emerald-500'}`} />}
            </button>
          );
        })}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading || saving || (!!activeNote && !editing)}
        readOnly={!!activeNote && !editing}
        placeholder={`Digite aqui a avaliação clínica da ${TURNOS.find(t => t.id === turno)!.label.toLowerCase()}...`}
        rows={4}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-200 disabled:opacity-70"
      />

      {loading && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Carregando avaliação clínica...</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
      {saved && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">Avaliação clínica salva com sucesso.</p>
      )}
      {archived && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">Avaliação arquivada. O campo está pronto para uma nova entrada.</p>
      )}
    </div>
  );
};
