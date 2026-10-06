import { useCallback } from 'react';
import { Sugestao } from '../lib/typesafe/sugestao';
import { sugerirMotivoAlerta } from '../lib/typesafe/sugestaoMotivo';
import { useSugestaoDigitada } from './useSugestaoDigitada';

// Sugestão do motivo padronizado a partir da descrição da justificativa.
// `alerta` é o texto do alerta que está sendo justificado, usado como contexto.
export const useSugestaoMotivo = (alerta: string, descricao: string): Sugestao | undefined => {
    const buscar = useCallback((texto: string) => sugerirMotivoAlerta(alerta, texto), [alerta]);
    return useSugestaoDigitada(descricao, buscar) ?? undefined;
};
