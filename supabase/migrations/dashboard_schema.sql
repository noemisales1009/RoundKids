-- =============================================================================
-- Dashboard Schema — 6 Etapas Reversíveis
-- Executar no Supabase SQL Editor (public schema)
-- Cada etapa pode ser revertida independentemente
-- =============================================================================

-- ✅ ETAPA 1: Adicionar `status` em patients (2h)
-- Permite: KPI "5 críticos • 7 estáveis"
-- ─────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'status'
  ) THEN
    ALTER TABLE patients
    ADD COLUMN status TEXT DEFAULT 'estavel'
    CHECK (status IN ('estavel', 'critico', 'em_risco'));

    CREATE INDEX idx_patients_status ON patients(status)
      WHERE is_archived = false;

    RAISE NOTICE 'Etapa 1 ✅: Coluna status adicionada em patients';
  ELSE
    RAISE NOTICE 'Etapa 1 ⏭️: Coluna status já existe em patients';
  END IF;
END $$;

-- ROLLBACK Etapa 1 (se necessário):
-- DROP INDEX IF EXISTS idx_patients_status;
-- ALTER TABLE patients DROP COLUMN IF EXISTS status;

-- ─────────────────────────────────────────────────────────────────────────

-- ✅ ETAPA 2: Adicionar `resolved_at` em tasks + trigger (2h)
-- Permite: Métrica "Tempo de resposta a alertas" (em minutos)
-- ─────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'resolved_at'
  ) THEN
    ALTER TABLE tasks
    ADD COLUMN resolved_at TIMESTAMP NULL;

    CREATE INDEX idx_tasks_resolved_at ON tasks(resolved_at)
      WHERE resolved_at IS NOT NULL;

    -- Trigger: auto-set resolved_at quando task é concluída
    CREATE OR REPLACE FUNCTION mark_task_resolved()
    RETURNS TRIGGER AS $mark_task$
    BEGIN
      IF NEW.status = 'concluido' AND OLD.status != 'concluido' THEN
        NEW.resolved_at = NOW();
      END IF;
      RETURN NEW;
    END;
    $mark_task$ LANGUAGE plpgsql;

    CREATE TRIGGER tasks_resolve_timestamp
      BEFORE UPDATE ON tasks
      FOR EACH ROW
      EXECUTE FUNCTION mark_task_resolved();

    RAISE NOTICE 'Etapa 2 ✅: Coluna resolved_at + trigger adicionados em tasks';
  ELSE
    RAISE NOTICE 'Etapa 2 ⏭️: Coluna resolved_at já existe em tasks';
  END IF;
END $$;

-- ROLLBACK Etapa 2 (se necessário):
-- DROP TRIGGER IF EXISTS tasks_resolve_timestamp ON tasks;
-- DROP FUNCTION IF EXISTS mark_task_resolved();
-- DROP INDEX IF EXISTS idx_tasks_resolved_at;
-- ALTER TABLE tasks DROP COLUMN IF EXISTS resolved_at;

-- ─────────────────────────────────────────────────────────────────────────

