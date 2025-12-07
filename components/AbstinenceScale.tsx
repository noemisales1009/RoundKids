import React, { useState, useMemo, useContext } from 'react';
import { ThemeContext } from '../contexts';

interface ScaleProps {
  onSaveScore?: (data: { scaleName: string; score: number; interpretation: string; date: string }) => void;
}

// ==========================================
// 🧪 CONFIGURAÇÃO DAS ESCALAS DE ABSTINÊNCIA
// ==========================================

const escalasConfig = {
  finnegan: {
    titulo: 'Escala Finnegan (NAS)',
    nomeCompleto: 'Neonatal Abstinence Score',
    idade: 'Neonatos (até 6 semanas)',
    maxScore: 40,
    colorKey: 'pink',
    itens: [
      { id: 'choro', label: '1. Choro', maxScore: 5, ranges: ['Normal', 'Mais frequente', 'Difícil consolo', 'Agudo e persistente'] },
      { id: 'sono', label: '2. Sono pós-alimentação', maxScore: 3, ranges: ['> 3h', '2–3h', '1–2h', '< 1h'] },
      { id: 'moro', label: '3. Reflexo de Moro', maxScore: 2, ranges: ['Normal', 'Levemente exaltado'] },
      { id: 'tremores', label: '4. Tremores', maxScore: 4, ranges: ['Ausente', 'Finos após estímulo', 'Finos em repouso', 'Grosseiros'] },
      { id: 'tonus', label: '5. Tônus muscular', maxScore: 2, ranges: ['Normal', 'Levemente aumentado'] },
      { id: 'mioclonias', label: '6. Mioclonias', maxScore: 3, ranges: ['Ausente', 'Leve', 'Moderada', 'Frequente'] },
      { id: 'convulsoes', label: '7. Convulsões', maxScore: 5, ranges: ['Ausente', 'Leve', 'Moderada', 'Grave', 'Convulsão'] },
      { id: 'sudorese', label: '8. Sudorese', maxScore: 1, ranges: ['Ausente', 'Presente'] },
      { id: 'febre', label: '9. Febre', maxScore: 2, ranges: ['Normal', 'Leve', 'Moderada'] },
      { id: 'espirros', label: '10. Espirros/Bocejos', maxScore: 2, ranges: ['Normal', 'Leve aumento', 'Repetitivos'] },
      { id: 'respiracao', label: '11. Respiração', maxScore: 2, ranges: ['Normal', 'FR > 60 sem retração', 'FR > 60 com retração'] },
      { id: 'succao', label: '12. Sucção', maxScore: 2, ranges: ['Normal', 'Vigorosa', 'Desorganizada'] },
      { id: 'alimentacao', label: '13. Alimentação', maxScore: 2, ranges: ['Boa', 'Dificuldade leve', 'Dificuldade moderada'] },
      { id: 'vomitos', label: '14. Vômitos', maxScore: 2, ranges: ['Ausente', 'Regurgitações', 'Frequentes/Em jato'] },
      { id: 'fezes', label: '15. Fezes', maxScore: 3, ranges: ['Normais', 'Amolecidas', 'Líquidas', 'Líquidas + dermatite'] },
    ],
  },
  wat1: {
    titulo: 'Escala WAT-1',
    nomeCompleto: 'Withdrawal Assessment Tool-1',
    idade: '0 a 21 anos',
    maxScore: 20,
    colorKey: 'cyan',
    itens: [
      { id: 'choro_wat', label: '1. Choro/Irritabilidade', maxScore: 2, ranges: ['Calmo/consola fácil', 'Choro leve/consola com esforço', 'Choro intenso/inconsolável'] },
      { id: 'facial_wat', label: '2. Expressão Facial', maxScore: 2, ranges: ['Relaxada', 'Careta leve', 'Face rígida, dor persistente'] },
      { id: 'agitacao_wat', label: '3. Agitação Motora', maxScore: 2, ranges: ['Normal', 'Agitação leve', 'Agitação intensa contínua'] },
      { id: 'tremores_wat', label: '4. Tremores', maxScore: 2, ranges: ['Ausente', 'Após estímulo', 'Em repouso ou grosseiros'] },
      { id: 'tonus_wat', label: '5. Tônus Muscular', maxScore: 2, ranges: ['Normal', 'Levemente aumentado', 'Hipertonia marcante'] },
      { id: 'sono_wat', label: '6. Sono', maxScore: 2, ranges: ['Adequado', 'Leve/fragmentado', 'Não dorme ou desperta repetidamente'] },
      { id: 'autonomicos_wat', label: '7. Sinais Autonômicos', maxScore: 2, ranges: ['Ausentes', 'Leves (FC↑, sudorese leve)', 'Intensos (FC↑↑, febre, sudorese)'] },
      { id: 'gastro_wat', label: '8. Gastrointestinais', maxScore: 2, ranges: ['Normais', 'Alterações leves', 'Vômitos/diarreia importantes'] },
      { id: 'consol_wat', label: '9. Consolabilidade', maxScore: 2, ranges: ['Consola facilmente', 'Consola com dificuldade', 'Inconsolável'] },
      { id: 'resposta_wat', label: '10. Resposta à Manipulação', maxScore: 2, ranges: ['Adequada', 'Irritação leve', 'Reação exagerada intensa'] },
    ],
  },
};

