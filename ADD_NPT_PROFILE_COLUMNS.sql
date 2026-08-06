-- =====================================================================
-- NPT: registrar perfil clínico, peso ideal/ajustado e % de lipídios
-- Data: 2026-08-06
-- OPCIONAL: nada quebra sem isso. Serve apenas para o histórico passar a
-- registrar quais parâmetros do novo modelo foram usados em cada cálculo.
--
-- Etapa única, pequena e reversível: colunas novas, NULL, sem default,
-- sem constraint. Inserts atuais continuam funcionando antes e depois.
-- =====================================================================

ALTER TABLE public.npt_calculations
  ADD COLUMN IF NOT EXISTS clinical_profile text,
  ADD COLUMN IF NOT EXISTS ideal_weight numeric,
  ADD COLUMN IF NOT EXISTS lipid_percent numeric;

-- CHECKLIST DE TESTE (após aplicar):
-- [ ] Abrir a calculadora NPT e salvar um cálculo — deve salvar normalmente
-- [ ] Abrir o histórico de cálculos do paciente — registros antigos aparecem sem erro
-- [ ] Conferir as colunas novas (devem existir e vir NULL por enquanto):
--     SELECT clinical_profile, ideal_weight, lipid_percent
--     FROM public.npt_calculations ORDER BY created_at DESC LIMIT 5;
-- [ ] Depois me avise para eu atualizar o código a gravar os 3 campos

-- ROLLBACK (se necessário):
-- ALTER TABLE public.npt_calculations
--   DROP COLUMN IF EXISTS clinical_profile,
--   DROP COLUMN IF EXISTS ideal_weight,
--   DROP COLUMN IF EXISTS lipid_percent;
