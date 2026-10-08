import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useHeader } from '../hooks';
import { CONFIANCA_ALTA } from '../lib/typesafe/sugestao';

// Acompanhamento das sugestões da IA: o que ela sugeriu contra o que o profissional
// salvou (tabela ia_sugestoes_log). "Acerto" aqui é o profissional ter salvo exatamente
// a opção sugerida; não é um julgamento clínico.

interface Linha {
    campo: string;
    sugestao: string;
    confianca: number;
    valor_final: string | null;
    criado_em: string;
}

const NOME_CAMPO: Record<string, string> = {
    'alerta.sistema': 'Alerta: sistema',
    'alerta.responsavel': 'Alerta: responsável',
    'alerta.prazo': 'Alerta: prazo',
    'justificativa.motivo': 'Justificativa: motivo',
    'exame.sistema': 'Exame: sistema',
    'cultura.sistema': 'Cultura: sistema',
    'medicacao.sistema': 'Medicação: sistema',
    'parecer.sistema': 'Parecer: sistema',
    'exame_imagem.sistema': 'Exame de imagem: sistema',
    'painel_viral.sistema': 'Painel viral: sistema',
    'cirurgia.sistema': 'Cirurgia: sistema',
};
const nomeDoCampo = (campo: string) => NOME_CAMPO[campo] ?? campo;

const PERIODOS = [
    { dias: 7, rotulo: '7 dias' },
    { dias: 30, rotulo: '30 dias' },
    { dias: 0, rotulo: 'Tudo' },
];

const POR_PAGINA = 1000; // limite de linhas por consulta
const MAX_PAGINAS = 20;
const MAX_DIVERGENCIAS = 40;

type Desfecho = 'aceita' | 'trocada' | 'em_branco';
const desfecho = (l: Linha): Desfecho =>
    l.valor_final === l.sugestao ? 'aceita' : l.valor_final ? 'trocada' : 'em_branco';

const pct = (parte: number, total: number) => (total === 0 ? '—' : `${Math.round((100 * parte) / total)}%`);

