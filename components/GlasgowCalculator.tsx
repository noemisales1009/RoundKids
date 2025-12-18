import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeftIcon } from './icons';

// ==========================================
// 🧠 CONFIGURAÇÃO DAS ESCALAS DE GLASGOW
// Baseado no documento fornecido (Todas as idades)
// ==========================================

const GCS_CONFIG = {
  titulo: 'Escala de Glasgow',
  subtitulo: 'Versões por Faixa Etária',

  faixas: {
    adulto: {
      id: 'adulto',
      titulo: 'Adulto / Criança (≥ 5 anos)',
      verbalLabel: 'Resposta Verbal',
      verbalOpcoes: [
        { valor: 1, texto: '1 - Nenhuma' },
        { valor: 2, texto: '2 - Sons incompreensíveis' },
        { valor: 3, texto: '3 - Palavras inadequadas' },
        { valor: 4, texto: '4 - Confuso' },
        { valor: 5, texto: '5 - Orientado' },
      ],
      motoraLabel: 'Resposta Motora',
      motoraOpcoes: [
        { valor: 1, texto: '1 - Nenhuma' },
        { valor: 2, texto: '2 - Extensão anormal (descerebração)' },
        { valor: 3, texto: '3 - Flexão anormal (decórtica)' },
        { valor: 4, texto: '4 - Retirada inespecífica' },
        { valor: 5, texto: '5 - Localiza dor' },
        { valor: 6, texto: '6 - Obedece comandos' },
      ]
    },
    crianca: {
      id: 'crianca',
      titulo: 'Pediátrica (≤ 4 anos)',
      verbalLabel: 'Resposta Verbal',
      verbalOpcoes: [
        { valor: 1, texto: '1 - Nenhuma vocalização' },
        { valor: 2, texto: '2 - Gemidos de dor' },
        { valor: 3, texto: '3 - Choro persistente / irritado' },
        { valor: 4, texto: '4 - Choro consolável' },
        { valor: 5, texto: '5 - Balbucia / vocaliza adequadamente' },
      ],
      motoraLabel: 'Resposta Motora',
      motoraOpcoes: [
        { valor: 1, texto: '1 - Nenhuma resposta motora' },
        { valor: 2, texto: '2 - Extensão anormal (descerebração)' },
        { valor: 3, texto: '3 - Flexão anormal (decórtica)' },
        { valor: 4, texto: '4 - Retirada inespecífica' },
        { valor: 5, texto: '5 - Retirada ao toque/dor' },
        { valor: 6, texto: '6 - Movimenta-se espontaneamente / obedece comandos simples' },
      ]
    },
    lactente: {
      id: 'lactente',
      titulo: 'Pediátrica (< 1 ano)',
      verbalLabel: 'Resposta Verbal',
      verbalOpcoes: [
        { valor: 1, texto: '1 - Ausência de sons' },
        { valor: 2, texto: '2 - Gemido à dor' },
        { valor: 3, texto: '3 - Choro inconsolável' },
        { valor: 4, texto: '4 - Chora mas é consolável' },
        { valor: 5, texto: '5 - Sons normais / balbucia' },
      ],
      motoraLabel: 'Resposta Motora',
      motoraOpcoes: [
        { valor: 1, texto: '1 - Nenhuma resposta' },
        { valor: 2, texto: '2 - Extensão anormal (descerebração)' },
        { valor: 3, texto: '3 - Flexão anormal (decórtica)' },
        { valor: 4, texto: '4 - Retirada inespecífica' },
        { valor: 5, texto: '5 - Retirada ao estímulo doloroso' },
        { valor: 6, texto: '6 - Movimentos espontâneos / retira ao toque' },
      ]
    }
  },

  ocularOpcoes: [
    { valor: 1, texto: '1 - Nenhuma' },
    { valor: 2, texto: '2 - À dor' },
    { valor: 3, texto: '3 - Ao som' },
    { valor: 4, texto: '4 - Espontânea' },
  ],

  cores: {
    bg: 'bg-yellow-600',
    hover: 'hover:bg-yellow-500',
    text: 'text-yellow-300',
    bgProgress: 'bg-yellow-500',
  }
};

interface GlasgowCalculatorProps {
  patientId: string;
}

