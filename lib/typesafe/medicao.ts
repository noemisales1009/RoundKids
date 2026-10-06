import { supabase } from '../../supabaseClient';
import { Sugestao } from './sugestao';

// Medição das sugestões: grava o que a IA sugeriu e o que a pessoa salvou, para depois
// calcular a taxa de acerto por campo (tabela ia_sugestoes_log, ver
// CREATE_IA_SUGESTOES_LOG.sql). Não grava paciente nem texto clínico.
//
// Funciona em dois tempos: enquanto o formulário está aberto, cada campo com sugestão
// anota aqui a sugestão e o valor atual; quando o formulário salva com sucesso, chama
// confirmarMedicao(), que grava o que estiver anotado.

const pendentes = new Map<string, { sugestao: Sugestao; valor: string }>();

// Sem a tabela (ou sem permissão), para de tentar até recarregar a página.
let indisponivel = false;

export const anotarSugestao = (campo: string, sugestao: Sugestao | undefined, valor: string) => {
    if (sugestao) pendentes.set(campo, { sugestao, valor });
    else pendentes.delete(campo);
};

export const esquecerSugestao = (campo: string) => {
    pendentes.delete(campo);
};

// Chamar logo depois de o registro ser salvo. Não espera a gravação e nunca lança erro:
// a medição não pode atrasar nem travar o cadastro.
export const confirmarMedicao = () => {
    if (pendentes.size === 0) return;
    const linhas = [...pendentes].map(([campo, { sugestao, valor }]) => ({
        campo,
        sugestao: sugestao.valor,
        confianca: sugestao.confianca,
        valor_final: valor || null,
    }));
    pendentes.clear();
    if (indisponivel) return;

    supabase.from('ia_sugestoes_log').insert(linhas).then(
        ({ error }) => {
            if (error) {
                indisponivel = true;
                console.warn('[medição IA] não foi possível gravar:', error.message);
            }
        },
        () => { indisponivel = true; },
    );
};
