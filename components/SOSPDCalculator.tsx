import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';

interface SOSPDProps {
  patientId: string;
}

const SOS_PD_CONFIG = {
  titulo: 'Escala SOS-PD',
  subtitulo: 'Sophia Observation Withdrawal/Delirium',
  faixaEtaria: 'UTI Neonatal e Pediátrica',
  dominios: [
    {
      id: 'agitacao',
      label: '1. Agitação',
      desc: 'Nível de movimento e agitação física.',
      opcoes: [
        { valor: 0, texto: '0 - Movimentos habituais; tranquilo' },
        { valor: 1, texto: '1 - Inquietação leve; movimentos aumentados intermitentes' },
        { valor: 2, texto: '2 - Agitação intensa; movimentos contínuos mesmo em repouso' },
      ]
    },
    {
      id: 'inconsolabilidade',
      label: '2. Inconsolabilidade',
      desc: 'Resposta a medidas de conforto e choro.',
      opcoes: [
        { valor: 0, texto: '0 - Consola facilmente' },
        { valor: 1, texto: '1 - Consola com dificuldade; choro retorna' },
        { valor: 2, texto: '2 - Inconsolável mesmo com medidas adequadas' },
      ]
    },
    {
      id: 'sono',
      label: '3. Alteração do sono',
      desc: 'Qualidade e fragmentação do sono.',
      opcoes: [
        { valor: 0, texto: '0 - Sono adequado; ciclos normais' },
        { valor: 1, texto: '1 - Sono leve/fragmentado; despertares ocasionais' },
        { valor: 2, texto: '2 - Sono muito fragmentado; acorda repetidamente' },
      ]
    },
    {
      id: 'contato_visual',
      label: '4. Alteração do contacto visual',
      desc: 'Foco e interação através do olhar.',
      opcoes: [
        { valor: 0, texto: '0 - Contacto visual normal para idade' },
        { valor: 1, texto: '1 - Contacto visual breve; evita olhar; desorganizado' },
        { valor: 2, texto: '2 - Sem contacto visual; olhar fixo ou não responsivo' },
      ]
    },
    {
      id: 'tremores',
      label: '5. Tremores / Rigidez',
      desc: 'Sinais de tensão muscular ou movimentos involuntários.',
      opcoes: [
        { valor: 0, texto: '0 - Ausente' },
        { valor: 1, texto: '1 - Tremores leves após estímulo; leve aumento de tónus' },
        { valor: 2, texto: '2 - Tremores em repouso; rigidez; espasmos; hipertonia' },
      ]
    },
    {
      id: 'autonomicos',
      label: '6. Sinais autonómicos',
      desc: 'Frequência cardíaca, suor, febre e respiração.',
      opcoes: [
        { valor: 0, texto: '0 - Ausentes' },
        { valor: 1, texto: '1 - Leves: aumento discreto de FC, sudorese leve' },
        { valor: 2, texto: '2 - Intensos: taquicardia importante, febre, sudorese marcada, taquipneia' },
      ]
    }
  ]
};

