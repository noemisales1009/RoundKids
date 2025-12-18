import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';

interface CAMICUCalculatorProps {
  patientId: string;
}

const CAM_CONFIG = {
  psCAMICU: {
    id: 'psCAMICU',
    titulo: 'psCAM-ICU',
    faixaEtaria: '6 meses a 5 anos',
    itens: [
      {
        id: 'c1',
        label: '1. Alteração aguda ou curso flutuante',
        desc: 'Mudança súbita no comportamento, atenção ou nível de consciência nas últimas 24 horas.',
        opcoes: [
          { v: true, t: 'Presente' },
          { v: false, t: 'Ausente' }
        ]
      },
      {
        id: 'c2',
        label: '2. Déficit de atenção',
        desc: 'Teste com cartões de figuras. A criança mantém a atenção em pelo menos 2 de 3 tentativas?',
        opcoes: [
          { v: true, t: 'Anormal (Falhou)' },
          { v: false, t: 'Normal (Passou)' }
        ]
      },
      {
        id: 'c3',
        label: '3. Nível de consciência alterado',
        desc: 'Estado atual: sonolento, agitado, letárgico ou estupor? (Qualquer estado diferente de "Alerta")',
        opcoes: [
          { v: true, t: 'Anormal (Alterado)' },
          { v: false, t: 'Normal (Alerta)' }
        ]
      },
      {
        id: 'c4',
        label: '4. Pensamento desorganizado',
        desc: 'Respostas incoerentes, não direcionadas ou comportamento incompatível à situação.',
        opcoes: [
          { v: true, t: 'Anormal (Presente)' },
          { v: false, t: 'Normal (Ausente)' }
        ]
      }
    ]
  },
  pCAMICU: {
    id: 'pCAMICU',
    titulo: 'pCAM-ICU',
    faixaEtaria: '≥ 5 anos (cognitivamente aptos)',
    itens: [
      {
        id: 'c1',
        label: '1. Alteração aguda ou curso flutuante',
        desc: 'Mudança no comportamento ou consciência nas últimas 24 horas.',
        opcoes: [
          { v: true, t: 'Presente' },
          { v: false, t: 'Ausente' }
        ]
      },
      {
        id: 'c2',
        label: '2. Déficit de atenção',
        desc: 'Teste ABC ou contagem de números. Identifica as letras ou números-alvo?',
        opcoes: [
          { v: true, t: 'Anormal (Falhou)' },
          { v: false, t: 'Normal (Passou)' }
        ]
      },
      {
        id: 'c3',
        label: '3. Nível de consciência alterado',
        desc: 'Estado atual: sonolento, letárgico, estupor ou hiperalerta?',
        opcoes: [
          { v: true, t: 'Anormal (Alterado)' },
          { v: false, t: 'Normal (Alerta)' }
        ]
      },
      {
        id: 'c4',
        label: '4. Pensamento desorganizado',
        desc: 'Perguntas: "Pode levantar dois dedos?", "A lua está perto de nós?"',
        opcoes: [
          { v: true, t: 'Anormal (Errou/Incoerente)' },
          { v: false, t: 'Normal (Acertou)' }
        ]
      }
    ]
  }
};

const getInterpretacao = (c1: boolean, c2: boolean, c3: boolean, c4: boolean) => {
  const positivo = c1 && c2 && (c3 || c4);

  if (positivo) {
    return {
      texto: 'Delirium POSITIVO',
      cor: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500',
      detalhe: 'Critérios diagnósticos preenchidos: Alteração aguda + Déficit de atenção + Alteração de consciência/pensamento.',
      conduta: 'Notificar equipe médica, avaliar sedação e orientar família.'
    };
  } else {
    return {
      texto: 'Delirium NEGATIVO',
      cor: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500',
      detalhe: 'Os critérios para Delirium não foram preenchidos nesta avaliação.',
      conduta: 'Manter monitoramento rotineiro (2x ao dia).'
    };
  }
};

interface ChevronLeftIconProps {
  className?: string;
}

const ChevronLeftIcon: React.FC<ChevronLeftIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

interface AlertTriangleIconProps {
  className?: string;
}

const AlertTriangleIcon: React.FC<AlertTriangleIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V5.75A.75.75 0 0110 5zm0 8a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

interface CheckCircleIconProps {
  className?: string;
}

const CheckCircleIcon: React.FC<CheckCircleIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 20 20"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
);

interface SelectDropdownProps {
  label: string;
  id: string;
  valor: boolean | null;
  onOpcaoChange: (v: boolean | null) => void;
  opcoes: { v: boolean; t: string }[];
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({ label, id, valor, onOpcaoChange, opcoes }) => (
  <div className="bg-slate-800 p-4 rounded-lg shadow-lg transition-all duration-300">
    <div className="flex justify-between items-center mb-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      {valor !== null && (
        <div className="bg-green-500/20 p-1.5 rounded-full">
          <CheckCircleIcon className="w-4 h-4 text-green-500" />
        </div>
      )}
    </div>
    <select
      id={id}
      value={valor === null ? '' : String(valor)}
      onChange={(e) => onOpcaoChange(e.target.value === '' ? null : e.target.value === 'true')}
      className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
    >
      <option value="">Selecione uma resposta...</option>
      {opcoes.map((opt, idx) => (
        <option key={idx} value={String(opt.v)}>
          {opt.t}
        </option>
      ))}
    </select>
  </div>
);

