
import React, { useState, useMemo, useRef, forwardRef } from 'react';

// ==========================================
// 🧠 DADOS E CONFIGURAÇÃO DAS ESCALAS
// ==========================================

// Definição das opções genéricas para reutilização (Padrão 1-4 e 0-4)
// Adaptamos os textos das opções baseados no conhecimento clínico padrão para estas escalas.

const opts1to4 = [
  { valor: 1, texto: '1 - Muito pobre / Limitado / Grave' },
  { valor: 2, texto: '2 - Inadequado / Muito Limitado' },
  { valor: 3, texto: '3 - Adequado / Levemente Limitado' },
  { valor: 4, texto: '4 - Excelente / Sem Limitação' },
];

const opts0to4 = [
  { valor: 0, texto: '0 - Comprometimento Extremo / Nulo' },
  { valor: 1, texto: '1 - Muito Comprometido' },
  { valor: 2, texto: '2 - Comprometimento Moderado' },
  { valor: 3, texto: '3 - Comprometimento Leve' },
  { valor: 4, texto: '4 - Sem Comprometimento / Normal' },
];

// Configuração completa das perguntas
const escalasConfig = {
  bradenQ: {
    titulo: 'Braden Q (Original)',
    descricao: 'Faixa etária: 21 dias a 8 anos.',
    range: '7 a 28 pontos',
    tipoOpcoes: '1-4', // Indicador para usar opções 1 a 4
    itens: [
      { id: 'mobilidade', label: 'Mobilidade', desc: 'Capacidade de mudar e controlar a posição do corpo.' },
      { id: 'atividade', label: 'Atividade', desc: 'Grau de atividade física.' },
      { id: 'sensorial', label: 'Percepção sensorial', desc: 'Resposta a estímulos e desconforto.' },
      { id: 'umidade', label: 'Umidade', desc: 'Grau de exposição da pele à umidade.' },
      { id: 'friccao', label: 'Fricção/Cisalhamento', desc: 'Risco de danos por atrito.' },
      { id: 'nutricao', label: 'Nutrição', desc: 'Qualidade da ingestão nutricional.' },
      { id: 'perfusao', label: 'Perfusão/Oxigenação', desc: 'Adequação da perfusão tecidual.' },
    ]
  },
  bradenQD: {
    titulo: 'Braden Q Ampliada (QD)',
    descricao: 'Aplicação: UTI Pediátrica, Neonatal e pacientes críticos.',
    range: 'Variável (Max 44)',
    tipoOpcoes: '0-4', // Indicador para usar opções 0 a 4
    itens: [
      { id: 'mobilidade', label: 'Mobilidade', desc: 'Capacidade motora.' },
      { id: 'atividade', label: 'Atividade', desc: 'Nível de atividade.' },
      { id: 'sensorial', label: 'Percepção sensorial', desc: 'Resposta a estímulos.' },
      { id: 'umidade', label: 'Umidade', desc: 'Exposição à umidade.' },
      { id: 'friccao', label: 'Fricção/Cisalhamento', desc: 'Risco mecânico.' },
      { id: 'nutricao', label: 'Nutrição', desc: 'Estado nutricional.' },
      { id: 'perfusao', label: 'Perfusão/Oxigenação', desc: 'Perfusão tecidual.' },
      { id: 'dispositivos', label: 'Dispositivos Médicos', desc: 'Pressão causada por dispositivos.' },
      { id: 'umidadeDisp', label: 'Umidade ass. a dispositivos', desc: 'Vazamentos, secreções.' },
      { id: 'neurologico', label: 'Estado Neurológico', desc: 'Sedação/coma.' },
      { id: 'drogas', label: 'Drogas vasoativas', desc: 'Influência hemodinâmica / perfusão crítica.' },
    ]
  }
};

// ==========================================
// 🧮 LÓGICA DE NEGÓCIO (INTERPRETAÇÃO)
// ==========================================

