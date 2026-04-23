import React, { useState, useMemo, useRef, forwardRef } from 'react';
import { supabase } from '../supabaseClient';

type FaixaEtaria = 'rn' | 'lactente' | 'crianca';
type TelaAtiva = 'lista' | 'form' | 'resultado';

// =================== ÍCONES ===================
const IconeCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-green-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const IconeVoltar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// =================== DADOS DAS ESCALAS ===================

// Boletim Silverman-Anderson (Recém-nascidos, 0-28 dias) — /10 pts
const silvermannOpcoes = {
  movimentoToracoAbdominal: [
    { texto: '0 - Sincrônico', valor: 0 },
    { texto: '1 - Leve assincronia', valor: 1 },
    { texto: '2 - Paradoxal', valor: 2 },
  ],
  retracaoIntercostal: [
    { texto: '0 - Ausente', valor: 0 },
    { texto: '1 - Leve', valor: 1 },
    { texto: '2 - Marcada', valor: 2 },
  ],
  retracaoXifoide: [
    { texto: '0 - Ausente', valor: 0 },
    { texto: '1 - Leve', valor: 1 },
    { texto: '2 - Marcada', valor: 2 },
  ],
  batimentoAsaNasal: [
    { texto: '0 - Ausente', valor: 0 },
    { texto: '1 - Discreto', valor: 1 },
    { texto: '2 - Marcado', valor: 2 },
  ],
  gemidoExpiratorio: [
    { texto: '0 - Ausente', valor: 0 },
    { texto: '1 - Audível com estetoscópio', valor: 1 },
    { texto: '2 - Audível sem estetoscópio', valor: 2 },
  ],
};

// Escala Wood-Downes Modificada por Ferres (Lactentes, 30 dias - 2 anos) — /14 pts
const woodDownesOpcoes = {
  sibilos: [
    { texto: '0 - Ausente', valor: 0 },
    { texto: '1 - Expiratório', valor: 1 },
    { texto: '2 - Contínuos', valor: 2 },
    { texto: '3 - Inspiratório + Expiratório', valor: 3 },
  ],
  tiragem: [
    { texto: '0 - Ausente', valor: 0 },
    { texto: '1 - Subcostal', valor: 1 },
    { texto: '2 - Supraclavicular', valor: 2 },
    { texto: '3 - Generalizada', valor: 3 },
  ],
  ventilacao: [
    { texto: '0 - Boa', valor: 0 },
    { texto: '1 - Regular', valor: 1 },
    { texto: '2 - Diminuída', valor: 2 },
    { texto: '3 - Silenciosa', valor: 3 },
  ],
  fr: [
    { texto: '0 - < 30 irpm', valor: 0 },
    { texto: '1 - 31 a 45 irpm', valor: 1 },
    { texto: '2 - 46 a 60 irpm', valor: 2 },
    { texto: '3 - > 60 irpm', valor: 3 },
  ],
  fc: [
    { texto: '0 - < 120 bpm', valor: 0 },
    { texto: '1 - ≥ 120 bpm', valor: 1 },
  ],
  cianose: [
    { texto: '0 - Ausente', valor: 0 },
    { texto: '1 - Presente', valor: 1 },
  ],
};

