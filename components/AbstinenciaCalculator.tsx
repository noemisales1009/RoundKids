import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeftIcon } from './icons';

// ==========================================
// 📋 CONFIGURAÇÃO DAS ESCALAS (FINNEGAN & WAT-1)
// ==========================================

const ABSTINENCIA_CONFIG = {
  finnegan: {
    id: 'finnegan',
    titulo: 'Escala Finnegan (NAS)',
    subtitulo: 'Neonatal Abstinence Score',
    faixaEtaria: 'Neonatos (até 6 semanas)',
    dominios: [
      { id: 'choro', label: '1. Choro', opcoes: [{v:0, t:'Normal'}, {v:1, t:'Mais frequente'}, {v:2, t:'Difícil consolo'}, {v:3, t:'Agudo e persistente'}] },
      { id: 'sono', label: '2. Sono pós-alimentação', opcoes: [{v:0, t:'> 3h'}, {v:1, t:'2–3h'}, {v:2, t:'1–2h'}, {v:3, t:'< 1h'}] },
      { id: 'moro', label: '3. Reflexo de Moro', opcoes: [{v:0, t:'Normal'}, {v:1, t:'Levemente exaltado'}, {v:2, t:'Moderado'}] },
      { id: 'tremores', label: '4. Tremores', opcoes: [{v:0, t:'Ausente'}, {v:1, t:'Finos após estímulo'}, {v:2, t:'Finos em repouso'}, {v:3, t:'Grosseiros (com/sem estímulo)'}] },
      { id: 'tonus', label: '5. Tônus Muscular', opcoes: [{v:0, t:'Normal'}, {v:1, t:'Levemente aumentado'}, {v:2, t:'Moderadamente aumentado'}] },
      { id: 'mioclonias', label: '6. Mioclonias', opcoes: [{v:0, t:'Ausente'}, {v:1, t:'Leve'}, {v:2, t:'Moderada'}, {v:3, t:'Frequente'}] },
      { id: 'convulsoes', label: '7. Convulsões', opcoes: [{v:0, t:'Ausente'}, {v:5, t:'Presença de Convulsão'}] },
      { id: 'sudorese', label: '8. Sudorese', opcoes: [{v:0, t:'Ausente'}, {v:1, t:'Presente'}] },
      { id: 'febre', label: '9. Febre', opcoes: [{v:0, t:'Normal'}, {v:1, t:'Leve'}, {v:2, t:'Moderada'}] },
      { id: 'espirros', label: '10. Espirros / Bocejos', opcoes: [{v:0, t:'Normal'}, {v:1, t:'Leve aumento'}, {v:2, t:'Repetitivos'}] },
      { id: 'respiracao', label: '11. Respiração', opcoes: [{v:0, t:'Normal'}, {v:1, t:'FR > 60 sem retração'}, {v:2, t:'FR > 60 com retração'}] },
      { id: 'succao', label: '12. Sucção', opcoes: [{v:0, t:'Normal'}, {v:1, t:'Vigorosa'}, {v:2, t:'Desorganizada'}] },
      { id: 'alimentacao', label: '13. Alimentação', opcoes: [{v:0, t:'Boa'}, {v:1, t:'Dificuldade leve'}, {v:2, t:'Dificuldade moderada'}] },
      { id: 'vomitos', label: '14. Vômitos', opcoes: [{v:0, t:'Ausente'}, {v:1, t:'Regurgitações / Frequentes'}, {v:2, t:'Em jato'}] },
      { id: 'fezes', label: '15. Fezes', opcoes: [{v:0, t:'Normais'}, {v:1, t:'Amolecidas'}, {v:2, t:'Líquidas'}, {v:3, t:'Líquidas + dermatite'}] },
    ]
  },
  wat1: {
    id: 'wat1',
    titulo: 'Escala WAT-1',
    subtitulo: 'Withdrawal Assessment Tool-1',
    faixaEtaria: '0 a 21 anos',
    dominios: [
      { id: 'choro', label: '1. Choro / Irritabilidade', opcoes: [{v:0, t:'0 - Calmo / consola fácil'}, {v:1, t:'1 - Choro leve / esforço'}, {v:2, t:'2 - Intenso / inconsolável'}] },
      { id: 'facial', label: '2. Expressão Facial', opcoes: [{v:0, t:'0 - Relaxada'}, {v:1, t:'1 - Careta leve'}, {v:2, t:'2 - Face rígida / dor'}] },
      { id: 'agitacao', label: '3. Agitação Motora', opcoes: [{v:0, t:'0 - Normal'}, {v:1, t:'1 - Agitação leve'}, {v:2, t:'2 - Intensa contínua'}] },
      { id: 'tremores', label: '4. Tremores', opcoes: [{v:0, t:'0 - Ausente'}, {v:1, t:'1 - Após estímulo'}, {v:2, t:'2 - Repouso ou grosseiros'}] },
      { id: 'tonus', label: '5. Tônus Muscular', opcoes: [{v:0, t:'0 - Normal'}, {v:1, t:'1 - Levemente aumentado'}, {v:2, t:'2 - Hipertonia marcante'}] },
      { id: 'sono', label: '6. Sono', opcoes: [{v:0, t:'0 - Adequado'}, {v:1, t:'1 - Leve/fragmentado'}, {v:2, t:'2 - Não dorme / desperta'}] },
      { id: 'autonomicos', label: '7. Sinais Autonômicos', opcoes: [{v:0, t:'0 - Ausentes'}, {v:1, t:'1 - Leves (FC↑, suor)'}, {v:2, t:'2 - Intensos (Febre, suor forte)'}] },
      { id: 'gastro', label: '8. Gastrointestinais', opcoes: [{v:0, t:'0 - Normais'}, {v:1, t:'1 - Alterações leves'}, {v:2, t:'2 - Vômitos/Diarreia imp.'}] },
      { id: 'consolabilidade', label: '9. Consolabilidade', opcoes: [{v:0, t:'0 - Fácil'}, {v:1, t:'1 - Com dificuldade'}, {v:2, t:'2 - Inconsolável'}] },
      { id: 'manipulacao', label: '10. Resposta à Manipulação', opcoes: [{v:0, t:'0 - Adequada'}, {v:1, t:'1 - Irritação leve'}, {v:2, t:'2 - Reação exagerada'}] },
    ]
  }
};

