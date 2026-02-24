-- ========================================
-- TESTES: GET_BALANCO_CUMULATIVO
-- ========================================

-- 1. Verificar se função foi criada
SELECT EXISTS(
  SELECT 1 
  FROM information_schema.routines 
  WHERE routine_name = 'get_balanco_cumulativo'
) as funcao_existe;

-- 2. Testar a função com 24 horas (padrão)
-- SELECT * FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui');

-- 3. Testar a função com 24 horas (explícito)
-- SELECT * FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 24);

-- 4. Testar a função com 18 horas
-- SELECT * FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 18);

-- 5. Testar a função com 6 horas
-- SELECT * FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 6);

-- 6. Testar a função com 4 horas
-- SELECT * FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 4);

-- 7. Testar a função com 2 horas
-- SELECT * FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 2);

-- 8. Testar TODOS os períodos de uma vez
-- SELECT 
--   patient_name,
--   periodo_label,
--   bh_periodo_anterior,
--   bh_periodo_atual,
--   bh_cumulativo,
--   registros_periodo_atual
-- FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 24)
-- UNION ALL
-- SELECT 
--   patient_name,
--   periodo_label,
--   bh_periodo_anterior,
--   bh_periodo_atual,
--   bh_cumulativo,
--   registros_periodo_atual
-- FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 18)
-- UNION ALL
-- SELECT 
--   patient_name,
--   periodo_label,
--   bh_periodo_anterior,
--   bh_periodo_atual,
--   bh_cumulativo,
--   registros_periodo_atual
-- FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 6)
-- UNION ALL
-- SELECT 
--   patient_name,
--   periodo_label,
--   bh_periodo_anterior,
--   bh_periodo_atual,
--   bh_cumulativo,
--   registros_periodo_atual
-- FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 4)
-- UNION ALL
-- SELECT 
--   patient_name,
--   periodo_label,
--   bh_periodo_anterior,
--   bh_periodo_atual,
--   bh_cumulativo,
--   registros_periodo_atual
-- FROM get_balanco_cumulativo('insira-uuid-do-paciente-aqui', 2);

-- 9. Ver dados brutos do paciente (última semana em SP)
-- SELECT 
--   DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') as data_sp,
--   TIME(data_registro AT TIME ZONE 'America/Sao_Paulo') as hora_sp,
--   resultado,
--   created_by
-- FROM balanco_hidrico
-- WHERE patient_id = 'insira-uuid-do-paciente-aqui'
--   AND data_registro AT TIME ZONE 'America/Sao_Paulo' >= 
--       NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '7 days'
-- ORDER BY data_registro DESC;

-- 10. Verificar timezone do servidor vs São Paulo
SELECT 
  'Servidor UTC' as timezone_tipo,
  NOW() as valor
UNION ALL
SELECT 
  'São Paulo (GMT-3/GMT-2)',
  NOW() AT TIME ZONE 'America/Sao_Paulo';
