import React, { useEffect, useRef } from 'react';
import { PREENCHER_AUTOMATICO, Sugestao } from '../../lib/typesafe/sugestao';
import { anotarSugestao, esquecerSugestao } from '../../lib/typesafe/medicao';

interface Props {
    sugestao?: Sugestao;
    valor: string;
    onAceitar: (valor: string) => void;
    // Permite pré-preencher o campo quando a confiança é alta. Sem isso, a sugestão
    // aparece sempre como botão e só entra no campo com um clique. Só vale enquanto a
    // chave geral PREENCHER_AUTOMATICO estiver ligada.
    preencher?: boolean;
    // Nome do campo na medição (ex.: "alerta.sistema"). Com ele, a sugestão e o valor
    // escolhido ficam anotados para serem gravados quando o formulário salvar.
    campo?: string;
    disabled?: boolean;
}

// Sugestão da IA para um campo. Nunca passa por cima do que a pessoa escolheu:
// só pré-preenche campo vazio (ou que ela mesma tinha pré-preenchido), e retira o que
// pré-preencheu se a sugestão deixar de valer.
export const SugestaoCampo: React.FC<Props> = ({ sugestao, valor, onAceitar, preencher = false, campo, disabled }) => {
    const preenchido = useRef('');

    useEffect(() => {
        const alta = PREENCHER_AUTOMATICO && preencher && sugestao?.nivel === 'alta' ? sugestao.valor : '';
        const campoLivre = valor === '' || valor === preenchido.current;

        if (alta && alta !== preenchido.current && campoLivre) {
            preenchido.current = alta;
            onAceitar(alta);
        } else if (!alta && preenchido.current && valor === preenchido.current) {
            preenchido.current = '';
            onAceitar('');
        }
    }, [sugestao, valor, preencher, onAceitar]);

    useEffect(() => {
        if (campo) anotarSugestao(campo, sugestao, valor);
    }, [campo, sugestao, valor]);

    useEffect(() => {
        if (!campo) return;
        return () => esquecerSugestao(campo);
    }, [campo]);

    if (!sugestao) return null;

    if (valor === sugestao.valor) {
        return (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Sugestão da IA. Confira antes de salvar.
            </p>
        );
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onAceitar(sugestao.valor)}
            className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-60 transition"
        >
            Sugestão da IA: <span className="font-semibold">{sugestao.valor}</span>
        </button>
    );
};
