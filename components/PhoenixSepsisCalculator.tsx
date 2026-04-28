import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);

const sistemasConfig = {
  respiratorio: {
    id: 'respiratorio',
    label: 'Sistema Respirat\u00f3rio',
    tipo: 'selecao_unica',
    opcoes: [
      { valor: 0, texto: 'PaO2/FiO2 \u2265 400 ou SatO2/FiO2 \u2265 292' },
      { valor: 1, texto: 'PaO2/FiO2 < 400 com qualquer suporte respirat\u00f3rio ou SatO2/FiO2 < 292 com suporte respirat\u00f3rio' },
      { valor: 2, texto: 'PaO2/FiO2 100\u2013200 e VMI OU SatO2/FiO2 148\u2013220 e VMI' },
      { valor: 3, texto: 'PaO2/FiO2 < 100 e VMI OU SatO2/FiO2 < 148 e VMI' },
    ],
  },
  neurologico: {
    id: 'neurologico',
    label: 'Sistema Neurol\u00f3gico',
    tipo: 'selecao_unica',
    opcoes: [
      { valor: 0, texto: 'Glasgow > 10, pupilas reativas' },
      { valor: 1, texto: 'Glasgow \u2264 10' },
      { valor: 2, texto: 'Pupilas fixas bilateral' },
    ],
  },
  cardiovascular: {
    id: 'cardiovascular',
    label: 'Sistema Cardiovascular',
    tipo: 'selecao_unica',
    opcoes: [
      { valor: 0, texto: '0 pontos: Sem drogas vasoativas (DVA), lactato < 45 mg/dL ou 5 mmol/L, press\u00e3o arterial m\u00e9dia (PAM) normal para a idade' },
      { valor: 1, texto: '1 ponto para cada (at\u00e9 3 pontos): 1 DVA | lactato 45\u201398 mg/dL ou 5\u201310,9 mmol/L | PAM baixa para a idade' },
      { valor: 2, texto: '2 pontos para cada (at\u00e9 6 pontos): \u2265 2 DVA | lactato \u2265 99 mg/dL ou 10,9 mmol/L | PAM muito baixa para a idade' },
    ],
  },
  coagulacao: {
    id: 'coagulacao',
    label: 'Sistema de Coagula\u00e7\u00e3o',
    tipo: 'selecao_unica',
    opcoes: [
      { valor: 0, texto: '0 pontos: Plaquetas \u2265 100.000/\u00b5L, INR \u2264 1,3, D\u00edmero D \u2264 2 mg/L, Fibrinog\u00eanio \u2265 100 mg/dL' },
      { valor: 1, texto: '1 ponto para cada (m\u00e1ximo 2 pontos): Plaquetas \u2264 100.000/\u00b5L | INR > 1,3 | D\u00edmero D > 2 mg/L | Fibrinog\u00eanio < 100 mg/dL' },
    ],
  },
};

interface Props {
  patientId: string;
  onClose: () => void;
}

