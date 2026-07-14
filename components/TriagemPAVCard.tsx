import React, { useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { NotificationContext, UserContext } from '../contexts';
import { LungsAltIcon, CloseIcon, SaveIcon, CheckCircleIcon, AlertIcon } from './icons';

// ============================================================
// Triagem PAV — Pneumonia Associada à Ventilação
// Critérios epidemiológicos de vigilância (Nota Técnica
// GVIMS/GGTES/DIRE3/ANVISA nº 03/2026). NÃO substituem o
// julgamento clínico para tratamento.
// ============================================================

type Band = 'rn' | 'lactente' | 'crianca';

interface TriagemPAVCardProps {
  patientId: number | string;
  dob?: string; // "YYYY-MM-DD"
}

interface Item { key: string; label: string; }
interface Group { key: string; title: string; min: number; items: Item[]; }
interface BandDef {
  key: Band;
  label: string;      // seletor
  faixa: string;      // descrição da faixa
  gates: Item[];      // blocos obrigatórios (sim/não)
  groups: Group[];    // blocos com contagem mínima
}

interface TriagemPAV {
  id: string;
  data_triagem: string;
  faixa_etaria: Band;
  criterios: string[];
  pav_criterios_atendidos: boolean;
  observacao: string | null;
}

// --- Blocos reutilizados entre RN e lactente -----------------
const GATE_VM: Item = {
  key: 'vm',
  label: 'Exposição à VM: em ventilação mecânica há > 2 dias consecutivos (D1 = intubação/VM; avaliar a partir do D3) e em VM hoje ou extubado ontem.',
};
const GATE_IMAGEM: Item = {
  key: 'imagem',
  label: 'Imagem compatível: infiltrado, opacificação/consolidação, cavitação ou pneumatocele — nova, persistente ou progressiva.',
};
const GATE_PIORA: Item = {
  key: 'piora',
  label: 'Piora respiratória obrigatória: piora da troca gasosa por ≥ 2 dias (dessaturação, ↑ FiO₂, ↑ PEEP ou parâmetros ventilatórios).',
};

const BANDS: BandDef[] = [
  {
    key: 'rn',
    label: 'RN (≤ 28 dias)',
    faixa: 'Recém-nascido ≤ 28 dias ou RN internado',
    gates: [GATE_VM, GATE_IMAGEM, GATE_PIORA],
    groups: [
      {
        key: 'rn_sinais',
        title: 'Sinais/sintomas clínicos e laboratoriais',
        min: 3,
        items: [
          { key: 'rn_termica', label: 'Instabilidade térmica: temperatura > 37,5 °C ou < 36 °C, sem outra causa conhecida.' },
          { key: 'rn_hemograma', label: 'Hemograma com ≥ 3 parâmetros alterados.' },
          { key: 'rn_secrecao', label: 'Secreção purulenta, mudança da característica, aumento da secreção ou maior necessidade de aspiração.' },
          { key: 'rn_ausculta', label: 'Ausculta com sibilos, roncos ou estertores novos ou em agravamento.' },
          { key: 'rn_fc', label: 'Bradicardia < 100 bpm ou taquicardia > 160 bpm.' },
          { key: 'rn_respiratorio', label: 'Apneia, taquipneia, gemência, batimento de asa de nariz ou retração torácica nova ou em agravamento.' },
          { key: 'rn_tosse', label: 'Tosse nova ou em agravamento.' },
        ],
      },
    ],
  },
  {
    key: 'lactente',
    label: 'Lactente (> 28 d a 1 ano)',
    faixa: 'Criança > 28 dias e ≤ 1 ano',
    gates: [GATE_VM, GATE_IMAGEM, GATE_PIORA],
    groups: [
      {
        key: 'lac_sinais',
        title: 'Sinais/sintomas clínicos e laboratoriais',
        min: 3,
        items: [
          { key: 'lac_febre', label: 'Febre > 38 °C ou hipotermia < 36 °C.' },
          { key: 'lac_leuco', label: 'Leucopenia ≤ 4.000/mm³ ou leucocitose ≥ 15.000/mm³ com desvio à esquerda ≥ 10% de bastonetes.' },
          { key: 'lac_secrecao', label: 'Secreção purulenta, mudança da característica, aumento da secreção ou maior necessidade de aspiração.' },
          { key: 'lac_respiratorio', label: 'Apneia ou taquipneia, batimento de asa de nariz e tiragem intercostal nova ou em agravamento.' },
          { key: 'lac_ausculta', label: 'Ausculta com sibilos, roncos ou estertores novos ou em agravamento.' },
          { key: 'lac_tosse', label: 'Tosse nova ou em agravamento.' },
          { key: 'lac_fc', label: 'Bradicardia < 100 bpm ou taquicardia > 170 bpm.' },
        ],
      },
    ],
  },
  {
    key: 'crianca',
    label: 'Criança (> 1 ano)',
    faixa: 'Criança > 1 ano',
    gates: [GATE_VM, GATE_IMAGEM],
    groups: [
      {
        key: 'cr_sistemico',
        title: 'Critérios sistêmicos',
        min: 1,
        items: [
          { key: 'cr_febre', label: 'Febre > 38 °C.' },
          { key: 'cr_leucopenia', label: 'Leucopenia < 4.000/mm³.' },
          { key: 'cr_leucocitose', label: 'Leucocitose > 12.000/mm³.' },
          { key: 'cr_leuco_desvio', label: 'Em ≤ 14 anos: leucocitose ≥ 15.000/mm³ com desvio à esquerda > 10%.' },
        ],
      },
      {
        key: 'cr_respiratorio',
        title: 'Critérios respiratórios',
        min: 2,
        items: [
          { key: 'cr_secrecao', label: 'Secreção purulenta, mudança da característica, aumento da secreção ou maior necessidade de aspiração.' },
          { key: 'cr_apneia', label: 'Apneia, taquipneia, dispneia ou tosse nova ou em agravamento.' },
          { key: 'cr_ausculta', label: 'Ausculta com sibilos, roncos ou estertores novos ou em agravamento.' },
          { key: 'cr_troca', label: 'Piora da troca gasosa, dessaturação, ↑ demanda de O₂ ou ↑ parâmetros ventilatórios por ≥ 2 dias.' },
        ],
      },
    ],
  },
];

const BAND_LABEL: Record<Band, string> = {
  rn: 'RN (≤ 28 dias)',
  lactente: 'Lactente (> 28 d a 1 ano)',
  crianca: 'Criança (> 1 ano)',
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

export const TriagemPAVCard: React.FC<TriagemPAVCardProps> = ({ patientId, dob }) => {
  const { showNotification } = useContext(NotificationContext)!;
  const { user } = useContext(UserContext)!;

  const ageDays = useMemo(() => ageDaysFrom(dob), [dob]);
  const bandAuto = useMemo(() => bandFromAge(ageDays), [ageDays]);

  const [band, setBand] = useState<Band>(bandAuto);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);

  const [triagens, setTriagens] = useState<TriagemPAV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setBand(bandAuto); }, [bandAuto]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('triagem_pav_pacientes')
      .select('id, data_triagem, faixa_etaria, criterios, pav_criterios_atendidos, observacao')
      .eq('paciente_id', patientId)
      .is('archived_at', null)
      .order('data_triagem', { ascending: false });
    setTriagens((data as TriagemPAV[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [patientId]);

  const def = useMemo(() => BANDS.find(b => b.key === band)!, [band]);

  const toggle = (key: string) =>
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  // Avaliação em tempo real dos blocos da faixa atual
  const avaliacao = useMemo(() => {
    const gates = def.gates.map((g, i) => ({
      letra: letra(i),
      label: g.label,
      key: g.key,
      ok: !!checked[g.key],
    }));
    const groups = def.groups.map((g, i) => {
      const count = g.items.filter(it => checked[it.key]).length;
      return { ...g, letra: letra(def.gates.length + i), count, ok: count >= g.min };
    });
    const pavMet = gates.every(g => g.ok) && groups.every(g => g.ok);
    const anyChecked = def.gates.some(g => checked[g.key]) || def.groups.some(g => g.items.some(it => checked[it.key]));
    return { gates, groups, pavMet, anyChecked };
  }, [def, checked]);

  const resetForm = () => { setChecked({}); setObservacao(''); };

  const handleSalvar = async () => {
    if (!avaliacao.anyChecked) {
      showNotification({ message: 'Marque ao menos um critério antes de salvar.', type: 'error' });
      return;
    }
    const criterios = Object.keys(checked).filter(k => checked[k]);
    setSaving(true);
    const { error } = await supabase.from('triagem_pav_pacientes').insert({
      paciente_id: patientId,
      faixa_etaria: band,
      criterios,
      pav_criterios_atendidos: avaliacao.pavMet,
      observacao: observacao.trim() || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) { showNotification({ message: `Erro: ${error.message}`, type: 'error' }); return; }
    showNotification({ message: 'Triagem PAV salva.', type: 'success' });
    resetForm();
    load();
  };

  const arquivar = async (id: string) => {
    const { error } = await supabase
      .from('triagem_pav_pacientes')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { showNotification({ message: `Erro: ${error.message}`, type: 'error' }); return; }
    load();
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2">
        <LungsAltIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Triagem PAV</h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
        Pneumonia Associada à Ventilação — critérios epidemiológicos de vigilância (Nota Técnica ANVISA nº 03/2026).
        Não substituem o julgamento clínico para tratamento.
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
          {BANDS.map(b => (
            <button
              key={b.key}
              onClick={() => setBand(b.key)}
              className={`px-2 py-2 rounded-lg text-xs font-semibold border transition ${
                band === b.key
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {b.label}
              {bandAuto === b.key && <span className="block text-[10px] font-normal opacity-80">automática</span>}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{def.faixa}</p>
      </div>

      {/* Blocos obrigatórios (gates) */}
      <div className="space-y-2">
        {avaliacao.gates.map((g) => (
          <label
            key={g.key}
            className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition ${
              checked[g.key]
                ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <input
              type="checkbox"
              checked={!!checked[g.key]}
              onChange={() => toggle(g.key)}
              className="mt-0.5 w-4 h-4 accent-primary-600 shrink-0"
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              <b className="text-primary-700 dark:text-primary-300">{g.letra}.</b>{' '}
              <span className="font-medium text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">obrigatório</span>
              <br />
              {g.label}
            </span>
          </label>
        ))}
      </div>

      {/* Grupos com contagem mínima */}
      {avaliacao.groups.map((g) => (
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
              <span className="text-primary-700 dark:text-primary-300">{g.letra}.</span> {g.title}
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
                  className="mt-0.5 w-4 h-4 accent-primary-600 shrink-0"
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
            avaliacao.pavMet
              ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
              : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
          }`}
        >
          {avaliacao.pavMet
            ? <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            : <CheckCircleIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />}
          <div>
            <p className={`text-sm font-bold ${avaliacao.pavMet ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-200'}`}>
              {avaliacao.pavMet
                ? 'Critérios epidemiológicos de PAV ATENDIDOS'
                : 'Critérios de PAV ainda NÃO atendidos'}
            </p>
            {!avaliacao.pavMet && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Falta: {[
                  ...avaliacao.gates.filter(g => !g.ok).map(g => `bloco ${g.letra}`),
                  ...avaliacao.groups.filter(g => !g.ok).map(g => `bloco ${g.letra} (${g.count}/${g.min})`),
                ].join(', ')}.
              </p>
            )}
            {avaliacao.pavMet && (
              <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
                Sinalizar SCIRAS/CCIH para avaliação epidemiológica. Confirmar que todos os elementos ocorreram dentro da janela de infecção.
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
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      {/* Nota — critérios não definidores */}
      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-400">
        <b>Culturas (não definidoras):</b> cultura respiratória, hemocultura ou líquido pleural ajudam apenas na etiologia.
        Staphylococcus coagulase-negativo, <i>Enterococcus</i> spp., <i>Candida</i> spp. e leveduras não especificadas não
        fecham PAV apenas por hemocultura. Diagnóstico médico isolado de pneumonia não basta; novo episódio exige novos
        sinais + alteração de imagem e respeitar a janela de 14 dias.
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
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
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
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          t.pav_criterios_atendidos
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {t.pav_criterios_atendidos ? 'PAV: critérios atendidos' : 'PAV: não atendidos'}
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
