import React, { useState, useMemo, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { PatientsContext } from '../contexts';

// ==========================================
// 🛏️ CONFIGURAÇÃO DAS ESCALAS DE RISCO DE LESÃO
// Braden (Adulto), Braden Q (Pediátrica) e Braden Q Ampliada
// ==========================================

// Configurações Comuns (Opções de 1 a 4)
const scoreOptions1_4 = [
    { valor: 1, texto: '1 ponto' },
    { valor: 2, texto: '2 pontos' },
    { valor: 3, texto: '3 pontos' },
    { valor: 4, texto: '4 pontos' },
];

// Lógica de interpretação para as escalas Braden
const interpretarBraden = (score: number, scaleTitle: string) => {
    // Braden Adulto
    if (scaleTitle.includes('Adulto')) {
        if (score >= 19) return { risco: 'Sem risco', cor: 'text-green-400' };
        if (score >= 15) return { risco: 'Baixo risco', cor: 'text-yellow-400' };
        if (score >= 13) return { risco: 'Risco moderado', cor: 'text-orange-400' };
        if (score >= 10) return { risco: 'Alto risco', cor: 'text-red-400' };
        return { risco: 'Risco muito alto', cor: 'text-red-600' };
    }
    
    // Braden Q (Pediátrica)
    if (score >= 20) return { risco: 'Sem risco', cor: 'text-green-400' };
    if (score >= 16) return { risco: 'Risco moderado', cor: 'text-yellow-400' };
    if (score >= 13) return { risco: 'Risco alto', cor: 'text-red-400' };
    return { risco: 'Risco muito alto', cor: 'text-red-600' };
};

const escalasConfig = {
    // --- Braden (Adulto > 8 anos) ---
    braden: {
        titulo: 'Braden',
        nomeCompleto: 'Escala de Braden',
        idade: 'Maiores de 8 anos',
        tipo: 'score',
        totalMax: 23,
        opcoes: scoreOptions1_4,
        interpreta: (score: number) => interpretarBraden(score, 'Braden (Adulto)'),
        cores: { 
            bg: 'bg-orange-600 dark:bg-orange-600', 
            hover: 'hover:bg-orange-500 dark:hover:bg-orange-500', 
            text: 'text-orange-300 dark:text-orange-300', 
            bgProgress: 'bg-orange-500 dark:bg-orange-500', 
            bgBase: 'bg-orange-700 dark:bg-orange-700', 
            hoverBase: 'hover:bg-orange-600 dark:hover:bg-orange-600',
            border: 'border-orange-500 dark:border-orange-500'
        },
        itens: [
            { 
                id: 'c1', 
                label: '1. Percepção Sensorial', 
                desc: 'Capacidade de resposta e nível de dor/desconforto.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Totalmente limitado', 'Muito limitado', 'Ligeiramente limitado', 'Sem limitação'] 
            },
            { 
                id: 'c2', 
                label: '2. Umidade', 
                desc: 'Grau de exposição da pele à umidade.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Constantemente úmida', 'Muito úmida', 'Ocasionalmente úmida', 'Raramente úmida'] 
            },
            { 
                id: 'c3', 
                label: '3. Atividade', 
                desc: 'Nível de atividade física.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Acamado', 'Confinado à cadeira', 'Anda ocasionalmente', 'Anda frequentemente'] 
            },
            { 
                id: 'c4', 
                label: '4. Mobilidade', 
                desc: 'Capacidade de mudar e controlar a posição do corpo.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Totalmente imóvel', 'Muito limitada', 'Ligeiramente limitada', 'Sem limitações'] 
            },
            { 
                id: 'c5', 
                label: '5. Nutrição', 
                desc: 'Padrão habitual de ingestão alimentar.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Muito pobre', 'Provavelmente inadequada', 'Adequada', 'Excelente'] 
            },
            { 
                id: 'c6', 
                label: '6. Fricção/Cisalhamento', 
                desc: 'Risco de dano na pele devido a fricção.', 
                pontos: [1, 2, 3], 
                scoreDesc: ['Problema evidente', 'Problema potencial', 'Sem problema aparente'] 
            },
        ],
    },
    // --- Braden Q (Enfermaria) ---
    bradenq: {
        titulo: 'Braden Q',
        nomeCompleto: 'Braden Q (Enfermaria)',
        idade: '21 dias de vida a 8 anos',
        tipo: 'score',
        totalMax: 28,
        opcoes: scoreOptions1_4,
        interpreta: (score: number) => interpretarBraden(score, 'Braden Q'),
        cores: { 
            bg: 'bg-pink-600 dark:bg-pink-600', 
            hover: 'hover:bg-pink-500 dark:hover:bg-pink-500', 
            text: 'text-pink-300 dark:text-pink-300', 
            bgProgress: 'bg-pink-500 dark:bg-pink-500', 
            bgBase: 'bg-pink-700 dark:bg-pink-700', 
            hoverBase: 'hover:bg-pink-600 dark:hover:bg-pink-600',
            border: 'border-pink-500 dark:border-pink-500'
        },
        itens: [
            { 
                id: 'c1', 
                label: '1. Mobilidade', 
                desc: 'Grau e tipo de movimentos espontâneos.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Não faz movimentos; imóvel', 'Movimentos muito limitados', 'Muda posição ocasionalmente', 'Muda posição frequentemente'] 
            },
            { 
                id: 'c2', 
                label: '2. Atividade', 
                desc: 'Nível de atividade física.', 
                pontos: [1, 2, 3], 
                scoreDesc: ['Acamado', 'Restrito à cadeira/engatinha', 'Caminha'] 
            },
            { 
                id: 'c3', 
                label: '3. Percepção Sensorial', 
                desc: 'Capacidade de responder a estímulos.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Não responde a estímulos', 'Responde apenas à dor', 'Responde à fala, orientado/confuso', 'Orientado e responde adequadamente'] 
            },
            { 
                id: 'c4', 
                label: '4. Umidade', 
                desc: 'Grau de exposição da pele à umidade.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Constantemente úmida', 'Muito úmida', 'Ocasionalmente úmida', 'Raramente úmida'] 
            },
            { 
                id: 'c5', 
                label: '5. Fricção/Cisalhamento', 
                desc: 'Risco de dano na pele devido a fricção.', 
                pontos: [1, 2, 3], 
                scoreDesc: ['Problema evidente', 'Problema potencial', 'Sem problema'] 
            },
            { 
                id: 'c6', 
                label: '6. Nutrição', 
                desc: 'Padrão habitual de ingestão alimentar.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Muito pobre', 'Provavelmente inadequada', 'Adequada', 'Excelente'] 
            },
            { 
                id: 'c7', 
                label: '7. Perfusão/Oxigenação', 
                desc: 'Avaliação da perfusão/oxigenação.', 
                pontos: [1, 2, 3], 
                scoreDesc: ['Má perfusão/oxigenação', 'Comprometimento moderado', 'Comprometimento leve/adequada'] 
            },
        ],
    },
    // --- Braden Q (Ampliada/Versão Completa) ---
    bradenq_ampliada: {
        titulo: 'Braden Q Ampliada',
        nomeCompleto: 'Braden Q Ampliada (UTI Neo e Pediátrica)',
        idade: '21 dias de vida a 8 anos',
        tipo: 'score',
        totalMax: 28,
        opcoes: scoreOptions1_4,
        interpreta: (score: number) => interpretarBraden(score, 'Braden Q Ampliada'),
        cores: { 
            bg: 'bg-teal-600 dark:bg-teal-600', 
            hover: 'hover:bg-teal-500 dark:hover:bg-teal-500', 
            text: 'text-teal-300 dark:text-teal-300', 
            bgProgress: 'bg-teal-500 dark:bg-teal-500', 
            bgBase: 'bg-teal-700 dark:bg-teal-700', 
            hoverBase: 'hover:bg-teal-600 dark:hover:bg-teal-600',
            border: 'border-teal-500 dark:border-teal-500'
        },
        itens: [
            { 
                id: 'c1', 
                label: '1. Mobilidade', 
                desc: 'Grau e tipo de movimentos espontâneos (versão detalhada).', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Não faz movimentos; completamente imóvel', 'Movimentos muito limitados; raramente muda de posição', 'Muda de posição ocasionalmente; pouca amplitude', 'Muda de posição frequentemente e de forma completa'] 
            },
            { 
                id: 'c2', 
                label: '2. Atividade', 
                desc: 'Nível de atividade física.', 
                pontos: [1, 2, 3], 
                scoreDesc: ['Acamado; não realiza mobilidade ativa', 'Restrito à cadeira; não deambula', 'Move-se no leito, engatinha ou senta sozinho'] 
            },
            { 
                id: 'c3', 
                label: '3. Percepção Sensorial', 
                desc: 'Capacidade de responder a estímulos.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Não responde a estímulos desconfortáveis ou dolorosos', 'Responde apenas à dor; resposta lenta ou inconsistente', 'Responde à fala, orientado porém confuso ou desorientado', 'Orientado e responde adequadamente a estímulos'] 
            },
            { 
                id: 'c4', 
                label: '4. Umidade', 
                desc: 'Grau de exposição da pele à umidade.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Pele constantemente úmida; fraldas ou suor persistente', 'Muito úmida; necessita trocas', 'Ocasionalmente úmida; umidade intermitente', 'Raramente úmida; pele seca e íntegra'] 
            },
            { 
                id: 'c5', 
                label: '5. Fricção/Cisalhamento', 
                desc: 'Risco de dano na pele devido a fricção.', 
                pontos: [1, 2, 3], 
                scoreDesc: ['Problema evidente; exige reposicionamento frequente', 'Problema potencial; movimenta-se mas desliza no leito', 'Sem problema aparente; movimenta-se sem deslizar'] 
            },
            { 
                id: 'c6', 
                label: '6. Nutrição', 
                desc: 'Padrão habitual de ingestão alimentar.', 
                pontos: [1, 2, 3, 4], 
                scoreDesc: ['Ingestão muito pobre; recusa alimentar persistente', 'Provavelmente inadequada; ingestão parcial das refeições', 'Adequada; cumpre mais de 50% das necessidades', 'Excelente; ingere refeições completas e suplementação'] 
            },
            { 
                id: 'c7', 
                label: '7. Perfusão/Oxigenação', 
                desc: 'Avaliação da perfusão/oxigenação.', 
                pontos: [1, 2, 3], 
                scoreDesc: ['Má perfusão e má oxigenação; extremidades frias, palidez', 'Comprometimento moderado da perfusão/oxigenação; sinais mínimos adequados', 'Perfusão e oxigenação adequada'] 
            },
        ],
    },
};

