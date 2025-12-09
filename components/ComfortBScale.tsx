import React, { useState, useMemo, useRef, forwardRef } from 'react';

// ==========================================
// 🧠 DADOS E CONFIGURAÇÃO DA ESCALA
// ==========================================

const opcoesComfortB = {
  alerta: [
    { texto: '1 – Sonolento', valor: 1 },
    { texto: '2 – Acordado, mas não totalmente alerto', valor: 2 },
    { texto: '3 – Alerto', valor: 3 },
    { texto: '4 – Muito alerto / hipervigilante', valor: 4 },
    { texto: '5 – Agitado', valor: 5 },
  ],
  calma: [
    { texto: '1 – Calmo', valor: 1 },
    { texto: '2 – Leve inquietação', valor: 2 },
    { texto: '3 – Moderadamente inquieto', valor: 3 },
    { texto: '4 – Agitado', valor: 4 },
    { texto: '5 – Muito agitado / inconsolável', valor: 5 },
  ],
  // Item 3 Variável
  choro: [ // Para NÃO Intubados
    { texto: '1 – Não chora', valor: 1 },
    { texto: '2 – Geme / choraminga', valor: 2 },
    { texto: '3 – Choro moderado', valor: 3 },
    { texto: '4 – Choro forte', valor: 4 },
    { texto: '5 – Choro intenso / contínuo', valor: 5 },
  ],
  respiracao: [ // Para Intubados
    { texto: '1 – Sem esforço respiratório', valor: 1 },
    { texto: '2 – Leve desconforto respiratório', valor: 2 },
    { texto: '3 – Moderado desconforto respiratório', valor: 3 },
    { texto: '4 – Respiração irregular / agitada', valor: 4 },
    { texto: '5 – Grande esforço respiratório', valor: 5 },
  ],
  movimento: [
    { texto: '1 – Sem movimento', valor: 1 },
    { texto: '2 – Movimentos mínimos', valor: 2 },
    { texto: '3 – Movimentos moderados', valor: 3 },
    { texto: '4 – Movimentos frequentes', valor: 4 },
    { texto: '5 – Movimentos intensos / desorganizados', valor: 5 },
  ],
  tonus: [
    { texto: '1 – Relaxado', valor: 1 },
    { texto: '2 – Levemente aumentado', valor: 2 },
    { texto: '3 – Aumentado', valor: 3 },
    { texto: '4 – Muito aumentado', valor: 4 },
    { texto: '5 – Extremamente rígido', valor: 5 },
  ],
  tensao: [
    { texto: '1 – Sem tensão', valor: 1 },
    { texto: '2 – Leve tensão', valor: 2 },
    { texto: '3 – Moderada tensão', valor: 3 },
    { texto: '4 – Tensão evidente', valor: 4 },
    { texto: '5 – Tensão extrema / expressão de dor', valor: 5 },
  ],
};

// ==========================================
// 🧮 LÓGICA DE NEGÓCIO (INTERPRETAÇÃO)
// ==========================================

const getInterpretacaoComfortB = (total) => {
  if (total <= 10) {
    return { texto: 'Sedação Excessiva (6–10)', cor: 'text-blue-400', icone: '🔵', bg: 'bg-blue-400' };
  }
  if (total <= 22) {
    return { texto: 'Conforto Adequado (11–22)', cor: 'text-green-400', icone: '✅', bg: 'bg-green-400' };
  }
  // 23 a 30
  return { texto: 'Dor/Desconforto Importante (23–30)', cor: 'text-red-400', icone: '🚨', bg: 'bg-red-400' };
};

// ==========================================
// ⚛️ COMPONENTES VISUAIS (UI)
// ==========================================

// Ícone de Check Simples
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Ícone de Voltar
const BackIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// Componente de Card de Pergunta
const QuestionCard = forwardRef(({ label, id, valor, onChange, opcoes }, ref) => {
  return (
    <div ref={ref} className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700 transition-all duration-300 hover:border-slate-600">
      <div className="flex justify-between items-start mb-3">
        <div>
          <label className="block text-base font-semibold text-gray-100">
            {label}
          </label>
          <p className="text-xs text-gray-400 mt-1">Pontuação: 1 a 5</p>
        </div>
        {valor != null && <CheckIcon />}
      </div>
      
      <select
        value={valor === null ? '' : valor}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
      >
        <option value="">Selecione a resposta...</option>
        {opcoes.map((opt, index) => (
          <option key={index} value={opt.valor}>
            {opt.texto}
          </option>
        ))}
      </select>
    </div>
  );
});

// ==========================================
// 🚀 APLICAÇÃO PRINCIPAL
// ==========================================

interface ComfortBScaleProps {
  onSaveScore?: (data: { scaleName: string; score: number; interpretation: string }) => void;
}

