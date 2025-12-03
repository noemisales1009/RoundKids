import React, { useState, useMemo, useRef, forwardRef } from 'react';

// --- Constante com Todos os Dados da Escala COMFORT-B ---
// (Baseado no ficheiro Comfort_B_Escala_Completa.docx)
const escalaComfortBOpcoes = {
  alerta: [
    { texto: '1 - Sonolento', valor: 1 },
    { texto: '2 - Acordado, mas não totalmente alerta', valor: 2 },
    { texto: '3 - Alerta', valor: 3 },
    { texto: '4 - Muito alerta / hipervigilante', valor: 4 },
    { texto: '5 - Agitado', valor: 5 },
  ],
  calma: [
    { texto: '1 - Calmo', valor: 1 },
    { texto: '2 - Leve inquietação', valor: 2 },
    { texto: '3 - Moderadamente inquieto', valor: 3 },
    { texto: '4 - Agitado', valor: 4 },
    { texto: '5 - Muito agitado / inconsolável', valor: 5 },
  ],
  choro: [ // Para NÃO intubados
    { texto: '1 - Não chora', valor: 1 },
    { texto: '2 - Geme / choraminga', valor: 2 },
    { texto: '3 - Choro moderado', valor: 3 },
    { texto: '4 - Choro forte', valor: 4 },
    { texto: '5 - Choro intenso / contínuo', valor: 5 },
  ],
  respiracao: [ // Para INTUBADOS
    { texto: '1 - Sem esforço respiratório', valor: 1 },
    { texto: '2 - Leve desconforto respiratório', valor: 2 },
    { texto: '3 - Moderado desconforto respiratório', valor: 3 },
    { texto: '4 - Respiração irregular / agitada', valor: 4 },
    { texto: '5 - Grande esforço respiratório', valor: 5 },
  ],
  movimento: [
    { texto: '1 - Sem movimento', valor: 1 },
    { texto: '2 - Movimentos mínimos', valor: 2 },
    { texto: '3 - Movimentos moderados', valor: 3 },
    { texto: '4 - Movimentos frequentes', valor: 4 },
    { texto: '5 - Movimentos intensos / desorganizados', valor: 5 },
  ],
  tonus: [
    { texto: '1 - Relaxado', valor: 1 },
    { texto: '2 - Levemente aumentado', valor: 2 },
    { texto: '3 - Aumentado', valor: 3 },
    { texto: '4 - Muito aumentado', valor: 4 },
    { texto: '5 - Extremamente rígido', valor: 5 },
  ],
  tensaoFacial: [
    { texto: '1 - Sem tensão', valor: 1 },
    { texto: '2 - Leve tensão', valor: 2 },
    { texto: '3 - Moderada tensão', valor: 3 },
    { texto: '4 - Tensão evidente', valor: 4 },
    { texto: '5 - Tensão extrema / expressão de dor', valor: 5 },
  ],
};

// --- NOVOS ÍCONES DE STATUS ---
const IconeCheckVerde = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

const IconeLuaAzul = () => ( // Ícone para Sedação Excessiva
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

const IconeSireneVermelha = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path d="M11.5 1.046a.75.75 0 01.038 1.498l-.001.002A6.5 6.5 0 005.002 9.03L5 9.031a.75.75 0 01-1.498-.038L3.5 9A7.5 7.5 0 0111.5 1.046zM14.502 9.03a.75.75 0 01-1.498.038l.001-.002A6.5 6.5 0 008.5 2.546a.75.75 0 01.038-1.498L8.5 1A7.5 7.5 0 0114.502 9.03z" />
    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 3zM1.046 8.5a.75.75 0 011.498.038L2.546 8.5A6.5 6.5 0 009.03 14.998l.002.001a.75.75 0 01-.038 1.498L9 16.5A7.5 7.5 0 011.046 8.5zM16.5 9A7.5 7.5 0 019 16.5a.75.75 0 01-1.498-.038l.001.002A6.5 6.5 0 0011.5 9.96l-.002-.001a.75.75 0 01.038-1.498L11.5 8.5zM10 17a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 17z" clipRule="evenodd" />
  </svg>
);


