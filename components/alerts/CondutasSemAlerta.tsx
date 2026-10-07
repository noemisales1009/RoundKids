import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { alertasService, isAlertaAtivo } from '../../services/alertasService';
import { acharCondutasSemAlerta, acharAchadosSemAlerta } from '../../lib/typesafe/condutasSemAlerta';
import { useSugestaoDigitada } from '../../hooks/useSugestaoDigitada';
import { CreateAlertModal } from '../modals/alerts/CreateAlertModal';

interface Props {
    patientId: number | string;
    // Texto livre a examinar: avaliação clínica do turno, condutas críticas, parecer
    texto: string;
    // Como chamar o que foi achado, no singular e no plural. Padrão: conduta(s).
    rotulo?: { uma: string; varias: string };
    // Quando o texto é o resultado de um exame de imagem: nome do exame. A busca passa a ser
    // por achados que pedem conduta, e o alerta já abre com o nome do exame na descrição.
    exame?: string;
}

const MIN_CARACTERES = 20;
const MIN_CARACTERES_ACHADO = 6; // resultado de exame costuma ser curto ("TOT ALTO")
const ROTULO_PADRAO = { uma: 'esta conduta parece', varias: 'estas condutas parecem' };

// Lê um texto livre e aponta as frases que pedem uma ação da equipe e ainda não têm
// alerta ativo. É só um aviso: cada frase pode virar alerta (o formulário abre com ela
// na descrição, para a pessoa conferir e completar) ou ser dispensada.
// Sem resposta do serviço de sugestão, não mostra nada.
export const CondutasSemAlerta: React.FC<Props> = ({ patientId, texto, rotulo = ROTULO_PADRAO, exame }) => {
    const [resolvidas, setResolvidas] = useState<string[]>([]);
    const [criando, setCriando] = useState<string | null>(null);

    const buscar = useCallback(async (t: string) => {
        const alertas = await alertasService.getAlertas(patientId);
        const ativos = alertas.filter(isAlertaAtivo).map(a => a.alertaclinico).filter(Boolean);
        return exame ? acharAchadosSemAlerta(t, ativos, exame) : acharCondutasSemAlerta(t, ativos);
    }, [patientId, exame]);

    const achadas = useSugestaoDigitada(texto, buscar, exame ? MIN_CARACTERES_ACHADO : MIN_CARACTERES) ?? [];
    const pendentes = achadas.filter(f => !resolvidas.includes(f));
    const resolver = (frase: string) => setResolvidas(prev => [...prev, frase]);

    if (pendentes.length === 0 && !criando) return null;

    return (
        <>
            {pendentes.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        Sugestão da IA: {pendentes.length === 1 ? rotulo.uma : rotulo.varias} não ter alerta criado
                    </p>
                    <ul className="mt-2 space-y-2">
                        {pendentes.map(frase => (
                            <li key={frase} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="flex-1 text-sm text-slate-800 dark:text-slate-100">{frase}</span>
                                <span className="flex gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setCriando(frase)}
                                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition"
                                    >
                                        Criar alerta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => resolver(frase)}
                                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition"
                                    >
                                        Dispensar
                                    </button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {/* Fora do formulário que estiver em volta (portal), e sem deixar o "salvar" do alerta
                subir para ele: senão criar o alerta salvaria também o cadastro aberto atrás. */}
            {criando && createPortal(
                <div onSubmit={e => e.stopPropagation()}>
                    <CreateAlertModal
                        patientId={patientId}
                        descricaoInicial={exame ? `${exame}: ${criando}` : criando}
                        onCriado={() => resolver(criando)}
                        onClose={() => setCriando(null)}
                    />
                </div>,
                document.body,
            )}
        </>
    );
};
