-- ============================================================================
-- CREATE_PARDS_AVALIACOES.sql
-- Tabela de avaliações de PARDS pelo PALICC-2 (2023)
--
-- Referência clínica: "Critérios de PARDS — PALICC-2"
-- Emeriaud G, et al. Pediatric Critical Care Medicine. 2023;24(2):143-168.
--
-- SEGURO: cria tabela nova, não toca em nada existente.
-- RLS ligada desde o início, policy SÓ para authenticated (nunca anon).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabela
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pards_avaliacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por       UUID,

  -- Etapa 1 do guia: os 5 critérios gerais marcados (jsonb {temporalidade: true, ...})
  criterios_gerais JSONB,

  -- Etapa 2: vmi | vni_facial | cnaf_nasal | o2
  suporte          TEXT NOT NULL,

  -- Etapa 3: parâmetros de oxigenação
  fio2             NUMERIC,   -- fração decimal (0,21–1,0)
  pam_vias_aereas  NUMERIC,   -- pressão média das vias aéreas (VMI)
  peep             NUMERIC,   -- CPAP/PEEP (VNI facial)
  pao2             NUMERIC,
  spo2             NUMERIC,
  o2_para_spo2_88  BOOLEAN,   -- suporte 'o2': precisa de O₂ para manter SpO₂ ≥ 88%

  -- Resultado
  indice_tipo      TEXT,      -- IO | ISO | PF | SF
  indice_valor     NUMERIC,
  classificacao    TEXT NOT NULL,  -- pards_grave | pards_leve_moderada | possivel_pards | em_risco | sem_criterios
  conclusao        TEXT
);

CREATE INDEX IF NOT EXISTS idx_pards_avaliacoes_paciente
  ON pards_avaliacoes (paciente_id, criado_em DESC);

-- ----------------------------------------------------------------------------
-- ETAPA 2 — RLS (rodar logo depois da etapa 1)
-- ----------------------------------------------------------------------------
ALTER TABLE pards_avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_pards_avaliacoes" ON pards_avaliacoes;
CREATE POLICY "authenticated_all_pards_avaliacoes"
  ON pards_avaliacoes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Nada para anon: sem GRANT e sem policy.

-- ============================================================================
-- CHECKLIST DE TESTE (rodar depois de aplicar)
-- ============================================================================
-- 1) Tabela criada e RLS ligada (rowsecurity deve ser true):
--
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'pards_avaliacoes';
--
-- 2) Policies (deve aparecer só a de authenticated):
--
-- SELECT policyname, roles FROM pg_policies WHERE tablename = 'pards_avaliacoes';
--
-- 3) No app: paciente > botão PARDS > marcar os 5 critérios > escolher suporte >
--    preencher oxigenação > Classificar > "Gravar no prontuário". Sem tarja vermelha.
--
-- 4) Conferir o registro:
--
-- SELECT criado_em, suporte, indice_tipo, indice_valor, classificacao
-- FROM pards_avaliacoes ORDER BY criado_em DESC LIMIT 5;

-- ============================================================================
-- ROLLBACK (desfaz tudo)
-- ============================================================================
-- DROP TABLE IF EXISTS pards_avaliacoes;
