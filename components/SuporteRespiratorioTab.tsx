import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { UserContext } from '../contexts';
import { num } from '../lib/gasometria';
import {
  CAMPOS,
  DISPOSITIVOS,
  MODOS_VM,
  SITUACOES,
  calcPressaoSuporte,
  calcVcMlKg,
  camposAusentes,
  camposPara,
  doBanco,
  duracao,
  fmtNum,
  gerarTexto,
  paraBanco,
  precisaDispositivo,
  resumoParametros,
  rotuloSuporte,
  validar,
  validarInicio,
  type CampoKey,
  type Dispositivo,
  type Situacao,
  type Valores,
} from '../lib/suporteRespiratorio';

// Bloco "Suporte de Oxigenação e Ventilação" do Round (especificação funcional).
// Cada dispositivo/modalidade é um episódio; cada confirmação ou alteração de
// parâmetros vira uma linha nova no histórico (nunca se edita linha antiga).

interface Props {
  patientId: string;
  pesoKg?: number | null;
}

interface Episodio {
  id: string;
  situacao: Situacao;
  dispositivo: Dispositivo | null;
  inicio: string;
  fim: string | null;
  motivo_fim: string | null;
  criado_por_nome: string | null;
  encerrado_por_nome: string | null;
}

type TipoRegistro = 'inicio' | 'alteracao' | 'confirmacao';

interface Parametro extends Partial<Record<CampoKey, number | null>> {
  id: string;
  episodio_id: string;
  registrado_em: string;
  registrado_por_nome: string | null;
  tipo_registro: TipoRegistro;
  spo2: number | null;
  spo2_meta_min: number | null;
  spo2_meta_max: number | null;
  modo: string | null;
  vc_ml_kg: number | null;
  texto_clinico: string | null;
}

const TIPO_LABEL: Record<TipoRegistro, string> = {
  inicio: 'Início do episódio',
  alteracao: 'Alteração de parâmetros',
  confirmacao: 'Confirmação sem alteração',
};

const CAMPOS_VAZIOS = Object.fromEntries((Object.keys(CAMPOS) as CampoKey[]).map(k => [k, ''])) as Record<CampoKey, string>;

const formatDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

// Valor para <input type="datetime-local">, no horário do navegador
const paraInputLocal = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const iguais = (a: number | null | undefined, b: number | null | undefined) =>
  (a == null && b == null) || (a != null && b != null && Math.abs(Number(a) - Number(b)) < 1e-6);

