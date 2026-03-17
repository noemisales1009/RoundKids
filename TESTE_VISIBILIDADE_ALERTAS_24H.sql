-- ===================================================
-- SCRIPT DE TESTES: Visibilidade de Alertas 24H
-- ===================================================

-- 1️⃣ TESTAR FUNÇÕES BÁSICAS
-- ==========================================

-- Teste 1: Alerta ativo (deve retornar TRUE - sempre visível)
SELECT
  'Alerta Ativo' AS teste,
  TRUE AS resultado_esperado,
  is_alerta_visible('pendente', NULL) AS resultado_atual;

-- Teste 2: Alerta concluído há 12 horas (deve retornar TRUE - ainda visível)
SELECT
  'Alerta Concluído há 12h' AS teste,
  TRUE AS resultado_esperado,
  is_alerta_visible('concluido', NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '12 hours') AS resultado_atual;

-- Teste 3: Alerta concluído há 25 horas (deve retornar FALSE - expirou)
SELECT
  'Alerta Concluído há 25h' AS teste,
  FALSE AS resultado_esperado,
  is_alerta_visible('concluido', NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '25 hours') AS resultado_atual;

-- Teste 4: Alerta resolvido há 30 minutos (deve retornar TRUE - ainda visível)
SELECT
  'Alerta Resolvido há 30min' AS teste,
  TRUE AS resultado_esperado,
  is_alerta_visible('resolvido', NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '30 minutes') AS resultado_atual;


-- 2️⃣ TESTAR TEMPO RESTANTE
-- ==========================================

-- Tempo restante: Alerta há 6 horas (deve restar ~18 horas)
SELECT
  'Tempo Restante (6h decorridas)' AS teste,
  tempo_restante_visibilidade('concluido', NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '6 hours') AS tempo_restante;

-- Tempo restante: Alerta há 23 horas (deve restar ~1 hora)
SELECT
  'Tempo Restante (23h decorridas)' AS teste,
  tempo_restante_visibilidade('concluido', NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '23 hours') AS tempo_restante;

-- Tempo restante: Alerta ativo (deve retornar NULL)
SELECT
  'Tempo Restante (Alerta Ativo)' AS teste,
  tempo_restante_visibilidade('pendente', NULL) AS tempo_restante;

-- Tempo restante: Alerta expirado (deve retornar 'Expirado')
SELECT
  'Tempo Restante (Expirado)' AS teste,
  tempo_restante_visibilidade('concluido', NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '26 hours') AS tempo_restante;


-- 3️⃣ TESTAR VIEW DE VISIBILIDADE
-- ==========================================

-- Ver quantidade de alertas visíveis vs total
SELECT
  COUNT(*) AS total_alertas,
  SUM(CASE WHEN is_alerta_visible(status, status_conclusao) THEN 1 ELSE 0 END) AS alertas_visiveis,
  SUM(CASE WHEN status IN ('concluido', 'Concluído', 'resolvido', 'Resolvido') THEN 1 ELSE 0 END) AS alertas_concluidos
FROM alertas_paciente_visibilidade_24h;

-- Listar alertas concluídos com tempo restante
SELECT
  id_alerta,
  patient_name,
  bed_number,
  status,
  TO_CHAR(status_conclusao AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS conclusao,
  tempo_visibilidade,
  CASE
    WHEN tempo_visibilidade = 'Expirado' THEN 'REMOVE'
    ELSE 'SHOW'
  END AS acao
FROM alertas_paciente_visibilidade_24h
WHERE status IN ('concluido', 'Concluído', 'resolvido', 'Resolvido')
ORDER BY status_conclusao DESC;


-- 4️⃣ STATISTICAS
-- ==========================================

SELECT
  status,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE is_alerta_visible(status, status_conclusao)) AS visiveis,
  COUNT(*) FILTER (WHERE NOT is_alerta_visible(status, status_conclusao)) AS expirados,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE is_alerta_visible(status, status_conclusao)) / COUNT(*),
    2
  ) || '%' AS percentual_visivel
FROM alertas_paciente
WHERE status IN ('concluido', 'Concluído', 'resolvido', 'Resolvido')
GROUP BY status
ORDER BY total DESC;


-- 5️⃣ SIMULAÇÃO: Criar alertas de teste com diferentes tempos
-- ==========================================
-- Descomente para criar alertas de teste:

/*
-- Alerta que expira em 1 hora
INSERT INTO alertas_paciente 
  (patient_id, alerta_descricao, status, status_conclusao, responsavel, created_by)
VALUES 
  (SELECT id FROM patients LIMIT 1), 
  'TESTE: Expirando em 1 hora',
  'concluido',
  NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '23 hours',
  'Sistema',
  '00000000-0000-0000-0000-000000000001'
);

-- Alerta que expira em 12 horas
INSERT INTO alertas_paciente 
  (patient_id, alerta_descricao, status, status_conclusao, responsavel, created_by)
VALUES 
  ((SELECT id FROM patients LIMIT 1), 
  'TESTE: Expirando em 12 horas',
  'concluido',
  NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '12 hours',
  'Sistema',
  '00000000-0000-0000-0000-000000000001'
);

-- Alerta já expirado
INSERT INTO alertas_paciente 
  (patient_id, alerta_descricao, status, status_conclusao, responsavel, created_by)
VALUES 
  ((SELECT id FROM patients LIMIT 1), 
  'TESTE: Já expirou',
  'concluido',
  NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '26 hours',
  'Sistema',
  '00000000-0000-0000-0000-000000000001'
);
*/

-- ===================================================
-- VERIFICAR SE TUDO ESTÁ FUNCIONANDO
-- ===================================================
SELECT 'Testes Concluídos - Verificar resultados acima' AS status;
