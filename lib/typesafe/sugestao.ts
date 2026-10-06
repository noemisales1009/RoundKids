import { RespostaChoice } from './cliente';

// 'alta' pode pré-preencher o campo; 'media' aparece só como sugestão clicável.
export interface Sugestao {
    valor: string;
    nivel: 'alta' | 'media';
    confianca: number; // de 0 a 1, como veio do modelo
}

// Chave geral do pré-preenchimento. Desligada: toda sugestão aparece como botão e só
// entra no campo com um clique, mesmo com confiança alta. Só religar (aqui, ou por campo)
// depois de medir com dados reais que a taxa de acerto sustenta preencher sozinho.
export const PREENCHER_AUTOMATICO = false;

// Limiares de confiança. Valores iniciais da documentação do TypeSafe; ajustar depois
// de validar com registros reais anonimizados.
export const CONFIANCA_ALTA = 0.9;
export const CONFIANCA_MEDIA = 0.5;

// Transforma a resposta do modelo em sugestão para a tela. Devolve undefined quando a
// confiança é baixa, quando a opção é uma das que não viram sugestão (as de escape) ou
// quando a opção devolvida não existe na lista do campo.
export const paraSugestao = (
    resposta: RespostaChoice | undefined,
    opcoes: Record<string, unknown>,
    semSugestao: Set<string>,
): Sugestao | undefined => {
    if (!resposta || semSugestao.has(resposta.choice) || resposta.confidence < CONFIANCA_MEDIA) return undefined;
    if (!(resposta.choice in opcoes)) return undefined;
    return {
        valor: resposta.choice,
        nivel: resposta.confidence >= CONFIANCA_ALTA ? 'alta' : 'media',
        confianca: resposta.confidence,
    };
};
