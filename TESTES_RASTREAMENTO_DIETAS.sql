-- ===============================================================================
-- SCRIPT DE TESTES: Rastreamento de Criador de Dietas
-- ===============================================================================
-- Execute este script DEPOIS de executar CREATE_DIETAS_PACIENTES_WITH_CREATORS.sql
-- ===============================================================================

-- 1. VERIFICAR se a tabela foi criada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'dietas_pacientes'
ORDER BY ordinal_position;

-- 2. VERIFICAR os índices criados
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'dietas_pacientes'
ORDER BY indexname;

-- 3. VERIFICAR as constraints (foreign keys)
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'dietas_pacientes'
  AND table_schema = 'public';

-- 4. LISTAR dietas com informações de criador (após adicionar dados)
-- Este será o JOIN mais comum usado na aplicação
SELECT 
    d.id,
    d.tipo,
    d.data_inicio,
    d.volume,
    d.vet,
    d.vet_pleno,
    d.vet_at,
    d.pt,
    d.pt_g_dia,
    d.pt_at,
    d.is_archived,
    d.created_at,
    d.updated_at,
    u_criador.name AS criado_por_nome,
    u_criador.email AS criado_por_email,
    d.criado_por_id,
    u_arquivador.name AS arquivado_por_nome,
    u_arquivador.email AS arquivado_por_email,
    d.arquivado_por_id,
    d.motivo_arquivamento
FROM dietas_pacientes d
LEFT JOIN users u_criador ON d.criado_por_id = u_criador.id
LEFT JOIN users u_arquivador ON d.arquivado_por_id = u_arquivador.id
ORDER BY d.created_at DESC;

-- 5. LISTAR APENAS dietas não arquivadas
SELECT 
    d.id,
    d.tipo,
    d.data_inicio,
    u_criador.name AS criado_por_nome,
    d.created_at
FROM dietas_pacientes d
LEFT JOIN users u_criador ON d.criado_por_id = u_criador.id
WHERE d.is_archived = false
ORDER BY d.created_at DESC;

-- 6. LISTAR APENAS dietas arquivadas (com rastreamento)
SELECT 
    d.id,
    d.tipo,
    d.data_inicio,
    u_criador.name AS criado_por_nome,
    u_arquivador.name AS arquivado_por_nome,
    d.motivo_arquivamento,
    d.updated_at AS data_arquivamento
FROM dietas_pacientes d
LEFT JOIN users u_criador ON d.criado_por_id = u_criador.id
LEFT JOIN users u_arquivador ON d.arquivado_por_id = u_arquivador.id
WHERE d.is_archived = true
ORDER BY d.updated_at DESC;

-- 7. CONTAR dietas por criador
SELECT 
    u.name,
    COUNT(d.id) AS total_dietas_criadas
FROM dietas_pacientes d
LEFT JOIN users u ON d.criado_por_id = u.id
WHERE d.is_archived = false
GROUP BY u.id, u.name
ORDER BY COUNT(d.id) DESC;

-- 8. AUDITORIA: Listar todas as mudanças de status
SELECT 
    d.id,
    d.tipo,
    CASE WHEN d.is_archived = false THEN 'ATIVA' ELSE 'ARQUIVADA' END AS status_atual,
    u_criador.name AS criado_por,
    d.created_at AS data_criacao,
    u_arquivador.name AS arquivado_por,
    d.updated_at AS data_arquivamento,
    d.motivo_arquivamento
FROM dietas_pacientes d
LEFT JOIN users u_criador ON d.criado_por_id = u_criador.id
LEFT JOIN users u_arquivador ON d.arquivado_por_id = u_arquivador.id
ORDER BY d.created_at DESC;

-- 9. ESTATÍSTICAS
SELECT 
    COUNT(*) AS total_dietas,
    SUM(CASE WHEN is_archived = false THEN 1 ELSE 0 END) AS dietas_ativas,
    SUM(CASE WHEN is_archived = true THEN 1 ELSE 0 END) AS dietas_arquivadas,
    COUNT(DISTINCT criado_por_id) AS usuarios_criadores,
    COUNT(DISTINCT arquivado_por_id) AS usuarios_arquivadores
FROM dietas_pacientes;

-- 10. INTEGRIDADE REFERENCIAL
-- Verificar se há orfãos (dietas com criado_por_id ou arquivado_por_id inválidos)
SELECT d.id, d.tipo, d.criado_por_id, d.arquivado_por_id
FROM dietas_pacientes d
WHERE (d.criado_por_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = d.criado_por_id
))
OR (d.arquivado_por_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = d.arquivado_por_id
));

-- Se a query acima retornar resultados, há problemas de integridade referencial!
-- Nesse caso, execute:
-- UPDATE dietas_pacientes SET criado_por_id = NULL WHERE criado_por_id NOT IN (SELECT id FROM users);
-- UPDATE dietas_pacientes SET arquivado_por_id = NULL WHERE arquivado_por_id NOT IN (SELECT id FROM users);
