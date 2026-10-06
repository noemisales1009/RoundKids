import { ALERT_DEADLINES, RESPONSIBLES } from '../../constants';
import { PerguntaChoice, perguntarTypeSafe } from './cliente';
import { Sugestao, paraSugestao } from './sugestao';
import { CRITERIOS_SISTEMA, SISTEMA_SEM_SUGESTAO } from './sugestaoSistema';

// Sugestão de sistema, responsável e prazo a partir da descrição digitada no alerta.
// As perguntas ficam neste arquivo; os limiares, em ./sugestao. O modelo só sugere:
// quem decide é quem está criando o alerta.

export type CampoAlerta = 'sistema' | 'responsavel' | 'prazo';

export type SugestoesAlerta = Partial<Record<CampoAlerta, Sugestao>>;

// Opção de escape: quando o texto não permite responder, não há sugestão.
const INDEFINIDO = 'indefinido';

const criterios = (opcoes: string[]): Record<string, string | null> =>
    Object.fromEntries(opcoes.map(o => [o, null]));

const PERGUNTAS: Record<CampoAlerta, PerguntaChoice> = {
    sistema: {
        type: 'choice',
        instructions: 'O texto em `descricao` é um alerta clínico de uma UTI pediátrica. A qual sistema clínico esse alerta pertence?',
        criteria: CRITERIOS_SISTEMA,
    },
    responsavel: {
        type: 'choice',
        instructions: 'O texto em `descricao` é um alerta clínico de uma UTI pediátrica. Qual profissional, ou conjunto de profissionais, deve executar a conduta pedida?',
        criteria: {
            ...criterios(RESPONSIBLES),
            [INDEFINIDO]: 'O texto não permite saber quem deve executar',
        },
    },
    // O prazo só é sugerido quando está escrito no texto. Estimar urgência clínica
    // continua sendo decisão de quem cria o alerta.
    prazo: {
        type: 'choice',
        instructions: 'O texto em `descricao` é um alerta clínico. Qual prazo, em horas, o próprio texto informa para a conduta?',
        criteria: {
            ...criterios(ALERT_DEADLINES),
            [INDEFINIDO]: 'O texto não informa prazo nem horário',
        },
    },
};

// Opções que nunca viram sugestão: a de escape e as que o campo de sistema já exclui.
const SEM_SUGESTAO = new Set([INDEFINIDO, ...SISTEMA_SEM_SUGESTAO]);

export const sugerirCamposAlerta = async (descricao: string, campos: CampoAlerta[]): Promise<SugestoesAlerta> => {
    const perguntas = Object.fromEntries(campos.map(c => [c, PERGUNTAS[c]]));
    const respostas = await perguntarTypeSafe({ descricao }, perguntas);
    if (!respostas) return {};

    const sugestoes: SugestoesAlerta = {};
    for (const campo of campos) {
        const sugestao = paraSugestao(respostas[campo], PERGUNTAS[campo].criteria, SEM_SUGESTAO);
        if (sugestao) sugestoes[campo] = sugestao;
    }
    return sugestoes;
};
