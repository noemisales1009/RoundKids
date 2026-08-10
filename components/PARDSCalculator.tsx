import React, { useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { num } from '../lib/gasometria';
import {
  CRITERIOS_GERAIS,
  INDICE_LABEL,
  SITUACOES_ESPECIAIS,
  SUPORTES,
  classificarPARDS,
  normalizarFio2,
  type Classificacao,
  type CriterioKey,
  type Resultado,
  type Suporte,
} from '../lib/pards';

interface Props {
  patientId: string;
}

const BADGE: Record<Classificacao, string> = {
  pards_grave: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  pards_leve_moderada: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  pards_vni: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  possivel_pards: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  em_risco: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  sem_criterios: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  nao_classificavel: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

const CARD_RESULT: Record<Classificacao, string> = {
  pards_grave: 'bg-red-50 dark:bg-red-900/25 border-red-300 dark:border-red-700',
  pards_leve_moderada: 'bg-amber-50 dark:bg-amber-900/25 border-amber-300 dark:border-amber-700',
  pards_vni: 'bg-amber-50 dark:bg-amber-900/25 border-amber-300 dark:border-amber-700',
  possivel_pards: 'bg-violet-50 dark:bg-violet-900/25 border-violet-300 dark:border-violet-700',
  em_risco: 'bg-primary-50 dark:bg-primary-900/25 border-primary-300 dark:border-primary-700',
  sem_criterios: 'bg-green-50 dark:bg-green-900/25 border-green-300 dark:border-green-700',
  nao_classificavel: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
};

const StepHeader: React.FC<{ n: number; title: string; ativo: boolean }> = ({ n, title, ativo }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
    <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${ativo ? 'bg-primary-600' : 'bg-slate-400 dark:bg-slate-600'}`}>{n}</span>
    <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{title}</span>
  </div>
);

export const PARDSCalculator: React.FC<Props> = ({ patientId }) => {
  const [criterios, setCriterios] = useState<Record<CriterioKey, boolean>>(
    () => Object.fromEntries(CRITERIOS_GERAIS.map(c => [c.key, false])) as Record<CriterioKey, boolean>,
  );
  const [suporte, setSuporte] = useState<Suporte | null>(null);
  const [fio2, setFio2] = useState('');
  const [pam, setPam] = useState('');
  const [peep, setPeep] = useState('');
  const [pao2, setPao2] = useState('');
  const [spo2, setSpo2] = useState('');
  const [o2ParaSpo288, setO2ParaSpo288] = useState<boolean | null>(null);

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState('');
  const [mostrarRef, setMostrarRef] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copiado, setCopiado] = useState(false);

  const criteriosOk = CRITERIOS_GERAIS.every(c => criterios[c.key]);
  const faltam = CRITERIOS_GERAIS.filter(c => !criterios[c.key]).length;

  const limpar = () => { setResultado(null); setSaved(false); setSaveError(''); setCopiado(false); };

  const conclusao = useMemo<string[]>(() => {
    if (!resultado || !suporte) return [];
    const s = SUPORTES.find(x => x.id === suporte)!;
    const linhas: string[] = [];
    linhas.push(`Avaliação PARDS (PALICC-2): critérios gerais preenchidos (insulto ≤ 7 dias, nova opacidade, edema não cardíaco, excluída doença perinatal e de vias aéreas isolada).`);
    linhas.push(`Suporte: ${s.label}${suporte === 'vni_facial' && peep ? ` (CPAP/PEEP ${peep} cmH₂O)` : ''}.`);
    if (resultado.indice) {
      linhas.push(`${INDICE_LABEL[resultado.indice.tipo]}: ${resultado.indice.formula}.`);
    }
    linhas.push(`Classificação: ${resultado.label}. ${resultado.descricao}`);
    resultado.avisos.forEach(a => linhas.push(`Atenção: ${a}`));
    linhas.push('Integrar ao quadro clínico e à avaliação da equipe assistencial (PALICC-2, PCCM 2023).');
    return linhas;
  }, [resultado, suporte, peep]);

  function classificar() {
    setErro('');
    limpar();
    if (!criteriosOk) { setErro('Marque os 5 critérios gerais antes de classificar.'); return; }
    if (!suporte) { setErro('Selecione o suporte respiratório.'); return; }

    if (suporte === 'o2') {
      if (o2ParaSpo288 === null) { setErro('Informe se o paciente precisa de O₂ para manter SpO₂ ≥ 88%.'); return; }
      setResultado(classificarPARDS({ suporte, fio2: 0.21, o2ParaSpo288 }));
      return;
    }

    const fio2N = num(fio2);
    const f = fio2N !== null ? normalizarFio2(fio2N) : null;
    if (f === null) { setErro('FiO₂ inválida — informe entre 21 e 100% (ou 0,21 a 1,0).'); return; }

    const r = classificarPARDS({
      suporte,
      fio2: f,
      pam: num(pam),
      peep: num(peep),
      pao2: num(pao2),
      spo2: num(spo2),
    });
    if (r.classificacao === 'nao_classificavel' && r.avisos.length) {
      setErro(r.avisos[r.avisos.length - 1]);
      return;
    }
    setResultado(r);
  }

  async function salvar() {
    if (!resultado || !suporte) return;
    setSaving(true);
    setSaveError('');
    const { data: { user } } = await supabase.auth.getUser();
    const fio2N = num(fio2);
    const { error } = await supabase.from('pards_avaliacoes').insert({
      paciente_id: patientId,
      criado_por: user?.id ?? null,
      criterios_gerais: criterios,
      suporte,
      fio2: fio2N !== null ? normalizarFio2(fio2N) : null,
      pam_vias_aereas: num(pam),
      peep: num(peep),
      pao2: num(pao2),
      spo2: num(spo2),
      o2_para_spo2_88: suporte === 'o2' ? o2ParaSpo288 : null,
      indice_tipo: resultado.indice?.tipo ?? null,
      indice_valor: resultado.indice ? parseFloat(resultado.indice.valor.toFixed(1)) : null,
      classificacao: resultado.classificacao,
      conclusao: conclusao.join('\n'),
    });
    if (error) setSaveError(`Não foi possível gravar: ${error.message}`);
    else setSaved(true);
    setSaving(false);
  }

  async function copiarConclusao() {
    try {
      await navigator.clipboard.writeText(conclusao.join('\n'));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setSaveError('Não foi possível copiar. Selecione o texto manualmente.');
    }
  }

  function resetar() {
    setCriterios(Object.fromEntries(CRITERIOS_GERAIS.map(c => [c.key, false])) as Record<CriterioKey, boolean>);
    setSuporte(null);
    setFio2(''); setPam(''); setPeep(''); setPao2(''); setSpo2('');
    setO2ParaSpo288(null);
    setErro('');
    limpar();
  }

  const cardBase = 'bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden';
  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400';

  const spo2N = num(spo2);
  const precisaOxigenacao = suporte !== null && suporte !== 'o2';

  return (
    <div className="space-y-4 pb-6">

      {/* Etapa 1 — Critérios gerais */}
      <div className={cardBase}>
        <StepHeader n={1} title="Critérios gerais obrigatórios (PALICC-2)" ativo />
        <div className="p-4 space-y-2">
          {CRITERIOS_GERAIS.map(c => (
            <label key={c.key} className="flex items-start gap-3 cursor-pointer rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={criterios[c.key]}
                onChange={e => { setCriterios(prev => ({ ...prev, [c.key]: e.target.checked })); limpar(); }}
                className="mt-0.5 w-4 h-4 accent-primary-600 flex-shrink-0"
              />
              <span className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{c.label}</span>
            </label>
          ))}
          {!criteriosOk && (
            <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
              {faltam === CRITERIOS_GERAIS.length ? 'Os 5 critérios precisam estar presentes para qualquer classificação.' : `Faltam ${faltam} critério${faltam > 1 ? 's' : ''}.`}
            </p>
          )}
        </div>
      </div>

      {/* Etapa 2 — Suporte respiratório */}
      <div className={`${cardBase} transition-opacity ${!criteriosOk ? 'opacity-40 pointer-events-none' : ''}`}>
        <StepHeader n={2} title="Suporte respiratório" ativo={criteriosOk} />
        <div className="p-4 grid gap-2 sm:grid-cols-2">
          {SUPORTES.map(s => (
            <button
              key={s.id}
              onClick={() => { setSuporte(s.id); limpar(); setErro(''); }}
              className={`text-left rounded-lg border px-4 py-3 transition-colors ${suporte === s.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/25'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'}`}
            >
              <p className={`text-sm font-semibold ${suporte === s.id ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-slate-100'}`}>{s.label}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{s.detalhe}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Etapa 3 — Oxigenação */}
      <div className={`${cardBase} transition-opacity ${!criteriosOk || !suporte ? 'opacity-40 pointer-events-none' : ''}`}>
        <StepHeader n={3} title="Oxigenação" ativo={!!suporte && criteriosOk} />
        <div className="p-4 space-y-4">
          {suporte === 'o2' ? (
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">Precisa de O₂ suplementar para manter SpO₂ ≥ 88%?</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ v: true, l: 'Sim' }, { v: false, l: 'Não' }].map(op => (
                  <button
                    key={op.l}
                    onClick={() => { setO2ParaSpo288(op.v); limpar(); }}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${o2ParaSpo288 === op.v
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                  >
                    {op.l}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">FiO₂ (% ou decimal)</label>
                <input type="number" value={fio2} onChange={e => { setFio2(e.target.value); limpar(); }} placeholder="ex: 40" step="0.01" className={inputCls} />
              </div>
              {suporte === 'vmi' && (
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Pressão média VA (cmH₂O)</label>
                  <input type="number" value={pam} onChange={e => { setPam(e.target.value); limpar(); }} placeholder="ex: 12" step="0.1" className={inputCls} />
                </div>
              )}
              {suporte === 'vni_facial' && (
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">CPAP/PEEP (cmH₂O)</label>
                  <input type="number" value={peep} onChange={e => { setPeep(e.target.value); limpar(); }} placeholder="ex: 6" step="0.5" className={inputCls} />
                </div>
              )}
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">PaO₂ (mmHg) — preferencial</label>
                <input type="number" value={pao2} onChange={e => { setPao2(e.target.value); limpar(); }} placeholder="ex: 65" step="0.1" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">SpO₂ (%) — se sem PaO₂</label>
                <input type="number" value={spo2} onChange={e => { setSpo2(e.target.value); limpar(); }} placeholder="ex: 94" step="1" className={inputCls} />
              </div>
            </div>
          )}

          {precisaOxigenacao && spo2N !== null && spo2N > 97 && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
              SpO₂ &gt; 97%: os índices de saturação (ISO e S/F) não são válidos. Reduza a FiO₂, quando clinicamente seguro, e meça em estado estável — ou informe a PaO₂.
            </div>
          )}

          <button
            onClick={classificar}
            className="w-full py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-colors"
          >
            Classificar →
          </button>

          {erro && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 px-4 py-3 text-amber-800 dark:text-amber-300 text-sm">
              {erro}
            </div>
          )}
        </div>
      </div>

      {/* Etapa 4 — Resultado */}
      {resultado && (
        <div className={cardBase}>
          <StepHeader n={4} title="Classificação" ativo />
          <div className="p-4 space-y-3">
            <div className={`rounded-lg border px-4 py-3 space-y-2 ${CARD_RESULT[resultado.classificacao]}`}>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${BADGE[resultado.classificacao]}`}>
                {resultado.label}
              </span>
              {resultado.indice && (
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{resultado.indice.formula}</p>
              )}
              {resultado.descricao && (
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{resultado.descricao}</p>
              )}
              {resultado.avisos.map((a, i) => (
                <p key={i} className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">⚠ {a}</p>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-1.5">
              {conclusao.map((l, i) => (
                <p key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{l}</p>
              ))}
            </div>

            {saveError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 px-4 py-3 text-red-700 dark:text-red-300 text-xs">
                {saveError}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={salvar}
                disabled={saving || saved}
                className={`flex-1 min-w-[180px] py-2.5 rounded-xl text-sm font-semibold transition-colors ${saved
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 cursor-default'
                  : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60'}`}
              >
                {saved ? '✓ Gravado no prontuário' : saving ? 'Gravando...' : 'Gravar no prontuário'}
              </button>
              <button onClick={copiarConclusao} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {copiado ? '✓ Copiado' : 'Copiar conclusão'}
              </button>
              <button onClick={resetar} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Nova avaliação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referências */}
      <div className={cardBase}>
        <button
          onClick={() => setMostrarRef(m => !m)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Referências e situações especiais</span>
          <span className="text-xs text-slate-400">{mostrarRef ? '▲' : '▼'}</span>
        </button>
        {mostrarRef && (
          <div className="px-4 pb-4 space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-1.5 font-semibold">Suporte</th>
                    <th className="text-left py-1.5 font-semibold">Critério de oxigenação</th>
                    <th className="text-left py-1.5 font-semibold">Classificação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-1.5 pr-2">VM invasiva</td><td className="py-1.5 pr-2">IO ≥ 4 ou ISO ≥ 5 (grave: IO ≥ 16 / ISO ≥ 12,3)</td><td className="py-1.5">PARDS</td></tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-1.5 pr-2">VNI facial; CPAP/PEEP ≥ 5</td><td className="py-1.5 pr-2">P/F ≤ 300 ou S/F ≤ 250 (grave: P/F ≤ 100 / S/F ≤ 150)</td><td className="py-1.5">PARDS</td></tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-1.5 pr-2">CNAF ou VNI nasal</td><td className="py-1.5 pr-2">P/F ≤ 300 ou S/F ≤ 250</td><td className="py-1.5">Possível PARDS</td></tr>
                  <tr><td className="py-1.5 pr-2">Qualquer interface com O₂</td><td className="py-1.5 pr-2">O₂ para manter SpO₂ ≥ 88%, sem critérios acima</td><td className="py-1.5">Em risco</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Fórmulas</p>
              <p className="font-mono">IO = (FiO₂ × pressão média VA × 100) ÷ PaO₂</p>
              <p className="font-mono">ISO = (FiO₂ × pressão média VA × 100) ÷ SpO₂</p>
              <p className="font-mono">P/F = PaO₂ ÷ FiO₂ &nbsp;·&nbsp; S/F = SpO₂ ÷ FiO₂ &nbsp;(FiO₂ em decimal)</p>
              <p className="mt-1">Índices com SpO₂ só valem com SpO₂ ≤ 97%, em estado estável e sinal confiável.</p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Situações especiais</p>
              {SITUACOES_ESPECIAIS.map(s => (
                <p key={s.condicao}><strong>{s.condicao}:</strong> {s.regra}</p>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Fonte: Emeriaud G, et al. PALICC-2 — Pediatric Critical Care Medicine. 2023;24(2):143-168. doi:10.1097/PCC.0000000000003147. Documento de consulta técnica; integrar ao quadro clínico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PARDSCalculator;
