import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';

// Configurações das Escalas (Fiel ao documento da imagem)
const escalasConfig = {
  wood_downes: {
    id: 'wood_downes',
    titulo: 'Escala de Wood-Downes (Modificada)',
    subtitulo: 'Lactentes (30 dias a 2 anos)',
    maxScore: 14,
    cores: { 
      bg: 'bg-blue-600', 
      hover: 'hover:bg-blue-500', 
      text: 'text-blue-600 dark:text-blue-400', 
      bgProgress: 'bg-blue-500', 
      bgBase: 'bg-blue-700' 
    },
    dominios: [
      { id: 'sibilos', label: 'Sibilos', ranges: ['Ausente', 'Expiratório', 'Contínuos', 'Insp + Exp'] },
      { id: 'tiragem', label: 'Tiragem', ranges: ['Ausente', 'Subcostal', 'Supraclavicular', 'Generalizada'] },
      { id: 'ventilacao', label: 'Ventilação', ranges: ['Boa', 'Regular', 'Diminuída', 'Silenciosa'] },
      { id: 'fr', label: 'FR (irpm)', ranges: ['< 30 irpm', '31 a 45', '46 a 60', '> 60'] },
      { id: 'fc', label: 'FC (bpm)', ranges: ['< 120 bpm', '> 120'] }, 
      { id: 'cianose', label: 'Cianose', ranges: ['Ausente', 'Presente'] },
    ],
    interpreta: (score: number) => {
      if (score >= 8) return { texto: 'Grave', cor: 'text-red-600', conduta: 'Tratamento: VMPI', bg: 'bg-red-600' };
      if (score >= 4) return { texto: 'Moderado', cor: 'text-orange-600 dark:text-orange-400', conduta: 'Tratamento: CNAF ou VNI', bg: 'bg-orange-500' };
      if (score >= 1) return { texto: 'Leve', cor: 'text-yellow-600 dark:text-yellow-400', conduta: 'Tratamento: CN ou CNAF', bg: 'bg-yellow-500' };
      return { texto: 'Normal', cor: 'text-green-600 dark:text-green-400', conduta: 'Manter Observação', bg: 'bg-green-600' };
    }
  },
  escolar: {
    id: 'escolar',
    titulo: 'Avaliação de Insuficiência Respiratória',
    subtitulo: 'Pré-escolares, Escolares e Adolescentes',
    maxScore: 12,
    cores: { 
      bg: 'bg-purple-600', 
      hover: 'hover:bg-purple-500', 
      text: 'text-purple-600 dark:text-purple-400', 
      bgProgress: 'bg-purple-500', 
      bgBase: 'bg-purple-700' 
    },
    dominios: [
      { id: 'fr', label: 'Frequência Respiratória', ranges: ['Normal para a idade', 'Moderadamente aumentada', 'Taquipneia intensa'] },
      { id: 'musculatura', label: 'Musculatura Acessória', ranges: ['Ausente', 'Leve (batimento asa nasal/intercostal)', 'Intensa (tiragem subcostal/esternocleido)'] },
      { id: 'ausculta', label: 'Ausculta Pulmonar', ranges: ['Som preservado', 'Redução do som', 'Redução acentuada/ausência/sibilos'] },
      { id: 'cianose', label: 'Cianose', ranges: ['Ausente', 'Perioral (com esforço)', 'Generalizada/Repouso'] },
      { id: 'mental', label: 'Estado Mental', ranges: ['Alerta', 'Irritado, Ansioso', 'Sonolento, Confuso, Obnubilado'] },
      { id: 'saturacao', label: 'Saturação de O2 (Ar Ambiente)', ranges: ['≥ 95% (Normal)', '90% a 93%', '< 90%'] },
    ],
    interpreta: (score: number) => {
      if (score >= 7) return { texto: 'Grave', cor: 'text-red-600', conduta: 'Avaliar Suporte Ventilatório', bg: 'bg-red-600' };
      if (score >= 4) return { texto: 'Moderado', cor: 'text-orange-600 dark:text-orange-400', conduta: 'Considerar Oxigenoterapia', bg: 'bg-orange-500' };
      return { texto: 'Leve', cor: 'text-green-600 dark:text-green-400', conduta: 'Sem sinais de alerta imediatos', bg: 'bg-green-600' };
    }
  }
};

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const ReferenceTable = () => (
  <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-gray-300 space-y-3 mb-4 animate-in fade-in duration-300 shadow-sm">
    <div>
      <p className="font-bold text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-1 uppercase">Frequência Respiratória Normal</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span>RN: 40-60 irpm</span> <span>Bebês 1-2m: 30-53</span>
        <span>1-2 anos: 22-37</span> <span>3-5 anos: 20-28</span>
        <span>6-9 anos: 18-25</span> <span>10-15 anos: 12-20</span>
      </div>
    </div>
    <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-900/50">
      <p className="font-bold text-red-600 dark:text-red-400 pb-1 mb-1 uppercase italic">Sinais de Alerta (Taquipneia Mantida)</p>
      <div className="flex flex-col gap-1">
        <span>• &lt; 2 meses: FR ≥ 60 ipm</span>
        <span>• 2-11 meses: FR ≥ 50 ipm</span>
        <span>• 1-5 anos: FR &gt; 40 ipm</span>
      </div>
    </div>
  </div>
);

