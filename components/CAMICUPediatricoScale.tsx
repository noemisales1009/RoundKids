import React, { useState, useMemo, useContext } from 'react';
import { ThemeContext } from '../contexts';
import { BackArrowIcon, CheckIcon } from './icons';

// ==========================================
// 🧠 CONFIGURAÇÃO DAS ESCALAS CAM-ICU
// Baseado no documento fornecido pelo usuário
// ==========================================

const configsCAMICU = {
  psCAMICU: {
    titulo: 'psCAM-ICU',
    idade: '6 meses a 5 anos',
    itens: [
      { 
        id: 'c1', 
        label: '1. Alteração aguda ou curso flutuante', 
        desc: 'Mudança súbita no comportamento, atenção ou nível de consciência nas últimas 24 horas.',
        opcoes: [
          { texto: 'Presente', valor: true, cor: 'text-red-400' },
          { texto: 'Ausente', valor: false, cor: 'text-green-400' },
        ],
      },
      { 
        id: 'c2', 
        label: '2. Déficit de atenção', 
        desc: 'Teste de atenção com estímulos visuais (cartões). A criança deve manter a atenção por menos de 2 de 3 tentativas (Anormal).',
        opcoes: [
          { texto: 'Anormal', valor: true, cor: 'text-red-400' },
          { texto: 'Normal', valor: false, cor: 'text-green-400' },
        ],
      },
      { 
        id: 'c3', 
        label: '3. Nível de consciência alterado', 
        desc: 'Não está no estado "alerta" (sonolento, agitado, letárgico, estupor).',
        opcoes: [
          { texto: 'Anormal', valor: true, cor: 'text-red-400' },
          { texto: 'Normal', valor: false, cor: 'text-green-400' },
        ],
      },
      { 
        id: 'c4', 
        label: '4. Pensamento desorganizado', 
        desc: 'Respostas incoerentes, não direcionadas ou com comportamento incompatível à situação.',
        opcoes: [
          { texto: 'Anormal', valor: true, cor: 'text-red-400' },
          { texto: 'Normal', valor: false, cor: 'text-green-400' },
        ],
      },
    ],
  },
  pCAMICU: {
    titulo: 'pCAM-ICU',
    idade: '≥ 5 anos (cognitivamente aptos)',
    itens: [
      { 
        id: 'c1', 
        label: '1. Alteração aguda ou curso flutuante', 
        desc: 'Mudança no comportamento ou consciência nas últimas 24 horas.',
        opcoes: [
          { texto: 'Presente', valor: true, cor: 'text-red-400' },
          { texto: 'Ausente', valor: false, cor: 'text-green-400' },
        ],
      },
      { 
        id: 'c2', 
        label: '2. Déficit de atenção', 
        desc: 'Teste ABC ou contagem de números. A criança deve identificar as letras ou números-alvo corretamente (Anormal é falha).',
        opcoes: [
          { texto: 'Anormal', valor: true, cor: 'text-red-400' },
          { texto: 'Normal', valor: false, cor: 'text-green-400' },
        ],
      },
      { 
        id: 'c3', 
        label: '3. Nível de consciência alterado', 
        desc: 'Não está "alerta" (sonolento, letárgico, estupor, hiperalerta).',
        opcoes: [
          { texto: 'Anormal', valor: true, cor: 'text-red-400' },
          { texto: 'Normal', valor: false, cor: 'text-green-400' },
        ],
      },
      { 
        id: 'c4', 
        label: '4. Pensamento desorganizado', 
        desc: 'Perguntas simples: "Pode levantar dois dedos?", "A lua está perto de nós?" (Respostas erradas ou incoerentes indicam Anormal).',
        opcoes: [
          { texto: 'Anormal', valor: true, cor: 'text-red-400' },
          { texto: 'Normal', valor: false, cor: 'text-green-400' },
        ],
      },
    ],
  },
};

