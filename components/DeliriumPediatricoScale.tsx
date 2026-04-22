import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// ==========================================
// 🧠 CONFIGURAÇÃO UNIFICADA DAS ESCALAS
// ==========================================

// Configurações Comuns (CAPD e SOS-PD)
const scoreOptions0_2 = [
  { texto: '0 – Ausente', valor: 0 },
  { texto: '1 – Leve/Intermitente', valor: 1 },
  { texto: '2 – Moderado/Contínuo', valor: 2 },
];
const scoreOptions0_4 = [
  { texto: '0 – Nunca / Normal', valor: 0 },
  { texto: '1 – Raramente', valor: 1 },
  { texto: '2 – Ocasionalmente', valor: 2 },
  { texto: '3 – Frequentemente', valor: 3 },
  { texto: '4 – Sempre / Muito evidente', valor: 4 },
];
// Configurações Binárias (pCAM-ICU/psCAM-ICU)
const binaryOptions = [
    { texto: 'Anormal / Presente', valor: true, cor: 'text-red-400' },
    { texto: 'Normal / Ausente', valor: false, cor: 'text-green-400' },
];

const escalasConfig = {
  // --- CAPD ---
  capd: {
    titulo: 'CAPD',
    nomeCompleto: 'Cornell Assessment of Pediatric Delirium',
    idade: '0 meses a 21 anos',
    tipo: 'score',
    colecao: 'capd_assessments',
    corte: 9,
    opcoes: scoreOptions0_4,
    itens: [
      { id: 'c1', label: '1. Diminuição da atenção', desc: 'Não presta atenção, não acompanha estímulos.' },
      { id: 'c2', label: '2. Retraimento', desc: 'Redução da interação habitual.' },
      { id: 'c3', label: '3. Lentidão nas respostas', desc: 'Responde menos ou mais devagar que o habitual.' },
      { id: 'c4', label: '4. Variabilidade do nível de consciência', desc: 'Oscila entre alerta, sonolento, agitado.' },
      { id: 'c5', label: '5. Desorientação', desc: 'Não reconhece ambiente/pessoas.' },
      { id: 'c6', label: '6. Movimentos incongruentes', desc: 'Agitação, tremores, puxar dispositivos.' },
      { id: 'c7', label: '7. Inconsistência comportamental', desc: 'Comportamentos imprevisíveis.' },
      { id: 'c8', label: '8. Alteração da percepção', desc: 'Alucinações / medos intensos.' },
    ],
  },
  // --- SOS-PD ---
  sospd: {
    titulo: 'SOS-PD',
    nomeCompleto: 'Sophia Observation Withdrawal/Delirium',
    idade: 'UTI neonatal e pediátrica',
    tipo: 'score',
    colecao: 'sos_pd_assessments',
    corte: 4,
    opcoes: scoreOptions0_2,
    itens: [
      { id: 'c1', label: '1. Agitação', desc: 'Aumento de movimento, inquietação.' },
      { id: 'c2', label: '2. Inconsolabilidade', desc: 'Choro, irritabilidade difícil de acalmar.' },
      { id: 'c3', label: '3. Alteração do sono', desc: 'Ciclos inadequados, despertares frequentes.' },
      { id: 'c4', label: '4. Alteração do contato visual', desc: 'Evita olhar ou olhar fixo desorganizado.' },
      { id: 'c5', label: '5. Tremores / Rigidez', desc: 'Sinais neuromotores.' },
      { id: 'c6', label: '6. Autonômicos', desc: 'Taquicardia, sudorese, febre.' },
    ],
  },
  // --- pCAM/psCAM-ICU (Binárias) ---
  psCAMICU: {
    titulo: 'psCAM-ICU',
    nomeCompleto: 'Preschool CAM-ICU',
    idade: '6 meses a 5 anos',
    tipo: 'binary',
    colecao: 'cam_icu_assessments',
    opcoes: binaryOptions,
    itens: [
      { id: 'c1', label: '1. Alteração aguda ou curso flutuante', desc: 'Mudança súbita no comportamento ou consciência.' },
      { id: 'c2', label: '2. Déficit de atenção', desc: 'Falha no teste de estímulos visuais.' },
      { id: 'c3', label: '3. Nível de consciência alterado', desc: 'Não está em estado "alerta" (sonolência, estupor, etc.).' },
      { id: 'c4', label: '4. Pensamento desorganizado', desc: 'Respostas incoerentes ou comportamento incompatível.' },
    ],
  },
  pCAMICU: {
    titulo: 'pCAM-ICU',
    nomeCompleto: 'Pediatric CAM-ICU',
    idade: '≥ 5 anos (cognitivamente aptos)',
    tipo: 'binary',
    colecao: 'cam_icu_assessments',
    opcoes: binaryOptions,
    itens: [
      { id: 'c1', label: '1. Alteração aguda ou curso flutuante', desc: 'Mudança no comportamento ou consciência nas últimas 24 horas.' },
      { id: 'c2', label: '2. Déficit de atenção', desc: 'Falha no Teste ABC ou contagem de números.' },
      { id: 'c3', label: '3. Nível de consciência alterado', desc: 'Não está "alerta" (sonolento, letárgico, hiperalerta, etc.).' },
      { id: 'c4', label: '4. Pensamento desorganizado', desc: 'Falha em perguntas simples (Ex: "A lua está perto de nós?").' },
    ],
  },
};