// Escala de Insuficiência Respiratória (Pré-escolar/Escolar/Adolescente — 3 a 15 anos) — /12 pts
const insufRespOpcoes = {
  fr: [
    { texto: '0 - Normal para a idade', valor: 0 },
    { texto: '1 - Moderadamente aumentada', valor: 1 },
    { texto: '2 - Taquipneia intensa', valor: 2 },
  ],
  musculaturaAcessoria: [
    { texto: '0 - Ausente', valor: 0 },
    { texto: '1 - Leve (asa nasal, retração intercostal)', valor: 1 },
    { texto: '2 - Intensa (tiragem subcostal ou esternocleidomastoideo)', valor: 2 },
  ],
  auscultaPulmonar: [
    { texto: '0 - Som pulmonar preservado', valor: 0 },
    { texto: '1 - Redução do som pulmonar', valor: 1 },
    { texto: '2 - Redução acentuada / sibilos silenciosos', valor: 2 },
  ],
  cianose: [
    { texto: '0 - Ausente', valor: 0 },
    { texto: '1 - Perioral (com esforço)', valor: 1 },
    { texto: '2 - Generalizada ou em repouso', valor: 2 },
  ],
  estadoMental: [
    { texto: '0 - Alerta', valor: 0 },
    { texto: '1 - Irritado, ansioso', valor: 1 },
    { texto: '2 - Sonolento, confuso, obnubilado', valor: 2 },
  ],
  saturacao: [
    { texto: '0 - ≥ 94% em ar ambiente', valor: 0 },
    { texto: '1 - 90 a 93% em ar ambiente', valor: 1 },
    { texto: '2 - < 90% em ar ambiente', valor: 2 },
  ],
};

// =================== INTERPRETAÇÕES ===================

const getInterpretacaoSilverman = (total: number) => {
  if (total === 0) return {
    texto: 'Sem desconforto respiratório',
    cor: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500',
    norte: 'Observação / O₂ se necessário',
  };
  if (total <= 3) return {
    texto: 'Desconforto Leve',
    cor: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500',
    norte: 'Observação / O₂ se necessário',
  };
  if (total <= 6) return {
    texto: 'Desconforto Moderado',
    cor: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500',
    norte: 'CPAP nasal ou CNAF',
  };
  return {
    texto: 'Desconforto Grave',
    cor: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500',
    norte: 'Forte possibilidade de VMPI',
  };
};

const getInterpretacaoWoodDownes = (total: number) => {
  if (total <= 3) return {
    texto: 'Desconforto Leve',
    cor: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500',
    norte: '1–4: CN ou CNAF',
  };
  if (total <= 7) return {
    texto: 'Desconforto Moderado',
    cor: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500',
    norte: '4–7: CNAF ou VNI',
  };
  return {
    texto: 'Desconforto Grave',
    cor: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500',
    norte: '8–14: VMPI',
  };
};

const getInterpretacaoInsufResp = (total: number) => {
  if (total <= 3) return {
    texto: 'Insuficiência Respiratória Leve',
    cor: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500',
    norte: '0–3: Observação – sem sinais de alerta',
  };
  if (total <= 6) return {
    texto: 'Insuficiência Respiratória Moderada',
    cor: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500',
    norte: '4–6: Considerar Oxigenoterapia',
  };
  return {
    texto: 'Insuficiência Respiratória Grave',
    cor: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500',
    norte: '≥7: Avaliar escalonamento do suporte ventilatório',
  };
};

const getInterpretacao = (faixa: FaixaEtaria, total: number) => {
  if (faixa === 'rn') return getInterpretacaoSilverman(total);
  if (faixa === 'lactente') return getInterpretacaoWoodDownes(total);
  return getInterpretacaoInsufResp(total);
};

const getEscalaNome = (faixa: FaixaEtaria) => {
  if (faixa === 'rn') return 'Silverman-Anderson';
  if (faixa === 'lactente') return 'Wood-Downes-Ferres';
  return 'Ins. Resp. Pediátrica';
};

const getMaxPontos = (faixa: FaixaEtaria) => {
  if (faixa === 'rn') return 10;
  if (faixa === 'lactente') return 14;
  return 12;
};

// =================== DROPDOWN ===================
interface DropdownOpcao { texto: string; valor: number; }
interface DropdownProps {
  label: string;
  id: string;
  valor: number | null;
  onOpcaoChange: (v: number | null) => void;
  opcoes: DropdownOpcao[];
}

