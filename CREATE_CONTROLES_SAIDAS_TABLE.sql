-- Tabela para Controles e Saídas do paciente (um registro por paciente por dia)
CREATE TABLE IF NOT EXISTS patient_controles_saidas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT CURRENT_DATE,

  -- Controles (Deltas de Sinais Vitais)
  pam_min  text, pam_max  text,
  fc_min   text, fc_max   text,
  fr_min   text, fr_max   text,
  tax_min  text, tax_max  text,
  dxt_min  text, dxt_max  text,

  -- Saídas
  evacuacoes          text,
  dreno_torax         text,
  dve                 text,
  sng                 text,
  ileostomia          text,
  penrose             text,
  outros_drenos       text,
  outros_drenos_label text,

  -- TSR
  hemodialise        text,
  dialise_peritoneal text,

  updated_at timestamptz DEFAULT now(),

  CONSTRAINT patient_controles_saidas_unique UNIQUE (patient_id, data)
);

CREATE INDEX IF NOT EXISTS idx_patient_controles_saidas_patient
  ON patient_controles_saidas(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_controles_saidas_data
  ON patient_controles_saidas(data DESC);

ALTER TABLE patient_controles_saidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users"
  ON patient_controles_saidas
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
