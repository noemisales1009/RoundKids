import React, { useState, useMemo, useContext } from 'react';
import { ThemeContext } from '../contexts';

interface ScaleProps {
  onSaveScore?: (data: { scaleName: string; score: number; interpretation: string; date: string }) => void;
}

// ==========================================
// 🧠 CONFIGURAÇÃO DAS ESCALAS DE CONSCIÊNCIA
// ==========================================

const escalasConfig = {
  four_score: {
    titulo: 'FOUR Score',
    nomeCompleto: 'Full Outline of Unresponsiveness Score',
    maxScore: 16,
    colorKey: 'teal',
    dominios: [
      {
        id: 'olhos',
        label: '1. Olhos (E)',
        maxScore: 4,
        ranges: [
          'Não abre',
          'Abre à dor',
          'Abre espontaneamente',
          'Acompanha com olhos',
          'Pisca aos comandos',
        ],
      },
      {
        id: 'motora',
        label: '2. Resposta Motora (M)',
        maxScore: 4,
        ranges: [
          'Nenhuma',
          'Flexão anormal',
          'Retira ao estímulo',
          'Localiza estímulo',
          'Obedece comandos',
        ],
      },
      {
        id: 'tronco',
        label: '3. Reflexos do Tronco (B)',
        maxScore: 4,
        ranges: [
          'Nenhum',
          'Tosse ausente',
          'Pupilas e corneano ausentes',
          'Um reflexo ausente',
          'Pupilas e corneano presentes',
        ],
      },
      {
        id: 'respiracao',
        label: '4. Respiração (R)',
        maxScore: 4,
        ranges: ['Apneia', 'Ausente ventilador', 'Irregular', 'Cheyne-Stokes', 'Padrão regular'],
      },
    ],
  },
};

const colorConfig = {
  teal: {
    bg: 'bg-teal-600 dark:bg-teal-700',
    hover: 'hover:bg-teal-500 dark:hover:bg-teal-600',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500 dark:border-teal-600',
    progress: 'bg-teal-500 dark:bg-teal-600',
    light: 'bg-teal-50 dark:bg-slate-700',
  },
};

// ==========================================
// 🎨 COMPONENTES
// ==========================================

