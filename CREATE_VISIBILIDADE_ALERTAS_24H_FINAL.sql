-- ========================================
-- SETUP 24H ALERT VISIBILITY 
-- Version: Final - Shows countdown time
-- ========================================

-- 1. Clean up old objects
DROP VIEW IF EXISTS public.alertas_paciente_visibilidade_24h;
DROP FUNCTION IF EXISTS is_alerta_visible(text, timestamp with time zone);
DROP FUNCTION IF EXISTS tempo_restante_visibilidade(text, timestamp with time zone);

-- 2. Function to check if alert should be visible (true/false)
CREATE OR REPLACE FUNCTION is_alerta_visible(
  p_status text, 
  p_hora_conclusao timestamp with time zone
) RETURNS boolean AS $$
BEGIN
  IF p_status NOT IN ('concluido', 'Concluído') THEN 
    RETURN TRUE; 
  END IF;
  
  IF p_hora_conclusao IS NULL THEN 
    RETURN TRUE; 
  END IF;
  
  RETURN (NOW() AT TIME ZONE 'America/Sao_Paulo' - p_hora_conclusao) < interval '24 hours';
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Function to calculate remaining visibility time
CREATE OR REPLACE FUNCTION tempo_restante_visibilidade(
  p_status text, 
  p_hora_conclusao timestamp with time zone
) RETURNS text AS $$
DECLARE
  agora_br timestamp with time zone;
  tempo_decorrido interval;
  horas_restantes numeric;
  minutos_restantes numeric;
BEGIN
  IF p_status NOT IN ('concluido', 'Concluído') THEN 
    RETURN NULL; 
  END IF;
  
  IF p_hora_conclusao IS NULL THEN 
    RETURN NULL; 
  END IF;
  
  agora_br := NOW() AT TIME ZONE 'America/Sao_Paulo';
  tempo_decorrido := agora_br - p_hora_conclusao;
  
  IF tempo_decorrido >= interval '24 hours' THEN 
    RETURN 'Expirado'; 
  END IF;
  
  horas_restantes := EXTRACT(HOUR FROM (interval '24 hours' - tempo_decorrido));
  minutos_restantes := EXTRACT(MINUTE FROM (interval '24 hours' - tempo_decorrido));
  
  RETURN horas_restantes || 'h ' || minutos_restantes || 'min visível';
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. View combining ALERTS + TASKS with 24h visibility countdown
CREATE OR REPLACE VIEW public.alertas_paciente_visibilidade_24h AS

SELECT
  av.id_alerta,
  av.patient_id,
  av.patient_name,
  av.bed_number,
  av.alertaclinico,
  av.status,
  av.live_status,
  av.created_at,
  av.updated_at,
  'alertas' AS tipo_origem,
  tempo_restante_visibilidade(av.status, av.updated_at) as tempo_visibilidade
FROM public.alertas_paciente_view_completa av
WHERE is_alerta_visible(av.status, av.updated_at)

UNION ALL

SELECT
  tv.id_alerta,
  tv.patient_id,
  tv.patient_name,
  tv.bed_number,
  tv.alertaclinico,
  tv.status,
  tv.live_status,
  tv.created_at,
  tv.updated_at,
  'tasks' AS tipo_origem,
  tempo_restante_visibilidade(tv.status, tv.hora_conclusao_br) as tempo_visibilidade
FROM public.tasks_view_horario_br tv
WHERE is_alerta_visible(tv.status, tv.hora_conclusao_br);
