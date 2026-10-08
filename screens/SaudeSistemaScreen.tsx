import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useHeader } from '../hooks';
import { explicarErro } from '../lib/explicarErro';

// Saúde do sistema, para o administrador: os erros que a equipe teve no uso do aplicativo
// (tabela app_erros) e quanto cada tabela e cada pasta de arquivos ocupa (função
// tamanhos_do_sistema). Ver CREATE_SAUDE_DO_SISTEMA.sql. Consumo do plano, tráfego e
// custo da IA não aparecem aqui: ficam nos painéis do Supabase e do OpenRouter.

interface Erro {
    criado_em: string;
    criado_por: string | null;
    origem: string;
    tela: string;
    mensagem: string;
}

interface Tamanho {
    tipo: 'tabela' | 'arquivos' | 'banco';
    nome: string;
    registros: number;
    bytes: number;
}

const NOME_ORIGEM: Record<string, string> = {
    mensagem: 'Mensagem de erro',
    tela_quebrou: 'Tela quebrou',
    nao_tratado: 'Erro não tratado',
};

const PERIODOS = [
    { dias: 1, rotulo: '24 horas' },
    { dias: 7, rotulo: '7 dias' },
    { dias: 30, rotulo: '30 dias' },
];

// Quanto o plano contratado inclui. O aplicativo não consegue ler isso do Supabase, então
// os valores ficam aqui: são os do plano Pro. Se o plano mudar, ajustar estes números.
// No Pro, passar do incluído não bloqueia o sistema: gera cobrança adicional.
const GB = 1024 ** 3;
const INCLUIDO_NO_PLANO = { nome: 'Pro', banco: 8 * GB, arquivos: 100 * GB };

const MAX_ERROS = 1000;      // linhas buscadas por período
const MAX_GRUPOS = 15;
const MAX_RECENTES = 30;
const MAX_TABELAS = 15;

