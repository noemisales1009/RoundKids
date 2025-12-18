import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeftIcon } from './icons';

// ==========================================
// 🧠 CONFIGURAÇÃO DAS ESCALAS DE RISCO DE LESÃO
// Braden (Adulto), Braden Q (Pediátrica Padrão) e Braden Q Ampliada
// ==========================================

const scoreOptions1_4 = [
    { valor: 1, texto: '1 ponto' },
    { valor: 2, texto: '2 pontos' },
    { valor: 3, texto: '3 pontos' },
    { valor: 4, texto: '4 pontos' },
];

const interpretarBraden = (score: number, scaleTitle: string) => {
    if (scaleTitle.includes('Adulto')) {
        if (score >= 19) return { risco: 'Sem risco', cor: 'text-green-400' };
        if (score >= 15) return { risco: 'Baixo risco', cor: 'text-yellow-400' };
        if (score >= 13) return { risco: 'Risco moderado', cor: 'text-orange-400' };
        if (score >= 10) return { risco: 'Alto risco', cor: 'text-red-400' };
        return { risco: 'Risco muito alto', cor: 'text-red-600' };
    }
    if (score >= 20) return { risco: 'Sem risco', cor: 'text-green-400' };
    if (score >= 16) return { risco: 'Risco moderado', cor: 'text-yellow-400' };
    if (score >= 13) return { risco: 'Risco alto', cor: 'text-red-400' };
    return { risco: 'Risco muito alto', cor: 'text-red-600' };
};

