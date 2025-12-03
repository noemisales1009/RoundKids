import React, { useState, useMemo, useRef, forwardRef } from 'react';

type EscalaGlasgowKey = 'adulto' | 'crianca' | 'lactente';

// --- Constante com Todos os Dados da Escala de Glasgow (Completa) ---
// (Baseado no ficheiro escalas_glasgow_todas_idades.docx)
const escalasGlasgowOpcoes = {
  adulto: {
    nome: 'Adultos (≥ 5 anos)',
    ocular: [
      { texto: '4 - Espontânea', valor: 4 },
      { texto: '3 - Ao som', valor: 3 },
      { texto: '2 - À dor', valor: 2 },
      { texto: '1 - Nenhuma', valor: 1 },
    ],
    verbal: [
      { texto: '5 - Orientado', valor: 5 },
      { texto: '4 - Confuso', valor: 4 },
      { texto: '3 - Palavras inadequadas', valor: 3 },
      { texto: '2 - Sons incompreensíveis', valor: 2 },
      { texto: '1 - Nenhuma', valor: 1 },
    ],
    motora: [
      { texto: '6 - Obedece comandos', valor: 6 },
      { texto: '5 - Localiza dor', valor: 5 },
      { texto: '4 - Retirada inespecífica', valor: 4 },
      { texto: '3 - Flexão anormal (decórtica)', valor: 3 },
      { texto: '2 - Extensão anormal (descerebração)', valor: 2 },
      { texto: '1 - Nenhuma', valor: 1 },
    ],
  },
  crianca: {
    nome: 'Crianças (≤ 4 anos)',
    ocular: [
      { texto: '4 - Espontânea', valor: 4 },
      { texto: '3 - Ao som', valor: 3 },
      { texto: '2 - À dor', valor: 2 },
      { texto: '1 - Nenhuma', valor: 1 },
    ],
    verbal: [
      { texto: '5 - Balbucia / vocaliza adequadamente', valor: 5 },
      { texto: '4 - Choro consolável', valor: 4 },
      { texto: '3 - Choro persistente / irritado', valor: 3 },
      { texto: '2 - Gemidos de dor', valor: 2 },
      { texto: '1 - Nenhuma vocalização', valor: 1 },
    ],
    motora: [
      { texto: '6 - Movimenta-se espontaneamente / obedece comandos', valor: 6 },
      { texto: '5 - Retirada ao toque/dor', valor: 5 },
      { texto: '4 - Retirada inespecífica', valor: 4 },
      { texto: '3 - Flexão anormal (decórtica)', valor: 3 },
      { texto: '2 - Extensão anormal (descerebração)', valor: 2 },
      { texto: '1 - Nenhuma resposta motora', valor: 1 },
    ],
  },
  lactente: {
    nome: 'Lactentes (< 1 ano)',
    ocular: [
      { texto: '4 - Espontânea', valor: 4 },
      { texto: '3 - Ao som', valor: 3 },
      { texto: '2 - À dor', valor: 2 },
      { texto: '1 - Nenhuma', valor: 1 },
    ],
    verbal: [
      { texto: '5 - Sons normais / balbucia', valor: 5 },
      { texto: '4 - Chora mas é consolável', valor: 4 },
      { texto: '3 - Choro inconsolável', valor: 3 },
      { texto: '2 - Gemido à dor', valor: 2 },
      { texto: '1 - Ausência de sons', valor: 1 },
    ],
    motora: [
      { texto: '6 - Movimentos espontâneos / retira ao toque', valor: 6 },
      { texto: '5 - Retirada ao estímulo doloroso', valor: 5 },
      { texto: '4 - Retirada inespecífica', valor: 4 },
      { texto: '3 - Flexão anormal (decórtica)', valor: 3 },
      { texto: '2 - Extensão anormal (descerebração)', valor: 2 },
      { texto: '1 - Nenhuma resposta', valor: 1 },
    ],
  },
};

// --- ÍCONES DE STATUS ---
const IconeCheckVerde = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

