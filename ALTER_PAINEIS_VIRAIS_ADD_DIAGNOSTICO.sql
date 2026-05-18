-- Adiciona campos de vínculo de diagnóstico na tabela paineis_virais_pacientes
ALTER TABLE paineis_virais_pacientes
  ADD COLUMN IF NOT EXISTS diagnostico_id bigint REFERENCES paciente_diagnosticos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS diagnostico_label text,
  ADD COLUMN IF NOT EXISTS diagnostico_data_inicio date;
