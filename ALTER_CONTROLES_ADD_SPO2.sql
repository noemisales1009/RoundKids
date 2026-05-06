-- Adiciona colunas de SpO2 na tabela patient_controles_saidas
ALTER TABLE patient_controles_saidas
  ADD COLUMN IF NOT EXISTS spo2_min text,
  ADD COLUMN IF NOT EXISTS spo2_max text;
