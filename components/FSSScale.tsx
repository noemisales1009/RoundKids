import React, { useState, useMemo, useContext } from 'react';
import { ThemeContext } from '../contexts';
import { BackArrowIcon, CheckCircleIcon, SaveIcon } from './icons';

interface FSSItem {
  id: string;
  label: string;
}

interface FSSOption {
  valor: number;
  texto: string;
  descricoes: Record<string, string>;
}

const escalaConfig = {
  titulo: 'Escala de Status Funcional (FSS)',
  nomeCompleto: 'Functional Status Scale - Pediatria',
  colecao: 'fss_assessments',
  itens: [
    { id: 'mental', label: '1. Status Mental' },
    { id: 'cardiovascular', label: '2. Status Cardiovascular' },
    { id: 'respiratorio', label: '3. Status Respiratório' },
    { id: 'gastrointestinal', label: '4. Status Gastrointestinal' },
    { id: 'renal', label: '5. Status Renal' },
    { id: 'neuromotor', label: '6. Status Neuromotor' },
  ] as FSSItem[],
  opcoes: [
    { 
      valor: 1, 
      texto: '1 - Normal',
      descricoes: {
        mental: 'Alerta e orientado',
        cardiovascular: 'Sem suporte pressórico',
        respiratorio: 'Não requer suporte respiratório',
        gastrointestinal: 'Alimentação normal, sem suporte',
        renal: 'Função renal normal',
        neuromotor: 'Sem deficiência motora'
      }
    },
    { 
      valor: 2, 
      texto: '2 - Mínima Disfunção',
      descricoes: {
        mental: 'Levemente alterado',
        cardiovascular: 'Taquicardia controlada com medicação',
        respiratorio: 'Suplemento de O₂ leve',
        gastrointestinal: 'Intolerância leve alimentar',
        renal: 'Função renal reduzida discretamente',
        neuromotor: 'Leve redução de força/movimento'
      }
    },
    { 
      valor: 3, 
      texto: '3 - Disfunção Leve',
      descricoes: {
        mental: 'Confusão leve, responde a estímulos',
        cardiovascular: 'Hipotensão controlada com fluidos',
        respiratorio: 'Suporte de O₂ moderado (FiO₂ 30-50%)',
        gastrointestinal: 'Intolerância alimentar moderada',
        renal: 'Oligúria leve (< 0,5 mL/kg/h)',
        neuromotor: 'Diminuição moderada de força'
      }
    },
    { 
      valor: 4, 
      texto: '4 - Disfunção Moderada',
      descricoes: {
        mental: 'Confusão significativa, letargia',
        cardiovascular: 'Hipotensão com inotropos menores',
        respiratorio: 'CPAP/BiPAP ou alto fluxo',
        gastrointestinal: 'Nutrição enteral ou parenteral parcial',
        renal: 'Oligúria significativa',
        neuromotor: 'Deficiência motora significativa'
      }
    },
    { 
      valor: 5, 
      texto: '5 - Disfunção Severa',
      descricoes: {
        mental: 'Coma ou não responsivo',
        cardiovascular: 'Choque com múltiplos inotropos',
        respiratorio: 'Ventilação mecânica',
        gastrointestinal: 'Nutrição parenteral total',
        renal: 'Anúria, necessita diálise',
        neuromotor: 'Paralisia ou deficiência grave'
      }
    },
  ] as FSSOption[],
  cores: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-500',
    bgBase: 'bg-red-700',
    bgProgress: 'bg-red-500',
  }
};

interface FSSQuestionCardProps {
  item: FSSItem;
  valor: number | undefined;
  onChange: (val: number) => void;
  opcoes: FSSOption[];
  isDark: boolean;
}

