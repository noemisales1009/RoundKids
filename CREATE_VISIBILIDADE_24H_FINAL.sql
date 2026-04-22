-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_alertas_status_conclusao 
  ON public.alertas_paciente(status, concluded_at)
  WHERE concluded_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_status_conclusao 
  ON public.tasks(status, concluded_at)
  WHERE concluded_at IS NOT NULL;

-- ========================================
-- FUNÇÕES DE VISIBILIDADE 24H (CORRIGIDAS)
-- ========================================

-- 1. Função: Verifica se o alerta ainda é visível
CREATE OR REPLACE FUNCTION is_alerta_visible(
  p_status text,
  p_hora_conclusao timestamp with time zone
) RETURNS boolean AS $$
BEGIN
  -- Aceita 'resolvido', 'concluído', 'concluido' e 'arquivado'
  IF p_status NOT IN ('concluído', 'arquivado', 'resolvido', 'concluido') THEN
    RETURN TRUE;
  END IF;

  IF p_hora_conclusao IS NULL THEN
    RETURN TRUE; 
  END IF;

  RETURN (NOW() AT TIME ZONE 'America/Sao_Paulo' - p_hora_conclusao) < interval '8 hours';
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Função: Calcula tempo restante de visibilidade
CREATE OR REPLACE FUNCTION tempo_restante_visibilidade(
  p_status text,
  p_hora_conclusao timestamp with time zone
) RETURNS text AS $$
DECLARE
  tempo_decorrido interval;
BEGIN
  -- Aceita 'resolvido', 'concluído', 'concluido' e 'arquivado'
  IF p_status NOT IN ('concluído', 'arquivado', 'resolvido', 'concluido') OR p_hora_conclusao IS NULL THEN
    RETURN NULL;
  END IF;

  tempo_decorrido := NOW() AT TIME ZONE 'America/Sao_Paulo' - p_hora_conclusao;

  IF tempo_decorrido >= interval '8 hours' THEN
    RETURN 'Expirado';
  END IF;

  RETURN EXTRACT(HOUR FROM (interval '8 hours' - tempo_decorrido))::integer || 'h ' ||
         EXTRACT(MINUTE FROM (interval '8 hours' - tempo_decorrido))::integer || 'min visível';
END;
$$ LANGUAGE plpgsql STABLE;

-- ========================================
-- VIEW: ALERTAS E TASKS VISÍVEIS NOS ÚLTIMOS 24H
-- ========================================
DROP VIEW IF EXISTS public.alertas_paciente_visibilidade_24h CASCADE;

CREATE OR REPLACE VIEW public.alertas_paciente_visibilidade_24h AS

-- PARTE 1: ALERTAS CLÍNICOS (Ajustado para usar live_status)
SELECT
  av.id_alerta,
  av.patient_id,
  av.patient_name,
  av.bed_number,
  av.created_by_name,
  av.concluded_by_name,
  av.alertaclinico,
  av.responsavel,
  av.status,
  av.justificativa,
  av.created_at,
  av.deadline,
  av.updated_at,
  av.archived_at,
  av.concluded_at,
  av.concluded_by,
  tempo_restante_visibilidade(av.live_status, av.concluded_at) AS tempo_visibilidade,
  'alertas' AS tipo_origem,
  av.live_status
FROM
  public.alertas_paciente_view_completa av
WHERE
  is_alerta_visible(av.live_status, av.concluded_at)

UNION ALL

-- PARTE 2: TASKS
SELECT
  tv.id_alerta,
  tv.patient_id,
  tv.patient_name,
  tv.bed_number,
  tv.created_by_name,
  tv.concluded_by_name,
  tv.alertaclinico,
  tv.responsible AS responsavel,
  tv.status,
  tv.justificativa,
  tv.created_at,
  tv.deadline,
  tv.updated_at,
  tv.archived_at,
  tv.concluded_at,
  tv.concluded_by,
  tempo_restante_visibilidade(tv.live_status, tv.concluded_at) AS tempo_visibilidade,
  'tasks' AS tipo_origem,
  tv.live_status
FROM
  public.tasks_view_horario_br tv
WHERE
  is_alerta_visible(tv.live_status, tv.concluded_at);

-- ========================================
-- TESTES
-- ========================================

-- 1. Ver quantos alertas estão visíveis em 24h
SELECT COUNT(*) AS total_visivel_24h FROM alertas_paciente_visibilidade_24h;

-- 2. Ver o tempo restante de cada alerta
SELECT 
  id_alerta,
  patient_name,
  alertaclinico,
  status,
  tempo_visibilidade,
  tipo_origem
FROM alertas_paciente_visibilidade_24h
ORDER BY tempo_visibilidade;

-- 3. Verificar consistência de live_status
SELECT 
  'alertas' AS origem,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE live_status IN ('concluído', 'arquivado')) AS concluidos
FROM alertas_paciente_view_completa
UNION ALL
SELECT 
  'tasks' AS origem,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE live_status IN ('concluído', 'arquivado')) AS concluidos
FROM tasks_view_horario_br;