const QuestionCard: React.FC<{
  item: any;
  valor: number | string;
  onChange: (val: number) => void;
  isDark: boolean;
  colorKey: string;
}> = ({ item, valor, onChange, isDark, colorKey }) => {
  const isSelected = valor !== '' && valor !== undefined && valor !== null && valor > 0;
  const colors = colorConfig[colorKey as keyof typeof colorConfig];

  return (
    <div
      id={item.id}
      className={`p-3 sm:p-4 rounded-lg border transition-all duration-300 mb-3 ${
        isSelected
          ? `${colors.light} border-l-4 ${colors.border}`
          : `${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'}`
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex-1">
          <label className={`block text-sm sm:text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {item.label}
          </label>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Máximo: {item.maxScore} pts
          </p>
        </div>
        {isSelected && <span className="text-lg">✅</span>}
      </div>

      <select
        value={valor === undefined || valor === null ? '' : valor}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full p-2 sm:p-3 rounded-lg text-sm sm:text-base transition-colors ${
          isDark
            ? 'bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-offset-0'
            : 'bg-white border border-slate-300 text-slate-900'
        } focus:outline-none ${colors.text}`}
      >
        <option value="">Selecione...</option>
        {item.ranges.map((desc: string, index: number) => (
          <option key={index} value={index}>
            {index} - {desc}
          </option>
        ))}
      </select>
    </div>
  );
};

// ==========================================
// 🚀 COMPONENTE PRINCIPAL
// ==========================================

export const ConsciousnessScale: React.FC<ScaleProps> = ({ onSaveScore }) => {
  const { isDark } = useContext(ThemeContext)!;
  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<'four_score' | null>(null);
  const [respostas, setRespostas] = useState<{ [key: string]: number | string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);

  const configAtual = escalaAtiva ? escalasConfig[escalaAtiva] : null;
  const colors = configAtual ? colorConfig[configAtual.colorKey as keyof typeof colorConfig] : colorConfig.teal;

  // Cálculo de progresso
  const totalItens = configAtual ? configAtual.dominios.length : 0;
  const itensRespondidos = configAtual
    ? configAtual.dominios.filter((item) => respostas[item.id] !== '' && respostas[item.id] !== undefined).length
    : 0;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;

  // Cálculo de pontuação
  const pontuacaoTotal = useMemo(() => {
    return Object.values(respostas).reduce((sum: number, val: any) => sum + (val as number || 0), 0);
  }, [respostas]);

  // Interpretação
  const resultadoAvaliacao = useMemo(() => {
    if (itensRespondidos < totalItens) {
      return {
        texto: 'Incompleto',
        detalhe: `Responda todos os ${totalItens} itens`,
        cor: 'text-yellow-500',
        isCompleto: false,
      };
    }

    if (escalaAtiva === 'four_score') {
      const score = pontuacaoTotal;
      if (score >= 12) {
        return {
          texto: 'Função Preservada',
          detalhe: 'Função neurológica preservada ou moderadamente alterada',
          cor: 'text-green-500',
          isCompleto: true,
        };
      }
      if (score >= 8) {
        return { texto: 'Lesão Moderada', detalhe: 'Lesão neurológica moderada', cor: 'text-yellow-500', isCompleto: true };
      }
      if (score >= 4) {
        return { texto: 'Lesão Grave', detalhe: 'Lesão neurológica grave', cor: 'text-orange-500', isCompleto: true };
      }
      return { texto: 'Grave Extremo', detalhe: 'Comprometimento extremo', cor: 'text-red-500', isCompleto: true };
    }

    return { texto: '', detalhe: '', cor: '', isCompleto: false };
  }, [pontuacaoTotal, itensRespondidos, escalaAtiva]);

  const iniciarAvaliacao = (escala: 'four_score') => {
    setEscalaAtiva(escala);
    setRespostas({});
    setSaveStatus(null);
    setTela('form');
  };

  const handleResposta = (id: string, valor: number) => {
    setRespostas((prev) => ({ ...prev, [id]: valor }));
  };

  const finalizarAvaliacao = () => {
    if (resultadoAvaliacao.isCompleto) {
      setTela('resultado');
    }
  };

  const saveAssessment = async () => {
    if (!onSaveScore) return;
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      onSaveScore({
        scaleName: `Consciência - ${configAtual?.titulo}`,
        score: pontuacaoTotal,
        interpretation: resultadoAvaliacao.texto,
        date: new Date().toISOString(),
      });
      setSaveStatus('success');
      setTimeout(() => {
        setTela('intro');
        setEscalaAtiva(null);
        setRespostas({});
      }, 1500);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // 🎬 TELAS
  // ==========================================

  // INTRO
  if (tela === 'intro') {
    return (
      <div className={`p-4 space-y-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center mb-4">
          <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            🧠 Escalas de Consciência
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Selecione a escala apropriada
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => iniciarAvaliacao('four_score')}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white text-sm sm:text-base transition-all ${colorConfig.teal.bg} ${colorConfig.teal.hover}`}
          >
            {escalasConfig.four_score.titulo}
            <div className={`text-xs mt-1 ${isDark ? 'text-teal-200' : 'text-teal-100'}`}>
              0 - 16 pts
            </div>
          </button>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
          <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Pontos de Corte
          </h3>
          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <p className="font-bold mb-1">FOUR Score:</p>
              <ul className="space-y-1 ml-2">
                <li className="flex justify-between text-green-500">
                  <span>≥ 12</span>
                  <span>Função Preservada</span>
                </li>
                <li className="flex justify-between text-yellow-500">
                  <span>8-11</span>
                  <span>Lesão Moderada</span>
                </li>
                <li className="flex justify-between text-orange-500">
                  <span>4-7</span>
                  <span>Lesão Grave</span>
                </li>
                <li className="flex justify-between text-red-500">
                  <span>0-3</span>
                  <span>Grave Extremo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FORM
  if (tela === 'form' && configAtual) {
    return (
      <div className={`p-4 space-y-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* Header */}
        <div className={`p-3 rounded-lg border sticky top-0 z-10 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setTela('intro')}
              className={`text-sm font-semibold ${colors.text} hover:underline`}
            >
              ← Voltar
            </button>
            <span className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {configAtual.titulo}
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}>
            <div className={`h-full transition-all ${colors.progress}`} style={{ width: `${progresso}%` }} />
          </div>
          <div className={`text-xs mt-1 flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <span>{itensRespondidos}/{totalItens} respondidas</span>
            <span className="font-bold">Score: {pontuacaoTotal}/{configAtual.maxScore}</span>
          </div>
        </div>

        {/* Perguntas */}
        <div className="space-y-3">
          {configAtual.dominios.map((item) => (
            <QuestionCard
              key={item.id}
              item={item}
              valor={respostas[item.id]}
              onChange={(val) => handleResposta(item.id, val)}
              isDark={isDark}
              colorKey={configAtual.colorKey}
            />
          ))}
        </div>

        {/* Botão */}
        <button
          onClick={finalizarAvaliacao}
          disabled={!resultadoAvaliacao.isCompleto}
          className={`w-full py-3 rounded-lg font-bold text-white text-sm sm:text-base transition-all mt-4 ${
            resultadoAvaliacao.isCompleto
              ? `${colors.bg} ${colors.hover}`
              : `${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-300 text-slate-500'} cursor-not-allowed`
          }`}
        >
          {resultadoAvaliacao.isCompleto ? 'Finalizar' : `Responda tudo (${itensRespondidos}/${totalItens})`}
        </button>
      </div>
    );
  }

  // RESULTADO
  if (tela === 'resultado' && configAtual) {
    return (
      <div className={`p-4 space-y-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* Voltar */}
        <button
          onClick={() => setTela('intro')}
          className={`text-sm font-semibold ${colors.text} hover:underline`}
        >
          ← Voltar ao Menu
        </button>

        {/* Círculo de Resultado */}
        <div className="flex justify-center py-4">
          <div
            className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 flex items-center justify-center ${colors.border} ${colors.light}`}
          >
            <div className="text-center">
              <div className={`text-4xl sm:text-5xl font-black ${colors.text}`}>{pontuacaoTotal}</div>
              <div className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Classificação */}
        <div className="text-center">
          <h3 className={`text-xl sm:text-2xl font-bold ${resultadoAvaliacao.cor}`}>
            {resultadoAvaliacao.texto}
          </h3>
          <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {resultadoAvaliacao.detalhe}
          </p>
        </div>

        {/* Detalhes */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
          <h4 className={`text-sm font-bold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Interpretação
          </h4>
          <ul className="text-xs sm:text-sm space-y-2">
            <li className="flex justify-between">
              <span>Escala:</span>
              <span className="font-bold">{configAtual.titulo}</span>
            </li>
            <li className="flex justify-between">
              <span>Pontuação:</span>
              <span className="font-bold">{pontuacaoTotal}/{configAtual.maxScore}</span>
            </li>
            <li className="flex justify-between">
              <span>Classificação:</span>
              <span className={`font-bold ${resultadoAvaliacao.cor}`}>{resultadoAvaliacao.texto}</span>
            </li>
          </ul>
        </div>

        {/* Botão Salvar */}
        <button
          onClick={saveAssessment}
          disabled={isSaving || saveStatus === 'success'}
          className={`w-full py-3 rounded-lg font-bold text-white text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
            saveStatus === 'success'
              ? `${isDark ? 'bg-green-700' : 'bg-green-600'}`
              : `${colors.bg} ${colors.hover}`
          } ${(isSaving || saveStatus === 'success') && 'cursor-not-allowed'}`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Salvando...
            </>
          ) : saveStatus === 'success' ? (
            <>✅ Salvo com Sucesso!</>
          ) : (
            <>💾 Salvar Avaliação</>
          )}
        </button>

        {saveStatus === 'error' && (
          <p className="text-xs sm:text-sm text-center text-red-500">Erro ao salvar. Tente novamente.</p>
        )}

        {/* Nova Avaliação */}
        <button
          onClick={() => setTela('intro')}
          className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
            isDark
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-slate-300 text-slate-900 hover:bg-slate-400'
          }`}
        >
          Nova Avaliação
        </button>
      </div>
    );
  }

  return null;
};
