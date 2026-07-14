import React, { useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { NotificationContext, UserContext } from '../contexts';
import { VirusIcon, CloseIcon, SaveIcon, CheckCircleIcon, AlertIcon } from './icons';

// ============================================================
// Triagem IPCS — Infecção Primária de Corrente Sanguínea
// associada a cateter central. Critérios epidemiológicos de
// vigilância (Nota Técnica GVIMS/GGTES/DIRE3/ANVISA nº 03/2026).
// NÃO substituem o julgamento clínico para tratamento.
// ============================================================

type Band = 'rn' | 'lactente' | 'crianca';
type Via = 'patogeno' | 'comensal' | 'clinica';

interface TriagemIPCSCardProps {
  patientId: number | string;
  dob?: string; // "YYYY-MM-DD"
}

interface Item { key: string; label: string; }
interface Group { key: string; title: string; min: number; items: Item[]; }
interface ViaDef {
  key: Via;
  label: string;        // seletor
  desc: string;         // descrição curta da via
  gates: Item[];        // blocos obrigatórios (sim/não)
  needsSigns: boolean;  // exige o bloco de sinais/sintomas da faixa etária?
  bands: Band[];        // faixas em que a via se aplica
}

interface TriagemIPCS {
  id: string;
  data_triagem: string;
  faixa_etaria: Band;
  via: Via;
  criterios: string[];
  ipcs_criterios_atendidos: boolean;
  observacao: string | null;
}

// --- Critério inicial obrigatório para TODAS as vias ---------
const MANDATORY: Item[] = [
  { key: 'cvc', label: 'Uso de cateter central por > 2 dias consecutivos (D1 = dia da instalação; avaliar a partir do D3).' },
  { key: 'situacao', label: 'Na data da infecção, o paciente estava com cateter central ou ele foi removido no dia anterior.' },
  { key: 'primaria', label: 'IPCS primária: o microrganismo/quadro não está relacionado a outro foco infeccioso (se houver foco definido → ICS secundária, não IPCS).' },
];

// --- Blocos de sinais/sintomas por faixa etária --------------
const SINAIS_RN: Group = {
  key: 'sinais_rn',
  title: 'Sinais/sintomas neonatais',
  min: 2,
  items: [
    { key: 'rn_termica', label: 'Instabilidade térmica: T > 37,5 °C ou < 36 °C.' },
    { key: 'rn_brady', label: 'Bradicardia.' },
    { key: 'rn_apneia', label: 'Apneia.' },
    { key: 'rn_intol_alim', label: 'Intolerância alimentar.' },
    { key: 'rn_resp', label: 'Piora do desconforto respiratório.' },
    { key: 'rn_glicose', label: 'Intolerância à glicose.' },
    { key: 'rn_hemodin', label: 'Instabilidade hemodinâmica.' },
    { key: 'rn_letargia', label: 'Hipoatividade / letargia.' },
  ],
};
const SINAIS_LACTENTE: Group = {
  key: 'sinais_lactente',
  title: 'Sinais/sintomas',
  min: 1,
  items: [
    { key: 'lac_febre', label: 'Febre > 38 °C.' },
    { key: 'lac_hipotermia', label: 'Hipotermia < 35 °C.' },
    { key: 'lac_apneia', label: 'Apneia.' },
    { key: 'lac_brady', label: 'Bradicardia.' },
  ],
};
const SINAIS_CRIANCA: Group = {
  key: 'sinais_crianca',
  title: 'Sinais/sintomas',
  min: 1,
  items: [
    { key: 'cr_febre', label: 'Febre > 38 °C.' },
    { key: 'cr_calafrios', label: 'Calafrios.' },
    { key: 'cr_hipotensao', label: 'Hipotensão.' },
  ],
};

function sinaisGroupFor(band: Band): Group {
  if (band === 'rn') return SINAIS_RN;
  if (band === 'lactente') return SINAIS_LACTENTE;
  return SINAIS_CRIANCA;
}

// --- Vias de confirmação -------------------------------------
const VIAS: ViaDef[] = [
  {
    key: 'patogeno',
    label: 'Patógeno',
    desc: 'IPCS laboratorial por microrganismo patogênico (não comensal). Não exige sinais clínicos.',
    gates: [
      { key: 'hemo_patogeno', label: 'Hemocultura (ou teste microbiológico validado não baseado em cultura — ex.: painel molecular) com ≥ 1 amostra positiva para microrganismo bacteriano ou fúngico patogênico, não comensal.' },
    ],
    needsSigns: false,
    bands: ['rn', 'lactente', 'crianca'],
  },
  {
    key: 'comensal',
    label: 'Comensal',
    desc: 'IPCS laboratorial por contaminante de pele / comensal (ex.: Staphylococcus coagulase-negativo, Corynebacterium spp., Bacillus spp. exceto B. anthracis, Streptococcus viridans, Aerococcus spp., Micrococcus spp.).',
    gates: [
      { key: 'hemo_comensal', label: '≥ 2 hemoculturas positivas para o mesmo comensal, coletadas em momentos distintos (no mesmo dia ou no máximo no dia seguinte), com antissepsia/preparo adequado de cada coleta.' },
    ],
    needsSigns: true,
    bands: ['rn', 'lactente', 'crianca'],
  },
  {
    key: 'clinica',
    label: 'Clínica neonatal',
    desc: 'IPCS clínica sem confirmação laboratorial (IPCSC) — apenas RN / UTI neonatal.',
    gates: [
      { key: 'lab_apoio', label: 'Laboratório de apoio: hemograma com ≥ 3 parâmetros alterados e/ou PCR quantitativa seriada alterada.' },
      { key: 'hemo_neg', label: 'Hemocultura não realizada, negativa ou considerada contaminação.' },
      { key: 'atb', label: 'Antimicrobiano instituído e mantido pelo médico assistente.' },
    ],
    needsSigns: true,
    bands: ['rn'],
  },
];

const BAND_LABEL: Record<Band, string> = {
  rn: 'RN (≤ 28 dias)',
  lactente: 'Lactente (> 28 d a 1 ano)',
  crianca: 'Criança (> 1 ano)',
};
const BAND_FAIXA: Record<Band, string> = {
  rn: 'Recém-nascido ≤ 28 dias ou RN internado em unidade neonatal',
  lactente: 'Criança > 28 dias e ≤ 1 ano',
  crianca: 'Criança > 1 ano',
};
const VIA_LABEL: Record<Via, string> = {
  patogeno: 'Patógeno',
  comensal: 'Comensal',
  clinica: 'Clínica neonatal',
};

const letra = (i: number) => String.fromCharCode(65 + i); // 0->A, 1->B...

function ageDaysFrom(dob?: string): number | null {
  if (!dob) return null;
  const b = new Date(`${dob}T00:00:00`);
  if (isNaN(b.getTime())) return null;
  return Math.floor((Date.now() - b.getTime()) / 86_400_000);
}

function bandFromAge(days: number | null): Band {
  if (days == null) return 'crianca';
  if (days <= 28) return 'rn';
  if (days <= 365) return 'lactente';
  return 'crianca';
}

function idadeTexto(days: number | null): string | null {
  if (days == null) return null;
  if (days <= 60) return `${days} dia(s) de vida`;
  const meses = Math.floor(days / 30);
  if (days <= 730) return `~${meses} mês(es)`;
  return `~${Math.floor(days / 365)} ano(s)`;
}

const formatDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

export const TriagemIPCSCard: React.FC<TriagemIPCSCardProps> = ({ patientId, dob }) => {
  const { showNotification } = useContext(NotificationContext)!;
  const { user } = useContext(UserContext)!;

  const ageDays = useMemo(() => ageDaysFrom(dob), [dob]);
  const bandAuto = useMemo(() => bandFromAge(ageDays), [ageDays]);

  const [band, setBand] = useState<Band>(bandAuto);
  const [via, setVia] = useState<Via>('patogeno');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);

  const [triagens, setTriagens] = useState<TriagemIPCS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setBand(bandAuto); }, [bandAuto]);

  // Vias disponíveis para a faixa atual; se a via selecionada não se aplica, volta para 'patogeno'
  const viasDisponiveis = useMemo(() => VIAS.filter(v => v.bands.includes(band)), [band]);
  useEffect(() => {
    if (!viasDisponiveis.some(v => v.key === via)) setVia('patogeno');
  }, [viasDisponiveis, via]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('triagem_ipcs_pacientes')
      .select('id, data_triagem, faixa_etaria, via, criterios, ipcs_criterios_atendidos, observacao')
      .eq('paciente_id', patientId)
      .is('archived_at', null)
      .order('data_triagem', { ascending: false });
    setTriagens((data as TriagemIPCS[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [patientId]);

  const viaDef = useMemo(() => VIAS.find(v => v.key === via)!, [via]);

  const toggle = (key: string) =>
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  // Avaliação em tempo real: obrigatório + gates da via + sinais (se exigidos)
  const avaliacao = useMemo(() => {
    const mandatory = MANDATORY.map((g, i) => ({
      letra: letra(i),
      label: g.label,
      key: g.key,
      ok: !!checked[g.key],
    }));
    const gates = viaDef.gates.map((g, i) => ({
      letra: letra(MANDATORY.length + i),
      label: g.label,
      key: g.key,
      ok: !!checked[g.key],
    }));
    const groups = viaDef.needsSigns
      ? [sinaisGroupFor(band)].map((g, i) => {
          const count = g.items.filter(it => checked[it.key]).length;
          return { ...g, letra: letra(MANDATORY.length + viaDef.gates.length + i), count, ok: count >= g.min };
        })
      : [];

    const mandatoryOk = mandatory.every(g => g.ok);
    const viaOk = gates.every(g => g.ok) && groups.every(g => g.ok);
    const ipcsMet = mandatoryOk && viaOk;
    const anyChecked = Object.values(checked).some(Boolean);
    return { mandatory, gates, groups, mandatoryOk, ipcsMet, anyChecked };
  }, [viaDef, band, checked]);

  const resetForm = () => { setChecked({}); setObservacao(''); };

  const handleSalvar = async () => {
    if (!avaliacao.anyChecked) {
      showNotification({ message: 'Marque ao menos um critério antes de salvar.', type: 'error' });
      return;
    }
    const criterios = Object.keys(checked).filter(k => checked[k]);
    setSaving(true);
    const { error } = await supabase.from('triagem_ipcs_pacientes').insert({
      paciente_id: patientId,
      faixa_etaria: band,
      via,
      criterios,
      ipcs_criterios_atendidos: avaliacao.ipcsMet,
      observacao: observacao.trim() || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) { showNotification({ message: `Erro: ${error.message}`, type: 'error' }); return; }
    showNotification({ message: 'Triagem IPCS salva.', type: 'success' });
    resetForm();
    load();
  };

  const arquivar = async (id: string) => {
    const { error } = await supabase
      .from('triagem_ipcs_pacientes')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { showNotification({ message: `Erro: ${error.message}`, type: 'error' }); return; }
    load();
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2">
        <VirusIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Triagem IPCS</h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
        Infecção Primária de Corrente Sanguínea associada a cateter central — critérios epidemiológicos de vigilância
        (Nota Técnica ANVISA nº 03/2026). Não substituem o julgamento clínico para tratamento.
      </p>

      {/* Seletor de faixa etária */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Faixa etária</span>
          {idadeTexto(ageDays) && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Idade estimada: {idadeTexto(ageDays)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(BAND_LABEL) as Band[]).map(b => (
            <button
              key={b}
              onClick={() => setBand(b)}
              className={`px-2 py-2 rounded-lg text-xs font-semibold border transition ${
                band === b
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {BAND_LABEL[b]}
              {bandAuto === b && <span className="block text-[10px] font-normal opacity-80">automática</span>}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{BAND_FAIXA[band]}</p>
      </div>

      {/* Seletor de via de confirmação */}
      <div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Via de confirmação</span>
        <div className="grid grid-cols-3 gap-2">
          {viasDisponiveis.map(v => (
            <button
              key={v.key}
              onClick={() => setVia(v.key)}
              className={`px-2 py-2 rounded-lg text-xs font-semibold border transition ${
                via === v.key
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{viaDef.desc}</p>
      </div>

      {/* Bloco obrigatório inicial */}
      <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10 p-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Critério inicial obrigatório <span className="text-xs font-normal text-slate-400">(todos)</span>
        </p>
        <div className="space-y-1.5">
          {avaliacao.mandatory.map(g => (
            <label
              key={g.key}
              className={`flex items-start gap-2 p-2 rounded-md cursor-pointer transition ${
                checked[g.key] ? 'bg-white dark:bg-slate-800' : 'hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="checkbox"
                checked={!!checked[g.key]}
                onChange={() => toggle(g.key)}
                className="mt-0.5 w-4 h-4 accent-amber-600 shrink-0"
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                <b className="text-amber-700 dark:text-amber-300">{g.letra}.</b> {g.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Gates da via (obrigatórios) */}
      <div className="space-y-2">
        {avaliacao.gates.map(g => (
          <label
            key={g.key}
            className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition ${
              checked[g.key]
                ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <input
              type="checkbox"
              checked={!!checked[g.key]}
              onChange={() => toggle(g.key)}
              className="mt-0.5 w-4 h-4 accent-rose-600 shrink-0"
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              <b className="text-rose-700 dark:text-rose-300">{g.letra}.</b>{' '}
              <span className="font-medium text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">obrigatório</span>
              <br />
              {g.label}
            </span>
          </label>
        ))}
      </div>

      {/* Grupo de sinais/sintomas (quando exigido) */}
      {avaliacao.groups.map(g => (
        <div
          key={g.key}
          className={`rounded-lg border p-3 ${
            g.ok
              ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              <span className="text-rose-700 dark:text-rose-300">{g.letra}.</span> {g.title}
            </p>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                g.ok
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {g.count} / mín. {g.min}
            </span>
          </div>
          <div className="space-y-1.5">
            {g.items.map(it => (
              <label
                key={it.key}
                className="flex items-start gap-2 p-2 rounded-md hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!checked[it.key]}
                  onChange={() => toggle(it.key)}
                  className="mt-0.5 w-4 h-4 accent-rose-600 shrink-0"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">{it.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Resultado em tempo real */}
      {avaliacao.anyChecked && (
        <div
          className={`rounded-lg border-2 p-3 flex items-start gap-2 ${
            avaliacao.ipcsMet
              ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
              : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
          }`}
        >
          {avaliacao.ipcsMet
            ? <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            : <CheckCircleIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />}
          <div>
            <p className={`text-sm font-bold ${avaliacao.ipcsMet ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-200'}`}>
              {avaliacao.ipcsMet
                ? `Critérios de IPCS ATENDIDOS (via ${VIA_LABEL[via]})`
                : 'Critérios de IPCS ainda NÃO atendidos'}
            </p>
            {!avaliacao.ipcsMet && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Falta: {[
                  ...(!avaliacao.mandatoryOk ? ['critério inicial obrigatório completo'] : []),
                  ...avaliacao.gates.filter(g => !g.ok).map(g => `bloco ${g.letra}`),
                  ...avaliacao.groups.filter(g => !g.ok).map(g => `bloco ${g.letra} (${g.count}/${g.min})`),
                ].join(', ')}.
              </p>
            )}
            {avaliacao.ipcsMet && (
              <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
                Sinalizar SCIRAS/CCIH para avaliação epidemiológica. Confirmar ausência de outro foco e que todos os
                elementos ocorreram dentro da janela de infecção.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Observação */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Observação <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
        />
      </div>

      {/* Nota — observações importantes de notificação */}
      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <p><b>Frase-chave do round:</b> IPCS = CVC D3 + hemocultura (ou critério clínico neonatal) + ausência de outro foco + janela de infecção.</p>
        <p>Hemocultura com o mesmo agente de uma PAV, ITU, ISC ou outro foco definido → provável ICS secundária, não IPCS primária.</p>
        <p>Cateter retirado há 2 dias ou mais antes da hemocultura positiva → não classificar como associada a cateter central.</p>
        <p>Prefira punção periférica; hemocultura colhida apenas da ponta do cateter deve ser evitada pelo risco de falso-positivo.</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={resetForm}
          disabled={saving || !avaliacao.anyChecked}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpar
        </button>
        <button
          onClick={handleSalvar}
          disabled={saving || !avaliacao.anyChecked}
          className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
        >
          <SaveIcon className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar triagem'}</span>
        </button>
      </div>

      {/* Histórico */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Histórico de triagens</p>
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">Carregando...</p>
        ) : triagens.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">Nenhuma triagem registrada.</p>
        ) : (
          <div className="space-y-2">
            {triagens.map(t => (
              <div key={t.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDataHora(t.data_triagem)}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {BAND_LABEL[t.faixa_etaria] ?? t.faixa_etaria}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                        {VIA_LABEL[t.via] ?? t.via}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          t.ipcs_criterios_atendidos
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {t.ipcs_criterios_atendidos ? 'IPCS: critérios atendidos' : 'IPCS: não atendidos'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {(t.criterios?.length ?? 0)} critério(s)
                      </span>
                    </div>
                    {t.observacao && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">{t.observacao}</p>
                    )}
                  </div>
                  <button
                    onClick={() => arquivar(t.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition shrink-0"
                    title="Arquivar"
                  >
                    <CloseIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
