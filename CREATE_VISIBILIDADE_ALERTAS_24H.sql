-- ========================================
-- FUNÇÕES PARA VISIBILIDADE DE ALERTAS 24H
-- ========================================

-- Função para determinar se um alerta deve ser visível
-- Retorna TRUE se:
-- 1. Alerta ainda não foi concluído (status_conclusao != 'concluido')
-- 2. Alerta foi concluído há menos de 24 horas

CREATE OR REPLACE FUNCTION is_alerta_visible(
  p_status_conclusao text,
  p_hora_conclusao timestamp with time zone
) RETURNS boolean AS $$
DECLARE
  agora_br timestamp with time zone;
  tempo_decorrido interval;
BEGIN
  -- Se não foi concluído, está visível
  IF p_status_conclusao NOT IN ('concluido', 'Concluído') THEN
    RETURN TRUE;
  END IF;

  -- Se foi concluído, verificar se está dentro de 24 horas
  IF p_hora_conclusao IS NULL THEN
    RETURN TRUE; -- Se por algum motivo não temos a hora de conclusão, mostrar
  END IF;

  -- Converter hora atual para São Paulo
  agora_br := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Calcular tempo decorrido desde conclusão
  tempo_decorrido := agora_br - p_hora_conclusao;
  
  -- Retornar TRUE se passou menos de 24 horas
  RETURN tempo_decorrido < interval '24 hours';
END;
$$ LANGUAGE plpgsql STABLE;


-- Função auxiliar para determinar o tempo restante (em horas e minutos)
CREATE OR REPLACE FUNCTION tempo_restante_visibilidade(
  p_status_conclusao text,
  p_hora_conclusao timestamp with time zone
) RETURNS text AS $$
DECLARE
  agora_br timestamp with time zone;
  tempo_decorrido interval;
  horas_restantes numeric;
  minutos_restantes numeric;
  resultado text;
BEGIN
  -- Se não foi concluído
  IF p_status_conclusao NOT IN ('concluido', 'Concluído') THEN
    RETURN NULL;
  END IF;

  -- Se hora de conclusão é NULL
  IF p_hora_conclusao IS NULL THEN
    RETURN NULL;
  END IF;

  agora_br := NOW() AT TIME ZONE 'America/Sao_Paulo';
  tempo_decorrido := agora_br - p_hora_conclusao;

  -- Se passou 24 horas
  IF tempo_decorrido >= interval '24 hours' THEN
    RETURN 'Expirado';
  END IF;

  -- Calcular horas e minutos restantes
  horas_restantes := EXTRACT(HOUR FROM (interval '24 hours' - tempo_decorrido));
  minutos_restantes := EXTRACT(MINUTE FROM (interval '24 hours' - tempo_decorrido));

  RETURN horas_restantes || 'h ' || minutos_restantes || 'min visível';
END;
$$ LANGUAGE plpgsql STABLE;


-- ================================================
-- VIEW FILTRADA COM VISIBILIDADE DE 24H
-- COMBINA ALERTAS + TASKS
-- ================================================
CREATE OR REPLACE VIEW public.alertas_paciente_visibilidade_24h AS
-- ALERTAS CLÍNICOS
SELECT
  av.id_alerta,
  av.patient_id,
  av.patient_name,
  av.bed_number,
  av.created_by_name,
  av.alertaclinico,
  av.responsavel,
  av.status,
  av.status_conclusao,
  av.justificativa,
  av.created_at,
  av.deadline,
  av.updated_at,
  av.archived_at,
  av.shift_criacao,
  -- Em alertas_paciente_view_completa, a data de conclusão vem de archived_at ou updated_at
  tempo_restante_visibilidade(av.status_conclusao, COALESCE(av.archived_at, av.updated_at)) AS tempo_visibilidade,
  'alertas' AS tipo_origem,
  av.live_status
FROM
  public.alertas_paciente_view_completa av
WHERE
  is_alerta_visible(av.status_conclusao, COALESCE(av.archived_at, av.updated_at))

UNION ALL

-- TASKS
SELECT
  tv.id_alerta,
  tv.patient_id,
  tv.patient_name,
  tv.bed_number,
  tv.created_by_name,
  tv.alertaclinico,
  tv.responsavel,
  tv.status,
  tv.status_conclusao,
  tv.justificativa,
  tv.created_at,
  tv.deadline,
  tv.updated_at,
  tv.archived_at,
  tv.shift_criacao,
  -- Em tasks_view_horario_br, você já tem a hora_conclusao_br tratada
  tempo_restante_visibilidade(tv.status_conclusao, tv.hora_conclusao_br) AS tempo_visibilidade,
  'tasks' AS tipo_origem,
  tv.live_status
FROM
  public.tasks_view_horario_br tv
WHERE
  is_alerta_visible(tv.status_conclusao, tv.hora_conclusao_br);

-- ================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_alertas_status_conclusao 
  ON public.alertas_paciente(status, concluded_at)
  WHERE concluded_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_status_conclusao 
  ON public.tasks(status, concluded_at)
  WHERE concluded_at IS NOT NULL;
