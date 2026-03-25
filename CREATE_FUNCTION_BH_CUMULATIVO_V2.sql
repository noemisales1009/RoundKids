-- ============================================================
-- FUNÇÃO: Cálculo BH Cumulativo por Período
-- Data: 24/03/2026
-- ============================================================
-- LÓGICA:
--   BH Anterior  = soma de TODOS os registros ANTES do período selecionado
--                   (desde a internação)
--   BH Atual     = soma dos registros dentro do período selecionado (últimas N horas)
--   BH Cumulativo = soma de TODOS os registros desde a internação
--                   (= BH Anterior + BH Atual)
--
-- Períodos suportados: 2h, 4h, 6h, 12h, 18h, 24h
-- ============================================================

CREATE OR REPLACE FUNCTION get_bh_cumulativo_v2(
  p_patient_id UUID,
  p_hours INTEGER DEFAULT 24
) RETURNS TABLE(
  patient_id UUID,
  patient_name TEXT,
  period_hours INTEGER,
  periodo_label TEXT,
  bh_anterior NUMERIC,
  bh_atual NUMERIC,
  bh_cumulativo NUMERIC,
  timestamp_anterior TIMESTAMP WITH TIME ZONE,
  timestamp_atual TIMESTAMP WITH TIME ZONE,
  data_calculo TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_now TIMESTAMP WITH TIME ZONE;
  v_limit TIMESTAMP WITH TIME ZONE;
  v_internacao TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Horário atual em São Paulo
  v_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  -- Limite do período selecionado
  v_limit := v_now - (p_hours || ' hours')::INTERVAL;

  -- Buscar data de internação do paciente
  SELECT p.dt_internacao INTO v_internacao
  FROM patients p
  WHERE p.id = p_patient_id;

  RETURN QUERY
  SELECT
    p.id AS patient_id,
    p.name AS patient_name,
    p_hours AS period_hours,
    CASE
      WHEN p_hours = 2  THEN '2 horas'
      WHEN p_hours = 4  THEN '4 horas'
      WHEN p_hours = 6  THEN '6 horas'
      WHEN p_hours = 12 THEN '12 horas'
      WHEN p_hours = 18 THEN '18 horas'
      WHEN p_hours = 24 THEN '24 horas'
      ELSE p_hours || ' horas'
    END AS periodo_label,

    -- BH Anterior: tudo ANTES do período selecionado (desde internação)
    COALESCE(
      (SELECT SUM(bh.resultado)
       FROM balanco_hidrico bh
       WHERE bh.patient_id = p_patient_id
         AND bh.data_registro >= v_internacao
         AND (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') < v_limit),
      0
    ) AS bh_anterior,

    -- BH Atual: soma dentro do período selecionado (últimas N horas)
    COALESCE(
      (SELECT SUM(bh.resultado)
       FROM balanco_hidrico bh
       WHERE bh.patient_id = p_patient_id
         AND (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') >= v_limit
         AND (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') <= v_now),
      0
    ) AS bh_atual,

    -- BH Cumulativo: tudo desde a internação
    COALESCE(
      (SELECT SUM(bh.resultado)
       FROM balanco_hidrico bh
       WHERE bh.patient_id = p_patient_id
         AND bh.data_registro >= v_internacao
         AND (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') <= v_now),
      0
    ) AS bh_cumulativo,

    -- Timestamp do último registro anterior ao período
    (SELECT MAX(bh.data_registro)
     FROM balanco_hidrico bh
     WHERE bh.patient_id = p_patient_id
       AND bh.data_registro >= v_internacao
       AND (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') < v_limit
    ) AS timestamp_anterior,

    -- Timestamp do último registro no período atual
    (SELECT MAX(bh.data_registro)
     FROM balanco_hidrico bh
     WHERE bh.patient_id = p_patient_id
       AND (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') >= v_limit
       AND (bh.data_registro AT TIME ZONE 'America/Sao_Paulo') <= v_now
    ) AS timestamp_atual,

    -- Data do cálculo
    v_now AS data_calculo

  FROM patients p
  WHERE p.id = p_patient_id;

END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TESTE:
-- SELECT * FROM get_bh_cumulativo_v2('seu-uuid-aqui', 24);
-- SELECT * FROM get_bh_cumulativo_v2('seu-uuid-aqui', 6);
-- ============================================================
