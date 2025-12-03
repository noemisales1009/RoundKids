import React, { useState, useMemo, useRef, forwardRef } from 'react';

// --- Constante com os Dados da Escala CAM-ICU ---
// Armazena as descrições que mudam entre as escalas
const escalaCAMOpcoes = {
  psCAM: {
    nome: 'psCAM-ICU (6 meses a 5 anos)',
    atencao: 'Teste de atenção com estímulos visuais (cartões com figuras). A criança deve manter a atenção por pelo menos 2 de 3 tentativas.',
    pensamento: 'Respostas incoerentes, não direcionadas ou com comportamento incompatível à situação.',
  },
  pCAM: {
    nome: 'pCAM-ICU (≥ 5 anos)',
    atencao: 'Teste ABC ou contagem de números. A criança deve identificar letras ou números-alvo.',
    pensamento: 'Perguntas simples: ‘Pode levantar dois dedos?’, ‘A lua está perto de nós?’',
  },
};

// --- ÍCONES DE STATUS ---
const IconeCheckVerde = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

const IconeSireneVermelha = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path d="M11.5 1.046a.75.75 0 01.038 1.498l-.001.002A6.5 6.5 0 005.002 9.03L5 9.031a.75.75 0 01-1.498-.038L3.5 9A7.5 7.5 0 0111.5 1.046zM14.502 9.03a.75.75 0 01-1.498.038l.001-.002A6.5 6.5 0 008.5 2.546a.75.75 0 01.038-1.498L8.5 1A7.5 7.5 0 0114.502 9.03z" />
    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 3zM1.046 8.5a.75.75 0 011.498.038L2.546 8.5A6.5 6.5 0 009.03 14.998l.002.001a.75.75 0 01-.038 1.498L9 16.5A7.5 7.5 0 011.046 8.5zM16.5 9A7.5 7.5 0 019 16.5a.75.75 0 01-1.498-.038l.001.002A6.5 6.5 0 0011.5 9.96l-.002-.001a.75.75 0 01.038-1.498L11.5 8.5zM10 17a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 17z" clipRule="evenodd" />
  </svg>
);


// --- Lógica de Interpretação (Diagnóstico de Delirium) ---
// Delirium POSITIVO = 1 E 2 E (3 OU 4)
const getInterpretacaoCAM = (c1: boolean | null, c2: boolean | null, c3: boolean | null, c4: boolean | null) => {
  // c1 (Alteração) = true (Presente)
  // c2 (Atenção) = true (Anormal)
  // c3 (Consciência) = true (Anormal)
  // c4 (Pensamento) = true (Anormal)
  
  const temDelirium = c1 === true && c2 === true && (c3 === true || c4 === true);

  if (temDelirium) {
    return { texto: 'Delirium POSITIVO', cor: 'text-red-400', icone: <IconeSireneVermelha /> };
  }
  return { texto: 'Delirium NEGATIVO', cor: 'text-green-400', icone: <IconeCheckVerde /> };
};

// --- Ícone de Check ---
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

interface DropdownCAMProps {
    label: string;
    id: string;
    valor: boolean | null;
    onOpcaoChange: (val: boolean | null) => void;
    opcoes: { texto: string; valor: boolean }[];
    descricao: string;
}

// --- Componente de Dropdown/Toggle Reutilizável ---
// Usado para os 4 critérios (Presente/Ausente, Anormal/Normal)
const DropdownCAM = forwardRef<HTMLDivElement, DropdownCAMProps>(({ label, id, valor, onOpcaoChange, opcoes, descricao }, ref) => (
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
    
    {/* Descrição da Característica */}
    <p className="text-xs text-gray-400 mb-3">{descricao}</p>
    
    <select
      id={id}
      value={valor === null ? '' : String(valor)} // Valor agora é true/false
      onChange={(e) => onOpcaoChange(e.target.value === '' ? null : e.target.value === 'true')} // Converte string "true"/"false" para boolean
      className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">Selecione...</option>
      {opcoes.map((opt) => (
        <option key={opt.texto} value={String(opt.valor)}>
          {opt.texto}
        </option>
      ))}
    </select>
  </div>
));