export const CAMICUCalculator: React.FC<CAMICUCalculatorProps> = ({ patientId }) => {
  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<'psCAMICU' | 'pCAMICU' | null>(null);
  const [respostas, setRespostas] = useState<{ [key: string]: boolean | null }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const configAtual = escalaAtiva ? CAM_CONFIG[escalaAtiva] : null;
  const respondidosCount = Object.values(respostas).filter(v => v !== null).length;
  const totalItens = 4;

  const interpretacao = useMemo(() => {
    if (respondidosCount < totalItens || !configAtual) return null;

    const c1 = respostas.c1 === true;
    const c2 = respostas.c2 === true;
    const c3 = respostas.c3 === true;
    const c4 = respostas.c4 === true;

    return getInterpretacao(c1, c2, c3, c4);
  }, [respostas, respondidosCount, configAtual]);

  const salvarAvaliacao = async () => {
    if (!interpretacao || isSaving) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from('scale_scores').insert({
        patient_id: patientId,
        scale_name: `CAM-ICU ${configAtual?.titulo} - ${configAtual?.faixaEtaria}`,
        score: interpretacao.texto.includes('POSITIVO') ? 1 : 0,
        interpretation: interpretacao.texto,
        date: new Date().toISOString()
      });

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus(null);
        setTela('intro');
        setEscalaAtiva(null);
        setRespostas({});
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (tela === 'intro') {
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-lg bg-slate-800 shadow-lg text-center">
          <h2 className="text-xl font-bold text-white mb-2">CAM-ICU Pediátrico</h2>
          <p className="text-sm text-gray-300 mb-4">
            Selecione a escala com base na idade do paciente
          </p>

          <div className="space-y-3">
            {Object.values(CAM_CONFIG).map((conf) => (
              <button
                key={conf.id}
                onClick={() => {
                  setEscalaAtiva(conf.id as 'psCAMICU' | 'pCAMICU');
                  setRespostas({});
                  setTela('form');
                }}
                className="w-full p-4 rounded-lg border-2 border-slate-600 hover:border-blue-500 hover:bg-blue-500/10 text-left transition-all"
              >
                <h3 className="font-bold text-white">{conf.titulo}</h3>
                <p className="text-xs text-gray-400">{conf.faixaEtaria}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-slate-700 rounded-lg text-left border border-slate-600">
            <p className="text-xs text-gray-300 font-medium">
              <span className="text-blue-400 font-bold">Regra de Interpretação:</span> O diagnóstico é confirmado se houver
              alteração aguda (1) E déficit de atenção (2), somados a alteração de consciência (3) OU pensamento desorganizado (4).
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tela === 'form' && configAtual) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => {
              setTela('intro');
              setEscalaAtiva(null);
              setRespostas({});
            }}
            className="p-2 rounded-full hover:bg-slate-700 text-gray-300 hover:text-white"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-white">{configAtual.titulo}</h2>
            <p className="text-xs text-gray-400">{respondidosCount}/{totalItens} Itens</p>
          </div>
        </div>

        <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(respondidosCount / totalItens) * 100}%` }}
          />
        </div>

        <div className="space-y-4">
          {configAtual.itens.map((item) => (
            <SelectDropdown
              key={item.id}
              label={item.label}
              id={item.id}
              valor={respostas[item.id] ?? null}
              onOpcaoChange={(v) => setRespostas(prev => ({ ...prev, [item.id]: v }))}
              opcoes={item.opcoes}
            />
          ))}
        </div>

        <button
          disabled={respondidosCount < totalItens}
          onClick={() => setTela('resultado')}
          className={`w-full py-3 rounded-lg font-bold mt-6 transition-all ${
            respondidosCount === totalItens
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Concluir Diagnóstico
        </button>
      </div>
    );
  }

  if (tela === 'resultado' && interpretacao) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTela('form')}
            className="p-2 rounded-full hover:bg-slate-700 text-gray-300 hover:text-white"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-white">Resultado da Avaliação</h2>
        </div>

        <div className={`p-8 rounded-lg border-4 ${interpretacao.border} ${interpretacao.bg} text-center`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white mb-4 border-4 shadow-lg" style={{ borderColor: interpretacao.texto.includes('POSITIVO') ? '#ef4444' : '#22c55e' }}>
            {interpretacao.texto.includes('POSITIVO') ? (
              <AlertTriangleIcon className="w-10 h-10 text-red-500" />
            ) : (
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
            )}
          </div>

          <h3 className={`text-2xl font-bold mb-2 uppercase ${interpretacao.cor}`}>
            {interpretacao.texto}
          </h3>
          <p className="text-sm text-gray-300 mb-4">{interpretacao.detalhe}</p>
          <div className="border-t border-gray-400 opacity-20 my-4" />
          <p className="text-xs text-gray-400 italic">
            <span className="font-bold">Conduta:</span> {interpretacao.conduta}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={salvarAvaliacao}
            disabled={isSaving || saveStatus === 'success'}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              saveStatus === 'success'
                ? 'bg-green-600 text-white'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Salvando...' : saveStatus === 'success' ? 'Registrado!' : saveStatus === 'error' ? 'Erro ao salvar' : 'Salvar Avaliação'}
          </button>

          <button
            onClick={() => {
              setTela('intro');
              setEscalaAtiva(null);
              setRespostas({});
            }}
            className="w-full py-3 rounded-lg border-2 border-slate-600 text-gray-300 hover:text-white hover:border-blue-500 font-bold transition-all"
          >
            Nova Avaliação
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CAMICUCalculator;
