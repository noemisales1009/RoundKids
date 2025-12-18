import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeftIcon } from './icons';

const escalasConfig = {
  flacc: {
    titulo: 'Escala FLACC',
    nomeCompleto: 'Face, Legs, Activity, Cry, Consolability',
    idade: '0 a 7 anos',
    maxScore: 10,
    cores: { bg: 'bg-green-600', hover: 'hover:bg-green-500', text: 'text-green-300', bgProgress: 'bg-green-500', bgBase: 'bg-green-700', hoverBase: 'hover:bg-green-600' },
    dominios: [
      { id: 'face', label: 'Face', maxScore: 2, ranges: ['Relaxada', 'Leve careta', 'Careta intensa'] },
      { id: 'legs', label: 'Pernas', maxScore: 2, ranges: ['Relaxadas', 'Leve tensão', 'Rigidez/chutes'] },
      { id: 'activity', label: 'Atividade', maxScore: 2, ranges: ['Normal', 'Inquieta', 'Rigidez/arqueamento'] },
      { id: 'cry', label: 'Choro', maxScore: 2, ranges: ['Sem choro', 'Gemido leve', 'Choro intenso'] },
      { id: 'consolability', label: 'Consolabilidade', maxScore: 2, ranges: ['Consola fácil', 'Consola com dificuldade', 'Inconsolável'] },
    ],
    interpreta: (score: number) => {
      if (score >= 7) return { texto: 'Dor Intensa', cor: 'text-red-600', bg: 'bg-red-800', isPositivo: true };
      if (score >= 4) return { texto: 'Dor Moderada', cor: 'text-orange-400', bg: 'bg-orange-500', isPositivo: true };
      if (score >= 1) return { texto: 'Dor Leve', cor: 'text-yellow-400', bg: 'bg-yellow-500', isPositivo: true };
      return { texto: 'Sem Dor', cor: 'text-green-400', bg: 'bg-green-500', isPositivo: false };
    }
  },
  flacc_r: {
    titulo: 'Escala FLACC-R (Revisada)',
    nomeCompleto: 'FLACC Revised - Não Verbal',
    idade: 'Pacientes intubados',
    maxScore: 10,
    cores: { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-500', text: 'text-indigo-300', bgProgress: 'bg-indigo-500', bgBase: 'bg-indigo-700', hoverBase: 'hover:bg-indigo-600' },
    dominios: [
      { id: 'face', label: 'Face', maxScore: 2, ranges: ['Relaxada', 'Incômodo ocasional', 'Careta intensa'] },
      { id: 'legs', label: 'Pernas', maxScore: 2, ranges: ['Relaxadas', 'Leve tensão', 'Rigidez/espasmos'] },
      { id: 'activity', label: 'Atividade', maxScore: 2, ranges: ['Normal', 'Inquietação leve', 'Rigidez generalizada'] },
      { id: 'cry', label: 'Vocalização', maxScore: 2, ranges: ['Normal', 'Gemido leve', 'Choro/grito'] },
      { id: 'consolability', label: 'Consolabilidade', maxScore: 2, ranges: ['Fácil', 'Parcial', 'Impossível'] },
    ],
    interpreta: (score: number) => {
      if (score >= 7) return { texto: 'Dor Intensa', cor: 'text-red-600', bg: 'bg-red-800', isPositivo: true };
      if (score >= 4) return { texto: 'Dor Moderada', cor: 'text-orange-400', bg: 'bg-orange-500', isPositivo: true };
      if (score >= 1) return { texto: 'Dor Leve', cor: 'text-yellow-400', bg: 'bg-yellow-500', isPositivo: true };
      return { texto: 'Sem Dor', cor: 'text-green-400', bg: 'bg-green-500', isPositivo: false };
    }
  }
};

const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const FLACCQuestionCard = ({ item, valor, onChange }: any) => {
  const isSelected = valor !== undefined && valor !== null && valor !== '';

  return (
    <div 
      id={item.id} 
      className={`p-4 rounded-xl shadow-md mb-3 transition-all duration-300 ${
        isSelected 
          ? 'bg-red-900/30 border border-red-600' 
          : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="mb-4 flex justify-between items-start">
        <div>
          <label className="block text-base font-bold text-gray-100">{item.label}</label>
          <p className="text-sm text-gray-400 mt-1">Pontuação: 0 a {item.maxScore}</p> 
        </div>
        {isSelected && <CheckIcon />}
      </div>
      
      <div className="relative">
        <select
          value={valor === undefined || valor === null ? '' : valor}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full bg-slate-900 border border-slate-700 text-gray-100 p-3 pr-12 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        >
          <option value="" disabled>
            Selecione a pontuação...
          </option>
          {item.ranges.map((desc: string, index: number) => (
            <option key={index} value={index}>
              {index} - {desc}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

interface FLACCCalculatorProps {
  patientId: string;
  onClose: () => void;
}

export const FLACCCalculator: React.FC<FLACCCalculatorProps> = ({ patientId, onClose }) => {
  const [tela, setTela] = useState('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const configAtual = escalaAtiva ? (escalasConfig as any)[escalaAtiva] : null;
  const totalItens = configAtual ? configAtual.dominios.length : 0;
  const itensRespondidos = configAtual ? Object.keys(respostas).filter(key => respostas[key] !== undefined && respostas[key] !== null).length : 0;
  const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;

  const pontuacaoTotal = useMemo(() => {
    return Object.values(respostas).reduce((acc: number, val: any) => acc + (val || 0), 0);
  }, [respostas]);

  const resultadoAvaliacao = useMemo(() => {
    if (!configAtual) return null;

    if (itensRespondidos < totalItens) {
      return {
        texto: 'Avaliação em Andamento',
        detalhe: `Responda a todos os ${totalItens} itens.`,
        cor: 'text-yellow-400',
        isCompleto: false,
        pontuacao: pontuacaoTotal,
      };
    }

    const interpretacao = configAtual.interpreta(pontuacaoTotal);

    return {
      pontuacao: pontuacaoTotal,
      isPositivo: interpretacao.isPositivo,
      texto: interpretacao.texto,
      detalhe: `Pontuação ${pontuacaoTotal} de ${configAtual.maxScore}.`,
      cor: interpretacao.cor,
      bg: interpretacao.bg,
      isCompleto: true
    };
  }, [respostas, configAtual, itensRespondidos, totalItens, pontuacaoTotal]);

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

        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Escalas de Dor FLACC</h3>

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

        <p className="text-xs text-gray-500 mb-4">{itensRespondidos} de {totalItens} respondidos • Pontos: {pontuacaoTotal}</p>

        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
          {configAtual.dominios.map((item: any) => (
            <FLACCQuestionCard
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
