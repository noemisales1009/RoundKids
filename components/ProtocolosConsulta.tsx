import React, { lazy, Suspense, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Question, Category } from '../types';
import {
    Protocolo,
    Trecho,
    acharProtocolosRelevantes,
    acharProtocolosDaDuvida,
    acharTrechosDaDuvida,
} from '../lib/typesafe/protocolosRelevantes';
import { FileTextIcon, ChevronRightIcon } from './icons';

// O leitor traz a biblioteca de PDF; só é baixado quando alguém abre um protocolo.
const LeitorProtocolo = lazy(() => import('./LeitorProtocolo').then(m => ({ default: m.LeitorProtocolo })));

interface Props {
    // Pergunta do round em que a consulta foi aberta. Sem ela (tela Protocolos do menu),
    // não há sugestão por pergunta: ficam a busca por dúvida e a lista completa.
    question?: Question;
    category?: Category;
}

const MIN_DUVIDA = 5; // caracteres

// A sugestão depende só da pergunta e da lista de protocolos, então vale para a sessão
// inteira: reabrir a mesma pergunta não chama a IA de novo.
const sugestoesPorPergunta = new Map<string, Promise<string[]>>();

// Até este total de trechos cadastrados, a busca julga todos direto (uma rodada só de
// chamadas, mais rápida). Acima disso, filtra antes por protocolo (duas rodadas).
const MAX_TRECHOS_DIRETO = 60;

// Os trechos são poucos e mudam raramente: carregados uma vez por sessão, ao abrir a
// consulta, para a busca não esperar o banco. Falha não fica guardada.
let trechosDaSessao: Promise<Trecho[] | null> | null = null;
const carregarTrechos = (): Promise<Trecho[] | null> => {
    if (!trechosDaSessao) {
        trechosDaSessao = (async () => {
            const { data, error } = await supabase
                .from('protocolo_trechos')
                .select('id, protocolo_id, ordem, pagina, titulo, texto')
                .order('ordem', { ascending: true });
            if (error) {
                trechosDaSessao = null;
                return null;
            }
            return (data ?? []) as Trecho[];
        })();
    }
    return trechosDaSessao;
};

// Dúvidas já respondidas nesta sessão: repetir a mesma busca não chama a IA de novo.
const buscasFeitas = new Map<string, Trecho[]>();

// trechos = o que foi achado (lista vazia = nada achado); 'indisponivel' = a busca falhou.
type Resultado = { duvida: string; trechos: Trecho[] } | 'indisponivel';

