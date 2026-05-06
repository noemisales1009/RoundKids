-- Adiciona campos de auditoria e arquivamento em patient_controles_saidas
ALTER TABLE patient_controles_saidas
  ADD COLUMN IF NOT EXISTS created_at  timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_by  text,
  ADD COLUMN IF NOT EXISTS updated_by  text,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;
