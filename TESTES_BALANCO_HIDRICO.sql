-- ============================================================================
-- TESTES: BALANÇO HÍDRICO
-- ============================================================================
-- Este arquivo contém queries de teste para validar a implementação
-- completa do sistema de balanço hídrico

-- ============================================================================
-- 1. TESTES DE ESTRUTURA
-- ============================================================================

-- Verificar se a tabela foi criada
SELECT 
  'balanco_hidrico' AS tabela,
  COUNT(*) AS total_colunas
FROM information_schema.columns
WHERE table_name = 'balanco_hidrico'
GROUP BY table_name;

-- Ver estrutura completa da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'balanco_hidrico'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'balanco_hidrico';

-- Verificar se os índices foram criados
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'balanco_hidrico'
ORDER BY indexname;

-- Verificar se as views foram criadas
SELECT
  table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
  'vw_balanco_diario',
  'vw_resumo_balanco',
  'vw_balanco_historico_com_usuario'
)
ORDER BY table_name;

-- Verificar se RLS está habilitado
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'balanco_hidrico';

-- Ver policies de RLS
SELECT
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'balanco_hidrico'
ORDER BY policyname;

-- ============================================================================
-- 2. TESTES DE INSTALÇÃO - INSERIR DADOS DE TESTE
-- ============================================================================

-- Buscar um patient_id válido (ADAPT COM SEUS DADOS)
-- Se não tiver pacientes, crie um antes
SELECT id FROM patients LIMIT 1;

-- Inserir registros de teste (ADAPT patient_id e created_by)
INSERT INTO balanco_hidrico (
  patient_id,
  volume,
  peso,
  tipo,
  descricao,
  created_by
)
VALUES
  -- Dia 1: Entrada de 500mL
  (
    (SELECT id FROM patients LIMIT 1),
    500,
    70,
    'Positivo',
    'Soro fisiológico 500mL - Dia 1',
    (SELECT id FROM users LIMIT 1)
  ),
  -- Dia 1: Saída de 800mL
  (
    (SELECT id FROM patients LIMIT 1),
    800,
    70,
    'Negativo',
    'Urina - Dia 1',
    (SELECT id FROM users LIMIT 1)
  ),
  -- Dia 2: Entrada de 1000mL
  (
    (SELECT id FROM patients LIMIT 1),
    1000,
    70,
    'Positivo',
    'Soro + água - Dia 2',
    (SELECT id FROM users LIMIT 1)
  ),
  -- Dia 2: Saída de 600mL
  (
    (SELECT id FROM patients LIMIT 1),
    600,
    70,
    'Negativo',
    'Drenagem - Dia 2',
    (SELECT id FROM users LIMIT 1)
  );

-- ============================================================================
-- 3. TESTES DE VIEWS
-- ============================================================================

-- Teste View: Balanço Diário
SELECT 
  'Teste: vw_balanco_diario' AS teste,
  COUNT(*) AS registros,
  MIN(dia) AS data_minima,
  MAX(dia) AS data_maxima
FROM vw_balanco_diario;

-- Verificar se os cálculos estão corretos
SELECT 
  patient_id,
  dia::date AS data,
  bh_do_dia::numeric(10,2) AS bh_dia,
  COALESCE(bh_dia_anterior, 0)::numeric(10,2) AS bh_anterior,
  bh_cumulativo::numeric(10,2) AS bh_cumul,
  total_registros
FROM vw_balanco_diario
ORDER BY dia DESC
LIMIT 10;

-- Teste View: Resumo com Classificação
SELECT 
  'Teste: vw_resumo_balanco' AS teste,
  COUNT(*) AS registros,
  MIN(dia) AS data_minima,
  MAX(dia) AS data_maxima
FROM vw_resumo_balanco;

-- Ver classificações
SELECT 
  dia::date AS data,
  bh_do_dia::numeric(10,2) AS bh,
  classificacao,
  bh_cumulativo::numeric(10,2) AS cumulativo
FROM vw_resumo_balanco
ORDER BY dia DESC
LIMIT 10;

-- Teste View: Histórico com Usuário
SELECT 
  'Teste: vw_balanco_historico_com_usuario' AS teste,
  COUNT(*) AS registros
