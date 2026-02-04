-- DEBUG: Verificar por que os nomes não aparecem no histórico

-- 1. Verificar se a view existe e tem os campos corretos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diagnosticos_historico_com_usuario';

-- 2. Verificar dados de alguns diagnósticos
SELECT 
  id,
  opcao_label,
  created_by,
  created_by_name,
  archived_by,
  archived_by_name,
  arquivado
FROM diagnosticos_historico_com_usuario
LIMIT 10;

-- 3. Verificar se existem usuários na tabela users
SELECT id, name, name_user FROM users LIMIT 5;

-- 4. Verificar se created_by e archived_by estão preenchidos
SELECT 
  COUNT(*) as total,
  COUNT(created_by) as com_created_by,
  COUNT(archived_by) as com_archived_by
FROM paciente_diagnosticos;

-- 5. SOLUÇÃO: Se created_by estiver NULL, precisamos preencher com ID padrão
-- Descomente as linhas abaixo SE created_by estiver NULL:

-- UPDATE paciente_diagnosticos 
-- SET created_by = (SELECT id FROM users LIMIT 1)
-- WHERE created_by IS NULL;
