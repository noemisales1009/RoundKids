-- ========================================
-- CORREÇÕES NAS VIEWS
-- Problema: live_status inconsistente entre as views
-- ========================================

-- 1. CORRIGIR alertas_paciente_view_completa
DROP VIEW IF EXISTS public.dashboard_summary;
DROP VIEW IF EXISTS public.alertas_paciente_view_completa CASCADE;

CREATE OR REPLACE VIEW public.alertas_paciente_view_completa AS
WITH pre_base AS (
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
      get_shift(ap.created_at) AS shift_criacao,
      ap.created_at + (
        (regexp_replace(ap.hora_selecionada, '[^0-9]', '', 'g') || ' hours')::interval
      ) AS deadline_calculado
    FROM alertas_paciente ap
),
base AS (
    SELECT
      t.*,
      p.name AS patient_name,
      p.bed_number AS patient_bed,
      COALESCE(uc.name, 'Não informado') AS created_by_name,
      COALESCE(uco.name, 'Não informado') AS concluded_by_name,
      ROUND(
        EXTRACT(EPOCH FROM t.deadline_calculado - t.created_at) / 60::numeric
      ) AS prazo_minutos_efetivo
    FROM pre_base t
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
  shift_criacao,
  created_at,
  updated_at,
  deadline_calculado AS deadline,
  archived_at,
  concluded_at,
  concluded_by,
  TO_CHAR((created_at AT TIME ZONE 'America/Sao_Paulo'), 'DD/MM/YYYY HH24:MI') AS hora_criacao_formatado,
  TO_CHAR((deadline_calculado AT TIME ZONE 'America/Sao_Paulo'), 'DD/MM/YYYY HH24:MI') AS prazo_limite_formatado,
  TO_CHAR((concluded_at AT TIME ZONE 'America/Sao_Paulo'), 'DD/MM/YYYY HH24:MI') AS hora_conclusao_formatado,
  CASE
    WHEN prazo_minutos_efetivo >= 60 THEN (prazo_minutos_efetivo / 60)::integer || ' horas'
    ELSE prazo_minutos_efetivo || ' min'
  END AS prazo_formatado,
  CASE
    WHEN archived_at IS NOT NULL THEN 'arquivado' 
    ELSE status_original
  END AS status,
  justificativa,
  justificativa_by,
  justificativa_at,
  status_conclusao,
  motivo_arquivamento,
  -- ✅ CORRIGIDO: live_status com lógica consistente
  CASE
    WHEN archived_at IS NOT NULL THEN 'arquivado'
    WHEN concluded_at IS NOT NULL THEN 'concluído'
    WHEN deadline_calculado < (NOW() AT TIME ZONE 'America/Sao_Paulo') AND (justificativa IS NULL OR justificativa = '') THEN 'fora_do_prazo'
    WHEN deadline_calculado < (NOW() AT TIME ZONE 'America/Sao_Paulo') AND justificativa IS NOT NULL AND justificativa <> '' THEN 'fora_do_prazo_com_justificativa'
    ELSE 'no_prazo'
  END AS live_status
FROM base;

-- 2. CORRIGIR tasks_view_horario_br
DROP VIEW IF EXISTS public.tasks_view_horario_br CASCADE;

CREATE OR REPLACE VIEW public.tasks_view_horario_br AS
WITH base AS (
    SELECT 
        t.id as task_id,
        t.patient_id,
        t.description,
        t.responsible,
        t.deadline,
        t.status as status_original,
        t.justification,
        t.justification_by,
        t.justification_at,
        t.created_at,
        t.updated_at,
        t.created_by,
        t.archived_at,
        t.archived_by,
        t.motivo_arquivamento,
        t.concluded_at,
        t.concluded_by,
        p.name AS patient_name, 
        p.bed_number AS bed_number
    FROM tasks t 
    LEFT JOIN patients p ON t.patient_id = p.id
),
calc AS (
    SELECT 
        b.*, 
        COALESCE(u.name, 'Não informado') AS created_by_name,
        COALESCE(uc.name, 'Não informado') AS concluded_by_name,
        TO_CHAR((b.created_at AT TIME ZONE 'America/Sao_Paulo'), 'DD/MM/YYYY HH24:MI') AS hora_criacao_formatado,
        TO_CHAR((b.deadline AT TIME ZONE 'America/Sao_Paulo'), 'DD/MM/YYYY HH24:MI') AS prazo_limite_formatado,
        -- ✅ CORRIGIDO: mesmo cálculo do live_status
        CASE 
            WHEN b.archived_at IS NOT NULL THEN 'arquivado'
            WHEN b.concluded_at IS NOT NULL THEN 'concluído'
            WHEN b.deadline < (NOW() AT TIME ZONE 'America/Sao_Paulo') AND (b.justification IS NULL OR b.justification = '') THEN 'fora_do_prazo'
            WHEN b.deadline < (NOW() AT TIME ZONE 'America/Sao_Paulo') AND (b.justification IS NOT NULL AND b.justification <> '') THEN 'fora_do_prazo_com_justificativa'
            ELSE 'no_prazo' 
        END AS live_status_calc
    FROM base b
    LEFT JOIN users u ON b.created_by = u.id
    LEFT JOIN users uc ON b.concluded_by = uc.id
),
limpeza AS (
    SELECT 
        c.*,
        TRIM(BOTH FROM REPLACE(REPLACE(TRIM(BOTH FROM 
            CASE WHEN c.description LIKE '%-%' THEN SUBSTRING(c.description, POSITION('-' IN c.description) + 1) ELSE c.description END
        ), '°', ''), '-', '')) AS descricao_limpa
    FROM calc c
)
SELECT 
    task_id AS id,
    task_id AS id_alerta,
    patient_id, 
    patient_name, 
    bed_number,
    status_original AS status,
    live_status_calc AS live_status,  -- ✅ Renomeado para clareza
    descricao_limpa AS alertaclinico,
    description AS descricao_original,
    justification AS justificativa,
    responsible, 
    created_by_name, 
    concluded_by_name,
    hora_criacao_formatado, 
    prazo_limite_formatado,
    archived_at, 
    archived_by, 
    motivo_arquivamento, 
    concluded_at, 
    concluded_by,
    created_at,
    updated_at,
    deadline
FROM limpeza;

-- 3. RECRIAR dashboard_summary
CREATE OR REPLACE VIEW public.dashboard_summary AS
WITH todos_registros AS (
    SELECT 'tasks' AS origem, live_status FROM tasks_view_horario_br
    UNION ALL
    SELECT 'alertas' AS origem, live_status FROM alertas_paciente_view_completa
)
SELECT
  -- 1. Tudo que está visível na tela (não concluído ou arquivado)
  COUNT(*) FILTER (
    WHERE live_status NOT IN ('concluído', 'arquivado')
  ) AS "totalAlertas",

  -- 2. Somente o que está dentro do prazo
  COUNT(*) FILTER (
    WHERE live_status = 'no_prazo'
  ) AS "totalNoPrazo",

  -- 3. Tudo que atrasou
  COUNT(*) FILTER (
    WHERE live_status IN ('fora_do_prazo', 'fora_do_prazo_com_justificativa')
  ) AS "totalForaDoPrazo",

  -- 4. Tudo que saiu de frente (concluído OU arquivado)
  COUNT(*) FILTER (
    WHERE live_status IN ('concluído', 'arquivado')
  ) AS "totalConcluidos"

FROM todos_registros;

-- ========================================
-- TESTES
-- ========================================

-- Ver se as views estão consisten
SELECT 'tasks' as origem, COUNT(*), COUNT(*) FILTER (WHERE live_status IN ('no_prazo', 'fora_do_prazo', 'fora_do_prazo_com_justificativa'))
FROM tasks_view_horario_br
GROUP BY origem

UNION ALL

SELECT 'alertas' as origem, COUNT(*), COUNT(*) FILTER (WHERE live_status IN ('no_prazo', 'fora_do_prazo', 'fora_do_prazo_com_justificativa'))
FROM alertas_paciente_view_completa
GROUP BY origem;

-- Ver o dashboard
SELECT * FROM dashboard_summary;