const escalasConfig = {
  braden: {
    titulo: 'Escala de Braden',
    nomeCompleto: 'Escala de Braden (Enfermaria)',
    idade: 'Maiores de 8 anos',
    tipo: 'score',
    totalMax: 23,
    opcoes: scoreOptions1_4,
    interpreta: (score: number) => interpretarBraden(score, 'Braden (Adulto)'),
    cores: { bg: 'bg-orange-600', hover: 'hover:bg-orange-500', text: 'text-orange-300', bgProgress: 'bg-orange-500', bgBase: 'bg-orange-700', hoverBase: 'hover:bg-orange-600' },
    itens: [
      { id: 'c1', label: '1. Percepção Sensorial', desc: 'Capacidade de resposta e nível de dor/desconforto.', pontos: [1, 2, 3, 4], scoreDesc: ['Totalmente limitado', 'Muito limitado', 'Ligeiramente limitado', 'Sem limitação'] },
      { id: 'c2', label: '2. Umidade', desc: 'Grau de exposição da pele à umidade.', pontos: [1, 2, 3, 4], scoreDesc: ['Constantemente úmida', 'Muito úmida', 'Ocasionalmente úmida', 'Raramente úmida'] },
      { id: 'c3', label: '3. Atividade', desc: 'Nível de atividade física.', pontos: [1, 2, 3, 4], scoreDesc: ['Acamado', 'Confinado à cadeira', 'Anda ocasionalmente', 'Anda frequentemente'] },
      { id: 'c4', label: '4. Mobilidade', desc: 'Capacidade de mudar e controlar a posição do corpo.', pontos: [1, 2, 3, 4], scoreDesc: ['Totalmente imóvel', 'Muito limitada', 'Ligeiramente limitada', 'Sem limitações'] },
      { id: 'c5', label: '5. Nutrição', desc: 'Padrão habitual de ingestão alimentar.', pontos: [1, 2, 3, 4], scoreDesc: ['Muito pobre', 'Provavelmente inadequada', 'Adequada', 'Excelente'] },
      { id: 'c6', label: '6. Fricção/Cisalhamento', desc: 'Risco de dano na pele devido a fricção.', pontos: [1, 2, 3], scoreDesc: ['Problema evidente', 'Problema potencial', 'Sem problema aparente'] },
    ],
  },
  bradenq: {
    titulo: 'Escala Braden Q (Pediátrica)',
    nomeCompleto: 'Braden Q (Enfermaria e UTI)',
    idade: '21 dias de vida a 8 anos',
    tipo: 'score',
    totalMax: 28,
    opcoes: scoreOptions1_4,
    interpreta: (score: number) => interpretarBraden(score, 'Braden Q'),
    cores: { bg: 'bg-pink-600', hover: 'hover:bg-pink-500', text: 'text-pink-300', bgProgress: 'bg-pink-500', bgBase: 'bg-pink-700', hoverBase: 'hover:bg-pink-600' },
    itens: [
      { id: 'c1', label: '1. Mobilidade', desc: 'Grau e tipo de movimentos espontâneos.', pontos: [1, 2, 3, 4], scoreDesc: ['Não faz movimentos; imóvel', 'Movimentos muito limitados', 'Muda posição ocasionalmente', 'Muda posição frequentemente'] },
      { id: 'c2', label: '2. Atividade', desc: 'Nível de atividade física.', pontos: [1, 2, 3], scoreDesc: ['Acamado', 'Restrito à cadeira/engatinha', 'Caminha'] }, 
      { id: 'c3', label: '3. Percepção Sensorial', desc: 'Capacidade de responder a estímulos.', pontos: [1, 2, 3, 4], scoreDesc: ['Não responde a estímulos', 'Responde apenas à dor', 'Responde à fala, orientado/confuso', 'Orientado e responde adequadamente'] },
      { id: 'c4', label: '4. Umidade', desc: 'Grau de exposição da pele à umidade.', pontos: [1, 2, 3, 4], scoreDesc: ['Constantemente úmida', 'Muito úmida', 'Ocasionalmente úmida', 'Raramente úmida'] },
      { id: 'c5', label: '5. Fricção/Cisalhamento', desc: 'Risco de dano na pele devido a fricção.', pontos: [1, 2, 3], scoreDesc: ['Problema evidente', 'Problema potencial', 'Sem problema'] },
      { id: 'c6', label: '6. Nutrição', desc: 'Padrão habitual de ingestão alimentar.', pontos: [1, 2, 3, 4], scoreDesc: ['Muito pobre', 'Provavelmente inadequada', 'Adequada', 'Excelente'] },
      { id: 'c7', label: '7. Perfusão/Oxigenação', desc: 'Avaliação da perfusão/oxigenação.', pontos: [1, 2, 3], scoreDesc: ['Má perfusão/oxigenação', 'Comprometimento moderado', 'Comprometimento leve/adequada'] },
    ],
  },
  bradenq_ampliada: {
    titulo: 'Escala Braden Q Ampliada',
    nomeCompleto: 'Braden Q (UTI Neo e Ped)',
    idade: '21 dias de vida a 8 anos',
    tipo: 'score',
    totalMax: 28,
    opcoes: scoreOptions1_4,
    interpreta: (score: number) => interpretarBraden(score, 'Braden Q Ampliada'),
    cores: { bg: 'bg-teal-600', hover: 'hover:bg-teal-500', text: 'text-teal-300', bgProgress: 'bg-teal-500', bgBase: 'bg-teal-700', hoverBase: 'hover:bg-teal-600' },
    itens: [
      { id: 'c1', label: '1. Mobilidade', desc: 'Grau e tipo de movimentos espontâneos (versão detalhada).', pontos: [1, 2, 3, 4], scoreDesc: ['Não faz movimentos; completamente imóvel', 'Movimentos muito limitados; raramente muda de posição', 'Muda de posição ocasionalmente; pouca amplitude', 'Muda de posição frequentemente e de forma completa'] },
      { id: 'c2', label: '2. Atividade', desc: 'Nível de atividade física.', pontos: [1, 2, 3], scoreDesc: ['Acamado; não realiza mobilidade ativa', 'Restrito à cadeira; não deambula', 'Move-se no leito, engatinha ou senta sozinho'] }, 
      { id: 'c3', label: '3. Percepção Sensorial', desc: 'Capacidade de responder a estímulos.', pontos: [1, 2, 3, 4], scoreDesc: ['Não responde a estímulos desconfortáveis ou dolorosos', 'Responde apenas à dor; resposta lenta ou inconsistente', 'Responde à fala, orientado porém confuso ou desorientado', 'Orientado e responde adequadamente a estímulos'] },
      { id: 'c4', label: '4. Umidade', desc: 'Grau de exposição da pele à umidade.', pontos: [1, 2, 3, 4], scoreDesc: ['Pele constantemente úmida; fraldas ou suor persistente', 'Muito úmida; necessita trocas', 'Ocasionalmente úmida; umidade intermitente', 'Raramente úmida; pele seca e íntegra'] },
      { id: 'c5', label: '5. Fricção/Cisalhamento', desc: 'Risco de dano na pele devido a fricção.', pontos: [1, 2, 3], scoreDesc: ['Problema evidente; exige reposicionamento frequente', 'Problema potencial; movimenta-se mas desliza no leito', 'Sem problema aparente; movimenta-se sem deslizar'] },
      { id: 'c6', label: '6. Nutrição', desc: 'Padrão habitual de ingestão alimentar.', pontos: [1, 2, 3, 4], scoreDesc: ['Ingestão muito pobre; recusa alimentar persistente', 'Provavelmente inadequada; ingestão parcial das refeições', 'Adequada; cumpre mais de 50% das necessidades', 'Excelente; ingere refeições completas e suplementação'] },
      { id: 'c7', label: '7. Perfusão/Oxigenação', desc: 'Avaliação da perfusão/oxigenação.', pontos: [1, 2, 3], scoreDesc: ['Má perfusão e má oxigenação; extremidades frias, palidez', 'Comprometimento moderado da perfusão/oxigenação; sinais mínimos adequados', 'Perfusão e oxigenação adequada'] },
    ],
  },
};

