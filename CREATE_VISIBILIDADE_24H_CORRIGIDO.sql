-- ========================================
-- VISIBILIDADE 24H - VERSÃO CORRIGIDA
-- Com campo para ordenação correta
-- ========================================

-- 1. CLEANUP
DROP VIEW IF EXISTS public.alertas_paciente_visibilidade_24h;
DROP FUNCTION IF EXISTS tempo_restante_visibilidade(text, timestamp with time zone, timestamp with time zone);

-- 2. FUNCTION - Retorna TEXT legível
CREATE OR REPLACE FUNCTION tempo_restante_visibilidade(
  p_status text, 
  p_deadline timestamp with time zone,
  p_hora_conclusao timestamp with time zone
) RETURNS text AS $$
DECLARE
  agora_br timestamp with time zone;
  intervalo interval;
  total_minutos int;
BEGIN
  agora_br := NOW() AT TIME ZONE 'America/Sao_Paulo';

  IF p_status NOT ILIKE 'concluido' AND p_status NOT ILIKE 'Concluído' AND p_status NOT ILIKE 'resolvido%' THEN
    IF p_deadline IS NULL THEN RETURN 'Sem prazo'; END IF;
    intervalo := p_deadline - agora_br;
    total_minutos := (EXTRACT(EPOCH FROM intervalo) / 60)::int;
    IF total_minutos <= 0 THEN RETURN 'Atrasado'; END IF;
    RETURN (total_minutos / 60) || 'h ' || (total_minutos % 60) || 'min p/ vencer';
  END IF;

  IF p_hora_conclusao IS NOT NULL THEN
    intervalo := interval '24 hours' - (agora_br - p_hora_conclusao);
    total_minutos := (EXTRACT(EPOCH FROM intervalo) / 60)::int;
    IF total_minutos <= 0 THEN RETURN 'Expirando...'; END IF;
    RETURN (total_minutos / 60) || 'h ' || (total_minutos % 60) || 'min visível';
  END IF;

  RETURN '---';
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. FUNCTION - Retorna INT em minutos (para ordenação)
CREATE OR REPLACE FUNCTION tempo_minutos_total(
  p_status text, 
  p_deadline timestamp with time zone,
  p_hora_conclusao timestamp with time zone
) RETURNS int AS $$
DECLARE
  agora_br timestamp with time zone;
  intervalo interval;
  total_minutos int;
BEGIN
  agora_br := NOW() AT TIME ZONE 'America/Sao_Paulo';

  IF p_status NOT ILIKE 'concluido' AND p_status NOT ILIKE 'Concluído' AND p_status NOT ILIKE 'resolvido%' THEN
    IF p_deadline IS NULL THEN RETURN 999999; END IF;
    intervalo := p_deadline - agora_br;
    total_minutos := (EXTRACT(EPOCH FROM intervalo) / 60)::int;
    RETURN CASE WHEN total_minutos <= 0 THEN -1 ELSE total_minutos END;
  END IF;

  IF p_hora_conclusao IS NOT NULL THEN
    intervalo := interval '24 hours' - (agora_br - p_hora_conclusao);
    total_minutos := (EXTRACT(EPOCH FROM intervalo) / 60)::int;
    RETURN CASE WHEN total_minutos <= 0 THEN -1 ELSE total_minutos END;
  END IF;

  RETURN 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. VIEW - Com campo numérico para ordenação
-- RETORNA APENAS alertas CONCLUÍDOS que ainda estão visíveis (< 24h)
CREATE OR REPLACE VIEW public.alertas_paciente_visibilidade_24h AS

SELECT
  av.id_alerta,
  av.patient_id,
  av.patient_name,
  av.bed_number,
  av.alertaclinico,
  av.status,
  av.created_by_name,
  av.created_at,
  'alertas' AS tipo_origem,
  tempo_restante_visibilidade(av.status, av.deadline, av.updated_at) AS tempo_visibilidade,
  tempo_minutos_total(av.status, av.deadline, av.updated_at) AS tempo_minutos_ordenacao
FROM public.alertas_paciente_view_completa av
WHERE (trim(upper(av.status)) IN ('CONCLUIDO', 'CONCLUÍDO', 'RESOLVIDO', 'ARQUIVADO'))
   AND (av.updated_at >= (NOW() AT TIME ZONE 'America/Sao_Paulo' - interval '24 hours'))

UNION ALL

SELECT
  tv.id_alerta,
  tv.patient_id,
  tv.patient_name,
  tv.bed_number,
  tv.alertaclinico,
  tv.status,
  tv.created_by_name,
  tv.created_at,
  'tasks' AS tipo_origem,
  tempo_restante_visibilidade(tv.status, tv.deadline, tv.hora_conclusao_br) AS tempo_visibilidade,
  tempo_minutos_total(tv.status, tv.deadline, tv.hora_conclusao_br) AS tempo_minutos_ordenacao
FROM public.tasks_view_horario_br tv
WHERE (trim(upper(tv.status)) IN ('CONCLUIDO', 'CONCLUÍDO'))
   AND (tv.hora_conclusao_br >= (NOW() AT TIME ZONE 'America/Sao_Paulo' - interval '24 hours'));