const calcularInterpretacao = (total: number, tipoEscala: string) => {
  if (tipoEscala === 'bradenQ') {
    // Lógica Braden Q Original
    if (total <= 16) return { texto: 'Alto Risco (≤16)', cor: 'text-red-500', bg: 'bg-red-500', icone: '🚨' };
    if (total <= 20) return { texto: 'Risco Moderado (17-20)', cor: 'text-yellow-500', bg: 'bg-yellow-500', icone: '⚠️' };
    return { texto: 'Baixo Risco (>20)', cor: 'text-green-500', bg: 'bg-green-500', icone: '✅' };
  } else {
    // Lógica Braden QD Ampliada
    if (total <= 18) return { texto: 'Alto Risco (≤18)', cor: 'text-red-500', bg: 'bg-red-500', icone: '🚨' };
    if (total <= 22) return { texto: 'Risco Moderado (19-22)', cor: 'text-yellow-500', bg: 'bg-yellow-500', icone: '⚠️' };
    return { texto: 'Baixo Risco (>22)', cor: 'text-green-500', bg: 'bg-green-500', icone: '✅' };
  }
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

// Componente de Card de Pergunta (Otimizado com forwardRef para scroll)
const QuestionCard = forwardRef<HTMLDivElement, { item: any, valor: number | null, onChange: (val: number | null) => void, opcoes: any[] }>(({ item, valor, onChange, opcoes }, ref) => {
  return (
    <div ref={ref} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-slate-400 dark:hover:border-slate-600">
      <div className="flex justify-between items-start mb-3">
        <div>
          <label className="block text-base font-semibold text-slate-800 dark:text-gray-100">
            {item.label}
          </label>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{item.desc}</p>
        </div>
        {valor !== null && <CheckIcon />}
      </div>
      
      <select
        value={valor === null ? '' : valor}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
      >
        <option value="">Selecione uma opção...</option>
        {opcoes.map((opt) => (
          <option key={opt.valor} value={opt.valor}>
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

interface BradenQDScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string; }) => void;
}

export const BradenQDScale: React.FC<BradenQDScaleProps> = ({ onSaveScore }) => {
  // --- Estado ---
  const [tela, setTela] = useState<'lista' | 'form' | 'resultado'>('lista'); // 'lista', 'form', 'resultado'
  const [escalaAtiva, setEscalaAtiva] = useState<'bradenQ' | 'bradenQD'>('bradenQ'); // 'bradenQ' ou 'bradenQD'
  
  // Estado dinâmico para as respostas (armazena por ID do item)
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  
  // Histórico da última avaliação
  const [ultimoResultado, setUltimoResultado] = useState<any>(null);
  
  // Mensagem de erro
  const [erro, setErro] = useState<string | null>(null);

  // Refs para scroll
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // --- Computados ---
  const configAtual = escalasConfig[escalaAtiva];
  
  // Define quais opções usar baseada na configuração da escala
  const opcoesAtuais = configAtual.tipoOpcoes === '1-4' ? opts1to4 : opts0to4;

  // --- Handlers ---

  const iniciarNovaAvaliacao = () => {
    setRespostas({});
    setErro(null);
    setTela('form');
    // Reset do scroll para o topo (opcional)
  };

  const handleSelectChange = (id: string, valor: number | null) => {
    if (valor === null) return;
    setRespostas(prev => ({ ...prev, [id]: valor }));
    
    // Lógica de Scroll Automático (Fluido)
    const currentIndex = configAtual.itens.findIndex(i => i.id === id);
    const nextItem = configAtual.itens[currentIndex + 1];
    
    if (nextItem && itemRefs.current[nextItem.id]) {
      setTimeout(() => {
        itemRefs.current[nextItem.id]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 150); // Pequeno delay para o utilizador ver o feedback visual
    }
  };

  const calcularResultado = () => {
    // Validação
    const idsPerguntas = configAtual.itens.map(i => i.id);
    const faltamRespostas = idsPerguntas.some(id => respostas[id] === undefined || respostas[id] === null);

    if (faltamRespostas) {
      setErro(`Por favor, responda a todas as ${idsPerguntas.length} perguntas para obter um resultado preciso.`);
      return;
    }

    // Cálculo
    const total = idsPerguntas.reduce((acc, id) => acc + (respostas[id] || 0), 0);
    const interpretacao = calcularInterpretacao(total, escalaAtiva);
    
    setUltimoResultado({
      total,
      interpretacao,
      escalaNome: configAtual.titulo
    });
    
    setTela('resultado');
  };

  const salvarEFechar = () => {
    if (ultimoResultado) {
        onSaveScore({
            scaleName: ultimoResultado.escalaNome,
            score: ultimoResultado.total,
            interpretation: ultimoResultado.interpretacao.texto
        });
    }
    setTela('lista');
    setRespostas({});
    setErro(null);
  };

  // --- Renderização das Telas ---

  // 1. TELA LISTA (Dashboard)
  if (tela === 'lista') {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-900 min-h-[600px] text-slate-800 dark:text-gray-100 font-sans rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-inner mb-6 text-center border border-slate-200 dark:border-slate-700">
          <h2 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2">Última Avaliação</h2>
          
          {ultimoResultado ? (
            <>
              <div className="text-5xl font-extrabold text-slate-900 dark:text-white mb-1">{ultimoResultado.total}</div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">{ultimoResultado.escalaNome}</p>
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${ultimoResultado.interpretacao.bg} bg-opacity-20 border ${ultimoResultado.interpretacao.cor.replace('text', 'border')}`}>
                <span className="text-xl mr-2">{ultimoResultado.interpretacao.icone}</span>
                <span className={`font-bold ${ultimoResultado.interpretacao.cor}`}>{ultimoResultado.interpretacao.texto}</span>
              </div>
            </>
          ) : (
            <div className="text-slate-400 dark:text-gray-500 py-4 italic">Nenhuma avaliação registrada hoje.</div>
          )}
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => { setEscalaAtiva('bradenQ'); iniciarNovaAvaliacao(); }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-between group"
          >
            <div className="text-left">
              <span className="block">Nova Braden Q</span>
              <span className="text-xs font-normal text-blue-200 opacity-80">Original (21d - 8a)</span>
            </div>
            <svg className="w-6 h-6 text-blue-200 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <button 
            onClick={() => { setEscalaAtiva('bradenQD'); iniciarNovaAvaliacao(); }}
            className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-between group border border-slate-200 dark:border-slate-600"
          >
            <div className="text-left">
              <span className="block">Nova Braden QD</span>
              <span className="text-xs font-normal text-slate-500 dark:text-gray-300 opacity-80">Ampliada (UTI Ped/Neo)</span>
            </div>
            <svg className="w-6 h-6 text-gray-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    );
  }

  // 2. TELA FORMULÁRIO
  if (tela === 'form') {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-900 min-h-[600px] text-slate-800 dark:text-gray-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">

        {/* Header */}
        <div className="flex items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setTela('lista')} className="mr-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
            <BackIcon />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{configAtual.titulo}</h2>
            <p className="text-xs text-slate-500 dark:text-gray-500">{configAtual.descricao}</p>
          </div>
        </div>

        {/* Lista de Perguntas */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 pb-20 scrollbar-hide">
          {configAtual.itens.map((item) => (
            <QuestionCard
              key={item.id}
              ref={(el) => { itemRefs.current[item.id] = el; }}
              item={item}
              valor={respostas[item.id] ?? null}
              onChange={(val) => handleSelectChange(item.id, val)}
              opcoes={opcoesAtuais}
            />
          ))}
        </div>

        {/* Footer Fixo */}
        <div className="sticky bottom-0 left-0 right-0 pt-4 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent">
          {erro && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-500 dark:bg-opacity-20 border border-red-300 dark:border-red-500 rounded-lg text-red-600 dark:text-red-200 text-xs text-center animate-pulse">
              {erro}
            </div>
          )}
          <button
            onClick={calcularResultado}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-xl transition-colors text-lg"
          >
            Calcular Risco
          </button>
        </div>
      </div>
    );
  }

  // 3. TELA RESULTADO
  if (tela === 'resultado' && ultimoResultado) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-900 min-h-[600px] text-slate-800 dark:text-gray-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={() => setTela('form')} className="mr-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
            <BackIcon />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resultado</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          <div className="w-40 h-40 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-2xl relative">
            <div className="text-center">
              <span className="block text-6xl font-black text-slate-900 dark:text-white">{ultimoResultado.total}</span>
              <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">PONTOS</span>
            </div>
            {/* Badge flutuante com ícone */}
            <div className="absolute -bottom-2 bg-white dark:bg-slate-900 rounded-full p-2 border border-slate-200 dark:border-slate-700 shadow-lg text-2xl">
              {ultimoResultado.interpretacao.icone}
            </div>
          </div>

          <div className={`w-full p-6 rounded-2xl ${ultimoResultado.interpretacao.bg} bg-opacity-10 border ${ultimoResultado.interpretacao.cor.replace('text', 'border')} text-center mb-6`}>
            <h3 className={`text-2xl font-bold ${ultimoResultado.interpretacao.cor} mb-1`}>
              {ultimoResultado.interpretacao.texto}
            </h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 opacity-80">Classificação de Risco</p>
          </div>

          {/* Detalhes da Interpretação (Regras) */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-5 text-sm text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-700 dark:text-gray-200 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Critérios ({ultimoResultado.escalaNome})</h4>
            <ul className="space-y-2">
              {escalaAtiva === 'bradenQ' ? (
                <>
                  <li className="flex justify-between"><span>Alto Risco:</span> <span className="font-mono text-slate-900 dark:text-white">≤ 16</span></li>
                  <li className="flex justify-between"><span>Risco Moderado:</span> <span className="font-mono text-slate-900 dark:text-white">17 – 20</span></li>
                  <li className="flex justify-between"><span>Baixo Risco:</span> <span className="font-mono text-slate-900 dark:text-white">&gt; 20</span></li>
                </>
              ) : (
                <>
                  <li className="flex justify-between"><span>Alto Risco:</span> <span className="font-mono text-slate-900 dark:text-white">≤ 18</span></li>
                  <li className="flex justify-between"><span>Risco Moderado:</span> <span className="font-mono text-slate-900 dark:text-white">19 – 22</span></li>
                  <li className="flex justify-between"><span>Baixo Risco:</span> <span className="font-mono text-slate-900 dark:text-white">&gt; 22</span></li>
                </>
              )}
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
}
