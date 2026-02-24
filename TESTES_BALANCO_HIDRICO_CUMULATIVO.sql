-- ========================================
-- TESTE E VALIDAÇÃO: BH CUMULATIVO
-- ========================================
-- Execute este arquivo após CREATE_VIEW_BALANCO_HIDRICO_CUMULATIVO.sql
-- Importante: Todos os testes usam timezone 'America/Sao_Paulo'

-- 🕐 VERIFICAÇÃO DE TIMEZONE
-- Para confirmar que os dados estão em São Paulo (GMT-3/GMT-2)
SELECT 
  'Horário do Servidor' as tipo,
  NOW() as valor
UNION ALL
SELECT 
  'Horário São Paulo' as tipo,
  NOW() AT TIME ZONE 'America/Sao_Paulo' as valor;

-- 1. Verificar se a view foi criada
SELECT EXISTS(
  SELECT 1 
  FROM information_schema.views 
  WHERE table_name = 'balanco_hidrico_cumulativo'
) as view_existe;

-- 2. Ver todos os pacientes e seus BH cumulativos (hoje em SP)
SELECT 
  patient_id,
  patient_name,
  data_calculo,
  bh_dia_anterior as "BH Yesterday (SP)",
  bh_dia_atual as "BH Today (SP - Sum)",
  bh_cumulativo as "BH CUMULATIVO",
  registros_hoje as "Records Today"
FROM balanco_hidrico_cumulativo
ORDER BY patient_name;

-- 3. Ver histórico completo de um paciente em ordem de SP
-- SELECT 
--   patient_id,
--   DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') as data_sp,
--   resultado as bh_registro,
--   created_by,
--   data_registro as data_utc,
--   data_registro AT TIME ZONE 'America/Sao_Paulo' as data_sp_completa
-- FROM balanco_hidrico
-- WHERE patient_id = 'insira-uuid-do-paciente-aqui'
-- ORDER BY data_registro DESC;

-- 4. Ver todos os registros de hoje (em SP)
SELECT 
  patient_id,
  DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') as data_registro_sp,
  TIME(data_registro AT TIME ZONE 'America/Sao_Paulo') as hora_sp,
  resultado,
  created_by,
  created_at
FROM balanco_hidrico
WHERE DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') = CAST(NOW() AT TIME ZONE 'America/Sao_Paulo' AS DATE)
ORDER BY data_registro DESC;

-- 5. Ver histórico de BH pelos últimos 7 dias (em SP)
SELECT 
  DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') as data_sp,
  COUNT(*) as registros,
  SUM(resultado) as total_bh_do_dia,
  ROUND(AVG(resultado), 2) as bh_medio,
  MIN(resultado) as bh_minimo,
  MAX(resultado) as bh_maximo
FROM balanco_hidrico
WHERE DATE(data_registro AT TIME ZONE 'America/Sao_Paulo') >= 
      CAST(NOW() AT TIME ZONE 'America/Sao_Paulo' AS DATE) - INTERVAL '7 days'
GROUP BY DATE(data_registro AT TIME ZONE 'America/Sao_Paulo')
ORDER BY data_sp DESC;

-- 6. Status de cumulativo com interpretação clínica
SELECT 
  patient_id,
  patient_name,
  bh_dia_anterior,
  bh_dia_atual,
  bh_cumulativo,
  CASE 
    WHEN bh_cumulativo > 500 THEN '🔴 CRÍTICO - Retenção muito alta'
    WHEN bh_cumulativo > 200 THEN '⚠️  Alto - Ritenção de líquido'
    WHEN bh_cumulativo > 0 THEN '🟢 Positivo - Retendo moderadamente'
    WHEN bh_cumulativo > -200 THEN '🟢 Negativo - Eliminando moderadamente'
    WHEN bh_cumulativo < -500 THEN '🔴 CRÍTICO - Perda muito alta'
    ELSE '⚠️ Baixo - Perda excessiva'
  END as status_clinico
FROM balanco_hidrico_cumulativo
ORDER BY bh_cumulativo DESC;
