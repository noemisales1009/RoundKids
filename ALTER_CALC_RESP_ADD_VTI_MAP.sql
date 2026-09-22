-- ============================================================================
-- ALTER_CALC_RESP_ADD_VTI_MAP.sql
-- Calculadora Respiratória: revisão clínica da especificação (anotações da Dra. Lélia).
--   - Vazamento passa a ser calculado: VTi − VTe (mL) e (VTi − VTe) ÷ VTi (%).
--   - MAP pode ser estimada quando não há medida: PEEP + (PIP − PEEP) × Ti ÷ Ttotal,
--     com Ttotal = 60 ÷ FR. A coluna map guarda o valor usado; map_estimada diz se foi estimado.
--
-- Requer CREATE_CALC_RESPIRATORIA.sql já aplicado.
-- SEGURO: só adiciona colunas opcionais. Registros antigos ficam com NULL.
-- ============================================================================

ALTER TABLE public.calc_resp_avaliacoes
  ADD COLUMN IF NOT EXISTS vti_ml        NUMERIC,   -- mL (volume corrente inspirado)
  ADD COLUMN IF NOT EXISTS vazamento_ml  NUMERIC,   -- mL (VTi - VTe)
  ADD COLUMN IF NOT EXISTS map_estimada  BOOLEAN;   -- true = MAP estimada pela formula

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- 1) Colunas criadas:
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'calc_resp_avaliacoes'
--   AND column_name IN ('vti_ml', 'vazamento_ml', 'map_estimada');
--
-- 2) No app: Calc. Respiratória > informar VTi e VTe > o vazamento aparece em mL e %;
--    deixar MAP em branco com PEEP, PIP, Ti e FR preenchidos > "MAP estimada" aparece
--    e os índices IO/IS avisam que usaram a estimativa > validar e gravar.
--
-- 3) SELECT criado_em, vti_ml, vte_ml, vazamento_ml, vazamento_pct, map, map_estimada
--    FROM calc_resp_avaliacoes ORDER BY criado_em DESC LIMIT 5;

-- ============================================================================
-- ROLLBACK
-- ============================================================================
-- ALTER TABLE public.calc_resp_avaliacoes
--   DROP COLUMN IF EXISTS vti_ml, DROP COLUMN IF EXISTS vazamento_ml, DROP COLUMN IF EXISTS map_estimada;
