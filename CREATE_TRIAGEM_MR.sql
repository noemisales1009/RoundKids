-- ============================================================
-- TABELA: triagem_mr_pacientes
-- Triagem de risco para microrganismos multirresistentes (MR)
-- na admissão (protocolo SCIRAS/CCIRAS). Um registro por triagem.
-- Usada pelo card "Triagem MR" (components/TriagemMRCard.tsx).
-- ============================================================

CREATE TABLE IF NOT EXISTS triagem_mr_pacientes (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id       UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  data_triagem      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Quais dos 9 critérios foram marcados. Chaves usadas pelo app:
  --  transferido_hospital_72h, atb_amplo_espectro, internacao_48h_procedimento,
  --  home_care_ilpi, hemodialise, uti_90dias, internacao_previa_90dias,
  --  onco_hemato_transplante, historico_mr_contactante_neuro
  criterios         TEXT[]      NOT NULL DEFAULT '{}',

  -- Recomendação gerada a partir dos critérios
  precaucao_contato BOOLEAN     NOT NULL DEFAULT false,
  swab_nasal        BOOLEAN     NOT NULL DEFAULT false,
  swab_retal        BOOLEAN     NOT NULL DEFAULT false,

  -- Acompanhamento após a coleta do swab
  resultado_swab    TEXT        NOT NULL DEFAULT 'pendente',  -- pendente | negativo | positivo
  germe_isolado     TEXT,       -- MRSA, VRE, KPC/CRE, Acinetobacter MDR, Pseudomonas MDR, ESBL+
  conduta           TEXT,       -- manter | suspender
  observacao        TEXT,

  -- Auditoria
  created_by        UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_triagem_mr_paciente
  ON triagem_mr_pacientes (paciente_id, data_triagem DESC);

-- RLS: o Supabase mantém RLS habilitado nesta tabela; por isso liberamos o
-- acesso do app com uma policy permissiva para os papéis anon/authenticated.
GRANT ALL ON triagem_mr_pacientes TO anon, authenticated;

ALTER TABLE triagem_mr_pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso ao app (triagem_mr)" ON triagem_mr_pacientes;
CREATE POLICY "Permitir acesso ao app (triagem_mr)"
  ON triagem_mr_pacientes
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