// Consulta dos protocolos institucionais. A pessoa pode digitar uma dúvida e ver os trechos
// do protocolo que a respondem. A IA só escolhe o que mostrar: o texto exibido é o do
// protocolo, e a lista completa fica sempre disponível.
export const ProtocolosConsulta: React.FC<Props> = ({ question, category }) => {
    const [protocolos, setProtocolos] = useState<Protocolo[] | null>(null);
    const [sugeridos, setSugeridos] = useState<string[] | null>(null);
    const [duvida, setDuvida] = useState('');
    const [buscando, setBuscando] = useState(false);
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [lendo, setLendo] = useState<{ protocolo: Protocolo; pagina?: number } | null>(null);

    useEffect(() => {
        let ativo = true;
        carregarTrechos();
        (async () => {
            const { data, error } = await supabase
                .from('protocolos')
                .select('id, titulo, quando_usar, categoria_id, arquivo_path')
                .eq('ativo', true)
                .order('titulo', { ascending: true });
            if (!ativo) return;
            const lista = error ? [] : (data ?? []) as Protocolo[];
            setProtocolos(lista);
            if (!question || !category) return;

            const chave = `${question.id}:${lista.map(p => p.id).join(',')}`;
            let busca = sugestoesPorPergunta.get(chave);
            if (!busca) {
                busca = acharProtocolosRelevantes(category.name, question.text, lista);
                sugestoesPorPergunta.set(chave, busca);
            }
            const ids = await busca;
            if (ativo) setSugeridos(ids);
        })();
        return () => { ativo = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- question e category entram pelos campos usados
    }, [question?.id, question?.text, category?.name]);

    // O protocolo abre num leitor dentro do app, sem baixar o arquivo.
    const abrir = (protocolo: Protocolo, pagina?: number) => setLendo({ protocolo, pagina });

    const buscar = async (e: React.FormEvent) => {
        e.preventDefault();
        const texto = duvida.trim();
        if (texto.length < MIN_DUVIDA || !protocolos || buscando) return;
        setBuscando(true);
        try {
            const chave = texto.toLowerCase();
            const jaBuscada = buscasFeitas.get(chave);
            if (jaBuscada) return setResultado({ duvida: texto, trechos: jaBuscada });

            const carregados = await carregarTrechos();
            if (!carregados) return setResultado('indisponivel');
            let trechos = carregados.filter(t => protocolos.some(p => p.id === t.protocolo_id));

            // Com poucos trechos, a IA julga todos de uma vez, em paralelo. Com muitos,
            // primeiro escolhe em quais protocolos procurar, para não julgar tudo.
            if (trechos.length > MAX_TRECHOS_DIRETO) {
                const candidatos = await acharProtocolosDaDuvida(texto, protocolos);
                if (!candidatos) return setResultado('indisponivel');
                trechos = trechos.filter(t => candidatos.some(p => p.id === t.protocolo_id));
            }

            const titulo = (id: string) => protocolos.find(p => p.id === id)?.titulo ?? '';
            const achados = await acharTrechosDaDuvida(texto, trechos, titulo);
            if (!achados) return setResultado('indisponivel');
            buscasFeitas.set(chave, achados);
            setResultado({ duvida: texto, trechos: achados });
        } finally {
            setBuscando(false);
        }
    };

    const idsSugeridos = sugeridos ?? [];
    const listaSugeridos = idsSugeridos
        .map(id => protocolos?.find(p => p.id === id))
        .filter((p): p is Protocolo => !!p);
    // Nos demais, os do mesmo sistema da pergunta vêm primeiro.
    const demais = (protocolos ?? [])
        .filter(p => !idsSugeridos.includes(p.id))
        .sort((a, b) => Number(b.categoria_id === category?.id) - Number(a.categoria_id === category?.id));

    const item = (p: Protocolo) => (
        <li key={p.id}>
            <button
                type="button"
                onClick={() => abrir(p)}
                className="w-full text-left flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
                <FileTextIcon className="w-5 h-5 mt-0.5 shrink-0 text-primary-500 dark:text-primary-400" />
                <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 break-words">{p.titulo}</span>
                    {p.quando_usar && (
                        <span className="block text-xs text-slate-500 dark:text-slate-400 break-words">{p.quando_usar}</span>
                    )}
                </span>
                <ChevronRightIcon className="w-4 h-4 mt-1 shrink-0 text-slate-400" />
            </button>
        </li>
    );

    const trecho = (t: Trecho) => {
        const p = protocolos?.find(x => x.id === t.protocolo_id);
        return (
            <li key={t.id} className="p-3 rounded-lg border border-primary-200 dark:border-primary-700/60 bg-primary-50 dark:bg-primary-900/20">
                <p className="text-xs font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300 break-words">
                    {p?.titulo} · {t.titulo}
                </p>
                <p className="mt-2 text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line break-words">{t.texto}</p>
                {p && (
                    <button
                        type="button"
                        onClick={() => abrir(p, t.pagina)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-100"
                    >
                        <FileTextIcon className="w-3.5 h-3.5" /> Conferir no protocolo (pág. {t.pagina})
                    </button>
                )}
            </li>
        );
    };

    const subtitulo = 'text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2';
    const aviso = 'text-sm text-slate-500 dark:text-slate-400';

    return (
        <div className="space-y-5">
            {protocolos === null ? (
                <p className={aviso}>Carregando…</p>
            ) : protocolos.length === 0 ? (
                <p className={aviso}>Nenhum protocolo cadastrado.</p>
            ) : (
                <>
                    <form onSubmit={buscar}>
                        <label htmlFor="duvida-protocolo" className={`block ${subtitulo}`}>Qual é a sua dúvida?</label>
                        <div className="flex gap-2">
                            <input
                                id="duvida-protocolo"
                                type="text"
                                value={duvida}
                                onChange={e => {
                            setDuvida(e.target.value);
                            if (!e.target.value.trim()) setResultado(null);
                        }}
                                placeholder="Ex.: dose de insulina na cetoacidose"
                                maxLength={200}
                                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100"
                            />
                            <button
                                type="submit"
                                disabled={buscando || duvida.trim().length < MIN_DUVIDA}
                                className="px-4 py-2 rounded-lg text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {buscando ? 'Buscando…' : 'Buscar'}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Não digite nome nem dados do paciente.</p>
                    </form>

                    {resultado === 'indisponivel' && (
                        <p className={aviso}>A busca não respondeu agora. Abra o protocolo completo na lista abaixo.</p>
                    )}
                    {resultado && resultado !== 'indisponivel' && (
                        <section>
                            <h3 className={subtitulo}>O que o protocolo diz sobre "{resultado.duvida}"</h3>
                            {resultado.trechos.length === 0 ? (
                                <p className={aviso}>Não encontrei esse assunto nos protocolos cadastrados. Abra o protocolo completo na lista abaixo.</p>
                            ) : (
                                <>
                                    <ul className="space-y-3">{resultado.trechos.map(trecho)}</ul>
                                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                                        Texto transcrito do protocolo; a IA só escolheu os trechos. Confira no protocolo antes de aplicar.
                                    </p>
                                </>
                            )}
                        </section>
                    )}

                    {question && category && (
                        <section>
                            <h3 className={subtitulo}>Sugeridos pela IA para esta pergunta do round</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{category.name} · {question.text}</p>
                            {sugeridos === null ? (
                                <p className={aviso}>Procurando…</p>
                            ) : listaSugeridos.length === 0 ? (
                                <p className={aviso}>Nenhuma sugestão para esta pergunta.</p>
                            ) : (
                                <ul className="space-y-2">{listaSugeridos.map(item)}</ul>
                            )}
                        </section>
                    )}

                    {demais.length > 0 && (
                        <section>
                            <h3 className={subtitulo}>
                                {listaSugeridos.length > 0 ? 'Outros protocolos' : 'Todos os protocolos'}
                            </h3>
                            <ul className="space-y-2">{demais.map(item)}</ul>
                        </section>
                    )}
                </>
            )}
            {lendo && (
                <Suspense fallback={null}>
                    <LeitorProtocolo
                        protocolo={lendo.protocolo}
                        paginaInicial={lendo.pagina}
                        onClose={() => setLendo(null)}
                    />
                </Suspense>
            )}
        </div>
    );
};