export const ComfortBScale: React.FC<ComfortBScaleProps> = ({ onSaveScore }) => {
  // --- Estado ---
  const [tela, setTela] = useState('lista'); // 'lista', 'form', 'resultado'
  
  // Estado para Intubação (define qual pergunta 3 usar)
  const [isIntubado, setIsIntubado] = useState(false);

  // Estado para as respostas
  const [respostas, setRespostas] = useState({});
  
  // Histórico
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const [erro, setErro] = useState(null);

  // Refs para scroll
  const refs = {
    alerta: useRef(null),
    calma: useRef(null),
    var3: useRef(null), // Item 3 (Choro ou Respiração)
    movimento: useRef(null),
    tonus: useRef(null),
    tensao: useRef(null),
  };

  // --- Computados ---
  const ultimaInterpretacao = useMemo(
    () => ultimoResultado ? getInterpretacaoComfortB(ultimoResultado.total) : null,
    [ultimoResultado]
  );
  
  const pontuacaoTotalCalculada = useMemo(() => {
    // Soma os valores das respostas (ignorando null/undefined)
    return Object.values(respostas).reduce((acc: number, val: any) => acc + ((val as number) || 0), 0);
  }, [respostas]);
  
  const interpretacaoAtual = useMemo(() => getInterpretacaoComfortB(pontuacaoTotalCalculada), [pontuacaoTotalCalculada]);

  // --- Handlers ---

  const iniciarNovaAvaliacao = () => {
    setRespostas({});
    setErro(null);
    setTela('form');
  };

  const handleSelectChange = (id, valor, nextRef) => {
    setRespostas(prev => ({ ...prev, [id]: valor }));
    
    // Scroll fluido
    if (nextRef && nextRef.current && valor != null) {
      setTimeout(() => {
        nextRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 150);
    }
  };

  const calcularResultado = () => {
    // A escala tem sempre 6 itens
    if (Object.keys(respostas).length < 6) {
      setErro(`Por favor, responda a todos os 6 itens da escala para obter um resultado preciso.`);
      return;
    }

    const total = pontuacaoTotalCalculada;
    const interpretation = getInterpretacaoComfortB(total);
    
    setUltimoResultado({
      total: total,
    });
    
    // Salvar no callback se fornecido
    if (onSaveScore) {
      onSaveScore({
        scaleName: 'COMFORT-B',
        score: total,
        interpretation: interpretation.texto
      });
    }
    
    setTela('resultado');
  };

  const salvarEFechar = () => {
    setTela('lista');
    setRespostas({});
    setErro(null);
  };

  // --- Renderização das Telas ---

  // 1. TELA LISTA
  if (tela === 'lista') {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-900 min-h-[600px] text-gray-100 font-sans rounded-xl shadow-2xl border border-slate-800">
        <div className="bg-slate-800 p-6 rounded-xl shadow-inner mb-6 text-center border border-slate-700">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Última Avaliação COMFORT-B</h2>
          
          {ultimoResultado ? (
            <>
              <div className="text-5xl font-extrabold text-white mb-1">{ultimoResultado.total}</div>
              <p className="text-xs text-gray-400 mb-4">Pontuação Total (6 a 30)</p>
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${ultimaInterpretacao.bg} bg-opacity-20 border ${ultimaInterpretacao.cor.replace('text', 'border')}`}>
                <span className="text-xl mr-2">{ultimaInterpretacao.icone}</span>
                <span className={`font-bold ${ultimaInterpretacao.cor}`}>{ultimaInterpretacao.texto}</span>
              </div>
            </>
          ) : (
            <div className="text-gray-500 py-4 italic">Nenhuma avaliação registrada hoje.</div>
          )}
        </div>

        <div className="space-y-3">
          <button 
            onClick={iniciarNovaAvaliacao}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center group"
          >
            Nova Avaliação COMFORT-B
          </button>
        </div>
      </div>
    );
  }

  // 2. TELA FORMULÁRIO
  if (tela === 'form') {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-900 min-h-[600px] text-gray-100 rounded-xl shadow-2xl border border-slate-800 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center mb-6 pb-4 border-b border-slate-800">
          <button onClick={() => setTela('lista')} className="mr-4 p-2 hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <BackIcon />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">COMFORT-B</h2>
            <p className="text-xs text-gray-500">Dor e Sedação (Máx. 30 pts)</p>
          </div>
        </div>

        {/* Toggle Intubado */}
        <div className="mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <span className="block text-sm font-semibold text-gray-300 mb-3 text-center">Situação do Paciente</span>
          <div className="flex bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => { setIsIntubado(false); setRespostas({}); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isIntubado ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Não Intubado
            </button>
            <button
              onClick={() => { setIsIntubado(true); setRespostas({}); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isIntubado ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Intubado
            </button>
          </div>
        </div>

        {/* Lista de Perguntas */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 pb-20 scrollbar-hide">
          
          <QuestionCard
            ref={refs.alerta}
            label="1. Alerta (Alertness)"
            id="alerta"
            valor={respostas.alerta}
            onChange={(val) => handleSelectChange('alerta', val, refs.calma)}
            opcoes={opcoesComfortB.alerta}
          />
          <QuestionCard
            ref={refs.calma}
            label="2. Calma / Agitação (Calmness)"
            id="calma"
            valor={respostas.calma}
            onChange={(val) => handleSelectChange('calma', val, refs.var3)}
            opcoes={opcoesComfortB.calma}
          />
          
          {/* Pergunta 3 Variável */}
          {isIntubado ? (
            <QuestionCard
              ref={refs.var3}
              label="3. Respiração (Respiratory Response)"
              id="respiracao"
              valor={respostas.respiracao}
              onChange={(val) => handleSelectChange('respiracao', val, refs.movimento)}
              opcoes={opcoesComfortB.respiracao}
            />
          ) : (
            <QuestionCard
              ref={refs.var3}
              label="3. Choro (Crying)"
              id="choro"
              valor={respostas.choro}
              onChange={(val) => handleSelectChange('choro', val, refs.movimento)}
              opcoes={opcoesComfortB.choro}
            />
          )}

          <QuestionCard
            ref={refs.movimento}
            label="4. Movimentos Físicos (Physical Movement)"
            id="movimento"
            valor={respostas.movimento}
            onChange={(val) => handleSelectChange('movimento', val, refs.tonus)}
            opcoes={opcoesComfortB.movimento}
          />
          <QuestionCard
            ref={refs.tonus}
            label="5. Tônus Corporal (Muscle Tone)"
            id="tonus"
            valor={respostas.tonus}
            onChange={(val) => handleSelectChange('tonus', val, refs.tensao)}
            opcoes={opcoesComfortB.tonus}
          />
          <QuestionCard
            ref={refs.tensao}
            label="6. Tensão Facial (Facial Tension)"
            id="tensao"
            valor={respostas.tensao}
            onChange={(val) => handleSelectChange('tensao', val, null)} // Último item
            opcoes={opcoesComfortB.tensao}
          />
        </div>

        {/* Footer Fixo */}
        <div className="sticky bottom-0 left-0 right-0 pt-4 bg-gradient-to-t from-slate-900 to-transparent">
          {erro && (
            <div className="mb-3 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200 text-xs text-center animate-pulse">
              {erro}
            </div>
          )}
          <button
            onClick={calcularResultado}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-xl transition-colors text-lg"
          >
            Calcular Pontuação (Total: {pontuacaoTotalCalculada})
          </button>
        </div>
      </div>
    );
  }

  // 3. TELA RESULTADO
  if (tela === 'resultado') {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-900 min-h-[600px] text-gray-100 rounded-xl shadow-2xl border border-slate-800 flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={() => setTela('form')} className="mr-4 p-2 hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <BackIcon />
          </button>
          <h2 className="text-xl font-bold text-white">Resultado COMFORT-B</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          <div className="w-40 h-40 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-6 shadow-2xl relative">
            <div className="text-center">
              <span className="block text-6xl font-black text-white">{ultimoResultado.total}</span>
              <span className="text-xs text-gray-400 font-medium">PONTOS</span>
            </div>
            <div className="absolute -bottom-2 bg-slate-900 rounded-full p-2 border border-slate-700 shadow-lg text-2xl">
              {interpretacaoAtual.icone}
            </div>
          </div>

          <div className={`w-full p-6 rounded-2xl ${interpretacaoAtual.bg} bg-opacity-10 border ${interpretacaoAtual.cor.replace('text', 'border')} text-center mb-6`}>
            <h3 className={`text-2xl font-bold ${interpretacaoAtual.cor} mb-1`}>
              {interpretacaoAtual.texto}
            </h3>
            <p className="text-sm text-gray-400 opacity-80">Classificação</p>
          </div>

          {/* Detalhes da Interpretação (Regras) */}
          <div className="w-full bg-slate-800 rounded-xl p-5 text-sm text-gray-400 border border-slate-700">
            <h4 className="font-bold text-gray-200 mb-3 border-b border-slate-700 pb-2">Critérios de Classificação</h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Conforto Adequado:</span> 
                <span className="font-mono text-green-400 font-bold">11 – 22</span>
              </li>
              <li className="flex justify-between">
                <span>Sedação Excessiva:</span> 
                <span className="font-mono text-blue-400 font-bold">6 – 10</span>
              </li>
              <li className="flex justify-between">
                <span>Dor / Desconforto:</span> 
                <span className="font-mono text-red-400 font-bold">23 – 30</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={salvarEFechar}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors"
        >
          Salvar e Concluir
        </button>
      </div>
    );
  }

  return null;
};
