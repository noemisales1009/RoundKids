import React, { useState, useMemo, useRef, forwardRef } from 'react';

type EscalaFLACCKey = 'flacc' | 'flacc_r';

// --- Constante com Todos os Dados da Escala FLACC e FLACC-R ---
// (Baseado no ficheiro FLACC_FLACCR_Interpretacao.docx)
const escalaFLACCOpcoes = {
  flacc: {
    nome: 'FLACC (Padrão)',
    face: [
      { texto: '0 - Expressão relaxada', valor: 0 },
      { texto: '1 - Careta ocasional', valor: 1 },
      { texto: '2 - Contração facial constante, testa franzida', valor: 2 },
    ],
    pernas: [
      { texto: '0 - Tônus normal', valor: 0 },
      { texto: '1 - Inquietas / irrequietas', valor: 1 },
      { texto: '2 - Retraídas, tensas', valor: 2 },
    ],
    atividade: [
      { texto: '0 - Postura normal', valor: 0 },
      { texto: '1 - Tensão leve, movimentos limitados', valor: 1 },
      { texto: '2 - Arqueamento, rigidez', valor: 2 },
    ],
    choro: [
      { texto: '0 - Sem choro', valor: 0 },
      { texto: '1 - Gemidos intermitentes', valor: 1 },
      { texto: '2 - Choro constante ou silencioso (intubado)', valor: 2 },
    ],
    consolabilidade: [
      { texto: '0 - Consolado facilmente', valor: 0 },
      { texto: '1 - Confortado com dificuldade', valor: 1 },
      { texto: '2 - Inconsolável', valor: 2 },
    ],
  },
  flacc_r: {
    nome: 'FLACC-R (Revisada - Neurológica)',
    face: [
      { texto: '0 - Expressão habitual', valor: 0 },
      { texto: '1 - Expressão alterada moderada', valor: 1 },
      { texto: '2 - Expressão intensa diferente do basal', valor: 2 },
    ],
    pernas: [
      { texto: '0 - Movimentos habituais', valor: 0 },
      { texto: '1 - Aumento discreto do tônus', valor: 1 },
      { texto: '2 - Espasticidade / distonias importantes', valor: 2 },
    ],
    atividade: [
      { texto: '0 - Movimentos ou postura habituais', valor: 0 },
      { texto: '1 - Movimentos involuntários aumentados', valor: 1 },
      { texto: '2 - Rigidez intensa ou postura anormal', valor: 2 },
    ],
    choro: [ // O documento chama de "Vocalização/sons"
      { texto: '0 - Sons habituais', valor: 0 },
      { texto: '1 - Vocalizações diferentes do basal', valor: 1 },
      { texto: '2 - Sons persistentes indicativos de dor', valor: 2 },
    ],
    consolabilidade: [
      { texto: '0 - Consolável sem dificuldade', valor: 0 },
      { texto: '1 - Necessita mais tempo', valor: 1 },
      { texto: '2 - Inconsolável', valor: 2 },
    ],
  }
};

// --- ÍCONES DE STATUS ---
const IconeCheckVerde = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

const IconeAlertaAmarelo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V5.75A.75.75 0 0110 5zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const IconeSireneVermelha = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path d="M11.5 1.046a.75.75 0 01.038 1.498l-.001.002A6.5 6.5 0 005.002 9.03L5 9.031a.75.75 0 01-1.498-.038L3.5 9A7.5 7.5 0 0111.5 1.046zM14.502 9.03a.75.75 0 01-1.498.038l.001-.002A6.5 6.5 0 008.5 2.546a.75.75 0 01.038-1.498L8.5 1A7.5 7.5 0 0114.502 9.03z" />
    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 3zM1.046 8.5a.75.75 0 011.498.038L2.546 8.5A6.5 6.5 0 009.03 14.998l.002.001a.75.75 0 01-.038 1.498L9 16.5A7.5 7.5 0 011.046 8.5zM16.5 9A7.5 7.5 0 019 16.5a.75.75 0 01-1.498-.038l.001.002A6.5 6.5 0 0011.5 9.96l-.002-.001a.75.75 0 01.038-1.498L11.5 8.5zM10 17a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 17z" clipRule="evenodd" />
  </svg>
);

// --- Lógica de Interpretação (Escores de Funcionalidade) ---
// Pontuação total varia de 0 a 10.
const getInterpretacaoFLACC = (total: number) => {
  if (total === 0) {
    return { texto: 'Sem Dor (0)', cor: 'text-green-400', icone: <IconeCheckVerde /> };
  }
  if (total <= 3) {
    return { texto: 'Dor Leve (1-3)', cor: 'text-green-400', icone: <IconeCheckVerde /> };
  }
  if (total <= 6) {
    return { texto: 'Dor Moderada (4-6)', cor: 'text-yellow-400', icone: <IconeAlertaAmarelo /> };
  }
  // 7 a 10
  return { texto: 'Dor Intensa (7-10)', cor: 'text-red-400', icone: <IconeSireneVermelha /> };
};

// --- Ícone de Check (Formulário) ---
const IconeCheck = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-5 h-5 text-green-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

