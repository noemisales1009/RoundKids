import React, { useState, useMemo } from 'react';

// --- Ícones de Status ---
const IconeCheckVerde = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 flex-shrink-0">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

const IconeAlertaAmarelo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 flex-shrink-0">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V5.75A.75.75 0 0110 5zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const IconeAlarme = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 flex-shrink-0">
    <path d="M4.214 3.227a.75.75 0 00-1.156-.956 8.97 8.97 0 00-1.856 3.826.75.75 0 001.466.316 7.47 7.47 0 011.546-3.186zM16.942 2.271a.75.75 0 00-1.157.956 7.47 7.47 0 011.547 3.186.75.75 0 001.466-.316 8.97 8.97 0 00-1.856-3.826z" />
    <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.91 32.91 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zm0 14.5a2 2 0 01-1.95-1.557 33.54 33.54 0 003.9 0A2 2 0 0110 16.5z" clipRule="evenodd" />
  </svg>
);

const IconeCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-green-500 flex-shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

// --- Critérios KDIGO ---
const criterioCreatinina = [
  { valor: 0, texto: 'Sem critério (creatinina normal)' },
  { valor: 1, texto: 'Estágio 1 – Aumento de 1,5 a 1,9× o basal ou ≥ 0,3 mg/dL' },
  { valor: 2, texto: 'Estágio 2 – Aumento de 2,0 a 2,9× o basal' },
  { valor: 3, texto: 'Estágio 3 – Aumento ≥ 3× basal ou Cr ≥ 4,0 mg/dL ou TRS/diálise ou TFGe < 35 mL/min/1,73m² (<18a)' },
];

const criterioDiurese = [
  { valor: 0, texto: 'Sem critério (diurese normal)' },
  { valor: 1, texto: 'Estágio 1 – < 0,5 mL/kg/h por 6 a 12h' },
  { valor: 2, texto: 'Estágio 2 – < 0,5 mL/kg/h por ≥ 12h' },
  { valor: 3, texto: 'Estágio 3 – < 0,3 mL/kg/h por ≥ 24h ou anúria por ≥ 12h' },
];

const getInterpretacaoKDIGO = (estagio: number) => {
  if (estagio === 0) return { texto: 'Sem LRA', subtexto: 'Critérios não atingidos', cor: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icone: <IconeCheckVerde /> };
  if (estagio === 1) return { texto: 'KDIGO 1 – Alerta', subtexto: 'LRA leve — monitorar creatinina e diurese', cor: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icone: <IconeAlertaAmarelo /> };
  if (estagio === 2) return { texto: 'KDIGO 2 – LRA Moderada', subtexto: 'Avaliar necessidade de intervenção nefrológica', cor: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', icone: <IconeAlertaAmarelo /> };
  return { texto: 'KDIGO 3 – LRA Grave', subtexto: 'Risco de TRS — avaliar diálise/hemodiafiltração', cor: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icone: <IconeAlarme /> };
};

interface KDIGOScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string }) => void;
}