const DropdownResp = forwardRef<HTMLDivElement | null, DropdownProps>(
  ({ label, id, valor, onOpcaoChange, opcoes }, ref) => (
    <div ref={ref} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-gray-300">
          {label}
        </label>
        {valor !== null && <IconeCheck />}
      </div>
      <select
        id={id}
        value={valor === null ? '' : valor}
        onChange={(e) => onOpcaoChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">Selecione...</option>
        {opcoes.map((opt) => (
          <option key={opt.valor} value={opt.valor}>{opt.texto}</option>
        ))}
      </select>
    </div>
  )
);
DropdownResp.displayName = 'DropdownResp';

// =================== COMPONENTE PRINCIPAL ===================
interface AvaliacaoRespiratoriaScaleProps {
  patientId: string;
}

export const AvaliacaoRespiratoriaScale: React.FC<AvaliacaoRespiratoriaScaleProps> = ({ patientId }) => {
  const [telaAtiva, setTelaAtiva] = useState<TelaAtiva>('lista');
  const [faixaEtaria, setFaixaEtaria] = useState<FaixaEtaria | null>(null);
  const [pontuacaoTotalCalculada, setPontuacaoTotalCalculada] = useState(0);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  // Silverman-Anderson (RN)
  const [sa_movimento, setSaMovimento] = useState<number | null>(null);
  const [sa_intercostal, setSaIntercostal] = useState<number | null>(null);
  const [sa_xifoide, setSaXifoide] = useState<number | null>(null);
  const [sa_asaNasal, setSaAsaNasal] = useState<number | null>(null);
  const [sa_gemido, setSaGemido] = useState<number | null>(null);

  // Wood-Downes-Ferres (Lactente)
  const [wd_sibilos, setWdSibilos] = useState<number | null>(null);
  const [wd_tiragem, setWdTiragem] = useState<number | null>(null);
  const [wd_ventilacao, setWdVentilacao] = useState<number | null>(null);
  const [wd_fr, setWdFr] = useState<number | null>(null);
  const [wd_fc, setWdFc] = useState<number | null>(null);
  const [wd_cianose, setWdCianose] = useState<number | null>(null);

  // Insuficiência Resp. (Criança)
  const [ir_fr, setIrFr] = useState<number | null>(null);
  const [ir_musculatura, setIrMusculatura] = useState<number | null>(null);
  const [ir_ausculta, setIrAusculta] = useState<number | null>(null);
  const [ir_cianose, setIrCianose] = useState<number | null>(null);
  const [ir_estadoMental, setIrEstadoMental] = useState<number | null>(null);
  const [ir_saturacao, setIrSaturacao] = useState<number | null>(null);

  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const ref4 = useRef<HTMLDivElement>(null);
  const ref5 = useRef<HTMLDivElement>(null);
  const ref6 = useRef<HTMLDivElement>(null);

  const handleChange = (setter: (v: number | null) => void, value: number | null, nextRef: React.RefObject<HTMLDivElement | null> | null) => {
    setter(value);
    if (nextRef && value !== null) {
      setTimeout(() => nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  };

  const resetForm = () => {
    setSaMovimento(null); setSaIntercostal(null); setSaXifoide(null); setSaAsaNasal(null); setSaGemido(null);
    setWdSibilos(null); setWdTiragem(null); setWdVentilacao(null); setWdFr(null); setWdFc(null); setWdCianose(null);
    setIrFr(null); setIrMusculatura(null); setIrAusculta(null); setIrCianose(null); setIrEstadoMental(null); setIrSaturacao(null);
    setPontuacaoTotalCalculada(0);
    setErroForm(null);
    setSaveStatus(null);
  };

  const handleSelecionarFaixa = (faixa: FaixaEtaria) => {
    resetForm();
    setFaixaEtaria(faixa);
  };

  const handleCalcular = () => {
    setErroForm(null);
    if (!faixaEtaria) return;

    let campos: (number | null)[] = [];
    if (faixaEtaria === 'rn') campos = [sa_movimento, sa_intercostal, sa_xifoide, sa_asaNasal, sa_gemido];
    else if (faixaEtaria === 'lactente') campos = [wd_sibilos, wd_tiragem, wd_ventilacao, wd_fr, wd_fc, wd_cianose];
    else campos = [ir_fr, ir_musculatura, ir_ausculta, ir_cianose, ir_estadoMental, ir_saturacao];

    if (campos.some(v => v === null)) {
      setErroForm('Por favor, preencha todos os campos da escala.');
      return;
    }

    const total = campos.reduce<number>((acc, val) => acc + (val ?? 0), 0);
    setPontuacaoTotalCalculada(total);
    setTelaAtiva('resultado');
  };

  const handleSalvar = async () => {
    if (!faixaEtaria || isSaving) return;
    setIsSaving(true);

    const interpretacao = getInterpretacao(faixaEtaria, pontuacaoTotalCalculada);
    const scaleName = `Aval. Resp. - ${getEscalaNome(faixaEtaria)}`;

    try {
      const { error } = await supabase
        .from('scale_scores')
        .insert({
          patient_id: patientId,
          scale_name: scaleName,
          score: pontuacaoTotalCalculada,
          interpretation: interpretacao.texto,
          date: new Date().toISOString(),
        });

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus(null);
        resetForm();
        setFaixaEtaria(null);
        setTelaAtiva('lista');
      }, 1500);
    } catch (err) {
      console.error('Erro ao salvar avaliação respiratória:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const interpretacaoAtual = useMemo(
    () => faixaEtaria ? getInterpretacao(faixaEtaria, pontuacaoTotalCalculada) : null,
    [faixaEtaria, pontuacaoTotalCalculada]
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-gray-300 rounded-lg min-h-[600px]">

      {/* =================== TELA LISTA =================== */}
      {telaAtiva === 'lista' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Avaliação Respiratória
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Selecione a escala conforme a faixa etária do paciente.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-3">
              <div className="font-bold text-blue-400 mb-2">Escalas disponíveis:</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">0 – 28 dias</span>
                  <span>Silverman-Anderson · /10 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">30 dias – 2 anos</span>
                  <span>Wood-Downes-Ferres · /14 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">3 – 15 anos</span>
                  <span>Ins. Resp. Pediátrica · /12 pts</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { resetForm(); setFaixaEtaria(null); setTelaAtiva('form'); }}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
            >
              Iniciar Nova Avaliação
            </button>
          </div>
        </div>
      )}

      {/* =================== TELA FORMULÁRIO =================== */}
      {telaAtiva === 'form' && (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => { setFaixaEtaria(null); setTelaAtiva('lista'); }}
              className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <IconeVoltar />
            </button>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Nova Avaliação Respiratória
            </h2>
          </div>

          {/* Seleção de faixa etária */}
          {!faixaEtaria && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center font-medium">
                Selecione a faixa etária do paciente:
              </p>

              <button
                onClick={() => handleSelecionarFaixa('rn')}
                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 p-4 rounded-xl text-left transition-all shadow-sm"
              >
                <p className="font-bold text-slate-800 dark:text-slate-100 text-base">0 a 28 dias</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Boletim de Silverman-Anderson</p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Recém-nascidos · /10 pontos</p>
              </button>

              <button
                onClick={() => handleSelecionarFaixa('lactente')}
                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 p-4 rounded-xl text-left transition-all shadow-sm"
              >
                <p className="font-bold text-slate-800 dark:text-slate-100 text-base">30 dias a 2 anos</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Escala de Wood-Downes Modificada por Ferres</p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Lactentes · /14 pontos</p>
              </button>

              <button
                onClick={() => handleSelecionarFaixa('crianca')}
                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 p-4 rounded-xl text-left transition-all shadow-sm"
              >
                <p className="font-bold text-slate-800 dark:text-slate-100 text-base">3 a 15 anos</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Escala de Avaliação da Insuficiência Respiratória</p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Pré-escolar · Escolar · Adolescente · /12 pontos</p>
              </button>
            </div>
          )}

          {/* ---- FORMULÁRIO: Silverman-Anderson (RN) ---- */}
          {faixaEtaria === 'rn' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Silverman-Anderson · RN (0–28 dias) · /10 pts
                </p>
                <button onClick={() => setFaixaEtaria(null)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline">
                  Trocar faixa
                </button>
              </div>

              <DropdownResp ref={ref1} label="1. Movimento tóraco-abdominal" id="sa_movimento" valor={sa_movimento}
                onOpcaoChange={(v) => handleChange(setSaMovimento, v, ref2)} opcoes={silvermannOpcoes.movimentoToracoAbdominal} />
              <DropdownResp ref={ref2} label="2. Retração intercostal" id="sa_intercostal" valor={sa_intercostal}
                onOpcaoChange={(v) => handleChange(setSaIntercostal, v, ref3)} opcoes={silvermannOpcoes.retracaoIntercostal} />
              <DropdownResp ref={ref3} label="3. Retração xifoide" id="sa_xifoide" valor={sa_xifoide}
                onOpcaoChange={(v) => handleChange(setSaXifoide, v, ref4)} opcoes={silvermannOpcoes.retracaoXifoide} />
              <DropdownResp ref={ref4} label="4. Batimento de asa nasal" id="sa_asaNasal" valor={sa_asaNasal}
                onOpcaoChange={(v) => handleChange(setSaAsaNasal, v, ref5)} opcoes={silvermannOpcoes.batimentoAsaNasal} />
              <DropdownResp ref={ref5} label="5. Gemido expiratório" id="sa_gemido" valor={sa_gemido}
                onOpcaoChange={(v) => handleChange(setSaGemido, v, null)} opcoes={silvermannOpcoes.gemidoExpiratorio} />

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase mb-2">⚠ Escalar independentemente do escore se:</p>
                <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                  FR ≥ 60 irpm · Apneia recorrente · Esforço débil · Cianose central · SpO₂ &lt; 90–92% · Perfusão lenta · Estado geral sonolento · Choque/Hipotensão
                </p>
              </div>
            </div>
          )}

          {/* ---- FORMULÁRIO: Wood-Downes-Ferres (Lactente) ---- */}
          {faixaEtaria === 'lactente' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Wood-Downes-Ferres · 30 dias–2 anos · /14 pts
                </p>
                <button onClick={() => setFaixaEtaria(null)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline">
                  Trocar faixa
                </button>
              </div>

              <DropdownResp ref={ref1} label="1. Sibilos" id="wd_sibilos" valor={wd_sibilos}
                onOpcaoChange={(v) => handleChange(setWdSibilos, v, ref2)} opcoes={woodDownesOpcoes.sibilos} />
              <DropdownResp ref={ref2} label="2. Tiragem" id="wd_tiragem" valor={wd_tiragem}
                onOpcaoChange={(v) => handleChange(setWdTiragem, v, ref3)} opcoes={woodDownesOpcoes.tiragem} />
              <DropdownResp ref={ref3} label="3. Ventilação" id="wd_ventilacao" valor={wd_ventilacao}
                onOpcaoChange={(v) => handleChange(setWdVentilacao, v, ref4)} opcoes={woodDownesOpcoes.ventilacao} />
              <DropdownResp ref={ref4} label="4. FR (Frequência Respiratória)" id="wd_fr" valor={wd_fr}
                onOpcaoChange={(v) => handleChange(setWdFr, v, ref5)} opcoes={woodDownesOpcoes.fr} />
              <DropdownResp ref={ref5} label="5. FC (Frequência Cardíaca)" id="wd_fc" valor={wd_fc}
                onOpcaoChange={(v) => handleChange(setWdFc, v, ref6)} opcoes={woodDownesOpcoes.fc} />
              <DropdownResp ref={ref6} label="6. Cianose" id="wd_cianose" valor={wd_cianose}
                onOpcaoChange={(v) => handleChange(setWdCianose, v, null)} opcoes={woodDownesOpcoes.cianose} />
            </div>
          )}

          {/* ---- FORMULÁRIO: Insuficiência Resp. (Criança) ---- */}
          {faixaEtaria === 'crianca' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Ins. Resp. Pediátrica · 3–15 anos · /12 pts
                </p>
                <button onClick={() => setFaixaEtaria(null)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline">
                  Trocar faixa
                </button>
              </div>

              <DropdownResp ref={ref1} label="1. FR (Frequência Respiratória)" id="ir_fr" valor={ir_fr}
                onOpcaoChange={(v) => handleChange(setIrFr, v, ref2)} opcoes={insufRespOpcoes.fr} />
              <DropdownResp ref={ref2} label="2. Uso de Musculatura Acessória" id="ir_musculatura" valor={ir_musculatura}
                onOpcaoChange={(v) => handleChange(setIrMusculatura, v, ref3)} opcoes={insufRespOpcoes.musculaturaAcessoria} />
              <DropdownResp ref={ref3} label="3. Ausculta Pulmonar" id="ir_ausculta" valor={ir_ausculta}
                onOpcaoChange={(v) => handleChange(setIrAusculta, v, ref4)} opcoes={insufRespOpcoes.auscultaPulmonar} />
              <DropdownResp ref={ref4} label="4. Cianose" id="ir_cianose" valor={ir_cianose}
                onOpcaoChange={(v) => handleChange(setIrCianose, v, ref5)} opcoes={insufRespOpcoes.cianose} />
              <DropdownResp ref={ref5} label="5. Estado Mental" id="ir_estadoMental" valor={ir_estadoMental}
                onOpcaoChange={(v) => handleChange(setIrEstadoMental, v, ref6)} opcoes={insufRespOpcoes.estadoMental} />
              <DropdownResp ref={ref6} label="6. Saturação de O₂ em ar ambiente" id="ir_saturacao" valor={ir_saturacao}
                onOpcaoChange={(v) => handleChange(setIrSaturacao, v, null)} opcoes={insufRespOpcoes.saturacao} />
            </div>
          )}

          {faixaEtaria && (
            <>
              {erroForm && (
                <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-slate-700 rounded-lg text-center">
                  {erroForm}
                </div>
              )}
              <button
                onClick={handleCalcular}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 mt-4"
              >
                Calcular Pontuação
              </button>
            </>
          )}
        </div>
      )}

      {/* =================== TELA RESULTADO =================== */}
      {telaAtiva === 'resultado' && interpretacaoAtual && faixaEtaria && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => setTelaAtiva('form')}
              className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <IconeVoltar />
            </button>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Resultado da Avaliação
            </h2>
          </div>

          <div className={`p-8 rounded-2xl border-2 ${interpretacaoAtual.border} ${interpretacaoAtual.bg} text-center space-y-4`}>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getEscalaNome(faixaEtaria)} · máx. {getMaxPontos(faixaEtaria)} pts
            </p>
            <div className={`text-5xl font-bold ${interpretacaoAtual.cor}`}>
              {pontuacaoTotalCalculada}/{getMaxPontos(faixaEtaria)}
            </div>
            <div className={`text-2xl font-bold ${interpretacaoAtual.cor}`}>
              {interpretacaoAtual.texto}
            </div>
            <div className="pt-4 border-t border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300">
              <p className="font-semibold mb-1">NORTE — Suporte de Escolha:</p>
              <p className="font-bold">{interpretacaoAtual.norte}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSalvar}
              disabled={isSaving || saveStatus === 'success'}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {isSaving ? 'Salvando...' : saveStatus === 'success' ? '✓ Registrado!' : 'Salvar no Histórico'}
            </button>
            {saveStatus === 'error' && (
              <p className="text-red-500 text-sm text-center">Erro ao salvar. Tente novamente.</p>
            )}
            <button
              onClick={() => { setTelaAtiva('form'); setSaveStatus(null); }}
              className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              Voltar ao Formulário
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