const IconeAlertaLaranja = () => (
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
// (Baseado no ficheiro escalas_glasgow_todas_idades.docx)
const getInterpretacaoGlasgow = (total: number) => {
  if (total <= 5) {
    return { 
      texto: 'Extremamente Grave (≤5)', 
      cor: 'text-red-700', 
      icone: <IconeSireneVermelha /> 
    };
  }
  if (total <= 8) {
    return { 
      texto: 'Coma Grave (≤8)', 
      cor: 'text-red-400', 
      icone: <IconeSireneVermelha /> 
    };
  }
  if (total <= 12) {
    return { 
      texto: 'Traumatismo Moderado (9-12)', 
      cor: 'text-orange-400', 
      icone: <IconeAlertaLaranja /> 
    };
  }
  // 13-15
  return { 
    texto: 'Traumatismo Leve (13-15)', 
    cor: 'text-green-400', 
    icone: <IconeCheckVerde /> 
  };
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

interface DropdownGlasgowProps {
    label: string;
    id: string;
    valor: number | null;
    onOpcaoChange: (v: number | null) => void;
    opcoes: { texto: string, valor: number }[];
}


// --- Componente de Dropdown Reutilizável ---
const DropdownGlasgow = forwardRef<HTMLDivElement, DropdownGlasgowProps>(({ label, id, valor, onOpcaoChange, opcoes }, ref) => (
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

interface GlasgowScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string; }) => void;
}

// --- Componente Principal da Aba ---
export const GlasgowScale: React.FC<GlasgowScaleProps> = ({ onSaveScore }) => {
  // --- Estados Principais ---
  const [telaAtiva, setTelaAtiva] = useState<'lista' | 'form' | 'resultado'>('lista'); // 'lista', 'form', 'resultado'
  const [ultimaPontuacao, setUltimaPontuacao] = useState<{ total: number }>({ total: 15 }); // Começa com pontuação máxima

  // --- Estados do Formulário ---
  const [faixaEtaria, setFaixaEtaria] = useState<EscalaGlasgowKey>('adulto');
  const [pontuacaoOcular, setPontuacaoOcular] = useState<number | null>(null);
  const [pontuacaoVerbal, setPontuacaoVerbal] = useState<number | null>(null);
  const [pontuacaoMotora, setPontuacaoMotora] = useState<number | null>(null);

  const [erroForm, setErroForm] = useState<string | null>(null);
  const [pontuacaoTotalCalculada, setPontuacaoTotalCalculada] = useState(0);

  // --- Refs para a Navegação Fluida ---
  const refFaixaEtaria = useRef<HTMLDivElement>(null);
  const refOcular = useRef<HTMLDivElement>(null);
  const refVerbal = useRef<HTMLDivElement>(null);
  const refMotora = useRef<HTMLDivElement>(null);
  
  // Pega as opções corretas dos dropdowns com base na faixa etária selecionada
  const opcoesAtuais = escalasGlasgowOpcoes[faixaEtaria];

  // --- Lógicas de Cálculo (useMemo) ---
  const ultimaInterpretacao = useMemo(
    () => getInterpretacaoGlasgow(ultimaPontuacao.total),
    [ultimaPontuacao]
  );

  const interpretacaoAtual = useMemo(
    () => getInterpretacaoGlasgow(pontuacaoTotalCalculada),
    [pontuacaoTotalCalculada]
  );

  // --- Funções de Ação ---
  const resetForm = () => {
    setFaixaEtaria('adulto');
    setPontuacaoOcular(null);
    setPontuacaoVerbal(null);
    setPontuacaoMotora(null);
    setPontuacaoTotalCalculada(0);
    setErroForm(null);
  };
  
  // Limpa os campos ao trocar a faixa etária
  const handleTrocaFaixaEtaria = (novaFaixa: EscalaGlasgowKey) => {
    setFaixaEtaria(novaFaixa);
    setPontuacaoOcular(null);
    setPontuacaoVerbal(null);
    setPontuacaoMotora(null);
    // Rola para o próximo item
    setTimeout(() => refOcular.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
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
    const campos = [pontuacaoOcular, pontuacaoVerbal, pontuacaoMotora];

    if (campos.some(v => v === null)) {
      setErroForm("Por favor, preencha todos os 3 campos da escala.");
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
        scaleName: `Glasgow (${opcoesAtuais.nome})`,
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
              ÚLTIMA AVALIAÇÃO GLASGOW (PEDIÁTRICA)
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
            Registrar Nova Avaliação Glasgow
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
              Nova Avaliação Glasgow
            </h2>
          </div>

          {/* Seletor de Faixa Etária */}
          <div ref={refFaixaEtaria} className="bg-slate-800 p-4 rounded-lg shadow-lg">
            <label
              htmlFor="faixaEtaria"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              1. Selecione a Faixa Etária
            </label>
            <select
              id="faixaEtaria"
              value={faixaEtaria}
              onChange={(e) => handleTrocaFaixaEtaria(e.target.value as EscalaGlasgowKey)}
              className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {(Object.keys(escalasGlasgowOpcoes) as EscalaGlasgowKey[]).map((key) => (
                <option key={key} value={key}>
                  {escalasGlasgowOpcoes[key].nome}
                </option>
              ))}
            </select>
          </div>

          {/* Os 3 Dropdowns da Escala */}
          <DropdownGlasgow
            ref={refOcular}
            label="2. Abertura Ocular"
            id="ocular"
            valor={pontuacaoOcular}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoOcular, val, refVerbal)}
            opcoes={opcoesAtuais.ocular}
          />
          <DropdownGlasgow
            ref={refVerbal}
            label="3. Resposta Verbal"
            id="verbal"
            valor={pontuacaoVerbal}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoVerbal, val, refMotora)}
            opcoes={opcoesAtuais.verbal}
          />
          <DropdownGlasgow
            ref={refMotora}
            label="4. Resposta Motora"
            id="motora"
            valor={pontuacaoMotora}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoMotora, val, null)} // Último item
            opcoes={opcoesAtuais.motora}
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
            {/* Card de detalhe da interpretação */}
            <div className="bg-slate-800 p-4 rounded-lg text-sm text-gray-400">
              {interpretacaoAtual.texto.includes('Coma Grave') && 'Interpretação: Coma grave. Indicação de via aérea definitiva.'}
              {interpretacaoAtual.texto.includes('Extremamente Grave') && 'Interpretação: Risco de dano neurológico extenso. Avaliar via aérea definitiva.'}
              {interpretacaoAtual.texto.includes('Moderado') && 'Interpretação: Rebaixamento moderado do nível de consciência.'}
              {interpretacaoAtual.texto.includes('Leve') && 'Interpretação: Consciência preservada ou rebaixamento leve.'}
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