-- Atualizar view alertas_paciente_view_completa para mostrar "Não informado"
DROP VIEW IF EXISTS alertas_paciente_view_completa CASCADE;

CREATE OR REPLACE VIEW alertas_paciente_view_completa AS
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
    CASE 
      WHEN t.created_by IS NULL THEN 'Não informado'
      ELSE COALESCE(u.name, 'Sistema')
    END AS created_by_name,
    t.alerta_descricao,
    t.responsavel,
    t.deadline_calculado AS deadline,
    t.status,
    t.justificativa,
    t.created_at,
    t.updated_at,
    t.hora_selecionada,
    CASE
      WHEN t.status = 'alerta'::text THEN EXTRACT(
        epoch
        FROM
          t.deadline_calculado - t.created_at
      ) / 60::numeric
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
    to_char(
      (b.created_at AT TIME ZONE 'America/Sao_Paulo'::text),
      'HH24:MI'::text
    ) AS hora_criacao_hhmm,
    to_char(
      (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text),
      'HH24:MI'::text
    ) AS prazo_limite_hhmm,
    CASE
      WHEN b.status = 'concluido'::text THEN to_char(
        (b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text),
        'HH24:MI'::text
      )
      ELSE NULL::text
    END AS hora_conclusao_hhmm,
    to_char(
      (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text),
      'DD/MM/YYYY HH24:MI'::text
    ) AS prazo_limite_formatado,
    CASE
      WHEN b.status = 'concluido'::text THEN 'concluido'::text
      WHEN b.deadline < NOW() THEN 'fora_do_prazo'::text
      ELSE 'no_prazo'::text
    END AS live_status,
    CASE
      WHEN b.prazo_minutos_efetivo IS NULL THEN NULL::text
      ELSE (
        WITH iv AS (
          SELECT
            justify_interval(
              make_interval(mins => b.prazo_minutos_efetivo::integer)
            ) AS iv
        )
        SELECT
          TRIM(
            BOTH ' '::text
            FROM
              concat_ws(
                ' '::text,
                CASE
                  WHEN EXTRACT(hour FROM iv.iv)::integer <> 0 THEN (
                    EXTRACT(hour FROM iv.iv)::integer || ' hora'::text
                  ) || CASE
                    WHEN EXTRACT(hour FROM iv.iv) = 1::numeric THEN ''::text
                    ELSE 's'::text
                  END
                  ELSE NULL::text
                END,
                CASE
                  WHEN EXTRACT(minute FROM iv.iv)::integer <> 0 THEN EXTRACT(
                    minute FROM iv.iv
                  )::integer || ' min'::text
                  ELSE NULL::text
                END
              )
          )
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

GRANT SELECT ON alertas_paciente_view_completa TO authenticated;
ALTER VIEW alertas_paciente_view_completa SET (security_barrier = on);