interface AbstinenciaCalculatorProps {
  patientId: string;
}

export default function AbstinenciaCalculator({ patientId }: AbstinenciaCalculatorProps) {
  const [tela, setTela] = useState('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<'finnegan' | 'wat1'>('finnegan');
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const configAtual = ABSTINENCIA_CONFIG[escalaAtiva];

  const pontuacaoTotal = useMemo(() => {
    const vals = Object.values(respostas) as number[];
    return vals.length === 0 ? 0 : vals.reduce((acc, curr) => acc + curr, 0);
  }, [respostas]);

  const respondidosCount = Object.keys(respostas).length;
  const totalItens = configAtual.dominios.length;
  const progresso = (respondidosCount / totalItens) * 100;

  const interpretacao = useMemo(() => {
    if (respondidosCount < totalItens) return null;
    const score = pontuacaoTotal;

    if (escalaAtiva === 'finnegan') {
      if (score >= 12) return { texto: 'Abstinência Grave', cor: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500', conduta: 'Intervenção imediata e monitoramento intensivo.' };
      if (score >= 8) return { texto: 'Tratamento Sugerido', cor: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500', conduta: 'Iniciar tratamento farmacológico se ≥ 8 em 2 avaliações.' };
      return { texto: 'Acompanhamento', cor: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500', conduta: 'Manter monitoramento padrão e cuidados de conforto.' };
    } else {
      if (score >= 5) return { texto: 'Abstinência Grave', cor: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500', conduta: 'Avaliação médica urgente para ajuste de terapia.' };
      if (score >= 3) return { texto: 'Abstinência Provável', cor: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500', conduta: 'Monitorizar de perto e considerar intervenção.' };
      return { texto: 'Baixo Risco', cor: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500', conduta: 'Risco mínimo de síndrome de abstinência.' };
    }
  }, [pontuacaoTotal, respondidosCount, escalaAtiva]);

  const handleSelecionar = (id: string, valor: number) => {
    setRespostas((prev) => ({ ...prev, [id]: valor }));

    // ROLAGEM AUTOMÁTICA
    const itemIds = configAtual.dominios.map(d => d.id);
    const currentIndex = itemIds.indexOf(id);
    if (currentIndex < itemIds.length - 1) {
      const nextId = itemIds[currentIndex + 1];
      setTimeout(() => {
        const nextEl = document.getElementById(nextId);
        if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const salvarAvaliacao = async () => {
    if (!patientId || isSaving || !interpretacao) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('scale_scores')
        .insert({
          patient_id: patientId,
          scale_name: `${configAtual.titulo} - ${configAtual.faixaEtaria}`,
          score: pontuacaoTotal,
          interpretation: interpretacao.texto,
          date: new Date().toISOString(),
        });

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus(null);
        setTela('intro');
        setRespostas({});
      }, 1500);
    } catch (e) {
      console.error('Erro ao salvar:', e);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header com volta */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setTela('intro')}
          className="p-2 rounded-full hover:bg-slate-700/50"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h2 className="text-xl font-bold">Avaliação de Abstinência</h2>
      </div>

      {tela === 'intro' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900">
            <h3 className="text-lg font-bold mb-1">Nova Avaliação</h3>
            <p className="text-sm text-slate-400 mb-6 font-medium">Escolha a escala apropriada:</p>

            <div className="space-y-3 mb-6">
              {Object.values(ABSTINENCIA_CONFIG).map((conf) => (
                <button
                  key={conf.id}
                  onClick={() => {
                    setEscalaAtiva(conf.id as 'finnegan' | 'wat1');
                    setRespostas({});
                    setTela('form');
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-sm font-bold text-left flex justify-between items-center ${
                    escalaAtiva === conf.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-transparent bg-slate-700/50 text-slate-400 hover:border-blue-500/50'
                  }`}
                >
                  <div>
                    <div className="font-bold">{conf.titulo}</div>
                    <div className="text-xs opacity-70">{conf.faixaEtaria}</div>
                  </div>
                  {escalaAtiva === conf.id && <span className="text-lg">✓</span>}
                </button>
              ))}
            </div>

            <button
              onClick={() => setTela('form')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all"
            >
              Começar Avaliação
            </button>
          </div>
        </div>
      )}

      {tela === 'form' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-500 uppercase">{configAtual.titulo}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{respondidosCount} de {totalItens}</span>
            </div>
            <span className="text-sm font-black text-blue-400">Score: {pontuacaoTotal}</span>
          </div>

          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${progresso}%` }} />
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

          <div className="pt-6 pb-10">
            <button
              disabled={respondidosCount < totalItens}
              onClick={() => setTela('resultado')}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                respondidosCount === totalItens
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
            >
              ✓ Ver Diagnóstico
            </button>
          </div>
        </div>
      )}

      {tela === 'resultado' && interpretacao && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500 text-center">
          <div className={`p-8 rounded-[40px] border-2 ${interpretacao.border} ${interpretacao.bg}`}>
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-slate-800 mb-6 shadow-xl border-4 border-slate-700">
              <span className="text-5xl font-black text-slate-100">{pontuacaoTotal}</span>
            </div>
            <h2 className={`text-xl font-black mb-1 tracking-tight uppercase ${interpretacao.cor}`}>
              {interpretacao.texto}
            </h2>
            <p className="text-sm font-medium opacity-80 mb-4">{interpretacao.conduta}</p>
            <p className="text-xs opacity-60">
              Pontuação máxima: {escalaAtiva === 'finnegan' ? '40' : '20'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={salvarAvaliacao}
              disabled={isSaving || saveStatus === 'success'}
              className={`w-full py-4 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${
                isSaving || saveStatus === 'success'
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {isSaving ? '⏳ Salvando...' : saveStatus === 'success' ? '✓ Salvo!' : '💾 Gravar Avaliação'}
            </button>
            <button
              onClick={() => {
                setTela('intro');
                setRespostas({});
              }}
              className="w-full py-4 rounded-2xl font-bold border-2 border-slate-800 text-slate-400 hover:border-slate-700"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Dropdown Reutilizável ---
interface SelectDropdownProps {
  id: string;
  label: string;
  opcoes: Array<{ v: number; t: string }>;
  valor?: number;
  onSelect: (valor: number) => void;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({ id, label, opcoes, valor, onSelect }) => {
  const isSelected = valor !== undefined && valor !== null;

  return (
    <div
      id={id}
      className={`p-5 rounded-3xl border-2 transition-all bg-slate-900/40 border-slate-800 ${
        isSelected ? 'border-green-500/40' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-black text-slate-100">{label}</h3>
        {isSelected && (
          <div className="bg-green-500/20 p-1 rounded-full animate-in zoom-in duration-300">
            <span className="text-green-400 text-sm font-bold">✓</span>
          </div>
        )}
      </div>

      <div className="relative">
        <select
          value={valor || ''}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="w-full p-4 rounded-2xl appearance-none text-xs font-bold border-2 bg-slate-950 border-slate-800 text-slate-200 outline-none focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value="" disabled>
            Selecione uma opção...
          </option>
          {opcoes.map((opt) => (
            <option key={opt.v} value={opt.v}>
              {opt.t}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
          ▼
        </div>
      </div>
    </div>
  );
};
