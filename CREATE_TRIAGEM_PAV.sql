-- ============================================================
-- TABELA: triagem_pav_pacientes
-- Triagem diária de PAV (Pneumonia Associada à Ventilação) no
-- round da UTI Neo/Pediátrica, segundo os critérios epidemiológicos
-- da Nota Técnica GVIMS/GGTES/DIRE3/ANVISA nº 03/2026.
-- Um registro por triagem. Usada pelo componente "Triagem PAV"
-- (components/TriagemPAVCard.tsx).
-- ============================================================

CREATE TABLE IF NOT EXISTS triagem_pav_pacientes (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id               UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  data_triagem              TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Faixa etária avaliada: 'rn' (RN ≤ 28 dias / RN internado),
  -- 'lactente' (> 28 dias e ≤ 1 ano) ou 'crianca' (> 1 ano).
  faixa_etaria              TEXT        NOT NULL DEFAULT 'crianca',

  -- Quais critérios (chaves usadas pelo app) foram marcados nesta triagem.
  criterios                 TEXT[]      NOT NULL DEFAULT '{}',

  -- Resultado: os critérios epidemiológicos de PAV foram atendidos?
  pav_criterios_atendidos   BOOLEAN     NOT NULL DEFAULT false,

  observacao                TEXT,

  -- Auditoria
  created_by                UUID,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at               TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_triagem_pav_paciente
  ON triagem_pav_pacientes (paciente_id, data_triagem DESC);

-- RLS: o Supabase mantém RLS habilitado nesta tabela; por isso liberamos o
-- acesso do app com uma policy permissiva para os papéis anon/authenticated.
GRANT ALL ON triagem_pav_pacientes TO anon, authenticated;

ALTER TABLE triagem_pav_pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso ao app (triagem_pav)" ON triagem_pav_pacientes;
CREATE POLICY "Permitir acesso ao app (triagem_pav)"
  ON triagem_pav_pacientes
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