const colorConfig = {
  pink: {
    bg: 'bg-pink-600 dark:bg-pink-700',
    hover: 'hover:bg-pink-500 dark:hover:bg-pink-600',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500 dark:border-pink-600',
    progress: 'bg-pink-500 dark:bg-pink-600',
    light: 'bg-pink-50 dark:bg-slate-700',
  },
  cyan: {
    bg: 'bg-cyan-600 dark:bg-cyan-700',
    hover: 'hover:bg-cyan-500 dark:hover:bg-cyan-600',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500 dark:border-cyan-600',
    progress: 'bg-cyan-500 dark:bg-cyan-600',
    light: 'bg-cyan-50 dark:bg-slate-700',
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
            Pontuação máxima: {item.maxScore}
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

export const AbstinenceScale: React.FC<ScaleProps> = ({ onSaveScore }) => {
  const { isDark } = useContext(ThemeContext)!;
  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<'finnegan' | 'wat1' | null>(null);
  const [respostas, setRespostas] = useState<{ [key: string]: number | string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);

  const configAtual = escalaAtiva ? escalasConfig[escalaAtiva] : null;
  const colors = configAtual ? colorConfig[configAtual.colorKey as keyof typeof colorConfig] : colorConfig.pink;

  // Cálculo de progresso
  const totalItens = configAtual ? configAtual.itens.length : 0;
  const itensRespondidos = configAtual
    ? configAtual.itens.filter((item) => respostas[item.id] !== '' && respostas[item.id] !== undefined).length
    : 0;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;

  // Cálculo de pontuação
  const pontuacaoTotal = useMemo(() => {
    return Object.values(respostas).reduce((sum, val) => sum + (val as number || 0), 0);
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

    if (escalaAtiva === 'finnegan') {
      const score = pontuacaoTotal;
      if (score >= 12) {
        return { texto: 'Grave', detalhe: 'Score ≥ 12 - Abstinência grave', cor: 'text-red-500', isCompleto: true };
      }
      if (score >= 8) {
        return { texto: 'Moderado', detalhe: 'Score ≥ 8 - Iniciar tratamento', cor: 'text-orange-500', isCompleto: true };
      }
      return { texto: 'Leve', detalhe: 'Score < 8 - Acompanhamento', cor: 'text-green-500', isCompleto: true };
    }

    if (escalaAtiva === 'wat1') {
      const score = pontuacaoTotal;
      if (score >= 5) {
        return { texto: 'Grave', detalhe: 'Score ≥ 5 - Abstinência grave', cor: 'text-red-500', isCompleto: true };
      }
      if (score >= 3) {
        return { texto: 'Provável', detalhe: 'Score ≥ 3 - Abstinência provável', cor: 'text-orange-500', isCompleto: true };
      }
      return { texto: 'Baixo Risco', detalhe: 'Score 0-2 - Baixo risco', cor: 'text-green-500', isCompleto: true };
    }

    return { texto: '', detalhe: '', cor: '', isCompleto: false };
  }, [pontuacaoTotal, itensRespondidos, escalaAtiva]);

  const iniciarAvaliacao = (escala: 'finnegan' | 'wat1') => {
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
        scaleName: `Abstinência - ${configAtual?.titulo}`,
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
            💊 Escalas de Abstinência
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Selecione a escala apropriada
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => iniciarAvaliacao('finnegan')}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white text-sm sm:text-base transition-all ${colorConfig.pink.bg} ${colorConfig.pink.hover}`}
          >
            {escalasConfig.finnegan.titulo}
            <div className={`text-xs mt-1 ${isDark ? 'text-pink-200' : 'text-pink-100'}`}>
              {escalasConfig.finnegan.idade}
            </div>
          </button>
          <button
            onClick={() => iniciarAvaliacao('wat1')}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white text-sm sm:text-base transition-all ${colorConfig.cyan.bg} ${colorConfig.cyan.hover}`}
          >
            {escalasConfig.wat1.titulo}
            <div className={`text-xs mt-1 ${isDark ? 'text-cyan-200' : 'text-cyan-100'}`}>
              {escalasConfig.wat1.idade}
            </div>
          </button>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
          <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Pontos de Corte
          </h3>
          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <p className="font-bold mb-1">Finnegan:</p>
              <ul className="space-y-1 ml-2">
                <li className="flex justify-between text-green-500">
                  <span>&lt; 8</span>
                  <span>Acompanhamento</span>
                </li>
                <li className="flex justify-between text-orange-500">
                  <span>≥ 8</span>
                  <span>Iniciar Tratamento</span>
                </li>
                <li className="flex justify-between text-red-500">
                  <span>≥ 12</span>
                  <span>Grave</span>
                </li>
              </ul>
            </div>
            <div className={`border-t ${isDark ? 'border-slate-700 pt-3' : 'border-slate-300 pt-3'}`}>
              <p className="font-bold mb-1">WAT-1:</p>
              <ul className="space-y-1 ml-2">
                <li className="flex justify-between text-green-500">
                  <span>0-2</span>
                  <span>Baixo Risco</span>
                </li>
                <li className="flex justify-between text-orange-500">
                  <span>≥ 3</span>
                  <span>Provável</span>
                </li>
                <li className="flex justify-between text-red-500">
                  <span>≥ 5</span>
                  <span>Grave</span>
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
          {configAtual.itens.map((item) => (
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

        {/* Pontos de Corte */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
          <h4 className={`text-sm font-bold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Referência Rápida
          </h4>
          <ul className="text-xs sm:text-sm space-y-1">
            {escalaAtiva === 'finnegan' ? (
              <>
                <li className="flex justify-between text-green-500">
                  <span>&lt; 8</span>
                  <span>Acompanhamento</span>
                </li>
                <li className="flex justify-between text-orange-500">
                  <span>8-11</span>
                  <span>Iniciar Tratamento</span>
                </li>
                <li className="flex justify-between text-red-500">
                  <span>≥ 12</span>
                  <span>Grave</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex justify-between text-green-500">
                  <span>0-2</span>
                  <span>Baixo Risco</span>
                </li>
                <li className="flex justify-between text-orange-500">
                  <span>3-4</span>
                  <span>Provável</span>
                </li>
                <li className="flex justify-between text-red-500">
                  <span>≥ 5</span>
                  <span>Grave</span>
                </li>
              </>
            )}
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
