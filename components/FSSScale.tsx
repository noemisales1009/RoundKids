import React, { useState, useMemo, useRef, forwardRef } from 'react';

// --- Constante com Todos os Dados da Escala FSS ---
// (Baseado na imagem da Functional Status Scale)
const escalaFSSOpcoes = {
  mental: [
    { texto: '1 - Normal (Sono/vigília adequado)', valor: 1 },
    { texto: '2 - Disf. Leve (Sonolento, suscetível)', valor: 2 },
    { texto: '3 - Disf. Moderada (Letárgico e/ou irritável)', valor: 3 },
    { texto: '4 - Disf. Grave (Despertar mínimo ao estímulo)', valor: 4 },
    { texto: '5 - Disf. M. Grave (Coma não responsivo)', valor: 5 },
  ],
  sensorial: [
    { texto: '1 - Normal (Audição e visão intactas)', valor: 1 },
    { texto: '2 - Disf. Leve (Suspeita de perda auditiva/visual)', valor: 2 },
    { texto: '3 - Disf. Moderada (Não reativo a estímulos)', valor: 3 },
    { texto: '4 - Disf. Grave (Não reativo a estímulos)', valor: 4 },
    { texto: '5 - Disf. M. Grave (Respostas anormais à dor)', valor: 5 },
  ],
  comunicacao: [
    { texto: '1 - Normal (Vocalização apropriada, choro)', valor: 1 },
    { texto: '2 - Disf. Leve (Diminuição da vocalização)', valor: 2 },
    { texto: '3 - Disf. Moderada (Ausência de comportamento de busca)', valor: 3 },
    { texto: '4 - Disf. Grave (Nenhuma demonstração de desconforto)', valor: 4 },
    { texto: '5 - Disf. M. Grave (Ausência de comunicação)', valor: 5 },
  ],
  motor: [
    { texto: '1 - Normal (Movimentos corporais coordenados)', valor: 1 },
    { texto: '2 - Disf. Leve (1 membro com deficiência funcional)', valor: 2 },
    { texto: '3 - Disf. Moderada (Dois ou mais membros com deficiência)', valor: 3 },
    { texto: '4 - Disf. Grave (Controle deficiente da cabeça)', valor: 4 },
    { texto: '5 - Disf. M. Grave (Espasticidade, paralisia)', valor: 5 },
  ],
  alimentacao: [
    { texto: '1 - Normal (Todos os alimentos ingeridos via oral)', valor: 1 },
    { texto: '2 - Disf. Leve (Ajuda/inadequada para idade)', valor: 2 },
    { texto: '3 - Disf. Moderada (Alimentação via oral e por tubo)', valor: 3 },
    { texto: '4 - Disf. Grave (Nutrição parenteral com adm. via oral/tubo)', valor: 4 },
    { texto: '5 - Disf. M. Grave (Nutrição parenteral exclusiva)', valor: 5 },
  ],
  respiratorio: [
    { texto: '1 - Normal (Ar ambiente e sem suporte)', valor: 1 },
    { texto: '2 - Disf. Leve (Tratamento com oxigênio/aspiração)', valor: 2 },
    { texto: '3 - Disf. Moderada (Traqueostomia)', valor: 3 },
    { texto: '4 - Disf. Grave (CPAP)', valor: 4 },
    { texto: '5 - Disf. M. Grave (Suporte ventilatório mecânico)', valor: 5 },
  ],
};

