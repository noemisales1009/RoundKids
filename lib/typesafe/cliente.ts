import { supabase } from '../../supabaseClient';

// Pergunta de escolha única: a chave de `criteria` é a opção, o valor explica a opção
// (null quando o nome já basta).
export interface PerguntaChoice {
    type: 'choice';
    instructions: string;
    criteria: Record<string, string | null>;
}

// Pergunta de sim ou não. A resposta é a probabilidade de "sim", de 0 a 1.
export interface PerguntaNoul {
    type: 'noul';
    instructions: string;
    criteria?: { true: string; false: string };
}

export type Pergunta = PerguntaChoice | PerguntaNoul;

export interface RespostaChoice {
    type: 'choice';
    choice: string;
    confidence: number;
    probabilities: Record<string, number>;
}

export interface RespostaNoul {
    type: 'noul';
    noul: number;
}

type RespostaDe<P> = P extends PerguntaNoul ? RespostaNoul : RespostaChoice;

// Depois da primeira falha a sugestão fica desligada até recarregar a página, para o
// formulário não ficar disparando chamadas que não vão responder (função não publicada,
// chave ausente, serviço fora do ar).
let indisponivel = false;

// Devolve null em qualquer falha: sugestão é opcional e nunca pode travar o formulário.
export const perguntarTypeSafe = async <P extends Pergunta>(
    state: unknown,
    questions: Record<string, P>,
): Promise<Record<string, RespostaDe<P>> | null> => {
    if (indisponivel) return null;
    try {
        const { data, error } = await supabase.functions.invoke('typesafe', { body: { state, questions } });
        if (error || !data?.answers) {
            indisponivel = true;
            return null;
        }
        return data.answers as Record<string, RespostaDe<P>>;
    } catch {
        indisponivel = true;
        return null;
    }
};
