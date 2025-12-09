-- Script para atualizar diagnosticos_historico com os labels das opções
-- Execute este script no Supabase SQL Editor

UPDATE diagnosticos_historico dh
SET opcao_label = po.label
FROM pergunta_opcoes_diagnostico po
WHERE dh.opcao_id = po.id
AND dh.opcao_label IS NULL;

-- Verificar quantos registros foram atualizados
SELECT COUNT(*) as "Registros atualizados" 
FROM diagnosticos_historico 
WHERE opcao_label IS NOT NULL;

-- Ver alguns registros atualizados (primeiros 10)
SELECT 
  id,
  patient_id,
  opcao_id,
  opcao_label,
  texto_digitado,
  status,
  created_at
FROM diagnosticos_historico
ORDER BY created_at DESC
LIMIT 10;
