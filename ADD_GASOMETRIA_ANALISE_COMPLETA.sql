-- ============================================================================
-- ADD_GASOMETRIA_ANALISE_COMPLETA.sql
-- Colunas da análise sistemática completa da gasometria arterial
-- (compensação, ânion gap, delta gap e conclusão)
--
-- Referência clínica: "Análise sistemática da gasometria arterial"
-- Hospital Infantil Dr. Juvêncio Mattos — seções 3 a 7.
--
-- SEGURO: só adiciona colunas nullable. Nenhum dado existente é alterado.
--
-- STATUS: APLICADO EM PRODUÇÃO em 2026-08-07 (confirmado por information_schema).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Valores complementares da gasometria (seção 1 do protocolo)
-- `be` e `hco3_standard` já existiam na tabela — os ADDs abaixo são no-op.
-- ----------------------------------------------------------------------------
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS be           NUMERIC;  -- excesso de base (-2 a +2)
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS lactato      NUMERIC;  -- mmol/L (0,5-2,0)
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS sodio        NUMERIC;  -- Na+ (135-145)
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS cloro        NUMERIC;  -- Cl- (98-106)
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS albumina     NUMERIC;  -- g/dL (3,5-5,0)

-- ----------------------------------------------------------------------------
-- ETAPA 2 — Distúrbio primário consolidado (seção 2)
-- Valores gravados pelo app: acidose_metabolica | alcalose_metabolica |
-- acidose_respiratoria | alcalose_respiratoria | acidose_mista |
-- alcalose_mista | misto_oposto | normal | indefinido
-- ----------------------------------------------------------------------------
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS disturbio_primario TEXT;

-- ----------------------------------------------------------------------------
-- ETAPA 3 — Regra da compensação (seção 3)
-- compensacao_variavel: 'HCO₃⁻' (distúrbio respiratório) ou 'PaCO₂' (metabólico)
-- compensacao_status:   dentro | abaixo | acima
-- ----------------------------------------------------------------------------
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS compensacao_variavel     TEXT;
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS compensacao_esperado_min NUMERIC;
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS compensacao_esperado_max NUMERIC;
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS compensacao_status       TEXT;

-- ----------------------------------------------------------------------------
-- ETAPA 4 e 5 — Ânion gap, delta gap e HCO3 corrigido (seções 4 e 5)
-- ----------------------------------------------------------------------------
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS anion_gap           NUMERIC;
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS anion_gap_corrigido NUMERIC;  -- corrigido pela albumina
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS delta_ag            NUMERIC;
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS hco3_corrigido      NUMERIC;
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS razao_delta         NUMERIC;  -- Delta AG / Delta HCO3

-- ----------------------------------------------------------------------------
-- ETAPA 6 — Conclusão em texto (seção 6, pronta para colar na evolução)
-- ----------------------------------------------------------------------------
ALTER TABLE gasometrias ADD COLUMN IF NOT EXISTS conclusao TEXT;

-- ============================================================================
-- LIMPEZA — coluna duplicada hco3_std  [CONCLUÍDO em 2026-08-07]
-- ============================================================================
-- A primeira versão deste script criou `hco3_std` sem saber que a tabela já
-- tinha `hco3_standard` para o mesmo dado. O app grava em `hco3_standard`.
--
-- Executado (count = 0 confirmado antes do drop, nenhum dado perdido):
--   SELECT count(*) FROM gasometrias WHERE hco3_std IS NOT NULL;  -- retornou 0
--   ALTER TABLE gasometrias DROP COLUMN IF EXISTS hco3_std;
--
-- O ADD de hco3_std foi removido do bloco da ETAPA 1 acima, então rodar este
-- arquivo de novo não recria a coluna.

-- ============================================================================
-- CHECKLIST DE TESTE (rodar depois de aplicar)
-- ============================================================================
-- 1) Conferir se todas as colunas apareceram:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'gasometrias'
-- ORDER BY ordinal_position;
--
-- 2) No app: abrir um paciente > aba Gasometria > preencher pH/PaCO2/HCO3 +
--    Na/Cl/albumina > percorrer as 6 etapas > "Gravar no prontuário".
--    Nenhuma tarja vermelha de erro deve aparecer.
--
-- 3) Conferir o último registro (a coluna de data é `criado_em`, não created_at):
--
-- SELECT criado_em, ph, paco2, hco3, disturbio_primario, compensacao_status,
--        anion_gap, anion_gap_corrigido, delta_ag, hco3_corrigido, razao_delta
-- FROM gasometrias
-- ORDER BY criado_em DESC
-- LIMIT 5;

-- ============================================================================
-- ROLLBACK (desfaz tudo, sem tocar nas colunas antigas)
-- ============================================================================
-- ATENÇÃO: NÃO incluir `be` nem `hco3_standard` aqui — já existiam antes
-- desta migração e podem ter dados antigos.
--
-- ALTER TABLE gasometrias
--   DROP COLUMN IF EXISTS lactato,
--   DROP COLUMN IF EXISTS sodio,
--   DROP COLUMN IF EXISTS cloro,
--   DROP COLUMN IF EXISTS albumina,
--   DROP COLUMN IF EXISTS disturbio_primario,
--   DROP COLUMN IF EXISTS compensacao_variavel,
--   DROP COLUMN IF EXISTS compensacao_esperado_min,
--   DROP COLUMN IF EXISTS compensacao_esperado_max,
--   DROP COLUMN IF EXISTS compensacao_status,
--   DROP COLUMN IF EXISTS anion_gap,
--   DROP COLUMN IF EXISTS anion_gap_corrigido,
--   DROP COLUMN IF EXISTS delta_ag,
--   DROP COLUMN IF EXISTS hco3_corrigido,
--   DROP COLUMN IF EXISTS razao_delta,
--   DROP COLUMN IF EXISTS conclusao;
