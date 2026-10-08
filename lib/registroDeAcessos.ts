import { supabase } from '../supabaseClient';

// Histórico de acessos ao Round Braga (tabela acessos_log, ver CREATE_ACESSOS_LOG.sql):
// quem entrou, quando e como. Só registra este aplicativo; o SBAR Kids não entra aqui.
// Nunca lança nem espera: registrar o acesso não pode atrasar a entrada no sistema.

// login        = digitou e-mail e senha na tela de entrada
// vindo_do_sbar = chegou pelo botão "Voltar ao Round" do SBAR Kids, com a mesma sessão
// sessao_salva = abriu o aplicativo já logado (não precisou digitar a senha)
export type TipoDeAcesso = 'login' | 'vindo_do_sbar' | 'sessao_salva';

// A tela de entrada avisa aqui, antes de logar, de que jeito a pessoa está entrando.
let tipoPendente: TipoDeAcesso | null = null;
export const anunciarEntrada = (tipo: TipoDeAcesso) => { tipoPendente = tipo; };

// Sem a tabela (ou sem permissão), para de tentar até recarregar a página.
let indisponivel = false;

const CHAVE = 'round_acesso_registrado'; // por aba do navegador

const dispositivo = (): string => {
    const ua = navigator.userAgent;
    const aparelho = /Android|iPhone|iPad|Mobile/i.test(ua) ? 'Celular ou tablet' : 'Computador';
    const navegador = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'outro navegador';
    return `${aparelho} · ${navegador}`;
};

// Chamar quando o usuário foi carregado com sucesso. Grava uma vez por entrada: a entrada
// anunciada pela tela de login sempre conta; a sessão já salva conta uma vez por aba, para
// atualizar a página não virar vários acessos.
export const registrarAcesso = (usuarioId: string) => {
    const tipo = tipoPendente ?? 'sessao_salva';
    tipoPendente = null;
    let jaContou = false;
    try { jaContou = sessionStorage.getItem(CHAVE) === usuarioId; } catch { /* navegador sem sessionStorage */ }
    if (indisponivel || (tipo === 'sessao_salva' && jaContou)) return;
    try { sessionStorage.setItem(CHAVE, usuarioId); } catch { /* idem */ }

    supabase.from('acessos_log').insert({ tipo, dispositivo: dispositivo() }).then(
        ({ error }) => { if (error) indisponivel = true; },
        () => { indisponivel = true; },
    );
};
