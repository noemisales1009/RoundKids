import { useCallback } from 'react';
import { Sugestao } from '../lib/typesafe/sugestao';
import { sugerirSistema } from '../lib/typesafe/sugestaoSistema';
import { useSugestaoDigitada } from './useSugestaoDigitada';

const MIN_CARACTERES = 3; // nomes de exame e de medicação são curtos

// Sugestão do sistema clínico de um item a partir do nome dele.
// `tipo` diz o que o item é: "exame laboratorial", "medicação", "parecer de especialista"...
export const useSugestaoSistema = (tipo: string, item: string): Sugestao | undefined => {
    const buscar = useCallback((texto: string) => sugerirSistema(tipo, texto), [tipo]);
    return useSugestaoDigitada(item, buscar, MIN_CARACTERES) ?? undefined;
};