// --- Ícone de Voltar (SVG) ---
const IconeVoltar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

interface DropdownFLACCProps {
    label: string;
    id: string;
    valor: number | null;
    onOpcaoChange: (v: number | null) => void;
    opcoes: { texto: string, valor: number }[];
}


// --- Componente de Dropdown Reutilizável ---
const DropdownFLACC = forwardRef<HTMLDivElement, DropdownFLACCProps>(({ label, id, valor, onOpcaoChange, opcoes }, ref) => (
  <div ref={ref} className="bg-slate-800 p-4 rounded-lg shadow-lg transition-all duration-300">
    <div className="flex justify-between items-center mb-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      {valor !== null && <IconeCheck />}
    </div>
    <select
      id={id}
      value={valor === null ? '' : valor}
      onChange={(e) => onOpcaoChange(e.target.value === '' ? null : Number(e.target.value))}
      className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">Selecione...</option>
      {opcoes.map((opt) => (
        <option key={opt.texto} value={opt.valor}>
          {opt.texto}
        </option>
      ))}
    </select>
  </div>
));

// Fix: Add onSaveScore prop to allow saving the score
interface FLACCScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string; }) => void;
}

// --- Componente Principal da Aba ---
export const FLACCScale: React.FC<FLACCScaleProps> = ({ onSaveScore }) => {
  // --- Estados Principais ---
  const [telaAtiva, setTelaAtiva] = useState<'lista' | 'form' | 'resultado'>('lista');
  const [ultimaPontuacao, setUltimaPontuacao] = useState({ total: 0 }); // Começa sem dor

  // --- Estados do Formulário ---
  const [escala, setEscala] = useState<EscalaFLACCKey>('flacc');
  const [pontuacaoFace, setPontuacaoFace] = useState<number | null>(null);
  const [pontuacaoPernas, setPontuacaoPernas] = useState<number | null>(null);
  const [pontuacaoAtividade, setPontuacaoAtividade] = useState<number | null>(null);
  const [pontuacaoChoro, setPontuacaoChoro] = useState<number | null>(null);
  const [pontuacaoConsolabilidade, setPontuacaoConsolabilidade] = useState<number | null>(null);

  const [erroForm, setErroForm] = useState<string | null>(null);
  const [pontuacaoTotalCalculada, setPontuacaoTotalCalculada] = useState(0);

  // --- Refs para a Navegação Fluida ---
  const refEscala = useRef<HTMLDivElement>(null);
  const refFace = useRef<HTMLDivElement>(null);
  const refPernas = useRef<HTMLDivElement>(null);
  const refAtividade = useRef<HTMLDivElement>(null);
  const refChoro = useRef<HTMLDivElement>(null);
  const refConsolabilidade = useRef<HTMLDivElement>(null);

  // Pega as opções corretas dos dropdowns com base na escala selecionada
  const opcoesAtuais = escalaFLACCOpcoes[escala];

  // --- Lógicas de Cálculo (useMemo) ---
  const ultimaInterpretacao = useMemo(
    () => getInterpretacaoFLACC(ultimaPontuacao.total),
    [ultimaPontuacao]
  );

  const interpretacaoAtual = useMemo(
    () => getInterpretacaoFLACC(pontuacaoTotalCalculada),
    [pontuacaoTotalCalculada]
  );

  // --- Funções de Ação ---
  const resetForm = () => {
    setEscala('flacc');
    setPontuacaoFace(null);
    setPontuacaoPernas(null);
    setPontuacaoAtividade(null);
    setPontuacaoChoro(null);
    setPontuacaoConsolabilidade(null);
    setPontuacaoTotalCalculada(0);
    setErroForm(null);
  };
  
  // Limpa os campos ao trocar a escala
  const handleTrocaEscala = (novaEscala: EscalaFLACCKey) => {
    setEscala(novaEscala);
    setPontuacaoFace(null);
    setPontuacaoPernas(null);
    setPontuacaoAtividade(null);
    setPontuacaoChoro(null);
    setPontuacaoConsolabilidade(null);
    // Rola para o próximo item
    setTimeout(() => refFace.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  // Navegação Fluida
  const handleDropdownChange = (setter: (v: number | null) => void, value: number | null, nextRef: React.RefObject<HTMLDivElement> | null) => {
    setter(value);
    if (nextRef && nextRef.current && value !== null) {
      setTimeout(() => {
        nextRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  };

  // Ação do botão "Calcular"
  const handleCalcular = () => {
    setErroForm(null);
    const campos = [
      pontuacaoFace,
      pontuacaoPernas,
      pontuacaoAtividade,
      pontuacaoChoro,
      pontuacaoConsolabilidade
    ];

    if (campos.some(v => v === null)) {
      setErroForm("Por favor, preencha todos os 5 campos da escala.");
      return;
    }

    const total = campos.reduce((acc, val) => acc! + val!, 0);
    setPontuacaoTotalCalculada(total);
    setTelaAtiva('resultado');
  };

  // Ação do botão "Salvar e Fechar"
  const handleSalvar = () => {
    setUltimaPontuacao({
      total: pontuacaoTotalCalculada,
    });
    // Fix: Call onSaveScore with the scale data
    onSaveScore({
      scaleName: `FLACC (${opcoesAtuais.nome})`,
      score: pontuacaoTotalCalculada,
      interpretation: interpretacaoAtual.texto,
    });
    resetForm();
    setTelaAtiva('lista');
  };

  // --- Renderização ---
  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-slate-900 text-gray-300 rounded-lg min-h-[600px]">
      
      {/* --- TELA 1: LISTA (Principal) --- */}
      {telaAtiva === 'lista' && (
        <div className="flex flex-col space-y-4">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              ÚLTIMA AVALIAÇÃO FLACC / FLACC-R
            </h2>
            <div className="flex items-baseline justify-center space-x-1">
              <span className="text-6xl font-bold text-white">
                {ultimaPontuacao.total}
              </span>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className={`bg-slate-700 p-4 rounded-lg ${ultimaInterpretacao.cor} font-medium`}>
                <div className="flex items-center justify-center">
                  {ultimaInterpretacao.icone}
                  <span>{ultimaInterpretacao.texto}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setTelaAtiva('form');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-200"
          >
            Registrar Nova Avaliação FLACC
          </button>
        </div>
      )}

      {/* --- TELA 2: FORMULÁRIO --- */}
      {telaAtiva === 'form' && (
        <div className="flex flex-col space-y-4">
          {/* Cabeçalho do Formulário */}
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => setTelaAtiva('lista')}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-slate-700"
            >
              <IconeVoltar />
            </button>
            <h2 className="text-xl font-semibold text-white">
              Nova Avaliação FLACC
            </h2>
          </div>
          
          {/* Seletor de Escala (Padrão ou R) */}
          <div ref={refEscala} className="bg-slate-800 p-4 rounded-lg shadow-lg">
            <label
              htmlFor="escala"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              1. Selecione o Tipo de Escala
            </label>
            <select
              id="escala"
              value={escala}
              onChange={(e) => handleTrocaEscala(e.target.value as EscalaFLACCKey)}
              className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="flacc">{escalaFLACCOpcoes.flacc.nome}</option>
              <option value="flacc_r">{escalaFLACCOpcoes.flacc_r.nome}</option>
            </select>
          </div>

          {/* Os 5 Dropdowns da Escala */}
          <DropdownFLACC
            ref={refFace}
            label="2. Face (Rosto)"
            id="face"
            valor={pontuacaoFace}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoFace, val, refPernas)}
            opcoes={opcoesAtuais.face}
          />
          <DropdownFLACC
            ref={refPernas}
            label="3. Legs (Pernas)"
            id="pernas"
            valor={pontuacaoPernas}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoPernas, val, refAtividade)}
            opcoes={opcoesAtuais.pernas}
          />
          <DropdownFLACC
            ref={refAtividade}
            label="4. Activity (Atividade)"
            id="atividade"
            valor={pontuacaoAtividade}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoAtividade, val, refChoro)}
            opcoes={opcoesAtuais.atividade}
          />
          <DropdownFLACC
            ref={refChoro}
            label={escala === 'flacc' ? '5. Cry (Choro)' : '5. Vocalização/Sons'}
            id="choro"
            valor={pontuacaoChoro}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoChoro, val, refConsolabilidade)}
            opcoes={opcoesAtuais.choro}
          />
          <DropdownFLACC
            ref={refConsolabilidade}
            label="6. Consolability (Consolabilidade)"
            id="consolabilidade"
            valor={pontuacaoConsolabilidade}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoConsolabilidade, val, null)} // Último item
            opcoes={opcoesAtuais.consolabilidade}
          />
          
          {/* Mensagem de Erro */}
          {erroForm && (
            <div className="text-red-400 text-sm p-3 bg-slate-700 rounded-lg text-center">
              {erroForm}
            </div>
          )}
          
          <button
            onClick={handleCalcular}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 mt-4"
          >
            Calcular Pontuação
          </button>
        </div>
      )}

      {/* --- TELA 3: RESULTADO --- */}
      {telaAtiva === 'resultado' && (
        <div className="flex flex-col space-y-6">
          {/* Cabeçalho do Resultado */}
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => setTelaAtiva('form')} // Volta para o formulário
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-slate-700"
            >
              <IconeVoltar />
            </button>
            <h2 className="text-xl font-semibold text-white">
              Resultado da Avaliação
            </h2>
          </div>
          
          {/* Pontuação Total */}
          <div className="text-center my-8">
            <div className="flex items-baseline justify-center space-x-2">
              <span className="text-8xl font-bold text-white">
                {pontuacaoTotalCalculada}
              </span>
            </div>
          </div>

          {/* Card de Interpretação de Risco */}
          <div className="grid grid-cols-1 gap-4">
            <div className={`bg-slate-800 p-5 rounded-lg shadow-lg text-lg ${interpretacaoAtual.cor} font-semibold text-center`}>
              <div className="flex items-center justify-center">
                {interpretacaoAtual.icone}
                <span>{interpretacaoAtual.texto}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSalvar}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 mt-6"
          >
            Salvar e Fechar
          </button>
        </div>
      )}
    </div>
  );
};
