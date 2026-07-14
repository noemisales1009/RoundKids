import React, { useEffect, useState, useCallback, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { UserContext, NotificationContext } from '../contexts';
import { escapeHtml } from '../lib/sanitize';

interface NotificacaoRecord {
  id: string;
  data_hora: string;
  tipo_natureza: string[] | null;
  tipo_natureza_outros: string | null;
  gravidade: string | null;
  profissional: string | null;
  local_evento: string | null;
  descricao: string | null;
  conduta_descricao: string | null;
  tempo_resposta: string | null;
  desfecho: string | null;
  notificacao: string[] | null;
  causa: string[] | null;
  causa_outros: string | null;
  created_at: string;
  bed_number?: number | null;
  patient_name?: string | null;
}

interface Props {
  patientId: string;
  patientName: string;
  bedNumber?: number;
  prontuario?: string;
  refresh?: number;
}

const GRAVIDADE_LABEL: Record<string, string> = {
  quase_evento:  'Quase evento (near miss)',
  sem_dano:      'Evento sem dano',
  dano_leve:     'Evento com dano leve',
  dano_moderado: 'Evento com dano moderado',
  grave:         'Evento grave',
  sentinela:     'Evento sentinela',
};

const GRAVIDADE_COLOR: Record<string, string> = {
  quase_evento:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  sem_dano:      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  dano_leve:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  dano_moderado: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  grave:         'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  sentinela:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const TIPO_LABEL: Record<string, string> = {
  assistencial:  'Assistencial',
  medicamentoso: 'Medicamentoso',
  dispositivo:   'Dispositivo/Equipamento',
  iras:          'IRAS',
  procedimento:  'Procedimento invasivo',
  comunicacao:   'Comunicação/Fluxo',
  queda:         'Queda/Lesão',
  outros_nat:    'Outros',
};

const TEMPO_LABEL: Record<string, string> = {
  imediato: 'Imediato (< 5 min)',
  '5_15min': '5–15 min',
  mais15:   '> 15 min',
};

const DESFECHO_LABEL: Record<string, string> = {
  estabilizado:  'Estabilizado',
  instavel:      'Instável em acompanhamento',
  escalonamento: 'Necessidade de escalonamento',
  obito:         'Óbito',
};

const NOTIF_LABEL: Record<string, string> = {
  sistema_interno: 'Sistema interno',
  notivisa:        'Notivisa',
  epidemiologica:  'Notificação epidemiológica',
};

const CAUSA_LABEL: Record<string, string> = {
  humano:      'Fator humano',
  processo:    'Processo',
  equipamento: 'Equipamento',
  comunicacao: 'Comunicação',
  sobrecarga:  'Sobrecarga assistencial',
  outros_cau:  'Outros',
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const generatePDF = (n: NotificacaoRecord, patientName: string, bedNumber?: number, prontuario?: string) => {
  const gravBadgeColor: Record<string, string> = {
    quase_evento:  '#2563eb', sem_dano: '#16a34a', dano_leve: '#ca8a04',
    dano_moderado: '#ea580c', grave: '#dc2626', sentinela: '#7c3aed',
  };
  const badgeColor = n.gravidade ? (gravBadgeColor[n.gravidade] ?? '#64748b') : '#64748b';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Notificação de Evento – ${patientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #1e293b; background: #fff; }

    .header {
      border-bottom: 3px solid ${badgeColor};
      padding: 18px 24px 12px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .header-title { font-size: 14pt; font-weight: bold; color: #0f172a; letter-spacing: 0.01em; }
    .header-sub { font-size: 8.5pt; color: #64748b; margin-top: 3px; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 99px;
      font-size: 8.5pt;
      font-weight: bold;
      color: #fff;
      background: ${badgeColor};
      white-space: nowrap;
    }

    .patient-bar {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .patient-label { font-size: 7.5pt; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
    .patient-name { font-size: 12pt; font-weight: bold; color: #0f172a; }
    .patient-date { font-size: 8.5pt; color: #64748b; text-align: right; }
    .patient-date-label { font-size: 7.5pt; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }

    .body { padding: 16px 24px; }

    .section { margin-bottom: 14px; }
    .section-title {
      font-size: 8pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #475569;
      border-left: 3px solid ${badgeColor};
      padding: 4px 10px;
      margin-bottom: 8px;
      background: #f8fafc;
    }
    .section-body { padding: 0 2px; }

    .field { display: flex; gap: 6px; margin: 4px 0; font-size: 10pt; line-height: 1.5; }
    .field-label { font-weight: bold; color: #475569; white-space: nowrap; }
    .field-value { color: #1e293b; }

    .text-block {
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #334155;
      min-height: 30px;
    }

    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .info-box { border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; }
    .info-box-label { font-size: 7.5pt; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 2px; }
    .info-box-value { font-size: 10pt; font-weight: 600; color: #1e293b; }

    .tag-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .tag { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 8.5pt;
      font-weight: 600; border: 1px solid #cbd5e1; color: #334155; }

    .footer {
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding: 8px 24px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #94a3b8;
    }
    @page { margin: 14mm 12mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="header-title">Notificação de Evento Adverso</div>
      <div class="header-sub">UTI Pediátrica — RoundKids</div>
    </div>
    ${n.gravidade ? `<span class="badge">${escapeHtml(GRAVIDADE_LABEL[n.gravidade] ?? n.gravidade)}</span>` : ''}
  </div>

  <div class="patient-bar">
    <div>
      <div class="patient-label">Paciente</div>
      <div class="patient-name">${escapeHtml(n.patient_name ?? patientName)}</div>
      <div style="display:flex;gap:12px;margin-top:3px;">
        ${(n.bed_number ?? bedNumber) ? `<span style="font-size:8.5pt;color:#2563eb;font-weight:600;">Leito ${escapeHtml(n.bed_number ?? bedNumber)}</span>` : ''}
        ${prontuario ? `<span style="font-size:8.5pt;color:#64748b;">Pront. ${escapeHtml(prontuario)}</span>` : ''}
      </div>
    </div>
    <div class="patient-date">
      <div class="patient-date-label">Data do evento</div>
      <div>${fmtDateTime(n.data_hora)}</div>
    </div>
  </div>

  <div class="body">

    <div class="section">
      <div class="section-title">1. Identificação do Evento</div>
      <div class="section-body">
        <div class="grid2">
          <div class="info-box">
            <div class="info-box-label">Profissional</div>
            <div class="info-box-value">${escapeHtml(n.profissional ?? '—')}</div>
          </div>
          <div class="info-box">
            <div class="info-box-label">Local / Leito</div>
            <div class="info-box-value">${escapeHtml(n.local_evento ?? '—')}</div>
          </div>
        </div>
        ${n.tipo_natureza && n.tipo_natureza.length ? `
          <div class="info-box-label" style="margin-bottom:4px">Tipo de evento – natureza</div>
          <div class="tag-list">
            ${n.tipo_natureza.map(t => `<span class="tag">${escapeHtml(TIPO_LABEL[t] ?? t)}</span>`).join('')}
            ${n.tipo_natureza_outros ? `<span class="tag">${escapeHtml(n.tipo_natureza_outros)}</span>` : ''}
          </div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">2. Descrição Objetiva do Evento</div>
      <div class="section-body">
        <div class="text-block">${escapeHtml(n.descricao ?? '—')}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">3. Conduta Imediata Realizada</div>
      <div class="section-body">
        <div class="text-block" style="margin-bottom:8px">${escapeHtml(n.conduta_descricao ?? '—')}</div>
        ${n.tempo_resposta ? `<div class="field"><span class="field-label">Tempo de resposta:</span><span class="field-value">${escapeHtml(TEMPO_LABEL[n.tempo_resposta] ?? n.tempo_resposta)}</span></div>` : ''}
      </div>
    </div>

    <div class="grid2">
      <div class="section">
        <div class="section-title">4. Desfecho Imediato</div>
        <div class="section-body">
          <div class="text-block">${n.desfecho ? escapeHtml(DESFECHO_LABEL[n.desfecho] ?? n.desfecho) : '—'}</div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">5. Notificação Institucional</div>
        <div class="section-body">
          ${(n.notificacao ?? []).length ? `<div class="tag-list">${(n.notificacao ?? []).map(v => `<span class="tag">${escapeHtml(NOTIF_LABEL[v] ?? v)}</span>`).join('')}</div>` : '<div class="text-block">—</div>'}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">6. Análise Inicial da Causa</div>
      <div class="section-body">
        ${(n.causa ?? []).length ? `<div class="tag-list">${(n.causa ?? []).map(v => `<span class="tag">${escapeHtml(CAUSA_LABEL[v] ?? v)}</span>`).join('')}${n.causa_outros ? `<span class="tag">${escapeHtml(n.causa_outros)}</span>` : ''}</div>` : '<p>—</p>'}
      </div>
    </div>

  </div>

  <div class="footer">
    <span>Gerado em ${new Date().toLocaleString('pt-BR')}</span>
    <span>RoundKids – UTI Pediátrica</span>
  </div>

</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) { alert('Permita pop-ups para gerar o PDF.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
};

export const NotificacoesListCard: React.FC<Props> = ({ patientId, patientName, bedNumber, prontuario, refresh }) => {
  const { user } = useContext(UserContext)!;
  const { showNotification } = useContext(NotificationContext)!;
  const [list, setList] = useState<NotificacaoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notificacoes_eventos_paciente')
        .select('*')
        .eq('patient_id', patientId)
        .is('archived_at', null)
        .order('data_hora', { ascending: false });
      setList(data ?? []);
    } catch (e) {
      console.error('Erro ao carregar notificações:', e);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load, refresh]);

  const handleArchive = async (id: string) => {
    if (!confirm('Arquivar esta notificação como resolvida?')) return;
    setArchivingId(id);
    try {
      const { error } = await supabase
        .from('notificacoes_eventos_paciente')
        .update({ archived_at: new Date().toISOString(), archived_by: user?.id ?? null })
        .eq('id', id);
      if (error) throw error;
      setList(prev => prev.filter(n => n.id !== id));
      showNotification({ message: 'Notificação arquivada.', type: 'success' });
    } catch (e: any) {
      showNotification({ message: `Erro ao arquivar: ${e.message}`, type: 'error' });
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-[20px] text-slate-500 dark:text-slate-400">folder_open</span>
          <span className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            Notificações de Eventos
          </span>
          {list.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500 text-white">
              {list.length}
            </span>
          )}
        </div>
        <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
              Nenhuma notificação registrada.
            </p>
          ) : (
            <div className="space-y-2">
              {list.map(n => (
                <div
                  key={n.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {fmtDateTime(n.data_hora)}
                        </p>
                        {n.gravidade && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${GRAVIDADE_COLOR[n.gravidade] ?? 'bg-slate-200 text-slate-600'}`}>
                            {GRAVIDADE_LABEL[n.gravidade] ?? n.gravidade}
                          </span>
                        )}
                      </div>

                      {n.tipo_natureza && n.tipo_natureza.length > 0 && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {n.tipo_natureza.map(t => TIPO_LABEL[t] ?? t).join(', ')}
                          {n.tipo_natureza_outros ? ` – ${n.tipo_natureza_outros}` : ''}
                        </p>
                      )}

                      {n.descricao && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">
                          {n.descricao}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => generatePDF(n, patientName, bedNumber, prontuario)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition"
                        title="Gerar PDF"
                      >
                        <span className="material-symbols-rounded text-[15px]">picture_as_pdf</span>
                        PDF
                      </button>
                      <button
                        onClick={() => handleArchive(n.id)}
                        disabled={archivingId === n.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                        title="Arquivar como resolvido"
                      >
                        <span className="material-symbols-rounded text-[15px]">check_circle</span>
                        Resolvido
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
