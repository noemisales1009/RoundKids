-- View para alert_completions com nome de quem completou
CREATE OR REPLACE VIEW public.alert_completions_with_user AS
SELECT
  ac.id,
  ac.alert_id,
  ac.source,
  ac.completed_at,
  ac.completed_by,
  COALESCE(u.name, 'Sistema'::text) as completed_by_name,
  ac.created_at
FROM
  alert_completions ac
  LEFT JOIN users u ON ac.completed_by = u.id
ORDER BY
  ac.created_at DESC;

GRANT SELECT ON public.alert_completions_with_user TO authenticated;
ALTER VIEW public.alert_completions_with_user SET (security_barrier = on);

-- View para tasks com nome do criador
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
    CASE
      WHEN t.status = 'alerta'::text THEN EXTRACT(epoch FROM t.deadline - t.created_at) / 60::numeric
      ELSE 120::numeric
    END as prazo_minutos_efetivo
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
    COALESCE(u.name, 'Não informado'::text) as created_by_name,
    (b.created_at AT TIME ZONE 'America/Sao_Paulo'::text) as hora_criacao_br,
    (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text) as prazo_limite_br,
    CASE
      WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN (b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text)
      ELSE NULL::timestamp without time zone
    END as hora_conclusao_br,
    TO_CHAR((b.created_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) as hora_criacao_hhmm,
    TO_CHAR((b.deadline AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) as prazo_limite_hhmm,
    CASE
      WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN TO_CHAR((b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text)
      ELSE NULL::text
    END as hora_conclusao_hhmm,
    TO_CHAR((b.deadline AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) as prazo_limite_formatado,
    CASE
      WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN 'concluido'::text
      WHEN b.deadline < NOW() THEN 'fora_do_prazo'::text
      ELSE 'no_prazo'::text
    END as live_status,
    CASE
      WHEN b.prazo_minutos_efetivo IS NULL THEN NULL::text
      ELSE (
        WITH iv AS (
          SELECT justify_interval(make_interval(mins => b.prazo_minutos_efetivo::integer)) as iv
        )
        SELECT
          TRIM(BOTH ' '::text FROM
            CONCAT_WS(' '::text,
              CASE
                WHEN EXTRACT(hour FROM iv.iv)::integer <> 0 THEN (EXTRACT(hour FROM iv.iv)::integer || ' hora'::text) || CASE WHEN EXTRACT(hour FROM iv.iv) = 1::numeric THEN ''::text ELSE 's'::text END
                ELSE NULL::text
              END,
              CASE
                WHEN EXTRACT(minute FROM iv.iv)::integer <> 0 THEN EXTRACT(minute FROM iv.iv)::integer || ' min'::text
                ELSE NULL::text
              END
            )
          )
        FROM iv
      )
    END as prazo_formatado
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
    TRIM(BOTH FROM
      REPLACE(
        REPLACE(
          TRIM(BOTH FROM
            CASE
              WHEN c.description ~~ '%-%'::text THEN SUBSTRING(c.description, POSITION('-'::text in (c.description)) + 1)
              ELSE c.description
            END
          ),
          '°'::text,
          ''::text
        ),
        '-'::text,
        ''::text
      )
    ) as descricao_limpa
  FROM calc c
)
SELECT
  id as id_alerta,
  patient_id,
  category_id,
  CASE
    WHEN descricao_limpa ~~* '%AVALIAR BH%'::text THEN 1
    WHEN descricao_limpa ~~* '%CONTROLE RIGOROSO DE PANI%'::text THEN 2
    WHEN descricao_limpa ~~* '%OUTRAS::%'::text THEN 3
    ELSE 4
  END as ordem_prioridade,
  descricao_limpa as alertaclinico,
  responsible as responsavel,
  status,
  justification as justificativa,
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

GRANT SELECT ON public.tasks_view_horario_br TO authenticated;
ALTER VIEW public.tasks_view_horario_br SET (security_barrier = on);

-- View para alertas_paciente com nome do criador
CREATE OR REPLACE VIEW public.alertas_paciente_view_completa AS
SELECT 
  a.id as id_alerta,
  a.patient_id,
  a.patient_name,
  a.alertaclinico,
  a.responsavel,
  a.status,
  a.justificativa,
  a.created_at,
  a.updated_at,
  a.deadline,
  a.hora_criacao_br,
  a.prazo_limite_br,
  a.hora_conclusao_br,
  a.hora_criacao_hhmm,
  a.prazo_limite_hhmm,
  a.hora_conclusao_hhmm,
  a.prazo_limite_formatado,
  a.prazo_minutos_efetivo,
  a.prazo_formatado,
  a.live_status,
  COALESCE(u.name, 'Não informado'::text) as created_by_name
FROM alertas_paciente a
LEFT JOIN users u ON a.created_by = u.id
ORDER BY a.created_at DESC;

GRANT SELECT ON public.alertas_paciente_view_completa TO authenticated;
ALTER VIEW public.alertas_paciente_view_completa SET (security_barrier = on);
