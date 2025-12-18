import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';

interface ConsciousnessCalculatorProps {
  patientId: string;
}

type EscalaConscienceKey = 'crsr' | 'four' | 'jfk';

const CONSCIENCIA_CONFIG = {
  crsr: {
    id: 'crsr',
    titulo: 'CRS-R',
    nomeCompleto: 'Coma Recovery Scale – Revised',
    totalMax: 23,
    dominios: [
      { id: 'audicao', label: 'Domínio 1 – Audição / Função Verbal', opcoes: [{v:4, t:'4 – Comunicação funcional (> 90%)'}, {v:3, t:'3 – Comunicação não-funcional'}, {v:2, t:'2 – Segue comandos simples'}, {v:1, t:'1 – Resposta ao som localizada'}, {v:0, t:'0 – Resposta não localizada / Nenhuma'}] },
      { id: 'comunicacao', label: 'Domínio 2 – Comunicação', opcoes: [{v:2, t:'2 – Comunicação funcional consistente'}, {v:1, t:'1 – Comunicação não funcional, intencional'}, {v:0, t:'0 – Sem comunicação'}] },
      { id: 'visao', label: 'Domínio 3 – Visão', opcoes: [{v:5, t:'5 – Reconhecimento de objeto'}, {v:4, t:'4 – Fixação sustentada'}, {v:3, t:'3 – Rastreamento visual'}, {v:2, t:'2 – Olhar para alvo em movimento'}, {v:1, t:'1 – Olhar não sustentado'}, {v:0, t:'0 – Nenhuma resposta visual'}] },
      { id: 'motora', label: 'Domínio 4 – Função Motora', opcoes: [{v:6, t:'6 – Utilização funcional de objetos'}, {v:5, t:'5 – Ação motora intencional'}, {v:4, t:'4 – Localiza estímulo doloroso'}, {v:3, t:'3 – Retira ao estímulo doloroso'}, {v:2, t:'2 – Movimentos não-específicos'}, {v:1, t:'1 – Tônus aument. sem movimento'}, {v:0, t:'0 – Nenhuma resposta motora'}] },
      { id: 'oromotora', label: 'Domínio 5 – Função Oro-Motora/Verbal', opcoes: [{v:3, t:'3 – Vocalização ou fala inteligível'}, {v:2, t:'2 – Vocalização não-inteligível'}, {v:1, t:'1 – Movimentos orais espontâneos'}, {v:0, t:'0 – Nenhuma resposta oro-motora'}] },
      { id: 'arousal', label: 'Domínio 6 – Arousal (Estado de alerta)', opcoes: [{v:3, t:'3 – Excitação alta (hiperalerta)'}, {v:2, t:'2 – Alerta moderado'}, {v:1, t:'1 – Alerta baixo/responde estímulo'}, {v:0, t:'0 – Sem sinais de alerta'}] },
    ]
  },
  four: {
    id: 'four',
    titulo: 'FOUR Score',
    nomeCompleto: 'Full Outline of Unresponsiveness',
    totalMax: 16,
    dominios: [
      { id: 'olhos', label: '📌 1 – OLHOS (E)', opcoes: [{v:4, t:'4 – Pisca aos comandos'}, {v:3, t:'3 – Acompanha com os olhos'}, {v:2, t:'2 – Abre os olhos espontânea'}, {v:1, t:'1 – Abre apenas à dor'}, {v:0, t:'0 – Não abre os olhos'}] },
      { id: 'motora', label: '📌 2 – RESPOSTA MOTORA (M)', opcoes: [{v:4, t:'4 – Obedece comandos'}, {v:3, t:'3 – Localiza estímulo doloroso'}, {v:2, t:'2 – Retira ao estímulo doloroso'}, {v:1, t:'1 – Flexão anormal / extensão'}, {v:0, t:'0 – Nenhuma resposta motora'}] },
      { id: 'tronco', label: '📌 3 – REFLEXOS DO TRONCO (B)', opcoes: [{v:4, t:'4 – Pupilas e corneanos presentes'}, {v:3, t:'3 – Um dos reflexos ausente'}, {v:2, t:'2 – Pupilas e corneano ausentes'}, {v:1, t:'1 – Reflexo de tosse ausente (IT)'}, {v:0, t:'0 – Nenhum reflexo de tronco'}] },
      { id: 'respiracao', label: '📌 4 – RESPIRAÇÃO (R)', opcoes: [{v:4, t:'4 – Respira espontânea, regular'}, {v:3, t:'3 – Respiração tipo Cheyne–Stokes'}, {v:2, t:'2 – Respiração irregular/inadequada'}, {v:1, t:'1 – Ausente (totalmente ventilador)'}, {v:0, t:'0 – Apneia / Sem drive'}] },
    ]
  },
  jfk: {
    id: 'jfk',
    titulo: 'JFK Emergence',
    nomeCompleto: 'JFK Emergence Scale',
    totalMax: 28,
    dominios: [
      { id: 'arousal', label: '📌 1. Arousal (Estado de Alerta)', opcoes: [{v:4, t:'4 – Alerta sustentado/responsivo'}, {v:3, t:'3 – Alerta intermitente'}, {v:2, t:'2 – Acorda com estímulo'}, {v:1, t:'1 – Estímulo intenso'}, {v:0, t:'0 – Não desperta'}] },
      { id: 'audicao', label: '📌 2. Audição / Compreensão', opcoes: [{v:4, t:'4 – Comandos consistentes'}, {v:3, t:'3 – Comandos inconsistentes'}, {v:2, t:'2 – Localiza som'}, {v:1, t:'1 – Reage sem localização'}, {v:0, t:'0 – Nenhuma resposta'}] },
      { id: 'visao', label: '📌 3. Visão', opcoes: [{v:4, t:'4 – Reconhece pessoas/objetos'}, {v:3, t:'3 – Rastreamento consistente'}, {v:2, t:'2 – Rastreamento intermitente'}, {v:1, t:'1 – Fixação breve'}, {v:0, t:'0 – Nenhuma resposta'}] },
      { id: 'comunicacao', label: '📌 4. Comunicação', opcoes: [{v:4, t:'4 – Funcional (SIM/NÃO correta)'}, {v:3, t:'3 – Não funcional intencional'}, {v:2, t:'2 – Vocalizações intencionais'}, {v:1, t:'1 – Sons não intencionais'}, {v:0, t:'0 – Ausência'}] },
      { id: 'motricidade', label: '📌 5. Motricidade Global', opcoes: [{v:4, t:'4 – Funcional (uso de objeto)'}, {v:3, t:'3 – Movimentos dirigidos'}, {v:2, t:'2 – Localiza dor'}, {v:1, t:'1 – Retira à dor'}, {v:0, t:'0 – Reflexos ou ausentes'}] },
      { id: 'oral', label: '📌 6. Função Oral / Fala', opcoes: [{v:4, t:'4 – Fala compreensível'}, {v:3, t:'3 – Vocalização inteligível'}, {v:2, t:'2 – Vocalizações não inteligíveis'}, {v:1, t:'1 – Movimentos orais espontâneos'}, {v:0, t:'0 – Ausente'}] },
      { id: 'social', label: '📌 7. Comportamento Social', opcoes: [{v:4, t:'4 – Interação consistente'}, {v:3, t:'3 – Respostas inconsistentes'}, {v:2, t:'2 – Expressão afetiva intencional'}, {v:1, t:'1 – Respostas reflexas'}, {v:0, t:'0 – Ausência de interação'}] },
    ]
  }
};

