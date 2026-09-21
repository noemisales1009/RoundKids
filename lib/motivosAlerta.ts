// Motivos padronizados de não realização de conduta vinculada a alerta (padronização SBAR).
export const MOTIVOS_ALERTA: { label: string; orientacao: string }[] = [
    { label: 'Alteração clínica com contraindicação no momento', orientacao: 'Informe o achado clínico que torna a realização insegura.' },
    { label: 'Alteração clínica com adiamento', orientacao: 'A conduta continua indicada. Informe a data e o horário da reavaliação.' },
    { label: 'Perda da necessidade clínica', orientacao: 'Descreva a resolução ou a mudança do quadro que tornou a conduta desnecessária.' },
    { label: 'Conduta substituída por outra', orientacao: 'Descreva a nova conduta adotada.' },
    { label: 'Conduta já realizada', orientacao: 'Registre quando e onde foi realizada.' },
    { label: 'Exame ou procedimento não solicitado pelo médico', orientacao: 'Registre que não havia solicitação médica e o contato feito com a equipe para regularizar.' },
    { label: 'Extravio da solicitação do exame ou procedimento', orientacao: 'Informe quando o extravio foi percebido e se a solicitação foi refeita.' },
    { label: 'Falha de comunicação', orientacao: 'Descreva onde a informação se perdeu: passagem de plantão, equipe, setor ou registro.' },
    { label: 'Problema técnico ou equipamento indisponível', orientacao: 'Informe a falha técnica, a manutenção ou o equipamento ausente.' },
    { label: 'Insumo ou medicamento indisponível', orientacao: 'Informe o material ou medicamento que está faltando.' },
    { label: 'Profissional ou serviço especializado indisponível', orientacao: 'Informe o profissional, equipe ou serviço de que a execução depende.' },
    { label: 'Paciente sem condições de transporte ou deslocamento', orientacao: 'Informe o risco que impede o transporte com segurança.' },
    { label: 'Recusa do paciente ou responsável', orientacao: 'Registre as orientações prestadas, os riscos explicados e, se houver, o termo de recusa.' },
    { label: 'Aguardando autorização, regulação ou vaga', orientacao: 'Informe o que está pendente: liberação administrativa, regulação, transferência ou vaga.' },
    { label: 'Alta, transferência ou óbito', orientacao: 'Informe a situação assistencial que encerrou a recomendação na unidade.' },
    { label: 'Alerta duplicado', orientacao: 'Informe qual alerta equivalente já existe.' },
    { label: 'Alerta não aplicável ao caso clínico', orientacao: 'Explique por que a recomendação não corresponde às condições deste paciente.' },
    { label: 'Alerta gerado por dado incorreto ou desatualizado', orientacao: 'Informe o dado incorreto e corrija-o quando possível.' },
    { label: 'Outro motivo', orientacao: 'Descreva o motivo.' },
];

// O que aparece no card: "Motivo: descrição" (ou só o motivo quando não há descrição).
export const textoJustificativa = (motivo?: string | null, texto?: string | null): string => {
    const t = (texto || '').trim();
    const m = (motivo || '').trim();
    if (m && t && t !== m) return `${m}: ${t}`;
    return m || t;
};