export default function SOSPDCalculator({ patientId }: SOSPDProps) {
  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const pontuacaoTotal = useMemo(() => {
    const vals = Object.values(respostas);
    return vals.reduce((acc: number, curr: number) => acc + curr, 0);
  }, [respostas]);

  const respondidosCount = Object.keys(respostas).length;
  const totalItens = SOS_PD_CONFIG.dominios.length;
  const progresso = (respondidosCount / totalItens) * 100;

  const interpretacao = useMemo(() => {
    if (respondidosCount < totalItens) return null;
    const score = pontuacaoTotal;

    if (score >= 7) {
      return {
        texto: 'Quadro Grave',
        cor: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500',
        conduta: 'Possível necessidade de intervenção farmacológica imediata.'
      };
    }
    if (score >= 4) {
      return {
        texto: 'Delirium / Abstinência Prováveis',
        cor: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500',
        conduta: 'Aplicar CAPD ou WAT-1 e avaliar clinicamente de imediato.'
      };
    }
    if (score >= 2) {
      return {
        texto: 'Sinais Leves',
        cor: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500',
        conduta: 'Investigar dor, fome, ambiente ou início de abstinência.'
      };
    }
    return {
      texto: 'Sem Sinais Relevantes',
      cor: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500',
      conduta: 'Manter monitorização rotineira.'
    };
  }, [pontuacaoTotal, respondidosCount, totalItens]);

  const handleSelecionar = (id: string, valor: number) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));
    
    const ids = SOS_PD_CONFIG.dominios.map(d => d.id);
    const currentIndex = ids.indexOf(id);
    if (currentIndex < ids.length - 1) {
      setTimeout(() => {
        const nextEl = document.getElementById(ids[currentIndex + 1]);
        if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const salvarAvaliacao = async () => {
    if (!interpretacao || isSaving) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('scale_scores')
        .insert({
          patient_id: patientId,
          scale_name: 'SOS-PD (Sophia Observation Withdrawal/Delirium)',
          score: pontuacaoTotal,
          interpretation: interpretacao.texto,
          date: new Date().toISOString()
        });
      
      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus(null);
        setTela('intro');
        setRespostas({});
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {tela === 'intro' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="p-8 rounded-2xl border border-slate-700 bg-slate-800 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{SOS_PD_CONFIG.titulo}</h2>
              <p className="text-xs text-slate-400 uppercase font-bold">{SOS_PD_CONFIG.subtitulo}</p>
              <p className="text-sm text-slate-400 mt-2">{SOS_PD_CONFIG.faixaEtaria}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 text-[12px] text-slate-400 space-y-2">
              <p className="font-bold text-blue-400">ℹ️ Informação Clínica:</p>
              <p>"SOS-PD ≥ 4 sugere delirium ou abstinência e requer avaliação clínica imediata."</p>
            </div>

            <button
              onClick={() => {
                setRespostas({});
                setTela('form');
              }}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
            >
              Começar Exame
            </button>
          </div>
        </div>
      )}

      {tela === 'form' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase">{SOS_PD_CONFIG.titulo}</span>
              <p className="text-xs text-slate-400 mt-1">{respondidosCount}/{totalItens} Itens</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Score:</span>
              <span className="text-3xl font-bold text-blue-400">{pontuacaoTotal}</span>
            </div>
          </div>
          
          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progresso}%` }} />
          </div>

          {SOS_PD_CONFIG.dominios.map((d) => (
            <SelectDropdown
              key={d.id}
              id={d.id}
              label={d.label}
              desc={d.desc}
              opcoes={d.opcoes}
              valor={respostas[d.id]}
              onSelect={(v) => handleSelecionar(d.id, v)}
            />
          ))}

          <button
            disabled={respondidosCount < totalItens}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTela('resultado');
            }}
            className={`w-full py-4 rounded-lg font-bold transition-all mt-6
              ${respondidosCount === totalItens
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
          >
            Ver Diagnóstico
          </button>
        </div>
      )}

      {tela === 'resultado' && interpretacao && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className={`p-8 rounded-2xl border-2 ${interpretacao.border} ${interpretacao.bg} text-center space-y-4`}>
            <div className={`text-4xl font-bold ${interpretacao.cor}`}>
              {pontuacaoTotal}/12
            </div>
            <div className={`text-2xl font-bold ${interpretacao.cor}`}>
              {interpretacao.texto}
            </div>
            <p className="text-sm text-slate-300">{interpretacao.conduta}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={salvarAvaliacao}
              disabled={isSaving || saveStatus === 'success'}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {isSaving ? 'Salvando...' : saveStatus === 'success' ? 'Registrado!' : 'Salvar no Histórico'}
            </button>
            <button
              onClick={() => {
                setTela('intro');
                setRespostas({});
              }}
              className="w-full py-4 border-2 border-slate-700 text-slate-300 font-bold rounded-lg hover:border-slate-600 transition-all"
            >
              Novo Exame
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectDropdown({ id, label, desc, opcoes, valor, onSelect }: any) {
  const isSelected = valor !== undefined;

  return (
    <div
      id={id}
      className={`p-5 rounded-lg border border-slate-700 bg-slate-800/50 space-y-3 transition-all ${isSelected ? 'border-green-500' : ''}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="font-bold text-white text-sm">{label}</h3>
          <p className="text-xs text-slate-400 mt-2">{desc}</p>
        </div>
        {isSelected && <div className="text-green-400 text-sm font-bold">✓</div>}
      </div>
      
      <div className="relative">
        <select
          value={valor ?? ''}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="w-full p-3 rounded text-sm font-medium bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none pr-10"
        >
          <option value="">Selecione...</option>
          {opcoes.map((opt: any) => (
            <option key={`${id}-${opt.valor}`} value={opt.valor}>
              {opt.texto}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">▼</div>
      </div>
    </div>
  );
}
