import React, { useState, useMemo, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { ThemeContext, UserContext } from '../contexts';

// ==========================================
// 🧠 CONFIGURAÇÃO DAS ESCALAS FLACC
// ==========================================

const escalasConfig = {
  flacc: {
    titulo: 'FLACC Padrão',
    nomeCompleto: 'Face, Legs, Activity, Cry, Consolability',
    idade: 'Lactentes e crianças de 0 a 7 anos',
    maxScore: 10,
    dominios: [
      {
        id: 'face',
        label: '1. FACE',
        desc: 'Expressão facial durante repouso/atividade',
        ranges: [
          '0 – Relaxada, sem tensão',
          '1 – Expressão preocupada, leve careta',
          '2 – Careta constante, expressão de dor',
        ],
      },
      {
        id: 'legs',
        label: '2. PERNAS (LEGS)',
        desc: 'Postura das pernas durante repouso/atividade',
        ranges: [
          '0 – Relaxadas, posição natural',
          '1 – Leve tensão, agitação ocasional',
          '2 – Chutes, retração, rigidez marcante',
        ],
      },
      {
        id: 'activity',
        label: '3. ATIVIDADE',
        desc: 'Movimento geral do corpo',
        ranges: [
          '0 – Movimentos normais, relaxado',
          '1 – Inquieto, contorcendo-se',
          '2 – Rigidez, arqueamento, movimentos bruscos',
        ],
      },
      {
        id: 'cry',
        label: '4. CHORO (CRY)',
        desc: 'Frequência e intensidade do choro',
        ranges: [
          '0 – Sem choro',
          '1 – Gemido leve, queixa ocasional',
          '2 – Choro intenso, persistente, gritos',
        ],
      },
      {
        id: 'consolability',
        label: '5. CONSOLABILIDADE',
        desc: 'Capacidade de ser consolado',
        ranges: [
          '0 – Consola facilmente',
          '1 – Consola com dificuldade',
          '2 – Inconsolável',
        ],
      },
    ],
  },
  flaccr: {
    titulo: 'FLACC-R',
    nomeCompleto: 'FLACC Revisada (Não Verbais)',
    idade: 'Crianças com deficiências neurológicas, PC, atraso global e pacientes intubados',
    maxScore: 10,
    dominios: [
      {
        id: 'face',
        label: '1. FACE',
        desc: 'Expressão facial durante repouso/atividade',
        ranges: [
          '0 – Expressão neutra, relaxada',
          '1 – Expressão incômoda, franzimento ocasional',
          '2 – Careta intensa, expressão de dor evidente',
        ],
      },
      {
        id: 'legs',
        label: '2. PERNAS (LEGS)',
        desc: 'Postura das pernas durante repouso/atividade',
        ranges: [
          '0 – Pernas relaxadas',
          '1 – Tensão leve, movimentos irregulares',
          '2 – Rigidez, retração, espasmos',
        ],
      },
      {
        id: 'activity',
        label: '3. ATIVIDADE',
        desc: 'Movimento geral do corpo',
        ranges: [
          '0 – Movimentos normais',
          '1 – Inquietação leve, contorcer',
          '2 – Atividade intensa, arqueamento, rigidez generalizada',
        ],
      },
      {
        id: 'cry',
        label: '4. CHORO (CRY)',
        desc: 'Vocalização/choro',
        ranges: [
          '0 – Vocalização normal / sem choro',
          '1 – Gemido leve ou vocalização diferente',
          '2 – Choro/grito intenso ou vocalização de dor',
        ],
      },
      {
        id: 'consolability',
        label: '5. CONSOLABILIDADE',
        desc: 'Resposta ao consolo',
        ranges: [
          '0 – Consolo fácil',
          '1 – Consola parcialmente',
          '2 – Difícil ou impossível consolar',
        ],
      },
    ],
  },
};

// ==========================================
// ⚛️ COMPONENTES UI
// ==========================================

const BackIcon = ({ theme }: { theme: 'light' | 'dark' }) => (
  <svg
    className={`w-5 h-5 ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-6 h-6 text-green-400 flex-shrink-0 ml-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SaveIcon = () => (
  <svg
    className="w-5 h-5 mr-2 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-4 10V4m0 0l-3 3m3-3l3 3"
    />
  </svg>
);

// Card da Pergunta
const FLACCQuestionCard = ({
  item,
  valor,
  onChange,
  theme,
}: {
  item: (typeof escalasConfig.flacc.dominios)[0];
  valor?: number;
  onChange: (val: number) => void;
  theme: 'light' | 'dark';
}) => {
  const isSelected = valor !== undefined && valor !== null;

  return (
    <div
      id={item.id}
      className={`p-4 rounded-xl shadow-md mb-4 transition-all duration-300 border ${
        isSelected
          ? theme === 'light'
            ? 'bg-blue-50 border-blue-400'
            : 'bg-blue-900 border-blue-500'
          : theme === 'light'
          ? 'bg-white border-gray-300'
          : 'bg-slate-800 border-slate-700'
      }`}
    >
      <div className="mb-4 flex justify-between items-start">
        <div className="flex-1">
          <label
            className={`block text-sm font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-gray-100'
            }`}
          >
            {item.label}
          </label>
          <p
            className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            } mt-1`}
          >
            {item.desc}
          </p>
        </div>
        {isSelected && <CheckIcon />}
      </div>

      <div className="relative">
        <select
          value={valor !== undefined && valor !== null ? valor : ''}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full p-3 pr-8 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-colors ${
            theme === 'light'
              ? 'bg-gray-50 border-gray-400 text-gray-900'
              : 'bg-slate-900 border-slate-700 text-gray-100'
          } border`}
        >
          <option value="">Selecione (0-2)...</option>
          {item.ranges.map((desc, index) => (
            <option key={index} value={index}>
              {index} – {desc}
            </option>
          ))}
        </select>
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
          theme === 'light' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 COMPONENTE PRINCIPAL
// ==========================================

function FLACCScale() {
  const themeContext = useContext(ThemeContext);
  const userContext = useContext(UserContext);
  const theme = themeContext?.theme ?? 'dark';

  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<'flacc' | 'flaccr' | null>(null);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const configAtual = escalaAtiva ? escalasConfig[escalaAtiva] : null;

  // Cálculo de progresso e pontuação
  const totalItens = configAtual?.dominios.length || 0;
  const itensRespondidos = Object.keys(respostas).filter(
    (key) => respostas[key] !== undefined && respostas[key] !== null
  ).length;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;
  const pontuacaoTotal = useMemo(
    () => Object.values(respostas).reduce((acc: number, val: any) => acc + ((val as number) || 0), 0),
    [respostas]
  );

  // Interpretação do resultado
  const resultadoAvaliacao = useMemo(() => {
    if (!configAtual) return null;

    if (itensRespondidos < totalItens) {
      return {
        texto: 'Avaliação Incompleta',
        detalhe: `Responda a todos os ${totalItens} domínios.`,
        cor: 'text-yellow-500',
        isCompleto: false,
      };
    }

    let texto, cor, recomendacao;

    if (pontuacaoTotal === 0) {
      texto = 'Sem Dor';
      cor = 'text-green-500';
      recomendacao = 'Criança sem dor';
    } else if (pontuacaoTotal >= 1 && pontuacaoTotal <= 3) {
      texto = 'Dor Leve';
      cor = 'text-yellow-500';
      recomendacao = 'Analgesia simples / Conforto';
    } else if (pontuacaoTotal >= 4 && pontuacaoTotal <= 6) {
      texto = 'Dor Moderada';
      cor = 'text-orange-500';
      recomendacao = 'Analgesia multimodal';
    } else {
      texto = 'Dor Intensa';
      cor = 'text-red-500';
      recomendacao = 'Reavaliação imediata, opioide forte';
    }

    return {
      texto,
      detalhe: `Pontuação: ${pontuacaoTotal} de ${configAtual.maxScore}`,
      recomendacao,
      cor,
      isCompleto: true,
    };
  }, [respostas, pontuacaoTotal, itensRespondidos, totalItens, configAtual]);

  const iniciarAvaliacao = (escalaKey: 'flacc' | 'flaccr') => {
    setEscalaAtiva(escalaKey);
    setRespostas({});
    setTela('form');
    setSaveStatus('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResposta = (id: string, valor: number) => {
    setRespostas((prev) => ({ ...prev, [id]: valor }));

    const currentItemIndex = configAtual!.dominios.findIndex((item) => item.id === id);
    const nextItemIndex = currentItemIndex + 1;

    if (nextItemIndex < totalItens) {
      const nextItemId = configAtual!.dominios[nextItemIndex].id;
      const nextElement = document.getElementById(nextItemId);

      if (nextElement) {
        setTimeout(() => {
          const y = nextElement.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const finalizarAvaliacao = () => {
    if (resultadoAvaliacao?.isCompleto) {
      setTela('resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveAssessment = async () => {
    if (!configAtual || !resultadoAvaliacao?.isCompleto || !userContext?.user) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const { error } = await supabase.from('scale_scores').insert({
        patient_id: userContext.user.id,
        scale_name: configAtual.titulo,
        score: pontuacaoTotal,
        interpretation: resultadoAvaliacao.texto,
        date: new Date().toISOString(),
      });

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        setTela('intro');
        setEscalaAtiva(null);
        setRespostas({});
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- TELA: INTRO ---
  if (tela === 'intro') {
    return (
      <div
        className={`w-full min-h-screen p-4 ${
          theme === 'dark' ? 'bg-slate-950 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
      >
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-8 pt-4">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 ${
                theme === 'dark' ? 'bg-orange-700' : 'bg-orange-600'
              } rounded-2xl mb-4 shadow-lg border ${
                theme === 'dark' ? 'border-orange-600' : 'border-orange-500'
              }`}
            >
              <span className="text-3xl">🤕</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Escala FLACC</h1>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              } font-medium`}
            >
              Avaliação de Dor em Crianças Não Verbais
            </p>
          </div>

          {/* Menu de Seleção */}
          <div
            className={`rounded-2xl border shadow-lg p-6 mb-6 ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <h2
              className={`text-xs font-bold uppercase tracking-widest mb-4 pb-3 border-b ${
                theme === 'dark' ? 'border-slate-700 text-gray-400' : 'border-gray-200 text-gray-600'
              }`}
            >
              Selecione a Escala
            </h2>

            <button
              onClick={() => iniciarAvaliacao('flacc')}
              className={`w-full py-3 px-4 rounded-xl font-bold transition-all mb-3 text-white ${
                theme === 'dark'
                  ? 'bg-orange-700 hover:bg-orange-600'
                  : 'bg-orange-600 hover:bg-orange-500'
              }`}
            >
              {escalasConfig.flacc.titulo}
              <span className="block text-xs font-normal mt-1 opacity-90">
                {escalasConfig.flacc.idade}
              </span>
            </button>

            <button
              onClick={() => iniciarAvaliacao('flaccr')}
              className={`w-full py-3 px-4 rounded-xl font-bold transition-all text-white ${
                theme === 'dark'
                  ? 'bg-red-700 hover:bg-red-600'
                  : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {escalasConfig.flaccr.titulo}
              <span className="block text-xs font-normal mt-1 opacity-90">
                {escalasConfig.flaccr.idade}
              </span>
            </button>
          </div>

          {/* Classificação */}
          <div
            className={`rounded-2xl border shadow-lg p-6 ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <h2
              className={`text-xs font-bold uppercase tracking-widest mb-4 pb-3 border-b ${
                theme === 'dark' ? 'border-slate-700 text-gray-400' : 'border-gray-200 text-gray-600'
              }`}
            >
              Classificação de Dor
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-500">0 pts</span>
                <span>Sem Dor</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-yellow-500">1-3 pts</span>
                <span>Dor Leve</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-orange-500">4-6 pts</span>
                <span>Dor Moderada</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-red-500">7-10 pts</span>
                <span>Dor Intensa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA: FORM ---
  if (tela === 'form' && configAtual) {
    return (
      <div
        className={`w-full min-h-screen p-4 ${
          theme === 'dark' ? 'bg-slate-950 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
      >
        <div className="max-w-lg mx-auto">
          {/* Header Fixo */}
          <div
            className={`sticky top-0 z-10 rounded-2xl border mb-4 p-4 ${
              theme === 'dark'
                ? 'bg-slate-900/95 border-slate-800'
                : 'bg-white/95 border-gray-200'
            } shadow-md backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setTela('intro')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-slate-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <BackIcon theme={theme} />
              </button>
              <div className="text-center">
                <p className="text-sm font-bold text-blue-500">{configAtual.titulo}</p>
                <p className={`text-xs ${resultadoAvaliacao?.cor}`}>
                  {resultadoAvaliacao?.texto}
                </p>
              </div>
              <div className="w-8" />
            </div>

            {/* Progresso */}
            <div
              className={`h-2 rounded-full overflow-hidden mb-2 ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'
              }`}
            >
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              >
                {itensRespondidos} de {totalItens}
              </span>
              <span className="font-bold">
                Score: <span className="text-blue-500">{pontuacaoTotal}</span> / {configAtual.maxScore}
              </span>
            </div>
          </div>

          {/* Perguntas */}
          <div className="space-y-4">
            {configAtual.dominios.map((item) => (
              <div key={item.id}>
                <FLACCQuestionCard
                  item={item}
                  valor={respostas[item.id]}
                  onChange={(val) => handleResposta(item.id, val)}
                  theme={theme}
                />
              </div>
            ))}
          </div>

          {/* Botão de Conclusão */}
          <div className="mt-6 mb-4">
            <button
              onClick={finalizarAvaliacao}
              disabled={!resultadoAvaliacao?.isCompleto}
              className={`w-full py-3 rounded-xl font-semibold transition-all border ${
                !resultadoAvaliacao?.isCompleto
                  ? theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-gray-400 hover:text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-600 hover:text-gray-800'
              }`}
            >
              {resultadoAvaliacao?.isCompleto
                ? 'Ver Resultado'
                : `Responda tudo (${itensRespondidos}/${totalItens})`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA: RESULTADO ---
  if (tela === 'resultado') {
    return (
      <div
        className={`w-full min-h-screen p-4 ${
          theme === 'dark' ? 'bg-slate-950 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
      >
        <div className="max-w-lg mx-auto">
          {/* Botão Voltar */}
          <button
            onClick={() => setTela('intro')}
            className={`flex items-center mb-6 ${
              theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'
            } transition-colors`}
          >
            <BackIcon theme={theme} />
            <span className="ml-2 text-sm">Voltar</span>
          </button>

          {/* Score */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${
                theme === 'dark' ? 'bg-slate-900 border-blue-600' : 'bg-blue-50 border-blue-500'
              } mb-4`}
            >
              <div className="text-center">
                <div className="text-5xl font-black text-blue-500">{pontuacaoTotal}</div>
                <div className={`text-xs uppercase tracking-wider mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total
                </div>
              </div>
            </div>

            <h2 className={`text-3xl font-bold ${resultadoAvaliacao?.cor} mb-2`}>
              {resultadoAvaliacao?.texto}
            </h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {resultadoAvaliacao?.detalhe}
            </p>
            {resultadoAvaliacao?.recomendacao && (
              <p className={`text-sm font-semibold mt-3 ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
              }`}>
                💊 {resultadoAvaliacao.recomendacao}
              </p>
            )}
          </div>

          {/* Detalhes */}
          <div
            className={`rounded-2xl border shadow-lg p-6 mb-6 ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3
              className={`font-bold mb-4 pb-3 border-b ${
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}
            >
              Interpretação e Recomendações
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-green-500">0 pts – Sem Dor</span>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Criança sem dor</p>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-yellow-500">1-3 pts – Dor Leve</span>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Analgesia simples / Conforto</p>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-orange-500">4-6 pts – Dor Moderada</span>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Analgesia multimodal</p>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-red-500">7-10 pts – Dor Intensa</span>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Reavaliação imediata, opioide forte</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <button
              onClick={saveAssessment}
              disabled={isSaving || saveStatus === 'success'}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center ${
                isSaving || saveStatus === 'success'
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : saveStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Salvando...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckIcon /> Salvo com Sucesso!
                </>
              ) : (
                <>
                  <SaveIcon /> Salvar Avaliação
                </>
              )}
            </button>

            {saveStatus === 'error' && (
              <p className="text-sm text-center text-red-500">
                Erro ao salvar. Tente novamente.
              </p>
            )}

            <button
              onClick={() => setTela('intro')}
              className={`w-full py-4 rounded-xl font-bold transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                  : 'bg-gray-200 hover:bg-gray-300 border border-gray-300'
              }`}
            >
              Nova Avaliação
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export { FLACCScale };
export default FLACCScale;