export const KDIGOScale: React.FC<KDIGOScaleProps> = ({ onSaveScore }) => {
  const [telaAtiva, setTelaAtiva] = useState<'lista' | 'form' | 'resultado'>('lista');
  const [ultimoEstagio, setUltimoEstagio] = useState<number | null>(null);

  const [estagioCreatinina, setEstagioCreatinina] = useState<number | null>(null);
  const [estagioDiurese, setEstagioDiurese] = useState<number | null>(null);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const estagioFinal = useMemo(() => {
    if (estagioCreatinina === null || estagioDiurese === null) return null;
    return Math.max(estagioCreatinina, estagioDiurese);
  }, [estagioCreatinina, estagioDiurese]);

  const interpretacaoAtual = useMemo(() => {
    return getInterpretacaoKDIGO(estagioFinal ?? 0);
  }, [estagioFinal]);

  const resetForm = () => {
    setEstagioCreatinina(null);
    setEstagioDiurese(null);
    setErroForm(null);
  };

  const handleCalcular = () => {
    if (estagioCreatinina === null || estagioDiurese === null) {
      setErroForm('Selecione o critério de creatinina e de diurese para calcular o estágio.');
      return;
    }
    setErroForm(null);
    setTelaAtiva('resultado');
  };

  const handleSalvar = () => {
    if (estagioFinal === null) return;
    const interp = getInterpretacaoKDIGO(estagioFinal);
    setUltimoEstagio(estagioFinal);
    onSaveScore({
      scaleName: 'KDIGO – Lesão Renal Aguda',
      score: estagioFinal,
      interpretation: interp.texto,
    });
    resetForm();
    setTelaAtiva('lista');
  };

  // --- Tela: Lista ---
  if (telaAtiva === 'lista') {
    const interp = ultimoEstagio !== null ? getInterpretacaoKDIGO(ultimoEstagio) : null;
    return (
      <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Escala KDIGO</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Lesão Renal Aguda (LRA)</p>
        </div>

        {/* Tabela de referência */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Critérios Diagnósticos</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-600">
                  <th className="text-left py-2 pr-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Estágio</th>
                  <th className="text-left py-2 pr-3 font-semibold text-slate-600 dark:text-slate-300">Creatinina sérica</th>
                  <th className="text-left py-2 font-semibold text-slate-600 dark:text-slate-300">Diurese</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                <tr>
                  <td className="py-2 pr-3 font-bold text-yellow-600 dark:text-yellow-400 whitespace-nowrap">KDIGO 1</td>
                  <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">1,5–1,9× basal ou ≥ 0,3 mg/dL</td>
                  <td className="py-2 text-slate-700 dark:text-slate-300">&lt; 0,5 mL/kg/h por 6–12h</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">KDIGO 2</td>
                  <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">2,0–2,9× o basal</td>
                  <td className="py-2 text-slate-700 dark:text-slate-300">&lt; 0,5 mL/kg/h por ≥ 12h</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-bold text-red-600 dark:text-red-400 whitespace-nowrap">KDIGO 3</td>
                  <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">≥ 3× basal, Cr ≥ 4,0 mg/dL, TRS, ou TFGe &lt; 35 mL/min/1,73m² (&lt;18a)</td>
                  <td className="py-2 text-slate-700 dark:text-slate-300">&lt; 0,3 mL/kg/h por ≥ 24h ou anúria ≥ 12h</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">O estágio final é o maior critério atingido entre creatinina e diurese.</p>
        </div>

        {/* Último resultado */}
        {interp !== null && ultimoEstagio !== null && (
          <div className={`rounded-xl p-4 border ${interp.bg} ${interp.border}`}>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Última avaliação</p>
            <div className={`flex items-center font-bold text-lg ${interp.cor}`}>
              {interp.icone}
              {interp.texto}
            </div>
            <p className={`text-sm mt-1 ${interp.cor} opacity-80`}>{interp.subtexto}</p>
          </div>
        )}

        <button
          onClick={() => { resetForm(); setTelaAtiva('form'); }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Registrar nova avaliação KDIGO
        </button>
      </div>
    );
  }

  // --- Tela: Formulário ---
  if (telaAtiva === 'form') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setTelaAtiva('lista')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-600 dark:text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Nova Avaliação KDIGO</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Selecione o pior critério atingido em cada domínio</p>
          </div>
        </div>

        {/* Critério: Creatinina */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Creatinina sérica
            </label>
            {estagioCreatinina !== null && <IconeCheck />}
          </div>
          <select
            value={estagioCreatinina === null ? '' : estagioCreatinina}
            onChange={(e) => setEstagioCreatinina(e.target.value === '' ? null : Number(e.target.value))}
            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          >
            <option value="">Selecione...</option>
            {criterioCreatinina.map((op) => (
              <option key={op.valor} value={op.valor}>{op.texto}</option>
            ))}
          </select>
        </div>

        {/* Critério: Diurese */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Débito urinário (diurese)
            </label>
            {estagioDiurese !== null && <IconeCheck />}
          </div>
          <select
            value={estagioDiurese === null ? '' : estagioDiurese}
            onChange={(e) => setEstagioDiurese(e.target.value === '' ? null : Number(e.target.value))}
            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          >
            <option value="">Selecione...</option>
            {criterioDiurese.map((op) => (
              <option key={op.valor} value={op.valor}>{op.texto}</option>
            ))}
          </select>
        </div>

        {/* Preview do estágio */}
        {estagioFinal !== null && (
          <div className={`rounded-xl p-3 border ${interpretacaoAtual.bg} ${interpretacaoAtual.border}`}>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Estágio calculado</p>
            <div className={`flex items-center font-bold ${interpretacaoAtual.cor}`}>
              {interpretacaoAtual.icone}
              {interpretacaoAtual.texto}
            </div>
          </div>
        )}

        {erroForm && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3 border border-red-200 dark:border-red-800">
            {erroForm}
          </p>
        )}

        <button
          onClick={handleCalcular}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition"
        >
          Ver resultado
        </button>
      </div>
    );
  }

  // --- Tela: Resultado ---
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setTelaAtiva('form')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-600 dark:text-slate-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Resultado KDIGO</h2>
      </div>

      {/* Card de resultado principal */}
      <div className={`rounded-2xl p-6 border-2 ${interpretacaoAtual.bg} ${interpretacaoAtual.border} text-center`}>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Estágio Final</p>
        <div className={`flex items-center justify-center text-2xl font-extrabold ${interpretacaoAtual.cor} mb-2`}>
          {interpretacaoAtual.icone}
          {interpretacaoAtual.texto}
        </div>
        <p className={`text-sm ${interpretacaoAtual.cor} opacity-80`}>{interpretacaoAtual.subtexto}</p>
      </div>

      {/* Detalhe dos critérios */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Critérios selecionados</p>

        <div className="flex items-start gap-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 whitespace-nowrap">Creatinina</span>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {criterioCreatinina.find(c => c.valor === estagioCreatinina)?.texto ?? '—'}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 whitespace-nowrap">Diurese</span>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {criterioDiurese.find(c => c.valor === estagioDiurese)?.texto ?? '—'}
          </span>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 italic pt-1">
          Estágio final = maior critério entre creatinina (estágio {estagioCreatinina ?? 0}) e diurese (estágio {estagioDiurese ?? 0})
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setTelaAtiva('form')}
          className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          Corrigir
        </button>
        <button
          onClick={handleSalvar}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition"
        >
          Salvar avaliação
        </button>
      </div>
    </div>
  );
};
