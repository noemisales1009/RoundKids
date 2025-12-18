import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';

interface VNICNAFCalculatorProps {
  patientId: string;
}

const VNICNAF_CONFIG = {
  titulo: 'Escore de Resposta a VNI/CNAF',
  nomeCompleto: 'Avaliação de Resposta à Ventilação Não Invasiva e CNAF em Pediatria',
  totalMax: 14,
  itens: [
    { 
      id: 'fr', 
      label: '1. Frequência Respiratória (FR)', 
      desc: 'Redução > 20% (0) | Redução < 20% persistente (1) | Sem mudança ou aumento (2)',
      opcoes: [
        { valor: 0, texto: '0 - Redução > 20%' },
        { valor: 1, texto: '1 - Redução < 20% persistente' },
        { valor: 2, texto: '2 - Sem mudança ou aumento' }
      ]
    },
    { 
      id: 'musculatura', 
      label: '2. Uso de Musculatura Acessória', 
      desc: 'Reduzido (0) | Persistente (1) | Aumenta ou permanece intenso (2)',
      opcoes: [
        { valor: 0, texto: '0 - Reduzido' },
        { valor: 1, texto: '1 - Persistente' },
        { valor: 2, texto: '2 - Aumenta ou permanece intenso' }
      ]
    },
    { 
      id: 'consciencia', 
      label: '3. Nível de Consciência', 
      desc: 'Alerta, melhora clínica (0) | Mantém irritabilidade leve (1) | Sonolência, rebaixamento (2)',
      opcoes: [
        { valor: 0, texto: '0 - Alerta, melhora clínica' },
        { valor: 1, texto: '1 - Mantém irritabilidade leve' },
        { valor: 2, texto: '2 - Sonolência, rebaixamento, letargia' }
      ]
    },
    { 
      id: 'saturacao', 
      label: '4. Saturação com VNI', 
      desc: '≥ 94% com FiO2 ≤ 40% (0) | 90-93% com FiO2 ≤ 50% (1) | < 90% com FiO2 ≤ 60% (2)',
      opcoes: [
        { valor: 0, texto: '0 - ≥ 94% com FiO2 ≤ 40%' },
        { valor: 1, texto: '1 - 90-93% com FiO2 ≤ 50%' },
        { valor: 2, texto: '2 - < 90% com FiO2 ≤ 60%' }
      ]
    },
    { 
      id: 'gasometria', 
      label: '5. Gasometria Arterial (se disponível)', 
      desc: 'pH > 7,3, PaCO2 < ou estável (0) | pH 7,25-7,3 (1) | pH < 7,25 (2)',
      opcoes: [
        { valor: 0, texto: '0 - pH > 7,3, PaCO2 < ou estável' },
        { valor: 1, texto: '1 - pH 7,25 a 7,3, PaCO2 > ou leve' },
        { valor: 2, texto: '2 - pH < 7,25, PaCO2 alta progressivamente' }
      ]
    },
    { 
      id: 'conforto', 
      label: '6. Conforto Respiratório', 
      desc: 'Confortável (0) | Leve desconforto (1) | Piora do desconforto (2)',
      opcoes: [
        { valor: 0, texto: '0 - Confortável' },
        { valor: 1, texto: '1 - Leve desconforto persistente' },
        { valor: 2, texto: '2 - Piora do desconforto' }
      ]
    },
    { 
      id: 'ausculta', 
      label: '7. Ausculta Pulmonar', 
      desc: 'Melhora de entrada de ar (0) | Sem mudança (1) | Redução acentuada (2)',
      opcoes: [
        { valor: 0, texto: '0 - Melhora de entrada de ar' },
        { valor: 1, texto: '1 - Sem mudança significativa' },
        { valor: 2, texto: '2 - Redução acentuada, sinais de esgotamento' }
      ]
    },
  ]
};

