import React, { useState, useMemo, useContext } from 'react';
import { ThemeContext } from '../contexts';

interface ScaleProps {
  onSaveScore?: (data: { scaleName: string; score: number; interpretation: string; date: string }) => void;
}

// ==========================================
// 🧠 CONFIGURAÇÃO DA ESCALA DE GLASGOW (ECG)
// ==========================================

const escalasConfig = {
  adulto: {
    titulo: 'Escala de Glasgow — Adultos',
    idade: '≥ 5 anos',
    maxScore: 15,
    componentes: ['ocular', 'verbal_adulto', 'motora'],
    colorKey: 'yellow',
  },
  crianca: {
    titulo: 'Escala de Glasgow Pediátrica',
    idade: '≤ 4 anos',
    maxScore: 15,
    componentes: ['ocular', 'verbal_crianca', 'motora_crianca'],
    colorKey: 'green',
  },
  lactente: {
    titulo: 'Glasgow Pediátrico — Lactentes',
    idade: '< 1 ano',
    maxScore: 15,
    componentes: ['ocular', 'verbal_lactente', 'motora_lactente'],
    colorKey: 'blue',
  },
};

const respostasECG = {
  ocular: {
    label: '1. Abertura Ocular (O)',
    maxScore: 4,
    opcoes: [
      { valor: 1, texto: 'Nenhuma' },
      { valor: 2, texto: 'À dor' },
      { valor: 3, texto: 'Ao som' },
      { valor: 4, texto: 'Espontânea' },
    ]
  },
  verbal_adulto: {
    label: '2. Resposta Verbal (V) - Adulto/Criança (> 4a)',
    maxScore: 5,
    opcoes: [
      { valor: 1, texto: 'Nenhuma' },
      { valor: 2, texto: 'Sons incompreensíveis' },
      { valor: 3, texto: 'Palavras inadequadas' },
      { valor: 4, texto: 'Confuso' },
      { valor: 5, texto: 'Orientado' },
    ]
  },
  verbal_crianca: {
    label: '2. Resposta Verbal (V) - Criança (<= 4a)',
    maxScore: 5,
    opcoes: [
      { valor: 1, texto: 'Nenhuma vocalização' },
      { valor: 2, texto: 'Gemidos de dor' },
      { valor: 3, texto: 'Choro persistente / irritado' },
      { valor: 4, texto: 'Choro consolável' },
      { valor: 5, texto: 'Balbucia / vocaliza adequadamente' },
    ]
  },
  verbal_lactente: {
    label: '2. Resposta Verbal (V) - Lactente (< 1a)',
    maxScore: 5,
    opcoes: [
      { valor: 1, texto: 'Ausência de sons' },
      { valor: 2, texto: 'Gemido à dor' },
      { valor: 3, texto: 'Choro inconsolável' },
      { valor: 4, texto: 'Chora mas é consolável' },
      { valor: 5, texto: 'Sons normais / balbucia' },
    ]
  },
  motora: {
    label: '3. Resposta Motora (M) - Adulto/Criança',
    maxScore: 6,
    opcoes: [
      { valor: 1, texto: 'Nenhuma' },
      { valor: 2, texto: 'Extensão anormal (Descerebração)' },
      { valor: 3, texto: 'Flexão anormal (Decorticação)' },
      { valor: 4, texto: 'Retirada inespecífica' },
      { valor: 5, texto: 'Localiza dor' },
      { valor: 6, texto: 'Obedece comandos' },
    ]
  },
  motora_crianca: {
    label: '3. Resposta Motora (M) - Criança (<= 4a)',
    maxScore: 6,
    opcoes: [
      { valor: 1, texto: 'Nenhuma resposta motora' },
      { valor: 2, texto: 'Extensão anormal (Descerebração)' },
      { valor: 3, texto: 'Flexão anormal (Decorticação)' },
      { valor: 4, texto: 'Retirada inespecífica' },
      { valor: 5, texto: 'Retirada ao toque/dor' },
      { valor: 6, texto: 'Movimenta-se espontaneamente / obedece comandos simples' },
    ]
  },
  motora_lactente: {
    label: '3. Resposta Motora (M) - Lactente (< 1a)',
    maxScore: 6,
    opcoes: [
      { valor: 1, texto: 'Nenhuma resposta' },
      { valor: 2, texto: 'Extensão anormal (Descerebração)' },
      { valor: 3, texto: 'Flexão anormal (Decorticação)' },
      { valor: 4, texto: 'Retirada inespecífica' },
      { valor: 5, texto: 'Retirada ao estímulo doloroso' },
      { valor: 6, texto: 'Movimentos espontâneos / retira ao toque' },
    ]
  },
};

