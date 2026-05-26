-- 1. Adiciona campo mostrar_evolucao nas tabelas
ALTER TABLE alertas_paciente
ADD COLUMN IF NOT EXISTS mostrar_evolucao BOOLEAN DEFAULT true;

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS mostrar_evolucao BOOLEAN DEFAULT true;

-- 2. Recria a view alertas_paciente_view_completa com o novo campo
DROP VIEW IF EXISTS public.alertas_paciente_view_completa CASCADE;

CREATE VIEW public.alertas_paciente_view_completa AS
WITH
  pre_base AS (
    SELECT
      ap.id AS alerta_id,
      ap.patient_id,
      ap.alerta_descricao,
      ap.responsavel,
      ap.hora_selecionada,
      ap.status AS status_original,
      ap.justificativa,
      ap.created_at,
      ap.updated_at,
      ap.created_by,
      ap.justificativa_by,
      ap.justificativa_at,
      ap.status_conclusao,
      ap.archived_at,
      ap.archived_by,
      ap.motivo_arquivamento,
      ap.concluded_at,
      ap.concluded_by,
      ap.sistemas,
      ap.mostrar_evolucao,
      get_shift(ap.created_at) AS shift_criacao,
      ap.created_at + (
        (
          regexp_replace(
            ap.hora_selecionada,
            '[^0-9]'::text,
            ''::text,
            'g'::text
          ) || ' hours'::text
        )::interval
      ) AS deadline_calculado
    FROM
      alertas_paciente ap
  ),
  base AS (
    SELECT
      t.alerta_id,
      t.patient_id,
      t.alerta_descricao,
      t.responsavel,
      t.hora_selecionada,
      t.status_original,
      t.justificativa,
      t.created_at,
      t.updated_at,
      t.created_by,
      t.justificativa_by,
      t.justificativa_at,
      t.status_conclusao,
      t.archived_at,
      t.archived_by,
      t.motivo_arquivamento,
      t.concluded_at,
      t.concluded_by,
      t.sistemas,
      t.mostrar_evolucao,
      t.shift_criacao,
      t.deadline_calculado,
      p.name AS patient_name,
      p.bed_number AS patient_bed,
      COALESCE(uc.name, 'Não informado'::text) AS created_by_name,
      COALESCE(uco.name, 'Não informado'::text) AS concluded_by_name,
      ROUND(
        EXTRACT(
          epoch
          FROM t.deadline_calculado - t.created_at
        ) / 60::numeric
      ) AS prazo_minutos_efetivo
    FROM
      pre_base t
      LEFT JOIN patients p ON t.patient_id = p.id
      LEFT JOIN users uc ON t.created_by = uc.id
      LEFT JOIN users uco ON t.concluded_by = uco.id
  )
SELECT
  alerta_id AS id,
  alerta_id AS id_alerta,
  patient_id,
  patient_name,
  patient_bed AS bed_number,
  created_by_name,
  concluded_by_name,
  alerta_descricao AS alertaclinico,
  responsavel,
  sistemas,
  mostrar_evolucao,
  shift_criacao,
  created_at,
  updated_at,
  deadline_calculado AS deadline,
  archived_at,
  concluded_at,
  concluded_by,
  TO_CHAR(
    (created_at AT TIME ZONE 'America/Sao_Paulo'::text),
    'DD/MM/YYYY HH24:MI'::text
  ) AS hora_criacao_formatado,
  TO_CHAR(
    (deadline_calculado AT TIME ZONE 'America/Sao_Paulo'::text),
    'DD/MM/YYYY HH24:MI'::text
  ) AS prazo_limite_formatado,
  TO_CHAR(
    (concluded_at AT TIME ZONE 'America/Sao_Paulo'::text),
    'DD/MM/YYYY HH24:MI'::text
  ) AS hora_conclusao_formatado,
  CASE
    WHEN prazo_minutos_efetivo >= 60::numeric THEN (prazo_minutos_efetivo / 60::numeric)::integer || ' horas'::text
    ELSE prazo_minutos_efetivo || ' min'::text
  END AS prazo_formatado,
  CASE
    WHEN archived_at IS NOT NULL THEN 'arquivado'::text
    ELSE status_original
  END AS status,
  justificativa,
  justificativa_by,
  justificativa_at,
  status_conclusao,
  motivo_arquivamento,
  CASE
    WHEN archived_at IS NOT NULL THEN 'arquivado'::text
    WHEN concluded_at IS NOT NULL THEN 'concluído'::text
    WHEN deadline_calculado < (NOW() AT TIME ZONE 'America/Sao_Paulo'::text)
      AND (justificativa IS NULL OR justificativa = ''::text) THEN 'fora_do_prazo'::text
    WHEN deadline_calculado < (NOW() AT TIME ZONE 'America/Sao_Paulo'::text)
      AND justificativa IS NOT NULL
      AND justificativa <> ''::text THEN 'fora_do_prazo_com_justificativa'::text
    ELSE 'no_prazo'::text
  END AS live_status
FROM base;

GRANT SELECT ON public.alertas_paciente_view_completa TO authenticated;
GRANT SELECT ON public.alertas_paciente_view_completa TO anon;
