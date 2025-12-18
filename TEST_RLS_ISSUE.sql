-- ========================================
-- Teste para verificar o problema de RLS
-- ========================================

-- 1. Verificar se há RLS na view
SELECT * FROM information_schema.table_privileges 
WHERE table_name IN ('alertas_paciente_view_completa', 'tasks_view_horario_br');

-- 2. Verificar policies na view
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('alertas_paciente_view_completa', 'tasks_view_horario_br');

-- 3. Testar a query exata que o frontend faz
SELECT id_alerta, alertaclinico, created_by_name, responsavel 
FROM public.alertas_paciente_view_completa 
LIMIT 3;

-- 4. Se o resultado acima mostrar NULL para created_by_name, 
-- testar se a view está retornando corretamente:
SELECT 
  id AS id_alerta,
  alerta_descricao AS alertaclinico,
  created_by_name,
  responsavel
FROM (
  SELECT
    a.id,
    a.alerta_descricao,
    a.responsavel,
    COALESCE(u.name, 'Não informado'::text) AS created_by_name
  FROM alertas_paciente a
  LEFT JOIN users u ON a.created_by = u.id
  LIMIT 3
) subquery;

-- 5. Se tudo OK acima, o problema é na VIEW - vamos verificar se a view foi recriada corretamente
SELECT 
  definition 
FROM pg_views 
WHERE viewname = 'alertas_paciente_view_completa';