const colorConfig = {
  yellow: {
    bg: 'bg-yellow-600 dark:bg-yellow-700',
    hover: 'hover:bg-yellow-500 dark:hover:bg-yellow-600',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-500 dark:border-yellow-600',
    progress: 'bg-yellow-500 dark:bg-yellow-600',
    light: 'bg-yellow-50 dark:bg-slate-700',
  },
  green: {
    bg: 'bg-green-600 dark:bg-green-700',
    hover: 'hover:bg-green-500 dark:hover:bg-green-600',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500 dark:border-green-600',
    progress: 'bg-green-500 dark:bg-green-600',
    light: 'bg-green-50 dark:bg-slate-700',
  },
  blue: {
    bg: 'bg-blue-600 dark:bg-blue-700',
    hover: 'hover:bg-blue-500 dark:hover:bg-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500 dark:border-blue-600',
    progress: 'bg-blue-500 dark:bg-blue-600',
    light: 'bg-blue-50 dark:bg-slate-700',
  },
};

// ==========================================
// 🎨 COMPONENTES
// ==========================================

const QuestionCard: React.FC<{
  item: any;
  valor: number | string;
  onChange: (val: number) => void;
  opcoes: any[];
  isDark: boolean;
  colorKey: string;
}> = ({ item, valor, onChange, opcoes, isDark, colorKey }) => {
  const isSelected = valor !== '' && valor !== undefined && valor !== null && valor > 1;
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
            Pontuação: 1 a {item.maxScore}
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
        <option value="">Selecione (1-{item.maxScore})...</option>
        {opcoes.map((opt) => (
          <option key={opt.valor} value={opt.valor}>
            {opt.valor} - {opt.texto}
          </option>
        ))}
      </select>
    </div>
  );
};

