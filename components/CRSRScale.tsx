import React, { useState, useMemo, useRef, forwardRef } from 'react';

// --- Constante com Todos os Dados da Escala CRS-R ---
// (Baseado no ficheiro CRS-R_Completa.docx)
const escalaCRSROpcoes = {
  auditiva: [
    { texto: '4 – Comunicação funcional', valor: 4 },
    { texto: '3 – Comunicação não funcional', valor: 3 },
    { texto: '2 – Segue comandos', valor: 2 },
    { texto: '1 – Localiza som', valor: 1 },
    { texto: '0 – Reage ao som sem localizar', valor: 0 },
    { texto: '0 – Ausente', valor: 0 }, // Duas opções com valor 0
  ],
  comunicacao: [
    { texto: '2 – Comunicação funcional consistente', valor: 2 },
    { texto: '1 – Comunicação intencional não funcional', valor: 1 },
    { texto: '0 – Ausente', valor: 0 },
  ],
  visual: [
    { texto: '5 – Reconhece objeto', valor: 5 },
    { texto: '4 – Fixação sustentada', valor: 4 },
    { texto: '3 – Rastreamento visual', valor: 3 },
    { texto: '2 – Olhar para alvo em movimento', valor: 2 },
    { texto: '1 – Olhar breve / não sustentado', valor: 1 },
    { texto: '0 – Ausente', valor: 0 },
  ],
  motora: [
    { texto: '6 – Uso funcional de objeto', valor: 6 },
    { texto: '5 – Ação motora intencional', valor: 5 },
    { texto: '4 – Localiza estímulo doloroso', valor: 4 },
    { texto: '3 – Retira ao estímulo doloroso', valor: 3 },
    { texto: '2 – Movimentos inespecíficos', valor: 2 },
    { texto: '1 – Aumento de tônus / postura', valor: 1 },
    { texto: '0 – Ausente', valor: 0 },
  ],
  oromotora: [
    { texto: '3 – Fala inteligível', valor: 3 },
    { texto: '2 – Vocalização não inteligível', valor: 2 },
    { texto: '1 – Movimentos orais espontâneos', valor: 1 },
    { texto: '0 – Ausente', valor: 0 },
  ],
  arousal: [
    { texto: '3 – Hiperalerta', valor: 3 },
    { texto: '2 – Alerta adequado', valor: 2 },
    { texto: '1 – Responde a estímulo', valor: 1 },
    { texto: '0 – Sem sinais de alerta', valor: 0 },
  ],
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
// Pontuação total varia de 0 a 23.
const getInterpretacaoCRSR = (total: number) => {
  if (total <= 8) {
    // 0 a 8
    return { texto: 'Estado Vegetativo (0-8)', cor: 'text-red-400', icone: <IconeSireneVermelha /> };
  }
  if (total <= 15) {
    // 9 a 15
    return { texto: 'Estado Minimamente Consciente (9-15)', cor: 'text-yellow-400', icone: <IconeAlertaAmarelo /> };
  }
  // 16 a 23
  return { texto: 'Saída do MCS / Consciência (16-23)', cor: 'text-green-400', icone: <IconeCheckVerde /> };
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

interface DropdownCRSRProps {
    label: string;
    id: string;
    valor: number | null;
    onOpcaoChange: (v: number | null) => void;
    opcoes: { texto: string, valor: number }[];
}

// --- Componente de Dropdown Reutilizável ---
const DropdownCRSR = forwardRef<HTMLDivElement, DropdownCRSRProps>(({ label, id, valor, onOpcaoChange, opcoes }, ref) => (
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

interface CRSRScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string; }) => void;
}

// --- Componente Principal da Aba ---
export const CRSRScale: React.FC<CRSRScaleProps> = ({ onSaveScore }) => {
  // --- Estados Principais ---
  const [telaAtiva, setTelaAtiva] = useState<'lista' | 'form' | 'resultado'>('lista');
  const [ultimaPontuacao, setUltimaPontuacao] = useState({ total: 23 }); // Começa com pontuação máxima

  // --- Estados do Formulário ---
  const [pontuacaoAuditiva, setPontuacaoAuditiva] = useState<number | null>(null);
  const [pontuacaoComunicacao, setPontuacaoComunicacao] = useState<number | null>(null);
  const [pontuacaoVisual, setPontuacaoVisual] = useState<number | null>(null);
  const [pontuacaoMotora, setPontuacaoMotora] = useState<number | null>(null);
  const [pontuacaoOromotora, setPontuacaoOromotora] = useState<number | null>(null);
  const [pontuacaoArousal, setPontuacaoArousal] = useState<number | null>(null);

  const [erroForm, setErroForm] = useState<string | null>(null);
  const [pontuacaoTotalCalculada, setPontuacaoTotalCalculada] = useState(0);

  // --- Refs para a Navegação Fluida ---
  const refs = {
    auditiva: useRef<HTMLDivElement>(null),
    comunicacao: useRef<HTMLDivElement>(null),
    visual: useRef<HTMLDivElement>(null),
    motora: useRef<HTMLDivElement>(null),
    oromotora: useRef<HTMLDivElement>(null),
    arousal: useRef<HTMLDivElement>(null),
  };

  // --- Lógicas de Cálculo (useMemo) ---
  const ultimaInterpretacao = useMemo(
    () => getInterpretacaoCRSR(ultimaPontuacao.total),
    [ultimaPontuacao]
  );

  const interpretacaoAtual = useMemo(
    () => getInterpretacaoCRSR(pontuacaoTotalCalculada),
    [pontuacaoTotalCalculada]
  );

  // --- Funções de Ação ---
  const resetForm = () => {
    setPontuacaoAuditiva(null);
    setPontuacaoComunicacao(null);
    setPontuacaoVisual(null);
    setPontuacaoMotora(null);
    setPontuacaoOromotora(null);
    setPontuacaoArousal(null);
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
      pontuacaoAuditiva,
      pontuacaoComunicacao,
      pontuacaoVisual,
      pontuacaoMotora,
      pontuacaoOromotora,
      pontuacaoArousal
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
        scaleName: 'CRS-R',
        score: pontuacaoTotalCalculada,
        interpretation: interpretacaoAtual.texto,
    });
    resetForm();
    setTelaAtiva('lista');
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-slate-900 text-gray-300 rounded-lg min-h-[600px]">
      {telaAtiva === 'lista' && (
        <div className="flex flex-col space-y-4">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              ÚLTIMA AVALIAÇÃO CRS-R
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
            Registrar Nova Avaliação CRS-R
          </button>
        </div>
      )}

      {telaAtiva === 'form' && (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => setTelaAtiva('lista')}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-slate-700"
            >
              <IconeVoltar />
            </button>
            <h2 className="text-xl font-semibold text-white">
              Nova Avaliação CRS-R
            </h2>
          </div>

          <DropdownCRSR
            ref={refs.auditiva}
            label="1. Função Auditiva"
            id="auditiva"
            valor={pontuacaoAuditiva}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoAuditiva, val, refs.comunicacao)}
            opcoes={escalaCRSROpcoes.auditiva}
          />
          <DropdownCRSR
            ref={refs.comunicacao}
            label="2. Escala de Comunicação"
            id="comunicacao"
            valor={pontuacaoComunicacao}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoComunicacao, val, refs.visual)}
            opcoes={escalaCRSROpcoes.comunicacao}
          />
          <DropdownCRSR
            ref={refs.visual}
            label="3. Função Visual"
            id="visual"
            valor={pontuacaoVisual}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoVisual, val, refs.motora)}
            opcoes={escalaCRSROpcoes.visual}
          />
          <DropdownCRSR
            ref={refs.motora}
            label="4. Função Motora"
            id="motora"
            valor={pontuacaoMotora}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoMotora, val, refs.oromotora)}
            opcoes={escalaCRSROpcoes.motora}
          />
          <DropdownCRSR
            ref={refs.oromotora}
            label="5. Oromotora/Verbal"
            id="oromotora"
            valor={pontuacaoOromotora}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoOromotora, val, refs.arousal)}
            opcoes={escalaCRSROpcoes.oromotora}
          />
          <DropdownCRSR
            ref={refs.arousal}
            label="6. Nível de Alerta (Arousal)"
            id="arousal"
            valor={pontuacaoArousal}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoArousal, val, null)}
            opcoes={escalaCRSROpcoes.arousal}
          />
          
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

      {telaAtiva === 'resultado' && (
        <div className="flex flex-col space-y-6">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => setTelaAtiva('form')}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-slate-700"
            >
              <IconeVoltar />
            </button>
            <h2 className="text-xl font-semibold text-white">
              Resultado da Avaliação
            </h2>
          </div>
          
          <div className="text-center my-8">
            <div className="flex items-baseline justify-center space-x-2">
              <span className="text-8xl font-bold text-white">
                {pontuacaoTotalCalculada}
              </span>
            </div>
          </div>

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
