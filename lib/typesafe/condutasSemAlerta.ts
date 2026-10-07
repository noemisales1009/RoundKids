import { PerguntaNoul, perguntarTypeSafe } from './cliente';

// Procura, num texto livre (avaliação clínica do turno, condutas críticas), frases que
// pedem uma ação da equipe e que ainda não têm alerta ativo correspondente.
// O modelo não escreve nada: o código corta o texto em frases e o modelo responde sim ou
// não para cada uma. A frase original é que vira a descrição do alerta.

// Probabilidade mínima de a frase ser uma conduta pendente, e máxima de já existir
// alerta para ela. Valores iniciais; ajustar depois de validar com textos reais.
export const MIN_CONDUTA = 0.8;
export const MAX_JA_COBERTA = 0.5;

const MIN_FRASE = 10;      // caracteres; menos que isso não é conduta
const MAX_FRASES = 20;     // por texto
const PERGUNTAS_POR_CHAMADA = 10; // limite da ponte no servidor

// Corta em linhas e em frases. Ponto só separa quando vem seguido de espaço, para não
// quebrar números como "2.5", e não separa depois de inicial abreviada, como em "S. aureus".
export const cortarEmFrases = (texto: string): string[] =>
    texto
        .split(/\n+|(?<!\b[A-Za-z]\.)(?<=[.;!?])\s+/)
        .map(f => f.replace(/^[\s\-–•*\d.)]+/, '').trim())
        .filter(f => f.length >= MIN_FRASE)
        .slice(0, MAX_FRASES);

const perguntaConduta = (id: string): PerguntaNoul => ({
    type: 'noul',
    instructions: `\`frases.${id}\` é um trecho de evolução clínica de uma UTI pediátrica. O trecho pede uma ação que a equipe ainda precisa executar, como exame, coleta, reavaliação, ajuste de tratamento, procedimento ou solicitação de parecer?`,
    criteria: {
        true: 'Pede uma ação ainda a fazer',
        false: 'Só descreve o estado do paciente, um resultado, um plano genérico de manter o que já está em curso, ou algo já feito',
    },
});

const perguntaCoberta = (id: string): PerguntaNoul => ({
    type: 'noul',
    instructions: `Algum item de \`alertas_ativos\` já pede a mesma ação que o trecho \`frases.${id}\`?`,
    criteria: {
        true: 'Existe alerta ativo pedindo a mesma ação',
        false: 'Nenhum alerta ativo trata dessa ação',
    },
});

// Achado de exame de imagem que pede atenção. No laudo digitado os achados costumam vir
// separados por " / " ou " + " e são curtos ("TOT ALTO"), então o corte é mais fino.
const MIN_ACHADO = 4; // caracteres
export const cortarEmAchados = (texto: string): string[] =>
    texto
        .split(/\n+|\s+[/+]\s+|(?<!\b[A-Za-z]\.)(?<=[.;!?])\s+/)
        .map(f => f.replace(/^[\s\-–•*\d.)]+/, '').trim())
        .filter(f => f.length >= MIN_ACHADO)
        .slice(0, MAX_FRASES);

const perguntaAchado = (id: string): PerguntaNoul => ({
    type: 'noul',
    instructions: `\`frases.${id}\` é um trecho do resultado do exame de imagem \`exame\` de uma criança internada em UTI pediátrica. O trecho descreve um achado anormal que pede uma conduta ou uma reavaliação da equipe, como dispositivo mal posicionado, ar ou líquido onde não deveria haver, coleção, obstrução, piora de uma lesão ou uma suspeita a esclarecer?`,
    criteria: {
        true: 'Achado anormal que pede conduta, correção, exame de controle ou reavaliação',
        false: 'Exame normal, achado sem mudança de conduta, achado crônico já conhecido, ou trecho que só descreve a técnica do exame',
    },
});

// Achados do resultado de um exame de imagem que pedem conduta e ainda não têm alerta ativo.
export const acharAchadosSemAlerta = (texto: string, alertasAtivos: string[], exame: string): Promise<string[]> =>
    acharSemAlerta(cortarEmAchados(texto), alertasAtivos, perguntaAchado, { exame });

export const acharCondutasSemAlerta = (texto: string, alertasAtivos: string[]): Promise<string[]> =>
    acharSemAlerta(cortarEmFrases(texto), alertasAtivos, perguntaConduta, {});

const acharSemAlerta = async (
    frases: string[],
    alertasAtivos: string[],
    perguntaAlvo: (id: string) => PerguntaNoul,
    contexto: Record<string, string>,
): Promise<string[]> => {
    if (frases.length === 0) return [];

    const temAlertas = alertasAtivos.length > 0;
    const porChamada = temAlertas ? PERGUNTAS_POR_CHAMADA / 2 : PERGUNTAS_POR_CHAMADA;

    const lotes: string[][] = [];
    for (let i = 0; i < frases.length; i += porChamada) lotes.push(frases.slice(i, i + porChamada));

    const resultados = await Promise.all(lotes.map(async lote => {
        const ids = lote.map((_, i) => `f${i + 1}`);
        const perguntas: Record<string, PerguntaNoul> = {};
        ids.forEach(id => {
            perguntas[`conduta_${id}`] = perguntaAlvo(id);
            if (temAlertas) perguntas[`coberta_${id}`] = perguntaCoberta(id);
        });
        const state = {
            ...contexto,
            frases: Object.fromEntries(ids.map((id, i) => [id, lote[i]])),
            ...(temAlertas ? { alertas_ativos: alertasAtivos } : {}),
        };
        const respostas = await perguntarTypeSafe(state, perguntas);
        if (!respostas) return [];
        return lote.filter((_, i) => {
            const conduta = respostas[`conduta_${ids[i]}`]?.noul ?? 0;
            const coberta = temAlertas ? (respostas[`coberta_${ids[i]}`]?.noul ?? 1) : 0;
            return conduta >= MIN_CONDUTA && coberta < MAX_JA_COBERTA;
        });
    }));

    return resultados.flat();
};
