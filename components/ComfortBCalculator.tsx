import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { ChevronLeftIcon } from './icons';

// ==========================================
// 🧠 CONFIGURAÇÃO DA ESCALA COMFORT-B
// ==========================================

const COMFORT_B_CONFIG = {
  titulo: 'Escala COMFORT-B',
  subtitulo: 'Avaliação de Dor e Desconforto',
  dominios: [
    {
      id: 'alerta',
      label: '1 – Alerta (Alertness)',
      opcoes: [
        { valor: 1, texto: '1 – Sonolento' },
        { valor: 2, texto: '2 – Acordado, mas não totalmente alerto' },
        { valor: 3, texto: '3 – Alerto' },
        { valor: 4, texto: '4 – Muito alerto / hipervigilante' },
        { valor: 5, texto: '5 – Agitado' },
      ]
    },
    {
      id: 'calma',
      label: '2 – Calma / Agitação (Calmness)',
      opcoes: [
        { valor: 1, texto: '1 – Calmo' },
        { valor: 2, texto: '2 – Leve inquietação' },
        { valor: 3, texto: '3 – Moderadamente inquieto' },
        { valor: 4, texto: '4 – Agitado' },
        { valor: 5, texto: '5 – Muito agitado / inconsolável' },
      ]
    },
    {
      id: 'movimento',
      label: '4 – Movimentos Físicos (Physical Movement)',
      opcoes: [
        { valor: 1, texto: '1 – Sem movimento' },
        { valor: 2, texto: '2 – Movimentos mínimos' },
        { valor: 3, texto: '3 – Movimentos moderados' },
        { valor: 4, texto: '4 – Movimentos frequentes' },
        { valor: 5, texto: '5 – Movimentos intensos / desorganizados' },
      ]
    },
    {
      id: 'tonus',
      label: '5 – Tônus Corporal (Muscle Tone)',
      opcoes: [
        { valor: 1, texto: '1 – Relaxado' },
        { valor: 2, texto: '2 – Levemente aumentado' },
        { valor: 3, texto: '3 – Aumentado' },
        { valor: 4, texto: '4 – Muito aumentado' },
        { valor: 5, texto: '5 – Extremamente rígido' },
      ]
    },
    {
      id: 'tensao',
      label: '6 – Tensão Facial (Facial Tension)',
      opcoes: [
        { valor: 1, texto: '1 – Sem tensão' },
        { valor: 2, texto: '2 – Leve tensão' },
        { valor: 3, texto: '3 – Moderada tensão' },
        { valor: 4, texto: '4 – Tensão evidente' },
        { valor: 5, texto: '5 – Tensão extrema / expressão de dor' },
      ]
    }
  ]
};

const OPCOES_DOMINIO_3 = {
  nao_intubado: {
    id: 'choro',
    label: '3 – Choro (Crying)',
    extra: '*Para crianças não intubadas*',
    opcoes: [
      { valor: 1, texto: '1 – Não chora' },
      { valor: 2, texto: '2 – Geme / choraminga' },
      { valor: 3, texto: '3 – Choro moderado' },
      { valor: 4, texto: '4 – Choro forte' },
      { valor: 5, texto: '5 – Choro intenso / contínuo' },
    ]
  },
  intubado: {
    id: 'respiracao',
    label: '3 – Respiração (Respiratory Response)',
    extra: '*Para crianças intubadas*',
    opcoes: [
      { valor: 1, texto: '1 – Sem esforço respiratório' },
      { valor: 2, texto: '2 – Leve desconforto respiratório' },
      { valor: 3, texto: '3 – Moderado desconforto respiratório' },
      { valor: 4, texto: '4 – Respiração irregular / agitada' },
      { valor: 5, texto: '5 – Grande esforço respiratório' },
    ]
  }
};

interface ComfortBCalculatorProps {
  patientId: string;
}

