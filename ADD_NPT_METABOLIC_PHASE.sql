-- =====================================================================
-- NPT: registrar a fase metabólica usada como referência da TIG
-- Data: 2026-08-07
-- OPCIONAL: nada quebra sem isso. A calculadora já valida a TIG na tela e
-- no PDF; esta coluna serve só para o histórico guardar em que fase
-- (aguda / estável / recuperação) a faixa de TIG foi conferida.
--
-- Etapa única, pequena e reversível: coluna nova, NULL, sem default,
-- sem constraint. Inserts atuais continuam funcionando antes e depois.
-- =====================================================================

ALTER TABLE public.npt_calculations
  ADD COLUMN IF NOT EXISTS metabolic_phase text;

-- CHECKLIST DE TESTE (após aplicar):
-- [ ] Abrir a calculadora NPT e salvar um cálculo — deve salvar normalmente
-- [ ] Abrir o histórico de cálculos do paciente — registros antigos aparecem sem erro
-- [ ] Conferir a coluna nova (deve existir e vir NULL por enquanto):
--     SELECT metabolic_phase, tig FROM public.npt_calculations
--     ORDER BY created_at DESC LIMIT 5;
-- [ ] Depois me avise para eu atualizar o código a gravar o campo

-- ROLLBACK (se necessário):
-- ALTER TABLE public.npt_calculations
--   DROP COLUMN IF EXISTS metabolic_phase;
