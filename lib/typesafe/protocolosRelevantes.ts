import { PerguntaNoul, perguntarTypeSafe } from './cliente';

// Consulta aos protocolos institucionais. O modelo não escreve nada: responde sim ou não
// para cada protocolo e para cada trecho, e a tela mostra o texto do próprio protocolo.
// Vai só a pergunta do round ou a dúvida digitada, mais o conteúdo dos protocolos.

export interface Protocolo {
    id: string;
    titulo: string;
    quando_usar: string | null;
    categoria_id: number | null;
    arquivo_path: string;
}

// Pedaço de um protocolo (uma seção, uma tabela), transcrito do PDF.
export interface Trecho {
    id: string;
    protocolo_id: string;
    ordem: number;
    pagina: number;
    titulo: string;
    texto: string;
}

// Cortes de probabilidade. Valores iniciais; ajustar depois de validar com as perguntas,
// as dúvidas e os protocolos reais.
export const MIN_RELEVANTE = 0.6;          // protocolo sugerido para a pergunta do round
export const MIN_PROTOCOLO_DA_DUVIDA = 0.3; // protocolo em que vale procurar a dúvida (corte baixo: é só um filtro)
export const MIN_TRECHO = 0.6;             // trecho mostrado como resposta

export const MAX_PROTOCOLOS_DA_DUVIDA = 3;
export const MAX_TRECHOS = 5;

const PROTOCOLOS_POR_CHAMADA = 10; // limite de perguntas da ponte no servidor
const TRECHOS_POR_CHAMADA = 5;     // trecho é texto longo; mantém a chamada dentro do tamanho aceito
const MAX_QUANDO_USAR = 300;       // caracteres
const MAX_TEXTO_TRECHO = 1500;     // caracteres

// Faz uma pergunta de sim ou não por item, em lotes paralelos. Devolve null quando o
// serviço não responde, para a tela não confundir "fora do ar" com "nada encontrado".
const pontuar = async <T>(
    itens: T[],
    porChamada: number,
    prefixo: string,
    montarState: (porId: Record<string, T>) => unknown,
    pergunta: (id: string) => PerguntaNoul,
): Promise<{ item: T; prob: number }[] | null> => {
    const lotes: T[][] = [];
    for (let i = 0; i < itens.length; i += porChamada) lotes.push(itens.slice(i, i + porChamada));

    const resultados = await Promise.all(lotes.map(async lote => {
        const ids = lote.map((_, i) => `${prefixo}${i + 1}`);
        const state = montarState(Object.fromEntries(ids.map((id, i) => [id, lote[i]])));
        const respostas = await perguntarTypeSafe(state, Object.fromEntries(ids.map(id => [id, pergunta(id)])));
        if (!respostas) return null;
        return lote.map((item, i) => ({ item, prob: respostas[ids[i]]?.noul ?? 0 }));
    }));

    if (resultados.some(r => r === null)) return null;
    return (resultados as { item: T; prob: number }[][]).flat().sort((a, b) => b.prob - a.prob);
};

const resumoProtocolos = (porId: Record<string, Protocolo>) =>
    Object.fromEntries(Object.entries(porId).map(([id, p]) => [id, {
        titulo: p.titulo,
        quando_usar: (p.quando_usar ?? '').slice(0, MAX_QUANDO_USAR),
    }]));

// Protocolos sugeridos para uma pergunta do round, do mais para o menos provável.
// Lista vazia quando nenhum passa do corte ou quando o serviço não responde.
export const acharProtocolosRelevantes = async (
    sistema: string,
    pergunta: string,
    protocolos: Protocolo[],
): Promise<string[]> => {
    if (protocolos.length === 0) return [];
    const pontuados = await pontuar(
        protocolos,
        PROTOCOLOS_POR_CHAMADA,
        'p',
        porId => ({ sistema, pergunta, protocolos: resumoProtocolos(porId) }),
        id => ({
            type: 'noul',
            instructions: `Em uma UTI pediátrica, a equipe está respondendo no round a pergunta \`pergunta\`, do sistema \`sistema\`. O protocolo institucional \`protocolos.${id}\` orienta a avaliação ou a conduta de que essa pergunta trata?`,
            criteria: {
                true: 'O protocolo trata do mesmo assunto da pergunta e ajudaria a equipe a decidir',
                false: 'O protocolo é de outro assunto, ou só tem relação distante com a pergunta',
            },
        }),
    );
    return (pontuados ?? []).filter(r => r.prob >= MIN_RELEVANTE).map(r => r.item.id);
};

// Protocolos em que vale procurar a resposta de uma dúvida digitada. null = serviço fora do ar.
export const acharProtocolosDaDuvida = async (
    duvida: string,
    protocolos: Protocolo[],
): Promise<Protocolo[] | null> => {
    if (protocolos.length === 0) return [];
    const pontuados = await pontuar(
        protocolos,
        PROTOCOLOS_POR_CHAMADA,
        'p',
        porId => ({ duvida, protocolos: resumoProtocolos(porId) }),
        id => ({
            type: 'noul',
            instructions: `Um profissional de uma UTI pediátrica digitou a dúvida \`duvida\`. O protocolo institucional \`protocolos.${id}\` pode conter a resposta para essa dúvida?`,
            criteria: {
                true: 'A dúvida é sobre a doença, a situação ou a conduta de que o protocolo trata',
                false: 'A dúvida é sobre outro assunto',
            },
        }),
    );
    if (!pontuados) return null;
    return pontuados
        .filter(r => r.prob >= MIN_PROTOCOLO_DA_DUVIDA)
        .slice(0, MAX_PROTOCOLOS_DA_DUVIDA)
        .map(r => r.item);
};

// Trechos que respondem à dúvida, do mais para o menos provável. null = serviço fora do ar.
export const acharTrechosDaDuvida = async (
    duvida: string,
    trechos: Trecho[],
    tituloDoProtocolo: (protocoloId: string) => string,
): Promise<Trecho[] | null> => {
    if (trechos.length === 0) return [];
    const pontuados = await pontuar(
        trechos,
        TRECHOS_POR_CHAMADA,
        't',
        porId => ({
            duvida,
            trechos: Object.fromEntries(Object.entries(porId).map(([id, t]) => [id, {
                protocolo: tituloDoProtocolo(t.protocolo_id),
                secao: t.titulo,
                texto: t.texto.slice(0, MAX_TEXTO_TRECHO),
            }])),
        }),
        id => ({
            type: 'noul',
            instructions: `Um profissional de uma UTI pediátrica digitou a dúvida \`duvida\`. O trecho de protocolo \`trechos.${id}\` traz a informação que responde a essa dúvida?`,
            criteria: {
                true: 'O trecho traz a definição, o critério, a dose, o valor ou a conduta que a dúvida pede',
                false: 'O trecho é do mesmo protocolo mas fala de outra coisa, ou não traz a informação pedida',
            },
        }),
    );
    if (!pontuados) return null;
    return pontuados.filter(r => r.prob >= MIN_TRECHO).slice(0, MAX_TRECHOS).map(r => r.item);
};