export default function ComfortBCalculator({ patientId }: ComfortBCalculatorProps) {
  const [tela, setTela] = useState('intro');
  const [pacienteIntubado, setPacienteIntubado] = useState(false);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const pontuacaoTotal = useMemo(() => {
    const vals = Object.values(respostas) as number[];
    return vals.length === 0 ? 0 : vals.reduce((acc, curr) => acc + curr, 0);
  }, [respostas]);

  const respondidosCount = Object.keys(respostas).length;
  const totalEsperado = 6;
  const progresso = (respondidosCount / totalEsperado) * 100;

  const interpretacao = useMemo(() => {
    if (respondidosCount < totalEsperado) return null;
    const score = pontuacaoTotal;
    if (score <= 10) return { texto: 'Sedação Excessiva', cor: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500', detalhe: 'Paciente muito sedado. Avalie reduzir medicação.' };
    if (score <= 22) return { texto: 'Conforto Adequado', cor: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500', detalhe: 'Nível ideal de analgesia e sedação.' };
    return { texto: 'Dor / Desconforto', cor: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500', detalhe: 'Paciente em sofrimento. Reavaliar conduta imediatamente.' };
  }, [pontuacaoTotal, respondidosCount]);

  const salvarAvaliacao = async () => {
    if (!patientId || isSaving || !interpretacao) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('scale_scores')
        .insert({
          patient_id: patientId,
          scale_name: 'COMFORT-B',
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
        <h2 className="text-xl font-bold">COMFORT-B</h2>
      </div>

      {tela === 'intro' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900">
            <h3 className="text-lg font-bold mb-1">Nova Avaliação</h3>
            <p className="text-sm text-slate-400 mb-6 font-medium">Selecione a condição respiratória:</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setPacienteIntubado(false)}
                className={`p-4 rounded-2xl border-2 transition-all text-xs font-bold ${
                  !pacienteIntubado
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-transparent bg-slate-700/50 text-slate-400'
                }`}
              >
                Não Intubado
              </button>
              <button
                onClick={() => setPacienteIntubado(true)}
                className={`p-4 rounded-2xl border-2 transition-all text-xs font-bold ${
                  pacienteIntubado
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-transparent bg-slate-700/50 text-slate-400'
                }`}
              >
                Intubado
              </button>
            </div>

            <button
              onClick={() => {
                setRespostas({});
                setTela('form');
              }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all"
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
              Progresso: {respondidosCount}/6
            </span>
            <span className="text-sm font-black text-blue-400">Score: {pontuacaoTotal}</span>
          </div>

          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${progresso}%` }} />
          </div>

          {/* Domínios 1 e 2 */}
          {COMFORT_B_CONFIG.dominios.slice(0, 2).map((d) => (
            <SelectDominio
              key={d.id}
              dominio={d}
              valor={respostas[d.id]}
              onSelect={(v) => setRespostas((r) => ({ ...r, [d.id]: v }))}
            />
          ))}

          {/* Domínio 3 Condicional */}
          <SelectDominio
            dominio={
              pacienteIntubado ? OPCOES_DOMINIO_3.intubado : OPCOES_DOMINIO_3.nao_intubado
            }
            valor={respostas[pacienteIntubado ? 'respiracao' : 'choro']}
            onSelect={(v) =>
              setRespostas((r) => ({
                ...r,
                [pacienteIntubado ? 'respiracao' : 'choro']: v,
              }))
            }
          />

          {/* Domínios 4, 5 e 6 */}
          {COMFORT_B_CONFIG.dominios.slice(2).map((d) => (
            <SelectDominio
              key={d.id}
              dominio={d}
              valor={respostas[d.id]}
              onSelect={(v) => setRespostas((r) => ({ ...r, [d.id]: v }))}
            />
          ))}

          {/* Botão de Conclusão */}
          <div className="pt-6 pb-10">
            <button
              disabled={respondidosCount < totalEsperado}
              onClick={() => setTela('resultado')}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                respondidosCount === totalEsperado
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
            >
              ✓ Finalizar Avaliação
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

// --- Componente Auxiliar de Dropdown ---
interface SelectDominioProps {
  dominio: any;
  valor?: number;
  onSelect: (valor: number) => void;
}

const SelectDominio: React.FC<SelectDominioProps> = ({ dominio, valor, onSelect }) => {
  const isSelected = valor !== undefined && valor !== null;

  return (
    <div
      className={`p-5 rounded-3xl border-2 transition-all bg-slate-900/40 border-slate-800 ${
        isSelected ? 'border-green-500/40' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-black text-slate-100">{dominio.label}</h3>
          {dominio.extra && (
            <p className="text-[10px] text-blue-400 font-bold italic mt-0.5">{dominio.extra}</p>
          )}
        </div>
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
          {dominio.opcoes.map((opt: any) => (
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
