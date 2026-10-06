// Ponte autenticada para o Jev, modelo de decisão estruturada do TypeSafe, via OpenRouter.
// A chave fica só aqui, como secret OPENROUTER_API_KEY; o navegador nunca a vê.
// Só usuário logado passa: a chave anon sozinha é recusada.

declare const Deno: {
    env: { get(nome: string): string | undefined };
    serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const DECISOES_URL = 'https://openrouter.ai/api/alpha/decisions';
const MODELO = '~typesafe/jev-latest';
const MAX_PERGUNTAS = 10;
const MAX_TAMANHO = 12000; // caracteres do corpo; o uso previsto é texto curto
const TEMPO_LIMITE_MS = 8000;

const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (corpo: unknown, status = 200) =>
    new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const usuarioLogado = async (authorization: string): Promise<boolean> => {
    const url = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !anon || !authorization) return false;
    const r = await fetch(`${url}/auth/v1/user`, { headers: { Authorization: authorization, apikey: anon } });
    return r.ok;
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
    if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405);

    if (!(await usuarioLogado(req.headers.get('Authorization') ?? ''))) {
        return json({ error: 'Não autenticado' }, 401);
    }

    const chave = Deno.env.get('OPENROUTER_API_KEY');
    if (!chave) return json({ error: 'OPENROUTER_API_KEY não configurada' }, 503);

    const texto = await req.text();
    if (texto.length > MAX_TAMANHO) return json({ error: 'Requisição grande demais' }, 413);

    let corpo: { state?: unknown; questions?: unknown };
    try {
        corpo = JSON.parse(texto);
    } catch {
        return json({ error: 'JSON inválido' }, 400);
    }

    const { state, questions } = corpo;
    const nPerguntas = questions && typeof questions === 'object' && !Array.isArray(questions)
        ? Object.keys(questions).length
        : 0;
    if (state === undefined || nPerguntas < 1 || nPerguntas > MAX_PERGUNTAS) {
        return json({ error: 'Envie state e de 1 a 10 perguntas' }, 400);
    }

    try {
        const r = await fetch(DECISOES_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: MODELO, state, questions }),
            signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
        });
        const resposta = await r.text();
        if (!r.ok) {
            console.error('[typesafe] erro do serviço:', r.status, resposta.slice(0, 500));
            return json({ error: 'Falha no serviço de sugestão' }, 502);
        }
        return new Response(resposta, { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('[typesafe] sem resposta:', err);
        return json({ error: 'Serviço de sugestão indisponível' }, 504);
    }
});