export const PhoenixSepsisCalculator: React.FC<Props> = ({ patientId, onClose }) => {
  const [tela, setTela] = useState<'infeccao' | 'criterios' | 'resultado'>('infeccao');
  const [infeccao, setInfeccao] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [respiratorio, setRespiratorio] = useState<number | null>(null);
  const [neurologico, setNeurologico] = useState<number | null>(null);
  // Cardiovascular agora tem 3 campos independentes (DVA, lactato, PAM) — somados, max 6
  const [cardioDVA, setCardioDVA] = useState<number | null>(null);
  const [cardioLactato, setCardioLactato] = useState<number | null>(null);
  const [cardioPAM, setCardioPAM] = useState<number | null>(null);
  const [coagPlaquetas, setCoagPlaquetas] = useState<number | null>(null);
  const [coagINR, setCoagINR] = useState<number | null>(null);
  const [coagDimeroD, setCoagDimeroD] = useState<number | null>(null);
  const [coagFibrinogenio, setCoagFibrinogenio] = useState<number | null>(null);

  const scoreRespiratorio = respiratorio ?? 0;
  const scoreNeurologico = neurologico ?? 0;

  const cardiovascularPreenchido = cardioDVA !== null && cardioLactato !== null && cardioPAM !== null;
  const scoreCardiovascular = (cardioDVA ?? 0) + (cardioLactato ?? 0) + (cardioPAM ?? 0);

  const coagulacaoPreenchida = coagPlaquetas !== null && coagINR !== null && coagDimeroD !== null && coagFibrinogenio !== null;
  const scoreCoagulacao = Math.min((coagPlaquetas ?? 0) + (coagINR ?? 0) + (coagDimeroD ?? 0) + (coagFibrinogenio ?? 0), 2);

  const scoreTotal = useMemo(() => {
    return scoreRespiratorio + scoreNeurologico + scoreCardiovascular + scoreCoagulacao;
  }, [scoreRespiratorio, scoreNeurologico, scoreCardiovascular, scoreCoagulacao]);

  const todosPreenchidos = respiratorio !== null && neurologico !== null
    && cardiovascularPreenchido && coagulacaoPreenchida;

  const classificacao = useMemo(() => {
    if (!todosPreenchidos) return null;
    const temPontoCardio = scoreCardiovascular >= 1;
    if (scoreTotal >= 2 && temPontoCardio) {
      return {
        tipo: 'choque_septico',
        titulo: 'Choque S\u00e9ptico',
        descricao: 'Sepse + \u2265 1 ponto no Sistema Cardiovascular',
        cor: 'text-red-600',
        bg: 'bg-red-600',
        conduta: 'Iniciar protocolo de choque s\u00e9ptico imediatamente. Ressuscita\u00e7\u00e3o vol\u00eamica, drogas vasoativas e antibioticoterapia.',
      };
    }
    if (scoreTotal >= 2) {
      return {
        tipo: 'sepse',
        titulo: 'Sepse',
        descricao: 'Infec\u00e7\u00e3o suspeita ou confirmada + escore \u2265 2 pontos',
        cor: 'text-orange-600',
        bg: 'bg-orange-500',
        conduta: 'Iniciar protocolo de sepse. Antibioticoterapia emp\u00edrica e monitoriza\u00e7\u00e3o intensiva.',
      };
    }
    return {
      tipo: 'sem_sepse',
      titulo: 'Sem diagn\u00f3stico de Sepse',
      descricao: 'Escore total < 2 pontos',
      cor: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-600',
      conduta: 'Manter vigil\u00e2ncia cl\u00ednica. Reavaliar se houver piora.',
    };
  }, [todosPreenchidos, scoreTotal, scoreCardiovascular]);

  const progresso = useMemo(() => {
    let total = 0;
    if (respiratorio !== null) total++;
    if (neurologico !== null) total++;
    if (cardiovascularPreenchido) total++;
    if (coagulacaoPreenchida) total++;
    return (total / 4) * 100;
  }, [respiratorio, neurologico, cardiovascularPreenchido, coagulacaoPreenchida]);

  const saveToSupabase = async () => {
    if (!classificacao) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('scale_scores')
        .insert({
          patient_id: patientId,
          scale_name: 'Escore de Sepse de Phoenix (2024)',
          score: scoreTotal,
          interpretation: `${classificacao.titulo} - ${classificacao.conduta}`,
          notes: `Respirat\u00f3rio: ${scoreRespiratorio} | Neurol\u00f3gico: ${scoreNeurologico} | Cardiovascular: ${scoreCardiovascular} | Coagula\u00e7\u00e3o: ${scoreCoagulacao}`,
          date: new Date().toISOString(),
        });
      if (error) throw error;
      onClose();
    } catch (e) {
      console.error('Erro ao salvar:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const resetAll = () => {
    setInfeccao(null);
    setRespiratorio(null);
    setNeurologico(null);
    setCardioDVA(null);
    setCardioLactato(null);
    setCardioPAM(null);
    setCoagPlaquetas(null);
    setCoagINR(null);
    setCoagDimeroD(null);
    setCoagFibrinogenio(null);
    setTela('infeccao');
  };

  // TELA 1
  if (tela === 'infeccao') {
    return (
      <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <button onClick={onClose} className="flex items-center text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white mb-6 transition">
          <ChevronLeftIcon /> {"Voltar ao Prontu\u00e1rio"}
        </button>

        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Escore de Sepse de Phoenix (2024)</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">{"Crit\u00e9rios de Sepse Pedi\u00e1trica - Phoenix Sepsis Score"}</p>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100 mb-6 text-center">
            {"Infec\u00e7\u00e3o suspeita ou confirmada?"}
          </h3>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setInfeccao(true); setTela('criterios'); }}
              className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all border-2 ${
                infeccao === true
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-gray-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600'
              }`}
            >
              Sim
            </button>

            <button
              onClick={() => setInfeccao(false)}
              className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all border-2 ${
                infeccao === false
                  ? 'bg-slate-600 border-slate-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-gray-200 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              {"N\u00e3o"}
            </button>
          </div>

          {infeccao === false && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-center animate-in fade-in duration-300">
              <p className="text-amber-700 dark:text-amber-300 font-bold text-sm">
                {"O Escore de Phoenix s\u00f3 se aplica quando h\u00e1 infec\u00e7\u00e3o suspeita ou confirmada."}
              </p>
              <p className="text-amber-600 dark:text-amber-400 text-xs mt-2">
                {"Reavalie se houver suspeita cl\u00ednica de infec\u00e7\u00e3o."}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // TELA 2
  if (tela === 'criterios') {
    const cardioConfig = sistemasConfig.cardiovascular;
    const coagConfig = sistemasConfig.coagulacao;

    return (
      <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors flex flex-col" style={{ maxHeight: 'calc(100dvh - 120px)' }}>
        <div className="p-4 sm:p-5 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <button onClick={resetAll} className="text-slate-500 dark:text-gray-400 text-sm flex items-center">
              <ChevronLeftIcon /> Voltar
            </button>
            <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
              Phoenix 2024
            </span>
          </div>

          <h3 className="text-center font-bold text-lg mb-2 text-rose-600 dark:text-rose-400">{"Crit\u00e9rios de Avalia\u00e7\u00e3o"}</h3>
          <p className="text-center text-xs text-slate-500 dark:text-gray-400 mb-4">{"Selecione a pontua\u00e7\u00e3o para cada sistema"}</p>

          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-rose-500 transition-all duration-700 ease-out" style={{ width: `${progresso}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">

          <div className={`p-4 rounded-xl shadow-sm transition-all border-l-4 ${respiratorio !== null ? 'bg-slate-100 dark:bg-slate-700 border-rose-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
            <label className="block text-sm font-bold text-slate-800 dark:text-gray-100 mb-2">
              {sistemasConfig.respiratorio.label}
            </label>
            <select
              value={respiratorio === null ? '' : respiratorio}
              onChange={(e) => setRespiratorio(parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 transition-colors"
            >
              <option value="" disabled>{"Escolha uma op\u00e7\u00e3o..."}</option>
              {sistemasConfig.respiratorio.opcoes.map((op) => (
                <option key={op.valor} value={op.valor}>{op.valor} pt{op.valor !== 1 ? 's' : ''} {'\u2014'} {op.texto}</option>
              ))}
            </select>
          </div>

          <div className={`p-4 rounded-xl shadow-sm transition-all border-l-4 ${neurologico !== null ? 'bg-slate-100 dark:bg-slate-700 border-rose-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
            <label className="block text-sm font-bold text-slate-800 dark:text-gray-100 mb-2">
              {sistemasConfig.neurologico.label}
            </label>
            <select
              value={neurologico === null ? '' : neurologico}
              onChange={(e) => setNeurologico(parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 transition-colors"
            >
              <option value="" disabled>{"Escolha uma op\u00e7\u00e3o..."}</option>
              {sistemasConfig.neurologico.opcoes.map((op) => (
                <option key={op.valor} value={op.valor}>{op.valor} pt{op.valor !== 1 ? 's' : ''} {'\u2014'} {op.texto}</option>
              ))}
            </select>
          </div>

          <div className={`p-4 rounded-xl shadow-sm transition-all border-l-4 ${cardiovascularPreenchido ? 'bg-slate-100 dark:bg-slate-700 border-rose-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
            <label className="block text-sm font-bold text-slate-800 dark:text-gray-100 mb-3">
              {cardioConfig.label} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">(avalie os 3 itens — pontos se somam, máx 6)</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">Drogas vasoativas (DVA)</label>
                <select
                  value={cardioDVA === null ? '' : cardioDVA}
                  onChange={(e) => setCardioDVA(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 transition-colors"
                >
                  <option value="" disabled>Escolha uma opção...</option>
                  <option value={0}>0 pts — Sem DVA</option>
                  <option value={1}>1 pt — 1 DVA</option>
                  <option value={2}>2 pts — ≥ 2 DVA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">Lactato</label>
                <select
                  value={cardioLactato === null ? '' : cardioLactato}
                  onChange={(e) => setCardioLactato(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 transition-colors"
                >
                  <option value="" disabled>Escolha uma opção...</option>
                  <option value={0}>0 pts — {"< 45 mg/dL ou < 5 mmol/L"}</option>
                  <option value={1}>1 pt — 45–98 mg/dL ou 5–10,9 mmol/L</option>
                  <option value={2}>2 pts — ≥ 99 mg/dL ou ≥ 10,9 mmol/L</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">Pressão arterial média (PAM)</label>
                <select
                  value={cardioPAM === null ? '' : cardioPAM}
                  onChange={(e) => setCardioPAM(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 transition-colors"
                >
                  <option value="" disabled>Escolha uma opção...</option>
                  <option value={0}>0 pts — Normal para a idade</option>
                  <option value={1}>1 pt — Baixa para a idade</option>
                  <option value={2}>2 pts — Muito baixa para a idade</option>
                </select>
              </div>

              {cardiovascularPreenchido && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 text-right">
                  <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-bold">Subtotal: </span>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400">{scoreCardiovascular} pontos</span>
                </div>
              )}
            </div>
          </div>

          <div className={`p-4 rounded-xl shadow-sm transition-all border-l-4 ${coagulacaoPreenchida ? 'bg-slate-100 dark:bg-slate-700 border-rose-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
            <label className="block text-sm font-bold text-slate-800 dark:text-gray-100 mb-3">
              {coagConfig.label} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">(avalie os 4 itens \u2014 1 pt cada, m\u00e1x 2)</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">Plaquetas</label>
                <select
                  value={coagPlaquetas === null ? '' : coagPlaquetas}
                  onChange={(e) => setCoagPlaquetas(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 transition-colors"
                >
                  <option value="" disabled>Escolha uma op\u00e7\u00e3o...</option>
                  <option value={0}>0 pts \u2014 \u2265 100.000/\u00b5L</option>
                  <option value={1}>1 pt \u2014 \u2264 100.000/\u00b5L</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">INR</label>
                <select
                  value={coagINR === null ? '' : coagINR}
                  onChange={(e) => setCoagINR(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 transition-colors"
                >
                  <option value="" disabled>Escolha uma op\u00e7\u00e3o...</option>
                  <option value={0}>0 pts \u2014 \u2264 1,3</option>
                  <option value={1}>1 pt \u2014 {">"} 1,3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">D\u00edmero D</label>
                <select
                  value={coagDimeroD === null ? '' : coagDimeroD}
                  onChange={(e) => setCoagDimeroD(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 transition-colors"
                >
                  <option value="" disabled>Escolha uma op\u00e7\u00e3o...</option>
                  <option value={0}>0 pts \u2014 \u2264 2 mg/L</option>
                  <option value={1}>1 pt \u2014 {">"} 2 mg/L</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">Fibrinog\u00eanio</label>
                <select
                  value={coagFibrinogenio === null ? '' : coagFibrinogenio}
                  onChange={(e) => setCoagFibrinogenio(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 transition-colors"
                >
                  <option value="" disabled>Escolha uma op\u00e7\u00e3o...</option>
                  <option value={0}>0 pts \u2014 \u2265 100 mg/dL</option>
                  <option value={1}>1 pt \u2014 {"<"} 100 mg/dL</option>
                </select>
              </div>

              {coagulacaoPreenchida && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 text-right">
                  <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-bold">Subtotal: </span>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400">{scoreCoagulacao} pontos</span>
                  {(coagPlaquetas ?? 0) + (coagINR ?? 0) + (coagDimeroD ?? 0) + (coagFibrinogenio ?? 0) > 2 && (
                    <span className="text-xs text-slate-400 ml-1">(limitado ao m\u00e1x 2)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 sm:px-5 pb-4 sm:pb-5 pt-2 space-y-3">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="grid grid-cols-4 gap-1 text-center text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-gray-400">
              <div>
                <span className="block text-base sm:text-lg text-slate-800 dark:text-gray-100">{respiratorio ?? '-'}</span>
                Resp.
              </div>
              <div>
                <span className="block text-base sm:text-lg text-slate-800 dark:text-gray-100">{neurologico ?? '-'}</span>
                Neuro.
              </div>
              <div>
                <span className="block text-base sm:text-lg text-slate-800 dark:text-gray-100">{cardiovascularPreenchido ? scoreCardiovascular : '-'}</span>
                Cardio.
              </div>
              <div>
                <span className="block text-base sm:text-lg text-slate-800 dark:text-gray-100">{coagulacaoPreenchida ? scoreCoagulacao : '-'}</span>
                Coag.
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs text-slate-500 dark:text-gray-400 uppercase font-bold tracking-wider">Total: </span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">{todosPreenchidos ? scoreTotal : '-'}</span>
              <span className="text-xs text-slate-400"> pontos</span>
            </div>
          </div>

          <button
            disabled={!todosPreenchidos}
            onClick={() => setTela('resultado')}
            className={`w-full py-3 sm:py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
              todosPreenchidos
                ? 'bg-rose-600 text-white shadow-xl hover:bg-rose-500 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            Classificar
          </button>
        </div>
      </div>
    );
  }

  // TELA 3
  if (tela === 'resultado' && classificacao) {
    return (
      <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300 transition-colors">
        <p className="text-slate-500 dark:text-gray-500 text-xs mb-4 uppercase tracking-[0.2em] font-bold">{"Classifica\u00e7\u00e3o Final"}</p>

        <div className={`w-28 h-28 mx-auto rounded-full flex flex-col items-center justify-center mb-6 border-8 border-white dark:border-slate-800 shadow-xl ${classificacao.bg}`}>
          <span className="text-5xl font-black text-white">{scoreTotal}</span>
          <span className="text-xs text-white/80 uppercase font-bold">pontos</span>
        </div>

        <h2 className={`text-3xl font-black ${classificacao.cor} mb-2`}>{classificacao.titulo}</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">{classificacao.descricao}</p>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Resp.', score: scoreRespiratorio },
            { label: 'Neuro.', score: scoreNeurologico },
            { label: 'Cardio.', score: scoreCardiovascular },
            { label: 'Coag.', score: scoreCoagulacao },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="block text-lg font-black text-slate-800 dark:text-gray-100">{s.score}</span>
              <span className="text-xs text-slate-400 uppercase font-bold">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-3xl mb-10 border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="text-xs text-slate-600 dark:text-gray-300 mb-2 uppercase font-bold tracking-widest">{"Conduta Cl\u00ednica Recomendada"}</p>
          <p className="text-slate-800 dark:text-gray-100 font-bold text-lg leading-tight">{classificacao.conduta}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={saveToSupabase}
            disabled={isSaving}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-2xl transition-all ${isSaving ? 'bg-gray-400 dark:bg-gray-700' : 'bg-green-600 hover:bg-green-500 hover:scale-[1.02]'}`}
          >
            {isSaving ? 'A Gravar...' : 'Gravar no Prontu\u00e1rio'}
          </button>
          <button
            onClick={() => setTela('criterios')}
            className="w-full py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 dark:text-gray-400 font-bold text-xs hover:text-slate-800 dark:hover:text-white transition shadow-sm"
          >
            {"Revisar Avalia\u00e7\u00e3o"}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PhoenixSepsisCalculator;
