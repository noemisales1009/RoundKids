import { Turno, LABEL_TURNO, turnoEDiaDe, turnoDoRegistro } from './turno';

// Avisos sobre os lançamentos de balanço hídrico que entram no BH cumulativo.
// O cumulativo é a soma de todos os balanços lançados: turno sem lançamento fica de fora
// da soma, e turno lançado duas vezes entra em dobro. Aqui só se apontam esses fatos, a
// partir do dia e do turno de cada lançamento; não há julgamento clínico nem limiar.
// Lista vazia não quer dizer "validado": quer dizer só que nada disso foi encontrado nos
// três últimos turnos fechados.

type Lancamento = { created_at: string; turno?: string | null };
type Vaga = { dia: string; turno: Turno };

const ORDEM: Turno[] = ['manha', 'tarde', 'noite'];

const diaAnterior = (dia: string): string => {
    const [a, m, d] = dia.split('-').map(Number);
    return new Date(Date.UTC(a, m - 1, d - 1)).toISOString().split('T')[0];
};

const vagaAnterior = ({ dia, turno }: Vaga): Vaga =>
    turno === 'manha' ? { dia: diaAnterior(dia), turno: 'noite' }
        : turno === 'tarde' ? { dia, turno: 'manha' }
            : { dia, turno: 'tarde' };

// Ordenável como texto: dia e posição do turno no dia
const chave = ({ dia, turno }: Vaga): string => `${dia}|${ORDEM.indexOf(turno)}`;

// Dia e turno a que o lançamento se refere. A noite fechada com atraso, depois das 7h,
// pertence à noite que acabou, e não à que ainda vai começar.
const vagaDoLancamento = (r: Lancamento): Vaga => {
    const { turno: turnoDaHora, dia } = turnoEDiaDe(r.created_at);
    const turno = turnoDoRegistro(r);
    return { dia: turno === 'noite' && turnoDaHora !== 'noite' ? diaAnterior(dia) : dia, turno };
};

const nome = ({ dia, turno }: Vaga): string => {
    const [, m, d] = dia.split('-');
    return `${LABEL_TURNO[turno].toLowerCase()} de ${d}/${m}`;
};

export const avisosBhCumulativo = (lancamentos: Lancamento[], agora: Date = new Date()): string[] => {
    if (lancamentos.length === 0) return [];

    const porVaga = new Map<string, number>();
    lancamentos.forEach(r => {
        const k = chave(vagaDoLancamento(r));
        porVaga.set(k, (porVaga.get(k) ?? 0) + 1);
    });
    const maisAntiga = [...porVaga.keys()].sort()[0];

    const atual = turnoEDiaDe(agora.toISOString());
    const fechadas: Vaga[] = [];
    let v: Vaga = atual;
    for (let i = 0; i < 3; i++) {
        v = vagaAnterior(v);
        fechadas.unshift(v);
    }

    // Turno fechado sem lançamento. Só conta depois do primeiro lançamento do paciente,
    // para não cobrar turnos de antes da internação.
    const faltando = fechadas.filter(f => chave(f) > maisAntiga && !porVaga.has(chave(f)));
    const repetidas = [...fechadas, atual].filter(f => (porVaga.get(chave(f)) ?? 0) > 1);

    const avisos: string[] = [];
    if (faltando.length > 0) {
        avisos.push(`Sem balanço lançado: ${faltando.map(nome).join(', ')}. Esse período não entra na soma.`);
    }
    repetidas.forEach(f => {
        const n = nome(f);
        avisos.push(`${n[0].toUpperCase()}${n.slice(1)} tem ${porVaga.get(chave(f))} lançamentos; todos entram na soma.`);
    });
    return avisos;
};
