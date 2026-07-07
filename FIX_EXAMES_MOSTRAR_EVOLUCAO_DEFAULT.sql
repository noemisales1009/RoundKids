-- ============================================================================
-- FIX: Exames sempre marcados como "Exibir na Evolução Diária"
-- ============================================================================
-- Problema: a coluna mostrar_evolucao em exames_pacientes foi criada com
-- DEFAULT true. O app trata true como "incluído manualmente" (fica na
-- evolução para sempre), então todo exame já nascia marcado e a regra
-- automática das 48h nunca chegava a valer.
--
-- Regra correta:
--   NULL  -> automático: aparece na Evolução Diária só se data_exame
--            estiver dentro das últimas 48h
--   true  -> incluído manualmente pelo usuário (caso extra)
--   false -> excluído manualmente pelo usuário
-- ============================================================================

-- 1. Permite NULL na coluna (hoje ela é NOT NULL DEFAULT true)
ALTER TABLE exames_pacientes ALTER COLUMN mostrar_evolucao DROP NOT NULL;

-- 2. Remove o DEFAULT true (novos exames nascem NULL = regra automática das 48h)
ALTER TABLE exames_pacientes ALTER COLUMN mostrar_evolucao DROP DEFAULT;

-- 3. Reseta os exames que ficaram true por causa do default (2.431 registros
--    em 07/07/2026). Os das últimas 48h continuam aparecendo pela regra
--    automática; os antigos saem da evolução. Se quiser manter algum exame
--    antigo, basta marcar o checkbox dele de novo no app.
--    Os que foram desmarcados manualmente (false) permanecem desmarcados.
UPDATE exames_pacientes
SET mostrar_evolucao = NULL
WHERE mostrar_evolucao = true;

-- 4. Conferência: "marcados_manualmente" deve mostrar 0
SELECT
    COUNT(*) FILTER (WHERE mostrar_evolucao IS TRUE)  AS marcados_manualmente,
    COUNT(*) FILTER (WHERE mostrar_evolucao IS FALSE) AS desmarcados,
    COUNT(*) FILTER (WHERE mostrar_evolucao IS NULL)  AS automaticos_48h
FROM exames_pacientes;