// Helper para garantir que o Tailwind renderize as classes de cor corretamente
const getScaleColorClasses = (scaleTitle: string) => {
  const primaryColorClasses = {
    bg: 'bg-indigo-600',
    hover: 'hover:bg-indigo-500',
    text: 'text-indigo-300',
    bgBase: 'bg-indigo-700',
    hoverBase: 'hover:bg-indigo-600',
    bgProgress: 'bg-indigo-500',
  };

  const secondaryColors: { [key: string]: typeof primaryColorClasses } = {
    CAPD: primaryColorClasses,
    'SOS-PD': { 
      ...primaryColorClasses,
      bgBase: 'bg-indigo-700', 
      hoverBase: 'hover:bg-indigo-600',
      bgProgress: 'bg-red-500',
      text: 'text-red-300',
    },
    'psCAM-ICU': {
      ...primaryColorClasses,
      bgBase: 'bg-indigo-700',
      hoverBase: 'hover:bg-indigo-600',
      bgProgress: 'bg-blue-500',
      text: 'text-blue-300',
    },
    'pCAM-ICU': {
      ...primaryColorClasses,
      bgBase: 'bg-indigo-700',
      hoverBase: 'hover:bg-indigo-600',
      bgProgress: 'bg-blue-500',
      text: 'text-blue-300',
    },
  };
  
  return secondaryColors[scaleTitle] || primaryColorClasses; 
};

// Helper para garantir que os botões do menu sejam todos azuis
const getMenuButtonClasses = () => ({
    bg: 'bg-indigo-600',
    hover: 'hover:bg-indigo-500',
    bgBase: 'bg-indigo-700',
    hoverBase: 'hover:bg-indigo-600',
});

// ==========================================
// ⚛️ COMPONENTES VISUAIS (UI)
// ==========================================

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const SaveIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-4 10V4m0 0l-3 3m3-3l3 3"></path>
    </svg>
);

// Componente Card de Pergunta unificado
interface QuestionCardProps {
  item: { id: string; label: string; desc: string };
  valor: any;
  onChange: (val: any) => void;
  opcoes: { texto: string; valor: any; cor?: string }[];
  tipo: 'score' | 'binary';
}

