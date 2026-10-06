import { ALERT_SYSTEMS } from '../../constants';
import { PerguntaChoice, perguntarTypeSafe } from './cliente';
import { Sugestao, paraSugestao } from './sugestao';

// Sugestão do sistema clínico de um item cadastrado (exame, cultura, medicação, parecer...)
// a partir do nome ou da descrição dele. O modelo só sugere: quem decide é quem cadastra.

// Só os sistemas cujo nome não se explica sozinho.
const DESCRICAO_SISTEMA: Record<string, string> = {
    'Distúrbios hidroeletrolíticos/metabólicos e DAB': 'Sódio, potássio, cálcio, magnésio, glicemia e distúrbio ácido-básico',
    'Sedação /Analgesia': 'Dor, sedação, abstinência e delirium',
    'Avaliação nutricional / metabólica / hídrico': 'Dieta, nutrição enteral ou parenteral, oferta hídrica e balanço hídrico',
    'Gestão de riscos assistenciais': 'Risco de queda, lesão por pressão, perda de dispositivo, identificação do paciente',
    'Outros': 'Nenhum dos outros sistemas se aplica',
};

export const CRITERIOS_SISTEMA: Record<string, string | null> =
    Object.fromEntries(ALERT_SYSTEMS.map(s => [s, DESCRICAO_SISTEMA[s] ?? null]));

// 'Outros' exigiria texto livre, então nunca vira sugestão.
export const SISTEMA_SEM_SUGESTAO = new Set(['Outros']);

const PERGUNTA: PerguntaChoice = {
    type: 'choice',
    instructions: 'Em uma UTI pediátrica, `item` é o nome ou a descrição de um registro do tipo informado em `tipo`. A qual sistema clínico esse registro pertence?',
    criteria: CRITERIOS_SISTEMA,
};

// `tipo` diz o que o item é, em palavras: "exame laboratorial", "medicação", "parecer de especialista"...
export const sugerirSistema = async (tipo: string, item: string): Promise<Sugestao | undefined> => {
    const respostas = await perguntarTypeSafe({ tipo, item }, { sistema: PERGUNTA });
    return paraSugestao(respostas?.sistema, CRITERIOS_SISTEMA, SISTEMA_SEM_SUGESTAO);
};
