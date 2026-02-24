CREATE OR REPLACE VIEW public.tasks_view_horario_br AS
WITH
base AS (
  SELECT
    t.id,
    t.patient_id,
    p.name AS patient_name,
    p.bed_number,
    t.category_id,
    t.description,
    t.responsible,
    t.deadline,
    t.status,
    t.justification,
    t.created_at,
    t.updated_at,
    t.created_by,
    t.archived_at,
    get_shift(t.created_at) AS shift_criacao,
    CASE
      WHEN t.status = 'alerta'::text THEN EXTRACT(EPOCH FROM t.deadline - t.created_at) / 60::numeric
      ELSE 120::numeric
    END AS prazo_minutos_efetivo
  FROM
    tasks t
    LEFT JOIN patients p ON t.patient_id = p.id
),
calc AS (
  SELECT
    b.id,
    b.patient_id,
    b.patient_name,
    b.bed_number,
    b.category_id,
    b.description,
    COALESCE(ur.name, b.responsible, 'Não informado'::text) AS responsible,
    b.deadline,
    b.status,
    b.justification,
    b.created_at,
    b.updated_at,
    b.created_by,
    b.archived_at,
    b.shift_criacao,
    b.prazo_minutos_efetivo,
    COALESCE(u.name, 'Não informado'::text) AS created_by_name,
    (b.created_at AT TIME ZONE 'America/Sao_Paulo'::text) AS hora_criacao_br,
    (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text) AS prazo_limite_br,
    CASE
      WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN (b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text)
      ELSE NULL::timestamp without time zone
    END AS hora_conclusao_br,
    TO_CHAR((b.created_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) AS hora_criacao_hhmm,
    TO_CHAR((b.created_at AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) AS hora_criacao_formatado,
    TO_CHAR((b.deadline AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text) AS prazo_limite_hhmm,
    CASE
      WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN TO_CHAR((b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text), 'HH24:MI'::text)
      ELSE NULL::text
    END AS hora_conclusao_hhmm,
    TO_CHAR((b.deadline AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) AS prazo_limite_formatado,
    CASE
      WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN 'concluido'::text
      WHEN b.deadline < NOW() THEN 'fora_do_prazo'::text
      ELSE 'no_prazo'::text
    END AS live_status,
    (
      WITH iv AS (
        SELECT justify_interval(make_interval(mins => b.prazo_minutos_efetivo::integer)) AS iv
      )
      SELECT
        TRIM(BOTH ' '::text FROM concat_ws(' '::text,
          CASE WHEN EXTRACT(HOUR FROM iv.iv)::integer <> 0 THEN (EXTRACT(HOUR FROM iv.iv)::integer || ' hora'::text) || CASE WHEN EXTRACT(HOUR FROM iv.iv) = 1::numeric THEN ''::text ELSE 's'::text END ELSE NULL::text END,
          CASE WHEN EXTRACT(MINUTE FROM iv.iv)::integer <> 0 THEN EXTRACT(MINUTE FROM iv.iv)::integer || ' min'::text ELSE NULL::text END
        )) AS btrim
      FROM iv
    ) AS prazo_formatado
  FROM
    base b
    LEFT JOIN users u ON b.created_by = u.id
    LEFT JOIN users ur ON b.responsible = ur.id::text OR b.responsible = ur.name
),
limpeza_de_prefixos AS (
  SELECT
    c.id,
    c.patient_id,
    c.patient_name,
    c.bed_number,
    c.category_id,
    c.description,
    c.responsible,
    c.deadline,
    c.status,
    c.justification,
    c.created_at,
    c.updated_at,
    c.created_by,
    c.archived_at,
    c.shift_criacao,
    c.prazo_minutos_efetivo,
    c.created_by_name,
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
    TRIM(BOTH FROM REPLACE(REPLACE(TRIM(BOTH FROM 
      CASE WHEN c.description ~~ '%-%'::text THEN SUBSTRING(c.description, POSITION(('-'::text) IN (c.description)) + 1) ELSE c.description END
    ), '°'::text, ''::text), '-'::text, ''::text)) AS descricao_limpa
  FROM calc c
)
SELECT
  id AS id_alerta,
  patient_id,
  patient_name,
  bed_number,
  category_id,
  CASE WHEN descricao_limpa ~~* '%AVALIAR BH%'::text THEN 1 WHEN descricao_limpa ~~* '%CONTROLE RIGOROSO DE PANI%'::text THEN 2 WHEN descricao_limpa ~~* '%OUTRAS::%'::text THEN 3 ELSE 4 END AS ordem_prioridade,
  descricao_limpa AS alertaclinico,
  responsible AS responsavel,
  status,
  justification AS justificativa,
  created_at,
  updated_at,
  deadline,
  archived_at,
  shift_criacao,
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
