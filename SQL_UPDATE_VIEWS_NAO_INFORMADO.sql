-- ==============================================================================
-- 1. LIMPEZA SEGURA (Remove as views para recriar sem erro de dependência)
-- ==============================================================================
DROP VIEW IF EXISTS public.dashboard_summary_avancado CASCADE;
DROP VIEW IF EXISTS public.dashboard_summary CASCADE;
DROP VIEW IF EXISTS public.tasks_view_horario_br CASCADE;
DROP VIEW IF EXISTS public.alertas_paciente_view_completa CASCADE;

-- ==============================================================================
-- 2. VIEW ALERTAS (Com "Não informado")
-- ==============================================================================
CREATE VIEW public.alertas_paciente_view_completa AS
WITH pre_base AS (
    SELECT
      a.id,
      a.patient_id,
      a.alerta_descricao,
      a.responsavel,
      a.hora_selecionada,
      a.status,
      a.justificativa,
      a.created_at,
      a.updated_at,
      a.created_by,
      CASE
        WHEN a.hora_selecionada ~~ '%24%'::text THEN a.created_at + '24:00:00'::interval
        WHEN a.hora_selecionada ~~ '%12%'::text THEN a.created_at + '12:00:00'::interval
        WHEN a.hora_selecionada ~~ '%6%'::text THEN a.created_at + '06:00:00'::interval
        WHEN a.hora_selecionada ~~ '%4%'::text THEN a.created_at + '04:00:00'::interval
        WHEN a.hora_selecionada ~~ '%3%'::text THEN a.created_at + '03:00:00'::interval
        WHEN a.hora_selecionada ~~ '%2%'::text THEN a.created_at + '02:00:00'::interval
        WHEN a.hora_selecionada ~~ '%1%'::text THEN a.created_at + '01:00:00'::interval
        ELSE a.created_at + '02:00:00'::interval
      END AS deadline_calculado
    FROM alertas_paciente a
),
base AS (
    SELECT
      t.id,
      t.patient_id,
      p.name AS patient_name,
      COALESCE(u.name, 'Não informado'::text) AS created_by_name,
      t.alerta_descricao,
      t.responsavel,
      t.deadline_calculado AS deadline,
      t.status,
      t.justificativa,
      t.created_at,
      t.updated_at,
      t.hora_selecionada,
      CASE
        WHEN t.status = 'alerta'::text THEN EXTRACT(EPOCH FROM t.deadline_calculado - t.created_at) / 60::numeric
        ELSE 120::numeric
      END AS prazo_minutos_efetivo
    FROM pre_base t
    LEFT JOIN patients p ON t.patient_id = p.id
    LEFT JOIN users u ON t.created_by = u.id
),
calc AS (
    SELECT
      b.id,
      b.patient_id,
      b.patient_name,
      b.created_by_name,
      b.alerta_descricao,
      b.responsavel,
      b.deadline,
      b.status,
      b.justificativa,
      b.created_at,
      b.updated_at,
      b.prazo_minutos_efetivo,
      (b.created_at AT TIME ZONE 'America/Sao_Paulo'::text) AS hora_criacao_br,
      (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text) AS prazo_limite_br,
      CASE
        WHEN b.status = 'concluido'::text THEN (b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text)
        ELSE NULL::timestamp without time zone
      END AS hora_conclusao_br,
      to_char((b.created_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) AS hora_criacao_hhmm,
      to_char((b.deadline AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) AS prazo_limite_hhmm,
      CASE
        WHEN b.status = 'concluido'::text THEN to_char((b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text)
        ELSE NULL::text
      END AS hora_conclusao_hhmm,
      to_char((b.deadline AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) AS prazo_limite_formatado,
      CASE
        WHEN b.status = 'concluido'::text THEN 'concluido'::text
        WHEN b.deadline < now() THEN 'fora_do_prazo'::text
        ELSE 'no_prazo'::text
      END AS live_status,
      CASE
        WHEN b.prazo_minutos_efetivo IS NULL THEN NULL::text
        ELSE (
          WITH iv AS (
            SELECT justify_interval(make_interval(mins => b.prazo_minutos_efetivo::integer)) AS iv
          )
          SELECT TRIM(BOTH ' '::text FROM concat_ws(' '::text,
            CASE
              WHEN EXTRACT(HOUR FROM iv.iv)::integer <> 0 THEN 
                (EXTRACT(HOUR FROM iv.iv)::integer || ' hora'::text) || 
                CASE WHEN EXTRACT(HOUR FROM iv.iv) = 1::numeric THEN ''::text ELSE 's'::text END
              ELSE NULL::text
            END,
            CASE
              WHEN EXTRACT(MINUTE FROM iv.iv)::integer <> 0 THEN 
                EXTRACT(MINUTE FROM iv.iv)::integer || ' min'::text
              ELSE NULL::text
            END
          )) AS btrim
          FROM iv
        )
      END AS prazo_formatado
    FROM base b
)
SELECT
  id AS id_alerta,
  patient_id,
  patient_name,
  created_by_name,
  alerta_descricao AS alertaclinico,
  responsavel,
  status,
  justificativa,
  created_at,
  updated_at,
  deadline,
  hora_criacao_br,
  prazo_limite_br,
  hora_conclusao_br,
  hora_criacao_hhmm,
  prazo_limite_hhmm,
  hora_conclusao_hhmm,
  prazo_limite_formatado,
  prazo_minutos_efetivo,
  prazo_formatado,
  live_status
FROM calc;

-- ==============================================================================
-- 3. VIEW TASKS (Com "Não informado")
-- ==============================================================================
CREATE VIEW public.tasks_view_horario_br AS
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
      CASE
        WHEN t.status = 'alerta'::text THEN EXTRACT(EPOCH FROM t.deadline - t.created_at) / 60::numeric
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
      b.prazo_minutos_efetivo,
      COALESCE(u.name, 'Não informado'::text) AS created_by_name,
      (b.created_at AT TIME ZONE 'America/Sao_Paulo'::text) AS hora_criacao_br,
      (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text) AS prazo_limite_br,
      CASE
        WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN (b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text)
        ELSE NULL::timestamp without time zone
      END AS hora_conclusao_br,
      to_char((b.created_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) AS hora_criacao_hhmm,
      to_char((b.deadline AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) AS prazo_limite_hhmm,
      CASE
        WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN to_char((b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text)
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
          SELECT TRIM(BOTH ' '::text FROM concat_ws(' '::text,
            CASE
              WHEN EXTRACT(HOUR FROM iv.iv)::integer <> 0 THEN 
                (EXTRACT(HOUR FROM iv.iv)::integer || ' hora'::text) || 
                CASE WHEN EXTRACT(HOUR FROM iv.iv) = 1::numeric THEN ''::text ELSE 's'::text END
              ELSE NULL::text
            END,
            CASE
              WHEN EXTRACT(MINUTE FROM iv.iv)::integer <> 0 THEN 
                EXTRACT(MINUTE FROM iv.iv)::integer || ' min'::text
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
      c.created_by_name,
      c.prazo_minutos_efetivo,
      c.hora_criacao_br,
      c.prazo_limite_br,
      c.hora_conclusao_br,
      c.hora_criacao_hhmm,
      c.prazo_limite_hhmm,
      c.hora_conclusao_hhmm,
      c.prazo_limite_formatado,
      c.live_status,
      c.prazo_formatado,
      TRIM(BOTH FROM replace(replace(TRIM(BOTH FROM 
        CASE
          WHEN c.description ~~ '%-%'::text THEN "substring"(c.description, POSITION(('-'::text) IN (c.description)) + 1)
          ELSE c.description
        END), '°'::text, ''::text), '-'::text, ''::text)) AS descricao_limpa
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
  hora_criacao_br,
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

-- ==============================================================================
-- 4. RESTAURAR DASHBOARDS (SEM ALTERAÇÕES)
-- ==============================================================================
CREATE VIEW public.dashboard_summary AS
WITH todos_registros AS (
    SELECT
      tasks_view_horario_br.status AS original_status,
      tasks_view_horario_br.live_status
    FROM tasks_view_horario_br
    UNION ALL
    SELECT
      alertas_paciente_view_completa.status AS original_status,
      alertas_paciente_view_completa.live_status
    FROM alertas_paciente_view_completa
)
SELECT
  count(*) FILTER (WHERE (original_status = ANY (ARRAY['alerta'::text, 'aberto'::text, 'Pendente'::text])) AND live_status <> 'concluido'::text AND live_status <> 'Concluido'::text) AS "totalAlertas",
  count(*) FILTER (WHERE live_status = 'no_prazo'::text) AS "totalNoPrazo",
  count(*) FILTER (WHERE live_status = 'fora_do_prazo'::text) AS "totalForaDoPrazo",
  count(*) FILTER (WHERE live_status = 'concluido'::text) AS "totalConcluidos"
FROM todos_registros;

CREATE VIEW public.dashboard_summary_avancado AS
WITH todos_registros AS (
    SELECT
      tasks_view_horario_br.patient_id,
      tasks_view_horario_br.responsavel,
      tasks_view_horario_br.status AS original_status,
      tasks_view_horario_br.live_status
    FROM tasks_view_horario_br
    UNION ALL
    SELECT
      alertas_paciente_view_completa.patient_id,
      alertas_paciente_view_completa.responsavel,
      alertas_paciente_view_completa.status AS original_status,
      alertas_paciente_view_completa.live_status
    FROM alertas_paciente_view_completa
),
totals AS (
    SELECT
      count(*) AS total_registros,
      count(*) FILTER (WHERE todos_registros.live_status = 'concluido'::text) AS total_concluidos,
      count(*) FILTER (WHERE todos_registros.live_status = 'fora_do_prazo'::text) AS total_fora_do_prazo,
      count(*) FILTER (WHERE todos_registros.live_status = 'no_prazo'::text) AS total_no_prazo,
      count(*) FILTER (WHERE (todos_registros.original_status = ANY (ARRAY['alerta'::text, 'aberto'::text])) AND todos_registros.live_status <> 'concluido'::text) AS total_alertas
    FROM todos_registros
),
perc AS (
    SELECT
      round(totals_1.total_concluidos::numeric / NULLIF(totals_1.total_registros, 0)::numeric * 100::numeric, 2) AS perc_concluido,
      round(totals_1.total_fora_do_prazo::numeric / NULLIF(totals_1.total_registros, 0)::numeric * 100::numeric, 2) AS perc_atrasado,
      round(totals_1.total_no_prazo::numeric / NULLIF(totals_1.total_registros, 0)::numeric * 100::numeric, 2) AS perc_no_prazo
    FROM totals totals_1
),
por_responsavel AS (
    SELECT
      todos_registros.responsavel,
      count(*) FILTER (WHERE todos_registros.live_status = 'concluido'::text) AS concluidos,
      count(*) FILTER (WHERE todos_registros.live_status = 'fora_do_prazo'::text) AS atrasados,
      count(*) FILTER (WHERE todos_registros.live_status = 'no_prazo'::text) AS no_prazo,
      count(*) AS total
    FROM todos_registros
    GROUP BY todos_registros.responsavel
),
por_paciente AS (
    SELECT
      todos_registros.patient_id,
      count(*) FILTER (WHERE todos_registros.live_status = 'concluido'::text) AS concluidos,
      count(*) FILTER (WHERE todos_registros.live_status = 'fora_do_prazo'::text) AS atrasados,
      count(*) FILTER (WHERE todos_registros.live_status = 'no_prazo'::text) AS no_prazo,
      count(*) AS total
    FROM todos_registros
    GROUP BY todos_registros.patient_id
)
SELECT
  to_jsonb(totals.*) AS resumo_totais,
  to_jsonb(perc.*) AS resumo_percentual,
  (SELECT jsonb_agg(por_responsavel.*) FROM por_responsavel) AS por_responsavel,
  (SELECT jsonb_agg(por_paciente.*) FROM por_paciente) AS por_paciente
FROM totals, perc;

-- ==============================================================================
-- 5. PERMISSÕES
-- ==============================================================================
GRANT SELECT ON public.tasks_view_horario_br TO authenticated;
GRANT SELECT ON public.alertas_paciente_view_completa TO authenticated;
GRANT SELECT ON public.dashboard_summary TO authenticated;
GRANT SELECT ON public.dashboard_summary_avancado TO authenticated;
