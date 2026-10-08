import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useHeader } from '../hooks';

// Histórico de acessos ao Round Braga, para o administrador: quem entrou, quando e como
// (tabela acessos_log, ver CREATE_ACESSOS_LOG.sql). Só este aplicativo, e só a partir do
// dia em que o registro passou a existir.

interface Acesso {
    criado_em: string;
    usuario_id: string;
    tipo: string;
    dispositivo: string | null;
}

interface Pessoa {
    name: string | null;
    role: string | null;
}

const NOME_TIPO: Record<string, string> = {
    login: 'Digitou a senha',
    vindo_do_sbar: 'Veio do SBAR Kids',
    sessao_salva: 'Já estava logado',
};

const PERIODOS = [
    { dias: 1, rotulo: 'Hoje' },
    { dias: 7, rotulo: '7 dias' },
    { dias: 30, rotulo: '30 dias' },
];

const MAX_ACESSOS = 1000; // linhas buscadas por período
const MAX_HISTORICO = 100;

const dataHora = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const AcessosScreen: React.FC = () => {
    useHeader('Acessos');
    const [dias, setDias] = useState(7);
    const [acessos, setAcessos] = useState<Acesso[] | null>(null);
    const [pessoas, setPessoas] = useState<Record<string, Pessoa>>({});
    const [indisponivel, setIndisponivel] = useState(false);
    const [busca, setBusca] = useState('');
    const [barraEmFoco, setBarraEmFoco] = useState<number | null>(null);

    useEffect(() => {
        let ativo = true;
        setAcessos(null);
        setIndisponivel(false);
        (async () => {
            // "Hoje" começa à meia-noite; os demais períodos contam dias inteiros para trás
            const inicio = new Date();
            inicio.setHours(0, 0, 0, 0);
            inicio.setDate(inicio.getDate() - (dias - 1));
            const [logRes, usersRes] = await Promise.all([
                supabase
                    .from('acessos_log')
                    .select('criado_em, usuario_id, tipo, dispositivo')
                    .gte('criado_em', inicio.toISOString())
                    .order('criado_em', { ascending: false })
                    .limit(MAX_ACESSOS),
                supabase.from('users').select('id, name, role'),
            ]);
            if (!ativo) return;
            if (logRes.error) return setIndisponivel(true);
            setPessoas(Object.fromEntries((usersRes.data ?? []).map((u: { id: string; name: string | null; role: string | null }) => [u.id, { name: u.name, role: u.role }])));
            setAcessos((logRes.data ?? []) as Acesso[]);
        })();
        return () => { ativo = false; };
    }, [dias]);

    const nome = (id: string) => pessoas[id]?.name || 'Usuário sem nome';

    const resumo = useMemo(() => {
        const lista = acessos ?? [];
        const porPessoa = new Map<string, { id: string; vezes: number; ultimo: string }>();
        lista.forEach(a => {
            const p = porPessoa.get(a.usuario_id) ?? { id: a.usuario_id, vezes: 0, ultimo: a.criado_em };
            p.vezes++;
            porPessoa.set(a.usuario_id, p); // a lista vem do mais recente: `ultimo` já é o mais recente
        });

        const meiaNoite = new Date();
        meiaNoite.setHours(0, 0, 0, 0);
        const baldes = Array.from({ length: dias }, (_, i) => {
            const dia = new Date(meiaNoite.getTime());
            dia.setDate(dia.getDate() - (dias - 1 - i));
            return { inicio: dia.getTime(), rotulo: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), total: 0, pessoas: new Set<string>() };
        });
        lista.forEach(a => {
            const t = new Date(a.criado_em).getTime();
            const balde = [...baldes].reverse().find(b => t >= b.inicio);
            if (balde) { balde.total++; balde.pessoas.add(a.usuario_id); }
        });

        return {
            total: lista.length,
            pessoas: [...porPessoa.values()].sort((a, b) => b.ultimo.localeCompare(a.ultimo)),
            comSenha: lista.filter(a => a.tipo === 'login').length,
            baldes,
        };
    }, [acessos, dias]);

    const termo = busca.trim().toLowerCase();
    const filtrados = (acessos ?? []).filter(a => !termo || nome(a.usuario_id).toLowerCase().includes(termo));
    const historico = filtrados.slice(0, MAX_HISTORICO);

    // Planilha (CSV) com todas as entradas do período, respeitando a busca por nome.
    // Ponto e vírgula e marca de UTF-8 para o Excel em português abrir direto, com acentos.
    const baixar = () => {
        // Texto que começa com =, +, - ou @ seria lido pelo Excel como fórmula
        const celula = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
        const linhas = [
            ['Data', 'Hora', 'Pessoa', 'Cargo', 'Como entrou', 'Aparelho'],
            ...filtrados.map(a => {
                const d = new Date(a.criado_em);
                return [
                    d.toLocaleDateString('pt-BR'),
                    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    nome(a.usuario_id),
                    pessoas[a.usuario_id]?.role || '',
                    NOME_TIPO[a.tipo] ?? a.tipo,
                    a.dispositivo || '',
                ];
            }),
        ];
        const csv = '\uFEFF' + linhas.map(l => l.map(celula).join(';')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `acessos-round-braga-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };
    const maior = Math.max(1, ...resumo.baldes.map(b => b.total));

    const cartao = 'bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-5';
    const titulo = 'text-base font-bold text-slate-800 dark:text-slate-100';
    const legenda = 'text-xs text-slate-500 dark:text-slate-400';
    const th = 'text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 px-3 py-2';
    const td = 'px-3 py-2 text-sm text-slate-700 dark:text-slate-200 align-top';

    const numero = (rotulo: string, valor: string, detalhe: string) => (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <p className={legenda}>{rotulo}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{valor}</p>
            <p className={legenda}>{detalhe}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className={cartao}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className={titulo}>Quem entrou no Round Braga</h2>
                        <p className={legenda}>Data e hora de cada entrada no aplicativo. Não inclui o SBAR Kids.</p>
                    </div>
                    <div className="flex gap-1.5">
                        {PERIODOS.map(p => (
                            <button
                                key={p.dias}
                                type="button"
                                onClick={() => { setDias(p.dias); setBarraEmFoco(null); }}
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

                {indisponivel ? (
                    <p className={`mt-4 ${legenda}`}>Dados ainda não disponíveis. É preciso rodar o CREATE_ACESSOS_LOG.sql no Supabase.</p>
                ) : acessos === null ? (
                    <p className={`mt-4 ${legenda}`}>Carregando…</p>
                ) : acessos.length === 0 ? (
                    <p className={`mt-4 ${legenda}`}>Nenhum acesso registrado neste período.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {numero('Pessoas', String(resumo.pessoas.length), 'entraram no período')}
                            {numero('Entradas', String(resumo.total), acessos.length === MAX_ACESSOS ? `as ${MAX_ACESSOS} mais recentes` : 'no total')}
                            {numero('Com senha', String(resumo.comSenha), 'entradas digitando a senha')}
                        </div>

                        {dias > 1 && (
                            <>
                                <h3 className={`${titulo} mt-6`}>Entradas por dia</h3>
                                <p className={`${legenda} h-4`}>
                                    {barraEmFoco === null
                                        ? `Passe o mouse (ou toque) em uma barra para ver o valor. Maior valor: ${maior}.`
                                        : `${resumo.baldes[barraEmFoco].rotulo}: ${resumo.baldes[barraEmFoco].total} entrada(s), ${resumo.baldes[barraEmFoco].pessoas.size} pessoa(s).`}
                                </p>
                                <div className="mt-2 flex items-end gap-[2px] h-28 border-b border-slate-300 dark:border-slate-600" onMouseLeave={() => setBarraEmFoco(null)}>
                                    {resumo.baldes.map((b, i) => (
                                        <button
                                            key={b.inicio}
                                            type="button"
                                            onMouseEnter={() => setBarraEmFoco(i)}
                                            onFocus={() => setBarraEmFoco(i)}
                                            onClick={() => setBarraEmFoco(i)}
                                            aria-label={`${b.rotulo}: ${b.total} entradas`}
                                            className="flex-1 h-full flex items-end min-w-0"
                                        >
                                            <span
                                                className={`block w-full rounded-t ${barraEmFoco === i ? 'bg-primary-700 dark:bg-primary-300' : 'bg-primary-500'}`}
                                                style={{ height: b.total === 0 ? 0 : `${Math.max(3, (100 * b.total) / maior)}%` }}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                    <span>{resumo.baldes[0].rotulo}</span>
                                    <span>{resumo.baldes[Math.floor(resumo.baldes.length / 2)].rotulo}</span>
                                    <span>{resumo.baldes[resumo.baldes.length - 1].rotulo}</span>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {acessos && acessos.length > 0 && (
                <>
                    <div className={cartao}>
                        <h2 className={titulo}>Por pessoa</h2>
                        <p className={legenda}>Quem entrou no período, do acesso mais recente para o mais antigo.</p>
                        <div className="overflow-x-auto mt-3">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className={th}>Pessoa</th>
                                        <th className={th}>Cargo</th>
                                        <th className={`${th} text-right`}>Entradas</th>
                                        <th className={th}>Último acesso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumo.pessoas.map(p => (
                                        <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className={`${td} font-semibold`}>{nome(p.id)}</td>
                                            <td className={td}>{pessoas[p.id]?.role || '—'}</td>
                                            <td className={`${td} text-right`}>{p.vezes}</td>
                                            <td className={`${td} whitespace-nowrap`}>{dataHora(p.ultimo)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={cartao}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className={titulo}>Histórico</h2>
                                <p className={legenda}>As {MAX_HISTORICO} entradas mais recentes do período. A planilha traz todas.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="text"
                                    value={busca}
                                    onChange={e => setBusca(e.target.value)}
                                    placeholder="Buscar por nome…"
                                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
                                />
                                <button
                                    type="button"
                                    onClick={baixar}
                                    disabled={filtrados.length === 0}
                                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Baixar planilha ({filtrados.length})
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto mt-3">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className={th}>Data e hora</th>
                                        <th className={th}>Pessoa</th>
                                        <th className={th}>Como entrou</th>
                                        <th className={th}>Aparelho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historico.map((a, i) => (
                                        <tr key={`${a.criado_em}-${a.usuario_id}-${i}`} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className={`${td} whitespace-nowrap`}>{dataHora(a.criado_em)}</td>
                                            <td className={`${td} font-semibold`}>{nome(a.usuario_id)}</td>
                                            <td className={td}>{NOME_TIPO[a.tipo] ?? a.tipo}</td>
                                            <td className={td}>{a.dispositivo || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {historico.length === 0 && <p className={`mt-3 ${legenda}`}>Ninguém com esse nome no período.</p>}
                        </div>
                    </div>

                    <p className={`${legenda} px-1`}>
                        “Já estava logado” é quando a pessoa abre o aplicativo sem precisar digitar a senha; conta uma vez por aba do
                        navegador. O registro começou no dia em que esta tela foi publicada: acessos anteriores não aparecem.
                    </p>
                </>
            )}
        </div>
    );
};
