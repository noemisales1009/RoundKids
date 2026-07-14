import React, { useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { UserContext, NotificationContext } from '../contexts';

interface Props {
  patientId: string;
  bedNumber?: number;
  patientName?: string;
  onSaved?: () => void;
}

const TIPO_NATUREZA = [
  { value: 'assistencial',   label: 'Assistencial' },
  { value: 'medicamentoso',  label: 'Medicamentoso' },
  { value: 'dispositivo',    label: 'Dispositivo / Equipamento' },
  { value: 'iras',           label: 'Infecção relacionada à assistência (IRAS)' },
  { value: 'procedimento',   label: 'Procedimento invasivo' },
  { value: 'comunicacao',    label: 'Comunicação / Fluxo' },
  { value: 'queda',          label: 'Queda / Lesão' },
  { value: 'outros_nat',     label: 'Outros' },
];

const GRAVIDADE = [
  { value: 'quase_evento',   label: 'Quase evento (near miss) – não atingiu o paciente' },
  { value: 'sem_dano',       label: 'Evento sem dano' },
  { value: 'dano_leve',      label: 'Evento com dano leve (sem risco imediato à vida)' },
  { value: 'dano_moderado',  label: 'Evento com dano moderado (necessita intervenção)' },
  { value: 'grave',          label: 'Evento grave (ameaça à vida / instabilidade)' },
  { value: 'sentinela',      label: 'Evento sentinela (óbito ou dano grave permanente)' },
];

const TEMPO_RESPOSTA = [
  { value: 'imediato',  label: 'Imediato (< 5 min)' },
  { value: '5_15min',   label: '5 – 15 min' },
  { value: 'mais15',    label: '> 15 min' },
];

const DESFECHO = [
  { value: 'estabilizado',   label: 'Estabilizado' },
  { value: 'instavel',       label: 'Instável em acompanhamento' },
  { value: 'escalonamento',  label: 'Necessidade de escalonamento (ex: VM, droga vasoativa)' },
  { value: 'obito',          label: 'Óbito' },
];

const NOTIFICACAO = [
  { value: 'sistema_interno', label: 'Inserido em sistema interno' },
  { value: 'notivisa',        label: 'Notificado no Notivisa' },
  { value: 'epidemiologica',  label: 'Notificação epidemiológica (se aplicável)' },
];

const CAUSA = [
  { value: 'humano',      label: 'Fator humano' },
  { value: 'processo',    label: 'Processo' },
  { value: 'equipamento', label: 'Equipamento' },
  { value: 'comunicacao', label: 'Comunicação' },
  { value: 'sobrecarga',  label: 'Sobrecarga assistencial' },
  { value: 'outros_cau',  label: 'Outros' },
];

const nowLocal = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 mt-1">{children}</p>
);

const CheckRow: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  radio?: boolean;
}> = ({ checked, onChange, label, radio }) => (
  <label className="flex items-start gap-2 cursor-pointer group">
    <input
      type={radio ? 'radio' : 'checkbox'}
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="mt-0.5 shrink-0 accent-red-500"
    />
    <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white leading-snug">
      {label}
    </span>
  </label>
);