const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const BradenQuestionCard = ({ item, valor, onChange }: any) => {
  const isSelected = valor !== undefined && valor !== null && valor !== '';
  
  const availableOptions = item.pontos.map((p: number, index: number) => ({ 
      valor: p, 
      texto: `${p} - ${item.scoreDesc[index]}`,
    }));

  return (
    <div 
      id={item.id} 
      className={`p-4 rounded-xl shadow-md mb-3 transition-all duration-300
      ${isSelected 
        ? 'bg-indigo-900/30 border border-indigo-600' 
        : 'bg-slate-800 border border-slate-700 hover:border-slate-600'}
    `}>
      <div className="mb-4 flex justify-between items-start">
        <div>
          <label className="block text-base font-bold text-gray-100">{item.label}</label>
          <p className="text-sm text-gray-400 mt-1">{item.desc}</p> 
        </div>
        {isSelected && <CheckIcon />}
      </div>
      
      <div className="relative">
        <select
          value={valor === undefined || valor === null ? '' : valor}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full bg-slate-900 border border-slate-700 text-gray-100 p-3 pr-12 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        >
          <option value="" disabled>
            Selecione: 1 a {item.pontos.length}
          </option>
          {availableOptions.map((opt: any) => (
            <option key={opt.texto} value={opt.valor}>
              {opt.texto}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

interface BradenCalculatorProps {
  patientId: string;
  onClose: () => void;
}

export const BradenCalculator: React.FC<BradenCalculatorProps> = ({ patientId, onClose }) => {
  const [tela, setTela] = useState('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const configAtual = escalaAtiva ? (escalasConfig as any)[escalaAtiva] : null;
  const itensRespondidos = configAtual ? Object.keys(respostas).filter(key => respostas[key] !== undefined && respostas[key] !== null).length : 0;
  const totalItens = configAtual ? configAtual.itens.length : 0;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;

  const resultadoAvaliacao = useMemo(() => {
    if (!configAtual) return null;

    const pontuacao = Object.values(respostas).reduce((acc: number, val: any) => acc + (val || 0), 0);

    if (itensRespondidos < totalItens) {
      return {
        texto: 'Avaliação em Andamento',
        detalhe: `Responda a todos os ${totalItens} itens.`,
        cor: 'text-yellow-400',
        isCompleto: false,
        pontuacao,
      };
    }

    const interpretacao = configAtual.interpreta(pontuacao as number);
    const isPositivo = interpretacao.risco.includes('Risco');

    return {
      pontuacao,
      isPositivo,
      texto: interpretacao.risco,
      detalhe: `Pontuação ${pontuacao} de ${configAtual.totalMax}.`,
      cor: interpretacao.cor,
      bg: isPositivo ? 'bg-red-500' : 'bg-green-500',
      border: isPositivo ? 'border-red-500' : 'border-green-500',
      icone: isPositivo ? '🚨' : '✅',
      isCompleto: true
    };
  }, [respostas, configAtual, itensRespondidos, totalItens]);

  const iniciarAvaliacao = (escala: string) => {
    setEscalaAtiva(escala);
    setRespostas({});
    setTela('form');
    setSaveStatus(null);
  };

  const handleResposta = (id: string, valor: number) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));
  };

  const finalizarAvaliacao = () => {
    if (resultadoAvaliacao && resultadoAvaliacao.isCompleto) {
      setTela('resultado');
    }
  };

  const saveAssessment = async () => {
    if (!resultadoAvaliacao?.isCompleto || !configAtual) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const { error } = await supabase
        .from('scale_scores')
        .insert({
          patient_id: patientId,
          scale_name: configAtual.titulo,
          score: resultadoAvaliacao.pontuacao,
          interpretation: resultadoAvaliacao.texto,
          date: new Date().toISOString(),
        });

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => {
        setTela('intro');
        setRespostas({});
        setEscalaAtiva(null);
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Tela Intro
  if (tela === 'intro') {
    return (
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <button onClick={onClose} className="flex items-center text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          Fechar
        </button>

        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Escalas de Avaliação Braden</h3>

        <div className="space-y-2">
          {Object.entries(escalasConfig).map(([key, config]: any) => (
            <button
              key={key}
              onClick={() => iniciarAvaliacao(key)}
              className="w-full text-left bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-3 rounded-lg border border-slate-300 dark:border-slate-600 transition"
            >
              <p className="font-bold text-slate-800 dark:text-slate-100">{config.titulo}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{config.idade}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tela Form
  if (tela === 'form' && configAtual) {
    const corClasses = configAtual.cores;

    return (
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setTela('intro')} className="text-gray-500 hover:text-gray-700">
            ← Voltar
          </button>
          <h3 className={`font-bold ${corClasses.text}`}>{configAtual.titulo}</h3>
          <div className="w-8"></div>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
          <div 
            className={`${corClasses.bgProgress} h-full transition-all duration-500`}
            style={{ width: `${progresso}%` }}
          />
        </div>

        <p className="text-xs text-gray-500 mb-4">{itensRespondidos} de {totalItens} respondidos</p>

        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
          {configAtual.itens.map((item: any) => (
            <BradenQuestionCard
              key={item.id}
              item={item}
              valor={respostas[item.id]}
              onChange={(val: number) => handleResposta(item.id, val)}
            />
          ))}
        </div>

        <button
          onClick={finalizarAvaliacao}
          disabled={!resultadoAvaliacao?.isCompleto}
          className={`w-full py-2 rounded-lg font-bold transition ${
            resultadoAvaliacao?.isCompleto
              ? `${corClasses.bg} ${corClasses.hover} text-white`
              : 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
          }`}
        >
          Finalizar
        </button>
      </div>
    );
  }

  // Tela Resultado
  if (tela === 'resultado' && configAtual && resultadoAvaliacao) {
    const corClasses = configAtual.cores;

    return (
      <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <button onClick={() => setTela('intro')} className="text-gray-500 hover:text-gray-700 mb-4">
          ← Voltar
        </button>

        <div className="text-center mb-4">
          <div className={`w-24 h-24 mx-auto ${corClasses.bgBase} rounded-full flex items-center justify-center shadow-lg`}>
            <span className="text-4xl font-black text-white">{resultadoAvaliacao.pontuacao}</span>
          </div>
        </div>

        <h3 className={`text-center text-xl font-bold ${resultadoAvaliacao.cor} mb-2`}>
          {resultadoAvaliacao.texto}
        </h3>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          {resultadoAvaliacao.detalhe}
        </p>

        <button
          onClick={saveAssessment}
          disabled={isSaving || saveStatus === 'success'}
          className={`w-full py-2 rounded-lg font-bold transition ${
            saveStatus === 'success'
              ? 'bg-green-600 text-white'
              : `${corClasses.bg} ${corClasses.hover} text-white`
          }`}
        >
          {isSaving ? 'Salvando...' : saveStatus === 'success' ? '✅ Salvo!' : 'Salvar Avaliação'}
        </button>

        {saveStatus === 'error' && (
          <p className="text-sm text-red-500 text-center mt-2">Erro ao salvar. Tente novamente.</p>
        )}
      </div>
    );
  }

  return null;
};
