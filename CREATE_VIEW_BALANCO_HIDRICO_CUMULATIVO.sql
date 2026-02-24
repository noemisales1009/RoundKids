-- ========================================
-- VIEW: BALANÇO HÍDRICO CUMULATIVO
-- ========================================
-- Calcula o BH cumulativo combinando:
-- 1. Último BH do dia anterior (em horário de São Paulo)
-- 2. Soma de todos os BH de hoje (últimas 24h em horário de São Paulo)
-- 
-- IMPORTANTE: Usa timezone 'America/Sao_Paulo' (GMT-3/GMT-2)
-- Exemplo: Das 00:00 de hoje até 23:59:59 de hoje em São Paulo

CREATE OR REPLACE VIEW balanco_hidrico_cumulativo AS
WITH data_sp AS (
  -- Base de data em São Paulo (GMT-3/GMT-2)
  SELECT CAST(NOW() AT TIME ZONE 'America/Sao_Paulo' AS DATE) as hoje_sp,
         CAST((NOW() AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '1 day' AS DATE) as ontem_sp
)
SELECT 
  p.id as patient_id,
  p.name as patient_name,
  (SELECT hoje_sp FROM data_sp)::timestamp with time zone as data_calculo,
  
  -- BH do dia anterior (último registro de ontem em SP)
  COALESCE((
    SELECT resultado 
    FROM balanco_hidrico 
    WHERE patient_id = p.id 
      AND DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') = (SELECT ontem_sp FROM data_sp)
    ORDER BY data_registro DESC 
    LIMIT 1
  ), 0) as bh_dia_anterior,
  
  -- BH de hoje (soma de todos os registros de hoje em SP - últimas 24h)
  COALESCE((
    SELECT SUM(resultado) 
    FROM balanco_hidrico 
    WHERE patient_id = p.id 
      AND DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') = (SELECT hoje_sp FROM data_sp)
  ), 0) as bh_dia_atual,
  
  -- BH CUMULATIVO FINAL = Dia anterior + Dia atual
  COALESCE((
    SELECT resultado 
    FROM balanco_hidrico 
    WHERE patient_id = p.id 
      AND DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') = (SELECT ontem_sp FROM data_sp)
    ORDER BY data_registro DESC 
    LIMIT 1
  ), 0) + COALESCE((
    SELECT SUM(resultado) 
    FROM balanco_hidrico 
    WHERE patient_id = p.id 
      AND DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') = (SELECT hoje_sp FROM data_sp)
  ), 0) as bh_cumulativo,
  
  -- Contadores para debug
  (SELECT COUNT(*) FROM balanco_hidrico WHERE patient_id = p.id 
   AND DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') = (SELECT hoje_sp FROM data_sp)) as registros_hoje
  
FROM patients p, data_sp;

-- ========================================
-- EXEMPLO DE USO:
-- ========================================
-- SELECT * FROM balanco_hidrico_cumulativo WHERE patient_id = 'seu-uuid-aqui';
--
-- Resultado esperado:
-- patient_id | patient_name | bh_dia_anterior | bh_dia_atual | bh_cumulativo
-- -----------+--------------+-----------------+--------------+----------------
--   UUID001  | João Silva   |     +200.00     |    -50.00    |    +150.00
--
-- ========================================