const QuestionCard = ({ item, valor, onChange }: any) => {
  const isSelected = valor !== undefined && valor !== null && valor !== '';

  return (
    <div className={`p-4 rounded-xl shadow-sm mb-3 transition-all border-l-4 ${isSelected ? 'bg-slate-100 dark:bg-slate-700 border-blue-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
      <label className="block text-sm font-bold text-slate-800 dark:text-gray-100 mb-2">{item.label}</label>
      <select
        value={valor === undefined ? '' : valor}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <option value="" disabled>Escolha uma opção...</option>
        {item.ranges.map((desc: string, index: number) => (
          <option key={index} value={index}>{index} - {desc}</option>
        ))}
      </select>
    </div>
  );
};

interface Props {
  patientId: string;
  onClose: () => void;
}

export const RespiratoryCalculator: React.FC<Props> = ({ patientId, onClose }) => {
  const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
  const [escalaAtiva, setEscalaAtiva] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [showRef, setShowRef] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const config = escalaAtiva ? (escalasConfig as any)[escalaAtiva] : null;
  const totalItens = config?.dominios.length || 0;
  const respondidos = Object.keys(respostas).length;
  const progresso = (respondidos / totalItens) * 100;

  const pontuacaoTotal = useMemo(() => {
    return Object.values(respostas).reduce((acc: number, val: number) => acc + val, 0);
  }, [respostas]);

  const resultado = useMemo(() => {
    if (!config || respondidos < totalItens) return null;
    return config.interpreta(pontuacaoTotal);
  }, [pontuacaoTotal, config, respondidos, totalItens]);

  const saveToSupabase = async () => {
    if (!resultado || !config) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('scale_scores')
        .insert({
          patient_id: patientId,
          scale_name: config.titulo,
          score: pontuacaoTotal,
          interpretation: `${resultado.texto} - ${resultado.conduta}`,
          date: new Date().toISOString(),
        });

      if (error) throw error;
      onClose();
    } catch (e) {
      console.error("Erro ao salvar:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (tela === 'intro') {
    return (
      <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <button onClick={onClose} className="flex items-center text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white mb-6 transition">
          <ChevronLeftIcon /> Voltar ao Prontuário
        </button>
        
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Cálculo Respiratório</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">Baseado no Protocolo de Urgência Pediátrica.</p>

        <div className="space-y-4">
          {Object.values(escalasConfig).map((esc) => (
            <button
              key={esc.id}
              onClick={() => { setEscalaAtiva(esc.id); setTela('form'); }}
              className="w-full text-left p-5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-gray-100 mb-1">{esc.titulo}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed uppercase tracking-wider font-semibold">{esc.subtitulo}</p>
                </div>
                <div className={`w-3 h-3 rounded-full mt-1 ${esc.cores.bgProgress} shadow-lg shadow-blue-500/20`} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tela === 'form' && config) {
    return (
      <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => { setTela('intro'); setRespostas({}); }} className="text-slate-500 dark:text-gray-400 text-sm flex items-center">
            <ChevronLeftIcon /> Voltar
          </button>
          <button 
            onClick={() => setShowRef(!showRef)} 
            className={`flex items-center text-[10px] px-3 py-1.5 rounded-full border transition-all ${showRef ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'}`}
          >
            <InfoIcon /> {showRef ? 'Ocultar Referências' : 'Ver Referências'}
          </button>
        </div>

        <h3 className={`text-center font-bold text-lg mb-2 ${config.cores.text}`}>{config.titulo}</h3>
        
        {showRef && <ReferenceTable />}

        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-6 overflow-hidden shadow-inner">
          <div className={`h-full ${config.cores.bgProgress} transition-all duration-700 ease-out`} style={{ width: `${progresso}%` }} />
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {config.dominios.map((item: any) => (
            <QuestionCard
              key={item.id}
              item={item}
              valor={respostas[item.id]}
              onChange={(val: number) => setRespostas(prev => ({ ...prev, [item.id]: val }))}
            />
          ))}
        </div>

        <button
          disabled={respondidos < totalItens}
          onClick={() => setTela('resultado')}
          className={`w-full mt-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
            respondidos === totalItens 
            ? `${config.cores.bg} text-white shadow-xl` 
            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          Calcular Gravidade
        </button>
      </div>
    );
  }

  if (tela === 'resultado' && resultado && config) {
    return (
      <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300 transition-colors">
        <p className="text-slate-500 dark:text-gray-500 text-[10px] mb-4 uppercase tracking-[0.2em] font-bold">Diagnóstico Final</p>
        
        <div className={`w-28 h-28 mx-auto rounded-full flex flex-col items-center justify-center mb-6 border-8 border-white dark:border-slate-800 shadow-xl ${resultado.bg}`}>
          <span className="text-5xl font-black text-white">{pontuacaoTotal}</span>
          <span className="text-[10px] text-white/80 uppercase font-bold">pontos</span>
        </div>

        <h2 className={`text-3xl font-black ${resultado.cor} mb-2`}>{resultado.texto}</h2>
        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-3xl mb-10 border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="text-[10px] text-slate-400 dark:text-gray-400 mb-2 uppercase font-bold tracking-widest italic underline decoration-blue-500/50">Conduta Clínica Recomendada</p>
          <p className="text-slate-800 dark:text-gray-100 font-bold text-lg leading-tight">{resultado.conduta}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={saveToSupabase}
            disabled={isSaving}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-2xl transition-all ${isSaving ? 'bg-gray-400 dark:bg-gray-700' : 'bg-green-600 hover:bg-green-500 hover:scale-[1.02]'}`}
          >
            {isSaving ? 'A Gravar...' : 'Gravar no Prontuário'}
          </button>
          <button 
            onClick={() => setTela('form')}
            className="w-full py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 dark:text-gray-400 font-bold text-xs hover:text-slate-800 dark:hover:text-white transition shadow-sm"
          >
            Revisar Avaliação
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default RespiratoryCalculator;