// --- ÍCONES DE STATUS ---
const IconeCheckVerde = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);
const IconeAlertaVerde = () => ( // Um ícone verde mas não de "check"
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
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
// Pontuação total varia de 6 a 30.
const getInterpretacaoFSS = (total: number) => {
  if (total <= 7) {
    // 6 a 7
    return { texto: 'Adequada Funcionalidade (6-7)', cor: 'text-green-400', icone: <IconeCheckVerde /> };
  }
  if (total <= 9) {
    // 8 a 9
    return { texto: 'Disfunção Leve (8-9)', cor: 'text-teal-400', icone: <IconeAlertaVerde /> };
  }
  if (total <= 15) {
    // 10 a 15
    return { texto: 'Disfunção Moderada (10-15)', cor: 'text-yellow-400', icone: <IconeAlertaAmarelo /> };
  }
  if (total <= 21) {
    // 16 a 21
    return { texto: 'Disfunção Severa (16-21)', cor: 'text-red-400', icone: <IconeSireneVermelha /> };
  }
  // > 21
  return { texto: 'Disfunção Muito Severa (≥22)', cor: 'text-red-700', icone: <IconeSireneVermelha /> };
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

interface DropdownFSSProps {
    label: string;
    id: string;
    valor: number | null;
    onOpcaoChange: (v: number | null) => void;
    opcoes: { texto: string, valor: number }[];
}

// --- Componente de Dropdown Reutilizável ---
const DropdownFSS = forwardRef<HTMLDivElement, DropdownFSSProps>(({ label, id, valor, onOpcaoChange, opcoes }, ref) => (
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
interface FSSScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string; }) => void;
}

// --- Componente Principal da Aba ---
export const FSSScale: React.FC<FSSScaleProps> = ({ onSaveScore }) => {
  // --- Estados Principais ---
  const [telaAtiva, setTelaAtiva] = useState<'lista' | 'form' | 'resultado'>('lista'); // 'lista', 'form', 'resultado'
  const [ultimaPontuacao, setUltimaPontuacao] = useState({ total: 6 }); // Começa com funcionalidade adequada

  // --- Estados do Formulário ---
  const [pontuacaoMental, setPontuacaoMental] = useState<number | null>(null);
  const [pontuacaoSensorial, setPontuacaoSensorial] = useState<number | null>(null);
  const [pontuacaoComunicacao, setPontuacaoComunicacao] = useState<number | null>(null);
  const [pontuacaoMotor, setPontuacaoMotor] = useState<number | null>(null);
  const [pontuacaoAlimentacao, setPontuacaoAlimentacao] = useState<number | null>(null);
  const [pontuacaoRespiratorio, setPontuacaoRespiratorio] = useState<number | null>(null);

  const [erroForm, setErroForm] = useState<string | null>(null);
  const [pontuacaoTotalCalculada, setPontuacaoTotalCalculada] = useState(0);

  // --- Refs para a Navegação Fluida ---
  const refs = {
    mental: useRef<HTMLDivElement>(null),
    sensorial: useRef<HTMLDivElement>(null),
    comunicacao: useRef<HTMLDivElement>(null),
    motor: useRef<HTMLDivElement>(null),
    alimentacao: useRef<HTMLDivElement>(null),
    respiratorio: useRef<HTMLDivElement>(null),
  };

  // --- Lógicas de Cálculo (useMemo) ---
  const ultimaInterpretacao = useMemo(
    () => getInterpretacaoFSS(ultimaPontuacao.total),
    [ultimaPontuacao]
  );

  const interpretacaoAtual = useMemo(
    () => getInterpretacaoFSS(pontuacaoTotalCalculada),
    [pontuacaoTotalCalculada]
  );

  // --- Funções de Ação ---
  const resetForm = () => {
    setPontuacaoMental(null);
    setPontuacaoSensorial(null);
    setPontuacaoComunicacao(null);
    setPontuacaoMotor(null);
    setPontuacaoAlimentacao(null);
    setPontuacaoRespiratorio(null);
    setPontuacaoTotalCalculada(0);
    setErroForm(null);
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
      pontuacaoMental,
      pontuacaoSensorial,
      pontuacaoComunicacao,
      pontuacaoMotor,
      pontuacaoAlimentacao,
      pontuacaoRespiratorio
    ];

    if (campos.some(v => v === null)) {
      setErroForm("Por favor, preencha todos os 6 campos da escala.");
      return;
    }

    const total = campos.reduce((acc, val) => acc + (val || 0), 0);
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
        scaleName: 'FSS',
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
              ÚLTIMA AVALIAÇÃO FSS
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
            Registrar Nova Avaliação FSS
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
              Nova Avaliação FSS
            </h2>
          </div>

          {/* Os 6 Dropdowns da Escala */}
          <DropdownFSS
            ref={refs.mental}
            label="1. Estado mental"
            id="mental"
            valor={pontuacaoMental}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoMental, val, refs.sensorial)}
            opcoes={escalaFSSOpcoes.mental}
          />
          <DropdownFSS
            ref={refs.sensorial}
            label="2. Funcionalidade sensorial"
            id="sensorial"
            valor={pontuacaoSensorial}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoSensorial, val, refs.comunicacao)}
            opcoes={escalaFSSOpcoes.sensorial}
          />
          <DropdownFSS
            ref={refs.comunicacao}
            label="3. Comunicação"
            id="comunicacao"
            valor={pontuacaoComunicacao}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoComunicacao, val, refs.motor)}
            opcoes={escalaFSSOpcoes.comunicacao}
          />
          <DropdownFSS
            ref={refs.motor}
            label="4. Funcionamento motor"
            id="motor"
            valor={pontuacaoMotor}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoMotor, val, refs.alimentacao)}
            opcoes={escalaFSSOpcoes.motor}
          />
          <DropdownFSS
            ref={refs.alimentacao}
            label="5. Alimentação"
            id="alimentacao"
            valor={pontuacaoAlimentacao}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoAlimentacao, val, refs.respiratorio)}
            opcoes={escalaFSSOpcoes.alimentacao}
          />
          <DropdownFSS
            ref={refs.respiratorio}
            label="6. Estado respiratório"
            id="respiratorio"
            valor={pontuacaoRespiratorio}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoRespiratorio, val, null)} // Último item
            opcoes={escalaFSSOpcoes.respiratorio}
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
            className="w-full bg-blue-600 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 mt-6"
          >
            Salvar e Fechar
          </button>
        </div>
      )}
    </div>
  );
}
