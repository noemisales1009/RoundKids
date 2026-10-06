import { useEffect, useState } from 'react';

const MIN_CARACTERES = 12;
// Só consulta depois que a pessoa para de digitar. Vale para todas as sugestões.
// Menor que isso dispara consulta no meio da palavra; maior deixa a sugestão lenta.
const ESPERA_MS = 400;

// Busca uma sugestão a partir de um texto que está sendo digitado. `sugestao` fica null
// enquanto não há sugestão; `buscando` fica true da pausa na digitação até a resposta
// chegar. `buscar` precisa ser estável (useCallback), senão a consulta recomeça a cada
// render. `minCaracteres` é o tamanho a partir do qual vale a pena consultar: o padrão
// serve para frases; para nomes curtos (exame, medicação) passe um valor menor.
export const useSugestaoDigitadaComEstado = <T,>(
    texto: string,
    buscar: (texto: string) => Promise<T | null | undefined>,
    minCaracteres: number = MIN_CARACTERES,
): { sugestao: T | null; buscando: boolean } => {
    const [sugestao, setSugestao] = useState<T | null>(null);
    const [buscando, setBuscando] = useState(false);

    useEffect(() => {
        const limpo = texto.trim();
        if (limpo.length < minCaracteres) {
            setSugestao(null);
            setBuscando(false);
            return;
        }

        let cancelado = false;
        setBuscando(true);
        const timer = setTimeout(async () => {
            const resultado = await buscar(limpo);
            if (cancelado) return;
            setSugestao(resultado ?? null);
            setBuscando(false);
        }, ESPERA_MS);

        return () => {
            cancelado = true;
            clearTimeout(timer);
        };
    }, [texto, buscar, minCaracteres]);

    return { sugestao, buscando };
};

export const useSugestaoDigitada = <T,>(
    texto: string,
    buscar: (texto: string) => Promise<T | null | undefined>,
    minCaracteres: number = MIN_CARACTERES,
): T | null => useSugestaoDigitadaComEstado(texto, buscar, minCaracteres).sugestao;