interface DeliriumScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string; }) => void;
}

// --- Componente Principal da Aba ---
export const DeliriumScale: React.FC<DeliriumScaleProps> = ({ onSaveScore }) => {
  // --- Estados Principais ---
  const [telaAtiva, setTelaAtiva] = useState<'lista' | 'form' | 'resultado'>('lista'); // 'lista', 'form', 'resultado'
  const [ultimoResultado, setUltimoResultado] = useState(getInterpretacaoCAM(false, false, false, false)); // Inicia como Negativo

  // --- Estados do Formulário ---
  const [escala, setEscala] = useState<'psCAM' | 'pCAM'>('psCAM'); // 'psCAM' ou 'pCAM'
  const [carac1, setCarac1] = useState<boolean | null>(null); // true = Presente, false = Ausente
  const [carac2, setCarac2] = useState<boolean | null>(null); // true = Anormal, false = Normal
  const [carac3, setCarac3] = useState<boolean | null>(null); // true = Anormal, false = Normal
  const [carac4, setCarac4] = useState<boolean | null>(null); // true = Anormal, false = Normal

  const [erroForm, setErroForm] = useState<string | null>(null);
  const [resultadoCalculado, setResultadoCalculado] = useState<ReturnType<typeof getInterpretacaoCAM> | null>(null);

  // --- Refs para a Navegação Fluida ---
  const refEscala = useRef<HTMLDivElement>(null);
  const refCarac1 = useRef<HTMLDivElement>(null);
  const refCarac2 = useRef<HTMLDivElement>(null);
  const refCarac3 = useRef<HTMLDivElement>(null);
  const refCarac4 = useRef<HTMLDivElement>(null);

  // --- Lógicas de Cálculo (useMemo) ---
  const ultimaInterpretacao = ultimoResultado; // O estado já guarda o objeto

  const interpretacaoAtual = useMemo(
    () => getInterpretacaoCAM(carac1, carac2, carac3, carac4),
    [carac1, carac2, carac3, carac4]
  );

  // --- Funções de Ação ---
  const resetForm = () => {
    setEscala('psCAM');
    setCarac1(null);
    setCarac2(null);
    setCarac3(null);
    setCarac4(null);
    setErroForm(null);
    setResultadoCalculado(null);
  };

  // Navegação Fluida
  const handleDropdownChange = (setter: (v: boolean | null) => void, value: boolean | null, nextRef: React.RefObject<HTMLDivElement>) => {
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
    const campos = [carac1, carac2, carac3, carac4];

    if (campos.some(v => v === null)) {
      setErroForm("Por favor, preencha todas as 4 características.");
      return;
    }

    setResultadoCalculado(interpretacaoAtual);
    setTelaAtiva('resultado');
  };

  // Ação do botão "Salvar e Fechar"
  const handleSalvar = () => {
    if (resultadoCalculado) {
        setUltimoResultado(resultadoCalculado); // Salva o objeto de resultado
        onSaveScore({
            scaleName: escala === 'pCAM' ? 'pCAM-ICU' : 'psCAM-ICU',
            score: resultadoCalculado.texto === 'Delirium POSITIVO' ? 1 : 0, // 1 for positive, 0 for negative
            interpretation: resultadoCalculado.texto,
        });
    }
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
              ÚLTIMA AVALIAÇÃO pCAM/psCAM-ICU
            </h2>
            <div className={`mt-6 grid grid-cols-1 gap-3`}>
              <div className={`bg-slate-700 p-4 rounded-lg ${ultimaInterpretacao.cor} font-bold text-xl`}>
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
            Registrar Nova Avaliação de Delirium
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
              Nova Avaliação de Delirium
            </h2>
          </div>

          {/* Seletor de Escala (Idade) */}
          <div ref={refEscala} className="bg-slate-800 p-4 rounded-lg shadow-lg">
            <label
              htmlFor="escala"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Selecione a Escala (por idade)
            </label>
            <select
              id="escala"
              value={escala}
              onChange={(e) => {
                setEscala(e.target.value as 'psCAM' | 'pCAM');
                // Limpa os campos que dependem da escala
                setCarac2(null);
                setCarac4(null);
                // Rola para o próximo item
                setTimeout(() => refCarac1.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
              }}
              className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="psCAM">{escalaCAMOpcoes.psCAM.nome}</option>
              <option value="pCAM">{escalaCAMOpcoes.pCAM.nome}</option>
            </select>
          </div>

          {/* As 4 Características */}
          <DropdownCAM
            ref={refCarac1}
            label="1. Alteração aguda ou curso flutuante"
            id="carac1"
            valor={carac1}
            onOpcaoChange={(val) => handleDropdownChange(setCarac1, val, refCarac2)}
            descricao="Mudança súbita no comportamento, atenção ou nível de consciência nas últimas 24 horas."
            opcoes={[
              { texto: 'Presente', valor: true },
              { texto: 'Ausente', valor: false },
            ]}
          />
          <DropdownCAM
            ref={refCarac2}
            label="2. Déficit de atenção"
            id="carac2"
            valor={carac2}
            onOpcaoChange={(val) => handleDropdownChange(setCarac2, val, refCarac3)}
            descricao={escalaCAMOpcoes[escala].atencao} // Descrição dinâmica
            opcoes={[
              { texto: 'Anormal', valor: true },
              { texto: 'Normal', valor: false },
            ]}
          />
          <DropdownCAM
            ref={refCarac3}
            label="3. Nível de consciência alterado"
            id="carac3"
            valor={carac3}
            onOpcaoChange={(val) => handleDropdownChange(setCarac3, val, refCarac4)}
            descricao="Não está no estado ‘alerta’ (sonolento, agitado, letárgico, estupor)."
            opcoes={[
              { texto: 'Anormal', valor: true },
              { texto: 'Normal', valor: false },
            ]}
          />
          <DropdownCAM
            ref={refCarac4}
            label="4. Pensamento desorganizado"
            id="carac4"
            valor={carac4}
            onOpcaoChange={(val) => handleDropdownChange(setCarac4, val, null as any)} // Último item
            descricao={escalaCAMOpcoes[escala].pensamento} // Descrição dinâmica
            opcoes={[
              { texto: 'Anormal', valor: true },
              { texto: 'Normal', valor: false },
            ]}
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
            Verificar Diagnóstico
          </button>
        </div>
      )}

      {/* --- TELA 3: RESULTADO --- */}
      {telaAtiva === 'resultado' && resultadoCalculado && (
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
          
          {/* Diagnóstico */}
          <div className="text-center my-8">
            <div className={`p-6 rounded-lg shadow-lg ${resultadoCalculado.cor} ${resultadoCalculado.cor.replace('text-', 'bg-').replace('400', '900')} bg-opacity-20 border ${resultadoCalculado.cor.replace('text-', 'border-')}`}>
              {/* --- MODIFICADO: Adiciona ícone --- */}
              <span className={`text-4xl font-bold ${resultadoCalculado.cor} flex items-center justify-center`}>
                {resultadoCalculado.icone}
                <span>{resultadoCalculado.texto}</span>
              </span>
            </div>
          </div>

          {/* Card de Interpretação */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-slate-800 p-5 rounded-lg shadow-lg text-sm text-gray-400">
              <h3 className="font-semibold text-white mb-2">Critérios para Delirium POSITIVO:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Característica 1 (Alteração Aguda) = **Presente**</li>
                <li>**E**</li>
                <li>Característica 2 (Déficit de Atenção) = **Anormal**</li>
                <li>**E**</li>
                <li>Característica 3 (Consciência) OU 4 (Pensamento) = **Anormal**</li>
              </ul>
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