-- ✅ ETAPA 3: Criar tabela `diagnoses` (3h)
-- Permite: Gráfico distribuição diagnósticos (42% PAV, 25% Sepse, etc)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS diagnoses (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  nome_diagnostico TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NULL,
  observacao TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_tenant ON diagnoses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_active ON diagnoses(patient_id)
  WHERE is_archived = false AND data_fim IS NULL;

-- RLS: Apenas authenticated users veem suas diagnoses
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view diagnoses for their patients" ON diagnoses;
DROP POLICY IF EXISTS "Users can insert diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Users can update own diagnoses" ON diagnoses;

CREATE POLICY "Users can view diagnoses for their patients" ON diagnoses
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Users can insert diagnoses" ON diagnoses
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update own diagnoses" ON diagnoses
  FOR UPDATE USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete own diagnoses" ON diagnoses
  FOR DELETE USING (tenant_id = auth.uid());

RAISE NOTICE 'Etapa 3 ✅: Tabela diagnoses criada com RLS';

-- ROLLBACK Etapa 3 (se necessário):
-- DROP TABLE IF EXISTS diagnoses CASCADE;

-- ─────────────────────────────────────────────────────────────────────────

-- ✅ ETAPA 4: Criar view `occupancy_daily` (2h)
-- Permite: Gráfico "Ocupação Semanal" (7 barras, últimos 7 dias)
-- Depende: Etapa 6 (coluna date_saida em patients deve existir)
-- ─────────────────────────────────────────────────────────────────────────

-- Verificar qual nome da coluna de saída (date_saida, discharged_at, etc)
-- Ajuste abaixo se o nome for diferente:

CREATE OR REPLACE VIEW occupancy_daily AS
WITH date_series AS (
  SELECT DATE(generate_series(NOW() - INTERVAL '7 days', NOW(), '1 day')) as date
),
occupied_per_date AS (
  SELECT
    ds.date,
    COUNT(DISTINCT p.id) as occupied_beds
  FROM date_series ds
  LEFT JOIN patients p ON
    p.admission_date::date <= ds.date
    AND (p.date_saida IS NULL OR p.date_saida::date > ds.date)
    AND p.is_archived = false
  GROUP BY ds.date
)
SELECT
  date,
  occupied_beds,
  12 as total_beds,
  ROUND(occupied_beds * 100.0 / 12, 0) as ocupacao_percentual
FROM occupied_per_date
ORDER BY date ASC;

RAISE NOTICE 'Etapa 4 ✅: View occupancy_daily criada';

-- ROLLBACK Etapa 4 (se necessário):
-- DROP VIEW IF EXISTS occupancy_daily;

-- ─────────────────────────────────────────────────────────────────────────

-- ✅ ETAPA 5: Adicionar `tipo_infeccao` em cultures (2h)
-- Permite: Métrica "Infecções relacionadas ao cuidado"
-- ─────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cultures' AND column_name = 'tipo_infeccao'
  ) THEN
    ALTER TABLE cultures
    ADD COLUMN tipo_infeccao TEXT DEFAULT 'nao_classificada'
    CHECK (tipo_infeccao IN ('comunitaria', 'nosocomial', 'nao_classificada'));

    CREATE INDEX IF NOT EXISTS idx_cultures_tipo ON cultures(tipo_infeccao)
      WHERE is_archived = false;

    RAISE NOTICE 'Etapa 5 ✅: Coluna tipo_infeccao adicionada em cultures';
  ELSE
    RAISE NOTICE 'Etapa 5 ⏭️: Coluna tipo_infeccao já existe em cultures';
  END IF;
END $$;

-- ROLLBACK Etapa 5 (se necessário):
-- DROP INDEX IF EXISTS idx_cultures_tipo;
-- ALTER TABLE cultures DROP COLUMN IF EXISTS tipo_infeccao;

-- ─────────────────────────────────────────────────────────────────────────

-- ✅ ETAPA 6: Verificar `date_saida` em patients (1h)
-- Necessário para: view occupancy_daily funcionar
-- ─────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'date_saida'
  ) THEN
    -- Se não existe, criar:
    ALTER TABLE patients
    ADD COLUMN date_saida TIMESTAMP NULL;

    CREATE INDEX IF NOT EXISTS idx_patients_date_saida ON patients(date_saida)
      WHERE date_saida IS NOT NULL;

    RAISE NOTICE 'Etapa 6 ✅: Coluna date_saida adicionada em patients';
  ELSE
    RAISE NOTICE 'Etapa 6 ⏭️: Coluna date_saida já existe em patients';
  END IF;
END $$;

-- ROLLBACK Etapa 6 (se necessário):
-- DROP INDEX IF EXISTS idx_patients_date_saida;
-- ALTER TABLE patients DROP COLUMN IF EXISTS date_saida;

-- ─────────────────────────────────────────────────────────────────────────

-- ✅ SUMÁRIO: Verificar tudo
SELECT
  'Checklist Final' as status,
  'patients.status' as coluna,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='status') as existe
UNION ALL
SELECT 'Checklist Final', 'tasks.resolved_at', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='resolved_at')
UNION ALL
SELECT 'Checklist Final', 'diagnoses (tabela)', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='diagnoses')
UNION ALL
SELECT 'Checklist Final', 'occupancy_daily (view)', EXISTS (SELECT 1 FROM information_schema.views WHERE table_name='occupancy_daily')
UNION ALL
SELECT 'Checklist Final', 'cultures.tipo_infeccao', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cultures' AND column_name='tipo_infeccao')
UNION ALL
SELECT 'Checklist Final', 'patients.date_saida', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='date_saida');

-- =============================================================================
-- Se todos acima retornam TRUE, schema está 100% pronto! ✅
-- =============================================================================
