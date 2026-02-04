-- ========================================
-- FIX: Adicionar archived_at nas Views
-- Execute TODO este arquivo no Supabase SQL Editor
-- ========================================

-- 1. APAGAR AS VIEWS ANTIGAS COM CASCADE
DROP VIEW IF EXISTS public.alertas_paciente_view_completa CASCADE;
DROP VIEW IF EXISTS public.tasks_view_horario_br CASCADE;

-- 2. CRIAR A PRIMEIRA VIEW (alertas_paciente_view_completa)
CREATE OR REPLACE VIEW public.alertas_paciente_view_completa AS
WITH pre_base AS (
    SELECT 
        alertas_paciente.id,
        alertas_paciente.patient_id,
        alertas_paciente.alerta_descricao,
        alertas_paciente.responsavel,
        alertas_paciente.hora_selecionada,
        alertas_paciente.status,
        alertas_paciente.justificativa,
        alertas_paciente.created_at,
        alertas_paciente.updated_at,
        alertas_paciente.created_by,
        alertas_paciente.archived_at,  -- COLUNA ADICIONADA
        CASE
            WHEN regexp_replace(alertas_paciente.hora_selecionada, '[^0-9]'::text, ''::text, 'g'::text) = ''::text 
            THEN alertas_paciente.created_at + '02:00:00'::interval
            ELSE alertas_paciente.created_at + ((regexp_replace(alertas_paciente.hora_selecionada, '[^0-9]'::text, ''::text, 'g'::text) || ' hours'::text)::interval)
        END AS deadline_calculado
    FROM alertas_paciente
),
base AS (
    SELECT 
        t.id,
        t.patient_id,
        t.alerta_descricao,
        t.responsavel,
        t.hora_selecionada,
        t.status,
        t.justificativa,
        t.created_at,
        t.updated_at,
        t.created_by,
        t.archived_at,  -- COLUNA ADICIONADA
        t.deadline_calculado,
        p.name AS patient_name,
        COALESCE(u.name, 'Não informado'::text) AS created_by_name,
        ROUND(EXTRACT(epoch FROM t.deadline_calculado - t.created_at) / 60::numeric) AS prazo_minutos_efetivo
    FROM pre_base t
    LEFT JOIN patients p ON t.patient_id = p.id
    LEFT JOIN users u ON t.created_by = u.id
)
SELECT 
    id AS id_alerta,
    to_char((created_at AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) AS hora_criacao_formatado,
    patient_id,
    patient_name,
    created_by_name,
    alerta_descricao AS alertaclinico,
    responsavel,
    status,
    justificativa,
    created_at,
    deadline_calculado AS deadline,
    archived_at,  -- COLUNA ADICIONADA
    to_char((deadline_calculado AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) AS prazo_limite_formatado,
    CASE
        WHEN prazo_minutos_efetivo >= 60::numeric 
        THEN (prazo_minutos_efetivo / 60::numeric)::integer || ' horas'::text
        ELSE prazo_minutos_efetivo || ' min'::text
    END AS prazo_formatado,
    CASE
        WHEN status = 'concluido'::text THEN 'concluido'::text
        WHEN deadline_calculado < now() AND (justificativa IS NULL OR justificativa = ''::text) THEN 'fora_do_prazo'::text
        WHEN deadline_calculado < now() AND justificativa IS NOT NULL AND justificativa <> ''::text THEN 'fora_do_prazo_com_justificativa'::text
        ELSE 'no_prazo'::text
    END AS live_status
FROM base;

-- Permissões
GRANT SELECT ON public.alertas_paciente_view_completa TO authenticated;
GRANT SELECT ON public.alertas_paciente_view_completa TO anon;


-- 3. CRIAR A SEGUNDA VIEW (tasks_view_horario_br)
CREATE OR REPLACE VIEW public.tasks_view_horario_br AS
WITH base AS (
    SELECT 
        t.id,
        t.patient_id,
        t.category_id,
        t.description,
        t.responsible,
        t.deadline,
        t.status,
        t.justification,
        t.created_at,
        t.updated_at,
        t.created_by,
        t.archived_at,  -- COLUNA ADICIONADA
        CASE
            WHEN t.status = 'alerta'::text 
            THEN EXTRACT(epoch FROM t.deadline - t.created_at) / 60::numeric
            ELSE 120::numeric
        END AS prazo_minutos_efetivo
    FROM tasks t
),
calc AS (
    SELECT 
        b.id,
        b.patient_id,
        b.category_id,
        b.description,
        b.responsible,
        b.deadline,
        b.status,
        b.justification,
        b.created_at,
        b.updated_at,
        b.archived_at,  -- COLUNA ADICIONADA
        b.prazo_minutos_efetivo,
        COALESCE(u.name, 'Não informado'::text) AS created_by_name,
        (b.created_at AT TIME ZONE 'America/Sao_Paulo'::text) AS hora_criacao_br,
        (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text) AS prazo_limite_br,
        CASE
            WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) 
            THEN (b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text)
            ELSE NULL::timestamp without time zone
        END AS hora_conclusao_br,
        to_char((b.created_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) AS hora_criacao_hhmm,
        to_char((b.created_at AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) AS hora_criacao_formatado,
        to_char((b.deadline AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) AS prazo_limite_hhmm,
        CASE
            WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) 
            THEN to_char((b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text)
            ELSE NULL::text
        END AS hora_conclusao_hhmm,
        to_char((b.deadline AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) AS prazo_limite_formatado,
        CASE
            WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN 'concluido'::text
            WHEN b.deadline < now() THEN 'fora_do_prazo'::text
            ELSE 'no_prazo'::text
        END AS live_status,
        CASE
            WHEN b.prazo_minutos_efetivo IS NULL THEN NULL::text
            ELSE (
                WITH iv AS (
                    SELECT justify_interval(make_interval(mins => b.prazo_minutos_efetivo::integer)) AS iv
                )
                SELECT TRIM(both ' '::text FROM concat_ws(' '::text,
                    CASE
                        WHEN EXTRACT(hour FROM iv.iv)::integer <> 0 
                        THEN (EXTRACT(hour FROM iv.iv)::integer || ' hora'::text) || 
                             CASE WHEN EXTRACT(hour FROM iv.iv) = 1::numeric THEN ''::text ELSE 's'::text END
                        ELSE NULL::text
                    END,
                    CASE
                        WHEN EXTRACT(minute FROM iv.iv)::integer <> 0 
                        THEN EXTRACT(minute FROM iv.iv)::integer || ' min'::text
                        ELSE NULL::text
                    END
                )) AS btrim
                FROM iv
            )
        END AS prazo_formatado
    FROM base b
    LEFT JOIN users u ON b.created_by = u.id
),
limpeza_de_prefixos AS (
    SELECT 
        c.id,
        c.patient_id,
        c.category_id,
        c.description,
        c.responsible,
        c.deadline,
        c.status,
        c.justification,
        c.created_at,
        c.updated_at,
        c.archived_at,  -- COLUNA ADICIONADA
        c.created_by_name,
        c.prazo_minutos_efetivo,
        c.hora_criacao_br,
        c.prazo_limite_br,
        c.hora_conclusao_br,
        c.hora_criacao_hhmm,
        c.hora_criacao_formatado,
        c.prazo_limite_hhmm,
        c.hora_conclusao_hhmm,
        c.prazo_limite_formatado,
        c.live_status,
        c.prazo_formatado,
        TRIM(both FROM replace(replace(TRIM(both FROM 
            CASE
                WHEN c.description ~~ '%-%'::text 
                THEN substring(c.description, POSITION(('-'::text) IN (c.description)) + 1)
                ELSE c.description
            END
        ), '°'::text, ''::text), '-'::text, ''::text)) AS descricao_limpa
    FROM calc c
)
SELECT 
    id AS id_alerta,
    patient_id,
    category_id,
    CASE
        WHEN descricao_limpa ~~* '%AVALIAR BH%'::text THEN 1
        WHEN descricao_limpa ~~* '%CONTROLE RIGOROSO DE PANI%'::text THEN 2
        WHEN descricao_limpa ~~* '%OUTRAS::%'::text THEN 3
        ELSE 4
    END AS ordem_prioridade,
    descricao_limpa AS alertaclinico,
    responsible AS responsavel,
    status,
    justification AS justificativa,
    created_at,
    updated_at,
    deadline,
    archived_at,  -- COLUNA ADICIONADA
    hora_criacao_br,
    hora_criacao_formatado,
    prazo_limite_br,
    hora_conclusao_br,
    hora_criacao_hhmm,
    prazo_limite_hhmm,
    hora_conclusao_hhmm,
    prazo_limite_formatado,
    prazo_minutos_efetivo,
    prazo_formatado,
    live_status,
    created_by_name
FROM limpeza_de_prefixos;

-- Permissões
GRANT SELECT ON public.tasks_view_horario_br TO authenticated;
GRANT SELECT ON public.tasks_view_horario_br TO anon;


-- 4️⃣ ATUALIZAR VIEW: monitoramento_arquivamento_geral
DROP VIEW IF EXISTS public.monitoramento_arquivamento_geral;

CREATE OR REPLACE VIEW public.monitoramento_arquivamento_geral AS

-- PARTE 1: ALERTAS ARQUIVADOS
SELECT 
    'Alerta'::text AS tipo_origem,
    a.id AS registro_id,
    a.patient_id,
    p.name AS paciente_nome,
    a.alerta_descricao AS descricao_original,
    a.motivo_arquivamento AS motivo_do_arquivamento,
    (a.archived_at AT TIME ZONE 'America/Sao_Paulo') AS data_arquivamento,
    a.archived_by AS quem_arquivou_id,
    COALESCE(u.name, 'Sistema') AS quem_arquivou,
    a.status_conclusao AS status_anterior
FROM 
    public.alertas_paciente a
    LEFT JOIN public.patients p ON a.patient_id = p.id
    LEFT JOIN public.users u ON a.archived_by = u.id
WHERE 
    a.archived_at IS NOT NULL

UNION ALL

-- PARTE 2: TAREFAS ARQUIVADAS
SELECT 
    'Tarefa'::text AS tipo_origem,
    t.id AS registro_id,
    t.patient_id,
    t.patient_name AS paciente_nome,
    t.description AS descricao_original,
    t.motivo_arquivamento AS motivo_do_arquivamento,
    (t.archived_at AT TIME ZONE 'America/Sao_Paulo') AS data_arquivamento,
    t.archived_by AS quem_arquivou_id,
    COALESCE(u2.name, 'Sistema') AS quem_arquivou,
    t.status AS status_anterior
FROM 
    public.tasks t
    LEFT JOIN public.users u2 ON t.archived_by = u2.id
WHERE 
    t.archived_at IS NOT NULL
ORDER BY data_arquivamento DESC;

-- Permissões
GRANT SELECT ON public.monitoramento_arquivamento_geral TO authenticated;
GRANT SELECT ON public.monitoramento_arquivamento_geral TO anon;


-- ✅ SUCESSO!
SELECT '✅ Views atualizadas com coluna archived_at!' as resultado;
