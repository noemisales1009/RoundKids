-- ============================================================
-- TABELA: pa_medicoes_pacientes
-- Histórico de medições de PA classificadas por percentis
-- ============================================================

CREATE TABLE IF NOT EXISTS pa_medicoes_pacientes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  data_medicao    TIMESTAMPTZ NOT NULL DEFAULT now(),
  sistolica       INTEGER     NOT NULL,
  diastolica      INTEGER     NOT NULL,
  media_medida    NUMERIC     NOT NULL,
  -- Percentis de referência usados
  sist_p5         INTEGER     NOT NULL,
  sist_p50        INTEGER     NOT NULL,
  sist_p95        INTEGER     NOT NULL,
  diast_p5        INTEGER     NOT NULL,
  diast_p50       INTEGER     NOT NULL,
  diast_p95       INTEGER     NOT NULL,
  media_p5        NUMERIC     NOT NULL,
  media_p50       NUMERIC     NOT NULL,
  media_p95       NUMERIC     NOT NULL,
  -- Classificações
  class_sistolica TEXT        NOT NULL,
  class_diastolica TEXT       NOT NULL,
  class_media     TEXT        NOT NULL,
  alerta          BOOLEAN     NOT NULL DEFAULT false,
  -- Auditoria
  created_by      UUID        REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pa_medicoes_paciente
  ON pa_medicoes_pacientes (paciente_id, data_medicao DESC);

ALTER TABLE pa_medicoes_pacientes DISABLE ROW LEVEL SECURITY;