// ==========================================
// ⚛️ COMPONENTES VISUAIS (UI)
// ==========================================

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// Card de Pergunta com Dropdown e Check-in Visual
const QuestionCard = ({ item, valor, onChange, theme }) => {
  const isSelected = valor !== undefined && valor !== null && valor !== '';

  const bgColor = theme === 'light' ? 'bg-gray-50' : 'bg-slate-800';
  const borderColor = isSelected 
    ? theme === 'light' ? 'border-blue-400' : 'border-indigo-600'
    : theme === 'light' ? 'border-gray-300' : 'border-slate-700';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-gray-100';
  const descColor = theme === 'light' ? 'text-slate-600' : 'text-gray-400';
  const selectBg = theme === 'light' ? 'bg-white' : 'bg-slate-900';
  const selectBorder = theme === 'light' ? 'border-gray-300' : 'border-slate-700';
  const selectText = theme === 'light' ? 'text-slate-900' : 'text-gray-100';
  const hoverBg = theme === 'light' ? 'hover:border-gray-400' : 'hover:border-slate-600';

  return (
    <div 
      id={item.id}
      className={`p-4 rounded-xl shadow-md mb-3 transition-all duration-300 border
      ${isSelected 
        ? `${bgColor} ${borderColor}` 
        : `${bgColor} ${borderColor} ${hoverBg}`}
    `}>
      <div className="mb-4 flex justify-between items-start">
        <div>
          <label className={`block text-base font-bold ${textColor}`}>{item.label}</label>
          <p className={`text-sm ${descColor} mt-1`}>{item.desc}</p>
        </div>
        {isSelected && <CheckIcon className="w-6 h-6 text-green-400 flex-shrink-0" />}
      </div>
      
      <div className="relative">
        <select
          value={valor === undefined || valor === null ? '' : valor ? 'true' : 'false'}
          onChange={(e) => onChange(e.target.value === 'true')}
          className={`w-full ${selectBg} border ${selectBorder} ${selectText} p-3 pr-10 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
        >
          <option value="" disabled>
            Selecione o Resultado...
          </option>
          {item.opcoes.map((opt) => (
            <option key={opt.texto} value={opt.valor ? 'true' : 'false'}>
              {opt.texto}
            </option>
          ))}
        </select>
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 APLICAÇÃO PRINCIPAL
// ==========================================

interface CAMICUScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string }) => void;
}

export default function CAMICUPediatricoScale({ onSaveScore }: CAMICUScaleProps) {
  const { theme } = useContext(ThemeContext) || { theme: 'dark' };
  
  const [tela, setTela] = useState('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<'psCAMICU' | 'pCAMICU' | null>(null);
  const [respostas, setRespostas] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const configAtual = escalaAtiva ? configsCAMICU[escalaAtiva] : null;

  // Cores dinâmicas baseadas no tema
  const bgDinamic = theme === 'light' ? 'bg-gray-50' : 'bg-slate-950';
  const bgFormDinamic = theme === 'light' ? 'bg-white' : 'bg-slate-800';
  const textDinamic = theme === 'light' ? 'text-slate-900' : 'text-gray-100';
  const borderDinamic = theme === 'light' ? 'border-gray-200' : 'border-slate-700';
  const descDinamic = theme === 'light' ? 'text-slate-600' : 'text-gray-400';

  // Lógica de Diagnóstico (C1 E C2 E (C3 OU C4))
  const diagnostico = useMemo(() => {
    if (!configAtual) return { texto: 'Aguardando Avaliação', cor: 'text-gray-400' };

    const c1 = respostas.c1 === true;
    const c2 = respostas.c2 === true;
    const c3 = respostas.c3 === true;
    const c4 = respostas.c4 === true;

    const isDeliriumPositivo = c1 && c2 && (c3 || c4);

    if (isDeliriumPositivo) {
      return { 
        texto: 'Delirium POSITIVO', 
        detalhe: 'Critérios 1 E 2 E (3 OU 4) preenchidos.',
        cor: 'text-red-400', 
        bg: 'bg-red-500', 
        border: 'border-red-500',
        icone: '🚨',
        positivo: true
      };
    }

    if (Object.keys(respostas).length === configAtual.itens.length) {
      return { 
        texto: 'Delirium NEGATIVO', 
        detalhe: 'Critérios de Delirium não preenchidos simultaneamente.',
        cor: 'text-green-400', 
        bg: 'bg-green-500', 
        border: 'border-green-500',
        icone: '✅',
        positivo: false
      };
    }
    
    return { 
      texto: 'Avaliação em Andamento', 
      detalhe: 'Responda a todas as 4 características para o diagnóstico.', 
      cor: 'text-yellow-400',
      positivo: null
    };
    
  }, [respostas, configAtual]);

  const itensRespondidos = Object.keys(respostas).filter(key => respostas[key] !== undefined && respostas[key] !== null).length;
  const totalItens = configAtual ? configAtual.itens.length : 4;
  const progresso = (itensRespondidos / totalItens) * 100;

  const iniciarAvaliacao = (escala: 'psCAMICU' | 'pCAMICU') => {
    setEscalaAtiva(escala);
    setRespostas({});
    setTela('form');
    setSaveStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResposta = (id: string, valor: boolean) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));

    const currentItemIndex = configAtual!.itens.findIndex(item => item.id === id);
    const nextItemIndex = currentItemIndex + 1;
    const HEADER_OFFSET = 100;

    if (nextItemIndex < configAtual!.itens.length) {
      const nextItemId = configAtual!.itens[nextItemIndex].id;
      
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
    if (itensRespondidos === totalItens) {
      setTela('resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveAssessment = async () => {
    if (isSaving || !configAtual) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const data = {
        scaleName: configAtual.titulo,
        score: diagnostico.positivo ? 1 : 0,
        interpretation: diagnostico.texto
      };

      onSaveScore(data);
      setSaveStatus('success');
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Tela Inicial
  if (tela === 'intro') {
    return (
      <div className={`w-full max-w-2xl mx-auto p-4 ${bgDinamic} min-h-screen ${textDinamic} font-sans`}>
        <header className="mb-8 text-center pt-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900'} rounded-2xl mb-4 shadow-lg border ${borderDinamic}`}>
            <span className="text-3xl">⚕️</span>
          </div>
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'} mb-2`}>Escalas CAM-ICU Pediátrico</h1>
          <p className={`text-sm ${theme === 'light' ? 'text-blue-600' : 'text-blue-300'} font-medium`}>psCAM-ICU e pCAM-ICU</p>
        </header>

        <div className={`${bgFormDinamic} p-6 rounded-2xl border ${borderDinamic} shadow-xl mb-6`}>
          <h2 className={`text-sm font-bold ${descDinamic} uppercase tracking-widest mb-4`}>Selecione a Escala</h2>
          
          <p className={`text-sm ${descDinamic} mb-4`}>Escolha a ferramenta de acordo com a idade e capacidade cognitiva do paciente:</p>

          <button 
            onClick={() => iniciarAvaliacao('psCAMICU')}
            className={`w-full ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-700 hover:bg-indigo-600'} text-white font-bold py-3 px-6 rounded-xl shadow-md transition mb-3`}
          >
            {configsCAMICU.psCAMICU.titulo} ({configsCAMICU.psCAMICU.idade})
          </button>

          <button 
            onClick={() => iniciarAvaliacao('pCAMICU')}
            className={`w-full ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-700 hover:bg-indigo-600'} text-white font-bold py-3 px-6 rounded-xl shadow-md transition`}
          >
            {configsCAMICU.pCAMICU.titulo} ({configsCAMICU.pCAMICU.idade})
          </button>
        </div>
        
        <div className={`${bgFormDinamic} p-6 rounded-2xl border ${borderDinamic} shadow-xl`}>
          <h2 className={`text-sm font-bold ${descDinamic} uppercase tracking-widest mb-4`}>Regra Diagnóstica</h2>
          <p className={`text-sm ${textDinamic}`}>O Delirium é <strong>POSITIVO</strong> quando há:</p>
          <ul className={`list-disc list-inside text-sm ${textDinamic} mt-2 space-y-1 ml-2`}>
            <li>Característica 1 (Alteração aguda/flutuante) <strong>E</strong></li>
            <li>Característica 2 (Déficit de atenção) <strong>E</strong></li>
            <li>Mais uma das características: 3 (Nível de consciência) <strong>OU</strong> 4 (Pensamento desorganizado).</li>
          </ul>
        </div>
      </div>
    );
  }

  // 2. Formulário de Perguntas
  if (tela === 'form') {
    return (
      <div className={`w-full max-w-2xl mx-auto p-4 ${bgDinamic} min-h-screen ${textDinamic} flex flex-col`}>
        <div className={`sticky top-0 z-10 ${bgDinamic}/95 backdrop-blur-sm pb-4 pt-2 border-b ${borderDinamic} mb-4`}>
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setTela('intro')} className={`p-2 -ml-2 rounded-full transition ${theme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
              <BackIcon />
            </button>
            <div className="text-center">
              <span className={`text-sm font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-300'}`}>{configAtual?.titulo} ({configAtual?.idade})</span>
              <div className={`text-xs font-bold mt-1 ${diagnostico.cor}`}>{diagnostico.texto}</div>
            </div>
            <div className="w-8" />
          </div>
          
          <div className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-slate-800'} h-2 rounded-full overflow-hidden`}>
            <div 
              className="bg-blue-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <div className={`flex justify-between text-xs ${theme === 'light' ? 'text-slate-600' : 'text-gray-500'} mt-1`}>
            <span>{itensRespondidos} de {totalItens} respondidos</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 pb-24">
          {configAtual?.itens.map((item) => (
            <QuestionCard 
              key={item.id}
              item={item}
              valor={respostas[item.id]}
              onChange={(val) => handleResposta(item.id, val)}
              theme={theme}
            />
          ))}
        </div>

        <div className={`fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t ${theme === 'light' ? 'from-gray-50 via-gray-50' : 'from-slate-950 via-slate-950'} to-transparent`}>
          <div className="max-w-2xl mx-auto">
            <button
              onClick={finalizarAvaliacao}
              disabled={itensRespondidos < totalItens}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all
                ${itensRespondidos === totalItens 
                  ? `${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-500'} text-white transform hover:scale-105` 
                  : `${theme === 'light' ? 'bg-gray-300 text-gray-600' : 'bg-slate-800 text-slate-500'} cursor-not-allowed`}
              `}
            >
              {itensRespondidos === totalItens ? 'Finalizar e Ver Diagnóstico' : `Responda tudo (${itensRespondidos}/${totalItens})`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tela de Resultado
  if (tela === 'resultado') {
    return (
      <div className={`w-full max-w-md mx-auto p-4 ${bgDinamic} min-h-screen ${textDinamic} font-sans flex flex-col items-center pt-10`}>
        <div className="w-full text-left mb-6">
          <button onClick={() => setTela('intro')} className={`flex items-center transition-colors ${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'}`}>
            <BackIcon />
            <span className="ml-2">Voltar</span>
          </button>
        </div>

        <div className={`relative w-48 h-48 flex items-center justify-center mb-8`}>
          <div className={`absolute inset-0 rounded-full opacity-20 ${diagnostico.bg} blur-xl animate-pulse`}></div>
          <div className={`relative w-40 h-40 ${bgFormDinamic} rounded-full border-4 ${diagnostico.border} flex flex-col items-center justify-center shadow-2xl`}>
            <span className="text-5xl font-black">{diagnostico.icone}</span>
            <span className={`text-xs ${descDinamic} uppercase tracking-widest mt-1`}>{configAtual?.titulo}</span>
          </div>
          <div className={`absolute -bottom-4 ${bgFormDinamic} px-4 py-1 rounded-full border ${borderDinamic} shadow-lg text-lg ${textDinamic}`}>
            Diagnóstico
          </div>
        </div>

        <div className="text-center space-y-2 mb-8">
          <h2 className={`text-3xl font-bold ${diagnostico.cor}`}>{diagnostico.texto}</h2>
          <p className={descDinamic + ' max-w-xs mx-auto'}>{diagnostico.detalhe}</p>
        </div>

        <div className="w-full space-y-4">
          <button 
            onClick={saveAssessment}
            disabled={isSaving || saveStatus === 'success'}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all
            ${isSaving
              ? `${theme === 'light' ? 'bg-gray-400' : 'bg-slate-600'} text-white cursor-not-allowed`
              : saveStatus === 'success'
                ? `${theme === 'light' ? 'bg-green-600' : 'bg-green-700'} text-white cursor-not-allowed`
                : `${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-500'} text-white transform hover:scale-[1.02]`}
            `}
          >
            {isSaving ? 'Salvando...' : saveStatus === 'success' ? '✓ Avaliação Salva!' : 'Salvar Avaliação'}
          </button>
          
          {saveStatus === 'error' && (
            <p className="text-sm text-center text-red-400">
              Erro ao salvar. Tente novamente.
            </p>
          )}
        </div>
        
        <div className={`w-full ${bgFormDinamic} rounded-xl p-5 border ${borderDinamic} space-y-4 mt-8`}>
          <h3 className={`font-bold ${descDinamic} border-b ${borderDinamic} pb-2`}>Regra Diagnóstica</h3>
          <p className={`text-sm ${descDinamic}`}>
            <strong>Critério para Delirium POSITIVO:</strong> C1 (Alteração Aguda) <strong>E</strong> C2 (Déficit de Atenção) <strong>E</strong> (C3 (Nível de Consciência) <strong>OU</strong> C4 (Pensamento Desorganizado)).
          </p>
        </div>

        <button 
          onClick={() => iniciarAvaliacao(escalaAtiva!)}
          className={`mt-8 w-full ${theme === 'light' ? 'bg-gray-300 hover:bg-gray-400 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-white'} font-bold py-4 rounded-xl transition-colors border ${borderDinamic}`}
        >
          Refazer Avaliação
        </button>
      </div>
    );
  }

  return null;
}