FROM vw_balanco_historico_com_usuario;

-- Ver histórico detalhado
SELECT 
  data_criacao,
  volume::numeric(10,2),
  tipo,
  resultado::numeric(10,2),
  nome_criador,
  descricao
FROM vw_balanco_historico_com_usuario
ORDER BY data_criacao DESC
LIMIT 10;

-- ============================================================================
-- 4. TESTES DE CÁLCULOS
-- ============================================================================

-- Ver cálculos automáticos (resultado field)
SELECT 
  id,
  volume::numeric(10,2),
  peso::numeric(10,2),
  tipo,
  resultado::numeric(10,5),
  CASE 
    WHEN resultado > 0.01 THEN 'POSITIVO (ENTRADA)'
    WHEN resultado < -0.01 THEN 'NEGATIVO (SAÍDA)'
    ELSE 'EQUILIBRADO'
  END AS interpretacao
FROM balanco_hidrico
ORDER BY created_at DESC
LIMIT 20;

-- Validar cálculos manualmente
SELECT 
  id,
  volume,
  peso,
  (volume / (peso * 10.0)) AS calculo_esperado,
  resultado AS calculo_armazenado,
  CASE 
    WHEN (volume / (peso * 10.0))::numeric(10,5) 
         = resultado::numeric(10,5)
    THEN '✓ OK'
    ELSE '✗ ERRO DE CÁLCULO'
  END AS validacao
FROM balanco_hidrico
WHERE peso > 0
LIMIT 20;

-- ============================================================================
-- 5. TESTES DE PERFORMANCE
-- ============================================================================

-- Tamanho da tabela
SELECT 
  'balanco_hidrico' AS tabela,
  pg_size_pretty(pg_total_relation_size('public.balanco_hidrico')) AS tamanho_total,
  pg_size_pretty(pg_relation_size('public.balanco_hidrico')) AS tamanho_dados,
  pg_size_pretty(pg_indexes_size('public.balanco_hidrico')) AS tamanho_indices
;

-- Contagem de registros
SELECT 
  COUNT(*) AS total_registros,
  COUNT(DISTINCT patient_id) AS pacientes_unicos,
  MIN(created_at) AS primeiro_registro,
  MAX(created_at) AS ultimo_registro
FROM balanco_hidrico;

-- Uso de índices
SELECT
  indexname,
  idx_scan AS scans,
  idx_tup_read AS tuples_lidas,
  idx_tup_fetch AS tuples_retornadas
FROM pg_stat_user_indexes
WHERE tablename = 'balanco_hidrico'
ORDER BY idx_scan DESC;

-- ============================================================================
-- 6. TESTES DE RLS (Se aplicável)
-- ============================================================================

-- Verificar se RLS está funcionando
-- Execute como usuário diferente para testar isolamento
SELECT 
  COUNT(*) AS registros_visiveis,
  COUNT(DISTINCT patient_id) AS pacientes_visiveis
FROM balanco_hidrico;

-- ============================================================================
-- 7. TESTES DE EDGE CASES
-- ============================================================================

-- Testar com peso = 0 (deve falhar por constraint)
-- Descomente para testar:
/*
INSERT INTO balanco_hidrico (patient_id, volume, peso, tipo)
VALUES ((SELECT id FROM patients LIMIT 1), 500, 0, 'Positivo');
-- Esperado: ERROR: new row for relation "balanco_hidrico" violates check constraint "balanco_hidrico_peso_check"
*/

-- Testar com tipo inválido (deve falhar por constraint)
-- Descomente para testar:
/*
INSERT INTO balanco_hidrico (patient_id, volume, peso, tipo)
VALUES ((SELECT id FROM patients LIMIT 1), 500, 70, 'Invalido');
-- Esperado: ERROR: new row for relation "balanco_hidrico" violates check constraint "balanco_hidrico_tipo_check"
*/

-- Testar com patient_id inválido (deve falhar por FK)
-- Descomente para testar:
/*
INSERT INTO balanco_hidrico (patient_id, volume, peso, tipo)
VALUES ('00000000-0000-0000-0000-000000000000', 500, 70, 'Positivo');
-- Esperado: ERROR: insert or update on table "balanco_hidrico" violates foreign key constraint
*/