export default function GlasgowCalculator({ patientId }: GlasgowCalculatorProps) {
  const [tela, setTela] = useState('intro');
  const [faixaEtaria, setFaixaEtaria] = useState('adulto');
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const pontuacaoTotal = useMemo(() => {
    const vals = Object.values(respostas) as number[];
    return vals.length === 0 ? 0 : vals.reduce((acc, curr) => acc + curr, 0);
  }, [respostas]);

  const respondidosCount = Object.keys(respostas).length;
  const totalEsperado = 3;
  const progresso = (respondidosCount / totalEsperado) * 100;

  const interpretacao = useMemo(() => {
    if (respondidosCount < totalEsperado) return null;
    const score = pontuacaoTotal;

    if (score >= 13) return { texto: 'Traumatismo Leve', cor: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500', detalhe: 'Consciência preservada.' };
    if (score >= 9) return { texto: 'Traumatismo Moderado', cor: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500', detalhe: 'Rebaixamento moderado.' };
    if (score >= 6) return { texto: 'Coma Grave', cor: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500', detalhe: 'Indicação de via aérea definitiva.' };
    return { texto: 'Extremamente Grave', cor: 'text-red-600', bg: 'bg-red-800/20', border: 'border-red-700', detalhe: 'Risco de dano neurológico extenso.' };
  }, [pontuacaoTotal, respondidosCount]);

  const handleSelecionar = (id: string, valor: number) => {
    setRespostas((prev) => ({ ...prev, [id]: valor }));

    // ROLAGEM AUTOMÁTICA
    const ids = ['ocular', 'verbal', 'motora'];
    const currentIndex = ids.indexOf(id);
    if (currentIndex < ids.length - 1) {
      const nextId = ids[currentIndex + 1];
      setTimeout(() => {
        const nextEl = document.getElementById(nextId);
        if (nextEl) {
          nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
          scale_name: `Escala de Glasgow - ${GCS_CONFIG.faixas[faixaEtaria as keyof typeof GCS_CONFIG.faixas].titulo}`,
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
        <h2 className="text-xl font-bold">Escala de Glasgow</h2>
      </div>

      {tela === 'intro' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900">
            <h3 className="text-lg font-bold mb-1">Nova Avaliação</h3>
            <p className="text-sm text-slate-400 mb-6 font-medium">Escolha a faixa etária do paciente:</p>

            <div className="space-y-2 mb-6">
              {Object.values(GCS_CONFIG.faixas).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFaixaEtaria(f.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-sm font-bold flex justify-between items-center ${
                    faixaEtaria === f.id
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                      : 'border-transparent bg-slate-700/50 text-slate-400'
                  }`}
                >
                  <span>{f.titulo}</span>
                  {faixaEtaria === f.id && <span className="text-lg">✓</span>}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setRespostas({});
                setTela('form');
              }}
              className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-2xl transition-all"
            >
              Começar
            </button>
          </div>
        </div>
      )}

      {tela === 'form' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Itens: {respondidosCount}/3
            </span>
            <span className="text-sm font-black text-yellow-400">Total: {pontuacaoTotal}</span>
          </div>

          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-yellow-500 transition-all" style={{ width: `${progresso}%` }} />
          </div>

          <SelectCard
            id="ocular"
            label="Abertura Ocular (O)"
            opcoes={GCS_CONFIG.ocularOpcoes}
            valor={respostas.ocular}
            onSelect={(v) => handleSelecionar('ocular', v)}
          />

          <SelectCard
            id="verbal"
            label={GCS_CONFIG.faixas[faixaEtaria as keyof typeof GCS_CONFIG.faixas].verbalLabel}
            opcoes={GCS_CONFIG.faixas[faixaEtaria as keyof typeof GCS_CONFIG.faixas].verbalOpcoes}
            valor={respostas.verbal}
            onSelect={(v) => handleSelecionar('verbal', v)}
          />

          <SelectCard
            id="motora"
            label={GCS_CONFIG.faixas[faixaEtaria as keyof typeof GCS_CONFIG.faixas].motoraLabel}
            opcoes={GCS_CONFIG.faixas[faixaEtaria as keyof typeof GCS_CONFIG.faixas].motoraOpcoes}
            valor={respostas.motora}
            onSelect={(v) => handleSelecionar('motora', v)}
          />

          <div className="pt-6 pb-10">
            <button
              disabled={respondidosCount < totalEsperado}
              onClick={() => setTela('resultado')}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                respondidosCount === totalEsperado
                  ? 'bg-yellow-600 text-white hover:bg-yellow-500'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
            >
              ✓ Ver Resultado
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
            <p className="text-sm font-medium opacity-80 mb-6">{interpretacao.detalhe}</p>

            <div className="p-4 rounded-2xl border bg-white/5 border-white/10 text-xs font-medium italic opacity-70">
              Observação: Avaliar fatores confusores (sedação, analgesia, bloqueio neuromuscular).
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={salvarAvaliacao}
              disabled={isSaving || saveStatus === 'success'}
              className={`w-full py-4 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${
                isSaving || saveStatus === 'success'
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-500'
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

// --- Componente Auxiliar de Dropdown ---
interface SelectCardProps {
  id: string;
  label: string;
  opcoes: Array<{ valor: number; texto: string }>;
  valor?: number;
  onSelect: (valor: number) => void;
}

const SelectCard: React.FC<SelectCardProps> = ({ id, label, opcoes, valor, onSelect }) => {
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
          className="w-full p-4 rounded-2xl appearance-none text-xs font-bold border-2 bg-slate-950 border-slate-800 text-slate-200 outline-none focus:border-yellow-500 transition-all cursor-pointer"
        >
          <option value="" disabled>
            Selecione uma resposta...
          </option>
          {opcoes.map((opt) => (
            <option key={opt.valor} value={opt.valor}>
              {opt.texto}
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
