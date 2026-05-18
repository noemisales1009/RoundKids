-- Vincula medicação a um diagnóstico ativo do paciente
-- diagnostico_id: FK para paciente_diagnosticos (nullable — vínculo é opcional)
-- diagnostico_label: snapshot do texto do diagnóstico na época do cadastro

ALTER TABLE medicacoes_pacientes
  ADD COLUMN IF NOT EXISTS diagnostico_id bigint REFERENCES paciente_diagnosticos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS diagnostico_label text,
  ADD COLUMN IF NOT EXISTS diagnostico_data_inicio date;