export const SuporteRespiratorioTab: React.FC<Props> = ({ patientId, pesoKg }) => {
  const { user } = useContext(UserContext)!;

  const [aba, setAba] = useState<'registro' | 'historico'>('registro');
  const [loading, setLoading] = useState(true);
  const [erroCarga, setErroCarga] = useState('');
  const [episodios, setEpisodios] = useState<Episodio[]>([]);
  const [parametros, setParametros] = useState<Parametro[]>([]);

  const [situacao, setSituacao] = useState<Situacao | null>(null);
  const [dispositivo, setDispositivo] = useState<Dispositivo | null>(null);
  const [modo, setModo] = useState<string | null>(null);
  const [campos, setCampos] = useState<Record<CampoKey, string>>(CAMPOS_VAZIOS);
  const [spo2, setSpo2] = useState('');
  const [metaMin, setMetaMin] = useState('');
  const [metaMax, setMetaMax] = useState('');
  const [inicioLocal, setInicioLocal] = useState(() => paraInputLocal(new Date()));
  const [motivo, setMotivo] = useState('');
  const [textoManual, setTextoManual] = useState<string | null>(null); // null = usa o texto gerado

  const [saving, setSaving] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [msgOk, setMsgOk] = useState('');
  const [copiado, setCopiado] = useState(false);

  const ativo = useMemo(() => episodios.find(e => !e.fim) ?? null, [episodios]);
  const ultimo = useMemo(() => (ativo ? parametros.find(p => p.episodio_id === ativo.id) ?? null : null), [ativo, parametros]);

  // Item 7.1: ao abrir, recupera o último dispositivo ativo e os parâmetros mais recentes
  const preencher = useCallback((ep: Episodio | null, p: Parametro | null) => {
    setSituacao(ep?.situacao ?? null);
    setDispositivo(ep?.dispositivo ?? null);
    setModo(p?.modo ?? null);
    const v = p ? doBanco(p) : {};
    setCampos(Object.fromEntries((Object.keys(CAMPOS) as CampoKey[]).map(k => [k, v[k] != null ? fmtNum(v[k] as number) : ''])) as Record<CampoKey, string>);
    // SpO₂ atual é medida do momento: não se reaproveita a anterior. A meta é mantida.
    setSpo2('');
    setMetaMin(p?.spo2_meta_min != null ? fmtNum(p.spo2_meta_min) : '');
    setMetaMax(p?.spo2_meta_max != null ? fmtNum(p.spo2_meta_max) : '');
    setInicioLocal(paraInputLocal(new Date()));
    setMotivo('');
    setTextoManual(null);
    setErros([]);
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErroCarga('');
    const [epRes, paRes] = await Promise.all([
      supabase.from('suporte_resp_episodios').select('*').eq('paciente_id', patientId).order('inicio', { ascending: false }),
      supabase.from('suporte_resp_parametros').select('*').eq('paciente_id', patientId).order('registrado_em', { ascending: false }),
    ]);
    const erro = epRes.error || paRes.error;
    if (erro) {
      console.error('SuporteRespiratorioTab.carregar:', erro);
      setErroCarga(`Não foi possível carregar o suporte respiratório: ${erro.message}. Se o bloco acabou de ser instalado, confira se o script CREATE_SUPORTE_RESPIRATORIO.sql já foi aplicado no banco.`);
      setLoading(false);
      return;
    }
    const eps = (epRes.data ?? []) as Episodio[];
    const pas = (paRes.data ?? []) as Parametro[];
    setEpisodios(eps);
    setParametros(pas);
    const at = eps.find(e => !e.fim) ?? null;
    preencher(at, at ? pas.find(p => p.episodio_id === at.id) ?? null : null);
    setLoading(false);
  }, [patientId, preencher]);

  useEffect(() => { carregar(); }, [carregar]);

  const valores: Valores = useMemo(
    () => Object.fromEntries((Object.keys(CAMPOS) as CampoKey[]).map(k => [k, num(campos[k])])) as Valores,
    [campos],
  );
  const exibidos = useMemo(() => camposPara(situacao, dispositivo, modo), [situacao, dispositivo, modo]);

  const mudouSuporte = !!ativo && (situacao !== ativo.situacao || (dispositivo ?? null) !== (ativo.dispositivo ?? null));
  const novoEpisodio = !ativo || mudouSuporte;
  const inicioIso = useMemo(() => {
    const t = new Date(inicioLocal).getTime();
    return Number.isFinite(t) ? new Date(t).toISOString() : '';
  }, [inicioLocal]);

  // Mudou algum parâmetro do suporte em relação ao último registro? (SpO₂ atual não conta: é medida, não ajuste)
  const houveAlteracao = useMemo(() => {
    if (novoEpisodio || !ultimo || !situacao) return false;
    const novo = paraBanco(situacao, dispositivo, modo, valores, pesoKg);
    if ((novo.modo ?? null) !== (ultimo.modo ?? null)) return true;
    if ((Object.keys(CAMPOS) as CampoKey[]).some(k => !iguais(novo[k], ultimo[k]))) return true;
    return !iguais(num(metaMin), ultimo.spo2_meta_min) || !iguais(num(metaMax), ultimo.spo2_meta_max);
  }, [novoEpisodio, ultimo, situacao, dispositivo, modo, valores, pesoKg, metaMin, metaMax]);

  const textoGerado = useMemo(() => gerarTexto({
    situacao, dispositivo, modo, valores, pesoKg,
    inicioIso: novoEpisodio ? inicioIso : ativo?.inicio,
    spo2: num(spo2), spo2MetaMin: num(metaMin), spo2MetaMax: num(metaMax),
  }), [situacao, dispositivo, modo, valores, pesoKg, novoEpisodio, inicioIso, ativo, spo2, metaMin, metaMax]);
  const texto = textoManual ?? textoGerado;

  const ausentes = useMemo(() => camposAusentes(situacao, dispositivo, modo, valores), [situacao, dispositivo, modo, valores]);
  const psBipap = situacao === 'vni' && dispositivo === 'bipap' ? calcPressaoSuporte(valores.ipap, valores.epap) : null;
  const vcKg = calcVcMlKg(valores.vc_ml, pesoKg);

  function escolherSituacao(s: Situacao) {
    setSituacao(s);
    setMsgOk('');
    // Voltou para a situação do episódio em curso: restaura o dispositivo e o modo dele
    if (ativo && s === ativo.situacao) { setDispositivo(ativo.dispositivo); setModo(ultimo?.modo ?? null); }
    else { setDispositivo(null); setModo(null); }
  }

  async function salvar() {
    setMsgOk('');
    const lista = validar({ situacao, dispositivo, modo, valores, spo2: num(spo2), spo2MetaMin: num(metaMin), spo2MetaMax: num(metaMax) });
    if (novoEpisodio && situacao) {
      const e = validarInicio(inicioIso, mudouSuporte ? ativo?.inicio : null);
      if (e) lista.push(e);
    }
    if (mudouSuporte && !motivo.trim()) lista.push('Informe o motivo da mudança ou retirada do suporte anterior.');
    setErros(lista);
    if (lista.length > 0 || !situacao) return;

    setSaving(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const autorId = authUser?.id ?? null;
      const autorNome = user?.name ?? null;
      let episodioId = ativo?.id ?? null;

      if (novoEpisodio) {
        // Item 7.3: trocar o dispositivo encerra o episódio anterior e abre um novo
        if (mudouSuporte && ativo) {
          const { data: fechado, error: eFim } = await supabase
            .from('suporte_resp_episodios')
            .update({ fim: inicioIso, motivo_fim: motivo.trim(), encerrado_por: autorId, encerrado_por_nome: autorNome })
            .eq('id', ativo.id)
            .select('id');
          if (eFim || !fechado?.length) throw new Error(eFim?.message || 'não foi possível encerrar o episódio anterior');
        }
        const { data: novo, error: eNovo } = await supabase
          .from('suporte_resp_episodios')
          .insert({ paciente_id: patientId, situacao, dispositivo: precisaDispositivo(situacao) ? dispositivo : null, inicio: inicioIso, criado_por: autorId, criado_por_nome: autorNome })
          .select('id')
          .single();
        if (eNovo || !novo) {
          // Não deixa o paciente sem episódio em curso: reabre o anterior
          if (mudouSuporte && ativo) {
            await supabase.from('suporte_resp_episodios')
              .update({ fim: null, motivo_fim: null, encerrado_por: null, encerrado_por_nome: null })
              .eq('id', ativo.id);
          }
          throw new Error(eNovo?.message || 'não foi possível abrir o novo episódio');
        }
        episodioId = novo.id;
      }

      const tipo: TipoRegistro = novoEpisodio ? 'inicio' : houveAlteracao ? 'alteracao' : 'confirmacao';
      const { error: eParam } = await supabase.from('suporte_resp_parametros').insert({
        episodio_id: episodioId,
        paciente_id: patientId,
        registrado_por: autorId,
        registrado_por_nome: autorNome,
        tipo_registro: tipo,
        spo2: num(spo2),
        spo2_meta_min: num(metaMin),
        spo2_meta_max: num(metaMax),
        ...paraBanco(situacao, dispositivo, modo, valores, pesoKg),
        texto_clinico: texto.trim() || null,
      });
      if (eParam) throw new Error(eParam.message);

      await carregar();
      setMsgOk(tipo === 'inicio' ? 'Episódio iniciado e parâmetros gravados.' : tipo === 'alteracao' ? 'Alteração gravada no histórico.' : 'Confirmação gravada.');
    } catch (err) {
      console.error('SuporteRespiratorioTab.salvar:', err);
      setErros([`Não foi possível gravar: ${err instanceof Error ? err.message : 'erro desconhecido'}.`]);
      await carregar().catch(() => undefined);
    } finally {
      setSaving(false);
    }
  }

  async function copiarTexto() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErros(['Não foi possível copiar. Selecione o texto manualmente.']);
    }
  }

  const cardBase = 'bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden';
  const cardTitulo = 'px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-slate-100';
  const inputCls = 'w-full min-w-0 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400';
  const unidadeCls = 'px-3 flex items-center shrink-0 rounded-r-lg border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap';
  const labelCls = 'block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1';
  const radioCls = (on: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer text-sm transition-colors ${on
      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 font-semibold'
      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}`;
  const tabBtn = (ativa: boolean) =>
    `px-4 py-2 font-semibold text-sm transition-colors ${ativa
      ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`;

  // Campo numérico com a unidade fixa ao lado (item 10 da spec)
  const campoNumero = (rotulo: string, unidade: string, valor: string, onChange: (v: string) => void, obrigatorio = false, placeholder = '') => (
    <div>
      <label className={labelCls}>{rotulo}{obrigatorio && <span className="text-red-500"> *</span>}</label>
      <div className="flex items-stretch">
        <input
          type="text"
          inputMode="decimal"
          value={valor}
          onChange={e => { onChange(e.target.value); setMsgOk(''); }}
          placeholder={placeholder}
          disabled={saving}
          className={`${inputCls} rounded-l-lg`}
        />
        <span className={unidadeCls}>{unidade}</span>
      </div>
    </div>
  );

  if (loading) return <p className="text-center text-slate-500 dark:text-slate-400 py-6">Carregando suporte respiratório...</p>;

  if (erroCarga) {
    return (
      <div className="p-4 rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/25 text-sm text-red-800 dark:text-red-200">
        {erroCarga}
      </div>
    );
  }

  const rotuloBotao = saving ? 'Salvando...'
    : novoEpisodio ? (mudouSuporte ? 'Salvar troca de suporte' : 'Salvar e iniciar episódio')
      : houveAlteracao ? 'Salvar alteração' : 'Confirmar sem alterações';

  return (
    <div className="pb-6">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Suporte de Oxigenação e Ventilação</h2>

      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700">
        <button className={tabBtn(aba === 'registro')} onClick={() => setAba('registro')}>Registro</button>
        <button className={tabBtn(aba === 'historico')} onClick={() => setAba('historico')}>
          Histórico{episodios.length > 0 ? ` (${episodios.length})` : ''}
        </button>
      </div>

      {aba === 'registro' && (
        <div className="space-y-4">
          {ativo ? (
            <div className="p-3 rounded-xl border border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/25 text-sm text-primary-900 dark:text-primary-100">
              <p><strong>Suporte atual:</strong> {rotuloSuporte(ativo.situacao, ativo.dispositivo)} · desde {formatDataHora(ativo.inicio)} · {duracao(ativo.inicio)}</p>
              {ultimo && (
                <p className="mt-1 text-xs opacity-90">
                  Dados recuperados do último registro ({formatDataHora(ultimo.registrado_em)}{ultimo.registrado_por_nome ? `, ${ultimo.registrado_por_nome}` : ''}). Confirme ou altere.
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-300">
              Nenhum suporte registrado para este paciente. Selecione a situação atual para iniciar o primeiro episódio.
            </div>
          )}

          {/* Item 9: avaliação da oxigenação no cabeçalho do bloco */}
          <div className={cardBase}>
            <div className={cardTitulo}>Avaliação da oxigenação</div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {campoNumero('SpO₂ atual', '%', spo2, setSpo2, false, ultimo?.spo2 != null ? `última: ${fmtNum(ultimo.spo2)}` : '')}
              {campoNumero('Meta de SpO₂ (mínima)', '%', metaMin, setMetaMin)}
              {campoNumero('Meta de SpO₂ (máxima)', '%', metaMax, setMetaMax)}
            </div>
          </div>

          {/* Item 1 */}
          <div className={cardBase}>
            <div className={cardTitulo}>1. Situação atual do suporte respiratório <span className="text-red-500">*</span></div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SITUACOES.map(s => (
                <label key={s.key} className={radioCls(situacao === s.key)}>
                  <input type="radio" name="suporte-situacao" className="accent-primary-600" checked={situacao === s.key} onChange={() => escolherSituacao(s.key)} disabled={saving} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          {/* Itens 2, 3 e 4 */}
          {situacao && precisaDispositivo(situacao) && (
            <div className={cardBase}>
              <div className={cardTitulo}>2. {situacao === 'vni' ? 'Modalidade' : 'Dispositivo'} <span className="text-red-500">*</span></div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DISPOSITIVOS[situacao].map(d => (
                  <label key={d.key} className={radioCls(dispositivo === d.key)}>
                    <input type="radio" name="suporte-dispositivo" className="accent-primary-600" checked={dispositivo === d.key} onChange={() => { setDispositivo(d.key); setMsgOk(''); }} disabled={saving} />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Item 5 */}
          {situacao === 'vmi' && (
            <div className={cardBase}>
              <div className={cardTitulo}>2. Modo ventilatório <span className="text-red-500">*</span></div>
              <div className="p-4">
                <select value={modo ?? ''} onChange={e => { setModo(e.target.value || null); setMsgOk(''); }} disabled={saving} className={`${inputCls} rounded-lg`}>
                  <option value="">Selecione o modo...</option>
                  {MODOS_VM.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {exibidos.length > 0 && (
            <div className={cardBase}>
              <div className={cardTitulo}>3. Parâmetros</div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exibidos.filter(c => !c.calculado).map(c => (
                    <React.Fragment key={c.key}>
                      {campoNumero(CAMPOS[c.key].label, CAMPOS[c.key].unidade, campos[c.key], v => setCampos(prev => ({ ...prev, [c.key]: v })), c.obrigatorio)}
                    </React.Fragment>
                  ))}
                </div>

                {situacao === 'vni' && dispositivo === 'bipap' && (
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Pressão de suporte (IPAP − EPAP) = <strong>{psBipap != null ? `${fmtNum(psBipap)} cmH₂O` : '—'}</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400"> · calculada automaticamente</span>
                  </p>
                )}

                {exibidos.some(c => c.key === 'vc_ml') && valores.vc_ml != null && (
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {vcKg != null
                      ? <>Volume corrente = <strong>{fmtNum(vcKg)} mL/kg</strong> <span className="text-xs text-slate-500 dark:text-slate-400">· peso de {fmtNum(pesoKg as number)} kg</span></>
                      : <span className="text-xs text-slate-500 dark:text-slate-400">Peso do paciente não cadastrado: mL/kg não calculado.</span>}
                  </p>
                )}

                {ausentes.length > 0 && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Em branco: {ausentes.join(', ')}. São opcionais e podem ser salvos assim.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Item 6: datas do episódio */}
          {situacao && novoEpisodio && (
            <div className={cardBase}>
              <div className={cardTitulo}>{mudouSuporte ? 'Troca de suporte' : 'Início do episódio'}</div>
              <div className="p-4 space-y-3">
                {mudouSuporte && ativo && (
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Ao salvar, o episódio de <strong>{rotuloSuporte(ativo.situacao, ativo.dispositivo)}</strong> será encerrado na data abaixo e um novo episódio será aberto.
                  </p>
                )}
                <div>
                  <label className={labelCls}>Data e hora de início{mudouSuporte ? ' (e de retirada do suporte anterior)' : ''} <span className="text-red-500">*</span></label>
                  <input type="datetime-local" value={inicioLocal} max={paraInputLocal(new Date())} onChange={e => setInicioLocal(e.target.value)} disabled={saving} className={`${inputCls} rounded-lg sm:max-w-xs`} />
                </div>
                {mudouSuporte && (
                  <div>
                    <label className={labelCls}>Motivo da mudança ou retirada <span className="text-red-500">*</span></label>
                    <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={2} disabled={saving} placeholder="Ex.: melhora do desconforto respiratório, falha da VNI, extubação programada..." className={`${inputCls} rounded-lg resize-none`} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Item 8: texto clínico como rascunho, revisado pelo profissional */}
          {situacao && (
            <div className={cardBase}>
              <div className={cardTitulo}>Texto clínico (rascunho)</div>
              <div className="p-4 space-y-2">
                <textarea value={texto} onChange={e => setTextoManual(e.target.value)} rows={3} disabled={saving} className={`${inputCls} rounded-lg resize-y`} />
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Gerado automaticamente. Revise antes de salvar; o texto só vale depois da sua validação.</span>
                  {textoManual !== null && (
                    <button type="button" onClick={() => setTextoManual(null)} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">Gerar de novo</button>
                  )}
                  <button type="button" onClick={copiarTexto} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">{copiado ? 'Copiado!' : 'Copiar'}</button>
                </div>
              </div>
            </div>
          )}

          {!novoEpisodio && houveAlteracao && (
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Há alterações ainda não salvas.</p>
          )}

          {erros.length > 0 && (
            <div className="p-3 rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/25 text-sm text-red-800 dark:text-red-200">
              <ul className="list-disc pl-5 space-y-0.5">{erros.map(e => <li key={e}>{e}</li>)}</ul>
            </div>
          )}
          {msgOk && (
            <div className="p-3 rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/25 text-sm font-semibold text-green-800 dark:text-green-200">{msgOk}</div>
          )}

          {situacao && (
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={salvar} disabled={saving} className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm transition">
                {rotuloBotao}
              </button>
              {(mudouSuporte || houveAlteracao || textoManual !== null) && (
                <button type="button" onClick={() => { preencher(ativo, ultimo); setMsgOk(''); }} disabled={saving} className="px-5 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold text-sm transition">
                  Descartar mudanças
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {aba === 'historico' && (
        <div className="space-y-3">
          {episodios.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-6">Nenhum episódio registrado.</p>}
          {episodios.map(ep => {
            const regs = parametros.filter(p => p.episodio_id === ep.id);
            return (
              <div key={ep.id} className={cardBase}>
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{rotuloSuporte(ep.situacao, ep.dispositivo)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ep.fim ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'}`}>
                      {ep.fim ? 'Encerrado' : 'Em curso'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    <p>Início: {formatDataHora(ep.inicio)}{ep.criado_por_nome ? ` · ${ep.criado_por_nome}` : ''}</p>
                    {ep.fim && <p>Retirada: {formatDataHora(ep.fim)}{ep.encerrado_por_nome ? ` · ${ep.encerrado_por_nome}` : ''}</p>}
                    {regs[0] && <p>Última modificação: {formatDataHora(regs[0].registrado_em)}</p>}
                    <p>Tempo total de utilização: <strong>{duracao(ep.inicio, ep.fim)}</strong></p>
                    {ep.motivo_fim && <p>Motivo da mudança ou retirada: {ep.motivo_fim}</p>}
                  </div>
                </div>
                <details>
                  <summary className="px-4 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 cursor-pointer select-none">
                    {regs.length} registro{regs.length === 1 ? '' : 's'} de parâmetros
                  </summary>
                  <div className="px-4 pb-3 space-y-2">
                    {regs.map(p => (
                      <div key={p.id} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                        <p className="font-semibold">{formatDataHora(p.registrado_em)} · {TIPO_LABEL[p.tipo_registro]}{p.registrado_por_nome ? ` · ${p.registrado_por_nome}` : ''}</p>
                        <p className="mt-0.5">
                          {resumoParametros(ep.situacao, p.modo, doBanco(p))}
                          {p.vc_ml_kg != null ? ` (${fmtNum(p.vc_ml_kg)} mL/kg)` : ''}
                          {p.spo2 != null ? ` · SpO₂ ${fmtNum(p.spo2)}%` : ''}
                        </p>
                        {p.texto_clinico && <p className="mt-1 italic text-slate-600 dark:text-slate-400">{p.texto_clinico}</p>}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
