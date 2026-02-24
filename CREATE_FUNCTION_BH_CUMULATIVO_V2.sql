-- ============================================
-- NOVA FUNÇÃO: Cálculo Simples BH Cumulativo
-- Compara: BH de X horas atrás + BH de agora
-- ============================================

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
  v_time_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Usar horário de São Paulo
  v_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  v_time_ago := v_now - (p_hours || ' hours')::INTERVAL;
  
  -- Label do período
  RETURN QUERY
  SELECT
    p.id as patient_id,
    p.name as patient_name,
    p_hours as period_hours,
    CASE 
      WHEN p_hours = 2 THEN '2 horas'
      WHEN p_hours = 4 THEN '4 horas'
      WHEN p_hours = 6 THEN '6 horas'
      WHEN p_hours = 18 THEN '18 horas'
      WHEN p_hours = 24 THEN '24 horas'
      ELSE p_hours || ' horas'
    END as periodo_label,
    
    -- BH de X horas atrás (resultado acumulado naquele período)
    COALESCE(
      (SELECT SUM(resultado) FROM balanco_hidrico 
       WHERE patient_id = p_patient_id 
       AND data_registro AT TIME ZONE 'America/Sao_Paulo' >= v_time_ago
       AND data_registro AT TIME ZONE 'America/Sao_Paulo' < v_now - (p_hours || ' seconds')::INTERVAL),
      0
    ) as bh_anterior,
    
    -- BH de agora (resultado acumulado até o momento)
    COALESCE(
      (SELECT SUM(resultado) FROM balanco_hidrico 
       WHERE patient_id = p_patient_id 
       AND data_registro AT TIME ZONE 'America/Sao_Paulo' >= v_now - (p_hours || ' seconds')::INTERVAL
       AND data_registro AT TIME ZONE 'America/Sao_Paulo' <= v_now),
      0
    ) as bh_atual,
    
    -- BH Cumulativo = Anterior + Atual
    COALESCE(
      (SELECT SUM(resultado) FROM balanco_hidrico 
       WHERE patient_id = p_patient_id 
       AND data_registro AT TIME ZONE 'America/Sao_Paulo' >= v_time_ago
       AND data_registro AT TIME ZONE 'America/Sao_Paulo' < v_now - (p_hours || ' seconds')::INTERVAL),
      0
    ) +
    COALESCE(
      (SELECT SUM(resultado) FROM balanco_hidrico 
       WHERE patient_id = p_patient_id 
       AND data_registro AT TIME ZONE 'America/Sao_Paulo' >= v_now - (p_hours || ' seconds')::INTERVAL
       AND data_registro AT TIME ZONE 'America/Sao_Paulo' <= v_now),
      0
    ) as bh_cumulativo,
    
    -- Timestamp do período anterior
    (SELECT MAX(data_registro) FROM balanco_hidrico 
     WHERE patient_id = p_patient_id 
     AND data_registro AT TIME ZONE 'America/Sao_Paulo' >= v_time_ago
     AND data_registro AT TIME ZONE 'America/Sao_Paulo' < v_now - (p_hours || ' seconds')::INTERVAL
    ) as timestamp_anterior,
    
    -- Timestamp atual
    (SELECT MAX(data_registro) FROM balanco_hidrico 
     WHERE patient_id = p_patient_id 
     AND data_registro AT TIME ZONE 'America/Sao_Paulo' >= v_now - (p_hours || ' seconds')::INTERVAL
     AND data_registro AT TIME ZONE 'America/Sao_Paulo' <= v_now
    ) as timestamp_atual,
    
    -- Data do cálculo
    v_now as data_calculo
    
  FROM patients p
  WHERE p.id = p_patient_id;
  
END;
$$ LANGUAGE plpgsql;

-- Teste
-- SELECT * FROM get_bh_cumulativo_v2('seu-uuid-aqui', 24);
