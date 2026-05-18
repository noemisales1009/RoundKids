import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { sanitizeText } from '../lib/sanitize';

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
};

export const ClinicalSituation24hCard: React.FC<ClinicalSituation24hCardProps> = ({ patientId, userId }) => {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<ClinicalSituationRow | null>(null);

  const loadActiveSituation = async () => {
    setLoading(true);
    setError(null);

    const nowIso = new Date().toISOString();
    const { data, error: fetchError } = await supabase
      .from('clinical_situations_24h')
      .select('id, situacao_texto, created_by, visible_until, created_at')
      .eq('patient_id', patientId)
      .gt('visible_until', nowIso)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      setError('Não foi possível carregar a situação clínica de 24h.');
      setActiveNote(null);
      setText('');
      setLoading(false);
      return;
    }

    setActiveNote((data as ClinicalSituationRow | null) || null);
    setText(data?.situacao_texto || '');
    setLoading(false);
  };

  useEffect(() => {
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
        .insert({ patient_id: patientId, situacao_texto: finalText, created_by: userId, updated_by: userId });

      if (insertError) {
        setError('Não foi possível salvar a situação clínica.');
        setSaving(false);
        return;
      }
    }

    await loadActiveSituation();
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
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
    setActiveNote(null);
    setSaving(false);
    setArchived(true);
    setTimeout(() => setArchived(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Situação clínica nas últimas 24 horas</h3>
        <div className="flex items-center gap-2">
          {activeNote && !confirmArchive && (
            <button
              type="button"
              onClick={() => setConfirmArchive(true)}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-semibold transition disabled:opacity-60"
            >
              Arquivar
            </button>
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
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          )}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading || saving || !!activeNote}
        readOnly={!!activeNote}
        placeholder="Digite aqui a evolução/situação clínica das últimas 24 horas..."
        rows={4}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 disabled:opacity-70"
      />

      {loading && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Carregando situação clínica...</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
      {saved && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">Situação clínica salva com sucesso.</p>
      )}
      {archived && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">Situação arquivada. O campo está pronto para uma nova entrada.</p>
      )}
    </div>
  );
};