// --- Lógica de Interpretação (Escores de Funcionalidade) ---
// Pontuação total varia de 6 a 30.
const getInterpretacaoComfortB = (total: number) => {
  if (total <= 10) {
    // 6 a 10
    return { texto: 'Sedação Excessiva (6-10)', cor: 'text-blue-400', icone: <IconeLuaAzul /> };
  }
  if (total <= 22) {
    // 11 a 22
    return { texto: 'Conforto Adequado (11-22)', cor: 'text-green-400', icone: <IconeCheckVerde /> };
  }
  // 23 a 30
  return { texto: 'Dor/Desconforto Importante (23-30)', cor: 'text-red-400', icone: <IconeSireneVermelha /> };
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

// --- Componente de Dropdown Reutilizável ---
const DropdownComfortB = forwardRef<HTMLDivElement, { label: string, id: string, valor: number | null, onOpcaoChange: (v: number | null) => void, opcoes: {texto: string, valor: number}[] }>(({ label, id, valor, onOpcaoChange, opcoes }, ref) => (
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

interface ComfortBScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string; }) => void;
}

// --- Componente Principal da Aba ---
export const ComfortBScale: React.FC<ComfortBScaleProps> = ({ onSaveScore }) => {
  // --- Estados Principais ---
  const [telaAtiva, setTelaAtiva] = useState('lista'); // 'lista', 'form', 'resultado'
  const [ultimaPontuacao, setUltimaPontuacao] = useState({ total: 12 }); // Começa em "conforto adequado"

  // --- Estados do Formulário ---
  const [isIntubado, setIsIntubado] = useState(false); // Pergunta chave
  const [pontuacaoAlerta, setPontuacaoAlerta] = useState<number | null>(null);
  const [pontuacaoCalma, setPontuacaoCalma] = useState<number | null>(null);
  const [pontuacaoChoroResp, setPontuacaoChoroResp] = useState<number | null>(null); // Pontuação do item 3 (Choro OU Respiração)
  const [pontuacaoMovimento, setPontuacaoMovimento] = useState<number | null>(null);
  const [pontuacaoTonus, setPontuacaoTonus] = useState<number | null>(null);
  const [pontuacaoTensaoFacial, setPontuacaoTensaoFacial] = useState<number | null>(null);

  const [erroForm, setErroForm] = useState<string | null>(null);
  const [pontuacaoTotalCalculada, setPontuacaoTotalCalculada] = useState(0);

  // --- Refs para a Navegação Fluida ---
  const refAlerta = useRef<HTMLDivElement>(null);
  const refCalma = useRef<HTMLDivElement>(null);
  const refChoroResp = useRef<HTMLDivElement>(null); // Ref para o item 3
  const refMovimento = useRef<HTMLDivElement>(null);
  const refTonus = useRef<HTMLDivElement>(null);
  const refTensaoFacial = useRef<HTMLDivElement>(null);

  // --- Lógicas de Cálculo (useMemo) ---
  const ultimaInterpretacao = useMemo(
    () => getInterpretacaoComfortB(ultimaPontuacao.total),
    [ultimaPontuacao]
  );

  const interpretacaoAtual = useMemo(
    () => getInterpretacaoComfortB(pontuacaoTotalCalculada),
    [pontuacaoTotalCalculada]
  );

  // --- Funções de Ação ---
  const resetForm = () => {
    setIsIntubado(false);
    setPontuacaoAlerta(null);
    setPontuacaoCalma(null);
    setPontuacaoChoroResp(null);
    setPontuacaoMovimento(null);
    setPontuacaoTonus(null);
    setPontuacaoTensaoFacial(null);
    setPontuacaoTotalCalculada(0);
    setErroForm(null);
  };

  // Navegação Fluida
  const handleDropdownChange = (setter: (v: number | null) => void, value: number | null, nextRef: React.RefObject<HTMLDivElement>) => {
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
  
  // Ação especial para o Toggle
  const handleToggleIntubado = () => {
      const novoEstado = !isIntubado;
      setIsIntubado(novoEstado);
      // Limpa a pontuação do item 3, pois as opções mudaram
      setPontuacaoChoroResp(null); 
      // Foca no primeiro item após o toggle
      setTimeout(() => refAlerta.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  // Ação do botão "Calcular"
  const handleCalcular = () => {
    setErroForm(null);
    const campos = [
      pontuacaoAlerta,
      pontuacaoCalma,
      pontuacaoChoroResp,
      pontuacaoMovimento,
      pontuacaoTonus,
      pontuacaoTensaoFacial
    ];

    if (campos.some(v => v === null)) {
      setErroForm("Por favor, preencha todos os 6 campos da escala.");
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
    onSaveScore({
        scaleName: 'COMFORT-B',
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
              ÚLTIMA AVALIAÇÃO COMFORT-B
            </h2>
            <div className="flex items-baseline justify-center space-x-1">
              <span className="text-6xl font-bold text-white">
                {ultimaPontuacao.total}
              </span>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className={`bg-slate-700 p-4 rounded-lg ${ultimaInterpretacao.cor} font-medium`}>
                {/* --- MODIFICADO: Adiciona ícone --- */}
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
            Registrar Nova Avaliação COMFORT-B
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
              Nova Avaliação COMFORT-B
            </h2>
          </div>

          {/* Toggle Intubado */}
          <div className="bg-slate-800 p-4 rounded-lg shadow-lg flex items-center justify-between">
            <label htmlFor="intubadoToggle" className="text-sm font-medium text-gray-300">
              O paciente está INTUBADO?
            </label>
            <button
              id="intubadoToggle"
              onClick={handleToggleIntubado}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                isIntubado ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  isIntubado ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Os 6 Dropdowns da Escala */}
          <DropdownComfortB
            ref={refAlerta}
            label="1. Alerta"
            id="alerta"
            valor={pontuacaoAlerta}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoAlerta, val, refCalma)}
            opcoes={escalaComfortBOpcoes.alerta}
          />
          <DropdownComfortB
            ref={refCalma}
            label="2. Calma / Agitação"
            id="calma"
            valor={pontuacaoCalma}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoCalma, val, refChoroResp)}
            opcoes={escalaComfortBOpcoes.calma}
          />
          
          {/* Item 3 Dinâmico */}
          {isIntubado ? (
            <DropdownComfortB
              ref={refChoroResp}
              label="3. Respiração (Intubado)"
              id="respiracao"
              valor={pontuacaoChoroResp}
              onOpcaoChange={(val) => handleDropdownChange(setPontuacaoChoroResp, val, refMovimento)}
              opcoes={escalaComfortBOpcoes.respiracao}
            />
          ) : (
            <DropdownComfortB
              ref={refChoroResp}
              label="3. Choro (Não Intubado)"
              id="choro"
              valor={pontuacaoChoroResp}
              onOpcaoChange={(val) => handleDropdownChange(setPontuacaoChoroResp, val, refMovimento)}
              opcoes={escalaComfortBOpcoes.choro}
            />
          )}

          <DropdownComfortB
            ref={refMovimento}
            label="4. Movimentos Físicos"
            id="movimento"
            valor={pontuacaoMovimento}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoMovimento, val, refTonus)}
            opcoes={escalaComfortBOpcoes.movimento}
          />
          <DropdownComfortB
            ref={refTonus}
            label="5. Tônus Corporal"
            id="tonus"
            valor={pontuacaoTonus}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoTonus, val, refTensaoFacial)}
            opcoes={escalaComfortBOpcoes.tonus}
          />
          <DropdownComfortB
            ref={refTensaoFacial}
            label="6. Tensão Facial"
            id="tensaoFacial"
            valor={pontuacaoTensaoFacial}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoTensaoFacial, val, null as any)} // Último item
            opcoes={escalaComfortBOpcoes.tensaoFacial}
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
              {/* --- MODIFICADO: Adiciona ícone --- */}
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
}