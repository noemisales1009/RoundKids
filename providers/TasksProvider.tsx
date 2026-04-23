import React, { useState, useEffect } from 'react';
import { TasksContext } from '../contexts';
import { Task, TaskStatus } from '../types';
import { supabase } from '../supabaseClient';
import { sanitizeText } from '../lib/sanitize';

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Start with empty array, will fetch on mount
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchTasks = async () => {
        if (supabase) {
            // Fetch from 'tasks', 'alertas_paciente', 'alerts', and 'categorias' tables
            const [tasksRes, alertsRes, alertsTableRes, categoriasRes] = await Promise.all([
                supabase.from('tasks').select('*').then(res => ({ ...res, error: res.error }), err => ({ data: null, error: err })),
                supabase.from('alertas_paciente').select('*').then(res => ({ ...res, error: res.error }), err => ({ data: null, error: err })),
                supabase.from('alerts').select('*').eq('status', 'ativo').then(res => ({ ...res, error: res.error }), err => ({ data: null, error: err })), // Only active alerts
                supabase.from('categorias').select('id, nome').then(res => ({ ...res, error: res.error }), err => ({ data: null, error: err }))
            ]);

            // Create a map of categoria_id -> category name for quick lookup
            const categoriasMap = new Map<number, string>();
            if (categoriasRes.data && !categoriasRes.error) {
                categoriasRes.data.forEach((cat: any) => {
                    categoriasMap.set(cat.id, cat.nome);
                });
            }

            let mappedTasks: Task[] = [];

            // Map standard checklist tasks
            if (tasksRes.data && !tasksRes.error) {
                mappedTasks = tasksRes.data.map((t: any) => ({
                    id: t.id,
                    patientId: t.patient_id,
                    categoryId: t.category_id,
                    description: t.description,
                    responsible: t.responsible,
                    deadline: t.deadline,
                    status: t.status,
                    justification: t.justification,
                    patientName: t.patient_name,
                    categoryName: t.category,
                    timeLabel: t.time_label,
                    options: t.options
                }));
            }

            // Map new 'alertas_paciente' tasks
            if (alertsRes.data && !alertsRes.error) {
                const mappedAlerts: Task[] = alertsRes.data.map((a: any) => {
                    // Calculate deadline from hora_selecionada string (e.g. "1 hora")
                    const hours = parseInt(a.hora_selecionada?.split(' ')[0] || '0');
                    const created = new Date(a.created_at);
                    const deadline = new Date(created.getTime() + hours * 60 * 60 * 1000).toISOString();

                    return {
                        id: a.id, // UUID from new table
                        patientId: a.patient_id,
                        categoryId: 0, // General category for these alerts
                        description: a.alerta_descricao,
                        responsible: a.responsavel,
                        deadline: deadline,
                        // Map 'Pendente' to 'alerta' for UI compatibility
                        status: (a.status === 'Pendente' || a.status === 'Aberto') ? 'alerta' : (a.status === 'Concluido' ? 'concluido' : 'alerta'),
                        categoryName: 'Geral',
                        timeLabel: a.hora_selecionada,
                    };
                });
                mappedTasks = [...mappedTasks, ...mappedAlerts];
            }

            // Map 'alerts' table with categoria_id foreign key
            if (alertsTableRes.data && !alertsTableRes.error) {
                const mappedNewAlerts: Task[] = alertsTableRes.data.map((a: any) => {
                    const categoryName = categoriasMap.get(a.categoria_id) || 'Geral';
                    return {
                        id: a.id, // UUID
                        patientId: a.user_id || 0, // Store user_id as patientId for now
                        categoryId: a.categoria_id,
                        description: a.description || '',
                        responsible: a.user_id || 'Sistema',
                        deadline: a.created_at,
                        status: 'alerta',
                        categoryName: categoryName, // Use name from categorias table
                    };
                });
                mappedTasks = [...mappedTasks, ...mappedNewAlerts];
            } else if (alertsTableRes.error) {
                // Log but don't fail if alerts table doesn't exist yet
            }

            setTasks(mappedTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const updateTaskJustification = async (taskId: number | string, justification: string, userId?: string) => {
        // Only updating standard tasks for now as ID types might differ (int vs uuid)
        // Ideally check ID type or table source
        const { error } = await supabase.from('tasks')
            .update({
                justification,
                justification_by: userId || null,
                justification_at: new Date().toISOString(),
                status: 'fora_do_prazo'
            })
            .eq('id', taskId);
        if (!error) fetchTasks();
    };

    const updateTaskStatus = async (taskId: number | string, status: TaskStatus) => {
        // Check if ID is UUID (string) -> updates 'alertas_paciente', else 'tasks'
        // Simple heuristic: if taskId is string and long, it's likely UUID from new table
        const isUuid = typeof taskId === 'string' && taskId.length > 30;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            // Preparar objeto de atualização
            const updateData: any = { status };

            // Se mudando para concluído, salvar concluded_at e concluded_by
            if (status === 'concluido') {
                updateData.concluded_at = new Date().toISOString();
                updateData.concluded_by = userId;
            }

            if (isUuid) {
                const dbStatus = status === 'concluido' ? 'concluido' : status;
                updateData.status = dbStatus;
                const { error } = await supabase.from('alertas_paciente')
                    .update(updateData)
                    .eq('id', taskId);
                if (!error) fetchTasks();
            } else {
                const { error } = await supabase.from('tasks')
                    .update(updateData)
                    .eq('id', taskId);
                if (!error) fetchTasks();
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const addTask = async (taskData: Omit<Task, 'id' | 'status' | 'justification'>) => {
        const user = await supabase.auth.getUser();
        const userId = user.data?.user?.id;

        const { error } = await supabase.from('tasks').insert([{
            patient_id: taskData.patientId,
            category_id: taskData.categoryId,
            description: sanitizeText(taskData.description),
            responsible: sanitizeText(taskData.responsible),
            deadline: taskData.deadline,
            status: 'alerta',
            patient_name: sanitizeText(taskData.patientName),
            category: sanitizeText(taskData.categoryName),
            time_label: taskData.timeLabel,
            options: taskData.options,
            created_by: userId
        }]);
        if (!error) fetchTasks();
    };

    const addPatientAlert = async (data: { patientId: string | number; description: string; responsible: string; timeLabel: string; sistemas?: string[] }) => {
        const user = await supabase.auth.getUser();
        const userId = user.data?.user?.id;

        const { error } = await supabase.from('alertas_paciente').insert([{
            patient_id: data.patientId,
            alerta_descricao: sanitizeText(data.description),
            responsavel: sanitizeText(data.responsible),
            hora_selecionada: data.timeLabel,
            status: 'Pendente',
            created_at: new Date().toISOString(),
            created_by: userId,
            ...(data.sistemas && data.sistemas.length > 0 ? { sistemas: data.sistemas } : {}),
        }]);

        if (error) {
            console.error("Error creating patient alert:", error);
            return false;
        } else {
            await fetchTasks();
            // FIX: Removido window.location.reload() — fetchTasks já atualiza o estado
            return true;
        }
    }

    const value = {
        tasks,
        updateTaskJustification,
        updateTaskStatus,
        addTask,
        addPatientAlert
    };

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
