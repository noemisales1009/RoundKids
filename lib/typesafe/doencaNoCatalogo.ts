import { PerguntaChoice, perguntarTypeSafe } from './cliente';
import { CONFIANCA_MEDIA } from './sugestao';

// Quando a busca por texto não acha a doença no catálogo de precauções, procura se ela
// está lá com outro nome (nome popular, sigla, agente, erro de digitação).
// O modelo só aponta itens do catálogo: o tipo de precaução e a duração continuam vindo
// do protocolo, nunca do modelo. Quem escolhe o item é quem está cadastrando.

const NENHUMA = '(nenhuma)';

// Mostra mais de um candidato quando o catálogo tem itens parecidos (ex.: as variantes
// de herpes zoster), para a pessoa escolher o certo em vez de receber um só.
const MIN_PROBABILIDADE = 0.15;
const MAX_CANDIDATOS = 3;

// Devolve os nomes do catálogo que podem corresponder ao texto, do mais provável para o
// menos. Lista vazia = não está no catálogo, ou sem resposta do serviço.
export const acharDoencaNoCatalogo = async (digitado: string, nomesDoCatalogo: string[]): Promise<string[]> => {
    if (nomesDoCatalogo.length === 0) return [];

    const pergunta: PerguntaChoice = {
        type: 'choice',
        instructions: '`digitado` é o que um profissional de UTI pediátrica escreveu ao buscar uma doença para registrar precaução de isolamento. As opções são as doenças do protocolo de precauções do hospital. Qual opção é a doença, ou o agente, que o profissional quis dizer, ainda que escrita de outro jeito (nome popular, sigla, nome do agente, sem acento, erro de digitação)?',
        criteria: {
            ...Object.fromEntries(nomesDoCatalogo.map(n => [n, null])),
            [NENHUMA]: 'Nenhuma opção corresponde ao que foi escrito',
        },
    };

    const respostas = await perguntarTypeSafe({ digitado }, { doenca: pergunta });
    const r = respostas?.doenca;
    // Abaixo da confiança média o modelo está chutando entre itens sem relação: melhor não sugerir.
    if (!r || r.choice === NENHUMA || r.confidence < CONFIANCA_MEDIA) return [];

    return Object.entries(r.probabilities)
        .filter(([nome, p]) => nome !== NENHUMA && p >= MIN_PROBABILIDADE && nomesDoCatalogo.includes(nome))
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_CANDIDATOS)
        .map(([nome]) => nome);
};
