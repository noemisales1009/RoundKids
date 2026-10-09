import { supabase } from '../supabaseClient';

// Registro dos erros que acontecem no uso do aplicativo (tabela app_erros, ver
// CREATE_SAUDE_DO_SISTEMA.sql), para a tela Saúde do sistema mostrar o que está falhando.
// Três origens: mensagem vermelha mostrada ao usuário, tela que quebrou e erro não tratado.
// Nunca lança nem espera: registrar um erro não pode causar outro nem atrasar a tela.

export type OrigemDoErro = 'mensagem' | 'tela_quebrou' | 'nao_tratado';

const MAX_MENSAGEM = 500;   // caracteres
const MAX_POR_SESSAO = 40;  // trava contra erro em laço
const JANELA_REPETIDO_MS = 10000;

let gravados = 0;
// Sem a tabela (ou sem permissão), para de tentar até recarregar a página.
let indisponivel = false;
const ultimos = new Map<string, number>();

// Tela em que o erro aconteceu, sem o identificador da rota: "/patient/123/history" vira
// "/patient/:id/history". Vale para número e para código longo (uuid). Assim o registro
// não carrega o identificador do paciente.
const telaAtual = (): string =>
    (window.location.hash.replace(/^#/, '').split('?')[0] || '/')
        .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27}(?=\/|$)/gi, '/:id')
        .replace(/\/\d+(?=\/|$)/g, '/:id');

export const registrarErro = (origem: OrigemDoErro, mensagem: string) => {
    if (indisponivel || gravados >= MAX_POR_SESSAO) return;
    const texto = (mensagem || 'sem mensagem').slice(0, MAX_MENSAGEM);
    const tela = telaAtual();

    // O mesmo erro repetido em poucos segundos conta uma vez
    const chave = `${origem}|${tela}|${texto}`;
    const agora = Date.now();
    if (agora - (ultimos.get(chave) ?? 0) < JANELA_REPETIDO_MS) return;
    ultimos.set(chave, agora);
    gravados++;

    supabase.from('app_erros').insert({ origem, tela, mensagem: texto }).then(
        ({ error }) => { if (error) indisponivel = true; },
        () => { indisponivel = true; },
    );
};

// Erros que escapam de qualquer tratamento. Chamar uma vez, na entrada do aplicativo.
export const instalarCapturaDeErros = () => {
    window.addEventListener('error', e => {
        // Aviso inofensivo do navegador sobre redimensionamento; não é falha do aplicativo
        if (e.message?.includes('ResizeObserver loop')) return;
        registrarErro('nao_tratado', e.message);
    });
    window.addEventListener('unhandledrejection', e => {
        const motivo = e.reason;
        registrarErro('nao_tratado', motivo instanceof Error ? motivo.message : String(motivo));
    });
};
