-- Medições de Dextro (glicemia capilar) em vários horários do dia.
-- Executado em produção em 20/07/2026 (Success. No rows returned).
--
-- A coluna guarda uma lista JSON de medições do dia:
--   [{"hora": "06:00", "valor": "91"}, {"hora": "12:00", "valor": "105"}, ...]
-- O app deriva dxt_min/dxt_max automaticamente dessas medições ao salvar,
-- então a Evolução Diária continua lendo o delta mín–máx sem alteração.
-- Dias antigos (sem medições) continuam usando dxt_min/dxt_max manuais.

ALTER TABLE patient_controles_saidas
  ADD COLUMN IF NOT EXISTS dxt_medicoes jsonb;

-- rollback: ALTER TABLE patient_controles_saidas DROP COLUMN dxt_medicoes;
