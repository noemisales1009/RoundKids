import React, { useState, useMemo, useContext } from 'react';
import { ThemeContext } from '../contexts';

// ==========================================
// 🧠 CONFIGURAÇÃO DAS 3 ESCALAS DE DELIRIUM
// ==========================================

const scoreOptions0_4 = [
  { valor: 0, texto: '0 – Nunca' },
  { valor: 1, texto: '1 – Raramente' },
  { valor: 2, texto: '2 – Ocasionalmente' },
  { valor: 3, texto: '3 – Frequentemente' },
  { valor: 4, texto: '4 – Sempre' },
];

const scoreOptions0_2 = [
  { valor: 0, texto: '0 – Ausente' },
  { valor: 1, texto: '1 – Leve/Intermitente' },
  { valor: 2, texto: '2 – Moderado/Contínuo' },
];

const binaryOptions = [
  { texto: 'Anormal / Presente', valor: true, cor: 'text-red-400' },
  { texto: 'Normal / Ausente', valor: false, cor: 'text-green-400' },
];

const escalasConfig = {
  capd: {
    titulo: 'CAPD',
    nomeCompleto: 'Cornell Assessment of Pediatric Delirium',
    idade: '0 meses a 21 anos',
    tipo: 'score',
    colecao: 'capd_assessments',
    corte: 9,
    maxScore: 32,
    opcoes: scoreOptions0_4,
    itens: [
      { id: 'c1', label: '1. Diminuição da atenção', desc: 'Capacidade de manter foco em estímulos/ambiente.' },
      { id: 'c2', label: '2. Retraimento', desc: 'Redução da interação social ou responsividade.' },
      { id: 'c3', label: '3. Lentidão nas respostas', desc: 'Velocidade e adequação das respostas.' },
      { id: 'c4', label: '4. Variabilidade do nível de consciência', desc: 'Oscilação entre sono, alerta e agitação.' },
      { id: 'c5', label: '5. Desorientação', desc: 'Reconhecimento de ambiente e pessoas.' },
      { id: 'c6', label: '6. Movimentos incongruentes', desc: 'Movimentos não habituais (agitação, puxar dispositivos).' },
      { id: 'c7', label: '7. Inconsistência comportamental', desc: 'Respostas imprevisíveis ou conflitantes.' },
      { id: 'c8', label: '8. Alteração da percepção', desc: 'Alucinações, ilusões, medos intensos.' },
    ],
    cores: { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-500', bgBase: 'bg-indigo-700', bgProgress: 'bg-indigo-500' },
  },
  sospd: {
    titulo: 'SOS-PD',
    nomeCompleto: 'Sophia Observation Withdrawal/Delirium',
    idade: 'UTI neonatal e pediátrica',
    tipo: 'score',
    colecao: 'sos_pd_assessments',
    corte: 4,
    maxScore: 12,
    opcoes: scoreOptions0_2,
    itens: [
      { id: 'c1', label: '1. Agitação', desc: 'Movimentos habituais (0) -> Agitação intensa (2)' },
      { id: 'c2', label: '2. Inconsolabilidade', desc: 'Consola facilmente (0) -> Inconsolável (2)' },
      { id: 'c3', label: '3. Alteração do Sono', desc: 'Sono adequado (0) -> Sono muito fragmentado (2)' },
      { id: 'c4', label: '4. Alteração do Contato Visual', desc: 'Contato visual normal (0) -> Sem contato visual (2)' },
      { id: 'c5', label: '5. Tremores / Rigidez', desc: 'Ausente (0) -> Tremores em repouso; rigidez (2)' },
      { id: 'c6', label: '6. Sinais Autonômicos', desc: 'Ausentes (0) -> Intensos (taquicardia, sudorese, febre) (2)' },
    ],
    cores: { bg: 'bg-red-600', hover: 'hover:bg-red-500', bgBase: 'bg-red-700', bgProgress: 'bg-red-500' },
  },
  psCAMICU: {
    titulo: 'psCAM-ICU',
    nomeCompleto: 'Preschool CAM-ICU (6m a 5a)',
    idade: '6 meses a 5 anos',
    tipo: 'binary',
    colecao: 'cam_icu_assessments',
    opcoes: binaryOptions,
    itens: [
      { id: 'c1', label: '1. Alteração aguda ou flutuante', desc: 'Mudança súbita no comportamento ou consciência.' },
      { id: 'c2', label: '2. Déficit de atenção', desc: 'Falha no teste de estímulos visuais.' },
      { id: 'c3', label: '3. Nível de consciência alterado', desc: 'Não está em estado alerta.' },
      { id: 'c4', label: '4. Pensamento desorganizado', desc: 'Respostas incoerentes ou comportamento incompatível.' },
    ],
    cores: { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', bgBase: 'bg-blue-700', bgProgress: 'bg-blue-500' },
  },
  pCAMICU: {
    titulo: 'pCAM-ICU',
    nomeCompleto: 'Pediatric CAM-ICU (≥ 5 anos)',
    idade: '≥ 5 anos (cognitivamente aptos)',
    tipo: 'binary',
    colecao: 'cam_icu_assessments',
    opcoes: binaryOptions,
    itens: [
      { id: 'c1', label: '1. Alteração aguda ou flutuante', desc: 'Mudança nas últimas 24 horas.' },
      { id: 'c2', label: '2. Déficit de atenção', desc: 'Falha no Teste ABC ou contagem.' },
      { id: 'c3', label: '3. Nível de consciência alterado', desc: 'Não está alerta.' },
      { id: 'c4', label: '4. Pensamento desorganizado', desc: 'Falha em perguntas simples.' },
    ],
    cores: { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', bgBase: 'bg-blue-700', bgProgress: 'bg-blue-500' },
  },
};

const getScaleColorClasses = (scaleTitle) => {
  const allColors = {
    CAPD: escalasConfig.capd.cores,
    'SOS-PD': escalasConfig.sospd.cores,
    'psCAM-ICU': escalasConfig.psCAMICU.cores,
    'pCAM-ICU': escalasConfig.pCAMICU.cores,
  };
  return allColors[scaleTitle] || allColors['CAPD'];
};

// ==========================================
// 🎨 COMPONENTES UI
// ==========================================

const BackArrowIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CheckCircleIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={`${className} text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SaveIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-4 10V4m0 0l-3 3m3-3l3 3" />
  </svg>
);

interface DeliriumQuestionCardProps {
  item: any;
  valor: any;
  onChange: (val: any) => void;
  opcoes: any[];
  isDark: boolean;
  tipo: string;
}

const DeliriumQuestionCard: React.FC<DeliriumQuestionCardProps> = ({ item, valor, onChange, opcoes, isDark, tipo }) => {
  const isSelected = valor !== undefined && valor !== null && valor !== '';

  const cardClasses = isDark
    ? isSelected
      ? 'bg-slate-700 border-blue-500'
      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
    : isSelected
    ? 'bg-blue-50 border-blue-400'
    : 'bg-white border-slate-200 hover:border-slate-300';

  const labelColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const textColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const selectClasses = isDark
    ? 'bg-slate-900 border-slate-600 text-gray-100 focus:ring-2 focus:ring-blue-500'
    : 'bg-white border-slate-300 text-gray-900 focus:ring-2 focus:ring-blue-500';

  const labelText = tipo === 'binary' ? 'Resultado' : 'Pontuação';

  const availableOptions = tipo === 'binary'
    ? opcoes.map((opt) => ({
        valor: opt.valor ? 'true' : 'false',
        texto: opt.texto,
      }))
    : opcoes.map((opt) => ({
        valor: opt.valor,
        texto: opt.texto,
      }));

  return (
    <div
      id={item.id}
      className={`p-4 sm:p-5 rounded-xl border shadow-md mb-4 transition-all duration-300 ${cardClasses}`}
    >
      <div className="mb-4 flex justify-between items-start gap-2">
        <div className="flex-1">
          <label className={`block text-sm sm:text-base font-bold ${labelColor}`}>{item.label}</label>
          <p className={`text-xs sm:text-sm mt-2 ${textColor}`}>{item.desc}</p>
        </div>
        {isSelected && <CheckCircleIcon className="w-5 h-5 shrink-0" />}
      </div>

      <div className="relative">
        <select
          value={
            valor === undefined || valor === null
              ? ''
              : tipo === 'binary'
              ? valor
                ? 'true'
                : 'false'
              : valor
          }
          onChange={(e) =>
            onChange(tipo === 'binary' ? e.target.value === 'true' : parseInt(e.target.value))
          }
          className={`w-full p-3 pr-10 rounded-lg border appearance-none cursor-pointer focus:ring-2 focus:outline-none transition-all text-sm sm:text-base ${selectClasses}`}
        >
          <option value="" disabled>
            Selecione o {labelText}...
          </option>
          {availableOptions.map((opt) => (
            <option key={opt.texto} value={opt.valor}>
              {opt.texto}
            </option>
          ))}
        </select>
        <svg
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 COMPONENTE PRINCIPAL
// ==========================================

interface DeliriumMasterScaleProps {
  onSaveScore?: (score: any) => void;
}

export const DeliriumMasterScale: React.FC<DeliriumMasterScaleProps> = ({ onSaveScore }) => {
  const contextValue = useContext(ThemeContext);
  const { theme } = contextValue || { theme: 'dark' };
  const isDark = theme === 'dark';

  const [tela, setTela] = useState<'intro' | 'sub_select' | 'form' | 'resultado'>('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);

  const configAtual = escalaAtiva ? escalasConfig[escalaAtiva as keyof typeof escalasConfig] : null;
  const corClasses = configAtual ? getScaleColorClasses(configAtual.titulo) : getScaleColorClasses('CAPD');

  const itensRespondidos = configAtual
    ? Object.keys(respostas).filter((key) => respostas[key] !== undefined && respostas[key] !== null).length
    : 0;
  const totalItens = configAtual ? configAtual.itens.length : 0;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;

  const pontuacaoTotal = useMemo(() => {
    return Object.values(respostas).reduce((acc: number, val: any) => {
      if (typeof val === 'number') return acc + val;
      return acc;
    }, 0);
  }, [respostas]);

  const resultadoAvaliacao = useMemo(() => {
    if (itensRespondidos < totalItens) {
      return {
        texto: 'Avaliação em Andamento',
        detalhe: `Pontuação atual: ${pontuacaoTotal} de ${(configAtual as any)?.maxScore || 32}.`,
        cor: isDark ? 'text-yellow-400' : 'text-yellow-600',
        bg: isDark ? 'bg-yellow-600' : 'bg-yellow-500',
        border: 'border-yellow-500',
        icone: '⏳',
        isCompleto: false,
        pontuacao: pontuacaoTotal,
      };
    }

    if (configAtual && configAtual.tipo === 'score') {
      const score = pontuacaoTotal;
      const isDelirium = score >= (configAtual as any).corte;

      let interpretacao = '';
      if (configAtual.titulo === 'CAPD') {
        interpretacao = isDelirium ? 'Delirium Provável' : 'Sem Delirium';
      } else if (configAtual.titulo === 'SOS-PD') {
        interpretacao = isDelirium
          ? score >= 7
            ? 'Quadro Grave'
            : 'Delirium ou Abstinência'
          : score >= 2
          ? 'Sinais Leves'
          : 'Sem Sinais';
      }

      const cor = isDelirium
        ? score >= 7
          ? isDark
            ? 'text-red-500'
            : 'text-red-700'
          : isDark
          ? 'text-red-400'
          : 'text-red-600'
        : isDark
        ? 'text-green-400'
        : 'text-green-700';
      const bg = isDelirium ? (isDark ? 'bg-red-600' : 'bg-red-500') : isDark ? 'bg-green-600' : 'bg-green-500';

      return {
        pontuacao: score,
        isPositivo: isDelirium,
        texto: interpretacao,
        detalhe: `Score Total: ${score} de ${(configAtual as any).maxScore}.`,
        cor,
        bg,
        border: isDelirium ? 'border-red-500' : 'border-green-500',
        icone: isDelirium ? '🚨' : '✅',
        isCompleto: true,
      };
    }

    if (configAtual && configAtual.tipo === 'binary') {
      const c1 = respostas.c1 === true;
      const c2 = respostas.c2 === true;
      const c3 = respostas.c3 === true;
      const c4 = respostas.c4 === true;

      const isDeliriumPositivo = c1 && c2 && (c3 || c4);
      const cor = isDeliriumPositivo
        ? isDark
          ? 'text-red-500'
          : 'text-red-700'
        : isDark
        ? 'text-green-400'
        : 'text-green-700';
      const bg = isDeliriumPositivo ? (isDark ? 'bg-red-600' : 'bg-red-500') : isDark ? 'bg-green-600' : 'bg-green-500';

      return {
        pontuacao: null,
        isPositivo: isDeliriumPositivo,
        texto: isDeliriumPositivo ? 'Delirium POSITIVO' : 'Delirium NEGATIVO',
        detalhe: 'Critério: C1 E C2 E (C3 OU C4).',
        cor,
        bg,
        border: isDeliriumPositivo ? 'border-red-500' : 'border-green-500',
        icone: isDeliriumPositivo ? '🚨' : '✅',
        isCompleto: true,
      };
    }

    return null;
  }, [respostas, configAtual, pontuacaoTotal, itensRespondidos, totalItens, isDark]);

  const iniciarAvaliacao = (escala: string) => {
    setEscalaAtiva(escala);
    setRespostas({});
    setTela('form');
    setSaveStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResposta = (id: string, valor: any) => {
    setRespostas((prev) => ({ ...prev, [id]: valor }));

    const currentIdx = configAtual!.itens.findIndex((i) => i.id === id);
    if (currentIdx < configAtual!.itens.length - 1) {
      const nextId = configAtual!.itens[currentIdx + 1].id;
      setTimeout(() => {
        const el = document.getElementById(nextId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const finalizarAvaliacao = () => {
    if (resultadoAvaliacao?.isCompleto) {
      setTela('resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveAssessment = async () => {
    if (!configAtual || !resultadoAvaliacao?.isCompleto) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (onSaveScore) {
        onSaveScore({
          scaleName: configAtual.titulo,
          score: resultadoAvaliacao.pontuacao || (resultadoAvaliacao.isPositivo ? 1 : 0),
          interpretation: resultadoAvaliacao.texto,
        });
      }

      setSaveStatus('success');
      setTimeout(() => {
        setTela('intro');
        setEscalaAtiva(null);
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // ===== TELA 1: INTRO =====
  if (tela === 'intro') {
    return (
      <div
        className={`w-full max-w-2xl mx-auto p-4 sm:p-6 min-h-screen ${
          isDark ? 'bg-slate-950 text-gray-100' : 'bg-white text-gray-900'
        }`}
      >
        <header className="mb-8 text-center pt-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg border ${
              isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-100 border-blue-300'
            }`}
          >
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Calculadora de Delirium</h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Três escalas essenciais para UTI Pediátrica
          </p>
        </header>

        <div className={`p-6 rounded-2xl border shadow-xl mb-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h2 className={`text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b ${isDark ? 'text-gray-400 border-slate-800' : 'text-gray-600 border-slate-300'}`}>
            Escolha da Escala
          </h2>

          <div className="space-y-3">
            {/* CAPD */}
            <button
              onClick={() => iniciarAvaliacao('capd')}
              className={`w-full ${escalasConfig.capd.cores.bgBase} ${escalasConfig.capd.cores.hover} text-white font-bold py-3 px-4 sm:px-6 rounded-xl shadow-md transition text-left flex justify-between items-center group`}
            >
              <div>
                <span className="block text-sm sm:text-base">{escalasConfig.capd.titulo}</span>
                <span className="text-xs opacity-90">{escalasConfig.capd.idade}</span>
              </div>
              <span className="text-xs bg-indigo-900 px-2 py-1 rounded-full group-hover:scale-110 transition">Score 0–32</span>
            </button>

            {/* SOS-PD */}
            <button
              onClick={() => iniciarAvaliacao('sospd')}
              className={`w-full ${escalasConfig.sospd.cores.bgBase} ${escalasConfig.sospd.cores.hover} text-white font-bold py-3 px-4 sm:px-6 rounded-xl shadow-md transition text-left flex justify-between items-center group`}
            >
              <div>
                <span className="block text-sm sm:text-base">{escalasConfig.sospd.titulo}</span>
                <span className="text-xs opacity-90">{escalasConfig.sospd.idade}</span>
              </div>
              <span className="text-xs bg-red-900 px-2 py-1 rounded-full group-hover:scale-110 transition">Score 0–12</span>
            </button>

            {/* CAM-ICU */}
            <button
              onClick={() => setTela('sub_select')}
              className={`w-full ${escalasConfig.pCAMICU.cores.bgBase} ${escalasConfig.pCAMICU.cores.hover} text-white font-bold py-3 px-4 sm:px-6 rounded-xl shadow-md transition text-left flex justify-between items-center group`}
            >
              <span className="text-sm sm:text-base">CAM-ICU Pediátrico</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== TELA 1.5: SUB-SELECT CAM-ICU =====
  if (tela === 'sub_select') {
    return (
      <div
        className={`w-full max-w-2xl mx-auto p-4 sm:p-6 min-h-screen ${
          isDark ? 'bg-slate-950 text-gray-100' : 'bg-white text-gray-900'
        }`}
      >
        <div className="w-full text-left mb-6 pt-6">
          <button
            onClick={() => setTela('intro')}
            className={`flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            <BackArrowIcon />
            <span className="text-sm sm:text-base">Voltar ao Menu</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Seleção CAM-ICU</h1>
        <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          Escolha a escala correta para a faixa etária do paciente
        </p>

        <div className="space-y-3">
          {/* psCAM-ICU */}
          <button
            onClick={() => iniciarAvaliacao('psCAMICU')}
            className={`w-full ${escalasConfig.psCAMICU.cores.bgBase} ${escalasConfig.psCAMICU.cores.hover} text-white font-bold py-3 px-4 sm:px-6 rounded-xl shadow-md transition text-left`}
          >
            <span className="block text-sm sm:text-base">{escalasConfig.psCAMICU.titulo}</span>
            <span className="text-xs opacity-90">{escalasConfig.psCAMICU.idade}</span>
          </button>

          {/* pCAM-ICU */}
          <button
            onClick={() => iniciarAvaliacao('pCAMICU')}
            className={`w-full ${escalasConfig.pCAMICU.cores.bgBase} ${escalasConfig.pCAMICU.cores.hover} text-white font-bold py-3 px-4 sm:px-6 rounded-xl shadow-md transition text-left`}
          >
            <span className="block text-sm sm:text-base">{escalasConfig.pCAMICU.titulo}</span>
            <span className="text-xs opacity-90">{escalasConfig.pCAMICU.idade}</span>
          </button>
        </div>
      </div>
    );
  }

  // ===== TELA 2: FORM =====
  if (tela === 'form' && configAtual) {
    const scoreDisplay = configAtual.tipo === 'score' ? `${pontuacaoTotal} / ${(configAtual as any).maxScore}` : 'Binário';

    return (
      <div
        className={`w-full max-w-2xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col ${
          isDark ? 'bg-slate-950 text-gray-100' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header Fixo */}
        <div
          className={`sticky top-0 z-10 max-w-2xl mx-auto w-full pb-4 pt-2 backdrop-blur-sm border-b ${
            isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'
          } mb-4`}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setTela('intro')}
              className={`p-2 -ml-2 rounded-full transition ${isDark ? 'text-gray-400 hover:text-white hover:bg-slate-800' : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'}`}
            >
              <BackArrowIcon />
            </button>
            <div className="text-center">
              <span className={`text-xs sm:text-sm font-bold block ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {configAtual.titulo}
              </span>
              <div className={`text-xs font-bold mt-1 ${resultadoAvaliacao?.cor}`}>{resultadoAvaliacao?.texto}</div>
            </div>
            <div className="w-8" />
          </div>

          {/* Barra de Progresso */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div className={`${corClasses.bgProgress} h-full transition-all duration-500`} style={{ width: `${progresso}%` }} />
          </div>
          <div className={`flex justify-between text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            <span>
              {itensRespondidos} de {configAtual.itens.length}
            </span>
            <span>Pontos: {scoreDisplay}</span>
          </div>
        </div>

        {/* Perguntas */}
        <div className="flex-1 space-y-4">
          {configAtual.itens.map((item) => (
            <DeliriumQuestionCard
              key={item.id}
              item={item}
              valor={respostas[item.id]}
              onChange={(val) => handleResposta(item.id, val)}
              opcoes={configAtual.opcoes}
              isDark={isDark}
              tipo={configAtual.tipo}
            />
          ))}

          <button
            onClick={finalizarAvaliacao}
            disabled={!resultadoAvaliacao?.isCompleto}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all mt-6 ${
              resultadoAvaliacao?.isCompleto
                ? `${corClasses.bg} ${corClasses.hover} text-white hover:scale-105 active:scale-95`
                : isDark
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-300 text-slate-600 cursor-not-allowed'
            }`}
          >
            {resultadoAvaliacao?.isCompleto ? 'Finalizar e Ver Resultado' : `Responda tudo (${itensRespondidos}/${configAtual.itens.length})`}
          </button>
        </div>
      </div>
    );
  }

  // ===== TELA 3: RESULTADO =====
  if (tela === 'resultado' && configAtual) {
    return (
      <div
        className={`w-full max-w-2xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col items-center pt-6 ${
          isDark ? 'bg-slate-950 text-gray-100' : 'bg-white text-gray-900'
        }`}
      >
        {/* Botão Voltar */}
        <div className="w-full text-left mb-6">
          <button
            onClick={() => setTela('intro')}
            className={`flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            <BackArrowIcon />
            <span className="text-sm sm:text-base">Voltar ao Menu</span>
          </button>
        </div>

        {/* Círculo de Score */}
        <div className="relative w-48 sm:w-56 h-48 sm:h-56 flex items-center justify-center mb-8">
          <div className={`absolute inset-0 rounded-full opacity-20 ${resultadoAvaliacao!.bg} blur-xl animate-pulse`}></div>
          <div
            className={`relative w-40 sm:w-48 h-40 sm:h-48 rounded-full border-4 ${resultadoAvaliacao!.border} flex flex-col items-center justify-center shadow-2xl ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <span className="text-5xl sm:text-6xl font-black text-white">
              {configAtual.tipo === 'score' ? resultadoAvaliacao?.pontuacao : resultadoAvaliacao?.icone}
            </span>
            <span className={`text-xs uppercase tracking-widest mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {configAtual.tipo === 'score' ? `de ${(configAtual as any).maxScore}` : 'Resultado'}
            </span>
          </div>
          <div
            className={`absolute -bottom-4 px-4 py-1 rounded-full border shadow-lg text-sm font-bold ${
              isDark ? 'bg-slate-800 border-slate-700 text-gray-100' : 'bg-white border-slate-300 text-gray-900'
            }`}
          >
            {configAtual.titulo}
          </div>
        </div>

        {/* Título e Detalhe */}
        <div className="text-center space-y-2 mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold ${resultadoAvaliacao?.cor}`}>{resultadoAvaliacao?.texto}</h2>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{resultadoAvaliacao?.detalhe}</p>
        </div>

        {/* Interpretação */}
        <div
          className={`w-full rounded-xl p-5 border shadow-md mb-8 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <h3 className={`font-bold pb-3 border-b ${isDark ? 'text-gray-100 border-slate-800' : 'text-gray-900 border-slate-300'}`}>
            Interpretação
          </h3>
          <p className={`text-sm mt-3 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            {configAtual.titulo === 'CAPD' && `Critério: CAPD ≥ 9 indica Delirium Provável.`}
            {configAtual.titulo === 'SOS-PD' && `Critério: SOS-PD ≥ 4 sugere Delirium ou Abstinência.`}
            {(configAtual.titulo === 'pCAM-ICU' || configAtual.titulo === 'psCAM-ICU') &&
              `Critério: C1 E C2 E (C3 OU C4). Resultado: ${resultadoAvaliacao?.isPositivo ? 'Preenchido' : 'Não preenchido'}.`}
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="w-full space-y-3">
          <button
            onClick={saveAssessment}
            disabled={isSaving || saveStatus === 'success'}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center ${
              isSaving
                ? isDark
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-400 text-slate-600 cursor-not-allowed'
                : saveStatus === 'success'
                ? `${isDark ? 'bg-green-700' : 'bg-green-600'} text-white cursor-not-allowed`
                : `${corClasses.bg} ${corClasses.hover} text-white hover:scale-105`
            }`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Salvando...
              </span>
            ) : saveStatus === 'success' ? (
              <span className="flex items-center">
                <CheckCircleIcon className="mr-2" /> Salvo com Sucesso!
              </span>
            ) : (
              <span className="flex items-center">
                <SaveIcon className="mr-2" /> Salvar Avaliação
              </span>
            )}
          </button>

          {saveStatus === 'error' && (
            <p className={`text-sm text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              Erro ao salvar. Tente novamente.
            </p>
          )}

          <button
            onClick={() => setTela('intro')}
            className={`w-full py-4 rounded-xl font-bold transition-colors border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-gray-900 border-slate-300'
            }`}
          >
            Nova Avaliação
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default DeliriumMasterScale;