export const NotificacaoEventoCard: React.FC<Props> = ({ patientId, bedNumber, patientName, onSaved }) => {
  const { user } = useContext(UserContext)!;
  const { showNotification } = useContext(NotificationContext)!;

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dataHora, setDataHora] = useState(nowLocal());
  const [tipoNatureza, setTipoNatureza] = useState<string[]>([]);
  const [tipoOutros, setTipoOutros] = useState('');
  const [gravidade, setGravidade] = useState('');
  const [profissional, setProfissional] = useState(user?.name ?? '');
  const [local, setLocal] = useState(bedNumber ? `Leito ${bedNumber}` : '');
  const [descricao, setDescricao] = useState('');
  const [conduta, setConduta] = useState('');
  const [tempoResposta, setTempoResposta] = useState('');
  const [desfecho, setDesfecho] = useState('');
  const [notificacao, setNotificacao] = useState<string[]>([]);
  const [causa, setCausa] = useState<string[]>([]);
  const [causaOutros, setCausaOutros] = useState('');

  const toggleArr = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const handleSave = async () => {
    if (!dataHora) {
      showNotification({ message: 'Informe a data e hora do evento.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('notificacoes_eventos_paciente').insert({
        patient_id: patientId,
        patient_name: patientName ?? null,
        bed_number: bedNumber ?? null,
        data_hora: new Date(dataHora).toISOString(),
        tipo_natureza: tipoNatureza,
        tipo_natureza_outros: tipoOutros || null,
        gravidade: gravidade || null,
        profissional: profissional || null,
        local_evento: local || null,
        descricao: descricao || null,
        conduta_descricao: conduta || null,
        tempo_resposta: tempoResposta || null,
        desfecho: desfecho || null,
        notificacao,
        causa,
        causa_outros: causaOutros || null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
      showNotification({ message: 'Notificação salva com sucesso!', type: 'success' });
      onSaved?.();
      // reset
      setDataHora(nowLocal());
      setTipoNatureza([]); setTipoOutros(''); setGravidade('');
      setProfissional(user?.name ?? ''); setLocal(bedNumber ? `Leito ${bedNumber}` : ''); setDescricao('');
      setConduta(''); setTempoResposta(''); setDesfecho('');
      setNotificacao([]); setCausa([]); setCausaOutros('');
      setOpen(false);
    } catch (e: any) {
      showNotification({ message: `Erro ao salvar: ${e.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-slate-400 dark:placeholder-slate-500";
  const textareaCls = inputCls + " resize-none";
  const divider = <div className="border-t border-slate-200 dark:border-slate-700 my-1" />;

  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition text-left"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-[20px] text-orange-500">notification_important</span>
          <span className="font-bold text-sm text-orange-700 dark:text-orange-400 uppercase tracking-wide">
            Notificação de Evento Adverso (UTI Ped)
          </span>
        </div>
        <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-5 pt-4 space-y-4">

          {/* Paciente */}
          {(patientName || bedNumber) && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                {patientName && <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{patientName}</p>}
                {bedNumber && <p className="text-xs text-primary-500 font-semibold uppercase tracking-wide">Leito {bedNumber}</p>}
              </div>
            </div>
          )}

          {/* 1. IDENTIFICAÇÃO */}
          <div>
            <SectionTitle>1. Identificação do Evento</SectionTitle>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Data / Hora</label>
                <input type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Tipo de evento – por natureza</label>
                <div className="space-y-1.5 pl-1">
                  {TIPO_NATUREZA.map(t => (
                    <CheckRow
                      key={t.value}
                      checked={tipoNatureza.includes(t.value)}
                      onChange={() => setTipoNatureza(prev => toggleArr(prev, t.value))}
                      label={t.label}
                    />
                  ))}
                  {tipoNatureza.includes('outros_nat') && (
                    <input
                      type="text"
                      placeholder="Especifique..."
                      value={tipoOutros}
                      onChange={e => setTipoOutros(e.target.value)}
                      className={inputCls + ' mt-1'}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Gravidade</label>
                <div className="space-y-1.5 pl-1">
                  {GRAVIDADE.map(g => (
                    <CheckRow
                      key={g.value}
                      radio
                      checked={gravidade === g.value}
                      onChange={() => setGravidade(g.value)}
                      label={g.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Profissional que identificou</label>
                <input type="text" placeholder="Nome / categoria..." value={profissional} onChange={e => setProfissional(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Local (leito / procedimento)</label>
                <input type="text" placeholder="Ex: Leito 5, sala de procedimento..." value={local} onChange={e => setLocal(e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {divider}

          {/* 2. DESCRIÇÃO */}
          <div>
            <SectionTitle>2. Descrição Objetiva do Evento</SectionTitle>
            <textarea
              rows={3}
              placeholder="Curta, factual, sem julgamento..."
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className={textareaCls}
            />
          </div>

          {divider}

          {/* 3. CONDUTA IMEDIATA */}
          <div>
            <SectionTitle>3. Conduta Imediata Realizada</SectionTitle>
            <div className="space-y-3">
              <textarea
                rows={3}
                placeholder="Descreva a conduta imediata realizada..."
                value={conduta}
                onChange={e => setConduta(e.target.value)}
                className={textareaCls}
              />
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Tempo de resposta</label>
                <div className="space-y-1.5 pl-1">
                  {TEMPO_RESPOSTA.map(t => (
                    <CheckRow
                      key={t.value}
                      radio
                      checked={tempoResposta === t.value}
                      onChange={() => setTempoResposta(t.value)}
                      label={t.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {divider}

          {/* 4. DESFECHO */}
          <div>
            <SectionTitle>4. Desfecho Imediato</SectionTitle>
            <div className="space-y-1.5 pl-1">
              {DESFECHO.map(d => (
                <CheckRow
                  key={d.value}
                  radio
                  checked={desfecho === d.value}
                  onChange={() => setDesfecho(d.value)}
                  label={d.label}
                />
              ))}
            </div>
          </div>

          {divider}

          {/* 5. NOTIFICAÇÃO INSTITUCIONAL */}
          <div>
            <SectionTitle>5. Notificação Institucional</SectionTitle>
            <div className="space-y-1.5 pl-1">
              {NOTIFICACAO.map(n => (
                <CheckRow
                  key={n.value}
                  checked={notificacao.includes(n.value)}
                  onChange={() => setNotificacao(prev => toggleArr(prev, n.value))}
                  label={n.label}
                />
              ))}
            </div>
          </div>

          {divider}

          {/* 6. CAUSA */}
          <div>
            <SectionTitle>6. Análise Inicial da Causa</SectionTitle>
            <div className="space-y-1.5 pl-1">
              {CAUSA.map(c => (
                <CheckRow
                  key={c.value}
                  checked={causa.includes(c.value)}
                  onChange={() => setCausa(prev => toggleArr(prev, c.value))}
                  label={c.label}
                />
              ))}
              {causa.includes('outros_cau') && (
                <input
                  type="text"
                  placeholder="Especifique..."
                  value={causaOutros}
                  onChange={e => setCausaOutros(e.target.value)}
                  className={inputCls + ' mt-1'}
                />
              )}
            </div>
          </div>

          {/* SAVE */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              saving
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white shadow-sm shadow-orange-500/30'
            }`}
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />Salvando...</>
            ) : (
              <><span className="material-symbols-rounded text-[18px]">save</span>Salvar Notificação</>
            )}
          </button>

        </div>
      )}
    </div>
  );
};
