import { useCallback } from 'react';
import { CampoAlerta, SugestoesAlerta, sugerirCamposAlerta } from '../lib/typesafe/sugestaoAlerta';
import { useSugestaoDigitada } from './useSugestaoDigitada';

const SEM_SUGESTOES: SugestoesAlerta = {};

// Sugestões para os campos do alerta a partir da descrição digitada.
// Sem resposta do serviço, devolve vazio e o formulário segue como sempre foi.
export const useSugestaoAlerta = (descricao: string, campos: CampoAlerta[]): SugestoesAlerta => {
    const camposKey = campos.join(',');
    const buscar = useCallback(
        (texto: string) => sugerirCamposAlerta(texto, camposKey.split(',') as CampoAlerta[]),
        [camposKey],
    );
    return useSugestaoDigitada(descricao, buscar) ?? SEM_SUGESTOES;
};