const dataHora = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const AcertosIAScreen: React.FC = () => {
    useHeader('Acertos da IA');
    const [dias, setDias] = useState(30);
    const [linhas, setLinhas] = useState<Linha[] | null>(null);
    const [erro, setErro] = useState(false);

    useEffect(() => {
        let ativo = true;
        setLinhas(null);
        setErro(false);
        (async () => {
            const desde = dias > 0 ? new Date(Date.now() - dias * 86400000).toISOString() : null;
            const todas: Linha[] = [];
            for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
                let consulta = supabase
                    .from('ia_sugestoes_log')
                    .select('campo, sugestao, confianca, valor_final, criado_em')
                    .order('criado_em', { ascending: false })
                    .range(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA - 1);
                if (desde) consulta = consulta.gte('criado_em', desde);
                const { data, error } = await consulta;
                if (!ativo) return;
                if (error) return setErro(true);
                todas.push(...((data ?? []) as Linha[]));
                if (!data || data.length < POR_PAGINA) break;
            }
            setLinhas(todas);
        })();
        return () => { ativo = false; };
    }, [dias]);

    const resumo = useMemo(() => {
        const lista = linhas ?? [];
        const conta = (ls: Linha[]) => ({
            total: ls.length,
            aceitas: ls.filter(l => desfecho(l) === 'aceita').length,
            trocadas: ls.filter(l => desfecho(l) === 'trocada').length,
            emBranco: ls.filter(l => desfecho(l) === 'em_branco').length,
        });
        const campos = [...new Set(lista.map(l => l.campo))].map(campo => {
            const doCampo = lista.filter(l => l.campo === campo);
            const altas = doCampo.filter(l => l.confianca >= CONFIANCA_ALTA);
            return {
                campo,
                ...conta(doCampo),
                altas: altas.length,
                altasAceitas: altas.filter(l => desfecho(l) === 'aceita').length,
            };
        }).sort((a, b) => b.total - a.total);
        return {
            geral: conta(lista),
            campos,
            divergencias: lista.filter(l => desfecho(l) === 'trocada').slice(0, MAX_DIVERGENCIAS),
        };
    }, [linhas]);

    const cartao = 'bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-5';
    const titulo = 'text-base font-bold text-slate-800 dark:text-slate-100';
    const legenda = 'text-xs text-slate-500 dark:text-slate-400';
    const th = 'text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 px-3 py-2';
    const td = 'px-3 py-2 text-sm text-slate-700 dark:text-slate-200';

    const numero = (rotulo: string, valor: string, detalhe: string, cor: string) => (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <p className={legenda}>{rotulo}</p>
            <p className={`text-3xl font-bold ${cor}`}>{valor}</p>
            <p className={legenda}>{detalhe}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className={cartao}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className={titulo}>O que a IA sugeriu e o que foi salvo</h2>
                        <p className={legenda}>Conta as sugestões que estavam na tela quando o cadastro foi salvo.</p>
                    </div>
                    <div className="flex gap-1.5">
                        {PERIODOS.map(p => (
                            <button
                                key={p.dias}
                                type="button"
                                onClick={() => setDias(p.dias)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                                    dias === p.dias
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {p.rotulo}
                            </button>
                        ))}
                    </div>
                </div>

                {erro ? (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400">Não foi possível carregar a medição.</p>
                ) : linhas === null ? (
                    <p className={`mt-4 ${legenda}`}>Carregando…</p>
                ) : linhas.length === 0 ? (
                    <p className={`mt-4 ${legenda}`}>Nenhuma sugestão registrada neste período.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        {numero('Sugestões', String(resumo.geral.total), 'no período', 'text-slate-800 dark:text-slate-100')}
                        {numero('Aceitas', pct(resumo.geral.aceitas, resumo.geral.total), `${resumo.geral.aceitas} salvas como sugerido`, 'text-green-600 dark:text-green-400')}
                        {numero('Trocadas', pct(resumo.geral.trocadas, resumo.geral.total), `${resumo.geral.trocadas} salvas com outra opção`, 'text-amber-600 dark:text-amber-400')}
                        {numero('Em branco', pct(resumo.geral.emBranco, resumo.geral.total), `${resumo.geral.emBranco} sem valor no campo`, 'text-slate-500 dark:text-slate-400')}
                    </div>
                )}
            </div>

            {linhas && linhas.length > 0 && (
                <>
                    <div className={cartao}>
                        <h2 className={titulo}>Por campo</h2>
                        <p className={legenda}>
                            “Confiança alta” são as sugestões em que a IA tinha {Math.round(CONFIANCA_ALTA * 100)}% ou mais de segurança.
                        </p>
                        <div className="overflow-x-auto mt-3">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className={th}>Campo</th>
                                        <th className={`${th} text-right`}>Sugestões</th>
                                        <th className={`${th} text-right`}>Aceitas</th>
                                        <th className={`${th} text-right`}>Trocadas</th>
                                        <th className={`${th} text-right`}>Em branco</th>
                                        <th className={`${th} text-right`}>Aceitas com confiança alta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumo.campos.map(c => (
                                        <tr key={c.campo} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className={`${td} font-semibold`}>{nomeDoCampo(c.campo)}</td>
                                            <td className={`${td} text-right`}>{c.total}</td>
                                            <td className={`${td} text-right font-semibold text-green-600 dark:text-green-400`}>{pct(c.aceitas, c.total)}</td>
                                            <td className={`${td} text-right`}>{pct(c.trocadas, c.total)}</td>
                                            <td className={`${td} text-right`}>{pct(c.emBranco, c.total)}</td>
                                            <td className={`${td} text-right`}>
                                                {c.altas === 0 ? '—' : `${pct(c.altasAceitas, c.altas)} (${c.altasAceitas} de ${c.altas})`}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={cartao}>
                        <h2 className={titulo}>Onde o profissional escolheu diferente</h2>
                        <p className={legenda}>As {MAX_DIVERGENCIAS} trocas mais recentes. Servem para a revisão clínica: nem toda troca é erro da IA.</p>
                        {resumo.divergencias.length === 0 ? (
                            <p className={`mt-3 ${legenda}`}>Nenhuma troca neste período.</p>
                        ) : (
                            <div className="overflow-x-auto mt-3">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className={th}>Quando</th>
                                            <th className={th}>Campo</th>
                                            <th className={th}>A IA sugeriu</th>
                                            <th className={th}>Foi salvo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resumo.divergencias.map((l, i) => (
                                            <tr key={`${l.criado_em}-${l.campo}-${i}`} className="border-b border-slate-100 dark:border-slate-800">
                                                <td className={`${td} whitespace-nowrap`}>{dataHora(l.criado_em)}</td>
                                                <td className={td}>{nomeDoCampo(l.campo)}</td>
                                                <td className={td}>
                                                    {l.sugestao} <span className={legenda}>({Math.round(l.confianca * 100)}%)</span>
                                                </td>
                                                <td className={`${td} font-semibold`}>{l.valor_final}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <p className={`${legenda} px-1`}>
                        Entram aqui só as sugestões de campo (sistema, responsável, prazo e motivo). Os avisos de conduta ou achado sem
                        alerta e a busca nos protocolos ainda não são medidos. Não há nome de paciente nem texto clínico nesta medição.
                    </p>
                </>
            )}
        </div>
    );
};
