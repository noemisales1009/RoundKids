-- ============================================================================
-- ALTER_CALC_RESP_ADD_CONTEXTO.sql
-- Calculadora Respiratória: alarmes e constante de tempo.
-- Fontes: "Alarmes respiratórios para o Round", "Alarmes de relação IE Ti e PEEP:
-- categorias de insuficiência respiratória pediátrica" e "Constante de tempo e
-- cálculo do Ti: referência pediátrica para o Round".
--
--   - categoria_ir: categoria da insuficiência respiratória, que muda a leitura
--     dos alarmes de I:E, Ti e PEEP (OVAI, OVAS, tecido, bomba ou misto).
--   - ti_estimado_seg: Ti estimado = 3 x constante de tempo do paciente.
--   - fluxo_exp_retorna_zero: observação de beira-leito usada nos alarmes de
--     aprisionamento aéreo. NULL = não observado.
--
-- Requer CREATE_CALC_RESPIRATORIA.sql já aplicado.
-- SEGURO: só adiciona colunas opcionais. Registros antigos ficam com NULL.
-- A coluna alertas (jsonb) passa a guardar os alarmes com valor e referência;
-- registros antigos guardaram apenas os textos e continuam legíveis.
-- ============================================================================

ALTER TABLE public.calc_resp_avaliacoes
  ADD COLUMN IF NOT EXISTS categoria_ir            TEXT,
  ADD COLUMN IF NOT EXISTS ti_estimado_seg         NUMERIC,
  ADD COLUMN IF NOT EXISTS fluxo_exp_retorna_zero  BOOLEAN;

ALTER TABLE public.calc_resp_avaliacoes
  DROP CONSTRAINT IF EXISTS calc_resp_categoria_ir_check;

ALTER TABLE public.calc_resp_avaliacoes
  ADD CONSTRAINT calc_resp_categoria_ir_check
  CHECK (categoria_ir IS NULL OR categoria_ir IN ('ovai', 'ovas', 'tecido', 'bomba', 'misto'));

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- 1) Colunas criadas:
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'calc_resp_avaliacoes'
--   AND column_name IN ('categoria_ir', 'ti_estimado_seg', 'fluxo_exp_retorna_zero');
--
-- 2) No app: Calc. Respiratória > aba Alarmes. Escolher a categoria (ex.: OVAI),
--    informar PIP, Pplat, PEEP, VTe, FR, Ti e fluxo inspiratório > a aba Mecânica
--    mostra a constante de tempo, o Ti estimado (3 τ) e o Te mínimo > validar e gravar.
--
-- 3) SELECT criado_em, categoria_ir, tau_seg, ti_estimado_seg, fluxo_exp_retorna_zero,
--           jsonb_array_length(alertas) AS qtd_alarmes
--    FROM calc_resp_avaliacoes ORDER BY criado_em DESC LIMIT 5;

-- ============================================================================
-- ROLLBACK
-- ============================================================================
-- ALTER TABLE public.calc_resp_avaliacoes DROP CONSTRAINT IF EXISTS calc_resp_categoria_ir_check;
-- ALTER TABLE public.calc_resp_avaliacoes
--   DROP COLUMN IF EXISTS categoria_ir,
--   DROP COLUMN IF EXISTS ti_estimado_seg,
--   DROP COLUMN IF EXISTS fluxo_exp_retorna_zero;
