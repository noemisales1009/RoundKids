// Tradução das mensagens técnicas de erro para linguagem simples, usada na tela
// Saúde do sistema. Cada regra reconhece um tipo de mensagem e diz o que
// aconteceu e o que fazer. A primeira regra que casar vale.

interface Regra {
    padrao: RegExp;
    explicacao: string;
}

const REGRAS: Regra[] = [
    {
        padrao: /is not defined/i,
        explicacao: 'Falha de programação: a tela tentou usar uma parte do código que não estava carregada. Costuma acontecer enquanto o aplicativo está sendo alterado, ou logo após uma publicação com a página antiga ainda aberta. Se repetir depois de atualizar a página (F5), precisa de correção no código.',
    },
    {
        padrao: /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk/i,
        explicacao: 'O aplicativo foi atualizado enquanto a pessoa estava com a página aberta, e a versão antiga não achou os arquivos novos. Resolve atualizando a página (F5).',
    },
    {
        padrao: /Failed to fetch|NetworkError|Load failed|network request failed|ERR_INTERNET|ERR_NETWORK/i,
        explicacao: 'Falha de conexão: o aparelho não conseguiu falar com o servidor (internet caiu ou oscilou). Não é defeito do aplicativo. Se acontecer com várias pessoas ao mesmo tempo, verificar a rede do hospital ou o Supabase.',
    },
    {
        padrao: /JWT expired|invalid JWT|refresh token|Auth session missing|not authenticated/i,
        explicacao: 'A sessão da pessoa venceu (ficou muito tempo aberta). Resolve saindo e entrando de novo.',
    },
    {
        padrao: /row-level security|permission denied|42501|not authorized|não tem permissão/i,
        explicacao: 'Falta de permissão: o banco recusou a ação para esse usuário. Se a pessoa deveria conseguir, falta liberar a permissão no Supabase.',
    },
    {
        padrao: /does not exist|42703|42P01|schema cache|Could not find the/i,
        explicacao: 'O aplicativo procurou uma tabela, coluna ou função que não existe no banco. Normalmente é um arquivo SQL que ainda não foi rodado no Supabase.',
    },
    {
        padrao: /duplicate key|23505|already exists|já existe/i,
        explicacao: 'Tentativa de salvar algo que já estava salvo (registro repetido). Em geral é clique duplo no botão; o primeiro registro foi gravado.',
    },
    {
        padrao: /null value in column|23502|violates not-null/i,
        explicacao: 'Um campo obrigatório foi enviado em branco e o banco recusou. Nada foi salvo; falta preencher o campo ou ajustar a tela para exigir.',
    },
    {
        padrao: /violates foreign key|23503/i,
        explicacao: 'O registro aponta para algo que não existe mais (por exemplo, um paciente ou item já removido). Nada foi salvo.',
    },
    {
        padrao: /violates check constraint|23514|invalid input syntax|22P02|out of range/i,
        explicacao: 'Um valor foi digitado em formato que o banco não aceita (número, data ou opção fora do esperado). Nada foi salvo.',
    },
    {
        padrao: /Cannot read propert|undefined is not|null is not|is not a function|is not iterable/i,
        explicacao: 'Falha de programação: a tela esperava um dado que veio vazio. Se repetir na mesma tela, precisa de correção no código.',
    },
    {
        padrao: /timeout|timed out|57014/i,
        explicacao: 'A resposta demorou demais e foi cancelada. Pode ser internet lenta ou consulta pesada no banco. Se repetir na mesma tela, vale investigar.',
    },
    {
        padrao: /quota|payload too large|\b413\b|exceeded the maximum|file size/i,
        explicacao: 'Limite atingido: arquivo grande demais ou espaço insuficiente. Conferir o tamanho do arquivo e o espaço usado no cartão Arquivos.',
    },
    {
        padrao: /\b429\b|rate limit|too many requests/i,
        explicacao: 'Muitos pedidos em pouco tempo e o servidor pediu para esperar. Costuma passar sozinho em alguns segundos.',
    },
    {
        padrao: /\b50[0234]\b|Internal Server Error|Bad Gateway|Service Unavailable/i,
        explicacao: 'O servidor respondeu com falha. Se acontecer com várias pessoas ao mesmo tempo, verificar se o Supabase está fora do ar.',
    },
];

const PADRAO: Record<string, string> = {
    mensagem: 'Aviso vermelho que apareceu para o usuário. A ação que a pessoa tentou não foi concluída.',
    tela_quebrou: 'A tela parou de funcionar e mostrou a página de erro. Se repetir, precisa de correção no código.',
    nao_tratado: 'Erro que o aplicativo não esperava. Uma vez só costuma ser passageiro; se repetir, precisa de correção no código.',
};

export const explicarErro = (origem: string, mensagem: string): string =>
    REGRAS.find(r => r.padrao.test(mensagem))?.explicacao ?? PADRAO[origem] ?? PADRAO.nao_tratado;