export default function ConsciousnessCalculator({ patientId }: ConsciousnessCalculatorProps) {
  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<EscalaConscienceKey>('crsr');
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const configAtual = CONSCIENCIA_CONFIG[escalaAtiva];

  const pontuacaoTotal = useMemo(() => {
    const vals = Object.values(respostas);
    return vals.reduce((acc: number, curr: number) => acc + curr, 0);
  }, [respostas]);

  const respondidosCount = Object.keys(respostas).length;
  const totalItens = configAtual.dominios.length;
  const progresso = (respondidosCount / totalItens) * 100;

  const interpretacao = useMemo(() => {
    if (respondidosCount < totalItens) return null;
    const score = pontuacaoTotal;

    if (escalaAtiva === 'four') {
      if (score >= 12) return { texto: 'Função Preservada / Moderada', cor: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500' };
      if (score >= 8) return { texto: 'Lesão Neurológica Moderada', cor: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500' };
      if (score >= 4) return { texto: 'Lesão Neurológica Grave', cor: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500' };
      return { texto: 'Alto Risco / Comprometimento Extremo', cor: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' };
    } 
    
    if (escalaAtiva === 'crsr') {
      return { texto: 'Interpretação CRS-R', cor: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500', note: 'Quanto maior a pontuação, maior o nível de consciência.' };
    }

    if (escalaAtiva === 'jfk') {
      if (score > 24) return { texto: 'Consciência Consistente', cor: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500' };
      if (score > 18) return { texto: 'Consciência Funcional Parcial', cor: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' };
      if (score >= 9) return { texto: 'Estado Minimamente Consciente', cor: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500' };
      return { texto: 'Estado Vegetativo / Ausência de Consciência', cor: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' };
    }

    return null;
  }, [pontuacaoTotal, respondidosCount, escalaAtiva]);

  const handleSelecionar = (id: string, valor: number) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));
    
    const ids = configAtual.dominios.map(d => d.id);
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
          scale_name: `${configAtual.titulo} (${configAtual.nomeCompleto})`,
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
              <h2 className="text-2xl font-bold text-white mb-2">Avaliação de Consciência</h2>
              <p className="text-sm text-slate-400">Selecione a escala desejada:</p>
            </div>

            <div className="space-y-3">
              {Object.values(CONSCIENCIA_CONFIG).map(conf => (
                <button
                  key={conf.id}
                  onClick={() => {
                    setEscalaAtiva(conf.id as EscalaConscienceKey);
                    setRespostas({});
                    setTela('form');
                  }}
                  className="w-full p-4 rounded-lg border-2 border-slate-700 bg-slate-900/50 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left"
                >
                  <h3 className="font-bold text-white">{conf.titulo}</h3>
                  <p className="text-xs text-slate-400 mt-1">{conf.nomeCompleto}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tela === 'form' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase">{configAtual.titulo}</span>
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

          {configAtual.dominios.map((d) => (
            <SelectDropdown
              key={d.id}
              id={d.id}
              label={d.label}
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
            Ver Resultado
          </button>
        </div>
      )}

      {tela === 'resultado' && interpretacao && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className={`p-8 rounded-2xl border-2 ${interpretacao.border} ${interpretacao.bg} text-center space-y-4`}>
            <div className={`text-5xl font-bold ${interpretacao.cor}`}>
              {pontuacaoTotal}/{configAtual.totalMax}
            </div>
            <div className={`text-2xl font-bold ${interpretacao.cor}`}>
              {interpretacao.texto}
            </div>
            {interpretacao.note && <p className="text-sm text-slate-300">{interpretacao.note}</p>}
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
              Nova Avaliação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectDropdown({ id, label, opcoes, valor, onSelect }: any) {
  const isSelected = valor !== undefined;

  return (
    <div
      id={id}
      className={`p-5 rounded-lg border border-slate-700 bg-slate-800/50 space-y-3 transition-all ${isSelected ? 'border-green-500' : ''}`}
    >
      <div className="flex justify-between items-start gap-3">
        <h3 className="font-bold text-white text-sm">{label}</h3>
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
            <option key={`${id}-${opt.v}`} value={opt.v}>
              {opt.t}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">▼</div>
      </div>
    </div>
  );
}