const dataHora = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const tamanho = (bytes: number) => {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const SaudeSistemaScreen: React.FC = () => {
    useHeader('Saúde do sistema');
    const [dias, setDias] = useState(7);
    const [erros, setErros] = useState<Erro[] | null>(null);
    const [errosIndisponiveis, setErrosIndisponiveis] = useState(false);
    const [tamanhos, setTamanhos] = useState<Tamanho[] | null>(null);
    const [tamanhosIndisponiveis, setTamanhosIndisponiveis] = useState(false);

    useEffect(() => {
        let ativo = true;
        setErros(null);
        setErrosIndisponiveis(false);
        (async () => {
            const desde = new Date(Date.now() - dias * 86400000).toISOString();
            const { data, error } = await supabase
                .from('app_erros')
                .select('criado_em, criado_por, origem, tela, mensagem')
                .gte('criado_em', desde)
                .order('criado_em', { ascending: false })
                .limit(MAX_ERROS);
            if (!ativo) return;
            if (error) return setErrosIndisponiveis(true);
            setErros((data ?? []) as Erro[]);
        })();
        return () => { ativo = false; };
    }, [dias]);

    useEffect(() => {
        let ativo = true;
        (async () => {
            const { data, error } = await supabase.rpc('tamanhos_do_sistema');
            if (!ativo) return;
            if (error) return setTamanhosIndisponiveis(true);
            setTamanhos(((data ?? []) as Tamanho[]).map(t => ({ ...t, registros: Number(t.registros), bytes: Number(t.bytes) })));
        })();
        return () => { ativo = false; };
    }, []);

    const resumo = useMemo(() => {
        const lista = erros ?? [];
        const grupos = new Map<string, { mensagem: string; origem: string; vezes: number; ultima: string; telas: Set<string>; pessoas: Set<string> }>();
        lista.forEach(e => {
            const chave = `${e.origem}|${e.mensagem}`;
            const g = grupos.get(chave) ?? { mensagem: e.mensagem, origem: e.origem, vezes: 0, ultima: e.criado_em, telas: new Set(), pessoas: new Set() };
            g.vezes++;
            g.telas.add(e.tela);
            if (e.criado_por) g.pessoas.add(e.criado_por);
            grupos.set(chave, g); // a lista vem do mais recente para o mais antigo: `ultima` já é a mais recente
        });
        return {
            total: lista.length,
            telas: new Set(lista.map(e => e.tela)).size,
            pessoas: new Set(lista.map(e => e.criado_por).filter(Boolean)).size,
            graves: lista.filter(e => e.origem !== 'mensagem').length,
            grupos: [...grupos.values()].sort((a, b) => b.vezes - a.vezes).slice(0, MAX_GRUPOS),
            recentes: lista.slice(0, MAX_RECENTES),
        };
    }, [erros]);

    // Erros ao longo do período: por hora nas últimas 24 horas, por dia nos demais
    const serie = useMemo(() => {
        const porHora = dias === 1;
        const passo = porHora ? 3600000 : 86400000;
        const quantos = porHora ? 24 : dias;
        const inicioDoAtual = new Date();
        if (porHora) inicioDoAtual.setMinutes(0, 0, 0); else inicioDoAtual.setHours(0, 0, 0, 0);
        const baldes = Array.from({ length: quantos }, (_, i) => {
            const inicio = new Date(inicioDoAtual.getTime() - (quantos - 1 - i) * passo);
            return {
                inicio: inicio.getTime(),
                rotulo: porHora
                    ? `${String(inicio.getHours()).padStart(2, '0')}h`
                    : inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                total: 0,
                graves: 0,
            };
        });
        (erros ?? []).forEach(e => {
            const i = Math.floor((new Date(e.criado_em).getTime() - baldes[0].inicio) / passo);
            if (i < 0 || i >= quantos) return;
            baldes[i].total++;
            if (e.origem !== 'mensagem') baldes[i].graves++;
        });
        return baldes;
    }, [erros, dias]);
    const [barraEmFoco, setBarraEmFoco] = useState<number | null>(null);
    const maiorDaSerie = Math.max(1, ...serie.map(b => b.total));

    const tabelas = (tamanhos ?? []).filter(t => t.tipo === 'tabela').sort((a, b) => b.bytes - a.bytes);
    const arquivos = (tamanhos ?? []).filter(t => t.tipo === 'arquivos').sort((a, b) => b.bytes - a.bytes);
    const soma = (lista: Tamanho[]) => lista.reduce((s, t) => s + t.bytes, 0);
    // Tamanho total do banco como o Supabase conta; sem ele (SQL antigo), usa a soma das tabelas
    const bancoTotal = (tamanhos ?? []).find(t => t.tipo === 'banco')?.bytes ?? soma(tabelas);

    const uso = (rotulo: string, usado: number, incluido: number, detalhe: string) => {
        const fracao = Math.min(1, usado / incluido);
        const cor = fracao >= 0.9 ? 'bg-red-500' : fracao >= 0.7 ? 'bg-amber-500' : 'bg-green-500';
        return (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{rotulo}</p>
                    <p className={legenda}>{usado > 0 && fracao < 0.01 ? 'menos de 1% usado' : `${Math.round(fracao * 100)}% usado`}</p>
                </div>
                <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {tamanho(Math.max(0, incluido - usado))} <span className="text-base font-semibold text-slate-500 dark:text-slate-400">livres</span>
                </p>
                <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full ${cor}`} style={{ width: `${Math.max(1, fracao * 100)}%` }} />
                </div>
                <p className={`mt-2 ${legenda}`}>{tamanho(usado)} usados de {tamanho(incluido)} incluídos. {detalhe}</p>
            </div>
        );
    };

    const cartao = 'bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-5';
    const titulo = 'text-base font-bold text-slate-800 dark:text-slate-100';
    const legenda = 'text-xs text-slate-500 dark:text-slate-400';
    const th = 'text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 px-3 py-2';
    const td = 'px-3 py-2 text-sm text-slate-700 dark:text-slate-200 align-top';
    const naoRodado = 'Dados ainda não disponíveis. É preciso rodar o CREATE_SAUDE_DO_SISTEMA.sql no Supabase.';

    const numero = (rotulo: string, valor: string, detalhe: string, cor: string) => (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <p className={legenda}>{rotulo}</p>
            <p className={`text-3xl font-bold ${cor}`}>{valor}</p>
            <p className={legenda}>{detalhe}</p>
        </div>
    );

    // Barras horizontais: uma cor só, porque a barra mostra tamanho e não categoria.
    // O nome e os números ficam em texto ao lado, para a leitura não depender da barra.
    const barrasDeTamanho = (lista: Tamanho[], unidade: string) => {
        const maior = Math.max(1, ...lista.map(t => t.bytes));
        return (
            <ul className="mt-3 space-y-1.5">
                {lista.map(t => (
                    <li key={t.nome} className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto] items-center gap-3" title={`${t.nome}: ${tamanho(t.bytes)}, ${t.registros.toLocaleString('pt-BR')} ${unidade}`}>
                        <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{t.nome}</span>
                        <span className="h-3 rounded-r bg-slate-100 dark:bg-slate-800">
                            <span className="block h-3 rounded-r bg-primary-500" style={{ width: `${Math.max(1, (100 * t.bytes) / maior)}%` }} />
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">
                            <b className="text-slate-700 dark:text-slate-200">{tamanho(t.bytes)}</b> · {t.registros.toLocaleString('pt-BR')} {unidade}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className={cartao}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className={titulo}>Erros no uso do aplicativo</h2>
                        <p className={legenda}>Cada mensagem vermelha, tela que quebrou ou erro não tratado, de qualquer usuário.</p>
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

                {errosIndisponiveis ? (
                    <p className={`mt-4 ${legenda}`}>{naoRodado}</p>
                ) : erros === null ? (
                    <p className={`mt-4 ${legenda}`}>Carregando…</p>
                ) : erros.length === 0 ? (
                    <p className="mt-4 text-sm text-green-600 dark:text-green-400">Nenhum erro registrado neste período.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {numero('Erros', String(resumo.total), erros.length === MAX_ERROS ? `os ${MAX_ERROS} mais recentes` : 'no período', 'text-slate-800 dark:text-slate-100')}
                            {numero('Graves', String(resumo.graves), 'tela quebrou ou não tratado', resumo.graves > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400')}
                            {numero('Telas', String(resumo.telas), 'com algum erro', 'text-slate-800 dark:text-slate-100')}
                            {numero('Pessoas', String(resumo.pessoas), 'tiveram algum erro', 'text-slate-800 dark:text-slate-100')}
                        </div>

                        <h3 className={`${titulo} mt-6`}>{dias === 1 ? 'Erros por hora' : 'Erros por dia'}</h3>
                        <p className={`${legenda} h-4`}>
                            {barraEmFoco === null
                                ? `Passe o mouse (ou toque) em uma barra para ver o valor. Maior valor: ${maiorDaSerie}.`
                                : `${serie[barraEmFoco].rotulo}: ${serie[barraEmFoco].total} erro(s), ${serie[barraEmFoco].graves} grave(s).`}
                        </p>
                        <div className="mt-2 flex items-end gap-[2px] h-32 border-b border-slate-300 dark:border-slate-600" onMouseLeave={() => setBarraEmFoco(null)}>
                            {serie.map((b, i) => (
                                <button
                                    key={b.inicio}
                                    type="button"
                                    onMouseEnter={() => setBarraEmFoco(i)}
                                    onFocus={() => setBarraEmFoco(i)}
                                    onClick={() => setBarraEmFoco(i)}
                                    aria-label={`${b.rotulo}: ${b.total} erros`}
                                    className="flex-1 h-full flex items-end min-w-0"
                                >
                                    <span
                                        className={`block w-full rounded-t ${barraEmFoco === i ? 'bg-primary-700 dark:bg-primary-300' : 'bg-primary-500'}`}
                                        style={{ height: b.total === 0 ? 0 : `${Math.max(3, (100 * b.total) / maiorDaSerie)}%` }}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{serie[0].rotulo}</span>
                            <span>{serie[Math.floor(serie.length / 2)].rotulo}</span>
                            <span>{serie[serie.length - 1].rotulo}</span>
                        </div>

                        <h3 className={`${titulo} mt-6`}>O que mais se repete</h3>
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className={th}>Mensagem</th>
                                        <th className={`${th} text-right`}>Vezes</th>
                                        <th className={`${th} text-right`}>Pessoas</th>
                                        <th className={th}>Onde</th>
                                        <th className={th}>Última vez</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumo.grupos.map(g => (
                                        <tr key={`${g.origem}|${g.mensagem}`} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className={`${td} break-words max-w-xs`}>
                                                {g.origem !== 'mensagem' && (
                                                    <span className="mr-1.5 text-xs font-bold text-red-600 dark:text-red-400">{NOME_ORIGEM[g.origem] ?? g.origem}:</span>
                                                )}
                                                {g.mensagem}
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{explicarErro(g.origem, g.mensagem)}</p>
                                            </td>
                                            <td className={`${td} text-right font-semibold`}>{g.vezes}</td>
                                            <td className={`${td} text-right`}>{g.pessoas.size}</td>
                                            <td className={`${td} text-xs`}>{[...g.telas].join(', ')}</td>
                                            <td className={`${td} whitespace-nowrap`}>{dataHora(g.ultima)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h3 className={`${titulo} mt-6`}>Mais recentes</h3>
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className={th}>Quando</th>
                                        <th className={th}>Tipo</th>
                                        <th className={th}>Tela</th>
                                        <th className={th}>Mensagem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumo.recentes.map((e, i) => (
                                        <tr key={`${e.criado_em}-${i}`} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className={`${td} whitespace-nowrap`}>{dataHora(e.criado_em)}</td>
                                            <td className={`${td} whitespace-nowrap`}>{NOME_ORIGEM[e.origem] ?? e.origem}</td>
                                            <td className={`${td} text-xs`}>{e.tela}</td>
                                            <td className={`${td} break-words max-w-sm`}>
                                                {e.mensagem}
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{explicarErro(e.origem, e.mensagem)}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            <div className={cartao}>
                <h2 className={titulo}>Espaço usado e livre</h2>
                {tamanhosIndisponiveis ? (
                    <p className={`mt-2 ${legenda}`}>{naoRodado}</p>
                ) : tamanhos === null ? (
                    <p className={`mt-2 ${legenda}`}>Carregando…</p>
                ) : (
                    <>
                        <p className={legenda}>
                            Comparado ao que o plano {INCLUIDO_NO_PLANO.nome} inclui. Passar do incluído não bloqueia o sistema: gera cobrança adicional.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            {uso('Banco de dados', bancoTotal, INCLUIDO_NO_PLANO.banco, `${tabelas.length} tabelas no banco, de todos os aplicativos.`)}
                            {uso('Arquivos', soma(arquivos), INCLUIDO_NO_PLANO.arquivos, `${arquivos.length} pastas (fotos, protocolos, imagens).`)}
                        </div>

                        <h3 className={`${titulo} mt-6`}>Maiores tabelas</h3>
                        <p className={legenda}>As {MAX_TABELAS} que mais ocupam. O número de registros é a estimativa do banco, não a contagem exata.</p>
                        {barrasDeTamanho(tabelas.slice(0, MAX_TABELAS), 'registros')}

                        <h3 className={`${titulo} mt-6`}>Arquivos por pasta</h3>
                        {arquivos.length === 0
                            ? <p className={`mt-2 ${legenda}`}>Nenhum arquivo guardado.</p>
                            : barrasDeTamanho(arquivos, 'arquivos')}
                    </>
                )}
            </div>

            <p className={`${legenda} px-1`}>
                Esta tela mostra o que o aplicativo consegue ver. O consumo do plano, o tráfego e os erros internos do banco ficam no
                painel do Supabase (Reports, Logs, Advisors e Usage); o custo da IA, no painel do OpenRouter.
            </p>
        </div>
    );
};
