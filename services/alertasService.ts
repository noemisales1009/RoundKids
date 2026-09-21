import { supabase } from '../supabaseClient';
import { ShiftType, shiftFilterService } from './shiftFilterService';
import { Turno, turnoEDiaDe } from '../lib/turno';

export type AlertaSource = 'tasks' | 'alertas';

export interface Alerta {
    id: string;
    alertaclinico: string;
    status: string;
    live_status?: string | null;
    priority?: string | null;
    created_at: string;
    updated_at?: string | null;
    concluded_at?: string | null;
    concluded_by_name?: string | null;
    archived_at?: string | null;
    source: AlertaSource;
    justificativa?: string | null;      // alertas_paciente
    justification?: string | null;      // tasks
    justificativa_at?: string | null;   // alertas_paciente
    justification_at?: string | null;   // tasks
    shift_criacao?: ShiftType | string | null;
    created_by_name?: string | null;
    sistemas?: string[] | null;
    responsavel?: string | null;
    responsible?: string | null;
    mostrar_evolucao?: boolean;
    justificativa_motivo?: string | null;
    continuo?: boolean;
}

// Minúsculas e sem acento, para comparar status sem depender de como foi gravado ("Concluído", "concluido"...).
export const semAcento = (v?: string | null) =>
    (v || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

// Alerta em aberto: não concluído, resolvido nem arquivado.
export const isAlertaAtivo = (a: Alerta): boolean => {
    const s = semAcento(a.status);
    const ls = semAcento(a.live_status);
    return !a.concluded_at && s !== 'concluido' && s !== 'resolvido' &&
        !ls.includes('resolvido') && !ls.includes('concluido') && !ls.includes('arquivado');
};

// Turno em que o alerta foi criado, calculado pela hora de criação no horário de Brasília
// (7h-13h manhã, 13h-19h tarde, 19h-7h noite). Não depende do shift_criacao do banco.
const TURNO_PARA_SHIFT: Record<Turno, ShiftType> = { manha: 'morning', tarde: 'afternoon', noite: 'night' };
export const getShiftDoAlerta = (a: Alerta): ShiftType => {
    if (a.created_at) return TURNO_PARA_SHIFT[turnoEDiaDe(a.created_at).turno];
    if (a.shift_criacao === 'morning' || a.shift_criacao === 'afternoon' || a.shift_criacao === 'night') {
        return a.shift_criacao;
    }
    return shiftFilterService.getShiftFromHour(new Date().getHours());
};

// Horário em que o turno atual começou. Na madrugada, a noite começou às 19h de ontem.
export const getInicioTurnoAtual = (ref: Date = new Date()): Date => {
    const hora = ref.getHours();
    const inicio = new Date(ref);
    inicio.setMinutes(0, 0, 0);
    if (hora >= 7 && hora < 13) inicio.setHours(7);
    else if (hora >= 13 && hora < 19) inicio.setHours(13);
    else if (hora >= 19) inicio.setHours(19);
    else {
        inicio.setDate(inicio.getDate() - 1);
        inicio.setHours(19);
    }
    return inicio;
};

const INICIO_TURNO: Record<ShiftType, number> = { morning: 7, afternoon: 13, night: 19 };

// Concluído continua visível na aba do seu turno até o próximo início desse mesmo turno.
export const isConcluidoVisivel = (a: Alerta, agora: Date = new Date()): boolean => {
    if (a.archived_at || isAlertaAtivo(a)) return false;
    const quando = a.concluded_at || a.updated_at;
    if (!quando) return false;
    const concluido = new Date(quando);
    const fim = new Date(concluido);
    fim.setHours(INICIO_TURNO[getShiftDoAlerta(a)], 0, 0, 0);
    if (fim <= concluido) fim.setDate(fim.getDate() + 1);
    return agora < fim;
};

// Alerta em aberto que já passou do prazo (com ou sem justificativa).
export const isAlertaAtrasado = (a: Alerta): boolean =>
    semAcento(a.live_status).includes('fora_do_prazo');

// Precisa de revisão: está aberto, já passou do prazo e não foi justificado no turno atual.
// Alerta ainda dentro do prazo não trava a criação de um novo.
export const precisaRevisao = (a: Alerta): boolean => {
    if (!isAlertaAtivo(a) || !isAlertaAtrasado(a)) return false;
    if (a.continuo) return false; // alerta contínuo nunca trava a criação de outro
    const texto = a.justificativa || a.justification || a.justificativa_motivo;
    const quando = a.justificativa_at || a.justification_at;
    if (!texto || !quando) return true;
    return new Date(quando) < getInicioTurnoAtual();
};

export const alertasService = {
    async getAlertas(patientId: string | number): Promise<Alerta[]> {
        const [tasksResult, alertasResult] = await Promise.all([
            supabase.from('tasks_view_horario_br').select('*').eq('patient_id', patientId).is('archived_at', null),
            supabase.from('alertas_paciente_view_completa').select('*').eq('patient_id', patientId).is('archived_at', null),
        ]);

        if (tasksResult.error) console.error('alertasService.getAlertas - tasks:', tasksResult.error);
        if (alertasResult.error) console.error('alertasService.getAlertas - alertas:', alertasResult.error);

        const alertas: Alerta[] = [];

        (tasksResult.data || []).forEach((task: any) => {
            if (!task?.id_alerta) return;
            alertas.push({
                id: task.id_alerta.toString(),
                alertaclinico: task.alertaclinico || task.description || task.descricao_limpa,
                status: task.status,
                live_status: task.live_status,
                priority: task.priority,
                created_at: task.created_at,
                updated_at: task.updated_at,
                concluded_at: task.concluded_at,
                concluded_by_name: task.concluded_by_name,
                archived_at: task.archived_at,
                source: 'tasks',
                justification: task.justification,
                justification_at: task.justification_at,
                shift_criacao: task.shift_criacao,
                created_by_name: task.created_by_name,
                responsible: task.responsavel || task.responsible,
            });
        });

        (alertasResult.data || []).forEach((alert: any) => {
            if (!alert?.id_alerta) return;
            alertas.push({
                id: alert.id_alerta.toString(),
                alertaclinico: alert.alertaclinico,
                status: alert.status,
                live_status: alert.live_status,
                priority: alert.prioridade,
                created_at: alert.created_at,
                updated_at: alert.updated_at,
                concluded_at: alert.concluded_at,
                concluded_by_name: alert.concluded_by_name,
                archived_at: alert.archived_at,
                source: 'alertas',
                justificativa: alert.justificativa,
                justificativa_at: alert.justificativa_at,
                shift_criacao: alert.shift_criacao,
                created_by_name: alert.created_by_name,
                sistemas: alert.sistemas,
                responsavel: alert.responsavel,
                mostrar_evolucao: alert.mostrar_evolucao !== false,
            });
        });

        return alertas;
    },

    // Busca a justificativa direto das tabelas (as views nem sempre trazem a coluna atualizada).
    async enriquecerJustificativas(alertas: Alerta[]): Promise<Alerta[]> {
        const idsAP = alertas.filter(a => a.source !== 'tasks').map(a => a.id);
        const idsT = alertas.filter(a => a.source === 'tasks').map(a => a.id);
        try {
            const [ap, t] = await Promise.all([
                idsAP.length
                    ? supabase.from('alertas_paciente').select('id, justificativa, justificativa_at, justificativa_motivo, continuo').in('id', idsAP)
                    : Promise.resolve({ data: [], error: null }),
                idsT.length
                    ? supabase.from('tasks').select('id, justification, justification_at, justificativa_motivo, continuo').in('id', idsT)
                    : Promise.resolve({ data: [], error: null }),
            ]);
            if (ap.error) console.error('alertasService.enriquecerJustificativas - alertas_paciente:', ap.error);
            if (t.error) console.error('alertasService.enriquecerJustificativas - tasks:', t.error);

            const porIdAP = new Map((ap.data || []).map((r: any) => [String(r.id), r]));
            const porIdT = new Map((t.data || []).map((r: any) => [String(r.id), r]));

            return alertas.map(a => {
                if (a.source === 'tasks') {
                    const r = porIdT.get(String(a.id));
                    return r ? { ...a, justification: r.justification ?? a.justification, justification_at: r.justification_at ?? a.justification_at, justificativa_motivo: r.justificativa_motivo ?? null, continuo: r.continuo === true } : a;
                }
                const r = porIdAP.get(String(a.id));
                return r ? { ...a, justificativa: r.justificativa ?? a.justificativa, justificativa_at: r.justificativa_at ?? a.justificativa_at, justificativa_motivo: r.justificativa_motivo ?? null, continuo: r.continuo === true } : a;
            });
        } catch (error) {
            console.error('alertasService.enriquecerJustificativas:', error);
            return alertas;
        }
    },

    async marcarComoConcluido(id: string, source: AlertaSource, userId: string): Promise<boolean> {
        const table = source === 'tasks' ? 'tasks' : 'alertas_paciente';
        const status = source === 'tasks' ? 'concluído' : 'resolvido';
        const { error } = await supabase
            .from(table)
            .update({ status, concluded_at: new Date().toISOString(), concluded_by: userId })
            .eq('id', id);
        if (error) {
            console.error('alertasService.marcarComoConcluido:', error);
            return false;
        }

        const { error: completionError } = await supabase
            .from('alert_completions')
            .upsert({
                alert_id: parseInt(id),
                source,
                completed_by: userId,
                completed_at: new Date().toISOString(),
            }, { onConflict: 'alert_id,source' });
        if (completionError) console.error('alertasService.marcarComoConcluido - alert_completions:', completionError);

        return true;
    },

    // motivo (padronizado) é obrigatório; a descrição é opcional. Sem descrição, o texto salvo é o próprio motivo,
    // assim as views do banco continuam entendendo o alerta como justificado.
    async updateJustificativa(id: string, descricao: string, source: AlertaSource, userId: string, motivo: string): Promise<boolean> {
        const table = source === 'tasks' ? 'tasks' : 'alertas_paciente';
        const texto = descricao.trim() || motivo;
        const payload = source === 'tasks'
            ? { justification: texto, justification_by: userId, justification_at: new Date().toISOString(), justificativa_motivo: motivo }
            : { justificativa: texto, justificativa_by: userId, justificativa_at: new Date().toISOString(), justificativa_motivo: motivo };
        const { error } = await supabase.from(table).update(payload).eq('id', id);
        if (error) {
            console.error('alertasService.updateJustificativa:', error);
            return false;
        }
        return true;
    },

    async arquivarAlerta(id: string, motivo: string, source: AlertaSource, userId: string): Promise<boolean> {
        const table = source === 'tasks' ? 'tasks' : 'alertas_paciente';
        const { error } = await supabase
            .from(table)
            .update({ archived_at: new Date().toISOString(), archived_by: userId, motivo_arquivamento: motivo })
            .eq('id', id);
        if (error) {
            console.error('alertasService.arquivarAlerta:', error);
            return false;
        }
        return true;
    },

    async setContinuo(id: string, source: AlertaSource, value: boolean): Promise<boolean> {
        const table = source === 'tasks' ? 'tasks' : 'alertas_paciente';
        const { error } = await supabase.from(table).update({ continuo: value }).eq('id', id);
        if (error) {
            console.error('alertasService.setContinuo:', error);
            return false;
        }
        return true;
    },

    async toggleMostrarEvolucao(id: string, value: boolean): Promise<boolean> {
        const { error } = await supabase.from('alertas_paciente').update({ mostrar_evolucao: value }).eq('id', id);
        if (error) {
            console.error('alertasService.toggleMostrarEvolucao:', error);
            return false;
        }
        return true;
    },
};
