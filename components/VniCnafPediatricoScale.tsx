import React, { useState, useMemo, useContext } from 'react';
import { ThemeContext } from '../contexts';
import { BackArrowIcon, CheckCircleIcon, SaveIcon } from './icons';

interface VNIItem {
  id: string;
  label: string;
  desc: string;
}

interface VNIOption {
  valor: number;
  texto: string;
}

const escalaConfig = {
  titulo: 'Escore de Resposta a VNI/CNAF',
  nomeCompleto: 'Avaliação de Resposta à Ventilação Não Invasiva e CNAF em Pediatria',
  idade: 'Pediatria (0 a 14 pontos)',
  itens: [
    {
      id: 'fr',
      label: '1. Frequência Respiratória (FR)',
      desc: 'Redução > 20% (0) | Redução < 20% persistente (1) | Sem mudança ou aumento (2)',
    },
    {
      id: 'musculatura',
      label: '2. Uso de Musculatura Acessória',
      desc: 'Reduzido (0) | Persistente (1) | Aumenta ou permanece intenso (2)',
    },
    {
      id: 'consciencia',
      label: '3. Nível de Consciência',
      desc: 'Alerta, melhora clínica (0) | Mantém irritabilidade leve (1) | Sonolência, rebaixamento, letargia (2)',
    },
    {
      id: 'saturacao',
      label: '4. Saturação com VNI',
      desc: '≥ 94% com FiO2 ≤ 40% (0) | 90-93% com FiO2 ≤ 50% (1) | < 90% com FiO2 ≤ 60% (2)',
    },
    {
      id: 'gasometria',
      label: '5. Gasometria Arterial (se disponível)',
      desc: 'pH > 7,3, PaCO2 < ou estável (0) | pH 7,25 a 7,3, PaCO2 > ou leve (1) | pH < 7,25, PaCO2 alta progressivamente (2)',
    },
    {
      id: 'conforto',
      label: '6. Conforto Respiratório',
      desc: 'Confortável (0) | Leve desconforto persistente (1) | Piora do desconforto (2)',
    },
    {
      id: 'ausculta',
      label: '7. Ausculta Pulmonar',
      desc: 'Melhora de entrada de ar (0) | Sem mudança significativa (1) | Redução acentuada, sinais de esgotamento (2)',
    },
  ] as VNIItem[],
  opcoes: [
    { valor: 0, texto: '0 - Resposta favorável' },
    { valor: 1, texto: '1 - Resposta parcial' },
    { valor: 2, texto: '2 - Sinais de falência ou piora' },
  ] as VNIOption[],
};

interface VNIQuestionCardProps {
  item: VNIItem;
  valor: number | undefined;
  onChange: (val: number) => void;
  opcoes: VNIOption[];
  isDark: boolean;
}

