import { MOTIVOS_ALERTA } from '../motivosAlerta';
import { PerguntaChoice, perguntarTypeSafe } from './cliente';
import { Sugestao, paraSugestao } from './sugestao';

// Sugestão do motivo padronizado (SBAR) a partir da descrição que a pessoa escreveu ao
// justificar um alerta não realizado. O modelo só sugere: quem decide é quem justifica.

// O que cada motivo quer dizer, para o modelo distinguir os parecidos. As chaves têm de
// ser os rótulos de MOTIVOS_ALERTA; motivo sem descrição aqui vai só com o nome.
const DESCRICAO_MOTIVO: Record<string, string> = {
    'Alteração clínica com contraindicação no momento': 'O estado do paciente torna a conduta insegura agora (instabilidade, piora, achado que contraindica)',
    'Alteração clínica com adiamento': 'A conduta continua indicada, mas foi adiada por causa do estado do paciente, com reavaliação prevista',
    'Perda da necessidade clínica': 'O quadro melhorou ou mudou e a conduta deixou de ser necessária',
    'Conduta substituída por outra': 'A equipe decidiu fazer outra conduta no lugar',
    'Conduta já realizada': 'A conduta foi feita; faltou apenas o registro',
    'Exame ou procedimento não solicitado pelo médico': 'Não havia pedido ou prescrição médica para o exame ou procedimento',
    'Extravio da solicitação do exame ou procedimento': 'O pedido existia e foi perdido',
    'Falha de comunicação': 'A informação não chegou a quem devia: passagem de plantão, equipe, setor ou registro',
    'Problema técnico ou equipamento indisponível': 'Equipamento quebrado, em manutenção, em uso ou ausente; sistema fora do ar',
    'Insumo ou medicamento indisponível': 'Falta de material ou de medicamento',
    'Profissional ou serviço especializado indisponível': 'Depende de profissional, equipe ou serviço que não estava disponível',
    'Paciente sem condições de transporte ou deslocamento': 'O paciente não pode ser levado com segurança até onde a conduta é feita',
    'Recusa do paciente ou responsável': 'O paciente ou a família não aceitou a conduta',
    'Aguardando autorização, regulação ou vaga': 'Pendência administrativa: liberação, convênio, regulação, transferência ou vaga',
    'Alta, transferência ou óbito': 'O paciente saiu da unidade ou faleceu',
    'Alerta duplicado': 'Já existe outro alerta igual ou equivalente',
    'Alerta não aplicável ao caso clínico': 'A recomendação do alerta não se aplica a este paciente',
    'Alerta gerado por dado incorreto ou desatualizado': 'O alerta nasceu de um dado errado ou antigo',
    'Outro motivo': 'Nenhum dos outros motivos corresponde, ou o texto não permite saber',
};

const PERGUNTA: PerguntaChoice = {
    type: 'choice',
    instructions: 'Em uma UTI pediátrica, a conduta descrita em `alerta` não foi realizada no prazo. `justificativa` é a explicação escrita pela equipe. Qual motivo padronizado corresponde ao que a justificativa diz?',
    criteria: Object.fromEntries(MOTIVOS_ALERTA.map(m => [m.label, DESCRICAO_MOTIVO[m.label] ?? null])),
};

// 'Outro motivo' é a opção de escape: quando o modelo cai nela, não há sugestão.
const SEM_SUGESTAO = new Set(['Outro motivo']);

export const sugerirMotivoAlerta = async (alerta: string, justificativa: string): Promise<Sugestao | undefined> => {
    const respostas = await perguntarTypeSafe({ alerta, justificativa }, { motivo: PERGUNTA });
    return paraSugestao(respostas?.motivo, PERGUNTA.criteria, SEM_SUGESTAO);
};
