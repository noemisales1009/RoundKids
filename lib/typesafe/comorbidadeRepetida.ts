import { PerguntaChoice, perguntarTypeSafe } from './cliente';
import { CONFIANCA_MEDIA } from './sugestao';

// Verifica se a comorbidade que está sendo cadastrada já existe na lista do paciente,
// escrita de outro jeito (sigla, sinônimo, erro de digitação). Só avisa: quem decide
// se adiciona mesmo assim é quem está cadastrando.

const NENHUMA = '(nenhuma)';

// Devolve a comorbidade já cadastrada que parece ser a mesma, ou null.
export const acharComorbidadeRepetida = async (nova: string, existentes: string[]): Promise<string | null> => {
    if (existentes.length === 0) return null;

    const pergunta: PerguntaChoice = {
        type: 'choice',
        instructions: '`nova` é uma comorbidade que está sendo cadastrada para um paciente. Qual das opções é a mesma doença ou condição que `nova`, ainda que escrita de outro jeito (sigla, sinônimo, abreviação, erro de digitação)?',
        criteria: {
            ...Object.fromEntries(existentes.map(c => [c, null])),
            [NENHUMA]: 'Nenhuma das opções é a mesma doença ou condição',
        },
    };

    const respostas = await perguntarTypeSafe({ nova }, { repetida: pergunta });
    const r = respostas?.repetida;
    if (!r || r.choice === NENHUMA || r.confidence < CONFIANCA_MEDIA) return null;
    return existentes.includes(r.choice) ? r.choice : null;
};
