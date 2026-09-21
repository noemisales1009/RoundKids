import { Exam } from '../types';

const H24 = 24 * 60 * 60 * 1000;
const SP_OFFSET = 3 * 60 * 60 * 1000;

// true sem mostrar_evolucao_em = fixo (permanente); true com mostrar_evolucao_em = marcado manualmente, vale 24h;
// NULL = automático (data do exame nas últimas 24h, horário de Brasília); false = excluído.
export const isExameNaEvolucao = (e: Pick<Exam, 'mostrar_evolucao' | 'mostrar_evolucao_em' | 'date'>, now: number = Date.now()): boolean => {
    if (e.mostrar_evolucao === false) return false;
    if (e.mostrar_evolucao === true) {
        if (!e.mostrar_evolucao_em) return true;
        if (now - new Date(e.mostrar_evolucao_em).getTime() < H24) return true;
    }
    const cutoff = new Date(now - SP_OFFSET - H24).toISOString().split('T')[0];
    return e.date >= cutoff;
};

export const isExameFixo = (e: Pick<Exam, 'mostrar_evolucao' | 'mostrar_evolucao_em'>): boolean =>
    e.mostrar_evolucao === true && !e.mostrar_evolucao_em;
