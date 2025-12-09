-- Script para atualizar histórico de diagnósticos com labels das opções
-- Execute isso no SQL Editor do Supabase

-- Atualizar diagnosticos_historico com os labels das opcoes
UPDATE diagnosticos_historico dh
SET opcao_label = po.label
FROM pergunta_opcoes_diagnostico po
WHERE dh.opcao_id = po.id;

-- Verificar quantos registros foram atualizados
SELECT COUNT(*) as registros_atualizados
FROM diagnosticos_historico
WHERE opcao_label IS NOT NULL;