-- ============================================================================
-- 8. TESTES DE QUERIES COMUNS
-- ============================================================================

-- 1. BH de um paciente específico hoje
WITH base_patient AS (
  SELECT id FROM patients LIMIT 1
)
SELECT 
  patient_id,
  dia::date AS data,
  bh_do_dia,
  classificacao
FROM vw_resumo_balanco
WHERE patient_id = (SELECT id FROM base_patient)
AND dia::date = CURRENT_DATE;

-- 2. Tendência dos últimos 7 dias
WITH base_patient AS (
  SELECT id FROM patients LIMIT 1
)
SELECT 
  dia::date AS data,
  bh_do_dia::numeric(10,2) AS bh_dia,
  bh_cumulativo::numeric(10,2) AS cumulativo,
  classificacao
FROM vw_resumo_balanco
WHERE patient_id = (SELECT id FROM base_patient)
AND dia >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY dia DESC;

-- 3. Total em um mês
WITH base_patient AS (
  SELECT id FROM patients LIMIT 1
)
SELECT 
  TO_CHAR(dia, 'YYYY-MM') AS mes,
  COUNT(*) AS registros,
  SUM(bh_do_dia) AS total_mes,
  ROUND(AVG(bh_do_dia)::numeric, 2) AS media_diaria
FROM vw_balanco_diario
WHERE patient_id = (SELECT id FROM base_patient)
GROUP BY TO_CHAR(dia, 'YYYY-MM')
ORDER BY mes DESC;

-- 4. Comparação entre pacientes (CUIDADO: respeite HIPAA/LGPD)
SELECT 
  patient_id,
  COUNT(*) AS total_registros,
  AVG(bh_do_dia) AS media_bh,
  MAX(bh_cumulativo) AS maximo_cumulativo,
  MIN(bh_cumulativo) AS minimo_cumulativo
FROM vw_balanco_diario
GROUP BY patient_id
ORDER BY total_registros DESC
LIMIT 10;

-- ============================================================================
-- 9. LIMPEZA (Remover Dados de Teste)
-- ============================================================================

-- Para remover os dados de teste, descomente:
/*
DELETE FROM balanco_hidrico
WHERE descricao LIKE '%Dia 1%' 
   OR descricao LIKE '%Dia 2%';

-- Verificar se foi deletado
SELECT COUNT(*) FROM balanco_hidrico;
*/

-- ============================================================================
-- 10. RESUMO FINAL
-- ============================================================================

-- Resumo da implementação
SELECT 
  'Tabela criada' AS componente,
  'balanco_hidrico' AS nome,
  COUNT(*) AS registros
FROM balanco_hidrico
UNION ALL
SELECT 'View', 'vw_balanco_diario', COUNT(DISTINCT patient_id) FROM vw_balanco_diario
UNION ALL
SELECT 'View', 'vw_resumo_balanco', COUNT(DISTINCT patient_id) FROM vw_resumo_balanco
UNION ALL
SELECT 'View', 'vw_balanco_historico_com_usuario', COUNT(DISTINCT patient_id) FROM vw_balanco_historico_com_usuario
ORDER BY componente, nome;

-- Verificação final: Tudo está OK?
SELECT 
  'VERIFICAÇÃO FINAL' AS status,
  CASE 
    WHEN (SELECT 1 FROM information_schema.tables WHERE table_name = 'balanco_hidrico') IS NOT NULL
    THEN '✓ Tabela OK'
    ELSE '✗ Tabela Faltando'
  END AS tabela,
  CASE 
    WHEN (SELECT 1 FROM information_schema.views WHERE table_name = 'vw_resumo_balanco') IS NOT NULL
    THEN '✓ Views OK'
    ELSE '✗ Views Faltando'
  END AS views,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'balanco_hidrico') >= 3
    THEN '✓ Índices OK'
    ELSE '✗ Índices Faltando'
  END AS indices,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'balanco_hidrico') >= 2
    THEN '✓ RLS OK'
    ELSE '⚠️ RLS Pode Precisar Config'
  END AS rls;
