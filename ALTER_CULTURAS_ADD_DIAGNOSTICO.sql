-- Vincula cultura a um diagnóstico ativo do paciente
ALTER TABLE culturas_pacientes
  ADD COLUMN IF NOT EXISTS diagnostico_id bigint REFERENCES paciente_diagnosticos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS diagnostico_label text,
  ADD COLUMN IF NOT EXISTS diagnostico_data_inicio date;