const FSSQuestionCard: React.FC<FSSQuestionCardProps> = ({ item, valor, onChange, opcoes, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = valor !== undefined && valor !== null;
  const selectedOption = opcoes.find(o => o.valor === valor);

  return (
    <>
      <div
        id={item.id}
        className={`p-5 rounded-xl shadow-md mb-4 transition-all duration-300 ${
          isDark
            ? isSelected
              ? 'bg-red-900/30 border border-red-600'
              : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
            : isSelected
            ? 'bg-red-50 border border-red-400'
            : 'bg-white border border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="mb-4 flex justify-between items-start gap-2">
          <div className="flex-1">
            <label className={`block text-sm sm:text-base font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {item.label}
            </label>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Pontuação: 1 a 5
            </p>
          </div>
          {isSelected && <CheckCircleIcon className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'} shrink-0`} />}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className={`w-full p-3 sm:p-4 rounded-lg border flex justify-between items-center text-left transition-all text-sm sm:text-base ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-gray-100 hover:bg-slate-800'
              : 'bg-white border-slate-300 text-gray-900 hover:bg-slate-50'
          }`}
        >
          <span className={!isSelected ? 'opacity-50' : ''}>
            {selectedOption ? (
              <span>
                <span className="font-bold">{selectedOption.texto}</span>
                <span className={`opacity-75 block text-xs mt-1 truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedOption.descricoes[item.id]}
                </span>
              </span>
            ) : (
              'Toque para selecionar...'
            )}
          </span>
          <svg className={`w-5 h-5 shrink-0 ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col ${
              isDark ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-gray-200'} flex justify-between items-center`}>
              <div>
                <h3 className="text-lg font-bold">{item.label}</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Selecione a melhor descrição:</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 opacity-50 hover:opacity-100 rounded-full hover:bg-gray-500/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-2 space-y-2">
              {opcoes.map((opt) => {
                const isOptSelected = opt.valor === valor;
                return (
                  <button
                    key={opt.valor}
                    onClick={() => {
                      onChange(opt.valor);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      isDark
                        ? isOptSelected
                          ? 'bg-red-900/30 border-red-500'
                          : 'border-transparent hover:bg-slate-800'
                        : isOptSelected
                        ? 'bg-red-50 border-red-400'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${isOptSelected ? 'text-red-500' : ''}`}>{opt.texto}</span>
                      {isOptSelected && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {opt.descricoes[item.id]}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className={`p-3 text-center text-xs opacity-50 border-t ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
              Toque na opção para confirmar
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface FSSScaleProps {
  onSaveScore?: (score: any) => void;
}

export const FSSScale: React.FC<FSSScaleProps> = ({ onSaveScore }) => {
  const contextValue = useContext(ThemeContext);
  const { theme } = contextValue || { theme: 'dark' };
  const isDark = theme === 'dark';

  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);

  const itensRespondidos = Object.keys(respostas).filter((key) => respostas[key] !== undefined).length;
  const totalItens = escalaConfig.itens.length;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;

  const pontuacaoTotal = useMemo(() => {
    return Object.values(respostas).reduce((acc: number, val: any) => acc + ((val as number) || 0), 0);
  }, [respostas]);

  const resultadoAvaliacao = useMemo(() => {
    if (itensRespondidos < totalItens) {
      return {
        texto: 'Em Andamento',
        detalhe: `Preencha todos os itens. Pontos: ${pontuacaoTotal}`,
        cor: isDark ? 'text-gray-400' : 'text-gray-600',
        bg: isDark ? 'bg-gray-600' : 'bg-gray-500',
        border: 'border-gray-500',
        icone: '⏳',
        isCompleto: false,
        pontuacao: pontuacaoTotal,
      };
    }

    if (pontuacaoTotal >= 6 && pontuacaoTotal <= 7) {
      return {
        texto: 'Funcionalidade Adequada',
        detalhe: 'Estado funcional normal ou com impacto mínimo.',
        cor: isDark ? 'text-green-400' : 'text-green-700',
        bg: isDark ? 'bg-green-600' : 'bg-green-500',
        border: 'border-green-500',
        icone: '✅',
        isCompleto: true,
        pontuacao: pontuacaoTotal,
        indicacao: 'Acompanhamento de rotina.',
      };
    } else if (pontuacaoTotal >= 8 && pontuacaoTotal <= 9) {
      return {
        texto: 'Disfunção Leve',
        detalhe: 'Necessidade de acompanhamento leve.',
        cor: isDark ? 'text-yellow-400' : 'text-yellow-700',
        bg: isDark ? 'bg-yellow-600' : 'bg-yellow-500',
        border: 'border-yellow-500',
        icone: '⚠️',
        isCompleto: true,
        pontuacao: pontuacaoTotal,
        indicacao: 'Iniciar reabilitação leve e monitoramento.',
      };
    } else if (pontuacaoTotal >= 10 && pontuacaoTotal <= 15) {
      return {
        texto: 'Disfunção Moderada',
        detalhe: 'Intervenções de reabilitação necessárias.',
        cor: isDark ? 'text-orange-400' : 'text-orange-700',
        bg: isDark ? 'bg-orange-600' : 'bg-orange-500',
        border: 'border-orange-500',
        icone: '⚠️',
        isCompleto: true,
        pontuacao: pontuacaoTotal,
        indicacao: 'Suporte moderado e reabilitação ativa.',
      };
    } else if (pontuacaoTotal >= 16 && pontuacaoTotal <= 21) {
      return {
        texto: 'Disfunção Severa',
        detalhe: 'Alto nível de suporte necessário.',
        cor: isDark ? 'text-red-400' : 'text-red-700',
        bg: isDark ? 'bg-red-600' : 'bg-red-500',
        border: 'border-red-500',
        icone: '🚨',
        isCompleto: true,
        pontuacao: pontuacaoTotal,
        indicacao: 'Reabilitação intensiva e suporte contínuo.',
      };
    } else {
      return {
        texto: 'Disfunção Muito Severa',
        detalhe: 'Impacto funcional máximo. Cuidados críticos.',
        cor: isDark ? 'text-red-500' : 'text-red-800',
        bg: isDark ? 'bg-red-700' : 'bg-red-600',
        border: 'border-red-600',
        icone: '❌',
        isCompleto: true,
        pontuacao: pontuacaoTotal,
        indicacao: 'Cuidados paliativos ou críticos de longo prazo.',
      };
    }
  }, [respostas, pontuacaoTotal, itensRespondidos, totalItens, isDark]);

  const iniciarAvaliacao = () => {
    setRespostas({});
    setTela('form');
    setSaveStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResposta = (id: string, valor: number) => {
    setRespostas((prev) => ({ ...prev, [id]: valor }));

    const currentIdx = escalaConfig.itens.findIndex((i) => i.id === id);
    if (currentIdx < escalaConfig.itens.length - 1) {
      const nextId = escalaConfig.itens[currentIdx + 1].id;
      setTimeout(() => {
        const el = document.getElementById(nextId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 140;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const finalizarAvaliacao = () => {
    if (resultadoAvaliacao?.isCompleto) {
      setTela('resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveAssessment = async () => {
    if (isSaving || !resultadoAvaliacao?.isCompleto) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      if (onSaveScore) {
        onSaveScore({
          scaleName: 'FSS',
          score: resultadoAvaliacao.pontuacao,
          interpretation: resultadoAvaliacao.texto,
        });
      }

      setSaveStatus('success');
      setTimeout(() => {
        setTela('intro');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // TELA 1: INTRO
  if (tela === 'intro') {
    return (
      <div className={`w-full max-w-2xl mx-auto p-4 sm:p-6 min-h-screen ${isDark ? 'bg-slate-950 text-gray-100' : 'bg-white text-gray-900'}`}>
        <header className="mb-8 text-center pt-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg border ${isDark ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-300'}`}>
            <span className="text-3xl">🤸</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{escalaConfig.titulo}</h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-red-300' : 'text-red-600'} font-medium`}>{escalaConfig.nomeCompleto}</p>
        </header>

        <div className={`p-6 rounded-2xl border shadow-xl mb-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h2 className={`text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 pb-2 ${isDark ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-300'} border-b`}>
            Guia de Pontuação
          </h2>

          <ul className={`text-xs sm:text-sm space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>6 – 7 pontos</span>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Funcionalidade Adequada</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>8 – 9 pontos</span>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Disfunção Leve</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>10 – 15 pontos</span>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Disfunção Moderada</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>16 – 21 pontos</span>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Disfunção Severa</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-red-500' : 'text-red-800'}`}>&gt; 21 pontos</span>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Muito Severa</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => iniciarAvaliacao()}
          className={`w-full py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center font-bold text-lg ${
            isDark ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <span>Iniciar Avaliação FSS</span>
          <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    );
  }

  // TELA 2: FORM
  if (tela === 'form') {
    return (
      <div className={`w-full flex flex-col min-h-screen ${isDark ? 'bg-slate-950 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className={`sticky top-0 z-10 max-w-2xl mx-auto w-full pb-4 pt-2 backdrop-blur-sm ${isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'} border-b px-4 sm:px-6`}>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setTela('intro')}
              className={`p-2 -ml-2 rounded-full transition ${isDark ? 'text-gray-400 hover:text-white hover:bg-slate-800' : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'}`}
            >
              <BackArrowIcon className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{escalaConfig.titulo}</span>
              <div className={`text-xs font-bold mt-1 ${resultadoAvaliacao?.cor}`}>{resultadoAvaliacao?.texto}</div>
            </div>
            <div className="w-8" />
          </div>

          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div className={`${escalaConfig.cores.bgProgress} h-full transition-all duration-500 ease-out`} style={{ width: `${progresso}%` }} />
          </div>
          <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            <span>{itensRespondidos} de {escalaConfig.itens.length} respondidos</span>
            <span>Pontos: {pontuacaoTotal} / 30</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-4">
          {escalaConfig.itens.map((item) => (
            <FSSQuestionCard
              key={item.id}
              item={item}
              valor={respostas[item.id]}
              onChange={(val) => handleResposta(item.id, val)}
              opcoes={escalaConfig.opcoes}
              isDark={isDark}
            />
          ))}

          <button
            onClick={finalizarAvaliacao}
            disabled={!resultadoAvaliacao?.isCompleto}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all mt-6 ${
              resultadoAvaliacao?.isCompleto
                ? `${escalaConfig.cores.bg} ${escalaConfig.cores.hover} text-white transform hover:scale-105 active:scale-95`
                : isDark
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-300 text-slate-600 cursor-not-allowed'
            }`}
          >
            {resultadoAvaliacao?.isCompleto ? 'Finalizar e Ver Diagnóstico' : `Responda tudo (${itensRespondidos}/${escalaConfig.itens.length})`}
          </button>
        </div>
      </div>
    );
  }

  // TELA 3: RESULTADO
  if (tela === 'resultado') {
    return (
      <div className={`w-full max-w-2xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col items-center pt-10 ${isDark ? 'bg-slate-950 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className="w-full text-left mb-6">
          <button
            onClick={() => setTela('intro')}
            className={`flex items-center transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <BackArrowIcon className="w-5 h-5" />
            <span className="ml-2 text-sm sm:text-base">Voltar ao Menu Principal</span>
          </button>
        </div>

        <div className="relative w-48 sm:w-56 h-48 sm:h-56 flex items-center justify-center mb-8">
          <div className={`absolute inset-0 rounded-full opacity-20 ${resultadoAvaliacao.bg} blur-xl animate-pulse`}></div>
          <div
            className={`relative w-40 sm:w-48 h-40 sm:h-48 rounded-full border-4 ${resultadoAvaliacao.border} flex flex-col items-center justify-center shadow-2xl ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <span className="text-5xl sm:text-6xl font-black text-white">{resultadoAvaliacao.pontuacao}</span>
            <span className={`text-xs uppercase tracking-widest mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pontos FSS</span>
          </div>
          <div className={`absolute -bottom-4 px-4 py-1 rounded-full border shadow-lg text-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
            Pediatria
          </div>
        </div>

        <div className="text-center space-y-2 mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold ${resultadoAvaliacao.cor}`}>{resultadoAvaliacao.texto}</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-xs mx-auto text-sm sm:text-base`}>{resultadoAvaliacao.detalhe}</p>
        </div>

        <div className={`w-full rounded-xl p-5 border space-y-4 mt-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className={`font-bold pb-2 border-b ${isDark ? 'text-gray-300 border-slate-800' : 'text-gray-700 border-slate-200'}`}>
            Recomendação Clínica
          </h3>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{resultadoAvaliacao.indicacao}</p>
        </div>

        <div className="w-full space-y-4 mt-8">
          <button
            onClick={saveAssessment}
            disabled={isSaving || saveStatus === 'success'}
            className={`w-full py-4 rounded-xl font-bold shadow-xl transition-all flex items-center justify-center text-sm sm:text-base ${
              isSaving
                ? isDark
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-400 text-slate-600 cursor-not-allowed'
                : saveStatus === 'success'
                ? `${isDark ? 'bg-green-700' : 'bg-green-600'} text-white cursor-not-allowed`
                : `${escalaConfig.cores.bg} ${escalaConfig.cores.hover} text-white transform hover:scale-[1.02]`
            }`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
            ) : saveStatus === 'success' ? (
              <span className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" /> Avaliação Salva com Sucesso!
              </span>
            ) : (
              <span className="flex items-center">
                <SaveIcon className="w-5 h-5 mr-2" /> Salvar Avaliação
              </span>
            )}
          </button>

          {saveStatus === 'error' && <p className={`text-sm text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>Erro ao salvar. Tente novamente.</p>}
        </div>

        <button
          onClick={() => setTela('intro')}
          className={`mt-4 w-full py-4 rounded-xl font-bold transition-colors border ${
            isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-gray-900 border-slate-300'
          }`}
        >
          Nova Avaliação
        </button>
      </div>
    );
  }

  return null;
};

export default FSSScale;