const VNIQuestionCard: React.FC<VNIQuestionCardProps> = ({ item, valor, onChange, opcoes, isDark }) => {
  const isSelected = valor !== undefined && valor !== null;

  return (
    <div
      id={item.id}
      className={`p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-3 transition-all duration-300 ${
        isDark
          ? isSelected
            ? 'bg-primary-900/30 border border-primary-600'
            : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
          : isSelected
          ? 'bg-primary-100 border border-primary-400'
          : 'bg-white border border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="mb-4 flex justify-between items-start gap-2">
        <div className="flex-1">
          <label className={`block text-sm sm:text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {item.label}
          </label>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
        </div>
        {isSelected && <CheckCircleIcon className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'} shrink-0`} />}
      </div>

      <div className="relative">
        <select
          value={valor === undefined || valor === null ? '' : valor}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full p-3 pr-10 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm sm:text-base ${
            isDark
              ? 'bg-slate-900 border border-slate-700 text-slate-100'
              : 'bg-white border border-slate-300 text-slate-900'
          }`}
        >
          <option value="" disabled>
            Selecione a resposta (0, 1 ou 2)...
          </option>
          {opcoes.map((opt) => (
            <option key={opt.valor} value={opt.valor}>
              {opt.texto} ({opt.valor})
            </option>
          ))}
        </select>
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

interface VNIResultadoAvaliacao {
  texto: string;
  detalhe: string;
  cor: string;
  bg: string;
  border: string;
  icone: string;
  isCompleto: boolean;
  indicacao: string;
  pontuacao: number;
}

export const VniCnafPediatricoScale: React.FC<{ onSaveScore?: (score: any) => void }> = ({ onSaveScore }) => {
  const { theme } = useContext(ThemeContext) || { theme: 'dark' };
  const isDark = theme === 'dark';

  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);

  const itensRespondidos = Object.keys(respostas).filter((key) => respostas[key] !== undefined && respostas[key] !== null).length;
  const totalItens = escalaConfig.itens.length;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;

  const pontuacaoTotal = useMemo(() => {
    return Object.values(respostas).reduce((acc: number, val: any) => acc + (val || 0), 0);
  }, [respostas]);

  const resultadoAvaliacao = useMemo((): VNIResultadoAvaliacao => {
    if (itensRespondidos < totalItens) {
      return {
        texto: 'Avaliação em Andamento',
        detalhe: `Pontuação atual: ${pontuacaoTotal} de 14.`,
        cor: isDark ? 'text-yellow-400' : 'text-yellow-600',
        bg: isDark ? 'bg-yellow-600' : 'bg-yellow-400',
        border: 'border-yellow-500',
        icone: '⏳',
        isCompleto: false,
        indicacao: '',
        pontuacao: pontuacaoTotal,
      };
    }

    if (pontuacaoTotal >= 0 && pontuacaoTotal <= 4) {
      return {
        texto: 'Boa Resposta à VNI',
        detalhe: 'Manter estratégia atual e monitorar.',
        cor: isDark ? 'text-green-400' : 'text-green-700',
        bg: isDark ? 'bg-green-600' : 'bg-green-500',
        border: 'border-green-500',
        icone: '✅',
        isCompleto: true,
        indicacao: 'Manter estratégia atual e monitorar.',
        pontuacao: pontuacaoTotal,
      };
    } else if (pontuacaoTotal >= 5 && pontuacaoTotal <= 8) {
      return {
        texto: 'Resposta Parcial / Vigilância',
        detalhe: 'Vigilância intensa, reavaliar parâmetros e considerar ajustes.',
        cor: isDark ? 'text-yellow-400' : 'text-yellow-700',
        bg: isDark ? 'bg-yellow-600' : 'bg-yellow-400',
        border: 'border-yellow-500',
        icone: '⚠️',
        isCompleto: true,
        indicacao: 'Vigilância intensa, reavaliar parâmetros da VNI, considerar ajustes (IPAP, EPAP, FiO², Interface).',
        pontuacao: pontuacaoTotal,
      };
    } else {
      return {
        texto: 'Sinais de Falência',
        detalhe: 'Indicação de possível IOT, RNC, falha na bomba muscular.',
        cor: isDark ? 'text-red-400' : 'text-red-700',
        bg: isDark ? 'bg-red-600' : 'bg-red-500',
        border: 'border-red-500',
        icone: '🚨',
        isCompleto: true,
        indicacao: 'Sinais de falência, indicação de possível IOT, RNC, Hipoxemia refratária, Hipercapnia progressiva, falha na bomba muscular.',
        pontuacao: pontuacaoTotal,
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

    const currentItemIndex = escalaConfig.itens.findIndex((item) => item.id === id);
    const nextItemIndex = currentItemIndex + 1;
    const HEADER_OFFSET = 100;

    if (nextItemIndex < escalaConfig.itens.length) {
      const nextItemId = escalaConfig.itens[nextItemIndex].id;

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
    if (isSaving || !resultadoAvaliacao.isCompleto) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const newAssessment = {
        escala: escalaConfig.titulo,
        nomeCompleto: escalaConfig.nomeCompleto,
        data: new Date().toISOString(),
        pontuacao: resultadoAvaliacao.pontuacao,
        resultado: resultadoAvaliacao.texto,
        indicacao: resultadoAvaliacao.indicacao,
        respostas: JSON.stringify(respostas),
      };

      if (onSaveScore) {
        onSaveScore(newAssessment);
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
      <div className={`w-full max-w-2xl mx-auto p-4 sm:p-6 min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
        <header className="mb-8 text-center pt-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg border ${isDark ? 'bg-primary-900 border-primary-700' : 'bg-primary-100 border-primary-300'}`}>
            <span className="text-3xl">🌬️</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{escalaConfig.titulo}</h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-primary-300' : 'text-primary-600'} font-medium`}>{escalaConfig.nomeCompleto}</p>
        </header>

        <div className={`p-6 rounded-2xl border shadow-xl mb-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h2 className={`text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 pb-2 ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-300'} border-b`}>
            INTERPRETAÇÃO
          </h2>

          <ul className={`text-xs sm:text-sm space-y-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>0 – 4 pontos</span>
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Boa resposta à VNI</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>5 – 8 pontos</span>
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Resposta parcial, vigilância intensa</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>9 – 14 pontos</span>
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sinais de falência, indicação de IOT</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => iniciarAvaliacao()}
          className={`w-full py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center justify-center font-bold text-lg ${
            isDark ? 'bg-primary-600 hover:bg-primary-500 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          <span>Iniciar Avaliação VNI/CNAF</span>
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
      <div className={`w-full max-w-2xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
        {/* Header Fixo */}
        <div className={`sticky top-0 z-10 pb-4 pt-2 mb-4 backdrop-blur-sm ${isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'} border-b`}>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setTela('intro')}
              className={`p-2 -ml-2 rounded-full transition ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <BackArrowIcon className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>{escalaConfig.titulo}</span>
              <div className={`text-xs font-bold mt-1 ${resultadoAvaliacao?.cor}`}>{resultadoAvaliacao?.texto}</div>
            </div>
            <div className="w-8" />
          </div>

          {/* Barra de Progresso */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div className={`${isDark ? 'bg-primary-500' : 'bg-primary-400'} h-full transition-all duration-500 ease-out`} style={{ width: `${progresso}%` }} />
          </div>
          <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            <span>{itensRespondidos} de {escalaConfig.itens.length} respondidos</span>
            <span>Pontos: {pontuacaoTotal} / 14</span>
          </div>
        </div>

        {/* Lista de Perguntas */}
        <div className="flex-1 space-y-4 pb-24">
          {escalaConfig.itens.map((item) => (
            <VNIQuestionCard
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
                ? `${isDark ? 'bg-primary-600 hover:bg-primary-500' : 'bg-primary-500 hover:bg-primary-600'} text-white transform hover:scale-105`
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
      <div className={`w-full max-w-2xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col items-center pt-10 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
        <div className="w-full text-left mb-6">
          <button
            onClick={() => setTela('intro')}
            className={`flex items-center transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <BackArrowIcon className="w-5 h-5" />
            <span className="ml-2 text-sm sm:text-base">Voltar ao Menu Principal</span>
          </button>
        </div>

        <div className="relative w-48 sm:w-56 h-48 sm:h-56 flex items-center justify-center mb-8">
          {/* Círculo de fundo com cor dinâmica */}
          <div className={`absolute inset-0 rounded-full opacity-20 ${resultadoAvaliacao.bg} blur-xl animate-pulse`}></div>
          <div
            className={`relative w-40 sm:w-48 h-40 sm:h-48 rounded-full border-4 ${resultadoAvaliacao.border} flex flex-col items-center justify-center shadow-2xl ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <span className="text-5xl sm:text-6xl font-black text-white">{resultadoAvaliacao.pontuacao}</span>
            <span className={`text-xs uppercase tracking-widest mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pontos</span>
          </div>
          <div className={`absolute -bottom-4 px-4 py-1 rounded-full border shadow-lg text-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
            {escalaConfig.titulo}
          </div>
        </div>

        <div className="text-center space-y-2 mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold ${resultadoAvaliacao.cor}`}>{resultadoAvaliacao.texto}</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-xs mx-auto text-sm sm:text-base`}>{resultadoAvaliacao.detalhe}</p>
        </div>

        {/* Indicação Clínica */}
        <div className={`w-full rounded-xl p-5 border space-y-4 mt-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className={`font-bold pb-2 border-b ${isDark ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-200'}`}>
            Indicação Clínica
          </h3>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{resultadoAvaliacao.indicacao}</p>
        </div>

        {/* Seção de Salvar e Nova Avaliação */}
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
                : `${isDark ? 'bg-primary-600 hover:bg-primary-500' : 'bg-primary-500 hover:bg-primary-600'} text-white transform hover:scale-[1.02]`
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
            isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
          }`}
        >
          Nova Avaliação
        </button>
      </div>
    );
  }

  return null;
};

export default VniCnafPediatricoScale;
