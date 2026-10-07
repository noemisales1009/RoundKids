-- =====================================================================
-- ADD_NPT_ULTIMO_CALCULO.sql
-- NPT: guardar a fase metabólica e o alvo da meta energética do cálculo.
--
-- A calculadora da NPT agora abre com os valores do último cálculo salvo
-- do paciente e deixa voltar aos anteriores. Quase tudo já era gravado;
-- faltavam estes dois campos:
--   metabolic_phase  fase escolhida (aguda / estavel / recuperacao)
--   meta_alvo        alvo da meta energética digitado (kcal/kg/d);
--                    NULL = automático (meio da faixa da fase)
--
-- OPCIONAL: nada quebra sem isso. Sem as colunas, o cálculo é salvo como
-- antes e, ao reabrir, a fase volta para a sugerida pelo perfil clínico e
-- a meta volta ao automático.
--
-- Etapa única, pequena e reversível: colunas novas, NULL, sem default e
-- sem constraint. Substitui o ADD_NPT_METABOLIC_PHASE.sql (mesma coluna
-- metabolic_phase; pode rodar mesmo se aquele já tiver sido aplicado).
-- =====================================================================

ALTER TABLE public.npt_calculations
  ADD COLUMN IF NOT EXISTS metabolic_phase text,
  ADD COLUMN IF NOT EXISTS meta_alvo numeric;

-- CHECKLIST DE TESTE (após aplicar):
-- [ ] As duas colunas existem e vêm NULL nos registros antigos:
--       SELECT created_at, metabolic_phase, meta_alvo FROM public.npt_calculations
--       ORDER BY created_at DESC LIMIT 5;
-- [ ] Abrir a NPT de um paciente, escolher "Fase aguda", ajustar o alvo da
--     meta e salvar. A consulta acima mostra a fase e o alvo na 1ª linha.
-- [ ] Sair e abrir a NPT do mesmo paciente: a fase e o alvo voltam iguais.
-- [ ] O histórico de cálculos do paciente continua abrindo sem erro.

-- ROLLBACK (o app volta a salvar sem os dois campos):
-- ALTER TABLE public.npt_calculations
--   DROP COLUMN IF EXISTS meta_alvo;
-- (metabolic_phase só deve ser removida se não estiver em uso)