// ==========================================
// ⚛️ COMPONENTES VISUAIS (UI)
// ==========================================

const BackIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-6 h-6 text-green-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const SaveIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-4 10V4m0 0l-3 3m3-3l3 3"></path>
    </svg>
);

// Componente Card de Pergunta de Risco (Braden)
const BradenQuestionCard = ({ item, valor, onChange }: any) => {
    const isSelected = valor !== undefined && valor !== null && valor !== '';

    const availableOptions = item.pontos.map((p: number, index: number) => ({
        valor: p,
        texto: `${p} - ${item.scoreDesc[index]}`,
        rawText: item.scoreDesc[index]
    }));

    return (
        <div
            id={item.id}
            className={`p-4 rounded-xl shadow-md mb-3 transition-all duration-300
            ${isSelected
                ? 'bg-indigo-900/30 border border-indigo-600'
                : 'bg-slate-800 border border-slate-700 hover:border-slate-600'}
        `}
        >
            <div className="mb-4 flex justify-between items-start">
                <div>
                    <label className="block text-base font-bold text-gray-100">{item.label}</label>
                    <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                </div>
                {isSelected && <CheckIcon />}
            </div>

            <div className="relative">
                <select
                    value={valor === undefined || valor === null ? '' : valor}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-gray-100 p-3 pr-12 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                    <option value="" disabled>
                        Pontuação: 1 a {item.pontos.length}
                    </option>
                    {availableOptions.map((opt: any) => (
                        <option
                            key={opt.texto}
                            value={opt.valor}
                        >
                            {opt.texto}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 🚀 APLICAÇÃO PRINCIPAL
// ==========================================

interface BradenRiscoLesaoScaleProps {
    onSaveScore?: (data: { scaleName: string; score: number; interpretation: string }) => void;
    patientId?: string | number;
}

export default function BradenRiscoLesaoScale({ onSaveScore, patientId }: BradenRiscoLesaoScaleProps) {
    const [tela, setTela] = useState('intro'); // intro, form, resultado
    const [escalaAtiva, setEscalaAtiva] = useState<keyof typeof escalasConfig | null>(null);
    const [respostas, setRespostas] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
    const patientsContext = useContext(PatientsContext);

    // Configuração da escala atual
    const configAtual = escalaAtiva ? escalasConfig[escalaAtiva] : null;
    const corClasses = configAtual ? escalasConfig[escalaAtiva!].cores : {};

    // CÁLCULO DE PROGRESSO
    const itensRespondidos = configAtual ? Object.keys(respostas).filter(key => respostas[key] !== undefined && respostas[key] !== null).length : 0;
    const totalItens = configAtual ? configAtual.itens.length : 0;
    const progresso = totalItens > 0 ? (itensRespondidos / totalItens) * 100 : 0;

    // --- Lógica de Interpretação Unificada ---
    const resultadoAvaliacao = useMemo(() => {
        if (!configAtual) return null;

        const pontuacao = Object.values(respostas).reduce((acc, val) => acc + (val || 0), 0);

        // 1. Em Andamento
        if (itensRespondidos < totalItens) {
            return {
                texto: 'Avaliação em Andamento',
                detalhe: `Responda a todos os ${totalItens} itens.`,
                cor: 'text-yellow-400',
                icone: '⏳',
                isCompleto: false,
                pontuacao: pontuacao
            };
        }

        // 2. Escalas de Score (Braden)
        const interpretacao = configAtual.interpreta(pontuacao);
        const isPositivo = interpretacao.risco.includes('Risco');

        return {
            pontuacao: pontuacao,
            isPositivo: isPositivo,
            texto: interpretacao.risco,
            detalhe: `Pontuação ${pontuacao} de ${configAtual.totalMax}.`,
            cor: interpretacao.cor,
            bg: isPositivo ? 'bg-red-500' : 'bg-green-500',
            border: isPositivo ? 'border-red-500' : 'border-green-500',
            icone: isPositivo ? '🚨' : '✅',
            isCompleto: true
        };

    }, [respostas, configAtual, itensRespondidos, totalItens]);

    // --- Handlers de Ação ---
    const iniciarAvaliacao = (escala: keyof typeof escalasConfig) => {
        setEscalaAtiva(escala);
        setRespostas({});
        setTela('form');
        setSaveStatus(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleResposta = (id: string, valor: number) => {
        setRespostas(prev => ({ ...prev, [id]: valor }));

        const currentItemIndex = configAtual!.itens.findIndex(item => item.id === id);
        const nextItemIndex = currentItemIndex + 1;
        const HEADER_OFFSET = 100;

        if (nextItemIndex < configAtual!.itens.length) {
            const nextItemId = configAtual!.itens[nextItemIndex].id;

            setTimeout(() => {
                const nextElement = document.getElementById(nextItemId);
                if (nextElement) {
                    const y = nextElement.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const finalizarAvaliacao = () => {
        if (resultadoAvaliacao && resultadoAvaliacao.isCompleto) {
            setTela('resultado');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const saveAssessment = async () => {
        if (!onSaveScore || !configAtual || !resultadoAvaliacao?.isCompleto) {
            setSaveStatus('error');
            return;
        }

        setIsSaving(true);
        setSaveStatus(null);

        try {
            const data = {
                scaleName: configAtual.titulo,
                score: resultadoAvaliacao.pontuacao,
                interpretation: resultadoAvaliacao.texto
            };

            onSaveScore(data);
            setSaveStatus('success');
        } catch (error) {
            console.error("Erro ao salvar avaliação:", error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Telas ---

    // 1. Menu Principal (INTRO)
    if (tela === 'intro') {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 bg-slate-950 min-h-screen text-gray-100 font-sans dark:bg-slate-950">
                <header className="mb-8 text-center pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-900 rounded-2xl mb-4 shadow-lg border border-orange-700">
                        <span className="text-3xl">🛏️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Risco de Lesão por Pressão</h1>
                    <p className="text-sm text-orange-300 font-medium">Escalas Braden e Braden Q</p>
                </header>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl mb-6 space-y-3">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-700 pb-2">SELECIONE A ESCALA</h2>

                    {/* Braden (Adulto > 8 anos) */}
                    <button
                        onClick={() => iniciarAvaliacao('braden')}
                        className="w-full bg-orange-700 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition text-left flex justify-between items-center"
                    >
                        <div>
                            <span className="block font-bold">{escalasConfig.braden.titulo}</span>
                            <span className="text-xs text-orange-200">{escalasConfig.braden.nomeCompleto}</span>
                        </div>
                    </button>

                    {/* Braden Q (Enfermaria) */}
                    <button
                        onClick={() => iniciarAvaliacao('bradenq')}
                        className="w-full bg-pink-700 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition text-left flex justify-between items-center"
                    >
                        <div>
                            <span className="block font-bold">{escalasConfig.bradenq.titulo}</span>
                            <span className="text-xs text-pink-200">{escalasConfig.bradenq.nomeCompleto}</span>
                        </div>
                    </button>

                    {/* Braden Q Ampliada (UTI Neo e Pediátrica) */}
                    <button
                        onClick={() => iniciarAvaliacao('bradenq_ampliada')}
                        className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition text-left flex justify-between items-center"
                    >
                        <div>
                            <span className="block font-bold">{escalasConfig.bradenq_ampliada.titulo}</span>
                            <span className="text-xs text-teal-200">{escalasConfig.bradenq_ampliada.nomeCompleto}</span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // 2. Formulário de Perguntas (FORM)
    if (tela === 'form' && configAtual) {
        const scoreSubtitle = `Risco atual: ${resultadoAvaliacao?.texto || 'Aguardando'}`;

        return (
            <div className="w-full max-w-2xl mx-auto p-4 bg-slate-950 min-h-screen text-gray-100 flex flex-col dark:bg-slate-950">
                {/* Header Fixo */}
                <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm pb-4 pt-2 border-b border-slate-800 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={() => setTela('intro')} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-slate-800">
                            <BackIcon />
                        </button>
                        <div className="text-center">
                            <span className={`text-sm font-bold ${corClasses.text}`}>{configAtual.titulo}</span>
                            <div className={`text-xs font-bold mt-1 ${resultadoAvaliacao?.cor}`}>{scoreSubtitle}</div>
                        </div>
                        <div className="w-8" />
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                            className={`${corClasses.bgProgress} h-full transition-all duration-500 ease-out`}
                            style={{ width: `${progresso}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{itensRespondidos} de {configAtual.itens.length} respondidos</span>
                        <span>Pontos: {resultadoAvaliacao?.pontuacao || 0}</span>
                    </div>
                </div>

                {/* Lista de Perguntas */}
                <div className="flex-1 space-y-4 pb-24">
                    {configAtual.itens.map((item) => (
                        <BradenQuestionCard
                            key={item.id}
                            item={item}
                            valor={respostas[item.id]}
                            onChange={(val: number) => handleResposta(item.id, val)}
                        />
                    ))}
                </div>

                {/* Botão Flutuante de Conclusão */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={finalizarAvaliacao}
                            disabled={!resultadoAvaliacao?.isCompleto}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all
                                ${resultadoAvaliacao?.isCompleto
                                ? `${corClasses.bg} ${corClasses.hover} text-white transform hover:scale-105`
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                            `}
                        >
                            {resultadoAvaliacao?.isCompleto ? 'Finalizar e Ver Diagnóstico' : `Responda tudo (${itensRespondidos}/${configAtual.itens.length})`}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Tela de Resultado (RESULTADO)
    if (tela === 'resultado' && configAtual && resultadoAvaliacao) {
        return (
            <div className="w-full max-w-md mx-auto p-4 bg-slate-950 min-h-screen text-gray-100 font-sans flex flex-col items-center pt-10 dark:bg-slate-950">
                <div className="w-full text-left mb-6">
                    <button onClick={() => setTela('intro')} className="flex items-center text-gray-400 hover:text-white transition-colors">
                        <BackIcon />
                        <span className="ml-2">Voltar ao Menu Principal</span>
                    </button>
                </div>

                <div className={`relative w-full flex items-center justify-center mb-8 py-12`}>
                    {/* Círculo de fundo com cor dinâmica */}
                    <div className={`absolute inset-0 rounded-full opacity-20 ${resultadoAvaliacao.bg} blur-xl animate-pulse w-48 h-48 mx-auto`}></div>
                    <div className={`relative w-40 h-40 ${corClasses.bgBase} rounded-full border-4 ${resultadoAvaliacao.border} flex flex-col items-center justify-center shadow-2xl`}>
                        <span className="text-6xl font-black text-white">{resultadoAvaliacao.pontuacao}</span>
                        <span className="text-xs text-gray-300 uppercase tracking-widest mt-1">{configAtual.titulo}</span>
                    </div>
                </div>

                <div className="text-center mb-2 -mt-6">
                    <span className="inline-block bg-slate-800 px-4 py-1 rounded-full border border-slate-700 shadow-lg text-sm font-semibold text-gray-300">
                        Resultado
                    </span>
                </div>

                <div className="text-center space-y-2 mb-8 w-full">
                    <h2 className={`text-4xl font-bold ${resultadoAvaliacao.cor}`}>{resultadoAvaliacao.texto}</h2>
                    <p className="text-gray-400 text-sm">{resultadoAvaliacao.detalhe}</p>
                </div>

                {/* Tabela de Classificação de Risco */}
                <div className="w-full bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3 mt-6">
                    <h3 className="font-bold text-gray-300 border-b border-slate-800 pb-3 text-sm">Classificação de Risco {configAtual.titulo}</h3>
                    {configAtual.titulo === 'Braden' && (
                        <ul className="text-sm space-y-2">
                            <li className="flex justify-between items-center text-green-400 hover:bg-slate-800/50 px-2 py-1 rounded"><span className="font-semibold">19–23</span><span>Sem risco</span></li>
                            <li className="flex justify-between items-center text-yellow-400 hover:bg-slate-800/50 px-2 py-1 rounded"><span className="font-semibold">15–18</span><span>Baixo risco</span></li>
                            <li className="flex justify-between items-center text-orange-400 hover:bg-slate-800/50 px-2 py-1 rounded"><span className="font-semibold">13–14</span><span>Risco moderado</span></li>
                            <li className="flex justify-between items-center text-red-400 hover:bg-slate-800/50 px-2 py-1 rounded"><span className="font-semibold">10–12</span><span>Alto risco</span></li>
                            <li className="flex justify-between items-center text-red-600 hover:bg-slate-800/50 px-2 py-1 rounded"><span className="font-semibold">≤ 9</span><span>Risco muito alto</span></li>
                        </ul>
                    )}
                    {configAtual.titulo.includes('Braden Q') && (
                        <ul className="text-sm space-y-2">
                            <li className="flex justify-between items-center text-green-400 hover:bg-slate-800/50 px-2 py-1 rounded"><span className="font-semibold">20–28</span><span>Sem risco</span></li>
                            <li className="flex justify-between items-center text-yellow-400 hover:bg-slate-800/50 px-2 py-1 rounded"><span className="font-semibold">16–19</span><span>Risco moderado</span></li>
                            <li className="flex justify-between items-center text-red-400 hover:bg-slate-800/50 px-2 py-1 rounded"><span className="font-semibold">13–15</span><span>Risco alto</span></li>
                            <li className="flex justify-between items-center text-red-600 hover:bg-slate-800/50 px-2 py-1 rounded"><span className="font-semibold">≤ 12</span><span>Risco muito alto</span></li>
                        </ul>
                    )}
                </div>

                {/* Seção de Salvar e Nova Avaliação */}
                <div className="w-full space-y-4 mt-8">
                    <button
                        onClick={saveAssessment}
                        disabled={isSaving || saveStatus === 'success'}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center
                        ${isSaving
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : saveStatus === 'success'
                                ? 'bg-green-700 text-white cursor-not-allowed'
                                : `${corClasses.bg} ${corClasses.hover} text-white transform hover:scale-[1.02]`}
                        `}
                    >
                        {isSaving ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Salvando...
                            </span>
                        ) : saveStatus === 'success' ? (
                            <span>Avaliação Salva com Sucesso!</span>
                        ) : (
                            <span>Salvar Avaliação</span>
                        )}
                    </button>

                    {saveStatus === 'error' && (
                        <p className="text-sm text-center text-red-400">
                            Erro ao salvar. Verifique a conexão ou tente novamente.
                        </p>
                    )}
                </div>

                <button
                    onClick={() => setTela('intro')}
                    className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors border border-slate-700"
                >
                    Nova Avaliação
                </button>
            </div>
        );
    }

    return null;
}