export default function VNICNAFCalculator({ patientId }: VNICNAFCalculatorProps) {
  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const pontuacaoTotal = useMemo(() => {
    const vals = Object.values(respostas);
    return vals.reduce((acc: number, curr: number) => acc + curr, 0);
  }, [respostas]);

  const respondidosCount = Object.keys(respostas).length;
  const totalItens = VNICNAF_CONFIG.itens.length;
  const progresso = (respondidosCount / totalItens) * 100;

  const interpretacao = useMemo(() => {
    if (respondidosCount < totalItens) return null;
    const score = pontuacaoTotal;

    if (score >= 0 && score <= 4) {
      return {
        texto: 'Boa Resposta à VNI',
        cor: 'text-green-500',
        bg: 'bg-green-500/10',
        border: 'border-green-500',
        indicacao: 'Manter estratégia atual e monitorar.'
      };
    } else if (score >= 5 && score <= 8) {
      return {
        texto: 'Resposta Parcial / Vigilância',
        cor: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500',
        indicacao: 'Vigilância intensa, reavaliar parâmetros da VNI, considerar ajustes (IPAP, EPAP, FiO², Interface).'
      };
    } else {
      return {
        texto: 'Sinais de Falência',
        cor: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500',
        indicacao: 'Sinais de falência, indicação de possível IOT, RNC, Hipoxemia refratária, Hipercapnia progressiva.'
      };
    }
  }, [pontuacaoTotal, respondidosCount]);

  const handleSelecionar = (id: string, valor: number) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));
    
    const ids = VNICNAF_CONFIG.itens.map(d => d.id);
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
          scale_name: VNICNAF_CONFIG.titulo,
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
              <h2 className="text-2xl font-bold text-white mb-2">{VNICNAF_CONFIG.titulo}</h2>
              <p className="text-sm text-slate-400">{VNICNAF_CONFIG.nomeCompleto}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 text-[12px] text-slate-400 space-y-3">
              <div className="font-bold text-green-400 mb-2">Interpretação:</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-green-400">0-4 pontos</span>
                  <span>Boa resposta à VNI</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-yellow-400">5-8 pontos</span>
                  <span>Resposta parcial, vigilância</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-red-400">9-14 pontos</span>
                  <span>Sinais de falência, IOT indicada</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setRespostas({});
                setTela('form');
              }}
              className="w-full py-4 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition-all"
            >
              Iniciar Avaliação VNI/CNAF
            </button>
          </div>
        </div>
      )}

      {tela === 'form' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase">{VNICNAF_CONFIG.titulo}</span>
              <p className="text-xs text-slate-400 mt-1">{respondidosCount}/{totalItens} Itens</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Score:</span>
              <span className="text-3xl font-bold text-cyan-400">{pontuacaoTotal}</span>
            </div>
          </div>
          
          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${progresso}%` }} />
          </div>

          {VNICNAF_CONFIG.itens.map((d) => (
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
                ? 'bg-cyan-600 text-white hover:bg-cyan-700 active:scale-95'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
          >
            Ver Resultado
          </button>
        </div>
      )}

      {tela === 'resultado' && interpretacao && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className={`p-8 rounded-2xl border-2 ${interpretacao.border} ${interpretacao.bg} text-center space-y-4`}>
            <div className={`text-5xl font-bold ${interpretacao.cor}`}>
              {pontuacaoTotal}/{VNICNAF_CONFIG.totalMax}
            </div>
            <div className={`text-2xl font-bold ${interpretacao.cor}`}>
              {interpretacao.texto}
            </div>
            <div className="pt-4 border-t border-slate-600 text-sm text-slate-300">
              <p className="font-semibold mb-2">Indicação Clínica:</p>
              <p>{interpretacao.indicacao}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={salvarAvaliacao}
              disabled={isSaving || saveStatus === 'success'}
              className="w-full py-4 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-all"
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
              Nova Avaliação
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
          className="w-full p-3 rounded text-sm font-medium bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none pr-10"
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
