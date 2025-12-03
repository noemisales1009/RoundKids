import React, { useState, useMemo, useRef, forwardRef } from 'react';

// --- Constante com Todos os Dados da Escala VNI/CNAF Pediatria ---
// (Baseado na imagem fornecida)
const escalaVNI_CNAF_PediatriaOpcoes = {
  fr: [
    { texto: '0 - Redução ≥ 20% da inicial', valor: 0 },
    { texto: '1 - Redução < 20% persistente', valor: 1 },
    { texto: '2 - Sem mudança ou aumento da FR', valor: 2 },
  ],
  musculaturaAcessoria: [
    { texto: '0 - Reduzido', valor: 0 },
    { texto: '1 - Reduzido persistente', valor: 1 },
    { texto: '2 - Aumenta ou permanece intenso', valor: 2 },
  ],
  nivelConsciencia: [
    { texto: '0 - Alerta, melhora clínica', valor: 0 },
    { texto: '1 - Mantém irritabilidade leve', valor: 1 },
    { texto: '2 - Sonolência, rebaixamento, letargia', valor: 2 },
  ],
  saturacaoVNI: [
    { texto: '0 - ≥ 94% com FIO² ≤ 40%', valor: 0 },
    { texto: '1 - 90 - 93% com FIO² ≤ 50%', valor: 1 },
    { texto: '2 - < 90% com FIO² ≤ 60%', valor: 2 },
  ],
  gasometriaArterial: [ // Adicionado a condição "(se disponível)" para clareza
    { texto: '0 - PH > 7,3, PaCO² < ou estável', valor: 0 },
    { texto: '1 - PH 7,25 a 7,3, PaCO² > ou leve', valor: 1 },
    { texto: '2 - PH < 7,25, PaCO² alta progressivamente', valor: 2 },
  ],
  confortoRespiratorio: [ // Adicionado a condição "| disponível" para clareza
    { texto: '0 - Confortável', valor: 0 },
    { texto: '1 - Leve desconforto persistente', valor: 1 },
    { texto: '2 - Piora do desconforto', valor: 2 },
  ],
  auscultaPulmonar: [
    { texto: '0 - Melhora de entrada de ar', valor: 0 },
    { texto: '1 - Sem mudança significativa', valor: 1 },
    { texto: '2 - Redução acentuada, sinais de esgotamento', valor: 2 },
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

// --- Lógica de Interpretação VNI/CNAF Pediatria ---
const getInterpretacaoVNI_CNAF_Pediatria = (total: number) => {
  if (total <= 4) {
    return { 
      texto: '0 a 4: Resposta Favorável à VNI, manter estratégia atual e monitorar.', 
      cor: 'text-green-400', 
      icone: <IconeCheckVerde />,
      detalhes: 'Manter estratégia atual e monitorar.'
    };
  }
  if (total <= 8) {
    return { 
      texto: '5 a 8: Resposta parcial, vigilância intensa.', 
      cor: 'text-yellow-400', 
      icone: <IconeAlertaAmarelo />,
      detalhes: 'Reavaliar parâmetros da VNI, considerar ajustes (IPAP, EPAP, Fio², Interface).'
    };
  }
  // 9 a 14
  return { 
    texto: '9 a 14: Sinais de Falência, indicação de possível IOT, RNC.', 
    cor: 'text-red-400', 
    icone: <IconeSireneVermelha />,
    detalhes: 'Hipoxemia refratária, Hipercapnia progressiva, falha na bomba muscular.'
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

interface DropdownProps {
    label: string;
    id: string;
    valor: number | null;
    onOpcaoChange: (v: number | null) => void;
    opcoes: { texto: string, valor: number }[];
}


// --- Componente de Dropdown Reutilizável ---
const DropdownVNI_CNAF = forwardRef<HTMLDivElement, DropdownProps>(({ label, id, valor, onOpcaoChange, opcoes }, ref) => (
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
interface VniCnafScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string; }) => void;
}

// --- Componente Principal da Aba ---
export const VniCnafScale: React.FC<VniCnafScaleProps> = ({ onSaveScore }) => {
  // --- Estados Principais ---
  const [telaAtiva, setTelaAtiva] = useState<'lista' | 'form' | 'resultado'>('lista');
  const [ultimaPontuacao, setUltimaPontuacao] = useState({ total: 0 }); // Começa com resposta favorável

  // --- Estados do Formulário (7 itens) ---
  const [pontuacaoFr, setPontuacaoFr] = useState<number | null>(null);
  const [pontuacaoMusculaturaAcessoria, setPontuacaoMusculaturaAcessoria] = useState<number | null>(null);
  const [pontuacaoNivelConsciencia, setPontuacaoNivelConsciencia] = useState<number | null>(null);
  const [pontuacaoSaturacaoVNI, setPontuacaoSaturacaoVNI] = useState<number | null>(null);
  const [pontuacaoGasometriaArterial, setPontuacaoGasometriaArterial] = useState<number | null>(null);
  const [pontuacaoConfortoRespiratorio, setPontuacaoConfortoRespiratorio] = useState<number | null>(null);
  const [pontuacaoAuscultaPulmonar, setPontuacaoAuscultaPulmonar] = useState<number | null>(null);


  const [erroForm, setErroForm] = useState<string | null>(null);
  const [pontuacaoTotalCalculada, setPontuacaoTotalCalculada] = useState(0);

  // --- Refs para a Navegação Fluida ---
  const refs = {
    fr: useRef<HTMLDivElement>(null),
    musculaturaAcessoria: useRef<HTMLDivElement>(null),
    nivelConsciencia: useRef<HTMLDivElement>(null),
    saturacaoVNI: useRef<HTMLDivElement>(null),
    gasometriaArterial: useRef<HTMLDivElement>(null),
    confortoRespiratorio: useRef<HTMLDivElement>(null),
    auscultaPulmonar: useRef<HTMLDivElement>(null),
  };

  // --- Lógicas de Cálculo (useMemo) ---
  const ultimaInterpretacao = useMemo(
    () => getInterpretacaoVNI_CNAF_Pediatria(ultimaPontuacao.total),
    [ultimaPontuacao]
  );

  const interpretacaoAtual = useMemo(
    () => getInterpretacaoVNI_CNAF_Pediatria(pontuacaoTotalCalculada),
    [pontuacaoTotalCalculada]
  );

  // --- Funções de Ação ---
  const resetForm = () => {
    setPontuacaoFr(null);
    setPontuacaoMusculaturaAcessoria(null);
    setPontuacaoNivelConsciencia(null);
    setPontuacaoSaturacaoVNI(null);
    setPontuacaoGasometriaArterial(null);
    setPontuacaoConfortoRespiratorio(null);
    setPontuacaoAuscultaPulmonar(null);
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
      pontuacaoFr, pontuacaoMusculaturaAcessoria, pontuacaoNivelConsciencia,
      pontuacaoSaturacaoVNI, pontuacaoGasometriaArterial, pontuacaoConfortoRespiratorio, pontuacaoAuscultaPulmonar
    ];

    if (campos.some(v => v === null)) {
      setErroForm("Por favor, preencha todos os 7 campos da escala.");
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
        scaleName: 'VNI/CNAF Pediatria',
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
              ÚLTIMA AVALIAÇÃO VNI/CNAF PEDIATRIA
            </h2>
            <div className="flex items-baseline justify-center space-x-1">
              <span className="text-6xl font-bold text-white">
                {ultimaPontuacao.total}
              </span>
              <span className="text-xl text-gray-400">/ 14</span>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className={`bg-slate-700 p-4 rounded-lg ${ultimaInterpretacao.cor} font-medium`}>
                <div className="flex items-center justify-center">
                  {ultimaInterpretacao.icone}
                  <span>{ultimaInterpretacao.texto.split(':')[0]}:</span>
                </div>
                <p className="text-sm mt-2">{ultimaInterpretacao.detalhes}</p>
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
            Registrar Nova Avaliação VNI/CNAF
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
              Nova Avaliação VNI/CNAF Pediatria
            </h2>
          </div>

          {/* Os 7 Dropdowns da Escala */}
          <DropdownVNI_CNAF
            ref={refs.fr}
            label="1. FR (Frequência Respiratória)"
            id="fr"
            valor={pontuacaoFr}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoFr, val, refs.musculaturaAcessoria)}
            opcoes={escalaVNI_CNAF_PediatriaOpcoes.fr}
          />
          <DropdownVNI_CNAF
            ref={refs.musculaturaAcessoria}
            label="2. Uso de Musculatura Acessória"
            id="musculaturaAcessoria"
            valor={pontuacaoMusculaturaAcessoria}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoMusculaturaAcessoria, val, refs.nivelConsciencia)}
            opcoes={escalaVNI_CNAF_PediatriaOpcoes.musculaturaAcessoria}
          />
          <DropdownVNI_CNAF
            ref={refs.nivelConsciencia}
            label="3. Nível de Consciência"
            id="nivelConsciencia"
            valor={pontuacaoNivelConsciencia}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoNivelConsciencia, val, refs.saturacaoVNI)}
            opcoes={escalaVNI_CNAF_PediatriaOpcoes.nivelConsciencia}
          />
          <DropdownVNI_CNAF
            ref={refs.saturacaoVNI}
            label="4. Saturação com VNI"
            id="saturacaoVNI"
            valor={pontuacaoSaturacaoVNI}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoSaturacaoVNI, val, refs.gasometriaArterial)}
            opcoes={escalaVNI_CNAF_PediatriaOpcoes.saturacaoVNI}
          />
          <DropdownVNI_CNAF
            ref={refs.gasometriaArterial}
            label="5. Gasometria Arterial (se disponível)"
            id="gasometriaArterial"
            valor={pontuacaoGasometriaArterial}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoGasometriaArterial, val, refs.confortoRespiratorio)}
            opcoes={escalaVNI_CNAF_PediatriaOpcoes.gasometriaArterial}
          />
          <DropdownVNI_CNAF
            ref={refs.confortoRespiratorio}
            label="6. Conforto Respiratório | disponível"
            id="confortoRespiratorio"
            valor={pontuacaoConfortoRespiratorio}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoConfortoRespiratorio, val, refs.auscultaPulmonar)}
            opcoes={escalaVNI_CNAF_PediatriaOpcoes.confortoRespiratorio}
          />
          <DropdownVNI_CNAF
            ref={refs.auscultaPulmonar}
            label="7. Ausculta Pulmonar"
            id="auscultaPulmonar"
            valor={pontuacaoAuscultaPulmonar}
            onOpcaoChange={(val) => handleDropdownChange(setPontuacaoAuscultaPulmonar, val, null)} // Último item
            opcoes={escalaVNI_CNAF_PediatriaOpcoes.auscultaPulmonar}
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
              <span className="text-xl text-gray-400">/ 14</span>
            </div>
          </div>

          {/* Card de Interpretação de Risco */}
          <div className="grid grid-cols-1 gap-4">
            <div className={`bg-slate-800 p-5 rounded-lg shadow-lg text-lg ${interpretacaoAtual.cor} font-semibold text-center`}>
              <div className="flex items-center justify-center">
                {interpretacaoAtual.icone}
                <span>{interpretacaoAtual.texto.split(':')[0]}:</span>
              </div>
              <p className="text-sm mt-2 text-gray-300">
                {interpretacaoAtual.detalhes}
              </p>
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