const QuestionCard: React.FC<QuestionCardProps> = ({ item, valor, onChange, opcoes, tipo }) => {
  const isSelected = valor !== undefined && valor !== null && valor !== '';

  return (
    <div 
      id={item.id} 
      className={`p-4 rounded-xl shadow-md mb-3 transition-all duration-300
      ${isSelected 
        ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-600'
        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'}
    `}>
      <div className="mb-4 flex justify-between items-start">
        <div>
          <label className="block text-base font-bold text-slate-800 dark:text-gray-100">{item.label}</label>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{item.desc}</p>
        </div>
        {isSelected && <CheckIcon />}
      </div>
      
      <div className="relative">
        <select
          value={valor === undefined || valor === null ? '' : (tipo === 'binary' ? (valor ? 'true' : 'false') : valor)}
          onChange={(e) => onChange(tipo === 'binary' ? e.target.value === 'true' : parseInt(e.target.value))}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-gray-100 p-3 pr-10 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        >
          <option value="" disabled>
            Selecione a resposta...
          </option>
          {opcoes.map((opt) => (
            <option 
              key={opt.texto} 
              value={tipo === 'binary' ? (opt.valor ? 'true' : 'false') : opt.valor}
              className={opt.cor}
            >
              {opt.texto} {tipo === 'score' && `(${opt.valor} pts)`}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 APLICAÇÃO PRINCIPAL
// ==========================================

interface Assessment {
  id: string;
  escala: string;
  resultado: string;
  pontuacao: number | null;
  isPositivo: boolean;
  timestamp?: { seconds: number };
  mainScale?: string;
}

interface DeliriumScaleProps {
  onSaveScore?: (data: { scaleName: string; score: number; interpretation: string }) => void;
}

export default function DeliriumPediatricoScale({ onSaveScore }: DeliriumScaleProps) {
  const [tela, setTela] = useState('intro'); // intro, form, camicu_select, resultado
  const [escalaAtiva, setEscalaAtiva] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [historico, setHistorico] = useState<any[]>([]);
  
  // --- Estados ---
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null); 
  
  // Configuração da escala atual
  const configAtual = escalaAtiva ? (escalasConfig as any)[escalaAtiva] : null;
  const corClasses = configAtual ? getScaleColorClasses(configAtual.titulo) : getScaleColorClasses('CAPD');

  // --- Lógica de Inicialização e Autenticação do Supabase ---
  useEffect(() => {
    // Component doesn't need to handle auth - parent component handles it
  }, []);

  // --- Lógica de Busca do Histórico das Escalas ---
  useEffect(() => {
    // Component doesn't manage history - parent handles it
  }, []);


  // --- Lógica de Interpretação Unificada ---
  const resultadoAvaliacao = useMemo(() => {
    if (!configAtual) return null;

    const totalItens = configAtual.itens.length;
    const itensRespondidos = Object.keys(respostas).filter(key => respostas[key] !== undefined && respostas[key] !== null).length;
    
    if (itensRespondidos < totalItens) {
      return {
          texto: 'Avaliação em Andamento',
          detalhe: `Responda a todos os ${totalItens} itens.`,
          cor: 'text-yellow-400',
          icone: '⏳',
          isCompleto: false,
          pontuacao: null as any,
          isPositivo: false,
          bg: '',
          border: ''
      };
    }

    if (configAtual.tipo === 'score') {
      const pontuacao = Object.values(respostas).reduce((acc: number, val: any) => acc + (val || 0), 0);
      const isPositivo = pontuacao >= configAtual.corte;
      
      const resultado = {
        pontuacao: pontuacao,
        isPositivo: isPositivo,
        texto: isPositivo ? `${configAtual.titulo} POSITIVO` : `${configAtual.titulo} NEGATIVO`,
        detalhe: isPositivo ? `Pontuação ≥ ${configAtual.corte} sugere ${configAtual.titulo}.` : `Pontuação < ${configAtual.corte}.`,
        cor: isPositivo ? 'text-red-400' : 'text-green-400', 
        bg: isPositivo ? 'bg-red-500' : 'bg-green-500', 
        border: isPositivo ? 'border-red-500' : 'border-green-500',
        icone: isPositivo ? '🚨' : '✅',
        isCompleto: true
      };
      return resultado;
    }
    
    // Lógica Binária (pCAM-ICU / psCAM-ICU)
    if (configAtual.tipo === 'binary') {
        const c1 = respostas.c1 === true;
        const c2 = respostas.c2 === true;
        const c3 = respostas.c3 === true;
        const c4 = respostas.c4 === true;

        const isDeliriumPositivo = c1 && c2 && (c3 || c4);

        const resultado = {
            pontuacao: null,
            isPositivo: isDeliriumPositivo,
            texto: isDeliriumPositivo ? 'Delirium POSITIVO' : 'Delirium NEGATIVO',
            detalhe: isDeliriumPositivo ? 'C1 E C2 E (C3 OU C4) preenchidos.' : 'Critérios de Delirium não preenchidos simultaneamente.',
            cor: isDeliriumPositivo ? 'text-red-400' : 'text-green-400',
            bg: isDeliriumPositivo ? 'bg-red-500' : 'bg-green-500', 
            border: isDeliriumPositivo ? 'border-red-500' : 'border-green-500',
            icone: isDeliriumPositivo ? '🚨' : '✅',
            isCompleto: true
        };
        return resultado;
    }

    return null;

  }, [respostas, configAtual]);

  const itensRespondidos = configAtual ? Object.keys(respostas).filter(key => respostas[key] !== undefined && respostas[key] !== null).length : 0;
  const totalItens = configAtual ? configAtual.itens.length : 0;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;


  // --- Handlers de Ação ---
  const iniciarAvaliacao = (escala: string) => {
    setEscalaAtiva(escala);
    setRespostas({});
    setTela('form');
    setSaveStatus(null); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleResposta = (id: string, valor: any) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));

    const currentItemIndex = configAtual.itens.findIndex((item: any) => item.id === id);
    const nextItemIndex = currentItemIndex + 1;
    const HEADER_OFFSET = 100; 

    if (nextItemIndex < configAtual.itens.length) {
      const nextItemId = configAtual.itens[nextItemIndex].id;
      
      setTimeout(() => {
        const nextElement = document.getElementById(nextItemId);
        if (nextElement) {
          const y = nextElement.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100); 
    }
  };

  const finalizarAvaliacao = () => {
    if (resultadoAvaliacao && resultadoAvaliacao.isCompleto) {
        setTela('resultado');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const saveAssessment = async () => {
    if (isSaving || !configAtual || !resultadoAvaliacao?.isCompleto) {
        setSaveStatus('error');
        return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
        if (onSaveScore) {
          onSaveScore({
            scaleName: configAtual.titulo,
            score: resultadoAvaliacao?.pontuacao || 0,
            interpretation: resultadoAvaliacao.texto
          });
          setSaveStatus('success');
        }
    } catch (error) {
        console.error("Erro ao salvar avaliação:", error);
        setSaveStatus('error');
    } finally {
        setIsSaving(false);
    }
  };


  // --- Telas ---

  // 1. Menu Principal (INTRO)
  if (tela === 'intro') {
    const menuButtonColors = getMenuButtonClasses();
    const capdLabelColor = 'bg-indigo-800';
    const sospdLabelColor = 'bg-indigo-800';
    
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-gray-100 font-sans">
        <header className="mb-8 text-center pt-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl mb-4 shadow-lg border border-blue-200 dark:border-blue-700">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Avaliação de Delirium Pediátrico</h1>
          <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Selecione a Escala Adequada</p>
        </header>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl mb-6">
          <h2 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-4">Escolha Rápida</h2>
          
          <button 
            onClick={() => iniciarAvaliacao('capd')}
            className={`w-full ${menuButtonColors.bgBase} ${menuButtonColors.hoverBase} text-white font-bold py-3 px-6 rounded-xl shadow-md transition mb-3 text-left flex justify-between items-center`}
          >
            <span>{(escalasConfig as any).capd.titulo} ({(escalasConfig as any).capd.idade})</span>
            <span className={`text-xs ${capdLabelColor} px-2 py-1 rounded-full`}>Score ≥ 9</span>
          </button>

          <button 
            onClick={() => iniciarAvaliacao('sospd')}
            className={`w-full ${menuButtonColors.bgBase} ${menuButtonColors.hoverBase} text-white font-bold py-3 px-6 rounded-xl shadow-md transition mb-3 text-left flex justify-between items-center`}
          >
            <span>{(escalasConfig as any).sospd.titulo} ({(escalasConfig as any).sospd.idade})</span>
            <span className={`text-xs ${sospdLabelColor} px-2 py-1 rounded-full`}>Score ≥ 4</span>
          </button>

          <button 
            onClick={() => setTela('camicu_select')}
            className={`w-full ${menuButtonColors.bgBase} ${menuButtonColors.hoverBase} text-white font-bold py-3 px-6 rounded-xl shadow-md transition text-left flex justify-between items-center`}
          >
            <span>pCAM-ICU / psCAM-ICU</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        
        {historico.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-500 dark:text-gray-500 uppercase mb-3 px-2">Histórico Consolidado ({historico.length})</h3>
            <div className="space-y-2">
              {historico.map((res) => (
                <div key={res.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700 dark:text-gray-300">{res.escala}</span>
                  <div className="flex items-center">
                    <span className={`font-bold mr-2 ${res.isPositivo ? 'text-red-400' : 'text-green-400'}`}>
                        {res.resultado}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-900 dark:text-white font-mono">
                         {res.pontuacao !== null ? `${res.pontuacao} pts` : 'BINÁRIO'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // 1.5. Sub-seleção CAM-ICU
  if (tela === 'camicu_select') {
    const camicuColors = getScaleColorClasses('pCAM-ICU');
    const menuButtonColors = getMenuButtonClasses();
    return (
        <div className="w-full max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-gray-100 font-sans">
            <div className="w-full text-left mb-6 pt-6">
                <button onClick={() => setTela('intro')} className="flex items-center text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <BackIcon />
                    <span className="ml-2">Voltar ao Menu Principal</span>
                </button>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Seleção CAM-ICU</h1>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Escolha a escala correta de acordo com a faixa etária e estado cognitivo do paciente.</p>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl mb-6">
                <h2 className={`text-base font-bold ${camicuColors.text}`}>psCAM-ICU</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-3">{(escalasConfig as any).psCAMICU.idade}</p>
                <button 
                    onClick={() => iniciarAvaliacao('psCAMICU')}
                    className={`w-full ${menuButtonColors.bg} ${menuButtonColors.hover} text-white font-bold py-3 rounded-xl transition`}
                >
                    Iniciar psCAM-ICU
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl mb-6">
                <h2 className={`text-base font-bold ${camicuColors.text}`}>pCAM-ICU</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-3">{(escalasConfig as any).pCAMICU.idade}</p>
                <button 
                    onClick={() => iniciarAvaliacao('pCAMICU')}
                    className={`w-full ${menuButtonColors.bg} ${menuButtonColors.hover} text-white font-bold py-3 rounded-xl transition`}
                >
                    Iniciar pCAM-ICU
                </button>
            </div>
        </div>
    );
  }

  // 2. Formulário de Perguntas (FORM)
  if (tela === 'form' && configAtual) {
    const corClasses = getScaleColorClasses(configAtual.titulo);

    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-gray-100 flex flex-col">
        <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm pb-4 pt-2 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setTela('intro')} className="p-2 -ml-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <BackIcon />
            </button>
            <div className="text-center">
                <span className={`text-sm font-bold ${corClasses.text}`}>{configAtual.titulo} ({configAtual.idade})</span>
                <div className={`text-xs font-bold mt-1 ${resultadoAvaliacao?.cor}`}>{resultadoAvaliacao?.texto}</div>
            </div>
            <div className="w-8" /> 
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`${corClasses.bgProgress} h-full transition-all duration-500 ease-out`}
              style={{ width: `${progresso}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-gray-500 mt-1">
            <span>{itensRespondidos} de {totalItens} respondidos</span>
            {configAtual.tipo === 'score' && <span>Total: {resultadoAvaliacao?.pontuacao || 0} pts</span>}
          </div>
        </div>

        <div className="flex-1 space-y-4 pb-24">
          {configAtual.itens.map((item: any) => (
            <QuestionCard 
              key={item.id}
              item={item}
              valor={respostas[item.id]}
              onChange={(val) => handleResposta(item.id, val)} 
              opcoes={configAtual.opcoes}
              tipo={configAtual.tipo}
            />
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-slate-50 via-slate-50 dark:from-slate-950 dark:via-slate-950 to-transparent">
          <div className="max-w-md mx-auto">
            <button
              onClick={finalizarAvaliacao}
              disabled={!resultadoAvaliacao?.isCompleto}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all
                ${resultadoAvaliacao?.isCompleto
                  ? `${corClasses.bg} ${corClasses.hover} text-white transform hover:scale-105` 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'}
              `}
            >
              {resultadoAvaliacao?.isCompleto ? 'Finalizar e Ver Diagnóstico' : `Responda tudo (${itensRespondidos}/${totalItens})`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tela de Resultado (RESULTADO)
  if (tela === 'resultado' && configAtual) {
    const corClasses = getScaleColorClasses(configAtual.titulo);

    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-gray-100 font-sans flex flex-col items-center pt-10">
        <div className="w-full text-left mb-6">
          <button onClick={() => setTela('intro')} className="flex items-center text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <BackIcon />
            <span className="ml-2">Voltar ao Menu Principal</span>
          </button>
        </div>

        <div className={`relative w-48 h-48 flex items-center justify-center mb-8`}>
          <div className={`absolute inset-0 rounded-full opacity-20 ${resultadoAvaliacao!.bg} blur-xl animate-pulse`}></div>
          <div className={`relative w-40 h-40 bg-white dark:bg-slate-900 rounded-full border-4 ${resultadoAvaliacao!.border} flex flex-col items-center justify-center shadow-2xl`}>
            <span className="text-5xl font-black text-slate-900 dark:text-white">{resultadoAvaliacao!.icone}</span>
            <span className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest mt-1">{configAtual.titulo}</span>
          </div>
          <div className="absolute -bottom-4 bg-white dark:bg-slate-800 px-4 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg text-lg">
            Diagnóstico
          </div>
        </div>

        <div className="text-center space-y-2 mb-8">
          <h2 className={`text-3xl font-bold ${resultadoAvaliacao!.cor}`}>{resultadoAvaliacao!.texto}</h2>
          <p className="text-slate-500 dark:text-gray-400 max-w-xs mx-auto">{resultadoAvaliacao!.detalhe}</p>
        </div>

        <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-700 dark:text-gray-300 border-b border-slate-200 dark:border-slate-800 pb-2">Detalhes da Avaliação</h3>
            {configAtual.tipo === 'score' ? (
                <p className="text-sm text-slate-500 dark:text-gray-400">
                    Pontuação Total: <strong className="text-slate-900 dark:text-white">{resultadoAvaliacao!.pontuacao}</strong> (Corte: {configAtual.corte})
                </p>
            ) : (
                <p className="text-sm text-slate-500 dark:text-gray-400">
                    Critério: C1 E C2 E (C3 OU C4). Resultado: <strong className="text-slate-900 dark:text-white">{resultadoAvaliacao!.isPositivo ? 'Preenchido' : 'Não Preenchido'}</strong>
                </p>
            )}
        </div>

        <div className="w-full space-y-4 mt-8">
            <button 
                onClick={saveAssessment}
                disabled={isSaving || saveStatus === 'success'}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center
                ${isSaving
                    ? 'bg-slate-300 dark:bg-slate-600 text-slate-400 cursor-not-allowed'
                    : saveStatus === 'success'
                      ? 'bg-green-700 text-white cursor-not-allowed'
                      : `${corClasses.bg} ${corClasses.hover} text-white transform hover:scale-[1.02]`}
                `}
            >
                {isSaving ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Salvando...
                    </span>
                ) : saveStatus === 'success' ? (
                    <span className="flex items-center text-lg">
                        <CheckIcon /> Avaliação Salva com Sucesso!
                    </span>
                ) : (
                    <span className="flex items-center text-lg">
                        <SaveIcon /> Salvar Avaliação
                    </span>
                )}
            </button>
            
            {saveStatus === 'error' && (
                <p className="text-sm text-center text-red-600 dark:text-red-400">
                    Erro ao salvar. Verifique a conexão ou tente novamente.
                </p>
            )}
        </div>

        <button 
          onClick={() => iniciarAvaliacao(escalaAtiva!)}
          className="mt-8 w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-4 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
        >
          Refazer Avaliação
        </button>
      </div>
    );
  }

  return null;
}