export const GlasgowScale: React.FC<ScaleProps> = ({ onSaveScore }) => {
  const { isDark } = useContext(ThemeContext)!;
  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [faixaEtaria, setFaixaEtaria] = useState<'adulto' | 'crianca' | 'lactente' | null>(null);
  const [respostas, setRespostas] = useState<{ [key: string]: number | string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);

  const configAtual = faixaEtaria ? escalasConfig[faixaEtaria] : null;
  const colors = configAtual ? colorConfig[configAtual.colorKey as keyof typeof colorConfig] : colorConfig.yellow;

  // Cálculo de progresso
  const totalItens = 3;
  const itensRespondidos = configAtual
    ? configAtual.componentes.filter((comp) => respostas[comp] !== '' && respostas[comp] !== undefined).length
    : 0;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;

  // Cálculo de pontuação
  const pontuacaoTotal = useMemo(() => {
    if (!configAtual) return 0;
    return configAtual.componentes.reduce((sum, comp) => sum + (respostas[comp] as number || 0), 0);
  }, [respostas, configAtual]);

  // Interpretação
  const resultadoAvaliacao = useMemo(() => {
    if (itensRespondidos < totalItens) {
      return { texto: 'Incompleto', detalhe: 'Responda todas as perguntas', cor: 'text-yellow-500', isCompleto: false };
    }
    if (pontuacaoTotal >= 13) {
      return { texto: 'Leve', detalhe: 'Traumatismo leve / Consciência preservada', cor: 'text-green-500', isCompleto: true };
    }
    if (pontuacaoTotal >= 9) {
      return { texto: 'Moderado', detalhe: 'Traumatismo moderado / Rebaixamento moderado', cor: 'text-yellow-500', isCompleto: true };
    }
    if (pontuacaoTotal > 5) {
      return { texto: 'Grave', detalhe: 'Coma grave (≤ 8 pts) - Indicação de via aérea definitiva', cor: 'text-red-500', isCompleto: true };
    }
    return { texto: 'Extremamente Grave', detalhe: 'Pontuação ≤ 5 - Risco de dano neurológico extenso', cor: 'text-red-700', isCompleto: true };
  }, [pontuacaoTotal, itensRespondidos]);

  const iniciarAvaliacao = (escala: 'adulto' | 'crianca' | 'lactente') => {
    setFaixaEtaria(escala);
    setRespostas({
      ocular: '',
      verbal_adulto: '',
      motora: '',
      verbal_crianca: '',
      motora_crianca: '',
      verbal_lactente: '',
      motora_lactente: '',
    });
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
        scaleName: `Glasgow - ${configAtual?.titulo}`,
        score: pontuacaoTotal,
        interpretation: resultadoAvaliacao.texto,
        date: new Date().toISOString(),
      });
      setSaveStatus('success');
      setTimeout(() => {
        setTela('intro');
        setFaixaEtaria(null);
        setRespostas({});
      }, 1500);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const getOptionsForItem = (itemId: string) => respostasECG[itemId as keyof typeof respostasECG]?.opcoes || [];
  const getItemConfig = (itemId: string) => respostasECG[itemId as keyof typeof respostasECG] || {};

  // ==========================================
  // 🎬 TELAS
  // ==========================================

  // INTRO - Menu Principal
  if (tela === 'intro') {
    return (
      <div className={`p-4 space-y-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center mb-4">
          <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            🧠 Escala de Coma de Glasgow
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Selecione a faixa etária
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => iniciarAvaliacao('adulto')}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white text-sm sm:text-base transition-all ${colorConfig.yellow.bg} ${colorConfig.yellow.hover}`}
          >
            {escalasConfig.adulto.titulo} ({escalasConfig.adulto.idade})
          </button>
          <button
            onClick={() => iniciarAvaliacao('crianca')}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white text-sm sm:text-base transition-all ${colorConfig.green.bg} ${colorConfig.green.hover}`}
          >
            {escalasConfig.crianca.titulo} ({escalasConfig.crianca.idade})
          </button>
          <button
            onClick={() => iniciarAvaliacao('lactente')}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white text-sm sm:text-base transition-all ${colorConfig.blue.bg} ${colorConfig.blue.hover}`}
          >
            {escalasConfig.lactente.titulo} ({escalasConfig.lactente.idade})
          </button>
        </div>

        <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
          <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Interpretação</h3>
          <ul className="text-xs sm:text-sm space-y-1">
            <li className="flex justify-between text-green-500">
              <span>13-15 pts</span>
              <span>Leve</span>
            </li>
            <li className="flex justify-between text-yellow-500">
              <span>9-12 pts</span>
              <span>Moderado</span>
            </li>
            <li className="flex justify-between text-red-500">
              <span>≤ 8 pts</span>
              <span>Grave</span>
            </li>
            <li className="flex justify-between text-red-700">
              <span>≤ 5 pts</span>
              <span>Extremamente Grave</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // FORM - Formulário
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
            <span>{itensRespondidos}/3 respondidas</span>
            <span className="font-bold">Score: {pontuacaoTotal}/15</span>
          </div>
        </div>

        {/* Perguntas */}
        <div className="space-y-3">
          {configAtual.componentes.map((compKey) => (
            <QuestionCard
              key={compKey}
              item={getItemConfig(compKey)}
              valor={respostas[compKey]}
              onChange={(val) => handleResposta(compKey, val)}
              opcoes={getOptionsForItem(compKey)}
              isDark={isDark}
              colorKey={configAtual.colorKey}
            />
          ))}
        </div>

        {/* Botão de Conclusão */}
        <button
          onClick={finalizarAvaliacao}
          disabled={!resultadoAvaliacao.isCompleto}
          className={`w-full py-3 rounded-lg font-bold text-white text-sm sm:text-base transition-all ${
            resultadoAvaliacao.isCompleto
              ? `${colors.bg} ${colors.hover}`
              : `${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-300 text-slate-500'} cursor-not-allowed`
          }`}
        >
          {resultadoAvaliacao.isCompleto ? 'Finalizar e Ver Escore' : `Responda tudo (${itensRespondidos}/3)`}
        </button>
      </div>
    );
  }

  // RESULTADO - Resultado
  if (tela === 'resultado' && configAtual) {
    return (
      <div className={`p-4 space-y-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* Botão Voltar */}
        <button
          onClick={() => setTela('intro')}
          className={`text-sm font-semibold ${colors.text} hover:underline`}
        >
          ← Voltar ao Menu
        </button>

        {/* Círculo de Resultado */}
        <div className="flex justify-center py-4">
          <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 flex items-center justify-center ${colors.border} ${colors.light}`}>
            <div className="text-center">
              <div className={`text-4xl sm:text-5xl font-black ${colors.text}`}>{pontuacaoTotal}</div>
              <div className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total ECG</div>
            </div>
          </div>
        </div>

        {/* Classificação */}
        <div className="text-center">
          <h3 className={`text-xl sm:text-2xl font-bold ${resultadoAvaliacao.cor}`}>{resultadoAvaliacao.texto}</h3>
          <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{resultadoAvaliacao.detalhe}</p>
        </div>

        {/* Detalhes */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
          <h4 className={`text-sm font-bold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Detalhes da Avaliação</h4>
          <ul className="text-xs sm:text-sm space-y-2">
            <li className="flex justify-between">
              <span>Ocular:</span>
              <span className="font-bold">{respostas['ocular'] || 0} pts</span>
            </li>
            <li className="flex justify-between">
              <span>Verbal:</span>
              <span className="font-bold">{respostas[configAtual.componentes[1]] || 0} pts</span>
            </li>
            <li className="flex justify-between">
              <span>Motora:</span>
              <span className="font-bold">{respostas[configAtual.componentes[2]] || 0} pts</span>
            </li>
            <li className={`flex justify-between border-t ${isDark ? 'border-slate-700 pt-2' : 'border-slate-400 pt-2'}`}>
              <span className="font-bold">Total:</span>
              <span className={`font-black text-lg ${colors.text}`}>{pontuacaoTotal}/15</span>
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
